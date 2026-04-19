// Kronika / Saga history — 3 variants, Settings, Horde, OLED

function KronikaA() {
  // A: timeline of daily saga entries
  const entries = [
    ['Dzień 7', 'ominous', 'Saga o wodzie, której nie było', 'Słońce grzało mocno, lecz ziemia zaparła się w suchości. Len szepnął o głodzie wody.'],
    ['Dzień 6', 'neutral', 'Kronika spokoju', 'Nic nowego pod północnym niebem. Wszystkie runy w swym miejscu.'],
    ['Dzień 5', 'hopeful', 'Słońce łaski', 'Przesunięto Lín ku oknu. Zielsko podniosło łodygi o cal.'],
    ['Dzień 4', 'ominous', 'Noc zimna', 'Temperatura spadła do 14°. Len drzemał, lecz nie zmarniał.'],
  ];
  return (
    <SketchPhone w={320} h={660}>
      <SketchHeader title="Kronika" right="ᚠ" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {entries.map(([d, tone, t, b]) => (
          <Card key={d} tight style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontFamily: 'Caveat, cursive', fontSize: 18, color: '#c48e48' }}>{d}</div>
              <span className="chip" style={{ fontSize: 8, padding: '2px 6px' }}>{tone}</span>
            </div>
            <div style={{ fontFamily: 'Gloock, serif', fontSize: 13, marginTop: 2 }}>{t}</div>
            <div style={{ fontFamily: 'Kalam, cursive', fontSize: 11.5, color: '#5b5449', marginTop: 3, lineHeight: 1.3 }}>{b}</div>
          </Card>
        ))}
      </div>
    </SketchPhone>
  );
}

function KronikaB() {
  // B: sensor charts — line graphs per parameter
  const Chart = ({ rune, name, val }) => (
    <Card tight style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontFamily: 'Gloock, serif', fontSize: 20, color: '#c48e48', width: 20 }}>{rune}</div>
        <div style={{ fontFamily: 'Kalam, cursive', fontSize: 12, flex: 1 }}>{name}</div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>{val}</div>
      </div>
      <svg viewBox="0 0 260 50" style={{ width: '100%', height: 50, marginTop: 4, filter: 'url(#rough-filter)' }}>
        <path d="M0 35 L 20 30 L 40 32 L 60 25 L 80 28 L 100 20 L 120 22 L 140 18 L 160 25 L 180 30 L 200 28 L 220 35 L 240 30 L 260 25"
          stroke="#c48e48" strokeWidth="1.5" fill="none" />
        <line x1="0" y1="40" x2="260" y2="40" stroke="#c9bda5" strokeWidth="1" strokeDasharray="2 3" />
      </svg>
    </Card>
  );
  return (
    <SketchPhone w={320} h={660}>
      <SketchHeader title="Znaki · 7 dni" right="ᚠ" />
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {['słońce', 'dzień', 'tydzień', 'miesiąc'].map((s, i) => (
          <span key={s} className={i === 2 ? 'chip on' : 'chip'} style={{ flex: 1, justifyContent: 'center' }}>{s}</span>
        ))}
      </div>
      <Chart rune="ᚦ" name="Ciepło" val="22.3°" />
      <Chart rune="ᛚ" name="Woda" val="48%" />
      <Chart rune="ᛋ" name="Słońce" val="320lx" />
      <Chart rune="ᛃ" name="Gleba" val="31%" />
      <div style={{ fontFamily: 'Caveat, cursive', fontSize: 13, color: '#5b5449', textAlign: 'center', marginTop: 6 }}>
        ✦ 8. dzień — podlano · ◯ pełnia — przesunięto
      </div>
    </SketchPhone>
  );
}

