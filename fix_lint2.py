import re

with open("src/components/dashboard/PivotTable.tsx", "r") as f:
    content = f.read()

# Replace any occurrence of `let sorted = [...rows];` that might be missed or incorrectly formatted.
content = re.sub(r'let sorted = \[\.\.\.rows\];', 'const sorted = [...rows];', content)

with open("src/components/dashboard/PivotTable.tsx", "w") as f:
    f.write(content)
