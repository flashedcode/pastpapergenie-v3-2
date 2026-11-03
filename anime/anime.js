// Anime page. Search and details come from AniList (https://anilist.co).
var RECS = [174154, 145064, 40748, 1735, 269, 21, 101922, 11061, 16498];   // the "recommended" shows: swap the AniList ids to change them
var FIELDS = 'id title{romaji english} coverImage{large} episodes averageScore genres format';
var d = document, list = d.getElementById('alist'), bar = d.getElementById('abar'), det = d.getElementById('detail');

function api(query, vars) {
  return fetch('https://graphql.anilist.co', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: query, variables: vars }) })
    .then(function (r) { return r.json(); }).then(function (j) { if (!j.data) throw new Error('no data'); return j.data; });
}
function lookup(arg, type, v) {
  return api('query($v:' + type + '){Page(perPage:24){media(' + arg + ',type:ANIME,sort:POPULARITY_DESC){' + FIELDS + '}}}', { v: v }).then(function (x) { return x.Page.media; });
}
function el(tag, text, parent) { var n = d.createElement(tag); if (text) n.textContent = text; if (parent) parent.appendChild(n); return n; }
function showName(a) { return a.title.english || a.title.romaji; }
function plain(html) { return new DOMParser().parseFromString(html || '', 'text/html').body.textContent; }

function fill(shows) {
  list.textContent = '';
  if (!shows.length) { list.textContent = 'Nothing found.'; return; }
  shows.forEach(function (a) {
    var c = el('a', '', list); c.className = 'card'; c.href = '#' + a.id;
    var i = el('img', '', c); i.src = a.coverImage.large; i.alt = ''; i.loading = 'lazy';
    el('span', showName(a), c);
  });
}
function showRecs() { lookup('id_in:$v', '[Int]', RECS).then(fill).catch(function () { list.textContent = 'Could not reach AniList. Try again in a minute.'; }); }

function openShow(id) {
  api('query($id:Int){Media(id:$id,type:ANIME){' + FIELDS + ' description(asHtml:false) externalLinks{site url type}}}', { id: id }).then(function (x) {
    var a = x.Media; det.textContent = '';
    var back = el('a', '\u2190 back to the list', det); back.href = '#';
    var wrap = el('div', '', det); wrap.className = 'dwrap';
    var i = el('img', '', wrap); i.src = a.coverImage.large; i.alt = '';
    var t = el('div', '', wrap);
    el('h3', showName(a), t);
    el('p', [a.format, a.episodes ? a.episodes + ' episodes' : '', a.averageScore ? 'score ' + a.averageScore + '/100' : ''].filter(Boolean).join(', '), t).className = 'small';
    if (a.genres.length) el('p', a.genres.join(', '), t).className = 'small';
    el('p', plain(a.description), t);
    el('h4', 'Where to watch (official)', t);
    var s = (a.externalLinks || []).filter(function (l) { return l.type === 'STREAMING'; });
    if (!s.length) el('p', "AniList doesn't list an official stream for this one.", t);
    else { var ul = el('ul', '', t); s.forEach(function (l) { var k = el('a', l.site, el('li', '', ul)); k.href = l.url; k.target = '_blank'; k.rel = 'noopener noreferrer'; }); }
  }).catch(function () { det.textContent = 'Could not load that one. Try again in a minute.'; });
}
function route() {
  var m = location.hash.match(/^#(\d+)$/);
  det.hidden = !m; list.hidden = !!m; bar.hidden = !!m;
  if (m) openShow(+m[1]);
}
bar.onsubmit = function (e) {
  e.preventDefault(); var s = d.getElementById('aq').value.trim();
  if (!s) { showRecs(); return; }
  list.textContent = 'Searching...';
  lookup('search:$v', 'String', s).then(fill).catch(function () { list.textContent = 'Search failed. Try again.'; });
};
window.addEventListener('hashchange', route);
showRecs(); route();