function KronikaC() {
  // C: manuscript page — single poetic saga of the week
  return (
    <SketchPhone w={320} h={660}>
      <SketchHeader title="Saga tygodnia" right="⌄" />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Caveat, cursive', fontSize: 15, color: '#5b5449' }}>Anno grodu · dni 1–7</div>
        <div style={{ fontFamily: 'Gloock, serif', fontSize: 22, lineHeight: 1.1, marginTop: 4 }}>
          <span className="saga-text">Saga o Línie,<br/>co zwał deszczu</span>
          <span className="plain-text">Raport · Lín · tydzień 1</span>
        </div>
      </div>
      <div style={{ fontFamily: 'Kalam, cursive', fontSize: 12.5, lineHeight: 1.55, marginTop: 14, color: '#2a2622' }}>
        <span className="saga-text">
          Pierwszego dnia Freja dała łaskę — ciepło i wilgoć w zgodzie. Czwartej nocy zimno przyszło z północy, Lín drzemał. Siódmego dnia ziemia zaparła się w suchości; gdyby nie czerpak jarla przed zachodem, plon byłby smętny.
        </span>
        <span className="plain-text">
          Średnia temp: 21°C. Średnia wilgotność gleby: 42%. Jedno zdarzenie: gleba {'<'}45% przez 8h (dzień 7). 3 akcje użytkownika: 2× podlano, 1× przesunięto.
        </span>
      </div>
      <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="stamp">pieczęć jarla</span>
        <button className="sketch-btn ghost" style={{ fontSize: 11 }}>Eksport · manuskrypt</button>
      </div>
    </SketchPhone>
  );
}

function Settings() {
  return (
    <SketchPhone w={320} h={660}>
      <SketchHeader title="Ustawienia ogrodu" back right="ᚠ" />
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#9a8f7f', letterSpacing: '0.1em', marginBottom: 4 }}>TRYB NARRACJI</div>
      <Card tight style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['Saga', 'Zwykły'].map((t, i) => (
            <div key={t} style={{
              flex: 1, padding: '6px', textAlign: 'center',
              border: '1.5px solid #2a2622', borderRadius: 8,
              background: i === 0 ? '#c48e48' : 'transparent',
              color: i === 0 ? '#fff' : '#2a2622',
              fontFamily: 'Kalam, cursive', fontSize: 12, fontWeight: 700,
            }}>{t}</div>
          ))}
        </div>
      </Card>

      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#9a8f7f', letterSpacing: '0.1em', marginBottom: 4 }}>JAK CZĘSTO OKO PATRZY</div>
      <Card tight style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Kalam, cursive', fontSize: 12 }}>
          <span>Co 30 sekund</span><span style={{ color: '#5b5449' }}>›</span>
        </div>
      </Card>

      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#9a8f7f', letterSpacing: '0.1em', marginBottom: 4 }}>PROGI ŁASKI (auto z gatunku)</div>
      <Card tight style={{ marginBottom: 6 }}>
        <SensorRow rune="ᚦ" name="Ciepło" value="18–24°C" status="ok" variant="compact" />
        <SensorRow rune="ᛚ" name="Woda" value="45–65%" status="ok" variant="compact" />
        <SensorRow rune="ᛋ" name="Słońce" value="600lx+" status="ok" variant="compact" />
        <SensorRow rune="ᛃ" name="Gleba" value="45–70%" status="ok" variant="compact" />
      </Card>

      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#9a8f7f', letterSpacing: '0.1em', marginTop: 10, marginBottom: 4 }}>OKO</div>
      <Card tight>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Kalam, cursive', fontSize: 12, padding: '4px 0', borderBottom: '1px dashed #c9bda5' }}>
          <span>OLED</span><span style={{ color: '#5b5449' }}>auto · 10s</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Kalam, cursive', fontSize: 12, padding: '4px 0', borderBottom: '1px dashed #c9bda5' }}>
          <span>Próg wake (ToF)</span><span style={{ color: '#5b5449' }}>30 cm</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Kalam, cursive', fontSize: 12, padding: '4px 0' }}>
          <span>Ognisko Oka</span><span style={{ color: '#6b8a4a' }}>87% · 3 mies.</span>
        </div>
      </Card>
    </SketchPhone>
  );
}

