
const GAMES = [ 
  { id: "amongus", title: "Among US (2019 version) with real players", url: "https://wasm.rip/files/amongus/legacy/", tags: ["covid", "psycological"], pick: true }, 
  { id: "cyberpunk", title: "Cyberpunk 2077 somehow wth", url: "https://cyberpunk2077.lol/", tags: ["triple-a", "Wasm port"], pick: true }, 
  { id: "fortnite", title: "EA Cricket 07", url: "https://cricket07.dhaiwat.com/", tags: ["fps", "shooter"], pick: true }, 
  { id: "terraria", title: "Terraria", url: "https://playterraria.lol/game/", tags: ["retro", "sandbox"], pick: true }, ];

// title:  the headline          date:   YYYY-MM-DD (newest shows first)
// body:   plain text (blank line = new paragraph) or HTML if you want links, e.g. <a href="...">here</a>
// pinned: true keeps it at the top        author: optional
const ANNOUNCEMENTS = [
  {
    title: "Welcome to pastpapergenie v3",
    date: "2026-11-05",
    author: "Ryan (xrompf)",
    pinned: true,
    body: "idk what to say here"
  },
  {
    title: "New: Aero Pink theme",
    date: "2026-11-05",
    author: "Ryan (xrompf)",
    body: "testing the announcement page."
  },
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

// ---------- 3b. Highlight the current page in the nav (runs on every page, including /anime) ----------
function markNav() {
  var links = document.querySelectorAll('nav a'); if (!links.length) return;
  var strip = function (p) { return p.replace(/index\.html$/, ''); };
  var view = (location.hash.replace(/^#\/?/, '') || 'games').split('/')[0];
  if (['games', 'saved', 'announcements', 'settings', 'about'].indexOf(view) < 0) view = 'games';
  Array.prototype.forEach.call(links, function (a) {
    var href = a.getAttribute('href') || '';
    if (/#\/recommended$/.test(href)) { a.setAttribute('href', href.replace('#/recommended', '#/announcements')); a.textContent = 'Announcements'; }
    var same = a.host === location.host && strip(a.pathname) === strip(location.pathname);
    var on = same && (!a.hash || a.hash === '#/' + view);
    a.classList.toggle('start', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
}
document.addEventListener('DOMContentLoaded', markNav);
window.addEventListener('hashchange', markNav);

// ---------- 4. Home page ----------
document.addEventListener('DOMContentLoaded', function () {
  var $ = function (id) { return document.getElementById(id); };
  if (!$('games')) return;   // the anime page only needs the settings above
  var VIEWS = ['games', 'play', 'saved', 'announcements', 'settings', 'about'];
  var favs = get('ppg_favs', []), recent = get('ppg_recent', []), tag = '', q = '';
  var find = function (id) { return GAMES.filter(function (g) { return g.id === id; })[0]; };
  function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function colour(g) { var n = 0; for (var i = 0; i < g.id.length; i++) n = (n * 31 + g.id.charCodeAt(i)) % 40; return 'hsl(' + (200 + n) + ' 55% 42%)'; }
  function initials(g) { return g.title.split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 3); }
  function tile(g) {
    if (g.img) return '<img class="tile" src="' + esc(g.img) + '" alt="" width="48" height="36">';
    return '<span class="tile" style="background:' + colour(g) + '">' + esc(initials(g)) + '</span>';
  }
  function card(g) {
    var pic = g.img ? '<img src="' + esc(g.img) + '" alt="">' : '<div class="ph" style="background:' + colour(g) + '">' + esc(initials(g)) + '</div>';
    return '<a class="card" href="#/play/' + g.id + '">' + pic + '<span>' + esc(g.title) + '</span></a>';
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
    var feat = list.filter(function (g) { return g.featured; }), rest = list.filter(function (g) { return !g.featured; });
    $('featured').innerHTML = feat.map(card).join('');
    $('featwin').hidden = !feat.length;
    $('list').innerHTML = rest.length ? '<tr><th></th><th>Title</th><th></th></tr>' + rest.map(row).join('') : (list.length ? '' : '<tr><td>No games match.</td></tr>');
    $('allwin').hidden = !rest.length && list.length > 0;
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
      .map(function (g) { return { g: g, s: g.tags.reduce(function (a, t) { return a + (w[t] || 0); }, 0) }; })
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
    var h = location.hash.replace(/^#\/?/, '') || 'games'; if (h === 'recommended') h = 'announcements';
    var m = h.match(/^play\/(.+)$/), view = m ? 'play' : h;
    if (VIEWS.indexOf(view) < 0 || (view === 'play' && !m)) view = 'games';
    document.querySelectorAll('main > section').forEach(function (s) { s.hidden = s.id !== view; });
    if (view === 'play') openGame(m[1]); else { $('frame').src = 'about:blank'; sidebar(); }
    window.scrollTo(0, 0);
  }

  function when(d) { var t = new Date(d + 'T00:00:00'); return isNaN(t) ? esc(d || '') : t.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
  function posts() {
    var list = ANNOUNCEMENTS.slice().sort(function (a, b) { return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || String(b.date).localeCompare(String(a.date)); });
    $('posts').innerHTML = list.length ? list.map(function (p) {
      var body = String(p.body || '');
      if (!/<\w/.test(body)) body = '<p>' + esc(body).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>') + '</p>';
      return '<div class="win post"><h2>' + esc(p.title) + (p.pinned ? ' <span class="pin">Pinned</span>' : '') + (p.date ? '<span class="date">' + when(p.date) + '</span>' : '') +
        '</h2><div class="in">' + body + (p.author ? '<p class="small">Posted by ' + esc(p.author) + '</p>' : '') + '</div></div>';
    }).join('') : '<div class="win"><div class="in">No announcements yet.</div></div>';
  }
  posts();

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
