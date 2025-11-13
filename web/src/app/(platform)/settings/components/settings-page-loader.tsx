import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

interface SettingsPageLoaderProps {
  title?: string;
  description?: string;
}

/**
 * A standardized loader skeleton used while settings data is being fetched or hydrated.
 */
export function SettingsPageLoader({ title, description }: SettingsPageLoaderProps) {
  return (
    <Card>
      <CardHeader>
        {/* Use provided title/description if available, otherwise skeletons */}
        {title ? <CardTitle>{title}</CardTitle> : <Skeleton className="h-6 w-1/3" />}
        {description ? (
          <CardDescription>{description}</CardDescription>
        ) : (
          <Skeleton className="mt-2 h-4 w-2/3" />
        )}
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Section 1 Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-5 w-1/4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>

        {/* Section 2 Skeleton (simulating separator and next section) */}
        <Skeleton className="h-[1px] w-full" />
        <div className="space-y-6">
          <Skeleton className="h-5 w-1/4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>

        {/* Submit Button Skeleton */}
        <Skeleton className="h-9 w-32" />
      </CardContent>
    </Card>
  );
}
