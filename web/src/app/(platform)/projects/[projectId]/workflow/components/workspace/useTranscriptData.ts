"use client";

import { useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { NodeDetailView, NodeVersionRead, TemporaryExecutionRead } from '~/core/models/node.model';
import { useStore } from '~/core/store';

/**
 * Defines the structure of the data consumed by the Interaction Transcript.
 */
export interface TranscriptData {
  // The actual data payload (either a finalized version or a temporary result)
  data: NodeVersionRead | TemporaryExecutionRead | null;
  // Metadata about the source
  isHistorical: boolean; // True if viewing a specific historical version (even if it's the active one)
  isPending: boolean;    // True if data comes from pending_result
  versionId: number | null; // The ID of the version, null if pending
  isLoading: boolean;    // True if the required data (e.g., historical fetch) is currently loading
}

/**
 * Hook to determine and manage the data source for the Interaction Transcript.
 * Leverages the centralized store cache for fetching and accessing data.
 * (Architecture 7.2.2)
 */
export const useTranscriptData = (node: NodeDetailView | null): TranscriptData => {
  const { viewingVersionId, fetchNodeVersion, nodeVersionsCache } = useStore(useShallow((state) => ({
    viewingVersionId: state.viewingVersionId,
    fetchNodeVersion: state.fetchNodeVersion,
    // Access the centralized cache for historical versions
    nodeVersionsCache: state.nodeVersionsCache,
  })));

  const nodeId = node?.id;

  // Trigger fetch for historical data if required.
  useEffect(() => {
    if (nodeId && viewingVersionId !== null) {
      // The store action handles the fetch logic, caching, and error handling (toasts).
      // We derive loading state from the cache presence.
      void fetchNodeVersion(nodeId, viewingVersionId);
    }
  }, [nodeId, viewingVersionId, fetchNodeVersion]);

  // Determine the data source based on the current state.
  return useMemo((): TranscriptData => {
    // If node details (NodeDetailView) are not yet available, we are still loading the context.
    if (!node) {
      return { data: null, isHistorical: false, isPending: false, versionId: null, isLoading: true };
    }

    // 1. Historical View (viewingVersionId is set)
    if (viewingVersionId !== null) {
      // Check the centralized cache first
      let data = nodeVersionsCache.get(viewingVersionId) ?? null;

      // Optimization: If the requested version is the active version and not yet in the specific version cache (e.g. fetched via fetchNodeDetails), use it directly.
      if (!data && node.active_version && node.active_version.id === viewingVersionId) {
        data = node.active_version;
      }

      return {
        data,
        isHistorical: true,
        isPending: false,
        versionId: viewingVersionId,
        // Loading if the requested historical data is not yet available
        isLoading: data === null,
      };
    }

    // 2. Latest View (viewingVersionId is null)
    // Prioritize pending_result (Executing, Awaiting HITL, Failed)
    if (node.pending_result) {
      return {
        data: node.pending_result,
        isHistorical: false,
        isPending: true,
        versionId: null,
        isLoading: false,
      };
    }

    // Otherwise, show the active version (Completed)
    if (node.active_version) {
      return {
        data: node.active_version,
        isHistorical: false,
        isPending: false,
        versionId: node.active_version.id,
        isLoading: false,
      };
    }

    // Fallback (e.g., Not Started, or Completed without data)
    return { data: null, isHistorical: false, isPending: false, versionId: null, isLoading: false };

  }, [node, viewingVersionId, nodeVersionsCache]);
};

