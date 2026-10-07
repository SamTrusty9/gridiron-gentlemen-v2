/* Draft history section: year tabs (2023-2026), full 192-pick tables with
 * sticky headers, and a round-jump select. Client-side tab switching is done
 * through global functions so it works when the HTML is injected via innerHTML.
 */
window.Sections = window.Sections || {};

window.DraftsShow = function (year, el) {
  var root = document.getElementById('drafts-root');
  if (!root) return;
  var panes = root.querySelectorAll('[data-pane]');
  for (var i = 0; i < panes.length; i++) {
    panes[i].style.display = (panes[i].getAttribute('data-pane') === year) ? '' : 'none';
  }
  var tabs = document.getElementById('drafts-tabs');
  if (tabs) {
    var btns = tabs.querySelectorAll('[data-tab]');
    for (var j = 0; j < btns.length; j++) btns[j].classList.toggle('on', btns[j] === el);
  }
};

window.DraftsJump = function (year, val) {
  if (!val) return;
  var row = document.getElementById('draft-' + year + '-r' + val);
  if (row && row.scrollIntoView) row.scrollIntoView({ block: 'start', behavior: 'smooth' });
};

(function () {
  'use strict';

  Sections.drafts = {
    nav: 'Drafts',
    icon: '\uD83D\uDCCB',
    render: function (ctx) {
      var D = ctx.D, Lib = ctx.Lib;
      var drafts = (D.drafts && D.drafts.drafts) || {};
      var years = Object.keys(drafts).sort();
      if (!years.length) {
        return '<div class="wrap"><div class="page-head"><h1 class="page-title">Draft History</h1></div>' +
          '<div class="card"><div class="muted">No draft data on record.</div></div></div>';
      }
      var latest = years[years.length - 1];
      var nm = (D.meta && D.meta.nameToId) || {};

      var h = '<div class="wrap">';
      h += '<div class="page-head"><h1 class="page-title">Draft History</h1>' +
        '<div class="page-sub">Every pick of every draft, 2023&ndash;' + Lib.esc(latest) +
        '. Sixteen rounds, twelve teams, 192 picks per year.</div></div>';

      h += '<div class="tabs" id="drafts-tabs">';
      years.forEach(function (y) {
        h += '<button class="tab' + (y === latest ? ' on' : '') + '" data-tab="' + Lib.esc(y) + '"' +
          ' onclick="DraftsShow(\'' + Lib.esc(y) + '\',this)">' + Lib.esc(y) + '</button>';
      });
      h += '</div>';

      h += '<div id="drafts-root">';
      years.forEach(function (y) {
        var picks = drafts[y] || [];
        var roundSeen = {}, roundList = [];
        picks.forEach(function (p) {
          if (!roundSeen[p.Round]) { roundSeen[p.Round] = 1; roundList.push(p.Round); }
        });
        roundList.sort(function (a, b) { return a - b; });

        h += '<div data-pane="' + Lib.esc(y) + '"' + (y === latest ? '' : ' style="display:none"') + '>';

        h += '<div class="row mt1"><div><span class="muted">' + picks.length +
          ' picks &middot; ' + roundList.length + ' rounds</span></div>' +
          '<div><select onchange="DraftsJump(\'' + Lib.esc(y) + '\',this.value)" aria-label="Jump to round">' +
          '<option value="">Jump to round&hellip;</option>';
        roundList.forEach(function (r) {
          h += '<option value="' + r + '">Round ' + r + '</option>';
        });
        h += '</select></div></div>';

        h += '<div class="tbl-wrap mt1" style="max-height:70vh">' +
          '<table class="tbl"><thead style="position:sticky;top:0;z-index:2"><tr>';
        ['Round', 'Pick', 'Overall', 'Player', 'NFL Team', 'Pos', 'Fantasy Team', 'Manager']
          .forEach(function (c, i) {
            h += '<th' + (i < 3 ? ' class="num"' : '') + ' style="background:#0d1b2a">' + c + '</th>';
          });
        h += '</tr></thead><tbody>';

        var lastRound = null;
        picks.forEach(function (p) {
          var anchor = (p.Round !== lastRound) ? ' id="draft-' + Lib.esc(y) + '-r' + p.Round + '"' : '';
          lastRound = p.Round;
          var mid = nm[p.Manager];
          h += '<tr' + (p.Round === 1 ? ' class="hl"' : '') + anchor + '>' +
            '<td class="num">' + Lib.esc(p.Round) + '</td>' +
            '<td class="num">' + Lib.esc(p.Pick) + '</td>' +
            '<td class="num">' + Lib.esc(p['Overall Pick']) + '</td>' +
            '<td><b>' + Lib.esc(p.Player) + '</b></td>' +
            '<td>' + Lib.esc(p['NFL Team']) + '</td>' +
            '<td><span class="chip">' + Lib.esc(p.Position) + '</span></td>' +
            '<td>' + Lib.esc(p['Fantasy Team']) + '</td>' +
            '<td>' + (mid ? Lib.avatar(mid, 'sm') + ' ' : '') + Lib.esc(p.Manager) + '</td></tr>';
        });
        h += '</tbody></table></div></div>';
      });
      h += '</div></div>';
      return h;
    }
  };
})();
