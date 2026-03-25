// ── Session-based visitor counter ─────────────────────────────────────────
(async function() {
    const SESSION_KEY = 'ta_session';
    const SESSION_TTL = 30 * 60 * 1000; // 30 min in ms

    // Get or create a persistent session token in localStorage
    let session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    const now = Date.now();

    // If no session OR session has expired → create a fresh token
    if (!session || now > session.expires) {
    session = {
        token: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now(),
        expires: now + SESSION_TTL
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
    // Refresh TTL while still active (keep session alive)
    session.expires = now + SESSION_TTL;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    // Report to server
    try {
    const res = await fetch('/api/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: session.token })
    });
    const data = await res.json();

    // Animate count up
    const el = document.getElementById('visitorCount');
    const target = data.total;
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * target).toLocaleString('ar-EG');
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString('ar-EG');
    }
    requestAnimationFrame(tick);

    // Show "+1 زيارة جديدة!" badge only for genuinely new sessions
    if (data.new) {
        const badge = document.getElementById('visitorNew');
        badge.style.display = 'inline';
    }

    } catch(e) {
    document.getElementById('visitorCount').textContent = '—';
    }
})();

// ── Background particles ──────────────────────────────────────────────────
const bg = document.querySelector('.bg-canvas');
for (let i = 0; i < 45; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = 1 + Math.random() * 3;
    p.style.cssText = `left:${Math.random()*100}%;width:${size}px;height:${size}px;animation-delay:${Math.random()*8}s;animation-duration:${5+Math.random()*7}s;background:hsl(${Math.random()*360},80%,70%);`;
    bg.appendChild(p);
}

// ── Discord card particles ────────────────────────────────────────────────
const cp = document.getElementById('cardParticles');
const colors = ['#818cf8','#a855f7','#67e8f9','#fb7185','#86efac','#fbbf24'];
for (let i = 0; i < 18; i++) {
    const s = document.createElement('span');
    const size = 3 + Math.random() * 5;
    s.style.cssText = `left:${Math.random()*100}%;bottom:${Math.random()*30}px;width:${size}px;height:${size}px;background:${colors[Math.floor(Math.random()*colors.length)]};border-radius:50%;position:absolute;`;
    s.style.animation = `floatUp ${3+Math.random()*4}s ${Math.random()*5}s linear infinite`;
    cp.appendChild(s);
}

// ── Ripple on click ───────────────────────────────────────────────────────
document.querySelectorAll('.link-card, .discord-hero').forEach(card => {
    card.addEventListener('click', function(e) {
    if (e.target.tagName === 'BUTTON') return;
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    ripple.style.cssText = `position:absolute;width:${size}px;height:${size}px;border-radius:50%;background:rgba(255,255,255,.1);left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px;transform:scale(0);animation:rippleAnim .7s ease forwards;pointer-events:none;z-index:5;`;
    this.appendChild(ripple);
    setTimeout(()=>ripple.remove(), 800);
    });
});

// ── Cursor glow ───────────────────────────────────────────────────────────
const glow = document.createElement('div');
glow.style.cssText = 'position:fixed;width:350px;height:350px;border-radius:50%;pointer-events:none;z-index:1;background:radial-gradient(circle,rgba(168,85,247,.1) 0%,transparent 70%);transition:left .12s ease,top .12s ease;transform:translate(-50%,-50%);';
document.body.appendChild(glow);
document.addEventListener('mousemove', e => { glow.style.left=e.clientX+'px'; glow.style.top=e.clientY+'px'; });

document.querySelectorAll('.tilt-effect').forEach(card => {
    card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const dx = (x - xc) / 15;
    const dy = (y - yc) / 10;
    card.style.transform = `perspective(1000px) rotateY(${dx}deg) rotateX(${-dy}deg) translateY(-5px)`;
    });
    card.addEventListener('mouseleave', () => {
    card.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(0px)`;
    });
});