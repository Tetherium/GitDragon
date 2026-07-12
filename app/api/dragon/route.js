import { NextResponse } from 'next/server';
import { getDragonStats } from '@/lib/github';
import { dragonAssets } from '@/lib/dragonAssets';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return new Response(
      `<svg width="400" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#161b22" rx="6" stroke="#f85149" stroke-width="2"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" fill="#ffffff" font-size="14">
          ERROR: username parameter is missing!
        </text>
      </svg>`,
      {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
  }

  const stats = await getDragonStats(username);
  const format = searchParams.get('format');

  if (format === 'json') {
    if (stats.error) {
      return NextResponse.json({ error: stats.error }, { status: 400 });
    }
    return NextResponse.json(stats);
  }

  if (stats.error) {
    return new Response(
      `<svg width="400" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#161b22" rx="6" stroke="#f85149" stroke-width="2"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" fill="#ffffff" font-size="12">
          ERROR: ${stats.error}
        </text>
      </svg>`,
      {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
  }

  const {
    state,
    stateName,
    statusText,
    currentStreak,
    daysSinceLastCommit,
    hp,
    progressPercentage,
    nextStateName,
    nextStateRequired
  } = stats;

  // Retrieve base64 asset
  const dragonImg = dragonAssets[state] || dragonAssets['egg'];

  // Colors based on state
  let themeColor = '#238636'; // Active green
  let hpColor = '#2ea043';
  if (state === 'sad') {
    themeColor = '#d29922'; // Warning orange
    hpColor = '#d29922';
  } else if (state === 'dead') {
    themeColor = '#f85149'; // Error red
    hpColor = '#f85149';
  }

  // Draw the SVG
  const svg = `<svg width="480" height="150" viewBox="0 0 480 150" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#161b22" />
      <stop offset="100%" stop-color="#0d1117" />
    </linearGradient>
    <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <style>
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-5px); }
      100% { transform: translateY(0px); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .dragon {
      animation: float 4s ease-in-out infinite;
      transform-origin: center;
    }
    .pulse-glow {
      animation: pulse 2s ease-in-out infinite;
    }
    .retro-text {
      font-family: 'Courier New', Courier, monospace;
    }
    .title {
      font-weight: bold;
      font-size: 10px;
      fill: #8b949e;
      letter-spacing: 1px;
    }
    .name {
      font-weight: 900;
      font-size: 17px;
      fill: ${themeColor};
    }
    .label {
      font-size: 10px;
      fill: #8b949e;
      font-weight: bold;
    }
    .status-desc {
      font-size: 9.5px;
      fill: #c9d1d9;
    }
    .sub-stats {
      font-size: 10px;
      fill: #8b949e;
    }
  </style>

  <!-- Outer Card Border & Glow -->
  <rect x="2" y="2" width="476" height="146" rx="8" fill="url(#cardGrad)" stroke="${themeColor}" stroke-width="2.5" class="pulse-glow" style="filter: drop-shadow(0 0 4px ${themeColor}44);" />

  <!-- Pixel Dragon Container -->
  <g class="dragon">
    <!-- Mini floating platform shadow -->
    <ellipse cx="79" cy="126" rx="30" ry="5" fill="#000000" opacity="0.4" />
    <!-- Base64 Encoded crisp 16-bit pixel dragon -->
    <image href="${dragonImg}" x="15" y="6" width="128" height="128" image-rendering="pixelated" />
  </g>

  <!-- Divider Line -->
  <line x1="150" y1="15" x2="150" y2="135" stroke="#30363d" stroke-width="1" stroke-dasharray="3,3" />

  <!-- Info Area -->
  <g transform="translate(165, 0)">
    <!-- Header -->
    <text x="0" y="25" class="retro-text title">${username.toUpperCase()}'S TAMAGOTCHI</text>
    <text x="0" y="46" class="retro-text name">${stateName.toUpperCase()}</text>

    <!-- HP (Feed Level) Bar -->
    <text x="0" y="68" class="retro-text label">HP [FEED]  :</text>
    <rect x="85" y="60" width="165" height="9" rx="2" fill="#21262d" stroke="#30363d" stroke-width="1" />
    <rect x="86" y="61" width="${163 * (hp / 100)}" height="7" rx="1.5" fill="${hpColor}" />
    <text x="260" y="68" class="retro-text label" text-anchor="start">${hp}%</text>

    <!-- XP (Evolution/Streak) Bar -->
    <text x="0" y="86" class="retro-text label">XP [STREAK]:</text>
    <rect x="85" y="78" width="165" height="9" rx="2" fill="#21262d" stroke="#30363d" stroke-width="1" />
    <rect x="86" y="79" width="${163 * (progressPercentage / 100)}" height="7" rx="1.5" fill="#58a6ff" />
    <text x="260" y="86" class="retro-text label" text-anchor="start">${currentStreak} DAYS</text>

    <!-- Status Message -->
    <text x="0" y="110" class="retro-text status-desc">${statusText.substring(0, 52)}</text>
    
    <!-- Sub Info -->
    <text x="0" y="132" class="retro-text sub-stats">
      ${state !== 'dead' && nextStateRequired ? `Next Evolution: ${nextStateRequired} Days Streak (${nextStateName})` : state === 'dead' ? 'To revive: push 1 commit' : 'Max Level reached!'}
    </text>
  </g>
</svg>`;

  // Return the SVG with cache control headers
  // Cache for 30 minutes in browser, 1 hour on Vercel Edge Cache CDN, stale-while-revalidate up to 2 hours
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=7200'
    }
  });
}
