import React, { useEffect, useRef, useState, useCallback } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import GraphCard from '../ui/GraphCard';
import Toggle from '../ui/Toggle';

// ── Vite + Leaflet icon fix ───────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9/dist/images/marker-shadow.png',
});

// ── 20 CITIES — v5 data + sector ─────────────────────────────────────────────
const CITIES = [
  // Europe — confirmed profiles
  { id:'P1', name:'Frankfurt',  sector:'Big Four audit',       lat:50.11,  lng:8.68,    p99G0:2124, p99G2:1456, beta:3.5, alpha:0.70, permanentLabel:false },
  { id:'P2', name:'London',     sector:'Investment banking',   lat:51.51,  lng:-0.13,   p99G0:1668, p99G2:1035, beta:1.5, alpha:0.40, permanentLabel:false },
  { id:'P3', name:'Paris',      sector:'Strategy consulting',  lat:48.85,  lng:2.35,    p99G0:2041, p99G2:1303, beta:4.0, alpha:0.90, permanentLabel:false },
  { id:'P4', name:'Brussels',   sector:'Corporate legal',      lat:50.85,  lng:4.35,    p99G0:2254, p99G2:1610, beta:3.0, alpha:0.90, permanentLabel:false },
  { id:'P6', name:'Singapore',  sector:'Creative agency',      lat:1.35,   lng:103.82,  p99G0:1845, p99G2:1340, beta:1.5, alpha:0.30, permanentLabel:true  },
  { id:'P7', name:'Bangalore',  sector:'Back-office ops',      lat:12.97,  lng:77.59,   p99G0:2310, p99G2:1810, beta:2.2, alpha:0.70, permanentLabel:false },
  { id:'P8', name:'Seoul',      sector:'Central admin',        lat:37.57,  lng:126.98,  p99G0:2318, p99G2:1701, beta:4.5, alpha:0.95, permanentLabel:false },
  // Americas
  { id:'C1', name:'New York',   sector:'Investment banking',   lat:40.71,  lng:-74.01,  p99G0:2050, p99G2:1420, beta:2.2, alpha:0.65, permanentLabel:false },
  { id:'C2', name:'S\u00e3o Paulo', sector:'Finance',          lat:-23.55, lng:-46.63,  p99G0:1900, p99G2:1480, beta:2.3, alpha:0.55, permanentLabel:true  },
  { id:'C3', name:'Toronto',    sector:'Financial services',   lat:43.65,  lng:-79.38,  p99G0:1980, p99G2:1380, beta:2.0, alpha:0.60, permanentLabel:false },
  // Asia-Pacific
  { id:'C4', name:'Tokyo',      sector:'Corporate governance', lat:35.69,  lng:139.69,  p99G0:2200, p99G2:1650, beta:4.2, alpha:0.85, permanentLabel:false },
  { id:'C5', name:'Sydney',     sector:'Financial services',   lat:-33.87, lng:151.21,  p99G0:1870, p99G2:1300, beta:1.8, alpha:0.50, permanentLabel:false },
  { id:'C6', name:'Shanghai',   sector:'Asset management',     lat:31.23,  lng:121.47,  p99G0:2180, p99G2:1600, beta:4.0, alpha:0.80, permanentLabel:false },
  { id:'C7', name:'Mumbai',     sector:'Financial services',   lat:19.08,  lng:72.88,   p99G0:2020, p99G2:1450, beta:2.4, alpha:0.65, permanentLabel:false },
  { id:'C8', name:'Dubai',      sector:'Private equity',       lat:25.20,  lng:55.27,   p99G0:1950, p99G2:1380, beta:2.0, alpha:0.55, permanentLabel:false },
  // Additional
  { id:'C9',  name:'Amsterdam', sector:'Asset management',     lat:52.37,  lng:4.90,    p99G0:1820, p99G2:1240, beta:1.8, alpha:0.45, permanentLabel:false },
  { id:'C10', name:'Stockholm', sector:'Tech consulting',      lat:59.33,  lng:18.07,   p99G0:1780, p99G2:1190, beta:1.7, alpha:0.40, permanentLabel:false },
  { id:'C11', name:'Nairobi',   sector:'Development finance',  lat:-1.29,  lng:36.82,   p99G0:1750, p99G2:1210, beta:2.1, alpha:0.50, permanentLabel:true  },
  { id:'C12', name:'Chicago',   sector:'Derivatives trading',  lat:41.88,  lng:-87.63,  p99G0:2080, p99G2:1460, beta:2.2, alpha:0.68, permanentLabel:false },
  { id:'C13', name:'Zurich',    sector:'Private banking',      lat:47.38,  lng:8.54,    p99G0:1900, p99G2:1310, beta:2.8, alpha:0.55, permanentLabel:false },
];

