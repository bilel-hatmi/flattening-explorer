import React from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

const S = {
  page: { maxWidth: 1080, margin: '0 auto', padding: '64px 24px 96px' },
  h1: { fontFamily: "'Instrument Serif', serif", fontSize: 36, color: '#22375A', marginBottom: 8 },
  h2: { fontFamily: "'Instrument Serif', serif", fontSize: 24, color: '#22375A', marginTop: 48, marginBottom: 16 },
  h3: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 600, color: '#22375A', marginTop: 32, marginBottom: 12 },
  p: { fontSize: 14, color: '#22375A', lineHeight: 1.7, marginBottom: 16 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 24 },
  th: { textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid rgba(0,0,0,0.1)', fontWeight: 600, color: '#22375A', fontSize: 12 },
  td: { padding: '6px 12px', borderBottom: '0.5px solid rgba(0,0,0,0.05)', color: '#22375A', fontSize: 13 },
  tdMono: { fontFamily: "'JetBrains Mono', monospace", fontSize: 12 },
  note: { background: 'rgba(34,55,90,0.04)', borderLeft: '2px solid rgba(34,55,90,0.20)', borderRadius: '0 6px 6px 0', padding: '12px 16px', fontSize: 13, color: '#22375A', lineHeight: 1.6, marginBottom: 24 },
  bio: { background: 'rgba(97,158,168,0.06)', border: '0.5px solid rgba(97,158,168,0.20)', borderRadius: 10, padding: '16px 20px', fontSize: 13, color: '#22375A', lineHeight: 1.6, marginTop: 32, marginBottom: 24 },
};

