import { memo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { DashboardFilters } from "@/types/jira";

interface FilterBarProps {
  sprints: string[];
  users: string[];
  issueTypes: string[];
  statuses: string[];
  filters: DashboardFilters;
  onFilterChange: (key: keyof DashboardFilters, values: string[]) => void;
  onClear: () => void;
  year: number;
  onYearChange: (year: number) => void;
}

// ⚡ Bolt: Wrapped MultiSelectFilter in React.memo to prevent unnecessary re-renders.
// Expected Impact: Prevents re-rendering all select components when parent FilterBar re-renders (e.g., when isFetching changes or another filter is updated).
const MultiSelectFilter = memo(function MultiSelectFilter({
  label,
  filterKey,
  options,
  selected,
  onFilterChange,
}: {
  label: string;
  filterKey: keyof DashboardFilters;
  options: string[];
  selected: string[];
  onFilterChange: (key: keyof DashboardFilters, values: string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground font-display uppercase tracking-wider">
        {label}
      </label>
      <Select
        value={selected.length === 1 ? selected[0] : undefined}
        onValueChange={(val) => {
          if (val === "__all__") {
            onFilterChange(filterKey, []);
          } else if (selected.includes(val)) {
            onFilterChange(filterKey, selected.filter((s) => s !== val));
          } else {
            onFilterChange(filterKey, [...selected, val]);
          }
        }}
      >
        <SelectTrigger className="w-[180px] bg-card text-card-foreground border-border">
          <SelectValue placeholder={`All ${label}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All {label}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {selected.includes(opt) ? `✓ ${opt}` : opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((s) => (
            <Badge
              key={s}
              variant="secondary"
              role="button"
              tabIndex={0}
              aria-label={`Remove ${s} filter`}
              className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              onClick={() => onFilterChange(filterKey, selected.filter((v) => v !== s))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onFilterChange(filterKey, selected.filter((v) => v !== s));
                }
              }}
            >
              {s} <X className="ml-1 h-3 w-3" aria-hidden="true" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
});

// ⚡ Bolt: Wrapped FilterBar in React.memo to prevent unnecessary re-renders.
// Expected Impact: Prevents re-rendering all select components when parent isFetching changes.
export const FilterBar = memo(function FilterBar({
  sprints,
  users,
  issueTypes,
  statuses,
  filters,
  onFilterChange,
  onClear,
  year,
  onYearChange,
}: FilterBarProps) {
  const hasFilters = Object.values(filters).some((v) => v.length > 0);

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground font-display uppercase tracking-wider">
            Year
          </label>
          <Select value={String(year)} onValueChange={(v) => onYearChange(Number(v))}>
            <SelectTrigger className="w-[100px] bg-card text-card-foreground border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <MultiSelectFilter
          label="Sprint"
          filterKey="sprint"
          options={sprints}
          selected={filters.sprint}
          onFilterChange={onFilterChange}
        />
        <MultiSelectFilter
          label="User"
          filterKey="user"
          options={users}
          selected={filters.user}
          onFilterChange={onFilterChange}
        />
        <MultiSelectFilter
          label="Issue Type"
          filterKey="issueType"
          options={issueTypes}
          selected={filters.issueType}
          onFilterChange={onFilterChange}
        />
        <MultiSelectFilter
          label="Status"
          filterKey="status"
          options={statuses}
          selected={filters.status}
          onFilterChange={onFilterChange}
        />

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground">
            <X className="mr-1 h-4 w-4" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
});
