import { Loader2, AlertCircle, BarChart3 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">Fetching Jira Data</h2>
        <p className="text-sm text-muted-foreground mt-1">This may take a moment due to API pagination...</p>
      </div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">Failed to Load Data</h2>
        <p className="text-sm text-muted-foreground mt-1">{message}</p>
      </div>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <BarChart3 className="h-8 w-8 text-muted-foreground" />
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">No Data Found</h2>
        <p className="text-sm text-muted-foreground mt-1">No issues match the current filters.</p>
      </div>
    </div>
  );
}
