// Closed for maintenance until OPEN_AT. Every path gets the same calm page;
// after that moment the archive is served as usual.
const OPEN_AT = Date.parse('2026-10-23T00:00:00+02:00'); // viernes 00:00 en España (= jueves 22, 5 p.m. en Colombia)
const PREVIEW = '45cd8b07105e3a36e908a1bf9b67d619acdac02084c67deb539b9da9c8e949be';

const PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>The Rolobot Archive</title>
<meta property="og:title" content="The Rolobot Archive">
<meta property="og:description" content="Closed for maintenance. Thanks for playing.">
<meta name="theme-color" content="#07080a">
<style>
html,body{margin:0;height:100%;background:#07080a;color:#9aa38b;font-family:"Courier New",Consolas,"Lucida Console",monospace;font-size:16px;line-height:1.6}
main{max-width:560px;margin:0 auto;padding:18vh 20px 40px}
h1{font-size:22px;letter-spacing:.18em;text-transform:uppercase;color:#c9d1b9;margin:0 0 6px;font-weight:normal}
.rule{height:1px;background:#4d5447;margin:0 0 26px}
.sign{border:1px solid #4d5447;padding:16px 18px;margin:0 0 26px}
.sign b{color:#d9a441;font-weight:normal;letter-spacing:.12em}
p{margin:0 0 14px}
.dim{color:#4d5447}
</style>
</head>
<body>
<main>
<h1>The Rolobot Archive</h1>
<div class="rule"></div>
<div class="sign"><b>CLOSED FOR MAINTENANCE</b><br>The doors are being repaired.</div>
<p>Thanks to everyone who played. Six doors, one ending, and a few of you got out.</p>
<p>Come back later.</p>
<p class="dim">&mdash; Rolobot</p>
</main>
</body>
</html>`;

async function sha256(s) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequest(ctx) {
  if (Date.now() >= OPEN_AT) return ctx.next();
  const url = new URL(ctx.request.url);
  const q = url.searchParams.get('preview');
  if (q && await sha256(q) === PREVIEW) {
    url.searchParams.delete('preview');
    return new Response(null, { status: 302, headers: { location: url.pathname + url.search, 'set-cookie': `ra_pv=${q}; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Lax`, 'cache-control': 'no-store' } });
  }
  const pv = /(?:^|;\s*)ra_pv=([0-9a-f]+)/.exec(ctx.request.headers.get('cookie') || '');
  if (pv && await sha256(pv[1]) === PREVIEW) return ctx.next();
  return new Response(PAGE, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } });
}
