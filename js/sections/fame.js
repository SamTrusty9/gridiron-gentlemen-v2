/* Wall of Fame: famous selfie cards (celebrity, date, location, managers
 * involved, note) plus the Position Medals section. Rule note: a medal goes
 * to the owner of the #1 fantasy finisher at that position each season.
 */
window.Sections = window.Sections || {};

(function () {
  'use strict';

  function medalColor(Lib, pos) {
    return (Lib.medalColor && Lib.medalColor[pos]) ||
      (pos === 'K' ? '#d4a72c' : '#8a99ad');
  }

  Sections.fame = {
    nav: 'Wall of Fame',
    icon: '\u2B50',
    render: function (ctx) {
      var D = ctx.D, Lib = ctx.Lib;
      var F = D.fame || {};

      var h = '<div class="wrap">';
      h += '<div class="page-head"><h1 class="page-title">Wall of Fame</h1>' +
        '<div class="page-sub">Celebrity encounters and the all-time position medals.</div></div>';

      /* --- Famous selfies --- */
      h += '<h2 class="mt2">Famous Selfies</h2><div class="grid mt1">';
      (F.famousSelfies || []).forEach(function (s) {
        h += '<div class="card"><div class="card-t">\uD83D\uDCF8 ' + Lib.esc(s.celebrity) + '</div>';
        h += '<div class="muted mt1">' + Lib.esc(s.dateDisplay || s.date || '') +
          (s.location ? ' &middot; ' + Lib.esc(s.location) : '') + '</div>';
        h += '<div class="row mt1"><div>';
        (s.managers || []).forEach(function (id) { h += Lib.avatar(id, 'sm') + ' '; });
        h += '</div></div>';
        if ((s.managers || []).length) {
          h += '<div class="mt1">' + (s.managers || []).map(function (id) {
            return Lib.esc(Lib.mname(id));
          }).join(', ') + '</div>';
        }
        if (s.note) h += '<div class="muted mt1">' + Lib.esc(s.note) + '</div>';
        h += '</div>';
      });
      if (!(F.famousSelfies || []).length) {
        h += '<div class="card"><div class="muted">No famous encounters on record yet.</div></div>';
      }
      h += '</div>';

      /* --- Position medals --- */
      h += '<h2 class="mt2">Position Medals</h2>';
      h += '<p class="muted">League rule: a medal goes to the owner of the #1 fantasy finisher ' +
        'at that position each season. These are the all-time best single-week medal performances.</p>';
      h += '<div class="grid mt1">';
      (F.medals || []).forEach(function (m) {
        var c = medalColor(Lib, m.position);
        h += '<div class="card"><div class="row"><div>' +
          '<span class="medal-dot" style="background:' + Lib.esc(c) + '">' +
          Lib.esc(String(m.position).charAt(0)) + '</span> ' +
          '<b>' + Lib.esc(m.position) + '</b></div>' +
          '<div class="stat-v">' + Lib.fmt(m.points) + '</div></div>' +
          '<div class="card-t mt1">' + Lib.esc(m.player) + '</div>' +
          '<div class="muted">' + Lib.esc(m.season) + ' &middot; Week ' + Lib.esc(m.week) + '</div></div>';
      });
      h += '</div>';

      return h + '</div>';
    }
  };
})();
