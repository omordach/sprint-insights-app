with open("src/components/dashboard/PivotTable.tsx", "r") as f:
    content = f.read()
content = content.replace("let sorted = [...rows];", "const sorted = [...rows];")
with open("src/components/dashboard/PivotTable.tsx", "w") as f:
    f.write(content)
