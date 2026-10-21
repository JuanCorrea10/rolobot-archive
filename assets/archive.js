/* The Rolobot Archive — runtime.
   Reading this is allowed. The keys are hashed, so reading it won't help much.
   By Rolobot. */
(function () {
  'use strict';

  // ---------- SHA-256 (pure JS so it also works offline) ----------
  var K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }
  function sha256(str) {
    var H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    var bytes = new TextEncoder().encode(str), l = bytes.length, bitLen = l * 8;
    var padLen = ((l + 9 + 63) >> 6) << 6;
    var m = new Uint8Array(padLen); m.set(bytes); m[l] = 0x80;
    var dv = new DataView(m.buffer);
    dv.setUint32(padLen - 4, bitLen >>> 0);
    dv.setUint32(padLen - 8, Math.floor(bitLen / 0x100000000));
    var w = new Uint32Array(64);
    for (var off = 0; off < padLen; off += 64) {
      var i;
      for (i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4);
      for (i = 16; i < 64; i++) {
        var s0 = rotr(w[i-15], 7) ^ rotr(w[i-15], 18) ^ (w[i-15] >>> 3);
        var s1 = rotr(w[i-2], 17) ^ rotr(w[i-2], 19) ^ (w[i-2] >>> 10);
        w[i] = (w[i-16] + s0 + w[i-7] + s1) >>> 0;
      }
      var a=H[0],b=H[1],c=H[2],d=H[3],e=H[4],f=H[5],g=H[6],h=H[7];
      for (i = 0; i < 64; i++) {
        var S1 = rotr(e,6) ^ rotr(e,11) ^ rotr(e,25);
        var ch = (e & f) ^ (~e & g);
        var t1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
        var S0 = rotr(a,2) ^ rotr(a,13) ^ rotr(a,22);
        var maj = (a & b) ^ (a & c) ^ (b & c);
        var t2 = (S0 + maj) >>> 0;
        h=g; g=f; f=e; e=(d+t1)>>>0; d=c; c=b; b=a; a=(t1+t2)>>>0;
      }
      H=[(H[0]+a)>>>0,(H[1]+b)>>>0,(H[2]+c)>>>0,(H[3]+d)>>>0,(H[4]+e)>>>0,(H[5]+f)>>>0,(H[6]+g)>>>0,(H[7]+h)>>>0];
    }
    var out = '';
    for (var j = 0; j < 8; j++) out += ('00000000' + H[j].toString(16)).slice(-8);
    return out;
  }

  // ---------- helpers ----------
  var ROOT = document.documentElement.getAttribute('data-root') || './';
  var ROMAN = ['0','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
  var LAST = 7, ENDLEVEL = 8;
  var S = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, ''); }
  function hexxor(a, b) { var o = ''; for (var i = 0; i < a.length; i++) o += (parseInt(a[i], 16) ^ parseInt(b[i], 16)).toString(16); return o; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function fmt(ms) {
    var s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); s = s % 60;
    return (h ? h + 'h ' : '') + (h || m ? m + 'm ' : '') + s + 's';
  }

  var JOKES = [
    'Why do programmers prefer dark mode? Because light attracts bugs.',
    'There are 10 kinds of people: those who understand binary, and those who do not.',
    'I would tell you a UDP joke, but you might not get it.',
    'A SQL query walks into a bar, walks up to two tables and asks: "Can I join you?"',
    'Knock knock. - Who is there? - ...(very long pause)... - Java.',
    'Why did the robot go on holiday? It needed to recharge.',
    'How many programmers does it take to change a light bulb? None. That is a hardware problem.',
    'What is Beethoven doing in his grave? De-composing.',
    'Why did the composer only write in bed? He was working on sheet music.',
    'What is Beethoven\'s favourite fruit? Ba-na-na-naaaa.',
    'Why do ghosts make bad liars? Because you can see right through them.',
    'What do you call a detective who solves cases with a keyboard? Sherlock Homes-page.'
  ];
  var WRONG = [
    'That key fits nothing.',
    'The lock does not move.',
    'No.',
    'Wrong door. Or wrong key. Probably both.',
    'The door hears you. It is not impressed.',
    'Something clicks. Not the lock, though.',
    'Nope.'
  ];
  var EGGS = {
    rolobot: '...yes?',
    help: 'There is no help here. There are hints, though. Type hint.',
    sos: 'Received. Ignored.',
    '42': 'That is the answer. Not to this door, though.',
    password: 'Really? That was the plan?',
    admin: 'Access denied. Also: nice try.',
    root: 'Access denied. Also: nice try.',
    sudo: 'This incident will be reported.',
    please: 'Manners are appreciated. They are not keys.',
    opensesame: 'Wrong cave.',
    xyzzy: 'Nothing happens.',
    plugh: 'A hollow voice says: "fool".',
    cheat: 'The key is on the page or out in the world. Not in this box.',
    skip: 'There is no skipping. There is only looking.',
    answer: 'Clever. No.',
    solution: 'Clever. No.',
    hello: 'Hello. You are not getting through with that.',
    hi: 'Hi. Still locked.',
    hey: 'Hey. Still locked.',
    whoareyou: 'The one who built the doors. And the one who left them open.',
    whoisrolobot: 'Nobody knows. Rolobot prefers it that way.',
    key: 'Yes. That is what I need. Not the word "key". A key.',
    nothing: 'Nothing is not a key. Usually.',
    idk: 'Then look harder. Or type hint.',
    idontknow: 'Then look harder. Or type hint.',
    love: 'Not a key. But thank you.',
    claude: 'Ask the machines if you want. They do not know either.',
    chatgpt: 'Ask the machines if you want. They do not know either.',
    ai: 'Ask the machines if you want. They do not know either.',
    google: 'Allowed. Encouraged, even. But type what you find, not the word google.',
    youtube: 'Yes. Watch there. Then come back.',
    spotify: 'Yes. Listen there. Then come back.',
    wikipedia: 'Yes. Read there. Then come back.',
    rickroll: 'Never gonna give you a key.',
    rick: 'Never gonna let you through.',
    reset: 'Type "reset please" if you really want the archive to forget you.',
    test: 'Test failed.',
    asdf: 'The keyboard is not the key.',
    thanks: 'You are welcome. Still locked.',
    thankyou: 'You are welcome. Still locked.',
    bye: 'The door will be here when you come back.',
    door: 'Yes, that is what you are looking at.',
    light: 'Flickers.',
    askew: 'Close. Google knows a shorter word for that one. Four letters.',
    beethoven: 'He wrote it. But the piece has its own name.',
    symphony: 'That is the symphony. The famous bit inside it has a name of its own.',
    ninthsymphony: 'That is the symphony. The famous bit inside it has a name of its own.',
    symphony9: 'That is the symphony. The famous bit inside it has a name of its own.',
    himnodelaalegria: 'In English, please. The archive is monolingual. Stubbornly.',
    damdominici: 'Ah. The architect. His music is on Spotify, you know. Two tracks, so far.',
    dominici: 'Ah. The architect. His music is on Spotify, you know. Two tracks, so far.',
    ascensionprotocol: 'The other one.',
    ascension: 'The other one.',
    protocol: 'The other one.',
    julius: 'He shifts things. Three places, usually.',
    caesar: 'Julius, to his friends. He shifts things.',
    today: 'Not today.',
    yesterday: 'Too late.',
    manana: 'In English, please. The archive is monolingual. Stubbornly.',
    nobody: 'Somebody, surely.',
    me: 'Not a key. Though you are important, probably.',
    zoo: 'Warmer. Who lives there?'
  };
  window.RA = { JOKES: JOKES, sha256: sha256, norm: norm };

  // ---------- new version of the archive: old progress means nothing ----------
  if (S.get('ra_v') !== '2') { forget(); S.set('ra_v', '2'); }

  // ---------- the archive is broken (someone else is in here) ----------
  document.body.classList.add('tear');
  var h1 = document.querySelector('h1'); if (h1) h1.classList.add('glitch');
  var paras = [].slice.call(document.querySelectorAll('main p')).filter(function (el) { return !el.children.length && !el.classList.contains('carved') && el.textContent.length > 12; });
  setInterval(function () {
    if (document.hidden || Math.random() < 0.45 || !paras.length) return;
    var el = paras[Math.floor(Math.random() * paras.length)]; if (el.getAttribute('data-busy')) return;
    var orig = el.textContent, ch = orig.split(''); el.setAttribute('data-busy', '1');
    for (var k = 0; k < 2 + Math.floor(Math.random() * 3); k++) { var i = Math.floor(Math.random() * ch.length); if (ch[i] !== ' ') ch[i] = '▒'; }
    el.textContent = ch.join('');
    setTimeout(function () { el.textContent = orig; el.removeAttribute('data-busy'); }, 350 + Math.random() * 700);
  }, 2200);
  setInterval(function () { if (document.hidden) return; var t = document.title; document.title = t.replace(/[aeio]/, '▒').replace(/[aeio]([^aeio]*)$/, '▒$1'); setTimeout(function () { if (!document.hidden) document.title = t; }, 600); }, 9000);

  // ---------- the music box (broken) ----------
  var SS = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };
  var au = null;
  try { au = new Audio(ROOT + 'assets/musicbox.mp3?v=5'); au.loop = true; au.volume = 0.55; au.preload = 'auto'; } catch (e) { au = null; }
  function resume() {
    var t = +SS.get('ra_t') || 0; if (!t) return;
    try { if (au.duration) au.currentTime = t % au.duration; else au.addEventListener('loadedmetadata', function () { try { au.currentTime = t % au.duration; } catch (e) {} }, { once: true }); } catch (e) {}
  }
  function play() { if (!au) return; resume(); var pr = au.play(); if (pr && pr.catch) pr.catch(function () { notResponding(); }); }
  function notResponding() {
    var o = document.getElementById('nr'); if (o) { o.hidden = false; return; }
    o = document.createElement('div'); o.id = 'nr'; o.className = 'nr';
    o.innerHTML = '<div class="nrbox"><div class="t">▒▒ THE ROLOBOT ARCHIVE IS NOT RESPONDING ▒▒</div><div>someone else is using it.</div><button type="button" id="nrgo">[ continue anyway ]</button><div class="dim small" style="margin-top:12px">(sound on)</div></div>';
    document.body.appendChild(o);
    document.getElementById('nrgo').addEventListener('click', function () { o.hidden = true; SS.set('ra_sound', 'on'); play(); });
  }
  if (au) {
    if (/[?&]quiet/.test(location.search)) SS.set('ra_sound', 'off');   // test hook
    var pref = SS.get('ra_sound');
    if (pref === 'on') play(); else if (pref !== 'off') notResponding();
    setInterval(function () { if (!au.paused) SS.set('ra_t', String(au.currentTime)); }, 1000);
    window.addEventListener('pagehide', function () { if (!au.paused) SS.set('ra_t', String(au.currentTime)); });
  }

  // ---------- the eye ----------
  var eye = document.getElementById('eye');
  if (eye) {
    var frames = [0, 1, 2, 3].map(function (i) { var im = new Image(); im.src = ROOT + 'assets/eye_' + i + '.jpg?v=4'; return im.src; });
    var cyc = 0;
    (function tick() {
      setTimeout(function () {
        cyc++;
        var f = cyc % 5 === 0 ? 3 : (Math.random() < 0.55 ? 1 : 2);
        var dur = f === 3 ? 900 + Math.random() * 800 : 70 + Math.random() * 230;
        eye.src = frames[f];
        setTimeout(function () { eye.src = frames[0]; tick(); }, dur);
      }, 1400 + Math.random() * 3200);
    })();
  }

  // ---------- the tab misses you ----------
  var savedTitle = document.title;
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { savedTitle = document.title; document.title = 'come back.'; }
    else document.title = savedTitle;
  });

  // ---------- konami ----------
  var KON = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'], kp = 0;
  window.addEventListener('keydown', function (e) {
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === KON[kp]) { kp++; if (kp === KON.length) { kp = 0; location.href = ROOT + 'cheat.html'; } }
    else kp = (k === KON[0]) ? 1 : 0;
  });

  console.log('%cRolobot sees you.', 'color:#d9a441;font-family:monospace;font-size:13px');

  // ---------- index: progress + the ghost ink ----------
  var prog = document.getElementById('progress');
  if (prog) {
    var mx = +S.get('ra_max') || 0, last = S.get('ra_last') || '';
    var safe = last && (last.indexOf(location.origin) === 0 || last.indexOf('file:') === 0);
    if (mx >= ENDLEVEL && safe) prog.innerHTML = 'You already got out. <a href="' + last + '">Return to the end</a>, or <a href="#" id="reset">make the archive forget you</a>.';
    else if (mx >= 1 && safe) prog.innerHTML = 'You stand before door ' + ROMAN[mx] + '. <a href="' + last + '">Continue &rarr;</a>';
    var rs = document.getElementById('reset');
    if (rs) rs.addEventListener('click', function (e) { e.preventDefault(); forget(); prog.textContent = 'Forgotten.'; });
  }
  var ghost = document.querySelector('.ghost');
  if (ghost) setTimeout(function () { ghost.classList.add('faint'); }, 15000);

  function forget() {
    for (var i = 1; i <= ENDLEVEL; i++) S.del('ra_key_' + i);
    S.del('ra_max'); S.del('ra_last'); S.del('ra_start');
  }

  // ---------- doors: sealed from the inside ----------
  var D = window.DOOR;
  if (!D) return;
  sealPage(D);
  return;

  function corrupt(str, amt, seed) {
    var out = '', x = seed || 7;
    for (var i = 0; i < str.length; i++) {
      x = (x * 1103515245 + 12345) & 0x7fffffff;
      var c = str[i]; if (c === ' ' || c === '\n') { out += c; continue; }
      var q = (x % 1000) / 1000;
      out += q < amt ? (q < amt * 0.5 ? '▒' : '█') : c;
    }
    return out;
  }
  function sealPage(D) {
    var k = document.querySelector('.kicker');
    if (k) k.innerHTML = k.innerHTML + ' &middot; <span style="color:var(--bad)">SEALED FROM THE INSIDE</span>';
    var main = document.querySelector('main'), seed = (D.level || 9) * 977;
    var walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, null), nodes = [], n;
    while ((n = walker.nextNode())) {
      if (n.parentNode.closest('footer,form,.msg,.kicker,h1,.broken-status')) continue;
      if (n.nodeValue.trim().length < 2) continue;
      nodes.push(n);
    }
    nodes.forEach(function (nd, i) { nd.nodeValue = corrupt(nd.nodeValue, 0.38, seed + i * 31); });
    [].forEach.call(main.querySelectorAll('button:not([type=submit])'), function (b) { b.disabled = true; b.textContent = '[ BROKEN ]'; });
    [].forEach.call(main.querySelectorAll('iframe'), function (f) { var p = document.createElement('p'); p.className = 'dim'; p.textContent = '[ something was playing here ]'; f.parentNode.replaceChild(p, f); });
    var form = document.getElementById('keyform'), input = document.getElementById('key'), msg = document.getElementById('msg');
    if (!form) return;
    input.placeholder = 'sealed';
    var tries = 0, SEAL = ['The lock is not here anymore.', 'Someone changed the keys.', 'The door does not answer you. It answers someone else now.', 'R. has the keys.', 'No.', 'You are typing into a wall.', 'That key used to mean something.'];
    form.addEventListener('submit', function (e) {
      e.preventDefault(); tries++;
      var v = norm(input.value), t;
      if (!v) t = 'Silence. Same as the door.';
      else if (v === 'hint' || v === 'hints' || v === 'pista' || v === 'clue' || v === 'ayuda') t = 'There are no hints here anymore. Only the glass.';
      else if (v === 'rolobot') t = 'He is not here either.';
      else if (D.checks && D.checks[sha256('check|' + v)]) t = 'That WAS the key. The door is sealed from the inside. It does not matter anymore.';
      else t = SEAL[(tries - 1) % SEAL.length];
      if (tries % 3 === 0) t += '  (every door in here is locked. the glass is not a door.)';
      msg.textContent = t; msg.className = 'msg bad'; input.select();
    });
  }
  /* --- everything below is how the doors used to work. --- */
  if (!D.side) {
    var max = +S.get('ra_max') || 0;
    if (D.level >= max) { S.set('ra_max', String(D.level)); S.set('ra_last', location.href.split('?')[0].split('#')[0]); }
    if (D.level === 1 && !S.get('ra_start')) S.set('ra_start', String(Date.now()));
  }

  function keyring() {
    var ks = [];
    for (var i = 1; i <= LAST; i++) { var k = S.get('ra_key_' + i); if (k) ks.push(ROMAN[i] + ': ' + k); }
    return ks;
  }

  if (D.end) {
    var el = document.getElementById('elapsed'), kr = document.getElementById('keyring'), rst = document.getElementById('reset');
    var st = +S.get('ra_start');
    if (el) el.textContent = st ? fmt(Date.now() - st) : 'an unknown amount of time (you came in through a window)';
    if (kr) { var ks = keyring(); kr.textContent = ks.length ? ks.join('  ·  ') : '(empty. you came in through a window, didn\'t you?)'; }
    if (rst) rst.addEventListener('click', function (e) { e.preventDefault(); forget(); rst.textContent = 'forgotten.'; });
    return;
  }

  var form = document.getElementById('keyform'), input = document.getElementById('key'), msg = document.getElementById('msg');
  if (!form) return;
  var wrong = 0, hintIdx = 0;
  var hints = (D.hints || []).map(function (h) { try { return atob(h); } catch (e) { return ''; } });
  function say(t, cls) { msg.textContent = t; msg.className = 'msg ' + (cls || ''); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = norm(input.value);
    if (!v) { say('Silence is not a key.'); return; }
    if (v === 'hint' || v === 'hints' || v === 'pista' || v === 'clue' || v === 'ayuda') {
      if (!hints.length) { say('No hints behind this door. You are on your own.'); return; }
      say('HINT ' + (hintIdx + 1) + '/' + hints.length + ' — ' + hints[hintIdx]);
      hintIdx = (hintIdx + 1) % hints.length; input.value = ''; return;
    }
    if (v === 'joke' || v === 'chiste' || v === 'jokes') { say(pick(JOKES)); input.value = ''; return; }
    if (v === 'keyring' || v === 'keys') {
      var ks = keyring();
      say(ks.length ? 'Your keyring: ' + ks.join('  ·  ') : 'Your keyring is empty. Did you come in through a window?');
      input.value = ''; return;
    }
    if (v === 'resetplease') { forget(); say('Forgotten. Everything. You are nobody again.'); input.value = ''; return; }
    if (EGGS[v]) { say(EGGS[v]); input.value = ''; return; }

    var c = sha256('check|' + v);
    if (D.checks && D.checks[c]) {
      var next = hexxor(D.checks[c], sha256('mask|' + v).slice(0, 16));
      if (!D.side) S.set('ra_key_' + D.level, v);
      say('The lock turns.', 'ok');
      setTimeout(function () { location.href = (D.dir || './') + next + '.html'; }, 700);
      return;
    }
    wrong++;
    var t = pick(WRONG);
    if (wrong === 2) t += '  (psst: the box also understands the word "hint".)';
    say(t, 'bad');
    input.select();
  });
})();
