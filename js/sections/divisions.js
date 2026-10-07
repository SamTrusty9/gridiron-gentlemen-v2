/* Divisions section: division cards with members and title counts,
 * cross-division matrix table, division power periods, and intra-division records.
 */
window.Sections = window.Sections || {};

(function () {
  'use strict';

  var ORDER = ['I', 'II', 'III'];

  Sections.divisions = {
    nav: 'Divisions',
    icon: '\uD83D\uDEE1\uFE0F',
    render: function (ctx) {
      var D = ctx.D, Lib = ctx.Lib;
      var dv = D.divisions || {};
      var divs = dv.divisions || {};
      var dd = dv.divisionsData || {};
      var mgrs = (D.managers && D.managers.managers) || [];
      var divOf = {};
      mgrs.forEach(function (m) { divOf[m.id] = m.division; });

      var h = '<div class="wrap">';
      h += '<div class="page-head"><h1 class="page-title">Divisions</h1>' +
        '<div class="page-sub">Three divisions, four gentlemen each &mdash; battling for divisional supremacy.</div></div>';

      /* --- Division cards --- */
      h += '<div class="grid mt1">';
      ORDER.forEach(function (k) {
        var d = divs[k] || {};
        var titles = (dd.titles && dd.titles[k] != null) ? dd.titles[k] : 0;
        h += '<div class="card"><div class="card-t">' + Lib.esc(Lib.divName(k)) +
          ' <span class="chip gold">' + titles + ' \uD83C\uDFC6</span></div>';
        (d.members || []).forEach(function (id) {
          h += '<div class="row"><div>' + Lib.avatar(id, 'sm') + ' <b>' + Lib.esc(Lib.mname(id)) + '</b>' +
            '<br><span class="muted">' + Lib.esc(Lib.teamName(id)) + '</span></div></div>';
        });
        h += '</div>';
      });
      h += '</div>';
      if (dd.note) h += '<p class="muted mt1">' + Lib.esc(dd.note) + '</p>';

      /* --- Division totals --- */
      var comb = dd.combined || {};
      h += '<h2 class="mt2">All-Time Division Totals</h2>';
      h += '<div class="tbl-wrap mt1"><table class="tbl"><thead><tr>' +
        '<th>Division</th><th class="num">W</th><th class="num">L</th><th class="num">T</th>' +
        '<th class="num">Win%</th><th class="num">Titles</th>' +
        '<th class="num">PF</th><th class="num">PA</th></tr></thead><tbody>';
      ORDER.forEach(function (k) {
        var c = comb[k] || {};
        h += '<tr><td><b>' + Lib.esc(Lib.divName(k)) + '</b></td>' +
          '<td class="num">' + Lib.esc(c.w) + '</td>' +
          '<td class="num">' + Lib.esc(c.l) + '</td>' +
          '<td class="num">' + Lib.esc(c.t) + '</td>' +
          '<td class="num">' + Lib.fmt(c.winPct, 3) + '</td>' +
          '<td class="num">' + Lib.esc((dd.titles && dd.titles[k]) || 0) + '</td>' +
          '<td class="num">' + Lib.fmt(c.pf, 1) + '</td>' +
          '<td class="num">' + Lib.fmt(c.pa, 1) + '</td></tr>';
      });
      h += '</tbody></table></div>';

      /* --- Cross-division matrix --- */
      var m = dd.matrix || {};
      h += '<h2 class="mt2">Cross-Division Matrix</h2>' +
        '<div class="muted">Head-to-head record of each division (rows) against every division (columns).</div>';
      h += '<div class="tbl-wrap mt1"><table class="tbl"><thead><tr><th></th>';
      ORDER.forEach(function (c) { h += '<th class="center">' + Lib.esc(Lib.divName(c)) + '</th>'; });
      h += '</tr></thead><tbody>';
      ORDER.forEach(function (r) {
        h += '<tr><td><b>' + Lib.esc(Lib.divName(r)) + '</b></td>';
        ORDER.forEach(function (c) {
          var cell = (m[r] && m[r][c]) || {};
          h += '<td class="center"><b>' + Lib.esc(cell.w) + '&ndash;' + Lib.esc(cell.l) + '</b>' +
            (cell.t ? '&ndash;' + Lib.esc(cell.t) : '') +
            '<br><span class="muted">' + Lib.esc(cell.games) + ' games</span></td>';
        });
        h += '</tr>';
      });
      h += '</tbody></table></div>';

      /* --- Division power periods --- */
      var periods = (dv.divisionPowerData && dv.divisionPowerData.periods) || {};
      var pkeys = ['all', '2026', '2025', '2024', '2023'].filter(function (k) { return periods[k]; });
      if (pkeys.length) {
        h += '<h2 class="mt2">Division Power Rankings</h2><div class="two-col mt1">';
        pkeys.forEach(function (pk) {
          var per = periods[pk];
          var pdivs = per.divisions || {};
          var rank = ORDER.slice().sort(function (x, y) {
            return ((pdivs[y] && pdivs[y].winPct) || 0) - ((pdivs[x] && pdivs[x].winPct) || 0);
          });
          var label = pk === 'all' ? 'All-Time (2023\u20132026)' : 'Season ' + pk;
          h += '<div class="card"><div class="card-t">' + Lib.esc(label) + '</div>';
          rank.forEach(function (k, i) {
            var s = pdivs[k] || {};
            h += '<div class="row"><div><b>' + (i + 1) + '.</b> ' + Lib.esc(Lib.divName(k)) + '</div>' +
              '<div class="mono">' + Lib.esc(s.w) + '&ndash;' + Lib.esc(s.l) +
              ' <span class="muted">(' + Lib.fmt(s.winPct, 3) + ' &middot; ' + Lib.fmt(s.avgPF, 1) + ' PF/g)</span></div></div>';
          });
          h += '</div>';
        });
        h += '</div>';
      }

      /* --- Intra-division records --- */
      var intra = dv.intraDivisionRecord || {};
      var rows = Object.keys(intra).map(function (id) { return { id: id, r: intra[id] }; });
      rows.sort(function (a, b) { return (b.r.winPct || 0) - (a.r.winPct || 0); });
      h += '<h2 class="mt2">Intra-Division Records</h2>' +
        '<div class="muted">Each manager\u2019s record in games against their own division.</div>';
      h += '<div class="tbl-wrap mt1"><table class="tbl"><thead><tr>' +
        '<th>#</th><th>Manager</th><th>Division</th>' +
        '<th class="num">W</th><th class="num">L</th><th class="num">T</th>' +
        '<th class="num">Win%</th><th class="num">Games</th></tr></thead><tbody>';
      rows.forEach(function (o, i) {
        h += '<tr' + (i === 0 ? ' class="hl"' : '') + '><td>' + (i + 1) + '</td>' +
          '<td>' + Lib.avatar(o.id, 'sm') + ' <b>' + Lib.esc(Lib.mname(o.id)) + '</b></td>' +
          '<td>' + Lib.esc(divOf[o.id] ? Lib.divName(divOf[o.id]) : '\u2014') + '</td>' +
          '<td class="num">' + Lib.esc(o.r.w) + '</td>' +
          '<td class="num">' + Lib.esc(o.r.l) + '</td>' +
          '<td class="num">' + Lib.esc(o.r.t) + '</td>' +
          '<td class="num"><b>' + Lib.fmt(o.r.winPct, 3) + '</b></td>' +
          '<td class="num">' + Lib.esc(o.r.games) + '</td></tr>';
      });
      h += '</tbody></table></div>';

      return h + '</div>';
    }
  };
})();
