/* the screen was fine yesterday.   - R */
(function () {
  'use strict';
  var CLUB = atob('aHR0cHM6Ly90aGVyaWRkbGVjbHViLnBhZ2VzLmRldg=='), SAT = Date.parse('2026-10-24T00:00:00-05:00');
  var LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname), Q = location.search;
  function has(k) { return LOCAL && new RegExp('[?&]' + k + '(=|&|$)').test(Q); }
  function qnum(k) { var m = Q.match(new RegExp('[?&]' + k + '=(\\d+)')); return LOCAL && m ? +m[1] : 0; }
  var LS = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  var dead = document.createElement('canvas'), cv = document.createElement('canvas');
  dead.id = 'deadpx'; cv.id = 'glass'; dead.setAttribute('aria-hidden', 'true'); cv.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dead); document.body.appendChild(cv);
  var W, H, DPR, P, R, HR, mobile, G, hole = null;
  var knocks = 0, lastK = 0, healT = null, broken = LS.get('ra_glass') === '1' || has('broken');
  var sat = Date.now() >= SAT || has('sat');
  window.GLASS = { sat: sat };

  function rng(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  function layout() {
    W = innerWidth; H = innerHeight; DPR = Math.min(2, window.devicePixelRatio || 1); mobile = W < 760;
    HR = mobile ? 88 : 125; R = mobile ? 80 : 115;
    var m = document.querySelector('main'), mr = m ? m.getBoundingClientRect().right - 16 : W * 0.7;
    if (mobile) P = { x: Math.round(Math.min(W * 0.74, W - HR * 1.15 - 6)), y: Math.round(Math.min(230, H * 0.3)) };
    else P = { x: Math.round(Math.min(W - HR * 1.15 - 10, Math.max(mr + (W - mr) * 0.5, W * 0.8))), y: Math.round(H * 0.36) };
    [dead, cv].forEach(function (c) { c.width = Math.round(W * DPR); c.height = Math.round(H * DPR); c.style.width = W + 'px'; c.style.height = H + 'px'; });
  }

  function jag(r, x, y, ang, len, step, depth, out) {
    var pts = [[x, y]], d = 0;
    while (d < len) {
      var s = step * (0.6 + r() * 0.8); ang += (r() - 0.5) * 0.32; x += Math.cos(ang) * s; y += Math.sin(ang) * s; d += s; pts.push([x, y]);
      if (depth < 2 && r() < 0.07) jag(r, x, y, ang + (r() < 0.5 ? -1 : 1) * (0.4 + r() * 0.5), (len - d) * (0.25 + r() * 0.3), step * 0.8, depth + 1, out);
    }
    out.push({ pts: pts, w: depth ? 0.7 : 1 });
    return pts;
  }
  function at(pts, dist) { var d = 0; for (var i = 1; i < pts.length; i++) { var s = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d + s >= dist) { var k = (dist - d) / s; return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]; } d += s; } return pts[pts.length - 1]; }
  function between(r, a, b, out) {
    var pts = [a], n = 3 + Math.floor(r() * 3);
    for (var i = 1; i < n; i++) { var k = i / n; pts.push([a[0] + (b[0] - a[0]) * k + (r() - 0.5) * 7, a[1] + (b[1] - a[1]) * k + (r() - 0.5) * 7]); }
    pts.push(b); out.push({ pts: pts, w: 0.8 });
  }

  function build() {
    var r = rng(1997), lines = [], radial = [], n = mobile ? 13 : 17, i, j;
    var poly = [];
    for (i = 0; i < 11; i++) { var a = i / 11 * Math.PI * 2 + (r() - 0.5) * 0.3, rr = HR * (0.8 + r() * 0.32); poly.push([P.x + Math.cos(a) * rr, P.y + Math.sin(a) * rr]); }
    for (i = 0; i < poly.length; i++) between(r, poly[i], poly[(i + 1) % poly.length], lines);
    for (i = 0; i < n; i++) {
      var ang = i / n * Math.PI * 2 + (r() - 0.5) * 0.35, left = Math.cos(ang) < -0.35, base = mobile ? (left ? 150 : 240) : (left ? 250 : 430);
      radial.push(jag(r, P.x, P.y, ang, base * (0.45 + r() * 0.9), 13, 0, lines));
    }
    for (i = 0; i < (mobile ? 18 : 28); i++) { var ma = r() * Math.PI * 2, md = 4 + r() * 22; jag(r, P.x + Math.cos(ma) * md, P.y + Math.sin(ma) * md, ma + (r() - 0.5) * 1.2, 12 + r() * 45, 6, 2, lines); }
    jag(r, P.x, P.y, -Math.PI / 2 + 0.25 + r() * 0.3, Math.max(W, H), 18, 1, lines);
    jag(r, P.x, P.y, Math.PI / 2 - 0.2 - r() * 0.3, Math.max(W, H), 18, 1, lines);
    jag(r, P.x, P.y, -0.15 + r() * 0.3, W, 18, 1, lines);
    [16, 38, 72, HR * 1.55].forEach(function (rad, ri) {
      for (j = 0; j < radial.length; j++) { if (r() < 0.22 + ri * 0.12) continue; between(r, at(radial[j], rad * (0.9 + r() * 0.2)), at(radial[(j + 1) % radial.length], rad * (0.9 + r() * 0.2)), lines); }
    });
    var shards = [];
    for (j = 0; j < radial.length; j++) if (r() < 0.55) {
      var r1 = 16 + r() * 10, r2 = 40 + r() * 34;
      shards.push({ pts: [at(radial[j], r1), at(radial[j], r2), at(radial[(j + 1) % radial.length], r2), at(radial[(j + 1) % radial.length], r1)], a: 0.05 + r() * 0.11, blue: r() < 0.4 });
    }
    var peeks = [];
    for (j = 0; j < 3; j++) { var k = Math.floor(r() * radial.length); peeks.push({ pts: [at(radial[k], 22), at(radial[k], 46), at(radial[(k + 1) % radial.length], 44), at(radial[(k + 1) % radial.length], 24)], kind: j }); }
    var extra = [];
    for (i = 1; i <= 7; i++) { var rk = rng(500 + i), ex = []; for (j = 0; j < 2; j++) jag(rk, P.x, P.y, rk() * Math.PI * 2, (mobile ? 90 : 150) + rk() * (mobile ? 120 : 220), 11, 1, ex); extra.push(ex); }
    var blob = [], drips = [];
    for (i = 0; i < 40; i++) { var t = i / 40 * Math.PI * 2; blob.push([t, 0.72 + 0.18 * Math.sin(t * 3 + 1.3) + 0.1 * Math.sin(t * 7 + 0.4) + r() * 0.08]); }
    for (i = 0; i < 3; i++) drips.push({ dx: (r() - 0.5) * 60, w: 5 + r() * 9, len: 60 + r() * (mobile ? 110 : 200) });
    var cols = [], cc = ['#ff2bd6', '#2bff88', '#22e5ff', '#ffffff', '#ffd02b', '#8a5bff'];
    for (i = 0; i < (mobile ? 3 : 7); i++) cols.push({ x: mobile ? P.x - 30 + r() * (W - P.x + 20) : P.x + (r() - 0.55) * 300, w: r() < 0.3 ? 2 : 1, c: cc[i % cc.length], a: 0.35 + r() * 0.4 });
    G = { lines: lines, poly: poly, shards: shards, peeks: peeks, extra: extra, blob: blob, drips: drips, cols: cols, band: P.y + 50 + r() * 40, seed: r };
  }

  function path(ctx, pts, close) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); if (close) ctx.closePath(); }
  function strokeCrack(ctx, L, fresh) {
    var p = L.pts, reach = mobile ? 320 : 560;
    for (var i = 1; i < p.length; i++) {
      var d = Math.hypot(p[i][0] - P.x, p[i][1] - P.y), k = Math.max(0.18, 1 - d / reach), w = L.w * (0.55 + 1.1 * k);
      ctx.beginPath(); ctx.moveTo(p[i - 1][0], p[i - 1][1]); ctx.lineTo(p[i][0], p[i][1]);
      ctx.lineWidth = 2.4 * w; ctx.strokeStyle = 'rgba(0,0,0,' + (0.7 * k + 0.1) + ')'; ctx.stroke();
      ctx.lineWidth = w; ctx.strokeStyle = fresh ? 'rgba(255,255,255,' + (0.5 + 0.45 * k) + ')' : 'rgba(214,224,236,' + (0.16 + 0.5 * k) + ')'; ctx.stroke();
      if (k > 0.45) { ctx.beginPath(); ctx.moveTo(p[i - 1][0] + 0.9, p[i - 1][1] + 0.7); ctx.lineTo(p[i][0] + 0.9, p[i][1] + 0.7); ctx.lineWidth = 0.6; ctx.strokeStyle = 'rgba(255,255,255,' + (0.3 * k) + ')'; ctx.stroke(); }
    }
  }
  function sky(ctx, x0, y0, x1, y1) {
    var g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#3f7fd6'); g.addColorStop(1, '#9cc9f2'); ctx.fillStyle = g; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
    var r = rng(42), n = Math.max(1, Math.round((x1 - x0) * (y1 - y0) / 9000));
    for (var i = 0; i < n; i++) { var cx = x0 + r() * (x1 - x0), cy = y0 + r() * (y1 - y0) * 0.8;
      for (var j = 0; j < 4; j++) { var rx = cx + (j - 1.5) * 9, ry = cy + (r() - 0.5) * 6, rad = 8 + r() * 8, gr = ctx.createRadialGradient(rx, ry, 0, rx, ry, rad); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = gr; ctx.fillRect(rx - rad, ry - rad, rad * 2, rad * 2); } }
  }

  function draw() {
    var c = cv.getContext('2d'), d = dead.getContext('2d'), i, grow = 1 + (broken ? 7 : 0) * (mobile ? 0.05 : 0.11);
    c.setTransform(DPR, 0, 0, DPR, 0, 0); d.setTransform(DPR, 0, 0, DPR, 0, 0); c.clearRect(0, 0, W, H); d.clearRect(0, 0, W, H);
    G.cols.forEach(function (k) { d.globalAlpha = k.a; d.fillStyle = k.c; d.fillRect(Math.round(k.x), 0, k.w, H); });
    d.globalAlpha = 1; var r = rng(7);
    for (var x = P.x - (mobile ? 120 : 230); x < W; x += 3 + r() * 9) { d.fillStyle = ['#ff2bd6', '#2bff88', '#22e5ff', '#fff', '#000'][Math.floor(r() * 5)]; d.globalAlpha = 0.25 + r() * 0.5; d.fillRect(x, G.band + (r() - 0.5) * 3, 2 + r() * 8, 2 + r() * 3); }
    d.globalAlpha = 1;
    var B = (mobile ? 54 : 84) * grow, cx = P.x + 8, cy = P.y + 6;
    c.save(); c.globalCompositeOperation = 'lighter';
    [['255,40,200', -0.7, 1.25], ['30,230,255', 2.2, 1.15], ['255,210,40', 1.1, 1.05], ['120,60,255', 3.6, 1.35]].forEach(function (q) {
      var B0 = Math.min(B, (mobile ? 54 : 84) * 1.35), x = cx + Math.cos(q[1]) * B0 * 0.8, y = cy + Math.sin(q[1]) * B0 * 0.8, rad = B0 * q[2], g = c.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, 'rgba(' + q[0] + ',.32)'); g.addColorStop(1, 'rgba(' + q[0] + ',0)'); c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2); });
    c.restore();
    var bandH = (mobile ? 10 : 16) * grow, g2 = c.createLinearGradient(cx, 0, W, 0); g2.addColorStop(0, 'rgba(0,0,0,.9)'); g2.addColorStop(0.5, 'rgba(10,0,25,.75)'); g2.addColorStop(1, 'rgba(0,0,0,.5)');
    c.fillStyle = g2; c.fillRect(cx, cy - bandH / 2, W - cx, bandH);
    c.fillStyle = 'rgba(255,40,200,.5)'; c.fillRect(cx, cy - bandH / 2 - 1, W - cx, 1); c.fillStyle = 'rgba(30,230,255,.45)'; c.fillRect(cx, cy + bandH / 2, W - cx, 1);
    c.save(); c.beginPath();
    G.blob.forEach(function (p, k) { var x = cx + Math.cos(p[0]) * B * p[1], y = cy + Math.sin(p[0]) * B * p[1]; if (k) c.lineTo(x, y); else c.moveTo(x, y); });
    G.drips.forEach(function (q) { c.moveTo(cx + q.dx - q.w / 2, cy + B * 0.5); c.lineTo(cx + q.dx + q.w / 2, cy + B * 0.5); c.lineTo(cx + q.dx + q.w * 0.2, cy + B * 0.5 + q.len * Math.min(grow, 1.25)); c.lineTo(cx + q.dx - q.w * 0.3, cy + B * 0.5 + q.len * Math.min(grow, 1.25) * 0.9); c.closePath(); });
    c.closePath(); c.fillStyle = 'rgba(0,0,0,.94)'; c.shadowColor = 'rgba(150,60,255,.75)'; c.shadowBlur = 22; c.fill(); c.shadowColor = 'rgba(40,255,160,.45)'; c.shadowBlur = 8; c.fill(); c.restore();
    if (!broken) G.peeks.forEach(function (pk) {
      c.save(); path(c, pk.pts, true); c.clip();
      var xs = pk.pts.map(function (p) { return p[0]; }), ys = pk.pts.map(function (p) { return p[1]; });
      var x0 = Math.min.apply(0, xs), x1 = Math.max.apply(0, xs), y0 = Math.min.apply(0, ys), y1 = Math.max.apply(0, ys);
      sky(c, x0, y0, x1, y1);
      if (pk.kind === 1) { c.font = 'bold 30px "Comic Sans MS","Chalkboard SE",cursive'; c.lineWidth = 4; c.strokeStyle = '#5a1a00'; c.strokeText('Cl', x0 - 2, y1 - 2); c.fillStyle = '#ff9a1a'; c.fillText('Cl', x0 - 2, y1 - 2); }
      c.restore();
    });
    G.shards.forEach(function (s) { path(c, s.pts, true); c.fillStyle = s.blue ? 'rgba(150,190,255,' + s.a + ')' : 'rgba(255,255,255,' + s.a + ')'; c.fill(); });
    G.lines.forEach(function (L) { strokeCrack(c, L, false); });
    if (broken) for (i = 0; i < 7; i++) G.extra[i].forEach(function (L) { strokeCrack(c, L, i === 6); });
    var rr = rng(3); c.fillStyle = 'rgba(230,236,245,.55)';
    for (i = 0; i < 70; i++) { var a = rr() * Math.PI * 2, dd = Math.pow(rr(), 2) * 16; c.fillRect(P.x + Math.cos(a) * dd, P.y + Math.sin(a) * dd, 1 + rr(), 1 + rr()); }
    if (broken) {
      [c, d].forEach(function (k) { k.save(); k.globalCompositeOperation = 'destination-out'; k.globalAlpha = 1; k.fillStyle = '#000'; path(k, G.poly, true); k.fill(); k.restore(); });
      path(c, G.poly, true); c.lineWidth = 3.5; c.strokeStyle = 'rgba(0,0,0,.8)'; c.stroke(); c.lineWidth = 1.4; c.strokeStyle = 'rgba(235,242,255,.8)'; c.stroke();
    }
  }

  function fx(cls, x, y, ms) { var e = document.createElement('div'); e.className = cls; e.style.left = x + 'px'; e.style.top = y + 'px'; document.body.appendChild(e); setTimeout(function () { e.remove(); }, ms); return e; }
  function shake(soft) { [cv, dead].forEach(function (c) { c.classList.remove('shk', 'shk2'); void c.offsetWidth; c.classList.add(soft ? 'shk2' : 'shk'); }); }
  function knock() {
    var now = Date.now();
    if (now - lastK > 4000) knocks = 0;
    lastK = now; knocks++; clearTimeout(healT);
    if (knocks >= 7) { fx('gflash', P.x, P.y, 320); shake(false); try { if (navigator.vibrate) navigator.vibrate([30, 40, 60]); } catch (e) {} shatter(true); return; }
    fx('gtick', P.x, P.y, 260);
    healT = setTimeout(function () { knocks = 0; }, 4000);
  }

  function box(el, poly) {
    var xs = poly.map(function (p) { return p[0]; }), ys = poly.map(function (p) { return p[1]; });
    var x0 = Math.floor(Math.min.apply(0, xs)), y0 = Math.floor(Math.min.apply(0, ys)), x1 = Math.ceil(Math.max.apply(0, xs)), y1 = Math.ceil(Math.max.apply(0, ys));
    el.style.left = x0 + 'px'; el.style.top = y0 + 'px'; el.style.width = (x1 - x0) + 'px'; el.style.height = (y1 - y0) + 'px';
    var cp = 'polygon(' + poly.map(function (p) { return (p[0] - x0).toFixed(1) + 'px ' + (p[1] - y0).toFixed(1) + 'px'; }).join(',') + ')';
    el.style.clipPath = cp; el.style.webkitClipPath = cp;
    return [x0, y0, x1, y1];
  }
  function showHole() {
    if (!hole) {
      hole = document.createElement('div'); hole.className = 'ghole';
      hole.innerHTML = '<canvas></canvas><a href="' + CLUB + '/" rel="noopener"><img src="/assets/btn_club.png" width="88" height="31" alt="THE RIDDLE CLUB est 97"></a><span>a riddle every Friday. still.</span>';
      document.body.appendChild(hole);
    }
    var b = box(hole, G.poly), w = b[2] - b[0], h = b[3] - b[1], k = hole.querySelector('canvas');
    k.width = Math.round(w * DPR); k.height = Math.round(h * DPR); k.style.width = w + 'px'; k.style.height = h + 'px';
    var x = k.getContext('2d'); x.setTransform(DPR, 0, 0, DPR, 0, 0); sky(x, 0, 0, w, h);
    hole.classList.toggle('small', mobile);
  }
  function shatter(anim) {
    broken = true; LS.set('ra_glass', '1'); clearTimeout(healT);
    var sh = null;
    if (anim) {
      sh = document.createElement('div'); sh.className = 'gshard'; document.body.appendChild(sh);
      var b = box(sh, G.poly), w = b[2] - b[0], h = b[3] - b[1], k = document.createElement('canvas');
      k.width = Math.round(w * DPR); k.height = Math.round(h * DPR); k.style.width = w + 'px'; k.style.height = h + 'px'; sh.appendChild(k);
      k.getContext('2d').drawImage(cv, b[0] * DPR, b[1] * DPR, w * DPR, h * DPR, 0, 0, w * DPR, h * DPR);
      fx('gflash big', P.x, P.y, 600);
    }
    draw(); showHole();
    if (sh) { requestAnimationFrame(function () { requestAnimationFrame(function () { sh.classList.add('fall'); }); }); setTimeout(function () { sh.remove(); }, 2300); }
  }

  function fromBehind() { var i = 0; (function one() { if (broken || i++ >= 7) return; fx('gripple', P.x, P.y, 800); shake(true); setTimeout(one, 210); })(); }
  if (sat) (function loop() { setTimeout(function () { if (!broken && !document.hidden && Date.now() - lastK > 6000) fromBehind(); loop(); }, has('sat') ? 3000 : 16000 + Math.random() * 12000); })();

  document.addEventListener('pointerdown', function (e) {
    if (broken || e.button > 0 || e.clientX == null) return;
    if (Math.hypot(e.clientX - P.x, e.clientY - P.y) <= R) knock();
  }, true);

  function all() { layout(); build(); draw(); if (broken) showHole(); }
  all();
  var rt = null; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(all, 150); });
  var auto = qnum('knock'); if (auto && !broken) (function go(i) { if (i >= auto) return; setTimeout(function () { knock(); go(i + 1); }, 250); })(0);
})();
