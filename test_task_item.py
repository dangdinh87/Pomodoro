import re

def main():
    with open('src/components/tasks/components/task-item.tsx', 'r') as f:
        content = f.read()

    if 'React.memo' in content:
        print('Already memoized')
    else:
        print('Not memoized, modifying...')
        content = content.replace('export function TaskItem({', 'export const TaskItem = React.memo(function TaskItem({')
        content = content.replace('}: TaskItemProps) {', '}: TaskItemProps) {\n')
        # find end of TaskItem function and add })

        # Need to add import React from 'react'
        if "import React" not in content and "import { memo }" not in content:
            content = "import React from 'react'\n" + content

        print("Done")

if __name__ == '__main__':
    main()
