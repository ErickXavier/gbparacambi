document.addEventListener("DOMContentLoaded", () => {
  const navLinksContainer = document.querySelector("#nav-menu");
  const navLinks = navLinksContainer.querySelectorAll("a");

  // For each nav link, add a click event to toggle its active class
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      // Remove the active class from all links
      navLinks.forEach((lnk) => lnk.classList.remove("active"));

      // Add the active class to the clicked link
      link.classList.add("active");

      // Close the mobile menu (popover)
      if (navLinksContainer.matches(":popover-open")) {
        navLinksContainer.hidePopover();
      }
    });
  });

  // Automatically close the mobile popover if the user resizes to desktop width
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && navLinksContainer.matches(":popover-open")) {
      navLinksContainer.hidePopover();
    }
  });

});

// ── Liquid Glass Effect ───────────────────────────────────────────────────────
// Technique: physics-based refraction via SVG feDisplacementMap as backdrop-filter
// Reference: https://kube.io/blog/liquid-glass-css-svg/
// Chrome-only (SVG filters as backdrop-filter). Other browsers keep CSS blur.
(function liquidGlass() {
  const header = document.querySelector('header');
  if (!header) return;

  // Fixed convex lens settings (final values from visual tuning).
  const GLASS = {
    blurStdDeviation: 3.0,
    distortionStrength: 1.60,
    ior: 2.00,
    convexity: 1.40
  };

  // Signed-distance function for a rounded rectangle centered at origin.
  // Returns negative = inside, positive = outside.
  function sdf(x, y, hw, hh, r) {
    const qx = Math.abs(x) - hw + r;
    const qy = Math.abs(y) - hh + r;
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
  }

  // Build a convex-lens displacement map encoded as an RGBA PNG data-URL.
  function buildDispMap(w, h, radius, ior, convexity) {
    const hw = w / 2, hh = h / 2;
    const r = Math.min(radius, hw, hh);
    const eps = 0.5;
    const maxInsideDist = Math.max(1, Math.min(hw, hh) - 1);
    const rx = new Float32Array(w * h);
    const ry = new Float32Array(w * h);
    let maxD = 0;

    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const cx = px - hw + 0.5, cy = py - hh + 0.5;
        const dist = -sdf(cx, cy, hw, hh, r); // positive = inside
        if (dist <= 0) continue;

        // Convex lens profile: full interior contributes to displacement.
        const centerT = Math.max(0, Math.min(1, dist / maxInsideDist));
        const curve = Math.pow(1 - centerT, convexity);
        const slope = 1.8 * curve;

        const sinI = slope / Math.hypot(slope, 1); // sin(θ_i) via surface normal
        const sinR = sinI / ior;                    // Snell's law
        const cosR = Math.sqrt(Math.max(0, 1 - sinR * sinR));
        const dispPx = cosR > 0.01 ? (sinR / cosR) * maxInsideDist : 0;

        // Outward normal via numerical SDF gradient
        const gx = sdf(cx + eps, cy, hw, hh, r) - sdf(cx - eps, cy, hw, hh, r);
        const gy = sdf(cx, cy + eps, hw, hh, r) - sdf(cx, cy - eps, hw, hh, r);
        const gl = Math.hypot(gx, gy) || 1;
        const i = py * w + px;
        rx[i] = -(gx / gl) * dispPx;  // inward = negate outward normal
        ry[i] = -(gy / gl) * dispPx;
        if (dispPx > maxD) maxD = dispPx;
      }
    }

    // Encode displacement vectors as R(X) / G(Y) channels; 128 = no displacement.
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(w, h);
    const d = img.data;
    const sc = maxD || 1;
    for (let i = 0; i < w * h; i++) {
      const di = i * 4;
      d[di]     = Math.round(Math.max(0, Math.min(255, 128 + rx[i] / sc * 127)));
      d[di + 1] = Math.round(Math.max(0, Math.min(255, 128 + ry[i] / sc * 127)));
      d[di + 2] = 128;
      d[di + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return { url: canvas.toDataURL(), scale: maxD };
  }

  // Build a specular highlight map: top + left rim light simulating light from top-left.
  function buildSpecMap(w, h, radius, bevel) {
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    const r = Math.min(radius, w / 2, h / 2);
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, r);
    ctx.clip();

    const g1 = ctx.createLinearGradient(0, 0, 0, bevel * 2.5);
    g1.addColorStop(0, 'rgba(255,255,255,0.62)');
    g1.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g1; ctx.fillRect(0, 0, w, h);

    const g2 = ctx.createLinearGradient(0, 0, bevel * 1.5, 0);
    g2.addColorStop(0, 'rgba(255,255,255,0.26)');
    g2.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g2; ctx.fillRect(0, 0, w, h);

    const R = Math.max(w, h) * 0.72;
    const g3 = ctx.createRadialGradient(w / 2, h / 2, R * 0.5, w / 2, h / 2, R);
    g3.addColorStop(0.78, 'rgba(255,255,255,0)');
    g3.addColorStop(0.92, 'rgba(255,255,255,0.20)');
    g3.addColorStop(1,    'rgba(255,255,255,0.05)');
    ctx.fillStyle = g3; ctx.fillRect(0, 0, w, h);

    return canvas.toDataURL();
  }

  // Inject (or replace) the SVG filter definition in the DOM.
  // Filter pipeline: blur backdrop → refraction displacement → blend specular highlight.
  function injectFilter(id, dispUrl, specUrl, w, h, scale, blurStdDeviation) {
    let svg = document.getElementById('_lg_svg');
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.id = '_lg_svg';
      svg.setAttribute('aria-hidden', 'true');
      Object.assign(svg.style, {
        position: 'absolute', width: '0', height: '0',
        overflow: 'hidden', pointerEvents: 'none'
      });
      document.body.insertAdjacentElement('afterbegin', svg);
    }
    svg.innerHTML = `<defs>
      <filter id="${id}" x="0" y="0" width="${w}" height="${h}"
              filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feGaussianBlur in="SourceGraphic" stdDeviation="${blurStdDeviation}" result="blur"/>
        <feImage href="${dispUrl}" x="0" y="0" width="${w}" height="${h}" result="dm"/>
        <feDisplacementMap in="blur" in2="dm" scale="${scale.toFixed(2)}"
                           xChannelSelector="R" yChannelSelector="G" result="ref"/>
        <feImage href="${specUrl}" x="0" y="0" width="${w}" height="${h}" result="sp"/>
        <feBlend in="ref" in2="sp" mode="screen"/>
      </filter>
    </defs>`;
  }

  // Chrome is currently the only browser that supports SVG filters as backdrop-filter.
  const isChrome = /Chrome\/\d/.test(navigator.userAgent) && !/Edg\/|OPR\//.test(navigator.userAgent);
  const FID = 'lg-f';
  let lw = 0, lh = 0, lr = 0, lk = '', timer;

  function glassKey() {
    return [
      GLASS.blurStdDeviation,
      GLASS.convexity,
      GLASS.distortionStrength,
      GLASS.ior
    ].join('|');
  }

  function refresh(force = false) {
    const rect = header.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    const radius = Math.round(parseFloat(getComputedStyle(header).borderRadius) || 0);
    const key = glassKey();
    if (!w || !h) return;
    if (!force && w === lw && h === lh && radius === lr && key === lk) return;
    lw = w; lh = h; lr = radius;
    lk = key;

    const dm = buildDispMap(w, h, radius, GLASS.ior, GLASS.convexity);
    const sm = buildSpecMap(w, h, radius, Math.max(10, h * 0.24));
    injectFilter(
      FID,
      dm.url,
      sm.url,
      w,
      h,
      dm.scale * GLASS.distortionStrength,
      GLASS.blurStdDeviation
    );

    if (isChrome) {
      header.style.backdropFilter = `url(#${FID})`;
      header.style.webkitBackdropFilter = `url(#${FID})`;
    }
  }

  function schedule(force = false) {
    clearTimeout(timer);
    timer = setTimeout(() => refresh(force), 150);
  }

  window.addEventListener('scroll', () => schedule(false), { passive: true });
  window.addEventListener('resize', () => schedule(false), { passive: true });
  requestAnimationFrame(() => refresh(true));
})();

// Tratamento do formulário de contato
document
  .getElementById("contact-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const name = this.name.value;
    const message = this.message.value;
    const whatsappLink = `https://wa.me/5521987864399?text=Bom%20dia,%20sou%20${encodeURIComponent(
      name
    )}.%20${encodeURIComponent(message)}`;
    window.open(whatsappLink, "_blank");
  });