export default function About() {
  return (
    <div style={S.page}>
      <h1 style={S.h1}>About the model</h1>

      {/* ── The mechanism ──────────────────────────────────────────── */}
      <h2 style={S.h2}>The mechanism</h2>
      <p style={S.p}>
        Two independent channels drive the same failure. The first operates before any decision is made. Algorithmic hiring filters compress the distribution of cognitive profiles in the workforce, selecting for conformity and eliminating the dissenters who would question AI outputs. When every employee reasons through the same narrow pipeline, a wrong AI recommendation propagates without friction. This is the screening channel.
      </p>
      <p style={S.p}>
        The second channel operates continuously after adoption. Employees who retain independent judgment progressively surrender it to AI-generated recommendations. Shaw and Nave (2026) document surrender rates above 79% under realistic time pressure. Dell'Acqua et al. (2026) show that AI compresses the skill distribution: the bottom half gains substantially while the top loses its edge relative to the frontier. Both effects reduce the diversity of <em>errors</em>, not their frequency but their independence. An organisation where 80% of employees follow the same model makes one large correlated bet per quarter, not two hundred small independent ones.
      </p>
      <p style={S.p}>
        These two channels converge on a single quantity: mean pairwise error correlation <InlineMath math="\bar{\rho}" />. The catastrophe follows from an algebraic identity. Page (2007) and Krogh & Vedelsby (1995) established that collective prediction error decomposes into average individual error minus the variance of predictions across agents. Wood et al. (JMLR, 2023) extended this to the loss distribution of a decision portfolio. When <InlineMath math="\bar{\rho}" /> rises, improvements in individual accuracy are overwhelmed by co-movement. The mean improves. The tail explodes.
      </p>

      {/* ── Key equations ──────────────────────────────────────────── */}
      <h3 style={S.h3}>Key equations</h3>
      <BlockMath math="\text{Var}(L) = NK\,\bar{p}(1-\bar{p})\bigl[1 + (NK-1)\,\bar{\rho}\bigr]" />
      <p style={S.p}>
        When AI reduces average errors (<InlineMath math="\downarrow\bar{p}" />) but surrender increases pairwise error correlation (<InlineMath math="\uparrow\bar{\rho}" />), aggregate loss variance scales with the second term. For <InlineMath math="N=200" /> agents and <InlineMath math="K=10" /> decisions, the multiplier <InlineMath math="(NK-1) = 1999" /> amplifies any increase in <InlineMath math="\bar{\rho}" /> by three orders of magnitude.
      </p>

      <p style={S.p}>
        The Vasicek single-factor structure encodes why errors correlate. Each quarter, all employees sharing the same AI model face the same systematic shock <InlineMath math="\xi_t" />:
      </p>
      <BlockMath math="Z_{\text{AI},k} = \sqrt{\alpha}\,\xi_t + \sqrt{1-\alpha}\,\varepsilon_k" />
      <p style={S.p}>
        Employee <InlineMath math="i" /> overrides the AI on decision <InlineMath math="k" /> if their independent skill <InlineMath math="h_i" /> exceeds the recommendation threshold. Under unmanaged adoption, <InlineMath math="\alpha = 0.70" />: decisions within a centralised AI stack share 70% of their error variance. In a crisis quarter, <InlineMath math={String.raw`\xi_t \sim \mathcal{N}(2.2,\, 0.3)`} />: every follower fails on correlated decisions simultaneously.
      </p>

      <p style={S.p}>The conformism pressure term links workforce homogeneity to effective surrender rate:</p>
      <BlockMath math={String.raw`p_0^{\text{eff}}(t) = p_0 \cdot \left[1 + \beta_{\text{conform}} \cdot \frac{\text{Var}_{\text{ref}} - \text{Var}(\tau(t))}{\text{Var}_{\text{ref}}}\right]`} />
      <p style={S.p}>
        As screening compresses <InlineMath math={String.raw`\text{Var}(\tau)`} />, fewer dissenters remain. Asch (1951) showed that a single dissenter reduces conformity from 37% to 5%. Without dissenters, <InlineMath math={String.raw`p_0^{\text{eff}}`} /> rises toward 1. With <InlineMath math={String.raw`\beta_{\text{conform}} = 0.30`} />, a 30% reduction in cognitive diversity produces a 9-percentage-point increase in the effective surrender rate.
      </p>

      <p style={S.p}>The scaffold benefit metric measures whether governance earns its velocity cost:</p>
      <BlockMath math={String.raw`\text{scaffold\_benefit} = \frac{r_{G2} - r_{G0}}{r_{G0}}, \quad r = \frac{\Delta\text{Output\%}}{\Delta\text{P99}\%}`} />
      <p style={S.p}>
        A positive value means governance improves the output-to-risk ratio. Negative means the velocity cost of maintaining independent judgment before consulting AI exceeds the risk reduction. London: <InlineMath math="+1.46" />. San Francisco: <InlineMath math="-0.36" />.
      </p>

      {/* ── Simulation setup ──────────────────────────────────────── */}
      <h3 style={S.h3}>Simulation setup</h3>
      <p style={S.p}>
        The model places 200 agents in an organisation over 20 quarters (five years), with 10 decisions per agent per quarter and 200 Monte Carlo replications per configuration. Environmental exposure <InlineMath math="\pi_t" /> is drawn from a two-regime mixture: 92% normal quarters with mean frontier exposure 0.73, and 8% crisis quarters with mean exposure 0.35. Crisis quarters couple with a high systematic shock (<InlineMath math={String.raw`\xi_t \sim \mathcal{N}(2.2, 0.3)`} />), producing the bimodal loss distribution that characterises the model. Eight organisational archetypes, anchored on documented labour market and procurement structures, span the full parameter space from Seoul's centralised national administration (<InlineMath math={String.raw`\alpha = 0.95`} />, <InlineMath math={String.raw`\text{Beta}(4.5)`} />) to Singapore's diversified creative agency (<InlineMath math={String.raw`\alpha = 0.30`} />, <InlineMath math={String.raw`\text{Beta}(1.5)`} />).
      </p>

      {/* ── What the model does not capture ────────────────────────── */}
      <h3 style={S.h3}>What the model does not capture</h3>
      <div style={S.note}>
        <p style={{ ...S.p, marginBottom: 8 }}><strong>The D{'\u2192'}H bridge remains an inference.</strong> Keck & Tang (2020) document error decorrelation in cognitively diverse groups in the laboratory. No field study has measured pairwise error correlations before and after ATS deployment. The causal chain from screening to surrender operates through <InlineMath math={String.raw`\beta_{\text{conform}}`} />, a calibrated parameter rather than an observed relationship.</p>
        <p style={{ ...S.p, marginBottom: 8 }}><strong>The feedback loop from deskilling to surrender is absent.</strong> Employees who lose independent judgment competence likely defer to AI more readily. This loop is omitted; all dynamic estimates are therefore conservative.</p>
        <p style={{ ...S.p, marginBottom: 8 }}><strong>External labour market dynamics are not modelled.</strong> The pool of candidates is treated as fixed and infinite. Peng & Garg (NeurIPS 2024) show monoculture reinforces itself as more firms adopt the same tools, an omitted amplification.</p>
        <p style={{ ...S.p, marginBottom: 8 }}><strong>The Nash equilibrium is qualitative.</strong> The model generates output differentials that create competitive pressure toward G0. The precise equilibrium depends on market structure, which the intra-firm model does not calibrate.</p>
        <p style={{ ...S.p, marginBottom: 0 }}><strong>The scaffold efficiency is asymmetric by design.</strong> The model captures the velocity cost of active governance (<InlineMath math="\theta" /> drops from 1.25 to 1.10) but does not model the full organisational cost of implementing cognitive forcing functions.</p>
      </div>

      {/* ── Validation ────────────────────────────────────────────── */}
      <h3 style={S.h3}>Validation</h3>
      <p style={S.p}>
        Six dynamic verifications (V1{'\u2013'}V6) confirmed the model's behavioural properties beyond the central paradox. V1 measured pairwise error correlation directly: C_excess rises from 0.045 to 0.064 under G0 over 20 quarters (+44%), validating the Wood et al. mechanism as a measured trajectory rather than an algebraic assumption. V2 confirmed bimodality is causally pure: 99.7% of quarters above the catastrophe threshold carry crisis_flag=True. V5 verified that the paradox holds without exception across <InlineMath math={String.raw`p_{\text{crisis}} \in \{0.04, 0.15\}`} />.
      </p>
      <p style={S.p}>
        Two independent implementations converge: one O(N{'\u00b3'}) Gaussian copula, one O(N) Ornstein{'\u2013'}Uhlenbeck approximation. They agree to within {'\u00b1'}2% on E[L] and {'\u00b1'}5% on P99 for M=200. Scaffold benefit directions match 8/8 across implementations; magnitudes are consistent within Monte Carlo noise.
      </p>

      {/* ── Calibration ───────────────────────────────────────────── */}
      <h2 style={S.h2}>Calibration</h2>

      <h3 style={S.h3}>Base parameters</h3>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Parameter</th>
            <th style={S.th}>Symbol</th>
            <th style={S.th}>Value</th>
            <th style={S.th}>Anchor</th>
            <th style={S.th}>Conf.</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Agents', 'N', '200', 'Mid-market organisation', '\u2014'],
            ['Quarters', 'T', '20', 'BLS JOLTS tenure 3.5\u20135.7 yrs', '\u2605\u2605\u2605\u2605\u2605'],
            ['Decisions / quarter', 'K', '10', 'Granularity parameter', '\u2014'],
            ['Replications', 'M', '200', 'P99 convergence', '\u2014'],
            ['Quarterly turnover', '\u03b4', '0.04', 'BLS JOLTS ~15%/yr', '\u2605\u2605\u2605\u2605\u2605'],
            ['Base surrender (G0)', 'p\u2080', '0.80', 'Shaw & Nave 79.8%', '\u2605\u2605\u2605\u2605\u2605'],
            ['AI accuracy (inside)', 'q_in(t)', '0.92 + 0.002t', "Dell'Acqua +40% inside", '\u2605\u2605\u2605\u2605\u2605'],
            ['AI accuracy (outside)', 'q_out', '0.55', "Dell'Acqua ~60% error", '\u2605\u2605\u2605\u2605\u2605'],
            ['Conformism coefficient', '\u03b2_conform', '0.30', 'Asch, Lorenz, Shaw & Nave', '\u2605\u2605\u2605'],
            ['Deskilling rate', '\u03b7', '0.02/qtr', 'Budzy\u0144 \u22126pp, Arthur meta', '\u2605\u2605\u2605\u2605'],
            ['Crisis frequency', 'p_crisis', '0.08', 'Flyvbjerg PMJ 2025', '\u2605\u2605\u2605'],
            ['Vasicek concentration', '\u03b1 (default)', '0.70', 'CrowdStrike, Menlo 88%', '\u2605\u2605\u2605'],
          ].map(([param, sym, val, anchor, conf]) => (
            <tr key={param}>
              <td style={S.td}>{param}</td>
              <td style={{ ...S.td, ...S.tdMono }}>{sym}</td>
              <td style={{ ...S.td, ...S.tdMono }}>{val}</td>
              <td style={S.td}>{anchor}</td>
              <td style={S.td}>{conf}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={S.h3}>Scenario parameters</h3>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Parameter</th>
            <th style={S.th}>Baseline</th>
            <th style={S.th}>G0</th>
            <th style={S.th}>G1</th>
            <th style={S.th}>G2</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Surrender rate (p\u2080)', '0.0', '0.80', '0.70', '0.55'],
            ['Conformity pressure (\u03b3_eff)', '0.0', '5.0', '3.5', '1.5'],
            ['Deskilling multiplier (\u03b7_mult)', '0.0', '1.0', '1.0', '0.5'],
            ['Throughput multiplier (\u03b8)', '1.00', '1.25', '1.20', '1.10'],
            ['Diversity quota', '\u2014', '\u2014', '\u2014', '10%'],
            ['Velocity cost vs G0', 'N/A', 'reference', '\u22124.2%', '\u221212%'],
          ].map(([param, bl, g0, g1, g2]) => (
            <tr key={param}>
              <td style={S.td}>{param}</td>
              <td style={{ ...S.td, ...S.tdMono }}>{bl}</td>
              <td style={{ ...S.td, ...S.tdMono }}>{g0}</td>
              <td style={{ ...S.td, ...S.tdMono }}>{g1}</td>
              <td style={{ ...S.td, ...S.tdMono }}>{g2}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={S.h3}>Organisational profiles</h3>
      <div style={{ overflowX: 'auto', marginBottom: 24 }}>
        <table style={{ ...S.table, minWidth: 640 }}>
          <thead>
            <tr>
              <th style={S.th}>Profile</th>
              <th style={S.th}>City</th>
              <th style={S.th}>Sector</th>
              <th style={S.th}>E[{'\u03c0'}]</th>
              <th style={S.th}>{'\u03b1'}</th>
              <th style={S.th}>Beta(a,a)</th>
              <th style={S.th}>h range</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['P1', 'Frankfurt', 'Big Four audit', '0.50', '0.70', '3.5', 'U(0.55, 0.85)'],
              ['P2', 'London', 'Investment bank', '0.55', '0.40', '1.5', 'U(0.65, 0.95)'],
              ['P3', 'Paris', 'Strategy consulting', '0.55', '0.90', '4.0', 'U(0.65, 0.95)'],
              ['P4', 'Brussels', 'Corporate legal', '0.45', '0.90', '3.0', 'U(0.40, 0.80)'],
              ['P5', 'San Francisco', 'Tech startup', '0.70', '0.60', '2.5', 'U(0.50, 0.85)'],
              ['P6', 'Singapore', 'Creative agency', '0.85', '0.30', '1.5', 'U(0.40, 0.80)'],
              ['P7', 'Bangalore', 'Back-office', '0.75', '0.70', '2.0', 'U(0.30, 0.60)'],
              ['P8', 'Seoul', 'Central admin', '0.60', '0.95', '4.5', 'U(0.40, 0.75)'],
            ].map(([p, city, sector, epi, alpha, beta, h]) => (
              <tr key={p}>
                <td style={{ ...S.td, fontWeight: 600 }}>{p}</td>
                <td style={S.td}>{city}</td>
                <td style={S.td}>{sector}</td>
                <td style={{ ...S.td, ...S.tdMono }}>{epi}</td>
                <td style={{ ...S.td, ...S.tdMono }}>{alpha}</td>
                <td style={{ ...S.td, ...S.tdMono }}>{beta}</td>
                <td style={{ ...S.td, ...S.tdMono }}>{h}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ ...S.p, fontSize: 12, color: '#888780' }}>
        Beta(a,a) encodes labour market cognitive homogeneity. a = 1.5: internationally diversified hub (London, Singapore). a = 4.0{'\u2013'}4.5: national competitive examination pipeline (Paris grandes {'\u00e9'}coles, Korean civil service). All Beta parameters derived from labour market proxies (Bourdieu 1989, HESA, MOM Singapore, PISA 2022).
      </p>

      <h3 style={S.h3}>Reference results</h3>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Profile</th>
            <th style={S.th}>E[L]</th>
            <th style={S.th}>P99{'\u00d7'}{'\u03b8'}</th>
            <th style={S.th}>Output</th>
            <th style={S.th}>Scaffold</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Central case', '498.9', '2,135', '1,876', '\u2014'],
            ['P1 Frankfurt', '572.9', '2,124', '1,784', '\u22123%'],
            ['P2 London', '507.4', '1,668', '1,866', '+146%'],
            ['P3 Paris', '480.8', '2,041', '1,899', '+77%'],
            ['P4 Brussels', '597.2', '2,254', '1,754', '\u22128%'],
            ['P5 S.F.', '467.7', '2,154', '1,915', '\u221236%'],
            ['P6 Singapore', '440.3', '1,845', '1,950', '+40%'],
            ['P7 Bangalore', '509.8', '2,310', '1,863', '\u221226%'],
            ['P8 Seoul', '479.8', '2,318', '1,900', '\u22126%'],
          ].map(([p, el, p99, out, sc]) => (
            <tr key={p}>
              <td style={{ ...S.td, fontWeight: 600 }}>{p}</td>
              <td style={{ ...S.td, ...S.tdMono }}>{el}</td>
              <td style={{ ...S.td, ...S.tdMono }}>{p99}</td>
              <td style={{ ...S.td, ...S.tdMono }}>{out}</td>
              <td style={{ ...S.td, ...S.tdMono, color: sc.startsWith('+') ? '#4A7C59' : sc.startsWith('\u2212') ? '#B5403F' : '#888780' }}>{sc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 48, fontSize: 11, color: '#888780', fontStyle: 'italic', textAlign: 'center' }}>
        The Flattening Explorer {'\u2014'} Cambridge{'\u2013'}McKinsey Risk Prize 2026
      </div>
    </div>
  );
}
