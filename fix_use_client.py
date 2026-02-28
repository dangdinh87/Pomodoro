import re

def fix_file(filename):
    with open(filename, 'r') as f:
        content = f.read()

    # If it starts with import React from 'react' and then has "use client"
    if content.startswith("import React from 'react'\n\"use client\""):
        content = "\"use client\"\n\nimport React from 'react'\n" + content[len("import React from 'react'\n\"use client\""):]
        with open(filename, 'w') as f:
            f.write(content)
        print(f"Fixed {filename}")

fix_file('src/components/tasks/components/sortable-task-item.tsx')
