---
# /projects/srie-mediation — from the project deck (SRIE, August 2026).
---

<p class="lead">People leave a conflict unresolved because resolving it would expose what they keep hidden, more often than because a fix is missing. The project derives a game-theoretic model, adapted to language models, for resolving conflicts under confidentiality constraints.</p>

## An illustration: Anna and Ben

Anna declines a high-visibility project and misses deadlines on the work she keeps. Ben, her manager, misreads it, quietly filing her commitment as slipping. The real cause is a health episode she keeps from colleagues and manager alike, having watched a colleague who chose to speak up get filed as fragile, a label that rarely comes off. Two competing readings of the same six weeks, and the costlier one is the one that sticks.

The WHO and the ILO put the yearly cost of unresolved workplace conflict at roughly 12 billion lost working days, close to one trillion dollars in forgone productivity. Mediation resolves disputes fully or substantially about three times out of four when it is actually tried; it is rarely reached.

## Neutrality as a property of the objective function

Dziuda and Gradwohl name the deadlock themselves: the problem "could be easily solved if an expert benevolent mediator were available," but "a mediator with expertise sufficient to judge the viability of the presented evidence is unlikely to be benevolent." Their objection lands here unchanged. A human mediator rarely arrives without a stake: a tie to one of the parties, a rung on the org chart near one of them, or pressure from the paying employer, and anyone can shape what gets heard, whether or not the mediator notices.

<blockquote class="pull">This project makes neutrality a property of the objective function, with collective welfare inside it as a measurable quantity, rather than a promise the mediator makes.</blockquote>

## The optimisation problem

Anna holds the only sensitive fact in the room; Ben can act on a belief, right or wrong. Only information turns Ben's belief, and Anna cannot move it without giving up the fact. The mediator therefore maximises how far the conflict resolves, under two hard constraints: confidentiality binds the objective for both parties at once, and neither party can exploit the other's moves or data.

The work falls in three parts. A game-theoretic model of the situation, in a structure an LLM can run autonomously, carries existing work on human mediators (communication equilibria, cheap talk, the logic of indirect speech) over to a model and makes it practical. The agentic workflow then measures and optimises the strategy, and assesses confidentiality at each step. A proof of concept on synthetic personas closes the loop, with dials for resolution, leakage and manipulation.

<aside class="callout">
The scope is deliberate. A mediator does not replace the relationship; it keeps it alive, above all where one party holds power over the other. Two players is the chosen frame, and the argument should hold as the game scales up. Reliable work here reaches past mediation: structures designed for trust and safety give a reward function worth maximising, and such structures scale as long as the properties they model continue to hold in reality.
</aside>

## Where it stands

Two students have worked on it since 4 August. The theory came first and proved more complex than anticipated: discovering the right game, transferring its properties and theorems, then deriving the mediator under parsimony. The agentic workflow and the instantiation test follow, with a reduced experimental scope, before the stream closes on 28 September 2026. The project deck is linked above.
