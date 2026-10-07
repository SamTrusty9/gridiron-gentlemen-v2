/* Gridiron Gentlemen's Society — shared helpers.
   Defines window.Lib. Call Lib.setData(D) after the JSON is loaded so the
   manager lookup helpers can resolve. Vanilla JS, no dependencies. */
(function () {
  'use strict';

  var _data = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function managers() {
    return (_data && _data.managers && _data.managers.managers) || [];
  }

  function mgr(id) {
    if (!id) return null;
    var list = managers();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function mname(id) {
    var m = mgr(id);
    return m ? m.name : String(id || '');
  }

  function teamName(id) {
    var m = mgr(id);
    return m ? (m.team || m.name) : String(id || '');
  }

  function photo(id) {
    if (!_data || !_data.meta || !_data.meta.photoMap) return null;
    return _data.meta.photoMap[id] || null;
  }

  function initials(name) {
    var parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  /* Stable hue from a string, for the colored-initials avatar fallback. */
  function hueFor(s) {
    var h = 0;
    s = String(s || '');
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
    return h;
  }

  function avatar(id, sizeClass) {
    var cls = 'avatar' + (sizeClass ? ' ' + sizeClass : '');
    var name = esc(mname(id));
    var p = photo(id);
    if (p) {
      return '<img class="' + cls + '" src="' + esc(p) + '" alt="' + name + '" loading="lazy">';
    }
    var hue = hueFor(mname(id));
    return '<span class="' + cls + ' initials" style="background:hsl(' + hue + ',45%,32%)" aria-label="' + name + '">' +
      esc(initials(mname(id))) + '</span>';
  }

  function fmt(n, d) {
    if (d == null) d = 2;
    var x = Number(n);
    if (!isFinite(x)) return '—';
    return x.toFixed(d);
  }

  function divName(x) {
    var r = { I: 'I', II: 'II', III: 'III' }[String(x).toUpperCase()] || String(x);
    return 'Division ' + r;
  }

  /* series = [{label, color, points:[]}]. Returns an SVG string. */
  function lineChart(series, w, h) {
    w = w || 600; h = h || 220;
    var padL = 8, padR = 8, padT = 12, padB = 12;
    var all = [];
    (series || []).forEach(function (s) { (s.points || []).forEach(function (p) { all.push(p); }); });
    if (!all.length) return '<p class="muted">No data.</p>';
    var min = Math.min.apply(null, all), max = Math.max.apply(null, all);
    if (min === max) { min -= 1; max += 1; }
    var n = Math.max.apply(null, series.map(function (s) { return (s.points || []).length; }));
    function X(i) { return padL + (i * (w - padL - padR)) / Math.max(1, n - 1); }
    function Y(v) { return padT + (1 - (v - min) / (max - min)) * (h - padT - padB); }

    var out = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="100%" role="img" aria-label="Line chart">';
    // faint gridlines at min / mid / max
    [min, (min + max) / 2, max].forEach(function (v) {
      var y = Y(v).toFixed(1);
      out += '<line x1="' + padL + '" y1="' + y + '" x2="' + (w - padR) + '" y2="' + y +
        '" stroke="#1e3a5c" stroke-width="1" opacity="0.6"/>';
      out += '<text x="' + (w - padR) + '" y="' + (y - 3) + '" text-anchor="end" font-size="9" fill="#93a5b8">' +
        esc(fmt(v, 1)) + '</text>';
    });
    (series || []).forEach(function (s) {
      var pts = (s.points || []).map(function (p, i) { return X(i).toFixed(1) + ',' + Y(p).toFixed(1); }).join(' ');
      out += '<polyline points="' + pts + '" fill="none" stroke="' + esc(s.color || '#2ea36b') +
        '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
      var last = s.points[s.points.length - 1];
      if (last != null) {
        out += '<circle cx="' + X(s.points.length - 1).toFixed(1) + '" cy="' + Y(last).toFixed(1) +
          '" r="3.5" fill="' + esc(s.color || '#2ea36b') + '"/>';
      }
    });
    out += '</svg>';
    out += '<div class="chart-legend">' + (series || []).map(function (s) {
      return '<span><i style="background:' + esc(s.color || '#2ea36b') + '"></i>' + esc(s.label) + '</span>';
    }).join('') + '</div>';
    return out;
  }

  /* rows = [{label, value, sub}]. Returns horizontal bar HTML. */
  function hbars(rows) {
    rows = rows || [];
    if (!rows.length) return '<p class="muted">No data.</p>';
    var max = Math.max.apply(null, rows.map(function (r) { return Number(r.value) || 0; }));
    if (!max) max = 1;
    return rows.map(function (r) {
      var pct = Math.max(2, (Number(r.value) || 0) / max * 100).toFixed(1);
      return '<div class="row">' +
        '<div style="min-width:0">' +
          '<div>' + esc(r.label) + '</div>' +
          (r.sub ? '<div class="muted" style="font-size:0.82rem">' + esc(r.sub) + '</div>' : '') +
        '</div>' +
        '<div class="hbar-track"><div class="hbar-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="mono num" style="min-width:64px;text-align:right">' + esc(fmt(r.value)) + '</div>' +
      '</div>';
    }).join('');
  }

  var medalColor = { QB: '#e05252', RB: '#4a90d9', WR: '#2ea36b', TE: '#e08a3c' };

  /* "12-3-0" or "12-3" -> {w, l, t} */
  function parseRec(rec) {
    var parts = String(rec || '').split('-').map(Number);
    return { w: parts[0] || 0, l: parts[1] || 0, t: parts[2] || 0 };
  }

  function navLink(route, label) {
    return '<a class="nav-link" href="#' + esc(route) + '">' + label + '</a>';
  }

  /* Franchise crest artwork (vintage badges in assets/art/). */
  function crest(id) {
    var name = esc(mname(id));
    return '<img class="crest" src="assets/art/crest-' + esc(String(id)) + '.webp" alt="' + name + ' crest" loading="lazy">';
  }

  window.Lib = {
    esc: esc,
    mgr: mgr,
    mname: mname,
    teamName: teamName,
    photo: photo,
    avatar: avatar,
    crest: crest,
    initials: initials,
    fmt: fmt,
    divName: divName,
    lineChart: lineChart,
    hbars: hbars,
    medalColor: medalColor,
    parseRec: parseRec,
    wl: parseRec, /* contract alias */
    navLink: navLink,
    setData: function (d) { _data = d; }
  };
})();
