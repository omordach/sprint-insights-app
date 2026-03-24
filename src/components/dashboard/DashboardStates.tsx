import { Loader2, AlertCircle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4" role="status" aria-live="polite">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
      <div className="text-center">
        <p className="text-sm font-display font-semibold text-foreground">Fetching Jira Data</p>
        <p className="text-xs text-muted-foreground mt-1">This may take a moment due to API pagination...</p>
      </div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4" role="alert" aria-live="assertive">
      <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
      <div className="text-center">
        <p className="text-sm font-display font-semibold text-foreground">Failed to Load Data</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-md">{message}</p>
      </div>
    </div>
  );
}

export function EmptyState({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4" aria-live="polite">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
        <BarChart3 className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="text-center max-w-sm">
        <p className="text-base font-display font-semibold text-foreground">No matches found</p>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          We couldn't find any issues matching your current filters. Try adjusting or clearing them to see more results.
        </p>
        {onClearFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Clear all filters
          </Button>
        )}
      </div>
    </div>
  );
}
