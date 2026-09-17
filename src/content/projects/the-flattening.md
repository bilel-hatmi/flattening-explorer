---
# Long prose for /projects/the-flattening. Short fields are in ../projects.js.
# The opening section is the Risk Prize post (LinkedIn, July 2026), kept as written.
---

<p class="lead">Unmanaged AI adoption makes organisations better on average while making them more fragile at the extremes. Productivity gains show up on dashboards. Tail risk accumulates elsewhere, hidden by the same metrics that report the improvement.</p>

<aside class="callout">
<strong>The question.</strong> What does AI adoption do to firms of different sizes, working in different domains, along three axes at once: cognitive diversity, productivity, and losses? The essay builds a Monte Carlo model of an organisation making quarterly decisions with and without AI, under three governance regimes, and reads the three axes off the same simulation.
</aside>

## Nine people, one toy name

Researchers asked people to invent a toy from a brick and a fan. The ones who used ChatGPT converged hard: nine of them, working separately, gave their toy the exact same name. "Build-a-Breeze Castle."

94% of the AI-assisted ideas overlapped. The people working without it each invented something different (Meincke, Nave & Terwiesch, *Nature Human Behaviour*, 2025). Every individual idea got better. The collective pool collapsed.

That paradox is the thesis of the essay. The mechanism is cognitive surrender: we defer to the model even when it is wrong. Almost 80% of people do (Shaw & Nave, 2026). On its own, a personal failing, easily fixed. Then you notice the concentration. Three vendors hold 88% of enterprise AI spend (Menlo Ventures, 2025). So we are not each deferring to a different judgment. We are all deferring to the same handful of models.

Everyone becomes individually excellent, and excellent in the same way. When the model is right, everyone is right at once, and when it is wrong, everyone is wrong at once, with no independent judgment left to catch it.

<blockquote class="pull">We have seen this at the scale of a market. In 2008, banks leaned on the same Gaussian copula to model default correlation. One shared formula, so when it broke, it broke everywhere at once.</blockquote>

In a market, lost diversity becomes a fragility no single player has any reason to fix alone. And the correlation does not stop at the office walls. Picture millions of retail investors asking the same model what to buy, or PE funds running the same AI diligence on the same deals. 2008 was a market that lost its diversity. We may be rebuilding that condition, one prompt at a time.

## What the model does

<figure class="wide">
<a href="/img/flattening/schema.svg" target="_blank" rel="noopener"><img src="/img/flattening/schema.svg" alt="Mechanism of the model: inputs (talent, hiring filter, governance levers, stack concentration, crisis regime), mechanisms (cognitive diversity, peer conformism, cognitive surrender, skill erosion, shared AI error, error selection), outputs (expected loss, tail risk, throughput, reported output)" /></a>
<figcaption>The mechanism, as drawn on the poster. Inputs on the left, the four channels in the middle, the two outputs that dashboards see and the two they do not on the right. Click to open at full size.</figcaption>
</figure>

Four channels carry the effect, and each has its own empirical anchor.

1. **The filter narrows minds.** One algorithm screens every CV with one logic, so atypical profiles drop out, and internal promotion keeps compounding the sameness. In the model, expressed cognitive diversity falls by 29% over five years (hiring and promotion homophily: Rivera, 2012).
2. **Surrender becomes the default.** Under productivity pressure, deferring is efficient and spreads as a habit: time pressure triples blind surrender, and even when the AI is wrong, 79.8% follow it (Shaw & Nave, 2026).
3. **One shared error.** In-domain, on routine cases inside the AI's reliable frontier, it is right about 92% of the time. A crisis, 8% of quarters, pushes work out of that frontier, where it is right about 55% of the time, so everyone errs together (the jagged frontier: Dell'Acqua, 2026; shared-error factor: Vasicek, 2002).
4. **The masking dashboard.** Errors now line up, so losses stop averaging out and pile into a few extreme quarters. A single speed-up lifts the output you see, +54%, while hiding the risk you do not, P99 × θ at +95%.

<div class="stats">
<div><span class="num success">−38%</span><span class="lab">expected loss</span></div>
<div><span class="num success">+54%</span><span class="lab">reported output</span></div>
<div><span class="num danger">+56%</span><span class="lab">worst quarter in a hundred</span></div>
<div><span class="num danger">×1.96</span><span class="lab">true tail against the dashboard's</span></div>
</div>

<figure>
<img src="/img/flattening/fig1_tail.png" alt="Histogram of quarterly losses: normal quarters, crisis quarters, and the no-AI baseline; the perceived P99 (878) against the actual P99 (1721)" />
<figcaption><strong>The tail is always underestimated.</strong> A dashboard that sees only normal quarters calls 878 the worst case; the true tail, 1,721, is 1.96 times as large, and unseen.</figcaption>
</figure>

