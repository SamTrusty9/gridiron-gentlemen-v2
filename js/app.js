/* Gridiron Gentlemen's Society — app shell.
   window.Sections is populated by js/sections/*.js, which load BEFORE this file.
   This file loads data, builds the nav from registered sections, and routes hashes. */
(function () {
  'use strict';

  window.Sections = window.Sections || {};
  var Sections = window.Sections;
  var Lib = window.Lib;

  var DATA_FILES = ['meta', 'managers', 'divisions', 'standings', 'drafts',
    'brackets', 'records', 'franchises', 'rivalries', 'bets', 'newsletters',
    'schedule', 'weekly', 'rules', 'fame', 'players'];

  /* Nav order (only registered sections appear). */
  var NAV_ORDER = ['home', 'results', 'franchises', 'records', 'drafts',
    'rivalries', 'divisions', 'players', 'bets', 'newsletter', 'fame', 'constitution'];

  /* hash head -> section key */
  var ROUTES = {
    '': 'home',
    'constitution': 'constitution',
    'results': 'results',
    'franchises': 'franchises',
    'records': 'records',
    'drafts': 'drafts',
    'rivalries': 'rivalries',
    'divisions': 'divisions',
    'players': 'players',
    'bets': 'bets',
    'newsletter': 'newsletter',
    'fame': 'fame'
  };

  var D = {};
  var app = document.getElementById('app');
  var nav = document.getElementById('nav');
  var leagueName = "The Gridiron Gentlemen's Society";

  function routeOf(sectionKey) {
    return sectionKey === 'home' ? '#' : '#' + sectionKey;
  }

  function buildNav() {
    if (!nav) return;
    var html = '';
    NAV_ORDER.forEach(function (key) {
      var sec = Sections[key];
      if (!sec) return; /* skip modules that aren't registered yet */
      var label = (sec.icon ? sec.icon + ' ' : '') + (sec.nav || key);
      html += '<a class="nav-link" data-sec="' + key + '" href="' + routeOf(key) + '">' + label + '</a>';
    });
    nav.innerHTML = html;
  }

  function markActive(sectionKey) {
    if (!nav) return;
    var links = nav.querySelectorAll('.nav-link');
    for (var i = 0; i < links.length; i++) {
      links[i].classList.toggle('on', links[i].getAttribute('data-sec') === sectionKey);
    }
  }

  function friendlyError(title, body) {
    return '<div class="page-head"><h1 class="page-title">' + Lib.esc(title) + '</h1></div>' +
      '<div class="card"><p>' + body + '</p>' +
      '<p><a class="btn" href="#">Back to home</a></p></div>';
  }

  function render() {
    var hash = (location.hash || '').replace(/^#\/?/, '');
    var parts = hash.split('/').filter(Boolean);
    var head = parts[0] || '';
    var params = [];
    var sectionKey = null;

    if (head === 'franchise') {           /* #franchise/ID -> franchises detail */
      sectionKey = 'franchises';
      params = [parts[1]];
    } else if (Object.prototype.hasOwnProperty.call(ROUTES, head)) {
      sectionKey = ROUTES[head];
      if (head === 'newsletter' && parts[1]) params = [parts[1]];
    }

    if (!sectionKey) {
      document.title = 'Not found · ' + leagueName;
      markActive('');
      app.innerHTML = friendlyError('Fourth and long…',
        'That page doesn&rsquo;t exist in the league archives. The playbook only goes so far.');
      window.scrollTo(0, 0);
      return;
    }

    var sec = Sections[sectionKey];
    if (head === 'franchise' && Sections.franchise) sec = Sections.franchise; /* detail renderer */
    markActive(sectionKey);
    document.title = (sectionKey === 'home' ? leagueName : (sec && sec.nav ? sec.nav + ' · ' : '') + leagueName);

    if (!sec || typeof sec.render !== 'function') {
      /* Known route, but its section module isn't built yet — tolerate gracefully. */
      app.innerHTML = friendlyError(sec && sec.nav ? sec.nav : 'Coming soon',
        'This section of the league site is still being built. Check back soon — the pads are on, the lights are warming up.');
      window.scrollTo(0, 0);
      return;
    }

    try {
      var ctx = { D: D, Lib: Lib, params: params };
      app.innerHTML = sec.render(ctx);
    } catch (err) {
      app.innerHTML = friendlyError('Fumbled the snap',
        'Something went wrong rendering this section. <span class="muted mono">' + Lib.esc(err.message || err) + '</span>');
    }
    window.scrollTo(0, 0);
  }

  function load() {
    app.innerHTML = '<p class="muted center mt2">Loading the league&hellip;</p>';
    Promise.all(DATA_FILES.map(function (n) {
      return fetch('data/' + n + '.json').then(function (r) {
        if (!r.ok) throw new Error('data/' + n + '.json → HTTP ' + r.status);
        return r.json();
      });
    })).then(function (results) {
      DATA_FILES.forEach(function (n, i) { D[n] = results[i]; });
      Lib.setData(D);
      try {
        leagueName = (D.meta && D.meta.league && D.meta.league.name) || leagueName;
      } catch (e) { /* keep default */ }
      buildNav();
      render();
    }).catch(function (err) {
      document.title = 'Offline · ' + leagueName;
      app.innerHTML =
        '<div class="page-head"><h1 class="page-title">The stadium lights are out</h1>' +
        '<p class="page-sub">We couldn&rsquo;t load the league data.</p></div>' +
        '<div class="card"><p>Check your connection and try again. ' +
        '<span class="muted mono">' + Lib.esc(err.message || err) + '</span></p>' +
        '<p><button class="btn" onclick="App.reload()">Try again</button></p></div>';
    });
  }

  window.addEventListener('hashchange', render);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* offline support is best-effort */ });
    });
  }

  window.App = {
    reload: function () { load(); },
    data: function () { return D; }
  };

  load();
})();
