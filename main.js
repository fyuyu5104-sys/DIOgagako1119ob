/* ---------------------------------------------------------
   DIO — Photography
   Replace the PHOTOS array with your own work.
   ar     = aspect ratio
   h      = strip height in vh
   lift   = how far the bottom edge sits above the strip baseline (vh)
   phrase = the single line shown on hover
   --------------------------------------------------------- */
(() => {
  const PHOTOS = [
    { ar:'2/3',  h:65,   lift:1.6, title:'CITY EDGE',       year:'2025', place:'NINGBO', phrase:'Ningbo — Three Minutes of Light' },
    { ar:'3/2',  h:39.5, lift:0.4, title:'LOW TIDE',        year:'2024', place:'NINGBO', phrase:'Ningbo — What the Tide Left' },
    { ar:'2/3',  h:65,   lift:4.2, title:'QUIET ROOM',      year:'2024', place:'NINGBO', phrase:'Ningbo — Dust Breathing' },
    { ar:'3/2',  h:39.5, lift:0.0, title:'SALT & CONCRETE', year:'2023', place:'NINGBO', phrase:'Ningbo — Salt in the Concrete' },
    { ar:'2/3',  h:65,   lift:2.6, title:'AFTER RAIN',      year:'2023', place:'NINGBO', phrase:'Ningbo — The City Goes Quiet' },
    { ar:'3/2',  h:39.5, lift:8.1, title:'NORTH WINDOW',    year:'2022', place:'NINGBO', phrase:'Ningbo — No Noon Here' },
    { ar:'3/2',  h:39.5, lift:1.0, title:'LAST LIGHT',      year:'2021', place:'NINGBO', phrase:'Ningbo — For Those Who Stay' }
  ];

  /* Placeholder photographs live in /img. Swap these for your own files. */
  PHOTOS.forEach((p, i) => {
    p.src = 'img/p' + (i + 1) + '.jpg';
  });

  /* Gallery-only work: p8–p22, kept out of the hero strip. */
  const EXTRA_PHOTOS = [
    '3/2', '3/2', '2/3', '3/2', '3/2',
    '3/2', '2/3', '3/2', '3/2', '3/2',
    '3/2', '3/2', '3/2', '3/2', '3/2'
  ].map((ar, i) => {
    const n = i + 8;
    return {
      src: 'img/p' + n + '.jpg',
      ar,
      title: 'UNTITLED ' + String(n).padStart(2, '0'),
      year: '2026',
      place: 'NINGBO'
    };
  });

  const GALLERY_PHOTOS = PHOTOS.concat(EXTRA_PHOTOS);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- the drifting strip ---------------------------------- */
  const track = document.getElementById('track');

  if (track) {
    const frameHTML = (p) =>
      '<figure class="frame" style="--ar:' + p.ar + ';--h:' + p.h + ';--lift:' + p.lift + '">' +
        '<img src="' + p.src + '" alt="' + p.title + '" draggable="false" />' +
        '<figcaption class="frame__meta">' +
          '<p class="frame__note">' + p.phrase + '</p>' +
        '</figcaption>' +
      '</figure>';

    const set = PHOTOS.map(frameHTML).join('');
    track.innerHTML = set + set;

    let half = 0;
    let offset = 0;
    let speed = 26;      // px per second
    let current = 0;     // eased speed
    let paused = false;
    let started = false;

    function measure() {
      const h = track.scrollWidth / 2;
      if (!h) return;
      if (!started) {
        half = h;
        offset = -half;
        started = true;
        return;
      }
      half = h;
      if (offset < -half) offset = -half;
      if (offset > 0) offset = 0;
    }

    measure();
    new ResizeObserver(measure).observe(track);
    window.addEventListener('load', measure);

    /* the strip runs past the fold, so the caption rides just above
       the visible edge instead of hiding below it */
    let hovered = null;

    function fitCaption() {
      if (!hovered) return;
      const meta = hovered.querySelector('.frame__meta');
      const r = hovered.getBoundingClientRect();
      const cut = Math.max(0, r.bottom - window.innerHeight);
      meta.style.bottom = (cut + 28) + 'px';
    }

    track.addEventListener('pointerover', (e) => {
      const frame = e.target.closest('.frame');
      if (!frame) return;
      paused = true;
      hovered = frame;
      fitCaption();
    });
    track.addEventListener('pointerout', (e) => {
      const frame = e.target.closest('.frame');
      if (!frame) return;
      paused = false;
      const meta = frame.querySelector('.frame__meta');
      if (meta) meta.style.bottom = '';
      hovered = null;
    });
    window.addEventListener('scroll', fitCaption, { passive: true });
    window.addEventListener('resize', fitCaption);

    let last = performance.now();

    function tick(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const target = (paused || reduceMotion) ? 0 : speed;
      current += (target - current) * Math.min(1, dt * 3.2);
      offset += current * dt;

      if (half && offset >= 0) offset -= half;

      track.style.transform = 'translate3d(' + offset.toFixed(2) + 'px,0,0)';
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  /* ---- staggered gallery ------------------------------------ */
  const gallery = document.getElementById('gallery');

  const weightOf = (p) => {
    const parts = p.ar.split('/');
    return Number(parts[1]) / Number(parts[0]);
  };

  function balance(items, cols) {
    const n = items.length;
    const buckets = Array.from({ length: cols }, () => []);
    if (cols === 1) return [items.slice()];

    const sums = new Array(cols).fill(0);
    const combos = Math.pow(cols, n);

    if (combos <= 200000) {
      let best = 0;
      let bestGap = Infinity;
      for (let code = 0; code < combos; code++) {
        sums.fill(0);
        let c = code;
        for (let i = 0; i < n; i++) { const b = c % cols; c = Math.floor(c / cols); sums[b] += weightOf(items[i]); }
        const gap = Math.max(...sums) - Math.min(...sums);
        if (gap < bestGap - 1e-9) { bestGap = gap; best = code; }
      }
      let c = best;
      for (let i = 0; i < n; i++) { const b = c % cols; c = Math.floor(c / cols); buckets[b].push(items[i]); }
    } else {
      items.forEach((p) => {
        const i = sums.indexOf(Math.min(...sums));
        buckets[i].push(p);
        sums[i] += weightOf(p);
      });
    }
    return buckets;
  }

  const tileHTML = (p) =>
    '<figure class="tile">' +
      '<img src="' + p.src + '" alt="' + p.title + '" loading="lazy" draggable="false" />' +
      '<figcaption><span>' + p.title + '</span><span>' + p.year + '</span></figcaption>' +
    '</figure>';

  function renderGallery() {
    if (!gallery) return;
    const w = window.innerWidth;
    const cols = w >= 1280 ? 4 : w >= 980 ? 3 : w >= 680 ? 2 : 1;
    gallery.innerHTML = balance(GALLERY_PHOTOS, cols)
      .map((list, i) => '<div class="gcol gcol--' + i + '">' + list.map(tileHTML).join('') + '</div>')
      .join('');
  }

  renderGallery();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderGallery, 160);
  });

  /* ---- header on scroll ------------------------------------- */
  const top = document.getElementById('top');
  if (top) {
    const onScroll = () => {
      top.classList.toggle('is-solid', window.scrollY > window.innerHeight * 0.55);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

})();
