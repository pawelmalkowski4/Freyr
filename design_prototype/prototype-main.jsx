// Freyr's Eye — main app shell (router + tab bar + tweak mode)
const { useState, useEffect } = React;

function App() {
  // Screens: 'onboarding' | 'dashboard' | 'chat' | 'kronika-saga' | 'kronika-znaki' | 'ustawienia' | 'horda'
  const saved = (() => {
    try { return JSON.parse(localStorage.getItem('freyr-state') || '{}'); } catch { return {}; }
  })();
  const defaults = window.TWEAKS || {};

  const [screen, setScreen] = useState(saved.screen || defaults.startScreen || 'dashboard');
  const [onbStep, setOnbStep] = useState(saved.onbStep || 0);
  const [tone, setTone] = useState(saved.tone || defaults.tone || 'saga');
  const [grace, setGrace] = useState(saved.grace || defaults.grace || 'hoja');

  useEffect(() => {
    localStorage.setItem('freyr-state', JSON.stringify({ screen, onbStep, tone, grace }));
    document.body.setAttribute('data-tone', tone);
  }, [screen, onbStep, tone, grace]);

  // Edit mode plumbing
  useEffect(() => {
    const panel = document.getElementById('tweak-panel');
    const syncSeg = (id, value) => {
      document.querySelectorAll(`#${id} button`).forEach(b => {
        b.classList.toggle('on', b.dataset.v === value);
      });
    };
    syncSeg('seg-tone', tone);
    syncSeg('seg-grace', grace);
    syncSeg('seg-screen', ['onboarding','dashboard','horda'].includes(screen) ? screen : 'dashboard');

    const handleMsg = (e) => {
      const d = e.data || {};
      if (d.type === '__activate_edit_mode') panel.classList.add('visible');
      if (d.type === '__deactivate_edit_mode') panel.classList.remove('visible');
    };
    window.addEventListener('message', handleMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');

    const clickHandler = (e) => {
      const btn = e.target.closest('#seg-tone button, #seg-grace button, #seg-screen button');
      if (!btn) return;
      const parent = btn.parentElement.id;
      const v = btn.dataset.v;
      if (parent === 'seg-tone') {
        setTone(v);
        window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { tone: v } }, '*');
      } else if (parent === 'seg-grace') {
        setGrace(v);
        window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { grace: v } }, '*');
      } else if (parent === 'seg-screen') {
        setScreen(v);
        window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { startScreen: v } }, '*');
      }
    };
    panel.addEventListener('click', clickHandler);
    return () => {
      window.removeEventListener('message', handleMsg);
      panel.removeEventListener('click', clickHandler);
    };
  }, [tone, grace, screen]);

  const go = (s) => setScreen(s);

  // Dark onboarding variant? Nope, stay paper.
  const phone = document.getElementById('phone');
  useEffect(() => {
    if (phone) phone.classList.remove('dark');
  }, [screen]);

  const showTabs = !['onboarding', 'kronika-znaki'].includes(screen);

  return (
    <>
      {screen === 'onboarding' && (
        <Onboarding
          step={onbStep}
          tone={tone}
          onNext={() => setOnbStep(onbStep + 1)}
          onSkip={() => { setOnbStep(0); setScreen('dashboard'); }}
          onFinish={() => { setOnbStep(0); setScreen('dashboard'); }}
        />
      )}
      {screen === 'dashboard' && <Dashboard tone={tone} grace={grace} onOpenChat={() => go('chat')} />}
      {screen === 'chat' && <Chat tone={tone} grace={grace} onBack={() => go('dashboard')} />}
      {screen === 'kronika-saga' && <KronikaSaga tone={tone} onOpenZnaki={() => go('kronika-znaki')} />}
      {screen === 'kronika-znaki' && <KronikaZnaki tone={tone} onBack={() => go('kronika-saga')} />}
      {screen === 'ustawienia' && <Ustawienia tone={tone} grace={grace} onSetTone={setTone} onSetGrace={setGrace} />}
      {screen === 'horda' && <Horda tone={tone} />}

      {showTabs && (
        <div className="tabbar">
          <TabBtn active={screen === 'dashboard'} onClick={() => go('dashboard')} rune="ᚠ" label={tone === 'saga' ? 'Oko' : 'Dom'} />
          <TabBtn active={screen === 'horda'} onClick={() => go('horda')} rune="ᛟ" label={tone === 'saga' ? 'Sad' : 'Rośliny'} />
          <TabBtn active={screen === 'chat'} onClick={() => go('chat')} rune="ᛗ" label={tone === 'saga' ? 'Mowa' : 'Czat'} />
          <TabBtn active={screen === 'kronika-saga'} onClick={() => go('kronika-saga')} rune="ᚱ" label={tone === 'saga' ? 'Saga' : 'Kronika'} />
          <TabBtn active={screen === 'ustawienia'} onClick={() => go('ustawienia')} rune="ᚨ" label="Ustaw." />
        </div>
      )}

      {/* Reset onboarding secret button (tap brand 3x) */}
      <ResetListener onReset={() => { setOnbStep(0); setScreen('onboarding'); }} />
    </>
  );
}

function TabBtn({ active, onClick, rune, label }) {
  return (
    <button onClick={onClick} className={active ? 'active' : ''}>
      <span className="rune">{rune}</span>
      <span>{label}</span>
    </button>
  );
}

function ResetListener({ onReset }) {
  useEffect(() => {
    let count = 0, timer;
    const handle = (e) => {
      if (e.target.closest('.brand')) {
        count++;
        clearTimeout(timer);
        timer = setTimeout(() => { count = 0; }, 800);
        if (count >= 3) { count = 0; onReset(); }
      }
    };
    document.addEventListener('click', handle);
    return () => document.removeEventListener('click', handle);
  }, [onReset]);
  return null;
}

ReactDOM.createRoot(document.getElementById('app-root')).render(<App />);
