const fs = require('fs');
const files = ['src/i18n/locales/en.json', 'src/i18n/locales/vi.json', 'src/i18n/locales/ja.json'];

for (const file of files) {
  const content = JSON.parse(fs.readFileSync(file, 'utf8'));

  if (file.includes('en.json')) {
    content.nav.menu = "Toggle menu";
  } else if (file.includes('vi.json')) {
    content.nav.menu = "Chuyển đổi menu";
  } else if (file.includes('ja.json')) {
    content.nav.menu = "メニューの切り替え";
  }

  fs.writeFileSync(file, JSON.stringify(content, null, 2));
}
