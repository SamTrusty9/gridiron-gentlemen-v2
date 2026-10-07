/* Player database: client-side search over all players.json entries.
 * Player header rows are pre-rendered; the full entries arrays ship once as a
 * JSON blob and each player's stint table (season, week, manager, team,
 * points, starter/bench) is built lazily on expand. Search is debounced.
 * Global handlers keep everything working when HTML is injected via innerHTML.
 */
window.Sections = window.Sections || {};

window.__playersTimer = null;
window.__playersEntries = null;

window.__playersGetEntries = function () {
  if (window.__playersEntries) return window.__playersEntries;
  var el = document.getElementById('players-data');
  try {
    window.__playersEntries = el ? JSON.parse(el.textContent) : [];
  } catch (e) {
    window.__playersEntries = [];
  }
  return window.__playersEntries;
};

window.PlayersSearch = function (q) {
  clearTimeout(window.__playersTimer);
  window.__playersTimer = setTimeout(function () {
    q = (q || '').toLowerCase().trim();
    var list = document.getElementById('players-list');
    if (!list) return;
    var cards = list.querySelectorAll('[data-name]');
    var shown = 0;
    for (var i = 0; i < cards.length; i++) {
      var hit = !q || cards[i].getAttribute('data-name').indexOf(q) > -1;
      cards[i].style.display = hit ? '' : 'none';
      if (hit) shown++;
    }
    var cnt = document.getElementById('players-count');
    if (cnt) cnt.textContent = shown + ' of ' + cards.length + ' players';
  }, 150);
};

window.PlayersToggle = function (btn, idx) {
  var card = btn.closest ? btn.closest('[data-name]') : null;
  if (!card) return;
  var body = card.querySelector('[data-entries]');
  if (!body) return;
  var open = body.style.display !== 'none';
  if (open) {
    body.style.display = 'none';
    btn.innerHTML = '&#9656; Expand';
    return;
  }
  var Lib = window.Lib;
  if (!body.getAttribute('data-built')) {
    var all = window.__playersGetEntries();
    var entries = (all[idx] || []).slice().sort(function (a, b) {
      return b[1] - a[1] || b[2] - a[2];
    });
    var t = '<div class="tbl-wrap"><table class="tbl">' +
      '<thead><tr><th>Season</th><th>Wk</th><th>Manager</th><th>Team</th>' +
      '<th class="num">Pts</th><th>Pos</th><th>Role</th></tr></thead><tbody>';
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i], mid = e[0];
      var role = e[5] === 1 ? '<span class="chip green">Starter</span>' :
        '<span class="muted">Bench</span>';
      t += '<tr><td>' + Lib.esc(e[1]) + '</td><td>' + Lib.esc(e[2]) + '</td>' +
        '<td>' + Lib.avatar(mid, 'sm') + ' ' + Lib.esc(Lib.mname(mid)) + '</td>' +
        '<td>' + Lib.esc(Lib.teamName(mid)) + '</td>' +
        '<td class="num"><b>' + Lib.esc(e[4]) + '</b></td>' +
        '<td><span class="chip">' + Lib.esc(e[3]) + '</span></td>' +
        '<td>' + role + '</td></tr>';
    }
    t += '</tbody></table></div>';
    body.innerHTML = t;
    body.setAttribute('data-built', '1');
  }
  body.style.display = '';
  btn.innerHTML = '&#9662; Collapse';
};

(function () {
  'use strict';

  Sections.players = {
    nav: 'Players',
    icon: '\uD83D\uDD0D',
    render: function (ctx) {
      var D = ctx.D, Lib = ctx.Lib;
      var P = (D.players && D.players.players) || [];
      var sorted = P.slice().sort(function (a, b) {
        return String(a.name).localeCompare(String(b.name));
      });

      var h = '<div class="wrap">';
      h += '<div class="page-head"><h1 class="page-title">Player Database</h1>' +
        '<div class="page-sub">Every player who has ever graced a league roster. ' +
        'Search by name, then expand a player to see every stint.</div></div>';

      h += '<input class="search mt1" type="search" placeholder="Search players by name\u2026" ' +
        'oninput="PlayersSearch(this.value)" aria-label="Search players">';
      h += '<div class="muted mt1" id="players-count">' + sorted.length + ' of ' + sorted.length + ' players</div>';
      h += '<div id="players-list" class="mt1">';

      var entriesJson = [];
      sorted.forEach(function (pl, idx) {
        entriesJson.push(pl.entries || []);
        h += '<div class="card" data-name="' + Lib.esc(String(pl.name).toLowerCase()) + '">';
        h += '<div class="row"><div><b>' + Lib.esc(pl.name) + '</b> ' +
          '<span class="chip">' + Lib.esc(pl.pos) + '</span></div>' +
          '<div><span class="muted">' + Lib.esc(pl.n) + ' stint' + (pl.n === 1 ? '' : 's') + '</span> ' +
          '<button class="btn" onclick="PlayersToggle(this,' + idx + ')">&#9656; Expand</button></div></div>';
        h += '<div data-entries style="display:none" class="mt1"></div></div>';
      });
      h += '</div>';

      /* Entries ship once as inert JSON; '<' is unicode-escaped so the blob
       * can never break out of its script tag. */
      h += '<script type="application/json" id="players-data">' +
        JSON.stringify(entriesJson).replace(/</g, '\\u003c') + '</scr' + 'ipt>';

      return h + '</div>';
    }
  };
})();
