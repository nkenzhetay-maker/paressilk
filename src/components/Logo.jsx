export default function Logo({ height = 36, light = true }) {
  const color = light ? '#C8A456' : '#C8A456';

  return (
    <svg viewBox="0 0 300 50" height={height} xmlns="http://www.w3.org/2000/svg">
      {/* Silk S Icon - flowing ribbon shape */}
      <g transform="translate(5, 5)">
        {/* Top curve flowing right */}
        <path
          d="M4 8 Q12 2, 22 6 Q32 10, 38 4"
          fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round"
        />
        {/* Right descending connection */}
        <path
          d="M38 4 Q42 8, 38 14 Q34 20, 32 24"
          fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round"
        />
        {/* Middle curve flowing left */}
        <path
          d="M32 24 Q24 28, 14 24 Q6 20, 4 26"
          fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round"
        />
        {/* Left descending connection */}
        <path
          d="M4 26 Q0 32, 4 36"
          fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round"
        />
        {/* Bottom curve flowing right */}
        <path
          d="M4 36 Q14 42, 24 38 Q34 34, 38 38"
          fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round"
        />
      </g>

      {/* Vertical divider */}
      <line x1="56" y1="10" x2="56" y2="42" stroke={color} strokeWidth="0.7" opacity="0.4" />

      {/* Brand text */}
      <text x="68" y="36" fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="30" fill={color} letterSpacing="0.5">
        <tspan fontWeight="600">Pares</tspan><tspan fontWeight="300" fontStyle="italic">silk</tspan>
      </text>
    </svg>
  );
}
