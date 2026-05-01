// Landing page — with parallax, 3D hero, count-up

// hooks
function useScrollY() {
  const [y, setY] = React.useState(0);
  React.useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { setY(window.scrollY); raf = 0; });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return y;
}

function useReveal() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) el.classList.add('is-in'); });
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

function useCountUp(target, { duration = 1600, decimals = 0 } = {}) {
  const [val, setVal] = React.useState(0);
  const ref = React.useRef(null);
  const started = React.useRef(false);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const tick = (t) => {
            const p = Math.min(1, (t - t0) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(target * eased);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);
  return [val, ref, decimals];
}

const Counter = ({ to, suffix = '', decimals = 0, prefix = '' }) => {
  const [v, ref] = useCountUp(to, { decimals });
  const formatted = decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString();
  return <span ref={ref} className="count-up">{prefix}{formatted}{suffix}</span>;
};

// hero stage — 3D globe (globe.gl/three.js) + decorative orbital rings + live cards
// 3D was chosen over SVG to give the hero presence; rings stay as 2D decoration framing the canvas.
const GLOBE_POINTS = [
  { lat: 20.7,  lng: -103.4, label: 'GDL · HUB',   isHub: true },
  { lat: 41.4,  lng: 2.2,    label: 'BCN' },
  { lat: 25.3,  lng: 55.3,   label: 'DXB' },
  { lat: 51.9,  lng: 4.5,    label: 'ROT' },
  { lat: -12.0, lng: -77.0,  label: 'LIM' },
  { lat: 51.5,  lng: -0.1,   label: 'LON' },
];

const HeroStage = ({ live }) => {
  const y = useScrollY();
  const rot = y * 0.04;
  const containerRef = React.useRef(null);
  const globeRef = React.useRef(null);

  // Mount globe once. Theme reactivity handled by separate effect.
  React.useEffect(() => {
    const host = containerRef.current;
    if (!host || !window.Globe) return;

    const isMobile = window.matchMedia('(max-width: 720px)').matches;
    const accent = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#E8553D';
    const isDark = () => document.body.getAttribute('data-theme') === 'ink';
    const hexColor = () => isDark() ? 'rgba(245,244,240,0.7)' : 'rgba(10,10,10,0.62)';
    const sphereColor = () => isDark() ? '#141414' : '#EDEBE5';

    const hub = GLOBE_POINTS[0];
    const arcs = GLOBE_POINTS.slice(1).map((p) => ({
      startLat: hub.lat, startLng: hub.lng,
      endLat: p.lat, endLng: p.lng,
    }));

    let globe;
    try { globe = window.Globe()(host); } catch (_) {
      host.classList.remove('is-loading');
      return;
    }
    globe
      .backgroundColor('rgba(0,0,0,0)')
      .showAtmosphere(true)
      .atmosphereColor(accent())
      .atmosphereAltitude(0.18)
      .hexPolygonResolution(isMobile ? 2 : 3)
      .hexPolygonMargin(0.4)
      .hexPolygonUseDots(true)
      .hexPolygonColor(hexColor)
      .pointsData(GLOBE_POINTS)
      .pointLat('lat').pointLng('lng')
      .pointAltitude((d) => d.isHub ? 0.04 : 0.025)
      .pointRadius((d) => d.isHub ? 0.9 : 0.55)
      .pointColor(accent)
      .pointLabel('label')
      .arcsData(arcs)
      .arcStartLat('startLat').arcStartLng('startLng')
      .arcEndLat('endLat').arcEndLng('endLng')
      .arcColor(() => [accent(), accent()])
      .arcStroke(0.5)
      .arcAltitudeAutoScale(0.55)
      .arcDashLength(0.4)
      .arcDashGap(0.25)
      .arcDashAnimateTime(isMobile ? 0 : 3000);

    // Translucent sphere lets continent dots read as floating
    const mat = globe.globeMaterial();
    if (mat && mat.color) {
      mat.color.set(sphereColor());
      mat.transparent = true;
      mat.opacity = isDark() ? 0.72 : 0.5;
      mat.needsUpdate = true;
    }

    // Auto-rotate; disable manual controls on mobile so vertical scroll isn't trapped
    const ctrls = globe.controls();
    ctrls.autoRotate = true;
    ctrls.autoRotateSpeed = 0.45;
    ctrls.enableZoom = false;
    ctrls.enablePan = false;
    ctrls.enableRotate = !isMobile;

    // Camera framing: tilt slightly so MX hub is visible and atmosphere catches light
    globe.pointOfView({ lat: 18, lng: -40, altitude: 2.0 }, 0);
    globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));

    // Size to container
    const sizeToHost = () => {
      const w = host.clientWidth, h = host.clientHeight;
      if (w && h) globe.width(w).height(h);
    };
    sizeToHost();
    const ro = new ResizeObserver(sizeToHost);
    ro.observe(host);

    // Country dots: hex polygon countries from Natural Earth via unpkg (decorative; failure is silent)
    fetch('https://unpkg.com/globe.gl@2.45.3/example/datasets/ne_110m_admin_0_countries.geojson')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        if (data && data.features) {
          host.classList.remove('is-loading');
          globe.hexPolygonsData(data.features);
        }
      })
      .catch(() => { host.classList.remove('is-loading'); });

    globeRef.current = { globe, accent, hexColor, sphereColor, isDark };

    return () => {
      ro.disconnect();
      try { globe._destructor && globe._destructor(); } catch (_) {}
      if (host) host.innerHTML = '';
      globeRef.current = null;
    };
  }, []);

  // Re-apply colors when theme/accent change. Watches body[data-theme] and root style mutations.
  React.useEffect(() => {
    const apply = () => {
      const ref = globeRef.current;
      if (!ref) return;
      const { globe, accent, hexColor, sphereColor, isDark } = ref;
      globe.atmosphereColor(accent())
           .hexPolygonColor(hexColor)
           .pointColor(accent)
           .arcColor(() => [accent(), accent()]);
      const mat = globe.globeMaterial();
      if (mat && mat.color) {
        mat.color.set(sphereColor());
        mat.opacity = isDark() ? 0.72 : 0.5;
        mat.needsUpdate = true;
      }
    };
    const mo = new MutationObserver(apply);
    mo.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    return () => mo.disconnect();
  }, []);

  return (
    <div className="hero-stage" style={{ transform: `translateY(${y * -0.05}px)` }}>
      <div className="ring" style={{ transform: `rotate(${rot}deg)` }}></div>
      <div className="ring ring-2" style={{ transform: `rotate(${-rot * 0.7}deg)` }}></div>
      <div className="ring ring-3"></div>

      <div ref={containerRef} className="hero-globe-3d is-loading"></div>

      {live.map((l, i) => (
        <div key={i} className={`live-card lc-${i + 1}`}>
          <span className="lc-status">{l.status}</span>
          <div>
            <div className="lc-route">{l.code}</div>
            <div className="lc-cargo">{l.cargo}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const Hero = ({ t, setPage }) => {
  const y = useScrollY();
  return (
    <section className="hero">
      <div className="container" style={{ position: 'relative' }}>
        <div className="hero-grid">
          <div>
            <div className="hero-tag">
              <span className="dot"></span>
              <span className="eyebrow">{t.hero.eyebrow}</span>
            </div>
            <h1 className="hero-title">
              <span style={{ display: 'block' }}>{t.hero.lineA}</span>
              <span style={{ display: 'block' }} className="indent">{t.hero.lineB}</span>
              <span style={{ display: 'block' }} className="indent2"><em>{t.hero.lineC}</em></span>
            </h1>
            <p className="hero-lede">{t.hero.lede}</p>
            <div className="hero-cta">
              <button className="btn btn-primary btn-arrow"
                      onClick={() => { setPage('quote'); window.scrollTo({ top: 0 }); }}>
                {t.hero.ctaPrimary}
              </button>
              <button className="btn btn-ghost btn-arrow"
                      onClick={() => document.getElementById('parallax-section')?.scrollIntoView({ behavior: 'smooth' })}>
                {t.hero.ctaSecondary}
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="num-big"><Counter to={16} suffix="+" /></div>
                <div className="lbl">{t.hero.stats[0].l}</div>
              </div>
              <div className="stat">
                <div className="num-big"><Counter to={20} /></div>
                <div className="lbl">{t.hero.stats[1].l}</div>
              </div>
              <div className="stat">
                <div className="num-big"><Counter to={99.4} suffix="%" decimals={1} /></div>
                <div className="lbl">{t.hero.stats[2].l}</div>
              </div>
            </div>
          </div>
          <HeroStage live={t.hero.live} />
        </div>
      </div>
    </section>
  );
};

const Ticker = ({ items }) => {
  const doubled = [...items, ...items];
  return (
    <div className="ticker">
      <div className="ticker-track">
        {doubled.map((it, i) => (
          <div className="ticker-item" key={i}>
            <span className="bullet"></span>
            <span>{it}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// parallax containers section
const ParallaxStrip = ({ t, setPage }) => {
  const y = useScrollY();
  const ref = React.useRef(null);
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const vp = window.innerHeight;
    const p = Math.max(0, Math.min(1, (vp - r.top) / (vp + r.height)));
    setProgress(p);
  }, [y]);

  const cards = [
    { tag: 'CTR · 40 HC · MZT → ROT', route: '↗ Rotterdam', cargo: 'Aguacate Hass · 24 ton', etd: 'ETD 04 Mayo', eta: 'ETA 22 Mayo', p: '52%', cls: 'size-lg' },
    { tag: 'CTR · 40 RF · GDL → DXB', route: '↗ Dubai', cargo: 'Limón Persa · 22 ton', etd: 'ETD 09 Mayo', eta: 'ETA 31 Mayo', p: '18%', cls: '' },
    { tag: 'CTR · 20 RF · LIM → BCN', route: '↗ Barcelona', cargo: 'Espárrago verde · 12 ton', etd: 'ETD 02 Mayo', eta: 'ETA 18 Mayo', p: '76%', cls: 'size-sm' },
    { tag: 'CTR · 40 HC · GDL → MIA', route: '↗ Miami', cargo: 'Mango Ataulfo · 23 ton', etd: 'ETD 06 Mayo', eta: 'ETA 12 Mayo', p: '34%', cls: '' },
    { tag: 'CTR · 40 RF · MZT → LON', route: '↗ Londres', cargo: 'Berries · 18 ton', etd: 'ETD 11 Mayo', eta: 'ETA 03 Junio', p: '8%', cls: 'size-sm' },
  ];

  const lanes = [
    { top: '20px',  base: 20, speed: 60 },
    { top: '120px', base: 50, speed: 80 },
    { top: '230px', base: 80, speed: 70 },
    { top: '60px',  base: 70, speed: -50 },
    { top: '210px', base: 30, speed: -65 },
  ];

  return (
    <section className="parallax-strip" id="parallax-section" ref={ref}>
      <div className="ps-head">
        <div className="ps-num">&mdash; EN MOVIMIENTO &middot; {new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</div>
        <h2>
          <span style={{ display: 'block' }}>{t.parallax.lineA}</span>
          <span style={{ display: 'block' }}><em>{t.parallax.lineB}</em></span>
        </h2>
      </div>
      <div className="ps-track is-auto">
        <div className="ps-rail">
          {[...cards, ...cards].map((c, i) => {
            const lane = lanes[i % cards.length];
            const offsetPx = (progress - 0.5) * lane.speed * 8;
            return (
              <div key={i} className={`container-card ${c.cls}`}
                   style={{
                     top: lane.top,
                     left: `${lane.base}%`,
                     transform: `translateX(calc(-50% + ${offsetPx}px))`,
                   }}>
                <div className="cc-tag">{c.tag}</div>
                <div className="cc-route">{c.route}</div>
                <div className="cc-cargo">{c.cargo}</div>
                <div className="cc-bar" style={{ '--p': c.p }}></div>
                <div className="cc-meta">
                  <span>{c.etd}</span>
                  <span>{c.eta}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// services
const Services = ({ t, setPage }) => {
  const ref = useReveal();
  return (
    <section className="section" id="services-section">
      <div className="container">
        <div ref={ref} className="reveal">
          <SectionHead num={t.services.num} title={t.services.title} titleEm={t.services.titleEm} lede={t.services.lede} />
        </div>
        <div className="services">
          {t.services.items.map((s, i) => (
            <div className="service" key={i}>
              <div className="service-inner">
                <div className="service-num">&mdash; {String(i + 1).padStart(2, '0')}</div>
                <h3 className="service-name">{s.name}</h3>
                <p className="service-desc">{s.desc}</p>
                <span className="service-arrow">
                  <span>{t.nav.quote}</span>
                  <span>&rarr;</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ProductsTeaser = ({ t, setPage }) => (
  <section className="section" id="products-section">
    <div className="container">
      <SectionHead num={t.products.num} title={t.products.title} titleEm={t.products.titleEm} lede={t.products.lede} />
      <div className="products">
        {t.products.items.map((p, i) => (
          <div className="product" key={i} onClick={() => { setPage('products'); window.scrollTo({ top: 0 }); }}>
            <div className={`product-img ${p.img ? '' : 'placeholder'}`}
                 data-placeholder={p.placeholder}
                 style={p.img ? { backgroundImage: `url(${p.img})` } : {}}></div>
            <span className="product-tag">{p.tag}</span>
            <div className="product-meta">
              <div className="product-name">{p.name}</div>
              <div className="product-cat">{p.cat}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 48, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-ghost btn-arrow"
                onClick={() => { setPage('products'); window.scrollTo({ top: 0 }); }}>
          {t.products.cta}
        </button>
      </div>
    </div>
  </section>
);

// world map with positioned country pins
const WORLD_DOTS = [
  { code: 'MX', name: 'México',     x: 20,   y: 46 },  // Guadalajara
  { code: 'US', name: 'EE.UU.',     x: 22,   y: 35 },  // Kansas
  { code: 'CA', name: 'Canadá',     x: 21,   y: 24 },  // Ontario
  { code: 'DO', name: 'Rep. Dom.',  x: 31,   y: 47 },  // Hispaniola
  { code: 'CO', name: 'Colombia',   x: 29.5, y: 55 },  // Colombia interior
  { code: 'PE', name: 'Perú',       x: 27,   y: 63 },  // Lima
  { code: 'CL', name: 'Chile',      x: 26.5, y: 72 },  // Santiago
  { code: 'AR', name: 'Argentina',  x: 29.5, y: 72 },  // Buenos Aires
  { code: 'GB', name: 'UK',         x: 47.5, y: 31 },  // Londres
  { code: 'NL', name: 'Holanda',    x: 49.5, y: 33 },  // Ámsterdam
  { code: 'FR', name: 'Francia',    x: 48,   y: 37 },  // París
  { code: 'ES', name: 'España',     x: 46.5, y: 42 },  // Madrid
  { code: 'IT', name: 'Italia',     x: 51,   y: 41 },  // Roma
  { code: 'MA', name: 'Marruecos',  x: 46,   y: 47 },  // Rabat
  { code: 'RU', name: 'Rusia',      x: 64,   y: 28 },  // Novosibirsk
  { code: 'AE', name: 'EAU',        x: 60.5, y: 49 },  // Dubái
];

const Presence = ({ t }) => {
  return (
    <section className="presence" id="presence-section">
      <div className="container">
        <SectionHead num={t.presence.num} title={t.presence.title} titleEm={t.presence.titleEm} lede={t.presence.lede} />
        <div className="presence-grid">
          <div className="presence-list">
            {t.presence.countries.map((c, i) => (
              <div className="country" key={i}>
                <span>{c.name}</span>
                <span className="code">{c.code}</span>
              </div>
            ))}
          </div>
          <div className="map-wrap">
            <div className="map-stage">
              <img className="map-image" src="assets/world-map.png" alt="" />

              <svg className="map-arcs" viewBox="0 0 100 56" preserveAspectRatio="none">
                {WORLD_DOTS.filter(d => d.code !== 'MX').map((d, i) => {
                  const m = WORLD_DOTS[0];
                  const my = m.y * 0.56;
                  const dy = d.y * 0.56;
                  const cx = (m.x + d.x) / 2;
                  const cy = Math.min(my, dy) - 6;
                  return (
                    <path key={i}
                          d={`M ${m.x} ${my} Q ${cx} ${cy} ${d.x} ${dy}`}
                          stroke="var(--accent)" strokeWidth="0.18" fill="none"
                          strokeDasharray="0.5,0.6" opacity="0.55"
                          vectorEffect="non-scaling-stroke" />
                  );
                })}
              </svg>

              {WORLD_DOTS.map((d, i) => (
                <div key={i} className={`map-pin ${d.code === 'MX' ? 'is-hq' : ''}`}
                     style={{ left: `${d.x}%`, top: `${d.y}%`, animationDelay: `${i * 0.18}s` }}>
                  <span className="map-pin-pulse"></span>
                  <span className="map-pin-dot"></span>
                  <span className="map-pin-code">{d.code}{d.code === 'MX' ? ' · HQ' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Differentiator = ({ t }) => (
  <section className="section">
    <div className="container">
      <SectionHead num={t.diff.num} title={t.diff.title} titleEm={t.diff.titleEm} />
      <div className="diff">
        {t.diff.items.map((it, i) => (
          <div className="diff-item" key={i}>
            <div className="diff-num">{it.n}</div>
            <h4 className="diff-title">{it.t}</h4>
            <p className="diff-desc">{it.d}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Cases = ({ t }) => (
  <section className="section" id="cases-section">
    <div className="container">
      <SectionHead num={t.cases.num} title={t.cases.title} titleEm={t.cases.titleEm} />
      <div className="cases">
        {t.cases.items.map((c, i) => (
          <div className="case" key={i}>
            <p className="case-quote">{c.q}</p>
            <div className="case-author">
              <div className="case-avatar">{c.n.split(' ').map(w => w[0]).slice(0, 2).join('')}</div>
              <div>
                <div className="case-name">{c.n}</div>
                <div className="case-role">{c.r}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CTABanner = ({ t, setPage }) => (
  <section className="cta-banner">
    <div className="container cta-banner-inner">
      <h2 className="cta-title">
        {t.cta.title.map((line, i) => (
          <span key={i} style={{ display: 'block' }}>
            {line.includes(t.cta.titleEm)
              ? line.split(t.cta.titleEm).map((p, j, a) =>
                  j < a.length - 1 ? <React.Fragment key={j}>{p}<em>{t.cta.titleEm}</em></React.Fragment> : <React.Fragment key={j}>{p}</React.Fragment>
                )
              : line}
          </span>
        ))}
      </h2>
      <p style={{ fontSize: 16, color: 'var(--fg-2)', marginBottom: 40 }}>{t.cta.desc}</p>
      <button className="btn btn-primary btn-arrow"
              onClick={() => { setPage('quote'); window.scrollTo({ top: 0 }); }}>
        {t.cta.btn}
      </button>
    </div>
  </section>
);

const Landing = ({ t, setPage }) => (
  <>
    <Hero t={t} setPage={setPage} />
    <Ticker items={t.ticker} />
    <ParallaxStrip t={t} setPage={setPage} />
    <Services t={t} setPage={setPage} />
    <ProductsTeaser t={t} setPage={setPage} />
    <Presence t={t} />
    <Differentiator t={t} />
    <Cases t={t} />
    <CTABanner t={t} setPage={setPage} />
  </>
);

Object.assign(window, { Landing });
