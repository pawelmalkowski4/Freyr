// Freyr's Eye — Screens (hi-fi prototype)
// Exports every screen component to window for main.jsx to compose.

const { useState, useEffect, useMemo } = React;

// ---------- helpers ----------
const StatusBar = () => (
  <>
    <div className="island" />
    <div className="status-bar">
      <span>9:41</span>
      <span>􀙇􀛨􀛭</span>
    </div>
  </>
);

const NavHead = ({ back, onBack, actions }) => (
  <div className="nav-head">
    <div className="back" onClick={onBack}>{back ? '‹' : ''}</div>
    <div className="actions">{actions}</div>
  </div>
);

const SensorBar = ({ name, value, unit, min, max, optMin, optMax, status = 'good' }) => {
  const pct = (v) => ((v - min) / (max - min)) * 100;
  return (
    <div className="sensor-bar-wrap">
      <div className="sensor-bar-head">
        <span className="name">{name}</span>
        <span className="val">{value}{unit}</span>
      </div>
      <div className="sensor-bar">
        <div className="opt" style={{ left: pct(optMin) + '%', width: (pct(optMax) - pct(optMin)) + '%' }} />
        <div className={`dot ${status}`} style={{ left: pct(value) + '%' }} />
      </div>
      <div className="sensor-ticks">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};

// ---------- ONBOARDING A ----------
function Onboarding({ step, onNext, onSkip, onFinish, tone }) {
  const steps = [
    {
      title: 'Freyr spogląda.',
      body: tone === 'saga'
        ? 'Dałeś ziarnu korzenie i miejsce w domu. Oko czuwa, gdy ty śpisz. Poznaj rytuał.'
        : 'Twoja roślina ma czujnik łączący się z aplikacją. Ten przewodnik trwa minutę.',
      cta: 'Rozpocznij',
      rune: 'ᚠ',
    },
    {
      title: 'Obudź Oko.',
      body: tone === 'saga'
        ? 'Wetknij drewno w ziemię aż do znaku. Przyłóż dłoń do pieczęci — zbudzi się.'
        : 'Wsuń sondę w doniczkę do oznaczonej linii. Przytrzymaj przycisk 3 sekundy.',
      cta: 'Rozumiem',
      rune: 'ᛗ',
      illus: 'probe',
    },
    {
      title: 'Zwiąż je z domem.',
      body: tone === 'saga'
        ? 'Podaj imię swojej sieci, a Oko przekaże wieści z daleka.'
        : 'Podłącz do Wi-Fi. Oko wymaga tylko sieci 2.4 GHz.',
      cta: 'Skanuj sieci',
      rune: 'ᚹ',
      illus: 'wifi',
    },
    {
      title: 'Nadaj mu imię.',
      body: tone === 'saga'
        ? 'Każda roślina to osobna istota. Jak ją zwiesz?'
        : 'Wybierz nazwę rośliny. Możesz ją zmienić później.',
      cta: 'Ukończ rytuał',
      rune: 'ᛟ',
      illus: 'name',
    },
  ];
  const s = steps[step];
  return (
    <div className="screen" style={{ padding: '40px 0 96px', display: 'flex', flexDirection: 'column' }}>
      {/* progress dots */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 28 }}>
        {steps.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 24 : 6, height: 6, borderRadius: 3,
            background: i === step ? 'var(--gold)' : 'rgba(30,26,22,0.2)',
            transition: 'width 0.3s',
          }} />
        ))}
      </div>

      {/* illustration */}
      <div style={{
        height: 220, margin: '0 24px 24px',
        background: 'linear-gradient(145deg, var(--paper-2), var(--paper))',
        border: '1px solid rgba(30,26,22,0.08)',
        borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {!s.illus && (
          <div style={{
            fontFamily: 'Cormorant Garamond, serif', fontSize: 180,
            color: 'var(--gold)', lineHeight: 1,
          }}>{s.rune}</div>
        )}
        {s.illus === 'probe' && <ProbeIllus />}
        {s.illus === 'wifi' && <WifiIllus />}
        {s.illus === 'name' && <NameIllus tone={tone} />}
      </div>

      <div style={{ padding: '0 28px', flex: 1 }}>
        <div style={{
          fontFamily: 'Cormorant Garamond, serif', fontWeight: 600,
          fontSize: 34, lineHeight: 1.05, color: 'var(--ink)', marginBottom: 10,
        }}>{s.title}</div>
        <div style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--ink-soft)' }}>{s.body}</div>
      </div>

      <div style={{ padding: '20px 28px 0' }}>
        <button className="btn primary block" onClick={step === steps.length - 1 ? onFinish : onNext}>
          {s.cta} <span style={{ marginLeft: 4 }}>→</span>
        </button>
        {step < steps.length - 1 && (
          <button className="btn ghost block" style={{ marginTop: 8, border: 'none', color: 'var(--ink-soft)' }} onClick={onSkip}>
            Pomiń rytuał
          </button>
        )}
      </div>
    </div>
  );
}

