import { Loader2, AlertCircle, BarChart3 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div className="text-center">
        <p className="text-sm font-display font-semibold text-foreground">Fetching Jira Data</p>
        <p className="text-xs text-muted-foreground mt-1">This may take a moment due to API pagination...</p>
      </div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <div className="text-center">
        <p className="text-sm font-display font-semibold text-foreground">Failed to Load Data</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-md">{message}</p>
      </div>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <BarChart3 className="h-8 w-8 text-muted-foreground" />
      <div className="text-center">
        <p className="text-sm font-display font-semibold text-foreground">No Data Found</p>
        <p className="text-xs text-muted-foreground mt-1">No issues match the current filters.</p>
      </div>
    </div>
  );
}
