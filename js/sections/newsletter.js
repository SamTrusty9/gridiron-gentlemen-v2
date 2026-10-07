/* Newsletter section: two routes.
 *   #newsletter    -> archive list of all newsletters (newest first)
 *   #newsletter/N  -> detail view; N is the 1-based index into the stored
 *                     (oldest-first) array. Body HTML is rendered as-is inside
 *                     a .nl container (bodies carry their own nl-* classes).
 */
window.Sections = window.Sections || {};

(function () {
  'use strict';

  function weekLabel(week) {
    return week === 0 ? 'Pre-Draft' : 'Week ' + week;
  }

  function archiveHTML(Lib, items) {
    var h = '<div class="wrap">';
    h += '<div class="page-head"><h1 class="page-title">The Gentlemen\u2019s Gazette</h1>' +
      '<div class="page-sub">The league newsletter archive &mdash; six editions and counting.</div></div>';
    h += '<div class="grid mt1">';
    for (var i = items.length - 1; i >= 0; i--) {
      var x = items[i];
      h += '<div class="card"><div class="card-t">' + Lib.esc(x.title) + '</div>' +
        '<div class="mt1"><span class="chip gold">' + Lib.esc(weekLabel(x.week)) + '</span> ' +
        '<span class="muted">' + Lib.esc(x.date) + ' &middot; Season ' + Lib.esc(x.season) + '</span></div>' +
        '<div class="mt1">' + Lib.navLink('newsletter/' + (i + 1), 'Read edition &rarr;') + '</div></div>';
    }
    h += '</div></div>';
    return h;
  }

  function detailHTML(Lib, items, n) {
    var it = items[n - 1];
    var h = '<div class="wrap">';
    if (!it) {
      h += '<div class="page-head"><div class="page-sub">' +
        Lib.navLink('newsletter', '&larr; All newsletters') + '</div>' +
        '<h1 class="page-title">Edition not found</h1></div>' +
        '<div class="card"><div class="muted">There is no newsletter edition #' + Lib.esc(n) + '.</div></div>';
      return h + '</div>';
    }
    h += '<div class="page-head"><div class="page-sub">' +
      Lib.navLink('newsletter', '&larr; All newsletters') + '</div>' +
      '<h1 class="page-title">' + Lib.esc(it.title) + '</h1>' +
      '<div class="page-sub">' + Lib.esc(it.date) + ' &middot; Season ' + Lib.esc(it.season) +
      ' &middot; ' + Lib.esc(weekLabel(it.week)) + '</div></div>';
    h += '<div class="nl">' + it.body + '</div>';
    h += '<div class="mt2">' + Lib.navLink('newsletter', '&larr; Back to the archive') + '</div>';
    return h + '</div>';
  }

  Sections.newsletter = {
    nav: 'Newsletter',
    icon: '\uD83D\uDCF0',
    render: function (ctx) {
      var D = ctx.D, Lib = ctx.Lib;
      var params = ctx.params || [];
      var items = (D.newsletters && D.newsletters.newsletters) || [];
      var n = parseInt(params[0], 10);
      if (params[0] && !isNaN(n)) return detailHTML(Lib, items, n);
      return archiveHTML(Lib, items);
    }
  };
})();
