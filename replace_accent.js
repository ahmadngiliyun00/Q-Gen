import fs from 'fs';

const files = [
  'src/pages/Dashboard.tsx',
  'src/pages/Editor.tsx',
  'src/pages/Landing.tsx',
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/bg-\[#ff8c00\]\/10/g, 'bg-accent/10');
  content = content.replace(/border-\[#ff8c00\]/g, 'border-accent');
  content = content.replace(/text-\[#cf7100\]/g, 'text-accent');
  
  content = content.replace(/bg-\[#ff8c00\]/g, 'bg-accent');
  content = content.replace(/hover:bg-\[#e67e00\]/g, 'hover:bg-accent-hover');
  content = content.replace(/shadow-\[0_20px_40px_-15px_rgba\(255,140,0,0\.6\)\]/g, 'shadow-[0_20px_40px_-15px_var(--color-accent)]'); 
  content = content.replace(/bg-\[#ff8c00\]\/20/g, 'bg-accent/20');
  
  fs.writeFileSync(file, content);
}
