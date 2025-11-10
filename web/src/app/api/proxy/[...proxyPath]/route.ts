// Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
// SPDX-License-Identifier: MIT

import { Buffer } from "node:buffer";

import { NextRequest, NextResponse } from "next/server";

import { env } from "~/env";

const BACKEND_BASE_URL = env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const normalizedBackendBase = new URL(
  BACKEND_BASE_URL.endsWith("/")
    ? BACKEND_BASE_URL
    : `${BACKEND_BASE_URL}/`,
);
const backendOrigin = normalizedBackendBase.origin;
const backendPathPrefix = normalizedBackendBase.pathname.replace(/\/$/, "");
const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
  "proxy-authorization",
  "proxy-authenticate",
  "te",
]);

const buildBackendUrl = (
  segments: string[] = [],
  search: string,
  preserveTrailingSlash = false,
) => {
  const normalizedBase = BACKEND_BASE_URL.replace(/\/$/, "");
  let path = segments.join("/");
  if (preserveTrailingSlash && path) {
    path = `${path}/`;
  }
  const url = new URL(
    path ? `${normalizedBase}/${path}` : normalizedBase,
  );
  url.search = search;
  return url;
};

const REDIRECT_STATUS = new Set([301, 302, 303, 307, 308]);
const SAFE_METHODS_FOR_AUTO_REDIRECT = new Set(["GET", "HEAD"]);
const PRESERVE_METHOD_REDIRECT_STATUS = new Set([307, 308]);
const METHODS_WITHOUT_BODY = new Set(["GET", "HEAD"]);
const MAX_INTERNAL_REDIRECTS = 5;
const REDIRECT_BODY_BUFFER_LIMIT = 5 * 1024 * 1024; // 5MB safety limit for replayable bodies.

const rewriteLocationForProxy = (location: string): string | null => {
  try {
    const resolvedLocation = new URL(location, backendOrigin);

    if (resolvedLocation.origin !== backendOrigin) {
      return null;
    }

    let relativePath = resolvedLocation.pathname;
    if (backendPathPrefix && relativePath.startsWith(backendPathPrefix)) {
      relativePath = relativePath.slice(backendPathPrefix.length) || "/";
    }

    if (!relativePath.startsWith("/")) {
      relativePath = `/${relativePath}`;
    }

    return `/api/proxy${relativePath}${resolvedLocation.search}${resolvedLocation.hash}`;
  } catch {
    return null;
  }
};

const resolveBackendRedirectTarget = (location: string): string | null => {
  try {
    const resolvedLocation = new URL(location, backendOrigin);

    if (resolvedLocation.origin !== backendOrigin) {
      return null;
    }

    if (
      backendPathPrefix &&
      !resolvedLocation.pathname.startsWith(backendPathPrefix)
    ) {
      return null;
    }

    return resolvedLocation.toString();
  } catch {
    return null;
  }
};

const forwardRequest = async (
  request: NextRequest,
  context: { params: { proxyPath?: string[] } | Promise<{ proxyPath?: string[] }> },
) => {
  const params = await context.params;
  const originalPathname = new URL(request.url).pathname;
  const hasTrailingSlash =
    originalPathname.endsWith("/") && (params?.proxyPath?.length ?? 0) > 0;

  const targetUrl = buildBackendUrl(
    params?.proxyPath ?? [],
    request.nextUrl.search,
    hasTrailingSlash,
  );

  const headers = new Headers(request.headers);
  HOP_BY_HOP_HEADERS.forEach((header) => headers.delete(header));
  headers.set("x-forwarded-host", request.headers.get("host") ?? "");
  headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));
  headers.delete("content-length");

  const methodRequiresBody = !METHODS_WITHOUT_BODY.has(request.method);
  let bufferedBody: Buffer | undefined;
  if (methodRequiresBody) {
    const declaredLengthHeader = request.headers.get("content-length");
    const declaredLength = declaredLengthHeader ? Number(declaredLengthHeader) : undefined;
    const exceedsDeclaredLimit =
      typeof declaredLength === "number" &&
      !Number.isNaN(declaredLength) &&
      declaredLength > REDIRECT_BODY_BUFFER_LIMIT;

    if (!exceedsDeclaredLimit) {
      try {
        const clonedRequest = request.clone();
        const arrayBuffer = await clonedRequest.arrayBuffer();
        if (arrayBuffer.byteLength <= REDIRECT_BODY_BUFFER_LIMIT) {
          bufferedBody = Buffer.from(arrayBuffer);
        }
      } catch {
        bufferedBody = undefined;
      }
    }
  }

  const needsBody = (method: string) => !METHODS_WITHOUT_BODY.has(method);
  const createFetchInit = (
    method: string,
    body: RequestInit["body"],
    useStreamingBody: boolean,
  ): RequestInit & { duplex?: "half" } => {
    const init: RequestInit & { duplex?: "half" } = {
      method,
      headers: new Headers(headers),
      redirect: "manual",
    };

    if (body && needsBody(method)) {
      init.body = body;
      if (useStreamingBody) {
        init.duplex = "half";
      }
    }

    return init;
  };

  const initialBody =
    methodRequiresBody && bufferedBody === undefined ? request.body : bufferedBody;
  const initialInit = createFetchInit(
    request.method,
    needsBody(request.method) ? initialBody : undefined,
    methodRequiresBody && bufferedBody === undefined,
  );

  let response = await fetch(targetUrl, initialInit);
  let effectiveMethod = request.method;

  let redirectCount = 0;
  while (
    redirectCount < MAX_INTERNAL_REDIRECTS &&
    REDIRECT_STATUS.has(response.status) &&
    (PRESERVE_METHOD_REDIRECT_STATUS.has(response.status) ||
      SAFE_METHODS_FOR_AUTO_REDIRECT.has(effectiveMethod))
  ) {
    if (
      PRESERVE_METHOD_REDIRECT_STATUS.has(response.status) &&
      needsBody(effectiveMethod) &&
      !bufferedBody
    ) {
      break;
    }

    const location = response.headers.get("location");
    if (!location) {
      break;
    }

    const backendLocation = resolveBackendRedirectTarget(location);
    if (!backendLocation) {
      break;
    }

    if (!PRESERVE_METHOD_REDIRECT_STATUS.has(response.status)) {
      effectiveMethod = "GET";
    }

    const nextBody = needsBody(effectiveMethod) ? bufferedBody : undefined;
    const followInit = createFetchInit(effectiveMethod, nextBody, false);

    response = await fetch(backendLocation, followInit);
    redirectCount += 1;
  }
  const responseHeaders = new Headers(response.headers);
  HOP_BY_HOP_HEADERS.forEach((header) => responseHeaders.delete(header));

  if (REDIRECT_STATUS.has(response.status)) {
    const location = responseHeaders.get("location");
    if (location) {
      const proxyLocation = rewriteLocationForProxy(location);
      if (proxyLocation) {
        responseHeaders.set("location", proxyLocation);
      }
    }
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export {
  forwardRequest as DELETE,
  forwardRequest as GET,
  forwardRequest as HEAD,
  forwardRequest as OPTIONS,
  forwardRequest as PATCH,
  forwardRequest as POST,
  forwardRequest as PUT,
};
