/* Gridiron Gentlemen's Society — Results section
   Season tabs (2023/2024/2025): final standings, playoff bracket,
   championship summary, awards. All seasons render at once; tabs toggle panes. */
(function () {
  'use strict';
  window.Sections = window.Sections || {};

  var SEASONS = ['2023', '2024', '2025'];
  var DEFAULT_SEASON = '2025';
  var AWARD_LABELS = {
    champion: 'Champion', regSeasonChamp: 'Regular Season Champion',
    lastPlace: 'Last Place', bestDraft: 'Best Draft', bestGM: 'Best GM'
  };

  // Tab switcher (defined once; inline onclick handlers call it)
  if (!window.GG_resultsTab) {
    window.GG_resultsTab = function (season, btn) {
      var root = btn.closest('.gg-results');
      if (!root) return;
      var tabs = root.querySelectorAll('.tab');
      for (var i = 0; i < tabs.length; i++) tabs[i].classList.toggle('on', tabs[i] === btn);
      var panes = root.querySelectorAll('[data-pane]');
      for (var j = 0; j < panes.length; j++) {
        panes[j].style.display = panes[j].getAttribute('data-pane') === season ? '' : 'none';
      }
    };
  }

  Sections.results = {
    nav: 'Results',
    icon: '🏆',
    render: function (ctx) {
      var D = ctx.D || {}, Lib = ctx.Lib || {};
      var esc = function (v) { return Lib.esc ? Lib.esc(String(v == null ? '' : v)) : String(v == null ? '' : v); };
      var F1 = function (n) { return Lib.fmt ? Lib.fmt(n, 1) : Number(n).toFixed(1); };
      var NL = function (route, label) {
        return Lib.navLink ? Lib.navLink(route, label) : '<a href="#/' + route + '">' + esc(label) + '</a>';
      };

      var meta = D.meta || {};
      var nameToId = meta.nameToId || {};
      var mgrs = (D.managers && D.managers.managers) || [];
      var mgrById = {};
      mgrs.forEach(function (m) { mgrById[m.id] = m; });
      var M = function (id) { return (Lib.mname && Lib.mname(id)) || (mgrById[id] && mgrById[id].name) || id; };

      var allRows = ((D.standings && D.standings.seasonTotals) || [])
        .filter(function (r) { return /^\d+$/.test(String(r.Season)); });
      var winsOf = function (rec) {
        if (Lib.wl) { try { return Lib.wl(rec).w; } catch (e) {} }
        var p = String(rec || '').split('-');
        return parseInt(p[0], 10) || 0;
      };

      var brackets = (D.brackets && D.brackets.brackets) || {};
      var champSummary = (D.brackets && D.brackets.championshipSummary) || {};
      var awards = (D.brackets && D.brackets.awards) || {};

      // One participant row inside a bracket matchup
      function bteam(seed, id, winnerId) {
        var isWin = id === winnerId;
        return '<div class="bteam' + (isWin ? ' win' : '') + '">' +
          (seed != null ? '<span class="bseed">' + esc(seed) + '</span> ' : '') +
          esc(M(id)) + '</div>';
      }
      function bmatch(home, away, winnerId, label) {
        return '<div class="bmatch">' +
          (label ? '<div class="card-sub">' + esc(label) + '</div>' : '') +
          bteam(home.seed, home.id, winnerId) +
          bteam(away.seed, away.id, winnerId) +
          '</div>';
      }

      function seasonPane(season) {
        // ---- Final standings ----
        var rows = allRows.filter(function (r) { return String(r.Season) === season; })
          .sort(function (a, b) { return (winsOf(b.Record) - winsOf(a.Record)) || (Number(b.PF) - Number(a.PF)); });
        var teamById = {};
        rows.forEach(function (r) { var id = nameToId[r.Manager]; if (id) teamById[id] = r['Team Name']; });
        var label = function (id) {
          return esc(M(id)) + (teamById[id] ? ' <span class="muted">(' + esc(teamById[id]) + ')</span>' : '');
        };
        var standRows = rows.map(function (r, i) {
          return '<tr><td class="num">' + (i + 1) + '</td>' +
            '<td>' + esc(r['Team Name']) + '</td><td>' + esc(r.Manager) + '</td>' +
            '<td class="num">' + esc(r.Record) + '</td>' +
            '<td class="num">' + F1(r.PF) + '</td><td class="num">' + F1(r.PA) + '</td></tr>';
        }).join('');

        // ---- Playoff bracket ----
        var b = brackets[season] || {};
        var seedOf = {};
        Object.keys(b.seeds || {}).forEach(function (s) { seedOf[b.seeds[s]] = s; });
        var byesNote = (b.byes || []).length
          ? '<p class="muted">First-round byes: ' + (b.byes || []).map(function (id) {
              return esc(M(id)) + ' (' + esc(seedOf[id] || '?') + ' seed)';
            }).join(', ') + '</p>' : '';
        var col = function (title, matches) {
          return '<div class="bround"><div class="card-sub"><strong>' + esc(title) + '</strong></div>' + matches + '</div>';
        };
        var r1 = (b.round1 || []).map(function (m) { return bmatch(m.home, m.away, m.winner); }).join('');
        var semis = (b.semis || []).map(function (m) { return bmatch(m.home, m.away, m.winner); }).join('');
        var champ = '';
        if (b.championship) {
          var c = b.championship;
          champ = bmatch({ seed: seedOf[c.home], id: c.home }, { seed: seedOf[c.away], id: c.away }, c.winner);
        }
        var place = '';
        if (b.third) place += bmatch({ id: b.third.home }, { id: b.third.away }, b.third.winner, '3rd Place');
        if (b.fifth) place += bmatch({ id: b.fifth.home }, { id: b.fifth.away }, b.fifth.winner, '5th Place');
        var champId = (b.championship && b.championship.winner) || null;
        var banner = champId
          ? '<div class="card center mt1"><span class="chip gold">🏆 ' + esc(season) + ' Champion</span>' +
            '<div class="card-t">' + label(champId) + '</div></div>' : '';

        // ---- Championship summary ----
        var cs = champSummary[season] || {};
        var lastName = cs.lastName || M(cs.last) || '';
        var summary = '<p>' +
          (cs.champion ? '<strong>' + esc(M(cs.champion)) + '</strong> defeated <strong>' + esc(M(cs.runnerUp)) + '</strong> to win the ' + esc(season) + ' championship. ' : '') +
          (cs.third ? 'Third place: ' + esc(M(cs.third)) + '. ' : '') +
          (cs.regSeasonFirst ? 'Regular-season champion: ' + esc(M(cs.regSeasonFirst)) + '. ' : '') +
          (lastName ? 'Last place: ' + esc(lastName) + '.' : '') +
          '</p>';

        // ---- Awards ----
        var aw = awards[season] || {};
        var awardRows = Object.keys(AWARD_LABELS).map(function (k) {
          var v = aw[k];
          if (v == null || v === '') return '';
          var display = (k === 'champion' || k === 'regSeasonChamp' || k === 'lastPlace') ? M(v) : v;
          if (k === 'lastPlace' && aw.lastPlaceName) display += ' (' + aw.lastPlaceName + ')';
          var na = String(v).toUpperCase() === 'N/A';
          return '<div class="row"><span class="muted">' + esc(AWARD_LABELS[k]) + '</span>' +
            '<span class="' + (na ? 'muted' : '') + '">' + esc(display) + '</span></div>';
        }).join('');

        return '' +
          '<div class="card"><div class="card-t">' + esc(season) + ' Final Standings</div>' +
          '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
          '<th class="num">#</th><th>Team</th><th>Manager</th><th class="num">W-L-T</th>' +
          '<th class="num">PF</th><th class="num">PA</th></tr></thead><tbody>' +
          standRows + '</tbody></table></div></div>' +
          banner +
          '<div class="card mt2"><div class="card-t">' + esc(season) + ' Playoffs</div>' + byesNote +
          '<div class="bracket">' +
            col('Round 1', r1) + col('Semifinals', semis) + col('Championship', champ) +
            (place ? col('Placement', place) : '') +
          '</div></div>' +
          '<div class="card mt2"><div class="card-t">Championship Summary</div>' + summary + '</div>' +
          '<div class="card mt2"><div class="card-t">Season Awards</div>' + (awardRows || '<p class="muted">—</p>') + '</div>';
      }

      var tabs = SEASONS.slice().reverse().map(function (s) {
        return '<button class="tab' + (s === DEFAULT_SEASON ? ' on' : '') + '" onclick="GG_resultsTab(\'' + s + '\',this)">' + s + '</button>';
      }).join('');
      var panes = SEASONS.map(function (s) {
        return '<div data-pane="' + s + '"' + (s === DEFAULT_SEASON ? '' : ' style="display:none"') + '>' +
          seasonPane(s) + '</div>';
      }).join('');

      return '' +
        '<div class="page-head"><div class="page-title">Season Results</div>' +
        '<div class="page-sub">Final standings, playoff brackets, and awards · 2023–2025</div></div>' +
        '<div class="gg-results"><div class="tabs">' + tabs + '</div><div class="mt2">' + panes + '</div></div>';
    }
  };
})();
