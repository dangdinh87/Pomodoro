import re

def main():
    with open('src/components/tasks/components/task-item.tsx', 'r') as f:
        content = f.read()

    if 'memo(' in content:
        print('Already memoized')
        return

    content = content.replace('export function TaskItem({', 'export const TaskItem = React.memo(function TaskItem({')

    # The file ends with the TaskItem function. We just need to add }) at the end.
    if content.endswith('}\n'):
        content = content[:-2] + '})\n'
    elif content.endswith('}'):
        content = content[:-1] + '})'
    else:
        # Search for the last }
        last_brace = content.rfind('}')
        if last_brace != -1:
            content = content[:last_brace+1] + ')' + content[last_brace+1:]

    if "import React" not in content:
        content = "import React from 'react'\n" + content

    with open('src/components/tasks/components/task-item.tsx', 'w') as f:
        f.write(content)

    print("TaskItem modified.")

if __name__ == '__main__':
    main()
