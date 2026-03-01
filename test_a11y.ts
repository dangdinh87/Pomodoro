import fs from 'fs';
import path from 'path';

function findMissingAriaLabels(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findMissingAriaLabels(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('size="icon"')) {
          let hasAria = false;
          // Check current line, and a few lines up and down for aria-label or title or tooltip
          for (let j = Math.max(0, i - 5); j < Math.min(lines.length, i + 5); j++) {
            if (lines[j].includes('aria-label') || lines[j].includes('title=') || lines[j].includes('tooltip=')) {
              hasAria = true;
              break;
            }
          }
          if (!hasAria) {
            console.log(`Missing accessibility label in ${fullPath}:${i + 1}`);
            console.log(lines[i].trim());
          }
        }
      }
    }
  }
}

findMissingAriaLabels('src/components');
