
const GAMES = [
  { id: "amongus", title: "Among US (2019 version) multiplayer with real people", url: "https://wasm.rip/files/amongus/legacy/", tags: ["shooter", "fps"], pick: true },
  { id: "gta5", title: "Real Gta V on browser somehow ", url: "https://playgta5.com/", tags: ["shooter", "fps"], pick: true },];

const ELSEWHERE = [
  { title: "Lichess", url: "https://lichess.org/", note: "Free online chess against real people. It has no ads." },
  { title: "Doom (shareware episode)", url: "https://github.com/midzer/chocolate-doom", note: "The first Doom episode through the Chocolate Doom engine." },
];

// ---------- 3. Settings (runs on every page, including /anime) ----------
function get(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
var prefs = get('ppg_prefs', {});
var DEF = { theme: 'aero', font: 'tahoma', size: 'm', width: 'm', corners: 'rd', height: 'm' };
var FONTS = { tahoma: 'Tahoma,Verdana,sans-serif', verdana: 'Verdana,Geneva,sans-serif', georgia: 'Georgia,"Times New Roman",serif', system: 'system-ui,sans-serif' };
var HEIGHTS = { s: '380px', m: '520px', t: '720px' };
function applyPrefs() {
  var r = document.documentElement;
  r.dataset.theme = prefs.theme || DEF.theme; r.dataset.size = prefs.size || DEF.size;
  r.dataset.width = prefs.width || DEF.width; r.dataset.corners = prefs.corners || DEF.corners;
  r.style.setProperty('--font', FONTS[prefs.font] || FONTS.tahoma);
  r.style.setProperty('--fh', HEIGHTS[prefs.height] || HEIGHTS.m);
}
applyPrefs();

// ---------- 4. Home page ----------
document.addEventListener('DOMContentLoaded', function () {
  var $ = function (id) { return document.getElementById(id); };
  if (!$('games')) return;   // the anime page only needs the settings above
  var VIEWS = ['games', 'play', 'saved', 'recommended', 'settings', 'about'];
  var favs = get('ppg_favs', []), recent = get('ppg_recent', []), tag = '', q = '';
  var find = function (id) { return GAMES.filter(function (g) { return g.id === id; })[0]; };
  function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function tile(g) {
    if (g.img) return '<img class="tile" src="' + esc(g.img) + '" alt="" width="48" height="36">';
    var n = 0; for (var i = 0; i < g.id.length; i++) n = (n * 31 + g.id.charCodeAt(i)) % 40;
    var ini = g.title.split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 3);
    return '<span class="tile" style="background:hsl(' + (200 + n) + ' 55% 42%)">' + esc(ini) + '</span>';
  }
  function row(g) {
    return '<tr><td>' + tile(g) + '</td><td class="t"><a href="#/play/' + g.id + '">' + esc(g.title) + '</a><br><span class="small">' + esc(g.tags.join(', ')) +
      '</span></td><td><a class="btn go" href="#/play/' + g.id + '">Play</a> <button data-fav="' + g.id + '">save</button></td></tr>';
  }
  function renderList() {
    var tags = []; GAMES.forEach(function (g) { g.tags.forEach(function (t) { if (tags.indexOf(t) < 0) tags.push(t); }); }); tags.sort();
    $('tags').innerHTML = [''].concat(tags).map(function (t) {
      return '<a href="#/games" data-tag="' + esc(t) + '"' + (t === tag ? ' class="on"' : '') + '>' + (t ? esc(t) : 'all') + '</a>';
    }).join(' ');
    var list = GAMES.filter(function (g) { return (!tag || g.tags.indexOf(tag) >= 0) && (g.title + ' ' + g.tags.join(' ')).toLowerCase().indexOf(q) >= 0; });
    $('list').innerHTML = list.length ? '<tr><th></th><th>Title</th><th></th></tr>' + list.map(row).join('') : '<tr><td>No games match.</td></tr>';
    paint();
  }
  function paint() {
    document.querySelectorAll('[data-fav]').forEach(function (b) { b.textContent = favs.indexOf(b.dataset.fav) < 0 ? 'save' : 'unsave'; });
  }
  function box(id, title, list) {
    $(id).innerHTML = list.length ? '<h2>' + title + '</h2><div class="in"><ul>' + list.map(function (g) {
      return '<li><a href="#/play/' + g.id + '">' + esc(g.title) + '</a></li>';
    }).join('') + '</ul></div>' : '';
  }
  function sidebar() {
    var w = {};
    favs.concat(recent.slice(0, 5)).forEach(function (id) { var g = find(id); if (g) g.tags.forEach(function (t) { w[t] = (w[t] || 0) + 1; }); });
    var rec = GAMES.filter(function (g) { return favs.indexOf(g.id) < 0 && recent.slice(0, 3).indexOf(g.id) < 0; })
      .map(function (g) { return { g: g, s: g.tags.reduce(function (a, t) { return a + (w[t] || 0); }, 0) + (g.pick ? 0.5 : 0) }; })
      .sort(function (a, b) { return b.s - a.s; }).slice(0, 5).map(function (x) { return x.g; });
    box('recs', 'You might like', rec);
    box('recent', 'Played lately', recent.map(function (id) { return find(id); }).filter(Boolean).slice(0, 5));
    var s = favs.map(function (id) { return find(id); }).filter(Boolean);
    $('savedlist').innerHTML = s.length ? '<ul>' + s.map(function (g) { return '<li><a href="#/play/' + g.id + '">' + esc(g.title) + '</a></li>'; }).join('') + '</ul>' : 'Nothing saved yet. Press "save" next to a game.';
  }
  function openGame(id) {
    var g = find(id); if (!g) { location.hash = '#/games'; return; }
    $('ptitle').textContent = g.title; $('frame').src = g.url; $('pfav').dataset.fav = g.id;
    if (!prefs.norecent) { recent = [g.id].concat(recent.filter(function (x) { return x !== g.id; })).slice(0, 12); put('ppg_recent', recent); }
    sidebar(); paint();
  }
  function route() {
    var h = location.hash.replace(/^#\/?/, '') || 'games', m = h.match(/^play\/(.+)$/), view = m ? 'play' : h;
    if (VIEWS.indexOf(view) < 0 || (view === 'play' && !m)) view = 'games';
    document.querySelectorAll('main > section').forEach(function (s) { s.hidden = s.id !== view; });
    if (view === 'play') openGame(m[1]); else { $('frame').src = 'about:blank'; sidebar(); }
    window.scrollTo(0, 0);
  }

  $('picks').innerHTML = GAMES.filter(function (g) { return g.pick; }).map(function (g) { return '<li><a href="#/play/' + g.id + '">' + esc(g.title) + '</a></li>'; }).join('');
  $('elsewhere').innerHTML = ELSEWHERE.map(function (x) { return '<li><a href="' + esc(x.url) + '" target="_blank" rel="noopener">' + esc(x.title) + '</a>: ' + esc(x.note) + '</li>'; }).join('');

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-fav]'), t = e.target.closest('[data-tag]');
    if (b) { var id = b.dataset.fav; favs = favs.indexOf(id) < 0 ? favs.concat(id) : favs.filter(function (x) { return x !== id; }); put('ppg_favs', favs); paint(); sidebar(); }
    if (t) { e.preventDefault(); tag = t.dataset.tag; renderList(); }
  });
  $('fs').onclick = function () { var s = $('stage'), f = s.requestFullscreen || s.webkitRequestFullscreen; if (f) f.call(s); };
  $('q').oninput = function () { q = this.value.toLowerCase(); if (location.hash && location.hash !== '#/games') location.hash = '#/games'; renderList(); };

  // settings page
  document.querySelectorAll('[data-pref]').forEach(function (el) {
    var k = el.dataset.pref;
    if (el.type === 'checkbox') el.checked = !!prefs[k]; else el.value = prefs[k] || DEF[k];
    el.onchange = function () { prefs[k] = el.type === 'checkbox' ? el.checked : el.value; put('ppg_prefs', prefs); applyPrefs(); };
  });
  function mine() { return Object.keys(localStorage).filter(function (k) { return k.indexOf('ppg_') === 0; }); }
  $('export').onclick = function () {
    var o = {}; mine().forEach(function (k) { o[k] = localStorage.getItem(k); });
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(o)], { type: 'application/json' }));
    a.download = 'pastpapergenie-saves.json'; a.click();
  };
  $('import').onchange = function () {
    var f = this.files[0]; if (!f) return; var r = new FileReader();
    r.onload = function () {
      try { var o = JSON.parse(r.result); Object.keys(o).forEach(function (k) { if (k.indexOf('ppg_') === 0) localStorage.setItem(k, String(o[k])); }); location.reload(); }
      catch (e) { alert('That file did not look right.'); }
    };
    r.readAsText(f);
  };
  $('clear').onclick = function () { if (confirm('Delete your saved games, history and settings?')) { mine().forEach(function (k) { localStorage.removeItem(k); }); location.reload(); } };

  window.addEventListener('hashchange', route);
  renderList(); route();
});
