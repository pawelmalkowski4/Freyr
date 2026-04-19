// Freyr's Eye — sketch phone wrapper + reusable sketch components

// A sketchy phone that replaces the glossy iOS chrome with a hand-drawn feel,
// but keeps the iPhone silhouette (dynamic island, rounded corners, home indicator).
function SketchPhone({ children, w = 320, h = 660, label, sub, dark = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {label && (
        <div className="variant" style={{ marginBottom: 10 }}>
          <div className="label">{label}</div>
          {sub && <div className="sub">{sub}</div>}
        </div>
      )}
      <div style={{
        width: w, height: h, borderRadius: 42,
        border: '2px solid #2a2622',
        background: dark ? '#141210' : '#f5efe3',
        position: 'relative', overflow: 'hidden',
        boxShadow: '3px 5px 0 #2a2622, 0 20px 40px rgba(48,36,20,0.12)',
        filter: 'url(#rough-filter)',
      }}>
        {/* dynamic island */}
        <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          width: 88, height: 22, borderRadius: 999, background: '#2a2622', zIndex: 50,
        }} />
        {/* status bar */}
        <div style={{
          position: 'absolute', top: 14, left: 0, right: 0, zIndex: 20,
          display: 'flex', justifyContent: 'space-between', padding: '0 24px',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
          color: dark ? '#e8e2c8' : '#2a2622',
        }}>
          <span>9:41</span>
          <span>ᚠ ᛫ 87%</span>
        </div>
        {/* content */}
        <div style={{
          position: 'absolute', top: 42, left: 0, right: 0, bottom: 22,
          overflow: 'hidden', padding: '12px 14px',
          color: dark ? '#f5efe3' : '#2a2622',
        }}>
          {children}
        </div>
        {/* home indicator */}
        <div style={{
          position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
          width: 110, height: 3, background: dark ? '#e8e2c8' : '#2a2622',
          borderRadius: 2, opacity: 0.6, zIndex: 60,
        }} />
      </div>
    </div>
  );
}

// Tiny sketch line — handwritten-looking ruled strip as placeholder text
function ScribbleLine({ w = '100%', delay = 0 }) {
  return <span style={{
    display: 'inline-block', width: w, height: 2,
    background: '#2a2622', borderRadius: 2,
    filter: 'url(#rough-filter)',
  }} />;
}

// Sketchy header inside phone
function SketchHeader({ title, back = false, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '6px 2px 10px', borderBottom: '1px dashed #c9bda5', marginBottom: 10,
    }}>
      <div style={{ width: 28, display: 'flex', alignItems: 'center' }}>
        {back && <span style={{ fontSize: 22, lineHeight: 1 }}>‹</span>}
      </div>
      <div style={{
        fontFamily: 'Gloock, serif', fontSize: 17, letterSpacing: -0.4,
        textAlign: 'center', flex: 1,
      }}>{title}</div>
      <div style={{ width: 28, textAlign: 'right', fontSize: 14, color: '#5b5449' }}>
        {right}
      </div>
    </div>
  );
}

// Sketch "card" — hand-drawn box
function Card({ children, style, tight = false, accent = false }) {
  return (
    <div style={{
      background: accent ? 'rgba(196,142,72,0.10)' : '#f5efe3',
      border: '1.5px solid #2a2622',
      borderRadius: 12,
      padding: tight ? '8px 10px' : '10px 12px',
      boxShadow: '1.5px 2px 0 #2a2622',
      ...style,
    }}>{children}</div>
  );
}

