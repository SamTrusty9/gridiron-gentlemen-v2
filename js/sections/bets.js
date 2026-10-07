/* League bets section: one card per gamble with title, description,
 * type/status chips, odds, participants with stakes, bet date, settle-by, and result.
 * Renders a graceful empty state if there are no gambles on record.
 */
window.Sections = window.Sections || {};

(function () {
  'use strict';

  function fmtDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || '');
    if (!m) return s || 'TBD';
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[parseInt(m[2], 10) - 1] + ' ' + parseInt(m[3], 10) + ', ' + m[1];
  }

  Sections.bets = {
    nav: 'Bets',
    icon: '\uD83C\uDFB2',
    render: function (ctx) {
      var D = ctx.D, Lib = ctx.Lib;
      var gambles = (D.bets && D.bets.gambles) || [];

      var h = '<div class="wrap">';
      h += '<div class="page-head"><h1 class="page-title">League Bets</h1>' +
        '<div class="page-sub">Every wager on the league\u2019s books &mdash; the stakes, the odds, and who\u2019s in.</div></div>';

      if (!gambles.length) {
        h += '<div class="card"><div class="card-t">No bets on the books</div>' +
          '<div class="muted mt1">Nobody has put money where their mouth is yet. Check back after the next big mouth-off.</div></div>';
        return h + '</div>';
      }

      gambles.forEach(function (g) {
        var statusChip = g.status === 'open' ? '<span class="chip green">Open</span>' :
          '<span class="chip">' + Lib.esc(g.status || 'Unknown') + '</span>';

        h += '<div class="card mt1">';
        h += '<div class="card-t">' + Lib.esc(g.title) + '</div>';
        h += '<div class="mt1"><span class="chip gold">' + Lib.esc(g.type || 'bet') + '</span> ' +
          statusChip + (g.odds ? ' <span class="chip">Odds ' + Lib.esc(g.odds) + '</span>' : '') + '</div>';
        if (g.description) h += '<div class="mt1">' + Lib.esc(g.description) + '</div>';

        h += '<div class="stats mt1">';
        if (g.totalStake != null)
          h += '<div class="stat"><div class="stat-v">$' + Lib.fmt(g.totalStake) + '</div><div class="stat-l">Total staked</div></div>';
        if (g.totalPayout != null)
          h += '<div class="stat"><div class="stat-v">$' + Lib.fmt(g.totalPayout) + '</div><div class="stat-l">Total payout</div></div>';
        if (g.totalProfit != null)
          h += '<div class="stat"><div class="stat-v">$' + Lib.fmt(g.totalProfit) + '</div><div class="stat-l">Total profit</div></div>';
        h += '</div>';

        h += '<div class="card-sub mt1">Participants (' + (g.participants || []).length + ')</div>';
        (g.participants || []).forEach(function (p) {
          h += '<div class="row"><div>' + Lib.avatar(p.id, 'sm') + ' <b>' + Lib.esc(p.name) + '</b></div>' +
            '<div class="mono">$' + Lib.fmt(p.stake) + ' &rarr; $' + Lib.fmt(p.toWin) + '</div></div>';
        });

        h += '<div class="muted mt1">Bet placed ' + Lib.esc(fmtDate(g.betDate)) +
          ' &middot; Settles ' + Lib.esc(g.settleBy ? fmtDate(g.settleBy) : 'TBD') + '</div>';
        h += '<div class="mt1"><b>Result:</b> ' +
          (g.result ? Lib.esc(g.result) : '<span class="muted">Pending &mdash; not yet settled</span>') + '</div>';
        h += '</div>';
      });

      return h + '</div>';
    }
  };
})();