function HordeView() {
  return (
    <SketchPhone w={320} h={660}>
      <SketchHeader title="Horda Oczu" right="ᚠ" />
      <div style={{ fontFamily: 'Caveat, cursive', fontSize: 15, color: '#5b5449', marginBottom: 8 }}>Skansen · 6 Oczu</div>

      {/* Map */}
      <div style={{
        height: 220, border: '1.5px solid #2a2622', borderRadius: 12,
        background: 'repeating-linear-gradient(45deg, rgba(196,142,72,0.08) 0 8px, transparent 8px 16px), #ede5d4',
        position: 'relative', boxShadow: '1.5px 2px 0 #2a2622',
      }}>
        {[
          ['Zielnik', 20, 30, '#6b8a4a'],
          ['Grządka', 55, 25, '#6b8a4a'],
          ['Spichlerz', 75, 55, '#c48e48'],
          ['Ziemianka', 30, 60, '#a8442e'],
          ['Pasieka', 60, 75, '#6b8a4a'],
          ['Gaj', 15, 85, '#6b8a4a'],
        ].map(([n, x, y, c], i) => (
          <div key={n} style={{
            position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              background: c, border: '1.5px solid #2a2622',
              boxShadow: '1px 1.5px 0 #2a2622',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, color: '#fff', fontWeight: 700,
            }}>ᚠ</div>
            <div style={{ fontFamily: 'Caveat, cursive', fontSize: 11, color: '#2a2622', marginTop: 2 }}>{n}</div>
          </div>
        ))}
      </div>

      {/* List below */}
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#9a8f7f', letterSpacing: '0.1em', marginTop: 14, marginBottom: 4 }}>
        1 KLĄTWA · 1 UWAGA · 4 ŁASKI
      </div>
      {[
        ['ᚠ', 'Ziemianka · rozsada', 'gleba 18%', '#a8442e'],
        ['ᚠ', 'Spichlerz · siano', 'wilgotność 72%', '#c48e48'],
      ].map(([r, n, d, c]) => (
        <Card key={n} tight style={{ marginBottom: 6, borderLeft: `4px solid ${c}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontFamily: 'Gloock, serif', fontSize: 18, color: c }}>{r}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Kalam, cursive', fontSize: 12, fontWeight: 700 }}>{n}</div>
              <div style={{ fontFamily: 'Caveat, cursive', fontSize: 13, color: '#5b5449', lineHeight: 1 }}>{d}</div>
            </div>
            <span style={{ fontSize: 12 }}>›</span>
          </div>
        </Card>
      ))}
    </SketchPhone>
  );
}

// OLED mini screens
function OledScreens() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, alignItems: 'start' }}>
      <OledTile label="1 · Łaska Freja">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: '100%' }}>
          <div style={{ fontSize: 42, lineHeight: 1 }}>◡‿◡</div>
          <div>
            <div style={{ fontSize: 14, color: '#c48e48' }}>LÍN</div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>Len zwyczajny</div>
            <div style={{ fontSize: 12, marginTop: 6, color: '#c48e48' }}>ᚠ 67</div>
          </div>
        </div>
      </OledTile>

      <OledTile label="2 · Znaki Ziemi">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, height: '100%' }}>
          <div>ᚦ 22.3°C</div>
          <div>ᛚ 48%</div>
          <div>ᛋ 320lx</div>
          <div>ᛃ 31%</div>
        </div>
      </OledTile>

      <OledTile label="3 · Wieszczba">
        <div style={{ textAlign: 'center', marginTop: 6 }}>
          <div style={{ fontSize: 16, color: '#c48e48' }}>ᛚ</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Napój ziemię</div>
          <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4 }}>do zachodu słońca</div>
        </div>
      </OledTile>

      <OledTile label="4 · Runy grodu">
        <div style={{ fontSize: 11, lineHeight: 1.5 }}>
          <div>Sentinel-Yggdrasil</div>
          <div style={{ color: '#c48e48' }}>ᚹ BLE · connected</div>
          <div style={{ opacity: 0.7 }}>ogn. 87% · 3 mies.</div>
          <div style={{ opacity: 0.7 }}>ostatni znak: 2 min</div>
        </div>
      </OledTile>

      <OledTile label="wake · otwarcie oka">
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <div style={{ fontSize: 28, letterSpacing: 4 }}>· · ·</div>
          <div style={{ fontSize: 10, opacity: 0.6, marginTop: 10 }}>ręka 20 cm → wybudzam</div>
        </div>
      </OledTile>

      <OledTile label="alarm · klątwa">
        <div style={{ textAlign: 'center', marginTop: 10, color: '#ff8a5a' }}>
          <div style={{ fontSize: 20 }}>⚠ ᚾ</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>PODLEJ TERAZ</div>
          <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>gleba 12% · 14h sucho</div>
        </div>
      </OledTile>
    </div>
  );
}

Object.assign(window, { KronikaA, KronikaB, KronikaC, Settings, HordeView, OledScreens });