// Health gauge — hand-drawn circular arc
function HealthGauge({ value = 67, size = 120, label = 'Łaska' }) {
  const r = size / 2 - 10;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (value / 100);
  const tone = value > 70 ? '#6b8a4a' : value > 40 ? '#c48e48' : '#a8442e';
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ filter: 'url(#rough-filter)' }}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="#c9bda5" strokeWidth="3" strokeDasharray="3 4" />
        <circle cx={c} cy={c} r={r} fill="none" stroke={tone} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`}
          transform={`rotate(-90 ${c} ${c})`}
          strokeLinecap="round" />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontFamily: 'Gloock, serif', fontSize: size * 0.32, lineHeight: 1 }}>{value}</div>
        <div style={{ fontFamily: 'Caveat, cursive', fontSize: 14, color: '#5b5449', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );
}

// Sensor row — full-width bar with optimal range shaded + current position dot.
// variant="range" (default) shows full bar with optimal zone + dot.
// variant="compact" is the old inline-bar style (used in settings list).
function SensorRow({ rune, name, value, status = 'ok', bar, optimalFrom = 35, optimalTo = 70, variant = 'range' }) {
  const tone = status === 'ok' ? '#6b8a4a' : status === 'warn' ? '#c48e48' : '#a8442e';

  if (variant === 'compact') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
        <div style={{ fontFamily: 'Gloock, serif', fontSize: 20, color: '#c48e48', width: 22, textAlign: 'center' }}>{rune}</div>
        <div style={{ flex: 1, fontFamily: 'Kalam, cursive', fontSize: 13 }}>{name}</div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, minWidth: 44, textAlign: 'right' }}>{value}</div>
        <div style={{ width: 8, height: 8, borderRadius: 50, background: tone }} />
      </div>
    );
  }

  const pos = bar !== undefined ? Math.max(0, Math.min(100, bar)) : 50;
  const from = Math.max(0, Math.min(100, optimalFrom));
  const to = Math.max(0, Math.min(100, optimalTo));
  return (
    <div style={{ padding: '8px 0 6px' }}>
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 5 }}>
        <div style={{ fontFamily: 'Gloock, serif', fontSize: 16, color: '#c48e48', lineHeight: 1 }}>{rune}</div>
        <div style={{ flex: 1, fontFamily: 'Kalam, cursive', fontSize: 12, color: '#2a2622' }}>{name}</div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#2a2622' }}>{value}</div>
        <div style={{ width: 7, height: 7, borderRadius: 50, background: tone, marginLeft: 2 }} />
      </div>
      {/* Full-width bar */}
      <div style={{ position: 'relative', height: 10, background: '#e4dac4', borderRadius: 3, border: '1px solid #2a2622' }}>
        {/* optimal zone */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0,
          left: `${from}%`, width: `${to - from}%`,
          background: 'rgba(107, 138, 74, 0.35)',
          borderLeft: '1px dashed #6b8a4a',
          borderRight: '1px dashed #6b8a4a',
        }} />
        {/* current dot */}
        <div style={{
          position: 'absolute', top: '50%', left: `${pos}%`,
          transform: 'translate(-50%, -50%)',
          width: 12, height: 12, borderRadius: '50%',
          background: tone, border: '1.5px solid #2a2622',
          boxShadow: '1px 1px 0 #2a2622',
        }} />
      </div>
      {/* tick labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, color: '#9a8f7f', marginTop: 2 }}>
        <span>min</span>
        <span style={{ color: '#6b8a4a' }}>optimum {from}–{to}</span>
        <span>max</span>
      </div>
    </div>
  );
}

// Chat bubble
function ChatBubble({ from = 'skald', children, tone = 'saga' }) {
  const isUser = from === 'user';
  return (
    <div style={{
      display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 8,
    }}>
      <div style={{
        maxWidth: '82%',
        background: isUser ? '#c48e48' : '#ede5d4',
        color: isUser ? '#fff' : '#2a2622',
        border: '1.5px solid #2a2622',
        borderRadius: isUser ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
        padding: '7px 10px',
        fontFamily: 'Kalam, cursive', fontSize: 12.5, lineHeight: 1.35,
        boxShadow: '1.5px 2px 0 #2a2622',
      }}>{children}</div>
    </div>
  );
}

// OLED tile — mini rendering of device screen
function OledTile({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 232, height: 116,
        background: '#0a0a0e', borderRadius: 8,
        border: '2px solid #2a2622',
        boxShadow: '2px 3px 0 #2a2622',
        padding: '10px 14px', color: '#f5efe3',
        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
        position: 'relative', overflow: 'hidden',
      }}>{children}</div>
      <div style={{ fontFamily: 'Caveat, cursive', fontSize: 18, color: '#2a2622' }}>{label}</div>
    </div>
  );
}

Object.assign(window, {
  SketchPhone, ScribbleLine, SketchHeader, Card, HealthGauge, SensorRow, ChatBubble, OledTile,
});
