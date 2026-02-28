import re

def main():
    with open('src/components/tasks/components/sortable-task-item.tsx', 'r') as f:
        content = f.read()

    if 'memo(' in content:
        print('Already memoized')
        return

    content = content.replace('export function SortableTaskItem({', 'export const SortableTaskItem = React.memo(function SortableTaskItem({')

    last_brace = content.rfind('}')
    if last_brace != -1:
        content = content[:last_brace+1] + ')' + content[last_brace+1:]

    if "import React" not in content:
        content = "import React from 'react'\n" + content

    with open('src/components/tasks/components/sortable-task-item.tsx', 'w') as f:
        f.write(content)

    print("SortableTaskItem modified.")

if __name__ == '__main__':
    main()
