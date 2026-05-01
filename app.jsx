// App: routing + theme switching

const ACCENTS = {
  Coral: '#E8553D',
  Verde: '#3DA86A',
  Azul: '#3D7DE8',
  Oro: '#C9A24A',
  Blanco: '#F5F4F0',
};
const TONES = {
  'warm-black': { bg: '#0A0A0A', bg2: '#111110', bg3: '#1A1A19', fg: '#F5F4F0' },
  'pure-black': { bg: '#000000', bg2: '#0A0A0A', bg3: '#141414', fg: '#FFFFFF' },
  'paper': { bg: '#F5F4F0', bg2: '#EDEBE5', bg3: '#E0DDD5', fg: '#0A0A0A' },
};

function App() {
  const [t, setTweak] = useTweaks({ lang: 'es', accent: '#E8553D', tone: 'paper' });
  const [page, setPage] = React.useState('home');
  const lang = t.lang;
  const setLang = (v) => setTweak('lang', v);
  const copy = COPY[lang];

  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', t.accent);
    const hex = t.accent.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    root.style.setProperty('--accent-soft', `rgba(${r},${g},${b},0.12)`);

    const tone = TONES[t.tone] || TONES['warm-black'];
    root.style.setProperty('--bg', tone.bg);
    root.style.setProperty('--bg-2', tone.bg2);
    root.style.setProperty('--bg-3', tone.bg3);
    root.style.setProperty('--fg', tone.fg);
    const isDark = t.tone !== 'paper';
    root.style.setProperty('--fg-2', isDark ? 'rgba(245,244,240,0.72)' : 'rgba(10,10,10,0.72)');
    root.style.setProperty('--fg-3', isDark ? 'rgba(245,244,240,0.48)' : 'rgba(10,10,10,0.48)');
    root.style.setProperty('--fg-4', isDark ? 'rgba(245,244,240,0.28)' : 'rgba(10,10,10,0.28)');
    root.style.setProperty('--line', isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)');
    root.style.setProperty('--line-strong', isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.16)');

    // Set data-theme for map image filter handling
    document.body.setAttribute('data-theme', isDark ? 'ink' : 'paper');
  }, [t.accent, t.tone]);

  return (
    <>
      <Nav page={page} setPage={setPage} lang={lang} setLang={setLang} t={copy} />

      <div className={`page ${page === 'home' ? 'is-active' : ''}`}>
        <Landing t={copy} setPage={setPage} />
      </div>
      <div className={`page ${page === 'products' ? 'is-active' : ''}`}>
        <Products t={copy} lang={lang} setPage={setPage} />
      </div>
      <div className={`page ${page === 'quote' ? 'is-active' : ''}`}>
        <Quote t={copy} setPage={setPage} />
      </div>

      <Footer t={copy} setPage={setPage} />

      <TweaksPanel>
        <TweakSection label="Idioma / Language" />
        <TweakRadio label="Idioma" value={t.lang} options={['es', 'en']}
                    onChange={(v) => setTweak('lang', v)} />
        <TweakSection label="Tema" />
        <TweakSelect label="Fondo" value={t.tone}
                     options={[
                       { value: 'warm-black', label: 'Warm black' },
                       { value: 'pure-black', label: 'Pure black' },
                       { value: 'paper', label: 'Paper (light)' },
                     ]}
                     onChange={(v) => setTweak('tone', v)} />
        <TweakSection label="Acento" />
        <TweakSelect label="Color" value={t.accent}
                     options={Object.entries(ACCENTS).map(([k, v]) => ({ value: v, label: k }))}
                     onChange={(v) => setTweak('accent', v)} />
        <TweakColor label="Personalizado" value={t.accent}
                    onChange={(v) => setTweak('accent', v)} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