const ProbeIllus = () => (
  <svg viewBox="0 0 200 200" width="180" height="180">
    {/* pot */}
    <path d="M50 130 L60 180 L140 180 L150 130 Z" fill="#a47148" stroke="#5b4f40" strokeWidth="1.5" />
    {/* soil */}
    <ellipse cx="100" cy="130" rx="50" ry="8" fill="#3d2f22" />
    {/* plant */}
    <path d="M100 130 Q95 100 85 80" stroke="#6b8a4a" strokeWidth="3" fill="none" />
    <ellipse cx="82" cy="78" rx="14" ry="6" fill="#6b8a4a" transform="rotate(-30 82 78)" />
    <ellipse cx="95" cy="95" rx="12" ry="5" fill="#7d9a5a" transform="rotate(20 95 95)" />
    {/* probe */}
    <rect x="115" y="60" width="6" height="70" fill="#c4934a" rx="1" />
    <circle cx="118" cy="55" r="10" fill="#c4934a" stroke="#8a6328" strokeWidth="1.5" />
    <text x="118" y="60" textAnchor="middle" fontSize="12" fill="#fff" fontFamily="Cormorant Garamond, serif">ᚠ</text>
    {/* line indicator */}
    <line x1="108" y1="128" x2="128" y2="128" stroke="#a8442e" strokeWidth="1.5" strokeDasharray="2,2" />
    <text x="130" y="131" fontSize="8" fill="#a8442e" fontFamily="JetBrains Mono, monospace">znak</text>
  </svg>
);

const WifiIllus = () => (
  <svg viewBox="0 0 200 200" width="160" height="160">
    <circle cx="100" cy="140" r="8" fill="#c4934a" />
    <path d="M70 120 Q100 90 130 120" stroke="#c4934a" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M55 105 Q100 60 145 105" stroke="#c4934a" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
    <path d="M40 90 Q100 30 160 90" stroke="#c4934a" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.4" />
  </svg>
);

