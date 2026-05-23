import fs from 'fs';
let content = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

content = content.replace(/bg-\[var\(--color-background\)\]/g, 'bg-background');
content = content.replace(/bg-\[var\(--color-accent\)\]\/10/g, 'bg-accent/10');
content = content.replace(/text-\[var\(--color-accent\)\]/g, 'text-accent');
content = content.replace(/bg-\[var\(--color-accent\)\]/g, 'bg-accent');
content = content.replace(/hover:bg-\[var\(--color-accent-hover\)\]/g, 'hover:bg-accent-hover');

fs.writeFileSync('src/pages/Landing.tsx', content);
