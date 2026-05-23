import fs from 'fs';

const files = [
  'src/pages/Editor.tsx',
  'src/pages/Landing.tsx',
  'src/pages/PrivacyPolicy.tsx',
  'src/pages/TermsOfService.tsx',
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/#0056b3/g, 'primary');
  content = content.replace(/#f8fafc/g, 'gray-50');

  content = content.replace(/bg-\[primary\]/g, 'bg-primary');
  content = content.replace(/text-\[primary\]/g, 'text-primary');
  content = content.replace(/border-\[primary\]/g, 'border-primary');
  content = content.replace(/border-\[primary\]\/20/g, 'border-primary/20');
  content = content.replace(/ring-\[primary\]\/20/g, 'ring-primary/20');

  content = content.replace(/bg-\[gray-50\]/g, 'bg-gray-50');
  content = content.replace(/from-\[gray-50\]/g, 'from-gray-50');
  content = content.replace(/via-\[gray-50\]\/90/g, 'via-gray-50/90');
  
  fs.writeFileSync(file, content);
}
