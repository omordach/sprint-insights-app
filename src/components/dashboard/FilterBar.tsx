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

function MultiSelectFilter({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string[];
  onSelect: (values: string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select
        onValueChange={(val) => {
          if (val === "__all__") {
            onSelect([]);
          } else if (selected.includes(val)) {
            onSelect(selected.filter((s) => s !== val));
          } else {
            onSelect([...selected, val]);
          }
        }}
      >
        <SelectTrigger className="w-[180px]">
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
        <div className="flex flex-wrap gap-1 mt-1">
          {selected.map((s) => (
            <Badge
              key={s}
              variant="secondary"
              className="cursor-pointer text-xs"
              role="button"
              tabIndex={0}
              onClick={() => onSelect(selected.filter((v) => v !== s))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(selected.filter((v) => v !== s));
                }
              }}
            >
              {s} <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

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
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Year</span>
          <Select value={String(year)} onValueChange={(v) => onYearChange(Number(v))}>
            <SelectTrigger className="w-[100px]">
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
          options={sprints}
          selected={filters.sprint}
          onSelect={(v) => onFilterChange("sprint", v)}
        />
        <MultiSelectFilter
          label="User"
          options={users}
          selected={filters.user}
          onSelect={(v) => onFilterChange("user", v)}
        />
        <MultiSelectFilter
          label="Issue Type"
          options={issueTypes}
          selected={filters.issueType}
          onSelect={(v) => onFilterChange("issueType", v)}
        />
        <MultiSelectFilter
          label="Status"
          options={statuses}
          selected={filters.status}
          onSelect={(v) => onFilterChange("status", v)}
        />

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
});
