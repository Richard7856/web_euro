// Quote page

const Quote = ({ t, setPage }) => {
  const [form, setForm] = React.useState({
    operation: t.quote.f.operationOptions[0],
    modal: t.quote.f.modalOptions[0],
    product: '',
    category: t.quote.f.categoryOptions[0],
    volume: '',
    frequency: t.quote.f.frequencyOptions[0],
    origin: '',
    destination: '',
    target: '',
    company: '',
    name: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [submitted, setSubmitted] = React.useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const step = (() => {
    if (!form.operation) return 0;
    if (!form.product || !form.volume) return 1;
    if (!form.origin || !form.destination) return 2;
    return 3;
  })();

  if (submitted) {
    return (
      <section className="qp">
        <div className="container">
          <div className="qp-success" style={{ maxWidth: 640, margin: '60px auto' }}>
            <div className="eyebrow" style={{ marginBottom: 24, color: 'var(--accent)' }}>{t.quote.f.note}</div>
            <h3>{t.quote.success.t}</h3>
            <p>{t.quote.success.d}</p>
            <button className="btn btn-primary btn-arrow"
                    onClick={() => { setSubmitted(false); setPage('home'); window.scrollTo({ top: 0 }); }}>
              {t.quote.success.btn}
            </button>
          </div>
        </div>
      </section>
    );
  }

  const PillRow = ({ value, options, onChange }) => (
    <div className="pill-options">
      {options.map((opt) => (
        <button key={opt} type="button"
                className={`pill ${value === opt ? 'is-active' : ''}`}
                onClick={() => onChange(opt)}>
          {opt}
        </button>
      ))}
    </div>
  );

  return (
    <section className="qp">
      <div className="container">
        <div className="qp-grid">
          <aside className="qp-aside">
            <div className="eyebrow" style={{ marginBottom: 32 }}>&mdash; {t.quote.stepsTitle}</div>
            <h3>
              {t.quote.title.map((line, i) => (
                <span key={i} style={{ display: 'block' }}>
                  {line.includes(t.quote.titleEm)
                    ? line.split(t.quote.titleEm).map((p, j, a) =>
                        j < a.length - 1 ? <React.Fragment key={j}>{p}<em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{t.quote.titleEm}</em></React.Fragment> : <React.Fragment key={j}>{p}</React.Fragment>
                      )
                    : line}
                </span>
              ))}
            </h3>
            <p>{t.quote.lede}</p>
            <div className="qp-steps">
              {t.quote.steps.map((s, i) => (
                <div key={i} className={`qp-step ${step === i ? 'is-active' : ''}`}>
                  <span className="qp-n">0{i + 1}</span>
                  <span className="qp-l">{s}</span>
                </div>
              ))}
            </div>
          </aside>

          <form className="qp-form" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
            <div className="field">
              <label>{t.quote.f.operation}</label>
              <PillRow value={form.operation} options={t.quote.f.operationOptions}
                       onChange={(v) => set('operation', v)} />
            </div>
            <div className="field">
              <label>{t.quote.f.modal}</label>
              <PillRow value={form.modal} options={t.quote.f.modalOptions}
                       onChange={(v) => set('modal', v)} />
            </div>

            <div className="field-row">
              <div className="field">
                <label>{t.quote.f.product}</label>
                <input value={form.product} onChange={(e) => set('product', e.target.value)}
                       placeholder={t.quote.f.productPh} />
              </div>
              <div className="field">
                <label>{t.quote.f.category}</label>
                <select value={form.category} onChange={(e) => set('category', e.target.value)}>
                  {t.quote.f.categoryOptions.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>{t.quote.f.volume}</label>
                <input value={form.volume} onChange={(e) => set('volume', e.target.value)}
                       placeholder={t.quote.f.volumePh} />
              </div>
              <div className="field">
                <label>{t.quote.f.frequency}</label>
                <select value={form.frequency} onChange={(e) => set('frequency', e.target.value)}>
                  {t.quote.f.frequencyOptions.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="field-row three">
              <div className="field">
                <label>{t.quote.f.origin}</label>
                <input value={form.origin} onChange={(e) => set('origin', e.target.value)}
                       placeholder={t.quote.f.originPh} />
              </div>
              <div className="field">
                <label>{t.quote.f.destination}</label>
                <input value={form.destination} onChange={(e) => set('destination', e.target.value)}
                       placeholder={t.quote.f.destinationPh} />
              </div>
              <div className="field">
                <label>{t.quote.f.target}</label>
                <input type="date" value={form.target}
                       onChange={(e) => set('target', e.target.value)} />
              </div>
            </div>

            <div style={{ height: 24 }}></div>

            <div className="field-row">
              <div className="field">
                <label>{t.quote.f.company}</label>
                <input value={form.company} onChange={(e) => set('company', e.target.value)}
                       placeholder={t.quote.f.companyPh} required />
              </div>
              <div className="field">
                <label>{t.quote.f.name}</label>
                <input value={form.name} onChange={(e) => set('name', e.target.value)}
                       placeholder={t.quote.f.namePh} required />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>{t.quote.f.email}</label>
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                       placeholder={t.quote.f.emailPh} required />
              </div>
              <div className="field">
                <label>{t.quote.f.phone}</label>
                <input value={form.phone} onChange={(e) => set('phone', e.target.value)}
                       placeholder={t.quote.f.phonePh} />
              </div>
            </div>

            <div className="field">
              <label>{t.quote.f.notes}</label>
              <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)}
                        placeholder={t.quote.f.notesPh}></textarea>
            </div>

            <div className="submit-row">
              <span className="submit-note">{t.quote.f.note}</span>
              <button type="submit" className="btn btn-primary btn-arrow">
                {t.quote.f.submit}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

window.Quote = Quote;
