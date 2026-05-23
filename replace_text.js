import fs from 'fs';

const files = [
  'src/pages/Dashboard.tsx',
  'src/pages/PrivacyPolicy.tsx',
  'src/pages/TermsOfService.tsx',
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/text-\[#ff8c00\]/g, 'text-accent');
  fs.writeFileSync(file, content);
}
