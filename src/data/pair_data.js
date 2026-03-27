// ── C6 Comparator — 28 pair comparison texts ────────────────────────────────
// Extracted from prototypes/C6_comparator.html (v5, beta_conform=0.30)
//
// The prototype defines 26 unique pairs (with 4 duplicate keys where later
// definitions overwrite earlier ones). Two pairs are missing from the prototype:
//   - P1-P2 (Big Four Frankfurt vs Inv. bank London)
//   - P4-P5 (Corp. legal Brussels vs Tech startup S.F.)
// These are marked with placeholder insights below — to be filled by the
// orchestrateur modelisateur.
//
// Categories (tiers):
//   tier 1 / green  = "Clean structural contrast"
//   tier 2 / orange = "Mixed — interpret with care"
//   tier 3 / grey   = "Illustrative — multiple drivers"

export const PAIRS = [
  // ── TIER 1 — Clean structural contrasts ────────────────────────────────────
  {
    id: 1,
    left:  { profile: 'P2', scenario: 'G0', label: 'Inv. bank — London' },
    right: { profile: 'P3', scenario: 'G0', label: 'Consulting — Paris' },
    insight: '<strong>Same sector, same talent tier.</strong> Paris recruits through competitive national examinations that produce a narrow cognitive profile (Beta 4.0), while London recruits from a globally diverse labour market (Beta 1.5). The Vasicek parameter \u03B1 encodes the rest \u2014 Paris deploys a centralised AI stack (\u03B1=0.90) versus London\u2019s partially diversified one (\u03B1=0.40). Neither is a management choice. Both are structural features of their respective labour markets and procurement environments.',
    category: 'Clean structural contrast',
    tier: 1,
    badge: 'green',
    drivers: '\u03B1 (0.40 vs 0.90) + Beta (1.5 vs 4.0)',
  },
  {
    id: 2,
    left:  { profile: 'P3', scenario: 'G0', label: 'Consulting — Paris' },
    right: { profile: 'P8', scenario: 'G0', label: 'Central admin — Seoul' },
    insight: '<strong>Both recruit through narrow national pipelines</strong> \u2014 French grandes \u00E9coles and Korean civil service examinations. The difference is procurement: Seoul operates on a single nationally tendered AI system (\u03B1=0.95), the most centralised stack in the model. When the AI errs, the failure propagates across an entire administration simultaneously. The 14% difference in tail risk is the price of one procurement decision.',
    category: 'Clean structural contrast',
    tier: 1,
    badge: 'green',
    drivers: '\u03B1 (0.90 vs 0.95) + Beta (4.0 vs 4.5)',
  },
  {
    id: 3,
    left:  { profile: 'P6', scenario: 'G0', label: 'Creative agency — Singapore' },
    right: { profile: 'P8', scenario: 'G0', label: 'Central admin — Seoul' },
    insight: '<strong>Three structural factors diverge simultaneously.</strong> Singapore\u2019s creative agency uses multiple AI tools across diverse teams (\u03B1=0.30), recruits internationally (Beta 1.5), and operates mostly within the AI\u2019s competence frontier (85% inside tasks). Seoul\u2019s central administration is the opposite on every dimension. The result is a 26% gap in tail risk \u2014 not a gap in management quality, but in structural position.',
    category: 'Clean structural contrast',
    tier: 1,
    badge: 'green',
    drivers: '\u03B1 (0.30 vs 0.95) + Beta (1.5 vs 4.5) + E[\u03C0] (0.85 vs 0.60)',
  },
  {
    id: 4,
    left:  { profile: 'P2', scenario: 'G0', label: 'Inv. bank — London' },
    right: { profile: 'P6', scenario: 'G0', label: 'Creative agency — Singapore' },
    insight: '<strong>Two safest profiles, protected by different mechanisms.</strong> London: talent-driven protection \u2014 elite hires who retain independent judgment. Singapore: architecture-driven \u2014 highly diversified AI tools in a reliably inside-frontier domain. London\u2019s governance benefit is high (+107%); Singapore\u2019s starts from lower absolute risk. The 11% gap reflects complementary structural advantages.',
    category: 'Clean structural contrast',
    tier: 1,
    badge: 'green',
    drivers: '\u03B1 (0.40 vs 0.30) + E[\u03C0] (0.55 vs 0.85)',
  },
  {
    id: 5,
    left:  { profile: 'P1', scenario: 'G0', label: 'Big Four — Frankfurt' },
    right: { profile: 'P3', scenario: 'G0', label: 'Consulting — Paris' },
    insight: '<strong>Two continental European professional service firms</strong> with similar sector exposure and comparable talent pipelines. The difference is narrow but instructive: Frankfurt uses a moderately centralised stack (\u03B1=0.70) with a slightly more diverse recruitment base than Paris. The 4% gap illustrates that stack concentration and cognitive homogeneity compound \u2014 small differences in both produce a visible difference in outcomes.',
    category: 'Clean structural contrast',
    tier: 1,
    badge: 'green',
    drivers: '\u03B1 (0.70 vs 0.90) + Beta (3.5 vs 4.0)',
  },
  {
    id: 6,
    left:  { profile: 'P3', scenario: 'G0', label: 'Consulting — Paris' },
    right: { profile: 'P4', scenario: 'G0', label: 'Corp. legal — Brussels' },
    insight: '<strong>Same centralised AI stack (\u03B1=0.90), similarly homogeneous pipelines.</strong> The difference is domain exposure: corporate legal work is almost entirely outside the AI\u2019s reliable frontier \u2014 55% of decisions involve novel regulatory interpretations the AI mishandles. Paris consulting, despite similar homogeneity, operates closer to the frontier. The 10% gap illustrates the sectoral dimension of AI tail risk.',
    category: 'Clean structural contrast',
    tier: 1,
    badge: 'green',
    drivers: 'E[\u03C0] (0.55 vs 0.45), \u03B1 identical (0.90)',
  },

  // ── TIER 2 — Mixed, interpret with care ────────────────────────────────────
  {
    id: 7,
    left:  { profile: 'P7', scenario: 'G0', label: 'Back-office — Bangalore' },
    right: { profile: 'P8', scenario: 'G0', label: 'Central admin — Seoul' },
    insight: '<strong>Nearly identical P99 figures through opposite causal structures.</strong> Bangalore concentrates risk through low workforce competence \u2014 when AI fails, there is little independent judgment. Seoul concentrates risk through maximum stack centralisation \u2014 when AI fails, the entire organisation fails together. This convergence is not reassuring: addressing one root cause leaves the other intact.',
    category: 'Mixed \u2014 interpret with care',
    tier: 2,
    badge: 'orange',
    drivers: 'h range + \u03B1 + Beta all differ',
  },
  {
    id: 8,
    left:  { profile: 'P4', scenario: 'G0', label: 'Corp. legal — Brussels' },
    right: { profile: 'P8', scenario: 'G0', label: 'Central admin — Seoul' },
    insight: '<strong>Both highest-risk profiles after Bangalore.</strong> Brussels combines maximum outside-frontier exposure with a centralised stack. Seoul combines maximum stack centralisation with the most homogeneous recruitment in the model. Both carry premiums above 90%. Neither benefits meaningfully from governance. Structural reform is the only effective lever.',
    category: 'Mixed \u2014 interpret with care',
    tier: 2,
    badge: 'orange',
    drivers: 'E[\u03C0] (0.45 vs 0.60) + \u03B1 (0.90 vs 0.95) + Beta',
  },
  {
    id: 9,
    left:  { profile: 'P2', scenario: 'G0', label: 'Inv. bank — London' },
    right: { profile: 'P5', scenario: 'G0', label: 'Tech startup — S.F.' },
    insight: '<strong>Comparable talent tiers, both in outside-frontier domains.</strong> The startup\u2019s tail risk is higher through three routes: more concentrated stack (\u03B1=0.60), less internationally diverse recruitment (Beta 2.5), and a velocity constraint that makes governance counterproductive. For the startup, scaffold benefit is \u221236% \u2014 not irrationality, but the Nash equilibrium in action.',
    category: 'Mixed \u2014 interpret with care',
    tier: 2,
    badge: 'orange',
    drivers: '\u03B1 (0.40 vs 0.60) + Beta (1.5 vs 2.5) + scaffold dynamic',
  },
  {
    id: 10,
    left:  { profile: 'P1', scenario: 'G0', label: 'Big Four — Frankfurt' },
    right: { profile: 'P4', scenario: 'G0', label: 'Corp. legal — Brussels' },
    insight: '<strong>Audit and corporate legal work share structural similarities</strong> \u2014 both regulatory, both homogeneous pipelines. Brussels\u2019s stack is more centralised (\u03B1=0.90) and its domain sits further outside the AI frontier (E[\u03C0]=0.45). Audit procedures, though complex, are more standardised than legal reasoning \u2014 the AI fails less frequently, and the failures are more visible. Result: 6% gap.',
    category: 'Mixed \u2014 interpret with care',
    tier: 2,
    badge: 'orange',
    drivers: '\u03B1 (0.70 vs 0.90) + E[\u03C0] (0.50 vs 0.45)',
  },
  {
    id: 11,
    left:  { profile: 'P3', scenario: 'G0', label: 'Consulting — Paris' },
    right: { profile: 'P5', scenario: 'G0', label: 'Tech startup — S.F.' },
    insight: '<strong>Similar tail risk levels, different mechanisms.</strong> Paris: elite talent with homogeneous cognitive profiles and a centralised stack \u2014 when AI fails, the workforce surrenders together. San Francisco: the velocity constraint makes governance counterproductive (scaffold benefit \u221236%). Both sit above the model average. Neither can protect itself through internal governance alone.',
    category: 'Mixed \u2014 interpret with care',
    tier: 2,
    badge: 'orange',
    drivers: '\u03B1 + Beta + scaffold dynamic all differ',
  },
  {
    id: 12,
    left:  { profile: 'P1', scenario: 'G0', label: 'Big Four — Frankfurt' },
    right: { profile: 'P7', scenario: 'G0', label: 'Back-office — Bangalore' },
    insight: '<strong>Both sit near the middle of the risk spectrum, for different reasons.</strong> Frankfurt faces moderate outside-frontier exposure with a somewhat homogeneous European pipeline. Bangalore has low workforce skill and rapid deskilling. Both are structurally vulnerable \u2014 Frankfurt through cognitive homogeneity, Bangalore through competence gap. The 9% gap between them reflects similar total risk from opposite causes.',
    category: 'Mixed \u2014 interpret with care',
    tier: 2,
    badge: 'orange',
    drivers: 'h range + \u03B2 + \u03B1 all differ',
  },
  {
    id: 13,
    left:  { profile: 'P5', scenario: 'G0', label: 'Tech startup — S.F.' },
    right: { profile: 'P6', scenario: 'G0', label: 'Creative agency — Singapore' },
    insight: '<strong>Both in predominantly inside-frontier domains.</strong> Singapore\u2019s lower tail risk reflects its architectural advantage: a diversified AI stack (\u03B1=0.30) and cosmopolitan recruitment (Beta 1.5) limit correlated errors. San Francisco\u2019s velocity constraint makes governance counterproductive (scaffold benefit \u221236%). Even in AI-friendly domains, stack architecture matters.',
    category: 'Mixed \u2014 interpret with care',
    tier: 2,
    badge: 'orange',
    drivers: '\u03B1 (0.60 vs 0.30) + Beta (2.5 vs 1.5) + scaffold dynamic',
  },

  // ── TIER 3 — Illustrative, multiple drivers ────────────────────────────────
  {
    id: 14,
    left:  { profile: 'P4', scenario: 'G0', label: 'Corp. legal — Brussels' },
    right: { profile: 'P6', scenario: 'G0', label: 'Creative agency — Singapore' },
    insight: '<strong>Highest-risk professional service profile versus lowest.</strong> Brussels concentrates five risk factors simultaneously: legal domain (55% outside frontier), centralised stack (\u03B1=0.90), homogeneous pipeline (Beta 3.0), lower talent, minimal deskilling resistance. Singapore diversifies four of them. The 22% gap reflects cumulative structural advantage \u2014 no single lever explains it.',
    category: 'Illustrative \u2014 multiple drivers',
    tier: 3,
    badge: 'grey',
    drivers: '\u03B1 + Beta + E[\u03C0] + h range all differ',
  },
  {
    id: 15,
    left:  { profile: 'P6', scenario: 'G0', label: 'Creative agency — Singapore' },
    right: { profile: 'P7', scenario: 'G0', label: 'Back-office — Bangalore' },
    insight: '<strong>Architecture vs competence as protection.</strong> Two inside-frontier domains (E[\u03C0]=0.85 and 0.75), 25% gap in tail risk. Singapore protected by architectural diversity (\u03B1=0.30) and international talent. Bangalore exposed by low workforce skill and concentrated stack. Domain exposure determines how often AI fails; architecture determines what happens when it does.',
    category: 'Illustrative \u2014 multiple drivers',
    tier: 3,
    badge: 'grey',
    drivers: 'h range + \u03B1 + \u03B2 + \u03B7 all differ',
  },
  {
    id: 16,
    left:  { profile: 'P2', scenario: 'G0', label: 'Inv. bank — London' },
    right: { profile: 'P8', scenario: 'G0', label: 'Central admin — Seoul' },
    insight: '<strong>Highest and second-lowest tail risk, 39% gap.</strong> Seoul concentrates maximum risk across every dimension: \u03B1=0.95, Beta 4.5. London diversifies across every structural dimension. Under active governance, London reduces residual premium to near-zero; Seoul retains above 40%. The gap is not closed by governance \u2014 it requires structural reform on multiple dimensions simultaneously.',
    category: 'Illustrative \u2014 multiple drivers',
    tier: 3,
    badge: 'grey',
    drivers: '\u03B1 + Beta + E[\u03C0] + h range all differ',
  },
  {
    id: 17,
    left:  { profile: 'P5', scenario: 'G0', label: 'Tech startup — S.F.' },
    right: { profile: 'P7', scenario: 'G0', label: 'Back-office — Bangalore' },
    insight: '<strong>Opposite ends of the talent spectrum, similar absolute tail risk.</strong> San Francisco\u2019s elite talent produces a high relative premium because its baseline is good. Bangalore\u2019s low skill produces high absolute tail risk \u2014 no independent judgment buffer. Both reject governance: Bangalore because forced judgment is weaker than AI, San Francisco because velocity cost exceeds risk reduction.',
    category: 'Illustrative \u2014 multiple drivers',
    tier: 3,
    badge: 'grey',
    drivers: 'h range + \u03B1 + \u03B7 + scaffold dynamic',
  },
  {
    id: 18,
    left:  { profile: 'P1', scenario: 'G0', label: 'Big Four — Frankfurt' },
    right: { profile: 'P8', scenario: 'G0', label: 'Central admin — Seoul' },
    insight: '<strong>Surprisingly small 9% gap despite very different structures.</strong> Frankfurt\u2019s mid-tier audit with a somewhat homogeneous pipeline and Seoul\u2019s maximum centralisation converge on nearly the same outcome. The similarity is coincidental \u2014 the risk architectures are entirely different and require entirely different interventions.',
    category: 'Illustrative \u2014 multiple drivers',
    tier: 3,
    badge: 'grey',
    drivers: '\u03B1 + Beta + E[\u03C0] all differ',
  },
  {
    id: 19,
    left:  { profile: 'P1', scenario: 'G0', label: 'Big Four — Frankfurt' },
    right: { profile: 'P6', scenario: 'G0', label: 'Creative agency — Singapore' },
    insight: '<strong>13% gap between two mid-tier organisations.</strong> Frankfurt\u2019s audit combines moderate stack concentration and homogeneous continental pipeline. Singapore runs a diversified multi-tool stack with international talent. Under governance, Singapore approaches near-zero residual premium; Frankfurt retains a meaningful premium \u2014 its stack architecture limits what governance can achieve.',
    category: 'Illustrative \u2014 multiple drivers',
    tier: 3,
    badge: 'grey',
    drivers: '\u03B1 + Beta + E[\u03C0] all differ',
  },
  {
    id: 20,
    left:  { profile: 'P2', scenario: 'G0', label: 'Inv. bank — London' },
    right: { profile: 'P7', scenario: 'G0', label: 'Back-office — Bangalore' },
    insight: '<strong>Lowest and near-highest tail risk, 28% gap.</strong> London\u2019s protection: elite talent (h 0.65\u20130.95), diversified stack (\u03B1=0.40), cognitive diversity (Beta 1.5). London also has the highest scaffold benefit in the model (+107%) \u2014 its existing diversity makes governance maximally effective. Bangalore\u2019s low skill and concentrated stack offer the opposite on every dimension.',
    category: 'Illustrative \u2014 multiple drivers',
    tier: 3,
    badge: 'grey',
    drivers: 'h range + \u03B1 + Beta all differ',
  },
  {
    id: 21,
    left:  { profile: 'P2', scenario: 'G0', label: 'Inv. bank — London' },
    right: { profile: 'P4', scenario: 'G0', label: 'Corp. legal — Brussels' },
    insight: '<strong>London\u2019s banking vs Brussels\u2019s legal.</strong> London: elite talent internationally, diversified stack. Brussels: mid-tier talent through a homogeneous pipeline, centralised stack, most challenging AI domain (E[\u03C0]=0.45). The 26% gap represents the compound effect of domain exposure, stack concentration, and cognitive homogeneity \u2014 all adverse for Brussels, all favourable for London.',
    category: 'Illustrative \u2014 multiple drivers',
    tier: 3,
    badge: 'grey',
    drivers: '\u03B1 + Beta + E[\u03C0] + h range all differ',
  },
  {
    id: 22,
    left:  { profile: 'P3', scenario: 'G0', label: 'Consulting — Paris' },
    right: { profile: 'P6', scenario: 'G0', label: 'Creative agency — Singapore' },
    insight: '<strong>Elite homogeneous vs creative diversified.</strong> Paris: elite talent, narrow pipeline, centralised stack. Singapore: mid-tier talent, international recruitment, diversified stack, inside-dominant domain. Paris carries 11% higher tail risk despite talent advantage \u2014 cognitive homogeneity and stack concentration more than offset elite skill. Singapore\u2019s governance benefit (+40%) amplifies existing structural advantages.',
    category: 'Illustrative \u2014 multiple drivers',
    tier: 3,
    badge: 'grey',
    drivers: '\u03B1 + Beta + E[\u03C0] + h range all differ',
  },
  {
    id: 23,
    left:  { profile: 'P3', scenario: 'G0', label: 'Consulting — Paris' },
    right: { profile: 'P7', scenario: 'G0', label: 'Back-office — Bangalore' },
    insight: '<strong>Similar P99, entirely different causal structures.</strong> Paris generates risk through cognitive homogeneity and stack concentration applied to elite talent. Bangalore generates risk through low skill and rapid deskilling. Paris benefits strongly from governance (+76%). Bangalore is penalised \u2014 forcing independent judgment in a low-skill workforce is counterproductive. The convergence in outcomes is misleading.',
    category: 'Illustrative \u2014 multiple drivers',
    tier: 3,
    badge: 'grey',
    drivers: 'h range + \u03B1 + Beta + \u03B7 + scaffold dynamic',
  },
  {
    id: 24,
    left:  { profile: 'P5', scenario: 'G0', label: 'Tech startup — S.F.' },
    right: { profile: 'P8', scenario: 'G0', label: 'Central admin — Seoul' },
    insight: '<strong>Both resist governance, for different reasons.</strong> San Francisco\u2019s startup rationally rejects governance \u2014 velocity cost exceeds risk benefit (scaffold benefit \u221236%). Seoul\u2019s administration is structurally resistant \u2014 cognitive homogeneity and maximum stack centralisation limit what any internal governance can achieve. The startup\u2019s resistance is rational and temporary; Seoul\u2019s is structural and persistent.',
    category: 'Illustrative \u2014 multiple drivers',
    tier: 3,
    badge: 'grey',
    drivers: '\u03B1 + Beta + E[\u03C0] + scaffold dynamic',
  },
  {
    id: 25,
    left:  { profile: 'P1', scenario: 'G0', label: 'Big Four — Frankfurt' },
    right: { profile: 'P5', scenario: 'G0', label: 'Tech startup — S.F.' },
    insight: '<strong>1% gap in P99\u00D7\u03B8, entirely different risk profiles.</strong> Frankfurt\u2019s audit carries moderate homogeneity risk from a continental professional pipeline. San Francisco\u2019s startup carries velocity-constrained risk that makes governance counterproductive (scaffold benefit \u221236%). Frankfurt: governance quasi-neutral. San Francisco: governance penalising. Near-identical tail risk figures hide opposite implications for governance strategy.',
    category: 'Illustrative \u2014 multiple drivers',
    tier: 3,
    badge: 'grey',
    drivers: '\u03B1 + Beta + scaffold dynamic all differ',
  },
  {
    id: 26,
    left:  { profile: 'P4', scenario: 'G0', label: 'Corp. legal — Brussels' },
    right: { profile: 'P7', scenario: 'G0', label: 'Back-office — Bangalore' },
    insight: '<strong>Two highest-risk profiles, both resistant to governance.</strong> Brussels combines maximum outside-frontier exposure with elite-adjacent talent in a concentrated stack. Bangalore combines low skill with rapid deskilling and a concentrated stack. Both see governance degrade efficiency. The 2% gap is not meaningful \u2014 both require structural intervention rather than internal governance solutions.',
    category: 'Illustrative \u2014 multiple drivers',
    tier: 3,
    badge: 'grey',
    drivers: 'E[\u03C0] + \u03B1 + h range + scaffold dynamic',
  },

  // ── MISSING FROM PROTOTYPE — placeholder pairs ─────────────────────────────
  // These two pairs (P1-P2 and P4-P5) are not present in the C6_comparator.html
  // prototype. They need insight text from the orchestrateur modelisateur.
  {
    id: 27,
    left:  { profile: 'P1', scenario: 'G0', label: 'Big Four — Frankfurt' },
    right: { profile: 'P2', scenario: 'G0', label: 'Inv. bank — London' },
    insight: null, // MISSING — not defined in C6_comparator.html prototype
    category: null,
    tier: null,
    badge: null,
    drivers: null,
  },
  {
    id: 28,
    left:  { profile: 'P4', scenario: 'G0', label: 'Corp. legal — Brussels' },
    right: { profile: 'P5', scenario: 'G0', label: 'Tech startup — S.F.' },
    insight: null, // MISSING — not defined in C6_comparator.html prototype
    category: null,
    tier: null,
    badge: null,
    drivers: null,
  },
];

// Lookup helper: get pair by canonical key (smaller profile ID first)
export function getPairByKey(profileA, profileB) {
  const ORDER = ['P1','P2','P3','P4','P5','P6','P7','P8'];
  const iA = ORDER.indexOf(profileA), iB = ORDER.indexOf(profileB);
  const [left, right] = iA < iB ? [profileA, profileB] : [profileB, profileA];
  return PAIRS.find(p =>
    (p.left.profile === left  && p.right.profile === right) ||
    (p.left.profile === right && p.right.profile === left)
  ) || null;
}
