with open("src/components/dashboard/FilterBar.tsx", "r") as f:
    content = f.read()

old_badge = """          {selected.map((s) => (
            <Badge
              key={s}
              variant="secondary"
              className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
              onClick={() => onSelect(selected.filter((v) => v !== s))}
            >
              {s} <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}"""

new_badge = """          {selected.map((s) => (
            <Badge
              key={s}
              variant="secondary"
              role="button"
              tabIndex={0}
              aria-label={`Remove ${s} filter`}
              className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              onClick={() => onSelect(selected.filter((v) => v !== s))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(selected.filter((v) => v !== s));
                }
              }}
            >
              {s} <X className="ml-1 h-3 w-3" aria-hidden="true" />
            </Badge>
          ))}"""

if old_badge in content:
    content = content.replace(old_badge, new_badge)
    with open("src/components/dashboard/FilterBar.tsx", "w") as f:
        f.write(content)
    print("FilterBar updated successfully")
else:
    print("Could not find the target code in FilterBar.tsx")
