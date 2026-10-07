/* Rivalries section: six rivalry cards with both avatars, a .vs-badge, the
 * series record derived from franchises.headToHead, and an expandable
 * all-time matchup list derived from weekly.json.
 * (Trophy/bet copy: the reference build had no filled-in trophy or bet text
 * for any pair, so none is rendered.)
 */
window.Sections = window.Sections || {};

(function () {
  'use strict';

  function mgrBlock(Lib, id) {
    return '<div>' + Lib.avatar(id, 'lg') +
      '<div class="mt1"><b>' + Lib.esc(Lib.mname(id)) + '</b></div>' +
      '<div class="muted">' + Lib.esc(Lib.teamName(id)) + '</div></div>';
  }

  Sections.rivalries = {
    nav: 'Rivalries',
    icon: '\u2694\uFE0F',
    render: function (ctx) {
      var D = ctx.D, Lib = ctx.Lib;
      var pairs = (D.rivalries && D.rivalries.pairs) || [];
      var h2h = (D.franchises && D.franchises.headToHead) || {};
      var weekly = (D.weekly && D.weekly.weeklyScores) || [];
      var nm = (D.meta && D.meta.nameToId) || {};
      var idToName = {};
      Object.keys(nm).forEach(function (n) { idToName[nm[n]] = n; });

      var h = '<div class="wrap">';
      h += '<div class="page-head"><h1 class="page-title">Rivalries</h1>' +
        '<div class="page-sub">The league\u2019s six great feuds \u2014 head-to-head history and every meeting on record.</div></div>';

      h += '<div class="grid mt1">';
      pairs.forEach(function (pr) {
        var a = pr.a, b = pr.b;
        var rec = (h2h[a] && h2h[a][b]) || { w: 0, l: 0, t: 0, games: 0, avgPf: 0, avgPa: 0 };
        var w = rec.w || 0, l = rec.l || 0, t = rec.t || 0;
        var lead;
        if (w > l) lead = Lib.esc(Lib.mname(a)) + ' leads ' + w + '&ndash;' + l;
        else if (l > w) lead = Lib.esc(Lib.mname(b)) + ' leads ' + l + '&ndash;' + w;
        else lead = 'Series tied ' + w + '&ndash;' + l;
        if (t) lead += '&ndash;' + t;

        /* All-time matchups: weekly rows between the two, from a's perspective, deduped. */
        var na = idToName[a], nb = idToName[b], rows = [], seen = {};
        weekly.forEach(function (r) {
          if (r.Team === na && r.Opponent === nb) {
            var k = r.Season + '-' + r.Week;
            if (!seen[k]) { seen[k] = 1; rows.push(r); }
          }
        });
        rows.sort(function (x, y) { return y.Season - x.Season || y.Week - x.Week; });

        h += '<div class="card">';
        h += '<div style="display:flex;align-items:flex-start;justify-content:center;gap:18px;text-align:center">';
        h += mgrBlock(Lib, a);
        h += '<span class="vs-badge" style="margin-top:34px">VS</span>';
        h += mgrBlock(Lib, b);
        h += '</div>';
        h += '<div class="center mt1"><span class="mono">' + lead + '</span></div>';
        h += '<div class="center muted">' + (rec.games || 0) + ' games &middot; avg ' +
          Lib.fmt(rec.avgPf, 1) + '&ndash;' + Lib.fmt(rec.avgPa, 1) + '</div>';

        if (rows.length) {
          h += '<details class="mt1"><summary>All-time matchups (' + rows.length + ')</summary>' +
            '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
            '<th>Season</th><th>Wk</th>' +
            '<th class="num">' + Lib.esc(Lib.mname(a)) + '</th>' +
            '<th class="num">' + Lib.esc(Lib.mname(b)) + '</th><th></th>' +
            '</tr></thead><tbody>';
          rows.forEach(function (r) {
            var res = r.Result === 'W' ? '<span class="green"><b>W</b></span>' :
              (r.Result === 'L' ? '<span class="red"><b>L</b></span>' : Lib.esc(r.Result));
            h += '<tr><td>' + Lib.esc(r.Season) + '</td><td>' + Lib.esc(r.Week) + '</td>' +
              '<td class="num">' + Lib.fmt(r['Points For']) + '</td>' +
              '<td class="num">' + Lib.fmt(r['Points Against']) + '</td>' +
              '<td>' + res + '</td></tr>';
          });
          h += '</tbody></table></div></details>';
        } else {
          h += '<div class="muted mt1 center">No recorded meetings yet.</div>';
        }
        h += '</div>';
      });
      h += '</div></div>';
      return h;
    }
  };
})();
