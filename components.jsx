// Shared components: Mark (logo), Nav, Footer, helpers

const Mark = ({ size = 36 }) => (
  <span className="mark" style={{ width: size, height: size }}>
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <path d="M5 11 L11 5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M11 5 L8 5 M11 5 L11 8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M27 21 L21 27" stroke="currentColor" strokeWidth="1.4" />
      <path d="M21 27 L24 27 M21 27 L21 24" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  </span>
);

const Nav = ({ page, setPage, lang, setLang, t }) => {
  const items = [
    { id: 'home', label: t.nav.home },
    { id: 'services', label: t.nav.services, scroll: 'services-section' },
    { id: 'products', label: t.nav.products },
    { id: 'about', label: t.nav.about, scroll: 'presence-section' },
    { id: 'cases', label: t.nav.cases, scroll: 'cases-section' },
  ];
  const handle = (item) => {
    if (item.scroll) {
      setPage('home');
      setTimeout(() => {
        const el = document.getElementById(item.scroll);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    } else {
      setPage(item.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  return (
    <nav className="nav">
      <div className="container nav-row">
        <a className="nav-logo" onClick={() => { setPage('home'); window.scrollTo({ top: 0 }); }} style={{ cursor: 'pointer' }}>
          <img src="assets/euromex-logo.png" alt="Euromex" style={{ height: 32, width: 'auto' }} />
        </a>
        <div className="nav-links">
          {items.map((it) => (
            <a key={it.id} onClick={() => handle(it)}
               className={page === it.id ? 'is-active' : ''}
               style={{ cursor: 'pointer' }}>
              {it.label}
            </a>
          ))}
        </div>
        <div className="nav-right">
          <div className="lang">
            <button className={lang === 'es' ? 'is-active' : ''} onClick={() => setLang('es')}>ES</button>
            <button className={lang === 'en' ? 'is-active' : ''} onClick={() => setLang('en')}>EN</button>
          </div>
          <button className="btn btn-primary btn-arrow"
                  onClick={() => { setPage('quote'); window.scrollTo({ top: 0 }); }}>
            {t.nav.quote}
          </button>
        </div>
      </div>
    </nav>
  );
};

const Footer = ({ t, setPage }) => (
  <footer>
    <div className="container">
      <div className="foot-grid">
        <div>
          <img src="assets/euromex-logo.png" alt="Euromex" style={{ height: 56, width: 'auto', marginBottom: 24 }} />
          <p className="foot-tag">{t.foot.tag}</p>
        </div>
        {t.foot.cols.map((c, i) => (
          <div className="foot-col" key={i}>
            <h6>{c.h}</h6>
            {c.items.map((it, j) => <a key={j}>{it}</a>)}
          </div>
        ))}
      </div>
      <div className="foot-bottom">
        <span>{t.foot.legal}</span>
        <span>{t.foot.iso}</span>
      </div>
    </div>
  </footer>
);

const SectionHead = ({ num, title, titleEm, lede }) => (
  <div className="section-head">
    <div>
      <div className="section-num">&mdash; {num}</div>
    </div>
    <div>
      <h2 className="section-title">
        {title.map((line, i) => (
          <span key={i} style={{ display: 'block' }}>
            {line.split(titleEm).map((part, j, arr) =>
              j < arr.length - 1
                ? <React.Fragment key={j}>{part}<em>{titleEm}</em></React.Fragment>
                : <React.Fragment key={j}>{part}</React.Fragment>
            )}
          </span>
        ))}
      </h2>
      {lede && <p style={{ fontSize: 16, color: 'var(--fg-2)', lineHeight: 1.6, maxWidth: 560, marginTop: 24 }}>{lede}</p>}
    </div>
  </div>
);

Object.assign(window, { Mark, Nav, Footer, SectionHead });
