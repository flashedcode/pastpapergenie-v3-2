// Scans resources/<folder>/ and writes games.json. Runs on GitHub, not on your computer.
const fs = require('fs'), path = require('path');
const ROOT = 'resources';
const LOGO = /^(logo|icon|thumbnail|thumb|cover)\.(png|jpe?g|webp|svg|gif)$/i;
const rank = f => ['logo', 'icon', 'thumbnail', 'thumb', 'cover'].indexOf(f.split('.')[0].toLowerCase());

const dirs = fs.existsSync(ROOT)
  ? fs.readdirSync(ROOT, { withFileTypes: true }).filter(d => d.isDirectory() && !d.name.startsWith('.'))
  : [];

const games = [];
for (const d of dirs) {
  const dir = path.join(ROOT, d.name);
  if (!fs.existsSync(path.join(dir, 'index.html'))) continue;   // not a game folder
  let meta = {};
  try { meta = JSON.parse(fs.readFileSync(path.join(dir, 'game.json'), 'utf8')); } catch (e) {}
  const logo = fs.readdirSync(dir).filter(f => LOGO.test(f)).sort((a, b) => rank(a) - rank(b))[0];
  const enc = n => ROOT + '/' + encodeURIComponent(d.name) + '/' + encodeURIComponent(n);
  const pretty = d.name.replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const g = {
    id: d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    title: meta.title || pretty,
    url: enc('index.html'),
    tags: Array.isArray(meta.tags) && meta.tags.length ? meta.tags : ['game'],
    pick: !!meta.pick,
  };
  if (logo) g.img = enc(logo);
  games.push(g);
}
games.sort((a, b) => a.title.localeCompare(b.title));
fs.writeFileSync('games.json', JSON.stringify(games, null, 2) + '\n');
console.log('Found ' + games.length + ' game(s).');
