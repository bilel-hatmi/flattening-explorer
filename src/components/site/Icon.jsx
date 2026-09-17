// Small line icons for the personal site. One stroke weight, no fills,
// currentColor, so they sit in any text colour of the palette.

const PATHS = {
  // sycophancy: a gauge, four ticks
  psychometrics: (
    <>
      <path d="M3 17a9 9 0 0 1 18 0" />
      <path d="M12 17l4-6" />
      <path d="M5.5 12.5l1.2.7M18.5 12.5l-1.2.7M12 8v1.4" />
      <circle cx="12" cy="17" r="1.2" />
    </>
  ),
  // mediation: two speech bubbles meeting
  mediation: (
    <>
      <path d="M4 5h9a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H8l-4 3V7a2 2 0 0 1 2-2h-2z" />
      <path d="M17 9h1a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1v3l-4-3h-2" />
    </>
  ),
  // education: an open book
  education: (
    <>
      <path d="M12 6c-2-1.5-5-2-8-1.5v12c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-12c-3-.5-6 0-8 1.5z" />
      <path d="M12 6v12" />
    </>
  ),
  // risk: a distribution with a fat right tail
  risk: (
    <>
      <path d="M3 18c3 0 4-10 6-10s3 7 5 7 3-3 7-3" />
      <path d="M3 19h18" />
      <path d="M16 11v7" strokeDasharray="1.5 2" />
    </>
  ),
  // causal: three nodes, two arrows
  causal: (
    <>
      <circle cx="6" cy="17" r="2" /><circle cx="18" cy="17" r="2" /><circle cx="12" cy="6" r="2" />
      <path d="M10.6 7.6L7.4 15M13.4 7.6l3.2 7.4M8 17h8" />
    </>
  ),
  // introspection: an eye
  introspection: (
    <>
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  // search: magnifier over lines
  search: (
    <>
      <circle cx="10" cy="10" r="5.5" />
      <path d="M14 14l6 6" />
      <path d="M7.5 9h5M7.5 11.5h3" />
    </>
  ),
  // agents: a chip
  agents: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M10 10.5h4M10 13.5h4" />
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l1.5 1.5M18 6l-1.5 1.5M6 18l1.5-1.5M18 18l-1.5-1.5" />
    </>
  ),
  // well-being: a leaf
  wellbeing: (
    <>
      <path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z" />
      <path d="M5 19c3-4 6-7 10-9" />
    </>
  ),
  // oncology: cells
  cells: (
    <>
      <circle cx="9" cy="9" r="4.5" /><circle cx="15.5" cy="15" r="3.5" /><circle cx="9" cy="9" r="1.2" /><circle cx="15.5" cy="15" r="1" />
    </>
  ),
  // hawkes: spikes on a baseline
  spikes: (
    <>
      <path d="M3 18h18" />
      <path d="M6 18v-6M9 18v-3M11 18v-9M13 18v-4M16 18v-11M18 18v-5" />
    </>
  ),
  // rates: a rising tree
  rates: (
    <>
      <path d="M3 18L9 12l4 3 8-8" />
      <path d="M16 7h5v5" />
    </>
  ),
  // giving back: two hands
  giving: (
    <>
      <path d="M3 13l4 4h6l4-4" />
      <path d="M21 13l-4 4" />
      <path d="M9 10.5c0-2 2-3 3-3s3 1 3 3c0 2-3 4-3 4s-3-2-3-4z" />
    </>
  ),
  // sport: a shuttlecock
  sport: (
    <>
      <path d="M8 16l-3 3M9 15l6-8 3 3-8 6z" />
      <path d="M15 7l1.5-3M18 10l3-1.5M16.5 8.5L20 5" />
      <circle cx="7.5" cy="16.5" r="1.8" />
    </>
  ),
  // research: a compass
  research: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </>
  ),
  // journey: a path with a pin
  journey: (
    <>
      <path d="M4 19c4 0 4-4 8-4s4 4 8 4" />
      <path d="M12 3a4 4 0 0 1 4 4c0 3-4 7-4 7S8 10 8 7a4 4 0 0 1 4-4z" />
      <circle cx="12" cy="7" r="1.2" />
    </>
  ),
  // documents: a page
  documents: (
    <>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4M10 12h6M10 15.5h6" />
    </>
  ),
  // deck: slides
  deck: (
    <>
      <rect x="4" y="5" width="16" height="11" rx="1.5" />
      <path d="M9 20h6M12 16v4M8 12l3-3 2 2 3-3" />
    </>
  ),
  // supervision: people
  supervision: (
    <>
      <circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.2" />
      <path d="M3 19c0-3.5 2.7-6 6-6s6 2.5 6 6M15 13.5c2.8 0 5 2 5 5" />
    </>
  ),
  // mail: an envelope
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7.5l9 6 9-6" />
    </>
  ),
  // cv: a page with a portrait and lines
  cv: (
    <>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4" />
      <circle cx="11" cy="11" r="1.8" />
      <path d="M8.5 16.5c0-1.5 1.1-2.5 2.5-2.5s2.5 1 2.5 2.5M15.5 12h1M15.5 15h1" />
    </>
  ),
  // pdf: a page with a download arrow
  pdf: (
    <>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4" />
      <path d="M12 10v7M9.5 14.5L12 17l2.5-2.5" />
    </>
  ),
  // code: angle brackets and a slash
  code: (
    <>
      <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5.5l-3 13" />
    </>
  ),
  // poster: a pinned board
  poster: (
    <>
      <rect x="4.5" y="4" width="15" height="17" rx="1.2" />
      <path d="M4.5 8.5h15M8 12.5h8M8 16h5" />
      <circle cx="12" cy="6.2" r="0.8" />
    </>
  ),
  // external: an arrow out of a box
  external: (
    <>
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M18 13v6H5V6h6" />
    </>
  ),
  // arrow: right
  arrow: (
    <>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </>
  ),
  // pin: a place
  pin: (
    <>
      <path d="M12 21s-6-5.2-6-11a6 6 0 0 1 12 0c0 5.8-6 11-6 11z" />
      <circle cx="12" cy="10" r="2.2" />
    </>
  ),
};

