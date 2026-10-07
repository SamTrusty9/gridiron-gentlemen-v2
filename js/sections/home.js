/* Gridiron Gentlemen's Society — Home section
   Hero, This-Week matchups, 2026 standings, power rankings, quick links. */
(function () {
  'use strict';
  window.Sections = window.Sections || {};

  Sections.home = {
    nav: 'Home',
    icon: '🏠',
    render: function (ctx) {
      var D = ctx.D || {}, Lib = ctx.Lib || {};
      var esc = function (v) { return Lib.esc ? Lib.esc(String(v == null ? '' : v)) : String(v == null ? '' : v); };
      var NL = function (route, label) {
        return Lib.navLink ? Lib.navLink(route, label) : '<a href="#/' + route + '">' + esc(label) + '</a>';
      };
      var F1 = function (n) { return Lib.fmt ? Lib.fmt(n, 1) : Number(n).toFixed(1); };

      var meta = D.meta || {}, league = meta.league || {};
      var week = meta.currentWeek2026 || 5;
      var seasonNo = (meta.seasons || []).indexOf(2026) + 1 || 4;

      var mgrs = (D.managers && D.managers.managers) || [];
      var mgrById = {};
      mgrs.forEach(function (m) { mgrById[m.id] = m; });
      var M = function (id) { return (Lib.mname && Lib.mname(id)) || (mgrById[id] && mgrById[id].name) || id; };
      var DV = function (id) {
        var m = mgrById[id];
        if (!m || !m.division) return '';
        return Lib.divName ? Lib.divName(m.division) : 'Division ' + m.division;
      };

      // ---- 2026 standings rows (filter out the junk "Source:" row) ----
      var allRows = ((D.standings && D.standings.seasonTotals) || [])
        .filter(function (r) { return /^\d+$/.test(String(r.Season)); });
      var rows26 = allRows.filter(function (r) { return Number(r.Season) === 2026; });
      var nameToId = meta.nameToId || {};
      var recById = {};
      rows26.forEach(function (r) { var id = nameToId[r.Manager]; if (id) recById[id] = r; });
      var winsOf = function (rec) {
        if (Lib.wl) { try { return Lib.wl(rec).w; } catch (e) {} }
        var p = String(rec || '').split('-');
        return parseInt(p[0], 10) || 0;
      };
      var sorted = rows26.slice().sort(function (a, b) {
        return (winsOf(b.Record) - winsOf(a.Record)) || (Number(b.PF) - Number(a.PF));
      });

      // ---- This Week matchups ----
      var games = (((D.schedule || {}).schedule2026 || {})[String(week)]) || [];
      var matchupCards = games.map(function (g) {
        var aR = recById[g.awayManagerId], hR = recById[g.homeManagerId];
        var teamRow = function (team, mid, rec, tag) {
          return '<div class="row"><div><strong>' + esc(team) + '</strong>' +
            '<div class="muted">' + esc(M(mid)) + (rec ? ' · ' + esc(rec.Record) : '') + '</div></div>' +
            '<span class="chip">' + tag + '</span></div>';
        };
        return '<div class="card">' + teamRow(g.away, g.awayManagerId, aR, 'AWAY') +
          teamRow(g.home, g.homeManagerId, hR, 'HOME') + '</div>';
      }).join('');

      // ---- Standings table ----
      var streakCls = function (s) {
        s = String(s || '');
        return s.charAt(0) === 'W' ? 'green' : (s.charAt(0) === 'L' ? 'red' : '');
      };
      var standRows = sorted.map(function (r, i) {
        var id = nameToId[r.Manager];
        var div = id && mgrById[id] ? mgrById[id].division : '';
        return '<tr>' +
          '<td class="num">' + (i + 1) + '</td>' +
          '<td>' + (id ? NL('franchise/' + id, r['Team Name']) : esc(r['Team Name'])) + '</td>' +
          '<td>' + esc(r.Manager) + '</td>' +
          '<td>' + esc(div) + '</td>' +
          '<td class="num">' + esc(r.Record) + '</td>' +
          '<td class="num">' + F1(r.PF) + '</td>' +
          '<td class="num">' + F1(r.PA) + '</td>' +
          '<td class="' + streakCls(r.Streak) + '">' + esc(r.Streak) + '</td>' +
          '</tr>';
      }).join('');

      // ---- Power rankings ----
      var pr = (D.standings && D.standings.powerRankings2026) || {};
      var trendArrow = function (t) {
        if (t === 'up') return '<span class="green">▲</span>';
        if (t === 'down') return '<span class="red">▼</span>';
        return '<span class="muted">▬</span>';
      };
      var prRows = ((pr.rankings) || []).map(function (r) {
        var av = Lib.avatar ? Lib.avatar(r.managerId, 'sm') : '';
        return '<div class="row"><div>' + av +
          '<span class="num" style="display:inline-block;min-width:2em">' + r.rank + '.</span> ' +
          '<strong>' + esc(r.team) + '</strong> <span class="muted">' + esc(M(r.managerId)) + '</span></div>' +
          '<span>' + trendArrow(r.trend) + '</span></div>';
      }).join('');

      // ---- Quick links ----
      var links = [
        ['constitution', '📜', 'Constitution'],
        ['results', '🏆', 'Results'],
        ['franchises', '👥', 'Franchises'],
        ['records', '📊', 'Records'],
        ['drafts', '🎯', 'Drafts'],
        ['rivalries', '⚔️', 'Rivalries'],
        ['divisions', '🗺️', 'Divisions'],
        ['players', '🏃', 'Players'],
        ['bets', '💰', 'Bets'],
        ['newsletter', '📰', 'Newsletter'],
        ['fame', '⭐', 'Fame']
      ];
      var quickLinks = links.map(function (l) {
        return '<a class="card" href="#/' + l[0] + '"><div class="card-t">' + l[1] + ' ' + esc(l[2]) + '</div></a>';
      }).join('');

      return '' +
        '<div class="hero"><div class="hero-inner">' +
          '<img class="hero-logo" src="assets/logo-badge.png" alt="League badge">' +
          '<div><div class="page-title">' + esc(league.name || 'The Gridiron Gentlemen\'s Society') + '</div>' +
          '<div class="page-sub">' + esc(league.motto || '') + '</div></div>' +
          '<div class="mt1"><span class="chip gold">Season ' + seasonNo + ' · Week ' + week + '</span> ' +
          (meta.tradeDeadline ? '<span class="chip">Trade deadline · ' + esc(meta.tradeDeadline) + '</span>' : '') +
          '</div>' +
        '</div></div>' +

        '<div class="page-head"><div class="page-title">This Week</div>' +
        '<div class="page-sub">Week ' + week + ' matchups</div></div>' +
        '<div class="grid">' + matchupCards + '</div>' +

        '<div class="page-head"><div class="page-title">2026 Standings</div></div>' +
        '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
        '<th class="num">#</th><th>Team</th><th>Manager</th><th>Div</th>' +
        '<th class="num">W-L-T</th><th class="num">PF</th><th class="num">PA</th><th>Streak</th>' +
        '</tr></thead><tbody>' + standRows + '</tbody></table></div>' +

        '<div class="grid mt2">' +
          '<div class="card"><div class="card-t">Power Rankings</div>' +
          '<div class="card-sub">' + esc(pr.asOfLabel || '') + '</div>' + prRows + '</div>' +
          '<div class="card"><div class="card-t">League</div><div class="card-sub">Divisions</div>' +
            ['I', 'II', 'III'].map(function (d) {
              var n = ((D.divisions && D.divisions.divisions && D.divisions.divisions[d] && D.divisions.divisions[d].members) || []).length;
              return '<div class="row"><span>' + esc(Lib.divName ? Lib.divName(d) : 'Division ' + d) + '</span>' +
                '<span class="muted">' + n + ' managers</span></div>';
            }).join('') +
            '<div class="muted mt1">' + mgrs.length + ' managers · full breakdown in ' + NL('divisions', 'Divisions') + '</div>' +
          '</div>' +
        '</div>' +

        '<div class="page-head"><div class="page-title">Explore</div></div>' +
        '<div class="grid">' + quickLinks + '</div>';
    }
  };
})();