<figure>
<img src="/img/flattening/fig2_compounding.png" alt="Indexed trajectories over 24 quarters: error correlation rises to +44%, mean competence falls 17%, cognitive diversity falls 29% under unmanaged AI; active governance holds all three flat" />
<figcaption><strong>The damage compounds for years.</strong> Left unmanaged, people think alike (diversity −29%), skills fade (−17%) and errors correlate (+44%). After five years the loss is built in; active governance holds it flat.</figcaption>
</figure>

## What moves the tail, and what does not

<figure>
<img src="/img/flattening/fig3_levers.png" alt="Tornado chart: stack concentration, talent quality and cognitive homogeneity each add 11 to 14% to the P99 loss; deskilling rate and domain exposure barely move it" />
<figcaption><strong>Three drivers stand out.</strong> Swept one at a time, stack concentration, talent quality (elite firms lose more) and cognitive homogeneity each add 11 to 14% to the worst-case loss; the rest barely move it. The channels feed back on each other, so their effects do not simply add up.</figcaption>
</figure>

<figure>
<img src="/img/flattening/fig4_governance.png" alt="Eight organisational profiles, from unmanaged AI to active governance: output against risk-adjusted worst-case loss" />
<figcaption><strong>Governance helps, unevenly.</strong> Active oversight lowers every profile's risk, but regressively: it helps least the firms most exposed, whose elite judgment is exactly what AI erodes fastest.</figcaption>
</figure>

The lever that works best is structurally simple: the person records an independent position before seeing the AI's output. Formed before the consultation, that judgment is the one thing the model cannot homogenise.

<dl class="levers">
<dt>Stack diversification <span>Procurement</span></dt><dd>A different model at each layer. Tail −10 to −15%.</dd>
<dt>Active scaffolding <span>COO / business units</span></dt><dd>Independent judgment before the AI. Excess tail risk +95% → +39%.</dd>
<dt>Hiring governance <span>CHRO</span></dt><dd>Audit the hiring AI for sameness; protects cognitive diversity.</dd>
<dt>Risk monitoring <span>CRO / Board</span></dt><dd>Track error correlation; report P99 × θ, not output.</dd>
</dl>

## Concentration has broken complex systems before

Every case below runs the same mechanism: as diversity flattens and people come to think alike, their errors stop cancelling out and strike together instead of averaging away.

<div class="cards3">
<div><strong>LTCM, 1998</strong><em>$4.6 bn</em>A fund run by Nobel laureates converged on identical arbitrage strategies, so its many positions were really one bet. When it turned, $4.6 bn vanished in four months.</div>
<div><strong>Banks, 2008</strong><em>all at once</em>Banks worldwide priced risk with the same value-at-risk models and the same Gaussian copula. One shared formula, so they broke everywhere at once, not bank by bank.</div>
<div><strong>CrowdStrike, 2024</strong><em>8.5 M down</em>One security update shipped to Windows hosts everywhere. In 78 minutes it crashed 8.5 million machines and cost the Fortune 500 $5.4 bn. One vendor, one dependency, no fallback.</div>
</div>

## Why a real-world risk rather than a cleaner theorem

I work at the abstract end of Part III statistics, but I chose to aim this work at a real-world risk problem rather than a cleaner theorem, for one reason: a model earns its worth only when it touches something real. Each era hides its systemic risk somewhere new, as progress of every kind, technological, economic, social, ecological, opens ground no one has yet learned to model: in credit in 2008, in judgment today. So connecting fields becomes the only way to follow the risk where it goes, instead of admiring mathematics from a tower far from where it matters.

Whether we will still need human judgment in ten years is not in doubt. Whether we will still be able to exercise it is.

## What is here

The prize essay, the A0 poster, and the interactive explorer, whose simulation engine runs in the browser: pick an organisational profile, follow the four acts (the paradox, its mechanisms, the governance levers, and why delay makes each of them more costly), then run your own parameter combinations in the laboratory. The essay was one of four finalists of the Cambridge–McKinsey Risk Prize 2026, at the Cambridge Centre for Risk Studies, Judge Business School.

<p class="sources"><strong>Sources cited above.</strong> Meincke, Nave & Terwiesch (2025), <em>Nature Human Behaviour</em> · Shaw & Nave (2026) · Menlo Ventures (2025), enterprise AI spend · Rivera (2012), hiring and promotion homophily · Dell'Acqua (2026), the jagged frontier · Vasicek (2002), the shared-error factor.</p>
