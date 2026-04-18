// Skald chat — 3 variants

function ChatA() {
  // A: classic messaging — bubbles + input
  return (
    <SketchPhone w={320} h={660}>
      <SketchHeader title="Skald-Zielarz" back right="ᚠ" />
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#9a8f7f', letterSpacing: '0.1em', textAlign: 'center', marginTop: -4, marginBottom: 8 }}>
        KONTEKST · LÍN · 24h AGREGATY
      </div>
      <div style={{ height: 440, overflow: 'hidden' }}>
        <ChatBubble>
          <span className="saga-text">Słuchaj, jarlu. Len trzykrotnie od świtu wołał o wodę.</span>
          <span className="plain-text">Gleba 31% — poniżej progu 45% od 8h.</span>
        </ChatBubble>
        <ChatBubble from="user">Czemu liście żółkną?</ChatBubble>
        <ChatBubble>
          <span className="saga-text">Korzeń pragnie. Jeśli ziemia zeschnie na kamień, Freja odwróci wzrok — a len pożółknie od podstawy. Zalej dwa czerpaki przed zachodem.</span>
          <span className="plain-text">Prawdopodobnie suchość gleby. Podlej 150 ml teraz, sprawdź za 2h.</span>
        </ChatBubble>
        <ChatBubble from="user">A światło?</ChatBubble>
        <ChatBubble>
          <span className="saga-text">Słońce dnia mdłe — 320 luks. Len chce 600+ by plon był hojny.</span>
          <span className="plain-text">320 lux — za mało. Zalecane 600+ lux przez 6h dziennie.</span>
        </ChatBubble>
      </div>
      <div style={{ position: 'absolute', left: 14, right: 14, bottom: 40, display: 'flex', gap: 6 }}>
        <div className="placeholder" style={{ flex: 1, height: 36, border: '1.5px solid #2a2622', borderStyle: 'solid', background: '#f5efe3', color: '#9a8f7f', fontFamily: 'Kalam, cursive', fontSize: 12 }}>
          Pytaj skalda…
        </div>
        <button className="sketch-btn primary" style={{ padding: '6px 12px', fontSize: 16 }}>↑</button>
      </div>
    </SketchPhone>
  );
}

function ChatB() {
  // B: "rzuć runy" — action-first, structured reply
  return (
    <SketchPhone w={320} h={660}>
      <SketchHeader title="Wyrocznia" back right="ᚠ" />
      <div style={{ textAlign: 'center', padding: '6px 0 12px' }}>
        <div style={{ fontFamily: 'Caveat, cursive', fontSize: 17, color: '#5b5449' }}>Rzuć runy, by poznać wolę Freja.</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 14 }}>
        {['ᚦ','ᛚ','ᛋ','ᛃ','ᚱ'].map((r, i) => (
          <div key={i} style={{
            width: 40, height: 48,
            background: i < 3 ? '#c48e48' : '#ede5d4',
            border: '1.5px solid #2a2622', borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Gloock, serif', fontSize: 22, color: i < 3 ? '#fff' : '#2a2622',
            boxShadow: '1.5px 2px 0 #2a2622',
            transform: i % 2 ? 'rotate(-3deg)' : 'rotate(2deg)',
          }}>{r}</div>
        ))}
      </div>

      <Card style={{ marginBottom: 8 }}>
        <div style={{ fontFamily: 'Gloock, serif', fontSize: 14 }}>
          <span className="saga-text">Wyrok:</span>
          <span className="plain-text">Diagnoza:</span>
        </div>
        <div style={{ fontFamily: 'Kalam, cursive', fontSize: 12, marginTop: 4, lineHeight: 1.35 }}>
          <span className="saga-text">Gleba zeschła. Słońce mdłe. Czas działać.</span>
          <span className="plain-text">Gleba 31% (próg 45%). Światło 320lx (próg 600lx).</span>
        </div>
      </Card>

      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#9a8f7f', letterSpacing: '0.1em', marginTop: 8, marginBottom: 6 }}>
        TRZY AKCJE · WG PRIORYTETU
      </div>
      {[
        ['1', 'Podlej 150 ml', 'do zachodu słońca', '#a8442e'],
        ['2', 'Przesuń bliżej okna', '2h dziennie słońca', '#c48e48'],
        ['3', 'Sprawdź za 12h', 'nowy pomiar gleby', '#6b8a4a'],
      ].map(([n, t, s, c]) => (
        <Card key={n} tight style={{ marginBottom: 6, borderLeft: `4px solid ${c}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontFamily: 'Gloock, serif', fontSize: 20, color: c }}>{n}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Kalam, cursive', fontSize: 13, fontWeight: 700 }}>{t}</div>
              <div style={{ fontFamily: 'Caveat, cursive', fontSize: 14, color: '#5b5449', lineHeight: 1 }}>{s}</div>
            </div>
            <span style={{ fontSize: 14 }}>›</span>
          </div>
        </Card>
      ))}
    </SketchPhone>
  );
}

function ChatC() {
  // C: fireside — kreda na kamieniu, skald "opowiada"
  return (
    <SketchPhone w={320} h={660} dark>
      <div style={{
        position: 'absolute', top: 42, left: 14, right: 14, bottom: 22,
        color: '#f5efe3', fontFamily: 'Kalam, cursive',
      }}>
        <div style={{ textAlign: 'center', padding: '4px 0 8px' }}>
          <div style={{ fontFamily: 'Caveat, cursive', fontSize: 16, color: '#c48e48' }}>przy ognisku</div>
          <div style={{ fontFamily: 'Gloock, serif', fontSize: 22, color: '#f5efe3' }}>Skald mówi</div>
        </div>

        {/* Narration */}
        <div style={{
          border: '1px dashed #c48e48', borderRadius: 10, padding: 12,
          marginTop: 10, position: 'relative',
        }}>
          <div style={{ position: 'absolute', left: -6, top: -10, fontFamily: 'Gloock, serif', fontSize: 28, color: '#c48e48' }}>„</div>
          <div style={{ fontFamily: 'Kalam, cursive', fontSize: 13, lineHeight: 1.5, color: '#f5efe3' }}>
            <span className="saga-text">
              Słuchaj, jarlu. Len twój trzykrotnie od świtu wołał o wodę. Jego korzenie — jak dusze w Helu — pragną napoju. Zalej ziemię dwoma czerpakami przed zachodem.
            </span>
            <span className="plain-text">
              Gleba 31% od 8 godzin. Podlej 150 ml teraz. Sprawdź ponownie za 2h. Jeśli nie wzrośnie do 45% — przesadź w większą doniczkę.
            </span>
          </div>
        </div>

        {/* Suggested continuations */}
        <div style={{ marginTop: 14, fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#c48e48', letterSpacing: '0.1em' }}>
          SPYTAJ DALEJ
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
          {['Kiedy zbierać?', 'Czemu liście żółkną?', 'Przetrwa zimę?'].map(q => (
            <div key={q} style={{
              border: '1px solid #c48e48', borderRadius: 999,
              padding: '6px 12px', fontFamily: 'Kalam, cursive', fontSize: 12,
              color: '#f5efe3', background: 'rgba(196,142,72,0.1)',
            }}>{q}</div>
          ))}
        </div>

        {/* Fire ember */}
        <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', fontSize: 22, color: '#c48e48' }}>
          · ᚠ ·
        </div>
      </div>
    </SketchPhone>
  );
}

Object.assign(window, { ChatA, ChatB, ChatC });
