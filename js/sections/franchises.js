/* Gridiron Gentlemen's Society — Franchises section
   Route `franchises`: grid of 12 manager cards.
   Route `franchise/ID`: franchise detail (header, stats, year-by-year,
   records, blurb, head-to-head, lineup explorer). Lineup JSONs fetched lazily. */
(function () {
  'use strict';
  window.Sections = window.Sections || {};

  // ---------- shared helpers ----------
  function shared(ctx) {
    var D = ctx.D || {}, Lib = ctx.Lib || {};
    var esc = function (v) { return Lib.esc ? Lib.esc(String(v == null ? '' : v)) : String(v == null ? '' : v); };
    var NL = function (route, label) {
      return Lib.navLink ? Lib.navLink(route, label) : '<a href="#/' + route + '">' + esc(label) + '</a>';
    };
    var F1 = function (n) { return Lib.fmt ? Lib.fmt(n, 1) : Number(n).toFixed(1); };
    var mgrs = (D.managers && D.managers.managers) || [];
    var mgrById = {};
    mgrs.forEach(function (m) { mgrById[m.id] = m; });
    var M = function (id) { return (Lib.mname && Lib.mname(id)) || (mgrById[id] && mgrById[id].name) || id; };
    var AV = function (id, sz) { return Lib.avatar ? Lib.avatar(id, sz || '') : ''; };
    var divChip = function (d) {
      var label = Lib.divName ? Lib.divName(d) : 'Division ' + d;
      return '<span class="chip">' + esc(label) + '</span>';
    };
    return { D: D, Lib: Lib, esc: esc, NL: NL, F1: F1, mgrs: mgrs, mgrById: mgrById, M: M, AV: AV, divChip: divChip };
  }

  function careerRec(S, id) {
    var cr = (S.D.standings && S.D.standings.careerRecords) || [];
    for (var i = 0; i < cr.length; i++) if (cr[i].id === id) return cr[i];
    return null;
  }

  // ---------- list view ----------
  function listHTML(S) {
    var cards = S.mgrs.map(function (m) {
      var cr = careerRec(S, m.id);
      var line = cr ? (S.esc(cr.record) + ' career' + (cr.titles ? ' · ' + cr.titles + '× champ' : '')) : '';
      return '<a class="card" href="#/franchise/' + m.id + '">' +
        '<div class="row"><div>' + (Lib.mascot ? Lib.mascot(m.id) : Lib.crest(m.id)) + '</div>' + S.divChip(m.division) + '</div>' +
        '<div class="card-t">' + S.esc(m.name) + '</div>' +
        '<div class="card-sub">' + S.esc(m.team) + '</div>' +
        '<div class="muted">' + line + '</div></a>';
    }).join('');
    return '<div class="page-head"><div class="page-title">Franchises</div>' +
      '<div class="page-sub">The 12 managers of the Gridiron Gentlemen\'s Society</div></div>' +
      '<div class="grid">' + cards + '</div>';
  }

  // ---------- detail view ----------
  function detailHTML(S, id) {
    var m = S.mgrById[id];
    if (!m) return listHTML(S); // unknown id -> fall back to the list

    var fr = S.D.franchises || {};
    var yby = (fr.yearByYear || {})[id] || {};
    var blurb = (fr.franchiseBlurbs || {})[id] || [];
    var h2h = (fr.headToHead || {})[id] || {};
    var frec = (fr.franchiseRecords || {})[id] || {};
    var cr = careerRec(S, id) || {};
    var pr = ((S.D.brackets && S.D.brackets.playoffRecord) || []).filter(function (p) { return p.id === id; })[0] || {};

    var winpct = cr.winpct != null ? (Number(cr.winpct) * 100).toFixed(1) + '%' : '—';
    var stats = [
      ['Career Record', cr.record || '—'],
      ['Win %', winpct],
      ['Titles', cr.titles != null ? cr.titles : '—'],
      ['Playoff Apps', pr.apps != null ? pr.apps : '—'],
      ['Playoff Wins', cr.playoffWins != null ? cr.playoffWins : '—'],
      ['Champ. Apps', cr.champApps != null ? cr.champApps : '—'],
      ['Top-3 Finishes', cr.top3 != null ? cr.top3 : '—']
    ].map(function (s) {
      return '<div class="stat"><div class="stat-v">' + S.esc(s[1]) + '</div>' +
        '<div class="stat-l">' + S.esc(s[0]) + '</div></div>';
    }).join('');

    var bio = String(m.bio || '').split(/\n\n+/).map(function (p) {
      return '<p>' + S.esc(p) + '</p>';
    }).join('');

    var rivalLink = m.rivalId && S.mgrById[m.rivalId]
      ? S.NL('franchise/' + m.rivalId, '⚔️ Rival: ' + S.M(m.rivalId)) : '';

    var header = '<div class="card"><div class="two-col">' +
      '<div class="center">' + S.AV(id, 'lg') + '</div>' +
      '<div><div class="page-title">' + S.esc(m.name) + '</div>' +
      '<div class="card-sub">' + S.esc(m.team) + ' ' + S.divChip(m.division) + '</div>' +
      '<div class="mt1">' +
        (m.motto ? '<div><span class="muted">Motto:</span> “' + S.esc(m.motto) + '”</div>' : '') +
        (m.favoriteTeam ? '<div><span class="muted">Favorite NFL team:</span> ' + S.esc(m.favoriteTeam) + '</div>' : '') +
        (rivalLink ? '<div class="mt1">' + rivalLink + '</div>' : '') +
      '</div></div></div>' +
      (bio ? '<div class="mt2">' + bio + '</div>' : '') + '</div>';

    // ---- year-by-year ----
    var ybyRows = Object.keys(yby).sort().map(function (y) {
      var e = yby[y] || [];
      var played = e[2] ? '<span class="green">✓</span>' : '<span class="muted">–</span>';
      return '<tr><td class="num">' + S.esc(y) + '</td><td>' + S.esc(e[0] || '—') + '</td>' +
        '<td>' + S.esc(e[1] || '—') + '</td><td class="center">' + played + '</td></tr>';
    }).join('');

    // ---- franchise records highlights ----
    var mu = frec.mostUsedPlayer || {};
    var recStats = [
      ['Longest Win Streak', (frec.longestWinStreak != null ? frec.longestWinStreak + ' W' : '—'),
        frec.longestWinStreakSpan || ''],
      ['Longest Losing Streak', (frec.longestLossStreak != null ? frec.longestLossStreak + ' L' : '—'),
        frec.longestLossStreakSpan || ''],
      ['Most-Used Player', (mu.player || '—') + (mu.weeks ? ' · ' + mu.weeks + ' wks' : ''), ''],
      ['Total Moves', frec.totalMoves != null ? frec.totalMoves : '—', '']
    ].map(function (s) {
      return '<div class="stat"><div class="stat-v">' + S.esc(s[1]) + '</div>' +
        '<div class="stat-l">' + S.esc(s[0]) + '</div>' +
        (s[2] ? '<div class="muted">' + S.esc(s[2]) + '</div>' : '') + '</div>';
    }).join('');
    var topWeeks = ((frec.topTeamWeeks) || []).slice(0, 5).map(function (w) {
      return '<div class="row"><div><strong>' + S.F1(w.pf) + '</strong> <span class="muted">vs ' +
        S.esc(w.opponent) + ' · ' + S.esc(w.season) + ' Wk ' + S.esc(w.week) + '</span></div>' +
        '<span class="' + (w.result === 'W' ? 'green' : 'red') + '">' + S.esc(w.result) + '</span></div>';
    }).join('');
    var blurbRows = (Array.isArray(blurb) ? blurb : [blurb]).filter(Boolean).map(function (b) {
      return '<div class="row"><span>•</span><span>' + S.esc(b) + '</span></div>';
    }).join('');

    // ---- head-to-head ----
    var h2hRows = Object.keys(h2h).sort(function (a, b) {
      return S.M(a).localeCompare(S.M(b));
    }).map(function (opp) {
      var r = h2h[opp];
      return '<tr><td>' + S.NL('franchise/' + opp, S.M(opp)) + '</td>' +
        '<td class="num">' + r.w + '-' + r.l + '-' + r.t + '</td>' +
        '<td class="num">' + S.F1(r.avgPf) + '</td>' +
        '<td class="num">' + S.F1(r.avgPa) + '</td></tr>';
    }).join('');

    // ---- lineup explorer ----
    var seasons = ((S.D.meta && S.D.meta.seasons) || [2023, 2024, 2025, 2026]).slice();
    var cw = (S.D.meta && S.D.meta.currentWeek2026) || 5;
    var seasonOpts = seasons.map(function (s) {
      return '<option value="' + s + '"' + (s === 2026 ? ' selected' : '') + '>' + s + '</option>';
    }).join('');
    var lineup = '<div class="card mt2"><div class="card-t">Lineup Explorer</div>' +
      '<div class="card-sub">Weekly lineups, loaded on demand</div>' +
      '<div class="row"><div>' +
        '<label class="muted">Season </label><select id="gg-lu-s-' + id + '" onchange="GG_luSeason(\'' + id + '\')">' + seasonOpts + '</select> ' +
        '<label class="muted">Week </label><select id="gg-lu-w-' + id + '" onchange="GG_luWeek(\'' + id + '\')"></select>' +
      '</div></div>' +
      '<div id="gg-lu-out-' + id + '" data-cw="' + cw + '"><p class="muted">Loading…</p></div>' +
      '<img src="gg-lu-init.png" alt="" style="display:none" onerror="GG_luInit(\'' + id + '\')">' +
      '</div>';

    return '' +
      '<div class="page-head"><div class="page-title">Franchise</div>' +
      '<div class="page-sub">' + S.NL('franchises', '← All franchises') + '</div></div>' +
      header +
      '<div class="card mt2"><div class="card-t">Career Stats</div><div class="stats">' + stats + '</div></div>' +
      '<div class="card mt2"><div class="card-t">Year by Year</div>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
      '<th class="num">Season</th><th>Regular Season</th><th>Final Finish</th><th>Playoffs</th>' +
      '</tr></thead><tbody>' + ybyRows + '</tbody></table></div></div>' +
      '<div class="card mt2"><div class="card-t">Franchise Records</div><div class="stats">' + recStats + '</div>' +
      (topWeeks ? '<div class="card-sub mt1">Top Team Weeks</div>' + topWeeks : '') +
      (blurbRows ? '<div class="card-sub mt1">Notes</div>' + blurbRows : '') + '</div>' +
      '<div class="card mt2"><div class="card-t">Head-to-Head</div><div class="card-sub">All-time vs every franchise</div>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
      '<th>Opponent</th><th class="num">W-L-T</th><th class="num">Avg PF</th><th class="num">Avg PA</th>' +
      '</tr></thead><tbody>' + h2hRows + '</tbody></table></div></div>' +
      lineup;
  }

  // ---------- lineup explorer (lazy fetch) ----------
  if (!window.GG_luCache) window.GG_luCache = {};
  if (!window.GG_luFetch) {
    window.GG_luFetch = function (id) {
      if (window.GG_luCache[id]) return Promise.resolve(window.GG_luCache[id]);
      return fetch('data/lineups/' + id + '.json').then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      }).then(function (json) {
        window.GG_luCache[id] = json;
        return json;
      });
    };
  }
  if (!window.GG_luSeason) {
    window.GG_luSeason = function (id) {
      var sEl = document.getElementById('gg-lu-s-' + id);
      var wEl = document.getElementById('gg-lu-w-' + id);
      var out = document.getElementById('gg-lu-out-' + id);
      if (!sEl || !wEl || !out) return;
      var season = sEl.value;
      out.innerHTML = '<p class="muted">Loading…</p>';
      window.GG_luFetch(id).then(function (data) {
        var weeks = Object.keys(((data.seasons || {})[season]) || {})
          .map(Number).sort(function (a, b) { return a - b; });
        var cw = parseInt(out.getAttribute('data-cw') || '5', 10);
        var def = weeks.indexOf(cw) !== -1 ? cw : weeks[weeks.length - 1];
        wEl.innerHTML = weeks.map(function (w) {
          return '<option value="' + w + '"' + (w === def ? ' selected' : '') + '>Week ' + w + '</option>';
        }).join('');
        window.GG_luWeek(id);
      }).catch(function () {
        out.innerHTML = '<p class="muted">Lineup data unavailable.</p>';
      });
    };
  }
  if (!window.GG_luWeek) {
    window.GG_luWeek = function (id) {
      var sEl = document.getElementById('gg-lu-s-' + id);
      var wEl = document.getElementById('gg-lu-w-' + id);
      var out = document.getElementById('gg-lu-out-' + id);
      if (!sEl || !wEl || !out) return;
      var season = sEl.value, wk = wEl.value;
      window.GG_luFetch(id).then(function (data) {
        var g = ((data.seasons || {})[season] || {})[wk];
        if (!g) { out.innerHTML = '<p class="muted">No lineup data for ' + season + ' Week ' + wk + '.</p>'; return; }
        var esc = window.Lib && window.Lib.esc ? window.Lib.esc : function (v) { return String(v == null ? '' : v); };
        var starters = (g.players || []).filter(function (p) { return p.starter === 'Y'; });
        var rows = starters.map(function (p) {
          return '<tr><td>' + esc(p.player) + '</td><td>' + esc(p.slot || '') + '</td>' +
            '<td>' + esc(p.position) + '</td><td class="num">' + esc(p.points) + '</td></tr>';
        }).join('');
        var rc = g.result === 'W' ? 'green' : (g.result === 'L' ? 'red' : '');
        out.innerHTML =
          '<div class="row"><div><strong>vs ' + esc(g.opponent) + '</strong> ' +
          '<span class="' + rc + '">' + esc(g.result) + '</span></div>' +
          '<span class="mono">' + esc(g.pf) + ' – ' + esc(g.pa) + '</span></div>' +
          '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
          '<th>Player</th><th>Slot</th><th>Pos</th><th class="num">Pts</th>' +
          '</tr></thead><tbody>' + rows + '</tbody></table></div>';
      }).catch(function () {
        out.innerHTML = '<p class="muted">Lineup data unavailable.</p>';
      });
    };
  }
  if (!window.GG_luInit) {
    // Fired by a hidden img onerror (script tags in innerHTML don't execute).
    window.GG_luInit = function (id) { window.GG_luSeason(id); };
  }

  Sections.franchises = {
    nav: 'Franchises',
    icon: '👥',
    render: function (ctx) { return listHTML(shared(ctx)); }
  };
  Sections.franchise = {
    nav: 'Franchise',
    icon: '👤',
    render: function (ctx) {
      var S = shared(ctx);
      var params = ctx.params || [];
      return detailHTML(S, params[0]);
    }
  };
})();
