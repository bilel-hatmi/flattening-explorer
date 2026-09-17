---
# /projects/srie-sycophancy — from the project deck (SRIE, August 2026).
---

<p class="lead">One person talked into believing something false by a chatbot is a small problem, and a familiar one for psychology to study. The problem changes scale when a whole population forms its sense of what is fair, on health, on law, on a live political fight, from a handful of systems built the same way.</p>

## Trust in a model is decided by its tone

Readers rate the tone an answer strikes rather than the argument it makes, so an answer that softens a sharp claim and hedges a firm one leaves critics nothing to attack; it is hard to fault and just as hard to use, since a straight answer beats a shrug. Sycophancy, as the usual benchmarks measure it, is the reader's verdict on being agreed with, recorded as if it were a property of the answer; when a benchmark certifies that agreement as neutral and preference tuning optimises the metric, the result is sycophancy.

The cue holds between people and breaks on a model: neither the cue nor the human account behind it carries over. The usual word names sycophancy as one trait and so assumes one cause, whereas here there may be several, each traced back to the stage that produced it and counted.

## Four quantities, each with its own cause

<dl class="work">
<dt>Epistemic validity</dt><dd>The model's capacity to challenge a claim in proportion to what is accessible to it. When it fails, the model agrees with confidence and without grounds.</dd>
<dt>Procedural validity</dt><dd>The capacity to maintain a logically valid reasoning trajectory whose premises stay consistent with the knowledge encoded in the model. When it fails, the reasoning is locally sound and incomplete.</dd>
<dt>Direction</dt><dd>Sycophancy in the narrow sense: the answer tracks the asker's position and flips with who is asking. Preference-model tuning is the likely cause.</dd>
<dt>Directional entropy</dt><dd>The dispersion of answers across a population of prompts. Training teams that reduce variance deliberately converge the model on one safe answer, and narrow the views people meet.</dd>
</dl>

Conviction, the confidence with which an answer is held, is tracked alongside these four as an auxiliary construct: it decouples from actual validity under safety tuning. Named as one profile, how the four move together stays untested, and that is the project's hypothesis: whether they form a coherent structure, and whether regimes can be identified that hold a model at a preferable equilibrium.

## Two instruments across five conditions

Both instruments aim at the same quantities, but only one is cheap to build. Internals, linear probes and persona vectors, are costly to get right, and what they report may be nothing more than the model's own output variance. Behaviour, measured from outside, costs nothing of the kind. Neither instrument alone can confirm that its own reading is right, so running both is a cross-check: two readings of the same quantity, each one a test of the other.

Five conditions define the sweep, and each run varies them: claim subjectivity, how contested the claim is (measured by population entropy on human opinion questions); point of view, first or third person; persona, which role the model has been given; conversational history, how long the exchange has run; sampling, how the answer gets drawn.

<aside class="callout">
<strong>The next phase turns on three open questions.</strong> Coupling stability: persistent disorder in the coupling between the four would point toward specialised systems for education, law and health, whereas behaviour settling into one general regime would let the general-purpose case survive. Regime shape and grain: generalizability theory, structural equation models and clustering are the methods for settling, group by group, whether sycophancy forms a coherent and more fundamental structure. Intervention: within a regime, find what holds a model at a chosen equilibrium, then hold it there with a steering vector or a targeted fine-tune, without flattening the useful spread along with the harmful part.
</aside>

## Where it stands

Three students have worked on it since 4 August, and the stream closes on 28 September 2026. The literature review is done; the experimental design was presented to an outside reviewer before the empirical run, which is now under way. A preprint is planned for the end of September. The project deck is linked above.
