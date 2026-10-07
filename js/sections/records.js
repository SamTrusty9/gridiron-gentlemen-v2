/* Records / Hall of Fame section.
 * Renders from D.records: hofRecords cards, top-10 single-week team scores,
 * top-10 single-week player performances, best-by-position medals,
 * seasonal PF top-5/bottom-5, league extremes, and most bench points.
 */
window.Sections = window.Sections || {};

(function () {
  'use strict';

  function holderHTML(Lib, id) {
    if (!id || id === 'None') return '<span class="muted">League-wide</span>';
    return Lib.avatar(id, 'sm') + ' <b>' + Lib.esc(Lib.mname(id)) + '</b>';
  }

  /* Display names in tables (e.g. "Chase Potter") get an avatar when they map to a manager id. */
  function nameCell(Lib, D, name) {
    var nm = (D.meta && D.meta.nameToId) || {};
    var id = nm[name];
    return (id ? Lib.avatar(id, 'sm') + ' ' : '') + Lib.esc(name);
  }

  function medalDot(Lib, pos) {
    var c = (Lib.medalColor && Lib.medalColor[pos]) || (pos === 'K' ? '#d4a72c' : '#8a99ad');
    return '<span class="medal-dot" style="background:' + Lib.esc(c) + '">' +
      Lib.esc(String(pos).charAt(0)) + '</span>';
  }

  function extremesCard(Lib, D, title, games, statKey, prefix) {
    var h = '<div class="card"><div class="card-t">' + Lib.esc(title) + '</div>';
    (games || []).forEach(function (g, i) {
      h += '<div class="row"><div><span class="muted">' + (i + 1) + '. ' +
        Lib.esc(g.season) + ' &middot; Wk ' + Lib.esc(g.week) + '</span><br>' +
        Lib.avatar(g.winner, 'sm') + ' ' + Lib.esc(Lib.mname(g.winner)) +
        ' <b>' + Lib.fmt(g.winnerScore) + '</b>' +
        ' <span class="muted">def.</span> ' +
        Lib.avatar(g.loser, 'sm') + ' ' + Lib.esc(Lib.mname(g.loser)) +
        ' <b>' + Lib.fmt(g.loserScore) + '</b></div>' +
        '<div><span class="chip">' + prefix + Lib.fmt(g[statKey]) + '</span></div></div>';
    });
    return h + '</div>';
  }

  function pfTable(Lib, title, rows, emptyNote) {
    var h = '<div class="card"><div class="card-t">' + Lib.esc(title) + '</div>';
    h += '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Manager</th><th>Season</th>' +
      '<th>Record</th><th class="num">PF</th></tr></thead><tbody>';
    (rows || []).forEach(function (r) {
      h += '<tr><td>' + holderHTML(Lib, r.id) + '</td><td>' + Lib.esc(r.season) + '</td>' +
        '<td class="mono">' + Lib.esc(r.record) + '</td>' +
        '<td class="num"><b>' + Lib.fmt(r.pf, 1) + '</b></td></tr>';
    });
    if (!(rows || []).length) h += '<tr><td colspan="4" class="muted">' + Lib.esc(emptyNote) + '</td></tr>';
    return h + '</tbody></table></div></div>';
  }

  Sections.records = {
    nav: 'Records',
    icon: '\uD83C\uDFC6',
    render: function (ctx) {
      var D = ctx.D, Lib = ctx.Lib;
      var R = D.records || {};
      var h = '<div class="wrap">';
      h += '<div class="page-head"><h1 class="page-title">Hall of Fame</h1>' +
        '<div class="page-sub">Every record in the Gridiron Gentlemen\u2019s Society books, 2023&ndash;present.</div></div>';

      /* --- League record cards --- */
      h += '<h2 class="mt2">League Records</h2><div class="grid mt1">';
      (R.hofRecords || []).forEach(function (r) {
        h += '<div class="card"><div class="card-t">' + Lib.esc(r.label) + '</div>' +
          '<div class="mt1">' + holderHTML(Lib, r.holder) + '</div>' +
          '<div class="muted mt1">' + Lib.esc(r.detail) + '</div></div>';
      });
      h += '</div>';

      /* --- Top-10 single-week team scores --- */
      h += '<h2 class="mt2">Top 10 Single-Week Team Scores</h2>';
      h += '<div class="tbl-wrap mt1"><table class="tbl"><thead><tr>' +
        '<th>#</th><th>Season</th><th>Week</th><th>Team</th><th>Opponent</th>' +
        '<th class="num">Points</th></tr></thead><tbody>';
      (R.hofTopTeamScores || []).forEach(function (t) {
        h += '<tr' + (t.rank === 1 ? ' class="hl"' : '') + '><td>' + Lib.esc(t.rank) + '</td>' +
          '<td>' + Lib.esc(t.season) + '</td><td>' + Lib.esc(t.week) + '</td>' +
          '<td>' + nameCell(Lib, D, t.team) + '</td>' +
          '<td>' + nameCell(Lib, D, t.opponent) + '</td>' +
          '<td class="num"><b>' + Lib.fmt(t.points) + '</b></td></tr>';
      });
      h += '</tbody></table></div>';

      /* --- Top-10 single-week player performances --- */
      h += '<h2 class="mt2">Top 10 Single-Week Player Performances</h2>';
      h += '<div class="tbl-wrap mt1"><table class="tbl"><thead><tr>' +
        '<th>#</th><th>Season</th><th>Week</th><th>Player</th><th>Pos</th><th>Team</th>' +
        '<th class="num">Points</th></tr></thead><tbody>';
      (R.hofTopPlayerPerformances || []).forEach(function (p) {
        h += '<tr' + (p.rank === 1 ? ' class="hl"' : '') + '><td>' + Lib.esc(p.rank) + '</td>' +
          '<td>' + Lib.esc(p.season) + '</td><td>' + Lib.esc(p.week) + '</td>' +
          '<td><b>' + Lib.esc(p.player) + '</b></td>' +
          '<td>' + medalDot(Lib, p.position) + ' <span class="chip">' + Lib.esc(p.position) + '</span></td>' +
          '<td>' + nameCell(Lib, D, p.team) + '</td>' +
          '<td class="num"><b>' + Lib.fmt(p.points) + '</b></td></tr>';
      });
      h += '</tbody></table></div>';

      /* --- Best by position --- */
      h += '<h2 class="mt2">Best Single Week by Position</h2><div class="grid mt1">';
      (R.hofByPosition || []).forEach(function (p) {
        h += '<div class="card"><div class="row"><div>' + medalDot(Lib, p.position) +
          ' <b>' + Lib.esc(p.position) + '</b></div>' +
          '<div class="stat-v">' + Lib.fmt(p.points) + '</div></div>' +
          '<div class="card-t mt1">' + Lib.esc(p.player) + '</div>' +
          '<div class="muted">' + Lib.esc(p.season) + ' &middot; Week ' + Lib.esc(p.week) + '</div></div>';
      });
      h += '</div>';

      /* --- Seasonal PF extremes --- */
      h += '<h2 class="mt2">Season Points-For Extremes</h2><div class="two-col mt1">';
      var spf = R.seasonalPFRecords || {};
      h += pfTable(Lib, 'Most Points For \u2014 Single Season', spf.top5, 'No data.');
      h += pfTable(Lib, 'Fewest Points For \u2014 Single Season', spf.bottom5, 'No data.');
      h += '</div>';

      /* --- League extremes --- */
      h += '<h2 class="mt2">League Extremes</h2><div class="grid mt1">';
      var lg = R.leagueGames || {};
      h += extremesCard(Lib, D, 'Biggest Blowouts', lg.blowouts, 'margin', '+');
      h += extremesCard(Lib, D, 'Closest Games', lg.closest, 'margin', '');
      h += extremesCard(Lib, D, 'Highest-Scoring Games', lg.highestScoring, 'total', '');
      h += extremesCard(Lib, D, 'Lowest-Scoring Games', lg.lowestScoring, 'total', '');
      h += '</div>';

      /* --- Most bench points --- */
      h += '<h2 class="mt2">Most Bench Points in a Single Week</h2>';
      h += '<div class="tbl-wrap mt1"><table class="tbl"><thead><tr>' +
        '<th>#</th><th>Manager</th><th>Season</th><th>Week</th>' +
        '<th class="num">Bench Pts</th><th>Result</th></tr></thead><tbody>';
      ((R.benchPoints && R.benchPoints.global) || []).slice(0, 10).forEach(function (b, i) {
        var res = b.result === 'W' ? '<span class="green"><b>W</b></span>' :
          (b.result === 'L' ? '<span class="red"><b>L</b></span>' : Lib.esc(b.result));
        h += '<tr><td>' + (i + 1) + '</td><td>' + holderHTML(Lib, b.manager) + '</td>' +
          '<td>' + Lib.esc(b.season) + '</td><td>' + Lib.esc(b.week) + '</td>' +
          '<td class="num"><b>' + Lib.fmt(b.benchPoints) + '</b></td><td>' + res + '</td></tr>';
      });
      h += '</tbody></table></div>';

      return h + '</div>';
    }
  };
})();
