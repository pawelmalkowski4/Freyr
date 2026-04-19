// Onboarding — 3 variants, each shown as a strip of phones representing the flow

function OnboardA() {
  // Variant A: 2x2 grid of steps — one step per phone, arrows between
  const Phone = (props) => <SketchPhone w={190} h={380} {...props} />;
  const Arrow = ({ d = '→' }) => (
    <div className="flow-arrow" style={{ fontSize: 26, textAlign: 'center' }}>{d}</div>
  );
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
      <Phone>
        <SketchHeader title="ᚠ Oko Freja" />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 16 }}>
          <div className="placeholder" style={{ width: 78, height: 78, borderRadius: '50%' }}>rune sigil</div>
          <div style={{ fontFamily: 'Gloock, serif', fontSize: 14, textAlign: 'center', lineHeight: 1.15 }}>
            Jarlu, twój<br/>ogród czeka.
          </div>
          <button className="sketch-btn primary" style={{ marginTop: 4, fontSize: 11, padding: '6px 10px' }}>Przywołaj</button>
        </div>
      </Phone>

      <Arrow />

      <Phone>
        <SketchHeader title="Skan BLE" back />
        <div style={{ marginTop: 4, fontFamily: 'Kalam, cursive', fontSize: 10, color: '#5b5449' }}>skanuję eter…</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
          {[
            ['Freyr-Eye-A7F3', '-42', true],
            ['Freyr-Eye-12B9', '-71', false],
            ['Unknown', '-88', false],
          ].map(([n, d, sel]) => (
            <Card key={n} tight style={{ padding: '5px 7px', borderStyle: sel ? 'solid' : 'dashed', background: sel ? 'rgba(196,142,72,0.14)' : '#f5efe3' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9 }}>{n}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: '#5b5449' }}>{d}</div>
              </div>
            </Card>
          ))}
        </div>
        <div style={{ marginTop: 10, textAlign: 'center' }}>
          <button className="sketch-btn primary" style={{ fontSize: 11, padding: '6px 14px' }}>Paruj</button>
        </div>
      </Phone>

      <Arrow d="↓" />

      <Phone>
        <SketchHeader title="Lín — Len" back />
        <div className="placeholder" style={{ height: 70, marginTop: 2 }}>identified plant</div>
        <div style={{ marginTop: 6 }}>
          <div style={{ fontFamily: 'Gloock, serif', fontSize: 13 }}>Lín</div>
          <div style={{ fontFamily: 'Kalam, cursive', fontSize: 10, color: '#5b5449' }}>
            Len zwyczajny
          </div>
          <div className="stamp" style={{ marginTop: 4, fontSize: 8 }}>92%</div>
          <div style={{ fontFamily: 'Kalam, cursive', fontSize: 9.5, marginTop: 4, lineHeight: 1.3 }}>
            Wikingowie tkali z lnu żagle.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
          <button className="sketch-btn ghost" style={{ flex: 1, padding: '5px', fontSize: 10 }}>Popraw</button>
          <button className="sketch-btn primary" style={{ flex: 1, padding: '5px', fontSize: 10 }}>Tak</button>
        </div>
      </Phone>

      <Arrow d="←" />

      <Phone>
        <SketchHeader title="Zdjęcie" back />
        <div className="placeholder" style={{ height: 150, marginTop: 2 }}>
          viewfinder<br/>(dzienne światło)
        </div>
        <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%',
            border: '2px solid #2a2622', background: '#c48e48',
            boxShadow: '1.5px 2px 0 #2a2622',
          }} />
        </div>
        <div style={{ fontFamily: 'Caveat, cursive', fontSize: 13, textAlign: 'center', marginTop: 6, color: '#5b5449' }}>
          skald rozpozna…
        </div>
      </Phone>
    </div>
  );
}

