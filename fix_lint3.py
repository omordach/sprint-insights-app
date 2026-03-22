import re

with open("src/components/dashboard/PivotTable.tsx", "r") as f:
    content = f.read()

content = content.replace("let sorted = [...rows];", "const sorted = [...rows];")
content = content.replace("let sorted = rows;", "const sorted = rows;")
# find exact line and replace
for line in content.split("\n"):
    if "let sorted" in line:
        content = content.replace(line, line.replace("let ", "const "))

with open("src/components/dashboard/PivotTable.tsx", "w") as f:
    f.write(content)
