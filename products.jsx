// Products page

const Products = ({ t, lang, setPage }) => {
  const [filter, setFilter] = React.useState(t.pp.filters[0]);

  const filtered = PRODUCT_CATALOG.filter((p) => {
    if (filter === t.pp.filters[0]) return true;
    const cat = lang === 'es' ? p.cat : p.catEn;
    if (filter === t.pp.filters[1]) return cat === (lang === 'es' ? 'Fruta' : 'Fruit');
    if (filter === t.pp.filters[2]) return cat === (lang === 'es' ? 'Verdura' : 'Vegetable');
    if (filter === t.pp.filters[3]) return cat === (lang === 'es' ? 'Carga general' : 'General cargo');
    if (filter === t.pp.filters[4]) return p.avail === 'Bajo solicitud';
    return true;
  });

  return (
    <section className="pp-hero">
      <div className="container">
        <div style={{ paddingTop: 40 }}>
          <div className="hero-tag">
            <span className="dot"></span>
            <span className="eyebrow">{t.pp.eyebrow}</span>
          </div>
          <h1 className="hero-title" style={{ fontSize: 'clamp(48px,9vw,128px)' }}>
            {t.pp.title.map((line, i) => (
              <span key={i} style={{ display: 'block' }}>
                {line.includes(t.pp.titleEm)
                  ? line.split(t.pp.titleEm).map((p, j, a) =>
                      j < a.length - 1 ? <React.Fragment key={j}>{p}<em>{t.pp.titleEm}</em></React.Fragment> : <React.Fragment key={j}>{p}</React.Fragment>
                    )
                  : line}
              </span>
            ))}
          </h1>
          <p style={{ fontSize: 17, color: 'var(--fg-2)', maxWidth: 560, marginTop: 32, lineHeight: 1.6 }}>
            {t.pp.lede}
          </p>
        </div>

        <div style={{ marginTop: 80 }}>
          <div className="pp-filter">
            {t.pp.filters.map((f) => (
              <button key={f}
                      className={`chip ${filter === f ? 'is-active' : ''}`}
                      onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>

          <div className="product-table">
            <div className="product-row" style={{ pointerEvents: 'none', borderTop: 'none', paddingTop: 12, paddingBottom: 12 }}>
              {t.pp.headers.map((h, i) => (
                <div key={i} style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>
                  {h}
                </div>
              ))}
            </div>
            {filtered.map((p) => (
              <div className="product-row" key={p.tag} onClick={() => { setPage('quote'); window.scrollTo({ top: 0 }); }}>
                <div className="pr-img"></div>
                <div>
                  <div className="pr-name">{lang === 'es' ? p.name : p.nameEn}</div>
                  <div className="pr-sub">{p.tag} · {lang === 'es' ? p.cat : p.catEn}</div>
                </div>
                <div className="pr-meta">{p.origin}</div>
                <div className="pr-meta">{p.pkg}</div>
                <div className="pr-meta">{p.avail}</div>
                <div className="pr-action">{t.pp.cta} &rarr;</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

window.Products = Products;