function OnboardB() {
  // Variant B: story-book — single tall screen with stepped reveal
  return (
    <div style={{ display: 'flex', gap: 28, justifyContent: 'center' }}>
      <SketchPhone w={320} h={660}>
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <div className="runes-strip" style={{ fontSize: 20, letterSpacing: '0.3em' }}>ᚠ ᚱ ᛖ ᛃ ᚱ</div>
          <div style={{ fontFamily: 'Gloock, serif', fontSize: 26, marginTop: 4 }}>Sadzenie Oka</div>
          <div style={{ fontFamily: 'Caveat, cursive', fontSize: 16, color: '#5b5449' }}>cztery kroki, jedna przysięga</div>
        </div>

        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            ['ᚱ', '1. Przywołaj', 'znajdź Oko w eterze BLE', true],
            ['ᚢ', '2. Nazwij ogród', '„Zielnik Ragnhild"', true],
            ['ᛋ', '3. Pokaż roślinę', 'zdjęcie ślę do skalda', false],
            ['ᛃ', '4. Przysięga', 'zakres łaski + alerty', false],
          ].map(([r, t, s, done]) => (
            <Card key={t} tight accent={done}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontFamily: 'Gloock, serif', fontSize: 22, color: '#c48e48', width: 24, textAlign: 'center' }}>{r}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Kalam, cursive', fontWeight: 700, fontSize: 13 }}>{t}</div>
                  <div style={{ fontFamily: 'Caveat, cursive', fontSize: 14, color: '#5b5449', lineHeight: 1.1 }}>{s}</div>
                </div>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  border: '1.5px solid #2a2622',
                  background: done ? '#c48e48' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 11,
                }}>{done ? '✓' : ''}</div>
              </div>
            </Card>
          ))}
        </div>

        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <button className="sketch-btn primary">Kontynuuj obrzęd</button>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#9a8f7f', marginTop: 8, letterSpacing: '0.1em' }}>
            STEP 2 / 4
          </div>
        </div>
      </SketchPhone>

      <div style={{ position: 'relative', width: 180 }}>
        <div className="callout" style={{ top: 20, left: 10 }}>
          progres jako<br/>cztery runy =<br/>metafora przysięgi
          <svg style={{ top: 10, left: 130, width: 40, height: 60 }} viewBox="0 0 40 60">
            <path d="M2 10 Q 20 5, 35 40" stroke="#c48e48" strokeWidth="1.5" fill="none" />
            <path d="M30 32 L 35 40 L 27 42" stroke="#c48e48" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
        <div className="callout" style={{ top: 260, left: 10, color: '#5b5449' }}>
          checkbox =<br/>runa wypełniona<br/>ugrem
          <svg style={{ top: 40, left: 100, width: 60, height: 40 }} viewBox="0 0 60 40">
            <path d="M55 5 Q 30 10, 5 30" stroke="#5b5449" strokeWidth="1.5" fill="none" />
            <path d="M10 22 L 5 30 L 13 32" stroke="#5b5449" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function OnboardC() {
  // Variant C: bottom-sheet / conversational — one screen, skald talks you through
  return (
    <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
      <SketchPhone w={300} h={620}>
        <div className="placeholder" style={{ height: 260, marginTop: -12, marginLeft: -14, marginRight: -14, width: 'calc(100% + 28px)', borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
          camera / żywa soczewka<br/>(blur + rośliny w tle)
        </div>

        {/* Sheet */}
        <div style={{
          marginTop: 14,
          background: '#f5efe3', border: '1.5px solid #2a2622',
          borderRadius: 18, padding: 12, boxShadow: '1.5px 2px 0 #2a2622',
        }}>
          <div style={{ width: 40, height: 3, background: '#c9bda5', margin: '0 auto 10px', borderRadius: 2 }} />
          <ChatBubble>
            Witaj, jarlu. Jam skald. Podnieś Oko ku roślinie — przeczytam jej imię.
          </ChatBubble>
          <ChatBubble from="user">
            Już stoi w doniczce.
          </ChatBubble>
          <ChatBubble>
            Łaska. Zrób teraz obraz — w świetle dziennym, z boku.
          </ChatBubble>
          <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
            <button className="sketch-btn ghost" style={{ flex: 1, fontSize: 12 }}>Pomiń</button>
            <button className="sketch-btn primary" style={{ flex: 2, fontSize: 12 }}>📸 Zrób obraz</button>
          </div>
        </div>
      </SketchPhone>

      <div style={{ position: 'relative', width: 220 }}>
        <div className="callout" style={{ top: 40, left: 0 }}>
          onboarding = rozmowa,<br/>nie formularz
          <svg style={{ top: 0, left: 160, width: 50, height: 50 }} viewBox="0 0 50 50">
            <path d="M2 20 Q 20 25, 45 5" stroke="#c48e48" strokeWidth="1.5" fill="none" />
            <path d="M38 8 L 45 5 L 44 13" stroke="#c48e48" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
        <div className="callout" style={{ top: 200, left: 0 }}>
          każdy krok —<br/>nowa wypowiedź<br/>skalda
          <svg style={{ top: 10, left: 150, width: 50, height: 50 }} viewBox="0 0 50 50">
            <path d="M2 20 Q 25 10, 45 20" stroke="#c48e48" strokeWidth="1.5" fill="none" />
            <path d="M38 14 L 45 20 L 38 26" stroke="#c48e48" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { OnboardA, OnboardB, OnboardC });
