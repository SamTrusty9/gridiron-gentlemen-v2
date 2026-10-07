/* Gridiron Gentlemen's Society — Constitution section
   Renders rules.json generically: overview fact grid + a card per rule key. */
(function () {
  'use strict';
  window.Sections = window.Sections || {};

  var ORDER = ['schedule', 'playoffFormat', 'payouts', 'waivers', 'trades',
    'draftOrder', 'buyInDeadline', 'gamblingRule', 'keepers'];
  var TITLES = {
    schedule: 'Schedule', playoffFormat: 'Playoff Format', payouts: 'Payouts',
    waivers: 'Waivers', trades: 'Trades', draftOrder: 'Draft Order',
    buyInDeadline: 'Buy-In Deadline', gamblingRule: 'Gambling Rule', keepers: 'Keepers'
  };
  var OVERVIEW_LABELS = {
    founded: 'Founded', managers: 'Managers', format: 'Format',
    regSeasonWeeks: 'Regular Season', playoffField: 'Playoff Field',
    buyIn: 'Buy-In', champions: 'Champions'
  };

  function humanize(key) {
    return String(key).replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/_/g, ' ')
      .replace(/^./, function (c) { return c.toUpperCase(); });
  }

  Sections.constitution = {
    nav: 'Constitution',
    icon: '📜',
    render: function (ctx) {
      var D = ctx.D || {}, Lib = ctx.Lib || {};
      var esc = function (v) { return Lib.esc ? Lib.esc(String(v == null ? '' : v)) : String(v == null ? '' : v); };

      var rules = (D.rules && D.rules.rules) || {};
      var ov = rules.overview || {};

      // ---- Overview fact grid ----
      var ovStats = Object.keys(OVERVIEW_LABELS).map(function (k) {
        var v = ov[k];
        if (v == null || v === '') return '';
        if (k === 'buyIn') v = '$' + v;
        if (k === 'regSeasonWeeks') v = v + ' weeks';
        return '<div class="stat"><div class="stat-v">' + esc(v) + '</div>' +
          '<div class="stat-l">' + esc(OVERVIEW_LABELS[k]) + '</div></div>';
      }).join('');

      // ---- Generic value renderer ----
      function renderValue(v) {
        if (v == null) return '<p class="muted">—</p>';
        if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
          return '<p>' + esc(v) + '</p>';
        }
        if (Array.isArray(v)) {
          if (!v.length) return '<p class="muted">—</p>';
          // Array of pairs -> two-column table (e.g. payouts)
          if (v.every(function (x) { return Array.isArray(x); })) {
            var rows = v.map(function (pair) {
              return '<tr><td>' + esc(pair[0]) + '</td><td class="num"><strong>' + esc(pair[1]) + '</strong></td></tr>';
            }).join('');
            return '<div class="tbl-wrap"><table class="tbl"><tbody>' + rows + '</tbody></table></div>';
          }
          // Array of objects -> rows
          if (v.every(function (x) { return x && typeof x === 'object'; })) {
            return v.map(function (o) {
              // Known schedule shape: {weeks, type, desc}
              if (o.weeks && o.type) {
                return '<div class="row"><div><strong>' + esc(o.weeks) + '</strong> ' +
                  '<span class="chip">' + esc(o.type) + '</span>' +
                  (o.desc ? '<div class="muted">' + esc(o.desc) + '</div>' : '') + '</div></div>';
              }
              var cells = Object.keys(o).map(function (k) {
                return '<div class="row"><span class="muted">' + esc(humanize(k)) + '</span>' +
                  '<span>' + esc(o[k]) + '</span></div>';
              }).join('');
              return '<div class="card-sub mt1">' + cells + '</div>';
            }).join('');
          }
          // Array of scalars -> list
          return '<ul>' + v.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
        }
        // Plain object -> definition rows
        var rows2 = Object.keys(v).map(function (k) {
          return '<div class="row"><span class="muted">' + esc(humanize(k)) + '</span>' +
            '<span>' + esc(v[k]) + '</span></div>';
        }).join('');
        return '<div>' + rows2 + '</div>';
      }

      var cards = ORDER.filter(function (k) { return rules[k] !== undefined; }).map(function (k) {
        return '<div class="card mt2"><div class="card-t">' + esc(TITLES[k] || humanize(k)) + '</div>' +
          renderValue(rules[k]) + '</div>';
      }).join('');

      // Any extra keys not in the known order get a card too
      var extra = Object.keys(rules).filter(function (k) {
        return k !== 'overview' && ORDER.indexOf(k) === -1;
      }).map(function (k) {
        return '<div class="card mt2"><div class="card-t">' + esc(humanize(k)) + '</div>' +
          renderValue(rules[k]) + '</div>';
      }).join('');

      return '' +
        '<div class="page-head"><div class="page-title">League Constitution</div>' +
        '<div class="page-sub">The rules that govern the Gridiron Gentlemen\'s Society</div></div>' +
        '<div class="card"><div class="card-t">Overview</div>' +
        '<div class="stats">' + ovStats + '</div></div>' +
        cards + extra;
    }
  };
})();