// Brand marks, drawn as fills (Simple Icons, CC0).
const FILLED = {
  github: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
};

export default function Icon({ name, size = 20, color, style, title }) {
  const filled = FILLED[name];
  if (filled) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color || 'currentColor'} aria-hidden={title ? undefined : 'true'}
        role={title ? 'img' : undefined} style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', ...style }}>
        {title && <title>{title}</title>}
        <path d={filled} />
      </svg>
    );
  }
  const paths = PATHS[name];
  if (!paths) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'}
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined} style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', ...style }}>
      {title && <title>{title}</title>}
      {paths}
    </svg>
  );
}

// Icon in a soft tinted disc, for card headers and section titles. `img`
// puts a logo (e.g. the CartesIA mark) in the disc instead of a line icon.
export function IconBadge({ name, img, size = 36, tone = 'teal', style }) {
  const tint = tone === 'navy' ? 'rgba(34,55,90,0.08)' : tone === 'purple' ? 'rgba(142,107,191,0.12)' : 'var(--teal-tint)';
  const color = tone === 'navy' ? 'var(--navy)' : tone === 'purple' ? '#8E6BBF' : 'var(--teal)';
  if (img) {
    return (
      <span className="badge" style={{
        width: size, height: size, borderRadius: '50%', background: '#FFFFFF', border: '0.5px solid var(--card-border)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', ...style,
      }}>
        <img src={img} alt="" style={{ width: Math.round(size * 0.68), height: Math.round(size * 0.68), objectFit: 'contain', display: 'block' }} />
      </span>
    );
  }
  return (
    <span className="badge" style={{
      width: size, height: size, borderRadius: '50%', background: tint, display: 'inline-flex',
      alignItems: 'center', justifyContent: 'center', flexShrink: 0, color, ...style,
    }}>
      <Icon name={name} size={Math.round(size * 0.55)} />
    </span>
  );
}