const NameIllus = ({ tone }) => (
  <div style={{ width: '80%' }}>
    <div style={{
      background: 'var(--paper)', border: '1px solid rgba(30,26,22,0.12)',
      borderRadius: 12, padding: '14px 16px', marginBottom: 10,
      fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: 'var(--ink)',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <span style={{ color: 'var(--gold)' }}>ᛟ</span>
      <span>{tone === 'saga' ? 'Yggdrasil Młodszy' : 'Monstera salonowa'}</span>
      <span style={{ marginLeft: 'auto', color: 'var(--gold)', fontFamily: 'Inter', fontSize: 14 }}>✎</span>
    </div>
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--ink-faint)', textAlign: 'center' }}>
      ZIEMIA · SŁOŃCE · WICHER · KORZEŃ
    </div>
  </div>
);

// ---------- DASHBOARD A ----------
function Dashboard({ tone, grace, onOpenChat }) {
  const graceData = {
    hoja: { val: 84, label: 'Łaska Freyra', status: 'good' },
    warn: { val: 52, label: 'Niepokój', status: 'warn' },
    bad:  { val: 23, label: 'Gniew Freyra', status: 'bad' },
  };
  const g = graceData[grace] || graceData.hoja;

  const sensors = {
    hoja: [
      { name: 'Ziemia (wilgoć)', value: 58, unit: '%', min: 0, max: 100, optMin: 40, optMax: 70, status: 'good' },
      { name: 'Słońce',          value: 820, unit: ' lx', min: 0, max: 2000, optMin: 500, optMax: 1500, status: 'good' },
      { name: 'Wicher (temp.)',  value: 22, unit: '°C', min: 10, max: 35, optMin: 18, optMax: 26, status: 'good' },
      { name: 'Korzeń (EC)',     value: 1.4, unit: ' mS', min: 0, max: 3, optMin: 1.0, optMax: 2.0, status: 'good' },
    ],
    warn: [
      { name: 'Ziemia (wilgoć)', value: 28, unit: '%', min: 0, max: 100, optMin: 40, optMax: 70, status: 'warn' },
      { name: 'Słońce',          value: 420, unit: ' lx', min: 0, max: 2000, optMin: 500, optMax: 1500, status: 'warn' },
      { name: 'Wicher (temp.)',  value: 22, unit: '°C', min: 10, max: 35, optMin: 18, optMax: 26, status: 'good' },
      { name: 'Korzeń (EC)',     value: 1.4, unit: ' mS', min: 0, max: 3, optMin: 1.0, optMax: 2.0, status: 'good' },
    ],
    bad: [
      { name: 'Ziemia (wilgoć)', value: 12, unit: '%', min: 0, max: 100, optMin: 40, optMax: 70, status: 'bad' },
      { name: 'Słońce',          value: 180, unit: ' lx', min: 0, max: 2000, optMin: 500, optMax: 1500, status: 'bad' },
      { name: 'Wicher (temp.)',  value: 30, unit: '°C', min: 10, max: 35, optMin: 18, optMax: 26, status: 'bad' },
      { name: 'Korzeń (EC)',     value: 0.4, unit: ' mS', min: 0, max: 3, optMin: 1.0, optMax: 2.0, status: 'warn' },
    ],
  }[grace];

  const headline = {
    hoja: { saga: 'Freyr uśmiecha się nad Yggdrasilem.', plain: 'Monstera czuje się dobrze.' },
    warn: { saga: 'Freyr mruży oko. Ziemia schnie.',     plain: 'Uwaga: niska wilgoć gleby.' },
    bad:  { saga: 'Gniew Freyra rośnie. Ratuj roślinę.', plain: 'Alarm: krytyczne wartości.' },
  }[grace][tone];

  return (
    <div className="screen">
      <NavHead actions={<span style={{ fontSize: 20 }}>⚑</span>} />
      <div className="screen-sub" style={{ paddingTop: 0 }}>
        {tone === 'saga' ? 'Dom · Wieść z Sadu' : 'Dom · Teraz'}
      </div>
      <div className="screen-title" style={{ paddingBottom: 16 }}>
        {tone === 'saga' ? 'Yggdrasil Młodszy' : 'Monstera salonowa'}
      </div>

      {/* Hero with grace */}
      <div className="hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <div className="gauge-label">{tone === 'saga' ? g.label : ({ hoja: 'Stan', warn: 'Uwaga', bad: 'Alarm' }[grace])}</div>
            <div className="gauge-num">{g.val}<span style={{ fontSize: 28, color: 'var(--ink-soft)' }}>%</span></div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className={`chip ${g.status}`} style={{ marginBottom: 6 }}>
              <span className="status-dot" style={{ background: `var(--${g.status})` }} />
              {g.status === 'good' ? 'Stabilnie' : g.status === 'warn' ? 'Czuwaj' : 'Działaj'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'JetBrains Mono, monospace' }}>
              odczyt · 2 min temu
            </div>
          </div>
        </div>
        <div style={{
          fontFamily: 'Cormorant Garamond, serif', fontSize: 20, lineHeight: 1.25,
          color: 'var(--ink)', marginTop: 14, paddingTop: 14,
          borderTop: '1px solid rgba(30,26,22,0.08)',
        }}>
          {headline}
        </div>
      </div>

      {/* Sensors */}
      <div className="card">
        <div className="card-pad" style={{ paddingBottom: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 600 }}>
              {tone === 'saga' ? 'Cztery żywioły' : 'Parametry'}
            </div>
            <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'JetBrains Mono, monospace' }}>
              30s TEMU
            </span>
          </div>
          {sensors.map((s, i) => <SensorBar key={i} {...s} />)}
        </div>
      </div>

      {/* Action prompt */}
      {grace !== 'hoja' && (
        <div className="card paper2">
          <div className="card-pad" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, color: 'var(--gold)', lineHeight: 1 }}>ᚦ</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                {tone === 'saga'
                  ? (grace === 'warn' ? 'Freyr radzi: nakarm ziemię.' : 'Freyr woła: ratuj pośpiesznie!')
                  : (grace === 'warn' ? 'Sugestia: podlej w ciągu doby.' : 'Pilne: podlej teraz i przenieś bliżej okna.')}
              </div>
              <button className="btn primary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={onOpenChat}>
                {tone === 'saga' ? 'Zapytaj Oka' : 'Porozmawiaj'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- CHAT A ----------
function Chat({ tone, grace, onBack }) {
  const conv = useMemo(() => {
    if (tone === 'saga') {
      return [
        { from: 'bot', text: 'Witaj, strażniku sadu. Yggdrasil oddycha spokojnie — cóż cię trapi?' },
        { from: 'user', text: 'Czy potrzebuje wody?' },
        { from: 'bot', text: grace === 'bad'
            ? 'Pilnie. Ziemia krzyczy z pragnienia — 12%. Nalej około pół miarki letniej wody, powoli, do spodka.'
            : grace === 'warn'
              ? 'Nie teraz, ale wkrótce. Ziemia trzyma 28% wilgoci. Obudź ją w ciągu doby.'
              : 'Nie dziś. Ziemia trzyma łaskę — 58%. Odwiedź go za trzy słońca.',
        },
        { from: 'user', text: 'A światło?' },
        { from: 'bot', text: grace === 'hoja'
            ? 'Słońce obmywa go w sam raz. Utrzymaj go w tym miejscu.'
            : 'Słońce słabnie w tym kącie. Przesuń go bliżej okna, lecz strzeż przed południowym żarem.',
        },
      ];
    }
    return [
      { from: 'bot', text: 'Cześć! Jak mogę pomóc?' },
      { from: 'user', text: 'Czy trzeba teraz podlać?' },
      { from: 'bot', text: grace === 'bad'
          ? 'Tak, pilnie. Wilgoć gleby wynosi 12% (minimum 40%). Podlej ~150 ml letniej wody.'
          : grace === 'warn'
            ? 'Nie teraz, ale w ciągu 24h. Wilgoć spadła do 28%.'
            : 'Nie. Wilgoć wynosi 58%. Następne sprawdzenie za 3 dni.',
      },
      { from: 'user', text: 'A światło?' },
      { from: 'bot', text: grace === 'hoja'
          ? 'W normie (820 lx). Bez zmian.'
          : 'Za mało (420 lx). Przesuń bliżej okna, ale unikaj bezpośredniego słońca w południe.',
      },
    ];
  }, [tone, grace]);

  // add timestamps to conv
  const convWithMeta = conv.map((m, i) => ({
    ...m,
    time: ['9:38', '9:38', '9:39', '9:40', '9:41'][i] || '9:41',
  }));

  const suggestions = tone === 'saga'
    ? ['Jaka wróżba na dziś?', 'Czy głodny?', 'Dlaczego więdnie?', 'Opowiedz sagę tygodnia']
    : ['Status rośliny', 'Kiedy nawozić?', 'Dlaczego liście żółkną?', 'Jak przesadzić?'];

  const graceHint = {
    hoja: { rune: 'ᚠ', text: tone === 'saga' ? 'Yggdrasil trwa w łasce Freyra.' : 'Monstera — stan OK, 58% wilgoci.' },
    warn: { rune: 'ᚦ', text: tone === 'saga' ? 'Ziemia schnie. Freyr mruży oko.' : 'Niska wilgoć gleby (28%).' },
    bad:  { rune: 'ᚾ', text: tone === 'saga' ? 'Gniew Freyra. Działaj pośpiesznie.' : 'Alarm: krytyczne wartości.' },
  }[grace];

  return (
    <div className="chat-screen">
      {/* Header */}
      <div className="chat-header">
        <div className="nav-head" style={{ padding: '6px 4px 10px' }}>
          <div className="back" onClick={onBack}>‹</div>
          <div style={{ display: 'flex', gap: 10, color: 'var(--ink-soft)', fontSize: 18 }}>
            <span>⟲</span>
            <span>⋯</span>
          </div>
        </div>
        <div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 600, lineHeight: 1.1 }}>
            {tone === 'saga' ? 'Oko Freyra' : 'Asystent rośliny'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em' }}>
            <span className="status-dot" style={{ background: 'var(--good)' }} />
            {tone === 'saga' ? 'CZUWA · YGGDRASIL MŁODSZY' : 'ONLINE · MONSTERA'}
          </div>
        </div>
      </div>

      {/* Body (scrolls) */}
      <div className="chat-body">
        <div className="chat-day-divider">{tone === 'saga' ? 'dzisiejszy poranek' : 'dzisiaj'}</div>

        {/* Context card */}
        <div className="chat-context-card">
          <span className="rune">{graceHint.rune}</span>
          <span className="txt">{graceHint.text}</span>
        </div>

        {convWithMeta.map((m, i) => (
          m.from === 'user' ? (
            <div key={i} className="bubble-row right">
              <div>
                <div className="bubble user">{m.text}</div>
                <div className="bubble-time">{m.time}</div>
              </div>
            </div>
          ) : (
            <div key={i} className="bubble-row left">
              <div className={`bubble-avatar ${i > 0 && convWithMeta[i-1].from === 'bot' ? 'invis' : ''}`}>ᚠ</div>
              <div>
                <div className="bubble bot">{m.text}</div>
                <div className="bubble-time">{m.time}</div>
              </div>
            </div>
          )
        ))}
      </div>

      {/* Footer (pinned) */}
      <div className="chat-footer">
        <div className="chat-suggestions">
          {suggestions.map((s, i) => (
            <button key={i}>{s}</button>
          ))}
        </div>
        <div className="chat-input-row">
          <div className="input">
            <span>{tone === 'saga' ? 'Mów do Oka…' : 'Napisz wiadomość…'}</span>
            <span className="mic">◉</span>
          </div>
          <button className="send">↑</button>
        </div>
      </div>
    </div>
  );
}

