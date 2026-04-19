// Dashboard "Wzrok Freja" — 3 variants

function DashA({ tone = 'saga', state = 'ok' }) {
  // Variant A: classic — hero gauge on top, 4 sensor cards below
  const health = state === 'bless' ? 88 : state === 'ok' ? 67 : state === 'warn' ? 42 : 22;
  const statusOf = (good, warn) => state === 'bless' ? 'ok' : state === 'ok' ? (good ? 'ok' : 'warn') : state === 'warn' ? 'warn' : 'bad';
  const sagaMsg = {
    bless: 'Freja błogosławi. Len rośnie w ciszy, woda i słońce są w zgodzie.',
    ok: 'Freja przygląda się. Len żyje, lecz ziemia szepce o pragnieniu.',
    warn: 'Freja odwraca wzrok. Podlej ziemię nim słońce zajdzie.',
    bad: 'Klątwa. Trzy znaki krzyczą. Działaj natychmiast.',
  }[state];
  const plainMsg = {
    bless: 'Wszystkie parametry w zakresie. Nie trzeba nic robić.',
    ok: 'Wilgotność gleby na dolnej granicy. Podlej w ciągu 12h.',
    warn: 'Gleba sucha od 8h. Podlej 150 ml teraz.',
    bad: '3 z 4 parametrów poza zakresem. Wymaga uwagi.',
  }[state];

  return (
    <SketchPhone w={320} h={660}>
      <SketchHeader title="Zielnik Ragnhild" right="ᚠ" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 6px 14px' }}>
        <HealthGauge value={health} label="Łaska" />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Gloock, serif', fontSize: 16 }}>Lín · Len</div>
          <div style={{ fontFamily: 'Caveat, cursive', fontSize: 15, color: '#5b5449', marginTop: 2, lineHeight: 1.25 }}>
            <span className="saga-text">{sagaMsg}</span>
            <span className="plain-text">{plainMsg}</span>
          </div>
        </div>
      </div>

      <Card>
        <SensorRow rune="ᚦ" name="Ciepło" value="22.3°C" status={statusOf(true)} bar={55} optimalFrom={30} optimalTo={75} />
        <SensorRow rune="ᛚ" name="Woda (powietrze)" value="48%" status={statusOf(true)} bar={48} optimalFrom={45} optimalTo={65} />
        <SensorRow rune="ᛋ" name="Słońce" value="320 lux" status={statusOf(false)} bar={40} optimalFrom={55} optimalTo={90} />
        <SensorRow rune="ᛃ" name="Gleba" value="31%" status={statusOf(false)} bar={31} optimalFrom={45} optimalTo={70} />
      </Card>

      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
        <button className="sketch-btn primary" style={{ flex: 1, fontSize: 12 }}>Poradź się skalda</button>
        <button className="sketch-btn ghost" style={{ flex: 1, fontSize: 12 }}>Kronika</button>
      </div>

      <div style={{ marginTop: 12, textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#9a8f7f', letterSpacing: '0.1em' }}>
        OSTATNI ZNAK · 2 min temu
      </div>
    </SketchPhone>
  );
}

function DashB({ tone = 'saga', state = 'ok' }) {
  // Variant B: runestone — vertical "rune stone" metaphor with stacked panels
  const health = state === 'bless' ? 88 : state === 'ok' ? 67 : state === 'warn' ? 42 : 22;
  return (
    <SketchPhone w={320} h={660}>
      <div style={{ textAlign: 'center', padding: '4px 0 8px' }}>
        <div style={{ fontFamily: 'Caveat, cursive', fontSize: 16, color: '#5b5449' }}>Zielnik Ragnhild</div>
        <div className="runes-strip" style={{ fontSize: 18, letterSpacing: '0.25em' }}>ᚠ · ᛚ · ᛋ</div>
      </div>

      {/* Runestone */}
      <div style={{
        margin: '0 auto', width: 200,
        background: '#ede5d4', border: '2px solid #2a2622',
        borderRadius: '100px 100px 12px 12px',
        boxShadow: '2px 3px 0 #2a2622',
        padding: '18px 14px 14px', textAlign: 'center',
        position: 'relative',
      }}>
        <div style={{ fontFamily: 'Gloock, serif', fontSize: 44, lineHeight: 1, color: '#c48e48' }}>{health}</div>
        <div style={{ fontFamily: 'Caveat, cursive', fontSize: 17, color: '#2a2622', marginTop: 2 }}>Łaska Freja</div>
        <div style={{ fontFamily: 'Kalam, cursive', fontSize: 11, color: '#5b5449', marginTop: 6, lineHeight: 1.3 }}>
          <span className="saga-text">„Len woła o wodę. Zalej ziemię dwoma czerpakami."</span>
          <span className="plain-text">Gleba 31% — podlej 150 ml w 12h.</span>
        </div>
        <div style={{
          position: 'absolute', left: -8, right: -8, bottom: -12,
          height: 12, background: 'repeating-linear-gradient(90deg, #2a2622 0 6px, transparent 6px 10px)',
        }} />
      </div>

      {/* 4 runes grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 22 }}>
        {[
          ['ᚦ', 'Ciepło', '22.3°', 'ok'],
          ['ᛚ', 'Woda', '48%', 'ok'],
          ['ᛋ', 'Słońce', '320lx', 'warn'],
          ['ᛃ', 'Gleba', '31%', 'warn'],
        ].map(([r, n, v, s]) => (
          <Card key={n} tight>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontFamily: 'Gloock, serif', fontSize: 24, color: '#c48e48' }}>{r}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Kalam, cursive', fontSize: 11, color: '#5b5449' }}>{n}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>{v}</div>
              </div>
              <div style={{ width: 7, height: 7, borderRadius: 50, background: s === 'ok' ? '#6b8a4a' : '#c48e48' }} />
            </div>
          </Card>
        ))}
      </div>

      <div style={{ marginTop: 14, textAlign: 'center' }}>
        <button className="sketch-btn primary" style={{ fontSize: 12 }}>Rzuć runy ·  akcje</button>
      </div>
    </SketchPhone>
  );
}

function DashC({ tone = 'saga', state = 'ok' }) {
  // Variant C: diary page — pergamin z wpisem + strip sensorów na dole
  const health = state === 'bless' ? 88 : state === 'ok' ? 67 : state === 'warn' ? 42 : 22;
  return (
    <SketchPhone w={320} h={660}>
      <SketchHeader title="Dzień 7" right="ᚠ" />

      <div style={{ padding: '0 4px' }}>
        <div style={{ fontFamily: 'Caveat, cursive', fontSize: 16, color: '#5b5449' }}>Zielnik Ragnhild · Lín</div>
        <div style={{ fontFamily: 'Gloock, serif', fontSize: 28, lineHeight: 1.05, marginTop: 6 }}>
          <span className="saga-text">„Len woła o wodę."</span>
          <span className="plain-text">Gleba sucha od 8h.</span>
        </div>
        <div style={{ fontFamily: 'Kalam, cursive', fontSize: 12.5, marginTop: 10, lineHeight: 1.45, color: '#2a2622' }}>
          <span className="saga-text">
            Ciepło dnia jest łaskawe, ziemia jednak szepce o pragnieniu. Zalej korzeń dwoma czerpakami przed zachodem słońca — inaczej Freja odwróci wzrok od tej grządki.
          </span>
          <span className="plain-text">
            Temperatura i wilgotność powietrza w normie. Gleba 31% (próg 45%). Podlej 150 ml w ciągu 12h.
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <span className="stamp">łaska {health}%</span>
          <span className="chip">ᛃ gleba —</span>
        </div>
      </div>

      {/* Mini sensor strip */}
      <div style={{ position: 'absolute', left: 14, right: 14, bottom: 58 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#9a8f7f', letterSpacing: '0.12em', marginBottom: 4 }}>
          ZNAKI ZIEMI · 9:41
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
          {[
            ['ᚦ', '22°'], ['ᛚ', '48%'], ['ᛋ', '320'], ['ᛃ', '31%'],
          ].map(([r, v]) => (
            <div key={r} style={{
              flex: 1, textAlign: 'center',
              border: '1.5px solid #2a2622', borderRadius: 10,
              padding: '6px 4px', background: '#f5efe3',
              boxShadow: '1px 1.5px 0 #2a2622',
            }}>
              <div style={{ fontFamily: 'Gloock, serif', fontSize: 18, color: '#c48e48', lineHeight: 1 }}>{r}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </SketchPhone>
  );
}

Object.assign(window, { DashA, DashB, DashC });