// ── Country beta — objects with label ────────────────────────────────────────
// Names must match GeoJSON ADMIN field from datasets/geo-countries
const COUNTRY_BETA = {
  'France':                    { beta: 4.2, label: 'Very high \u2014 grandes \u00e9coles' },
  'Japan':                     { beta: 4.2, label: 'Very high \u2014 national exam' },
  'China':                     { beta: 4.1, label: 'Very high \u2014 gaokao pipeline' },
  'South Korea':               { beta: 4.5, label: 'Very high \u2014 suneung pipeline' },
  'Germany':                   { beta: 3.5, label: 'High \u2014 national exam system' },
  'Belgium':                   { beta: 3.0, label: 'High \u2014 national system' },
  'Spain':                     { beta: 2.7, label: 'Medium-high \u2014 national system' },
  'Italy':                     { beta: 2.6, label: 'Medium-high \u2014 national system' },
  'Switzerland':               { beta: 2.8, label: 'Medium-high \u2014 cantonal system' },
  'United States of America':  { beta: 2.2, label: 'Medium \u2014 mixed pipeline' },
  'Brazil':                    { beta: 2.3, label: 'Medium \u2014 mixed pipeline' },
  'India':                     { beta: 2.3, label: 'Medium \u2014 national university' },
  'Kenya':                     { beta: 2.1, label: 'Medium \u2014 mixed pipeline' },
  'Canada':                    { beta: 2.0, label: 'Medium \u2014 mixed pipeline' },
  'United Arab Emirates':      { beta: 2.0, label: 'Medium \u2014 mixed pipeline' },
  'United Kingdom':            { beta: 1.5, label: 'Low \u2014 international hub' },
  'Singapore':                 { beta: 1.5, label: 'Low \u2014 international hub' },
  'Netherlands':               { beta: 1.8, label: 'Low \u2014 international hub' },
  'Sweden':                    { beta: 1.7, label: 'Low \u2014 international hub' },
  'Australia':                 { beta: 1.8, label: 'Low \u2014 diverse pipeline' },
};

function getBetaForCountry(name) {
  return COUNTRY_BETA[name] || null;
}

// ── Beta palette — teal→navy ─────────────────────────────────────────────────
const BETA_PALETTE = [
  { max: 1.9, fill: '#9FE1CB', label: 'Low (Beta 1.5\u20131.9) \u2014 UK, Singapore, Netherlands' },
  { max: 2.4, fill: '#619EA8', label: 'Medium-low (Beta 2.0\u20132.4) \u2014 USA, Brazil, India' },
  { max: 2.9, fill: '#3A6E80', label: 'Medium-high (Beta 2.5\u20132.9) \u2014 Spain, Italy' },
  { max: 3.9, fill: '#22375A', label: 'High (Beta 3.0\u20133.9) \u2014 Germany, Belgium' },
  { max: 99,  fill: '#0F1F35', label: 'Very high (Beta \u22654.0) \u2014 France, S.\u00a0Korea, Japan, China' },
];

function betaFill(betaValue) {
  for (const tier of BETA_PALETTE) {
    if (betaValue <= tier.max) return tier.fill;
  }
  return BETA_PALETTE[BETA_PALETTE.length - 1].fill;
}

// ── Circle sizing — sqrt scale ────────────────────────────────────────────────
const R_MIN = 6, R_MAX = 24;
const P99_MIN = 1668, P99_MAX = 2318;