// ---------- KRONIKA — SAGA (timeline) ----------
function KronikaSaga({ tone, onOpenZnaki }) {
  const events = [
    { day: 'Dziś', rune: 'ᚹ', title: tone === 'saga' ? 'Ziemia zaszeptała' : 'Wilgoć spadła', detail: '28% · 14:22', tone: 'warn' },
    { day: 'Dziś', rune: 'ᛋ', title: tone === 'saga' ? 'Słońce objęło korony' : 'Peak słońca', detail: '1240 lx · 12:05', tone: 'good' },
    { day: 'Wczoraj', rune: 'ᛚ', title: tone === 'saga' ? 'Nakarmiłeś Yggdrasila' : 'Podlano roślinę', detail: '180 ml · 18:40', tone: 'good' },
    { day: 'Wczoraj', rune: 'ᚦ', title: tone === 'saga' ? 'Freyr upomniał cię' : 'Ostrzeżenie: sucha gleba', detail: '22% · 09:15', tone: 'warn' },
    { day: '3 dni temu', rune: 'ᛗ', title: tone === 'saga' ? 'Obudziłeś Oko' : 'Sparowano czujnik', detail: 'Aktywacja · 11:02', tone: 'good' },
    { day: '5 dni temu', rune: 'ᛉ', title: tone === 'saga' ? 'Wicher przegnał chłód' : 'Temperatura wzrosła', detail: '18°C → 24°C', tone: 'good' },
  ];

  const grouped = events.reduce((acc, e) => {
    (acc[e.day] = acc[e.day] || []).push(e);
    return acc;
  }, {});

  return (
    <div className="screen">
      <NavHead actions={
        <button className="btn ghost" style={{ fontSize: 11, padding: '6px 12px' }} onClick={onOpenZnaki}>
          Znaki →
        </button>
      } />
      <div className="screen-sub" style={{ paddingTop: 0 }}>Kronika</div>
      <div className="screen-title">{tone === 'saga' ? 'Saga sadu' : 'Zdarzenia'}</div>
      <div style={{ padding: '12px 24px 16px', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
        {tone === 'saga'
          ? 'Każdy dzień zostawia znak. Przewiń wstecz, by ujrzeć drogę Yggdrasila.'
          : 'Chronologiczna historia zdarzeń rośliny.'}
      </div>

      {Object.entries(grouped).map(([day, items]) => (
        <div key={day} style={{ padding: '8px 24px' }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
            color: 'var(--gold-deep)', letterSpacing: '0.12em', textTransform: 'uppercase',
            marginBottom: 8, marginTop: 12,
          }}>— {day} —</div>
          <div style={{ position: 'relative', paddingLeft: 32 }}>
            <div style={{
              position: 'absolute', left: 14, top: 8, bottom: 8, width: 1,
              background: 'rgba(196,147,74,0.3)',
            }} />
            {items.map((e, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 14, position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: -26, top: 0,
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--paper)', border: `2px solid var(--${e.tone})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Cormorant Garamond, serif', fontSize: 14, color: `var(--${e.tone})`,
                }}>{e.rune}</div>
                <div style={{ flex: 1, paddingLeft: 10 }}>
                  <div style={{
                    fontFamily: 'Cormorant Garamond, serif', fontSize: 18, lineHeight: 1.2,
                    color: 'var(--ink)', fontWeight: 600,
                  }}>{e.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
                    {e.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- KRONIKA — ZNAKI (charts) ----------
function KronikaZnaki({ tone, onBack }) {
  const series = [
    { name: tone === 'saga' ? 'Ziemia' : 'Wilgoć gleby', unit: '%', color: 'var(--good)', data: [65, 62, 58, 55, 48, 42, 38, 58, 54, 50, 42, 32, 28, 58], opt: [40, 70] },
    { name: tone === 'saga' ? 'Słońce' : 'Światło',     unit: 'lx', color: 'var(--warn)', data: [200, 420, 820, 1240, 1100, 800, 300, 180, 420, 860, 1160, 1200, 900, 820], opt: [500, 1500], max: 1500 },
    { name: tone === 'saga' ? 'Wicher' : 'Temperatura', unit: '°C', color: 'var(--bad)', data: [19, 20, 21, 22, 23, 24, 23, 22, 22, 23, 24, 25, 23, 22], opt: [18, 26], max: 30, min: 15 },
  ];
  const ranges = ['24h', '7 dni', '30 dni', 'Rok'];
  const [range, setRange] = useState('7 dni');

  return (
    <div className="screen">
      <NavHead back onBack={onBack} actions={<span style={{ fontSize: 18 }}>⇪</span>} />
      <div className="screen-sub" style={{ paddingTop: 0 }}>Kronika</div>
      <div className="screen-title">{tone === 'saga' ? 'Znaki żywiołów' : 'Historia pomiarów'}</div>

      {/* Range selector */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{
          display: 'flex', gap: 4, padding: 4,
          background: 'var(--paper-2)', borderRadius: 999,
        }}>
          {ranges.map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              flex: 1, border: 'none', cursor: 'pointer',
              background: r === range ? 'var(--paper)' : 'transparent',
              color: r === range ? 'var(--ink)' : 'var(--ink-soft)',
              padding: '8px 0', borderRadius: 999,
              fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
              boxShadow: r === range ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              fontWeight: 500, letterSpacing: '0.04em',
            }}>{r}</button>
          ))}
        </div>
      </div>

      {series.map((s, i) => (
        <div className="card" key={i}>
          <div className="card-pad">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'JetBrains Mono, monospace' }}>
                  OBECNIE · {s.data[s.data.length - 1]}{s.unit}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'JetBrains Mono, monospace' }}>ZAKRES</div>
                <div style={{ fontSize: 13, color: 'var(--ink)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {Math.min(...s.data)}–{Math.max(...s.data)}{s.unit}
                </div>
              </div>
            </div>
            <Chart data={s.data} color={s.color} opt={s.opt} max={s.max || 100} min={s.min || 0} />
          </div>
        </div>
      ))}

      {tone === 'saga' && (
        <div className="card paper2" style={{ marginTop: 12 }}>
          <div className="card-pad">
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 600, marginBottom: 6 }}>
              Wróżba tygodnia
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
              Ziemia dwukrotnie popadła w niepokój. Słońce hojne. Wicher łagodny.
              Dobry tydzień — lecz nakarm Yggdrasila częściej.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Chart = ({ data, color, opt, max = 100, min = 0 }) => {
  const w = 320, h = 70, pad = 4;
  const norm = v => h - pad - ((v - min) / (max - min)) * (h - pad * 2);
  const pts = data.map((v, i) => [pad + (i / (data.length - 1)) * (w - pad * 2), norm(v)]);
  const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = path + ` L${w - pad} ${h - pad} L${pad} ${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="chart-svg">
      {opt && (
        <rect x={pad} y={norm(opt[1])} width={w - pad * 2}
          height={Math.max(0, norm(opt[0]) - norm(opt[1]))}
          fill="rgba(107,138,74,0.15)" />
      )}
      <path d={area} fill={color} opacity="0.15" />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => i === pts.length - 1 && (
        <circle key={i} cx={p[0]} cy={p[1]} r="4" fill={color} stroke="#fff" strokeWidth="2" />
      ))}
    </svg>
  );
};

// ---------- USTAWIENIA ----------
function Ustawienia({ tone, grace, onSetTone, onSetGrace }) {
  return (
    <div className="screen">
      <NavHead actions={null} />
      <div className="screen-sub" style={{ paddingTop: 0 }}>Ustawienia</div>
      <div className="screen-title">{tone === 'saga' ? 'Rytuały i progi' : 'Konfiguracja'}</div>

      {/* Plant profile */}
      <div style={{ padding: '14px 16px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12,
          background: 'var(--paper-2)', borderRadius: 16, padding: '14px 16px' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%',
            background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Cormorant Garamond, serif', fontSize: 24, color: '#fff' }}>ᛟ</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600 }}>
              {tone === 'saga' ? 'Yggdrasil Młodszy' : 'Monstera salonowa'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'JetBrains Mono, monospace' }}>
              Monstera deliciosa · Oko #A7F2
            </div>
          </div>
          <span style={{ color: 'var(--ink-faint)', fontSize: 22 }}>›</span>
        </div>
      </div>

      {/* Tone toggle */}
      <div className="card">
        <div className="card-pad">
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
            Ton narracji
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 12 }}>
            Czy Oko ma mówić rzeczowo, czy sagą?
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['saga', 'plain'].map(t => (
              <button key={t} onClick={() => onSetTone(t)} style={{
                flex: 1, padding: '14px 8px', borderRadius: 14,
                border: tone === t ? '2px solid var(--gold)' : '1px solid rgba(30,26,22,0.12)',
                background: tone === t ? 'rgba(196,147,74,0.1)' : 'var(--paper)',
                cursor: 'pointer', textAlign: 'left',
              }}>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>
                  {t === 'saga' ? 'Saga ᚠ' : 'Rzeczowo'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>
                  {t === 'saga' ? '„Freyr mruży oko…"' : '„Wilgoć 28%"'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grace thresholds */}
      <div className="card">
        <div className="card-pad">
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
            Progi {tone === 'saga' ? 'łaski Freyra' : 'alarmów'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 14 }}>
            Kiedy Oko ma wołać, a kiedy milczeć.
          </div>

          <ThresholdSlider label={tone === 'saga' ? 'Ziemia — próg niepokoju' : 'Wilgoć — ostrzeżenie'}
            min={0} max={100} unit="%" value={35} />
          <ThresholdSlider label={tone === 'saga' ? 'Ziemia — próg gniewu' : 'Wilgoć — alarm'}
            min={0} max={100} unit="%" value={20} />
          <ThresholdSlider label={tone === 'saga' ? 'Słońce — próg zmierzchu' : 'Światło — minimum'}
            min={0} max={2000} unit=" lx" value={500} />

          {/* Preview state (dev tweak) */}
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(30,26,22,0.08)' }}>
            <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'JetBrains Mono, monospace', marginBottom: 8 }}>
              PODGLĄD STANU
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { k: 'hoja', label: tone === 'saga' ? 'Łaska' : 'OK',    c: 'good' },
                { k: 'warn', label: tone === 'saga' ? 'Niepokój' : 'Uwaga', c: 'warn' },
                { k: 'bad',  label: tone === 'saga' ? 'Gniew' : 'Alarm',   c: 'bad' },
              ].map(o => (
                <button key={o.k} onClick={() => onSetGrace(o.k)} style={{
                  flex: 1, padding: '10px 4px', borderRadius: 10,
                  border: grace === o.k ? `2px solid var(--${o.c})` : '1px solid rgba(30,26,22,0.12)',
                  background: grace === o.k ? `rgba(${o.c === 'good' ? '107,138,74' : o.c === 'warn' ? '196,142,72' : '168,68,46'}, 0.08)` : 'var(--paper)',
                  cursor: 'pointer', fontSize: 12,
                  fontFamily: 'Inter, sans-serif', fontWeight: 600, color: `var(--${o.c})`,
                }}>{o.label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Device rows */}
      <div className="card">
        <div className="row">
          <span className="rune-label">ᛗ</span>
          <span className="title">Oko — parowanie</span>
          <span className="detail">#A7F2</span>
          <span className="chev">›</span>
        </div>
        <div className="row">
          <span className="rune-label">ᚹ</span>
          <span className="title">Wi-Fi</span>
          <span className="detail">dom_2.4</span>
          <span className="chev">›</span>
        </div>
        <div className="row">
          <span className="rune-label">ᛒ</span>
          <span className="title">Powiadomienia</span>
          <span className="detail">Włączone</span>
          <span className="chev">›</span>
        </div>
        <div className="row">
          <span className="rune-label">ᚨ</span>
          <span className="title">O aplikacji</span>
          <span className="detail">v 0.7.2</span>
          <span className="chev">›</span>
        </div>
      </div>
    </div>
  );
}

const ThresholdSlider = ({ label, min, max, unit, value }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
      <span>{label}</span>
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{value}{unit}</span>
    </div>
    <div style={{ position: 'relative', height: 6, background: 'var(--paper-3)', borderRadius: 999 }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0,
        width: ((value - min) / (max - min) * 100) + '%',
        background: 'var(--gold)', borderRadius: 999 }} />
      <div style={{ position: 'absolute',
        left: ((value - min) / (max - min) * 100) + '%',
        top: '50%', transform: 'translate(-50%,-50%)',
        width: 18, height: 18, borderRadius: '50%',
        background: 'var(--paper)', border: '2px solid var(--gold)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }} />
    </div>
  </div>
);

// ---------- HORDA OCZU ----------
function Horda({ tone }) {
  const plants = [
    { id: 1, name: tone === 'saga' ? 'Yggdrasil Młodszy' : 'Monstera salonowa',  room: 'Salon',   rune: 'ᛟ', tone: 'good', value: 84, x: 22, y: 42 },
    { id: 2, name: tone === 'saga' ? 'Liść Freji' : 'Fikus gumowy',               room: 'Salon',   rune: 'ᚠ', tone: 'good', value: 72, x: 48, y: 56 },
    { id: 3, name: tone === 'saga' ? 'Pragnienie Lokiego' : 'Paproć łazienkowa',  room: 'Łazienka',rune: 'ᛚ', tone: 'warn', value: 52, x: 68, y: 28 },
    { id: 4, name: tone === 'saga' ? 'Włócznia Odyna' : 'Sansewieria',            room: 'Sypialnia',rune: 'ᛋ', tone: 'bad',  value: 18, x: 82, y: 72 },
    { id: 5, name: tone === 'saga' ? 'Wieniec Idun' : 'Bazylia kuchenna',         room: 'Kuchnia', rune: 'ᛝ', tone: 'good', value: 68, x: 18, y: 78 },
  ];

  const counts = {
    good: plants.filter(p => p.tone === 'good').length,
    warn: plants.filter(p => p.tone === 'warn').length,
    bad:  plants.filter(p => p.tone === 'bad').length,
  };

  return (
    <div className="screen">
      <NavHead actions={<span style={{ fontSize: 18 }}>+</span>} />
      <div className="screen-sub" style={{ paddingTop: 0 }}>{tone === 'saga' ? 'Sad' : 'Moje rośliny'}</div>
      <div className="screen-title">{tone === 'saga' ? 'Horda Oczu' : 'Wszystkie'}</div>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px' }}>
        <div style={{ flex: 1, background: 'rgba(107,138,74,0.1)', border: '1px solid rgba(107,138,74,0.25)',
          borderRadius: 14, padding: '10px 12px' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 700, color: 'var(--good)', lineHeight: 1 }}>
            {counts.good}
          </div>
          <div style={{ fontSize: 11, color: 'var(--good)', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
            {tone === 'saga' ? 'W ŁASCE' : 'OK'}
          </div>
        </div>
        <div style={{ flex: 1, background: 'rgba(196,142,72,0.1)', border: '1px solid rgba(196,142,72,0.3)',
          borderRadius: 14, padding: '10px 12px' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 700, color: '#8a5f28', lineHeight: 1 }}>
            {counts.warn}
          </div>
          <div style={{ fontSize: 11, color: '#8a5f28', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
            {tone === 'saga' ? 'W NIEPOKOJU' : 'UWAGA'}
          </div>
        </div>
        <div style={{ flex: 1, background: 'rgba(168,68,46,0.1)', border: '1px solid rgba(168,68,46,0.25)',
          borderRadius: 14, padding: '10px 12px' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 700, color: 'var(--bad)', lineHeight: 1 }}>
            {counts.bad}
          </div>
          <div style={{ fontSize: 11, color: 'var(--bad)', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
            {tone === 'saga' ? 'W GNIEWIE' : 'ALARM'}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="map">
        {/* room labels */}
        <div style={{ position: 'absolute', top: 8, left: 12, fontSize: 10, color: 'var(--ink-faint)',
          fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>SALON</div>
        <div style={{ position: 'absolute', top: 8, right: 12, fontSize: 10, color: 'var(--ink-faint)',
          fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>ŁAZIENKA</div>
        <div style={{ position: 'absolute', bottom: 8, left: 12, fontSize: 10, color: 'var(--ink-faint)',
          fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>KUCHNIA</div>
        <div style={{ position: 'absolute', bottom: 8, right: 12, fontSize: 10, color: 'var(--ink-faint)',
          fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>SYPIALNIA</div>
        {/* room dividers */}
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(30,26,22,0.1)' }} />
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(30,26,22,0.1)' }} />

        {plants.map(p => (
          <div key={p.id} className={`map-pin ${p.tone === 'good' ? '' : p.tone}`}
            style={{ left: p.x + '%', top: p.y + '%' }}>
            <div className="dot"><span>{p.rune}</span></div>
            <div className="nm">{p.name.split(' ')[0]}</div>
          </div>
        ))}
      </div>

      {/* List */}
      <div style={{ padding: '18px 16px 0' }}>
        <div style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '0.1em', marginBottom: 8, paddingLeft: 4 }}>WSZYSTKIE · {plants.length}</div>
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        {plants.map((p, i) => (
          <div key={p.id} className="row">
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: p.tone === 'good' ? 'rgba(107,138,74,0.15)' :
                         p.tone === 'warn' ? 'rgba(196,142,72,0.15)' : 'rgba(168,68,46,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Cormorant Garamond, serif', fontSize: 20,
              color: `var(--${p.tone})`,
            }}>{p.rune}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 17, fontWeight: 600, lineHeight: 1.1 }}>
                {p.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
                {p.room.toUpperCase()} · {p.value}%
              </div>
            </div>
            <span className="chev">›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Expose to main
Object.assign(window, { Onboarding, Dashboard, Chat, KronikaSaga, KronikaZnaki, Ustawienia, Horda, StatusBar });
