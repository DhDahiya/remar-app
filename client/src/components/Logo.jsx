export default function Logo({ size = 48, textColor = '#3a6b00', showText = true }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Hands cupped at bottom */}
        <path d="M20 72 Q30 60 40 65 Q50 55 60 65 Q70 60 80 72 Q70 82 50 85 Q30 82 20 72Z"
          fill="none" stroke="#3a6b00" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Body of dove */}
        <ellipse cx="50" cy="50" rx="14" ry="10" fill="#3a6b00"/>
        {/* Left wing */}
        <path d="M36 50 Q22 38 18 28 Q30 32 36 44" fill="#3a6b00"/>
        {/* Right wing */}
        <path d="M64 50 Q78 38 82 28 Q70 32 64 44" fill="#3a6b00"/>
        {/* Tail */}
        <path d="M36 54 Q50 62 64 54 Q58 68 50 65 Q42 68 36 54Z" fill="#3a6b00"/>
        {/* Head */}
        <circle cx="62" cy="44" r="8" fill="#3a6b00"/>
        {/* Beak */}
        <path d="M70 42 L76 44 L70 46Z" fill="#3a6b00"/>
        {/* Eye */}
        <circle cx="64" cy="43" r="2" fill="white"/>
        {/* Small leaf/flame accents */}
        <path d="M45 30 Q50 20 55 30 Q50 28 45 30Z" fill="#3a6b00"/>
        <path d="M38 34 Q40 24 48 30 Q43 30 38 34Z" fill="#3a6b00"/>
        <path d="M62 34 Q60 24 52 30 Q57 30 62 34Z" fill="#3a6b00"/>
      </svg>
      {showText && (
        <span style={{ color: textColor, fontWeight: 800, fontSize: size * 0.42, letterSpacing: '0.05em', fontFamily: 'sans-serif' }}>
          REMAR
        </span>
      )}
    </div>
  );
}