function radius(p99) {
  return R_MIN + (R_MAX - R_MIN) * Math.sqrt(Math.max(0, (p99 - P99_MIN) / (P99_MAX - P99_MIN)));
}

const CIRCLE_FILL = {
  G0: 'rgba(34,55,90,0.80)',
  G2: 'rgba(97,158,168,0.80)',
};

// ── Map view constants ────────────────────────────────────────────────────────
const EUROPE_CENTER = [51.5, 10];
const EUROPE_ZOOM   = 4.5;
const WORLD_CENTER  = [20, 10];
const WORLD_ZOOM    = 2;
const GEOJSON_URL   = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

// ── Toggle options ────────────────────────────────────────────────────────────
const TOGGLE_OPTIONS = [
  { value: 'G0', label: 'Unmanaged AI (G0)' },
  { value: 'G2', label: 'Active governance (G2)' },
];

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  controls: {
    display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap',
  },
  viewBtn: {
    padding: '7px 14px', borderRadius: 6,
    border: '0.5px solid rgba(97,158,168,0.40)',
    background: 'rgba(97,158,168,0.08)',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: 11, fontWeight: 500, color: '#22375A',
    cursor: 'pointer', transition: 'background 0.2s', marginLeft: 6,
  },
  ctrlNote: {
    fontSize: 10, color: '#A0A09A', fontStyle: 'italic', marginLeft: 8,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  mapContainer: {
    width: '100%', height: 280, borderRadius: 10,
    overflow: 'hidden', marginBottom: 10, background: '#E8EEF4',
    position: 'relative',
  },
  legendsRow: {
    display: 'flex', gap: 40, marginBottom: 12, flexWrap: 'wrap', alignItems: 'flex-start',
  },
  legendBlock: { display: 'flex', flexDirection: 'column', gap: 5 },
  legendTitle: {
    fontSize: 9.5, fontWeight: 600, color: '#73726C', marginBottom: 3,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    textTransform: 'uppercase', letterSpacing: '0.04em',
  },
  legItem: {
    display: 'flex', alignItems: 'center', gap: 7,
    fontSize: 9, color: '#73726C',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  legSwatch: { width: 16, height: 10, borderRadius: 2, flexShrink: 0 },
  legCircleWrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 28, flexShrink: 0,
  },
  mapFootnote: {
    fontSize: 9, color: '#A0A09A', fontStyle: 'italic',
    marginBottom: 14, lineHeight: 1.5,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  footnoteStrong: { fontWeight: 600, color: '#73726C' },
  bottomNote: {
    background: 'rgba(34,55,90,0.04)', borderLeft: '2px solid rgba(34,55,90,0.20)',
    borderRadius: '0 6px 6px 0', padding: '9px 14px',
    fontSize: 10, color: '#22375A', lineHeight: 1.6,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  bottomNoteStrong: { fontWeight: 600 },
  disclaimer: {
    marginTop: 10, fontSize: 9, color: '#C0BFB9',
    fontStyle: 'italic', textAlign: 'right',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  tooltip: {
    position: 'fixed',
    background: '#fff',
    border: '0.5px solid rgba(0,0,0,0.12)',
    borderRadius: 8,
    padding: '10px 13px',
    pointerEvents: 'none',
    zIndex: 9999,
    maxWidth: 240,
    lineHeight: 1.55,
    display: 'none',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    boxShadow: 'none',
  },
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function D3_GeoMap() {
  const mapRef         = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef     = useRef([]);
  const animFrameRef   = useRef(null);
  const animRadiiRef   = useRef(CITIES.map(c => radius(c.p99G0)));
  const tooltipRef     = useRef(null);

  const [scenario,  setScenario]  = useState('G0');
  const [worldView, setWorldView] = useState(false);

  // ── Initialize Leaflet map ────────────────────────────────────────────────
  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center:           EUROPE_CENTER,
      zoom:             EUROPE_ZOOM,
      zoomControl:      true,
      scrollWheelZoom:  false,
      attributionControl: true,
      minZoom:          2,
      maxZoom:          8,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '\u00a9 OpenStreetMap contributors \u00a9 CARTO',
      maxZoom: 8, minZoom: 2,
    }).addTo(map);

    // ── Tooltip helpers — use tooltipRef.current directly ─────────────────
    function positionTip(leafletEvent) {
      const tip = tooltipRef.current; if (!tip) return;
      const ev = leafletEvent.originalEvent || leafletEvent;
      let left = ev.clientX + 16;
      const top = ev.clientY - 10;
      if (left + 250 > window.innerWidth) left = ev.clientX - 254;
      tip.style.left = left + 'px';
      tip.style.top  = top  + 'px';
    }

    function hideTip() {
      const tip = tooltipRef.current;
      if (tip) tip.style.display = 'none';
    }

    function showCityTip(leafletEvent, city) {
      const tip = tooltipRef.current; if (!tip) return;
      const delta = Math.round((city.p99G0 - city.p99G2) / city.p99G0 * 100);
      tip.innerHTML = `
        <div style="font-weight:600;font-size:12px;color:#22375A;margin-bottom:4px;font-family:'Plus Jakarta Sans',sans-serif">${city.name}</div>
        <div style="font-size:10px;color:#888780;margin-bottom:7px;font-family:'Plus Jakarta Sans',sans-serif">${city.sector} \u00b7 Beta(${city.beta},${city.beta})</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px 8px;font-size:10px;">
          <div style="color:#888780;font-family:'Plus Jakarta Sans',sans-serif">P99\u00d7\u03b8 G0</div>
          <div style="font-family:'JetBrains Mono',monospace;font-weight:600;color:#B5403F">${city.p99G0.toLocaleString()}</div>
          <div style="color:#888780;font-family:'Plus Jakarta Sans',sans-serif">P99\u00d7\u03b8 G2</div>
          <div style="font-family:'JetBrains Mono',monospace;font-weight:600;color:#4A7C59">${city.p99G2.toLocaleString()}</div>
          <div style="color:#888780;font-family:'Plus Jakarta Sans',sans-serif">Governance gain</div>
          <div style="font-family:'JetBrains Mono',monospace;font-weight:600;color:#22375A">\u2212${delta}%</div>
          <div style="color:#888780;font-family:'Plus Jakarta Sans',sans-serif">Alpha (stack)</div>
          <div style="font-family:'JetBrains Mono',monospace;color:#73726C">${city.alpha}</div>
        </div>
      `;
      tip.style.display = 'block';
      positionTip(leafletEvent);
    }

    function showCountryTip(leafletEvent, name, info) {
      const tip = tooltipRef.current; if (!tip) return;
      tip.innerHTML = `
        <div style="font-weight:600;font-size:12px;color:#22375A;margin-bottom:4px;font-family:'Plus Jakarta Sans',sans-serif">${name}</div>
        <div style="font-size:10px;color:#888780;margin-bottom:6px;font-family:'Plus Jakarta Sans',sans-serif">Labour market homogeneity</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px 8px;font-size:10px;">
          <div style="color:#888780;font-family:'Plus Jakarta Sans',sans-serif">Beta(a,a)</div>
          <div style="font-family:'JetBrains Mono',monospace;font-weight:600;color:#22375A">${info.beta}</div>
          <div style="color:#888780;font-family:'Plus Jakarta Sans',sans-serif">Category</div>
          <div style="color:#22375A;font-family:'Plus Jakarta Sans',sans-serif">${info.label}</div>
        </div>
        <div style="margin-top:6px;font-size:9px;color:#C0BFB9;font-style:italic;font-family:'Plus Jakarta Sans',sans-serif">Higher Beta = more homogeneous pipeline = more conformism pressure</div>
      `;
      tip.style.display = 'block';
      positionTip(leafletEvent);
    }

    // ── Beta country overlay pane (z-index 200 — below circleMarkers at 400) ─
    const betaPane = map.createPane('betaPane');
    betaPane.style.zIndex = 200;

    // ── GeoJSON — teal→navy by beta tier ─────────────────────────────────────
    fetch(GEOJSON_URL)
      .then(r => r.json())
      .then(geojson => {
        L.geoJSON(geojson, {
          pane: 'betaPane',
          filter: feature => {
            const n = feature.properties.ADMIN || feature.properties.NAME || feature.properties.name;
            return getBetaForCountry(n) !== null;
          },
          style: feature => {
            const n = feature.properties.ADMIN || feature.properties.NAME || feature.properties.name;
            const info = getBetaForCountry(n);
            return {
              fillColor:   betaFill(info ? info.beta : 1.5),
              fillOpacity: 0.65,
              color:       'rgba(34,55,90,0.12)',
              weight:      0.5,
            };
          },
          onEachFeature: (feature, layer) => {
            const n = feature.properties.ADMIN || feature.properties.NAME || feature.properties.name;
            const info = getBetaForCountry(n);
            if (!info) return;
            layer.on('mouseover', (e) => {
              layer.setStyle({ fillOpacity: 0.85 });
              showCountryTip(e, n, info);
            });
            layer.on('mousemove', (e) => positionTip(e));
            layer.on('mouseout', () => {
              layer.setStyle({ fillOpacity: 0.65 });
              hideTip();
            });
          },
        }).addTo(map);
      })
      .catch(() => {
        // GeoJSON fetch failed silently
      });

    // ── City circle markers ────────────────────────────────────────────────
    // NOTE: NO pane: 'markerPane' — circleMarkers are SVG vector layers.
    // They go into the default overlayPane (z-index 400), which renders ABOVE
    // betaPane (z-index 200). Specifying pane: 'markerPane' (an HTML pane)
    // causes SVG circles to be invisible.
    const markers = [];

    CITIES.forEach((city, i) => {
      const r = radius(city.p99G0);

      const marker = L.circleMarker([city.lat, city.lng], {
        radius:      r,
        color:       '#fff',
        weight:      1.5,
        fillColor:   CIRCLE_FILL.G0,
        fillOpacity: 1,
      }).addTo(map);

      marker.on('mouseover', (e) => showCityTip(e, city));
      marker.on('mousemove', (e) => positionTip(e));
      marker.on('mouseout',  () => hideTip());

      markers.push(marker);
      animRadiiRef.current[i] = r;

      // Permanent label for 3 landmark cities
      if (city.permanentLabel) {
        L.marker([city.lat, city.lng], {
          icon: L.divIcon({
            className: '',
            html: `<span style="
              font-family:'Plus Jakarta Sans',sans-serif;
              font-size:8px;font-weight:600;
              color:rgba(34,55,90,0.70);
              white-space:nowrap;pointer-events:none;
              text-shadow:0 0 3px #fff,0 0 3px #fff;
              display:block;margin-top:2px;
            ">${city.name}</span>`,
            iconSize:   [0, 0],
            iconAnchor: [-4, r + 6],
          }),
          interactive: false,
        }).addTo(map);
      }
    });

    markersRef.current = markers;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Animate circles on scenario switch ───────────────────────────────────
  useEffect(() => {
    const markers = markersRef.current;
    if (!markers.length) return;

    const fromR = [...animRadiiRef.current];
    const toR   = CITIES.map(c => radius(scenario === 'G0' ? c.p99G0 : c.p99G2));
    const fillColor = CIRCLE_FILL[scenario];
    const start = performance.now();
    const DURATION = 750;

    function step(now) {
      const raw  = Math.min((now - start) / DURATION, 1);
      const ease = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;

      markers.forEach((m, i) => {
        const r = fromR[i] + (toR[i] - fromR[i]) * ease;
        animRadiiRef.current[i] = r;
        m.setRadius(r);
        m.setStyle({ fillColor });
      });

      if (raw < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        animFrameRef.current = null;
        animRadiiRef.current = [...toR];
      }
    }

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [scenario]);

  // ── View toggle ───────────────────────────────────────────────────────────
  const handleViewToggle = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (!worldView) {
      map.flyTo(WORLD_CENTER, WORLD_ZOOM, { duration: 0.9 });
      setWorldView(true);
    } else {
      map.flyTo(EUROPE_CENTER, EUROPE_ZOOM, { duration: 0.9 });
      setWorldView(false);
    }
  }, [worldView]);

  const handleScenario = useCallback((sc) => setScenario(sc), []);

  return (
    <GraphCard
      id="D3"
      title={'Twenty cities \u2014 one structural map'}
      subtitle={
        'Circle size encodes P99\u00d7\u03b8 tail risk. ' +
        'Background shading encodes national labour market cognitive homogeneity (Beta parameter) ' +
        '\u2014 a structural driver, not a country risk score. ' +
        'The map is a labour market and procurement map wearing geographic clothing.'
      }
    >
      {/* Controls row */}
      <div style={styles.controls}>
        <Toggle
          options={TOGGLE_OPTIONS}
          value={scenario}
          onChange={handleScenario}
        />
        <button
          style={styles.viewBtn}
          onClick={handleViewToggle}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(97,158,168,0.18)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(97,158,168,0.08)'; }}
        >
          {worldView ? 'Europe view' : 'World view'}
        </button>
        <span style={styles.ctrlNote}>
          {scenario === 'G0'
            ? 'Circle area \u221d P99\u00d7\u03b8 \u2014 unmanaged AI. Hover city or country for detail.'
            : 'Circles shrink under governance \u2014 London and Singapore move most'}
        </span>
      </div>

      {/* Leaflet map container */}
      <div ref={mapRef} style={styles.mapContainer} />

      {/* Legend */}
      <div style={styles.legendsRow}>
        <div style={styles.legendBlock}>
          <div style={styles.legendTitle}>
            {'Background \u2014 labour market homogeneity (Beta)'}
          </div>
          {BETA_PALETTE.map((tier) => (
            <div key={tier.max} style={styles.legItem}>
              <div style={{ ...styles.legSwatch, background: tier.fill }} />
              {tier.label}
            </div>
          ))}
        </div>

        <div style={styles.legendBlock}>
          <div style={styles.legendTitle}>
            {'Circle size \u2014 P99\u00d7\u03b8'}
          </div>
          {[
            { p99: 1668, label: '1,668 \u2014 London (lowest)' },
            { p99: 2041, label: '2,041 \u2014 Paris' },
            { p99: 2318, label: '2,318 \u2014 Seoul (highest)' },
          ].map(({ p99, label }) => {
            const r = radius(p99);
            const d = Math.round(r * 2);
            return (
              <div key={p99} style={styles.legItem}>
                <div style={styles.legCircleWrap}>
                  <div style={{
                    width: d, height: d, borderRadius: '50%',
                    background: 'rgba(34,55,90,0.65)', flexShrink: 0,
                  }} />
                </div>
                {label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Background footnote */}
      <div style={styles.mapFootnote}>
        <span style={styles.footnoteStrong}>
          Background shading encodes national labour market cognitive homogeneity (Beta parameter)
        </span>
        {' \u2014 one of five structural risk drivers. It is NOT a country-level AI risk index. '}
        Darker background = more homogeneous labour market = higher conformism pressure, all else equal.
      </div>

      {/* Bottom note — PROTECTED FORMULATION */}
      <div style={styles.bottomNote}>
        <span style={styles.bottomNoteStrong}>What the map reveals: </span>
        The high-risk cluster (Seoul, Brussels, Frankfurt) shares dark
        backgrounds \u2014 homogeneous labour markets \u2014 combined with concentrated AI
        stacks. London and Singapore sit in the low-risk zone: their diverse labour
        markets and architectural choices produce similar outcomes from opposite
        structural positions.{' '}
        The map is a labour market and procurement map wearing geographic clothing.
      </div>

      <div style={styles.disclaimer}>
        v5 simulation. Circles sized by \u221aP99\u00d7\u03b8. 8 confirmed profiles + 12 supplementary.
      </div>

      {/* Floating tooltip — fixed position */}
      <div ref={tooltipRef} style={styles.tooltip} />
    </GraphCard>
  );
}
