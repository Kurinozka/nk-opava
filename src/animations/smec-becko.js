// SVG animace smeče do béčka
export const smecBeckoAnimation = `
<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg" class="skill-animation">
  <!-- Míč -->
  <g id="ball">
    <circle cx="150" cy="80" r="15" fill="#FFD700" opacity="0.9">
      <animate attributeName="cy" values="80;120;200;350" dur="1.5s" repeatCount="indefinite" />
      <animate attributeName="cx" values="150;160;180;220" dur="1.5s" repeatCount="indefinite" />
      <animate attributeName="r" values="15;12;10;8" dur="1.5s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.9;0.9;0.7;0" dur="1.5s" repeatCount="indefinite" />
    </circle>
  </g>

  <!-- Hráč - silueta -->
  <g id="player" transform="translate(150, 200)">
    <!-- Hlava -->
    <circle cx="0" cy="-80" r="20" fill="#667eea" opacity="0.9">
      <animate attributeName="cy" values="-80;-85;-80" dur="1.5s" repeatCount="indefinite" />
    </circle>

    <!-- Trup -->
    <rect x="-15" y="-60" width="30" height="70" rx="5" fill="#667eea" opacity="0.9">
      <animateTransform attributeName="transform" type="rotate"
        values="0 0 -25; -15 0 -25; 0 0 -25"
        dur="1.5s" repeatCount="indefinite" />
    </rect>

    <!-- Levá noha (stojná) -->
    <g id="left-leg">
      <!-- Stehno -->
      <rect x="-18" y="10" width="14" height="50" rx="3" fill="#667eea" opacity="0.9">
        <animateTransform attributeName="transform" type="rotate"
          values="0 -11 10; 10 -11 10; 0 -11 10"
          dur="1.5s" repeatCount="indefinite" />
      </rect>
      <!-- Lýtko -->
      <rect x="-18" y="60" width="14" height="50" rx="3" fill="#667eea" opacity="0.9">
        <animateTransform attributeName="transform" type="rotate"
          values="0 -11 60; -5 -11 60; 0 -11 60"
          dur="1.5s" repeatCount="indefinite" />
      </rect>
      <!-- Chodidlo -->
      <ellipse cx="-11" cy="115" rx="10" ry="5" fill="#667eea" opacity="0.9" />
    </g>

    <!-- Pravá noha (kopající - smeč) -->
    <g id="kicking-leg">
      <!-- Stehno -->
      <rect x="4" y="-20" width="14" height="55" rx="3" fill="#ef4444" opacity="0.9">
        <animateTransform attributeName="transform" type="rotate"
          values="0 11 -20; -90 11 -20; -120 11 -20; 0 11 -20"
          dur="1.5s" repeatCount="indefinite" />
      </rect>
      <!-- Lýtko -->
      <rect x="4" y="35" width="14" height="50" rx="3" fill="#ef4444" opacity="0.9">
        <animateTransform attributeName="transform" type="rotate"
          values="0 11 35; -20 11 35; 10 11 35; 0 11 35"
          dur="1.5s" repeatCount="indefinite" />
      </rect>
      <!-- Chodidlo (zvýrazněné při kopnutí) -->
      <ellipse cx="11" cy="90" rx="12" ry="5" fill="#fbbf24" opacity="0.9">
        <animate attributeName="opacity"
          values="0.9;1;1;0.9"
          dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="rx"
          values="12;15;15;12"
          dur="1.5s" repeatCount="indefinite" />
      </ellipse>
    </g>

    <!-- Levá ruka -->
    <g id="left-arm">
      <!-- Paže -->
      <rect x="-28" y="-50" width="13" height="45" rx="3" fill="#667eea" opacity="0.9">
        <animateTransform attributeName="transform" type="rotate"
          values="0 -21 -50; -40 -21 -50; -60 -21 -50; 0 -21 -50"
          dur="1.5s" repeatCount="indefinite" />
      </rect>
      <!-- Předloktí -->
      <rect x="-28" y="-5" width="13" height="40" rx="3" fill="#667eea" opacity="0.9">
        <animateTransform attributeName="transform" type="rotate"
          values="0 -21 -5; 20 -21 -5; 40 -21 -5; 0 -21 -5"
          dur="1.5s" repeatCount="indefinite" />
      </rect>
    </g>

    <!-- Pravá ruka (balance) -->
    <g id="right-arm">
      <!-- Paže -->
      <rect x="15" y="-50" width="13" height="45" rx="3" fill="#667eea" opacity="0.9">
        <animateTransform attributeName="transform" type="rotate"
          values="0 21 -50; 50 21 -50; 70 21 -50; 0 21 -50"
          dur="1.5s" repeatCount="indefinite" />
      </rect>
      <!-- Předloktí -->
      <rect x="15" y="-5" width="13" height="40" rx="3" fill="#667eea" opacity="0.9">
        <animateTransform attributeName="transform" type="rotate"
          values="0 21 -5; -30 21 -5; -50 21 -5; 0 21 -5"
          dur="1.5s" repeatCount="indefinite" />
      </rect>
    </g>
  </g>

  <!-- Šipka směru míče (dolů do béčka) -->
  <g id="arrow" opacity="0.7">
    <line x1="180" y1="160" x2="220" y2="280" stroke="#fbbf24" stroke-width="4" stroke-dasharray="5,5">
      <animate attributeName="opacity" values="0;1;1;0" dur="1.5s" repeatCount="indefinite" />
    </line>
    <polygon points="220,280 215,265 225,265" fill="#fbbf24">
      <animate attributeName="opacity" values="0;1;1;0" dur="1.5s" repeatCount="indefinite" />
    </polygon>
  </g>

  <!-- Text popis -->
  <text x="150" y="370" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="bold">
    SMEČ DO BÉČKA
  </text>
</svg>
`
