---
# /projects/srie-mediation — from the project deck (SRIE, August 2026).
---

<p class="lead">Exposure, or the fear of judgement, blocks the resolution of a conflict more than any missing fix. The project derives a game-theoretic model, adapted to language models, for resolving conflicts under confidentiality constraints.</p>

## An illustration: Anna and Ben

Anna declines a high-visibility project and misses deadlines on the work she keeps. Ben, her manager, misreads it, quietly filing her commitment as slipping. The real cause is a health episode she keeps from colleagues and manager alike, having watched a colleague who chose to speak up get filed as fragile, a label that rarely comes off. Two competing readings of the same six weeks, and the costlier one is the one that sticks.

The toll runs to trillions. The WHO and the ILO put the yearly cost of unresolved workplace conflict at roughly 12 billion lost working days, close to one trillion dollars in forgone productivity. Mediation resolves disputes fully or substantially about three times out of four when it is actually tried; it is rarely reached.

## Why a model, and not a person

Dziuda and Gradwohl name the deadlock themselves: the problem "could be easily solved if an expert benevolent mediator were available," but "a mediator with expertise sufficient to judge the viability of the presented evidence is unlikely to be benevolent." Their objection lands here unchanged. A human mediator rarely arrives without a stake: a tie to one of the parties, a rung on the org chart near one of them, or pressure from the paying employer, and anyone can shape what gets heard, whether or not the mediator notices.

<blockquote class="pull">This project makes neutrality a property of the objective function, with collective welfare inside it as a measurable quantity, rather than a promise the mediator makes.</blockquote>

## The optimisation problem

Anna holds the only sensitive fact in the room; Ben can act on a belief, right or wrong. Information is what turns Ben's belief, yet Anna cannot move it without giving up the fact. The mediator therefore maximises how far the conflict resolves, under two hard constraints: confidentiality binds the objective for both parties at once, and neither party can exploit the other's moves or data.

Three pieces of work answer that objective. First, model the situation with game theory, in a structure an LLM can run autonomously, carrying existing work on human mediators (communication equilibria, cheap talk, the logic of indirect speech) over to a model and making it practical. Second, model the agentic workflow: measuring, adapting and optimising the strategy, and assessing confidentiality at each step. Third, a proof of concept on synthetic personas, with dials for resolution, leakage and manipulation.

<aside class="callout">
<strong>Scope.</strong> A mediator does not replace the relationship; it keeps it alive, above all where one party holds power over the other. Two players is the chosen frame, and the argument holds unchanged as the game scales up. Reliable work here reaches past mediation: structures designed for trust and safety give a reward function worth maximising, and such structures scale as long as the properties they model continue to hold in reality.
</aside>

## Where it stands

Two students, 4 August to 28 September 2026. The theoretical phase proved more complex than anticipated: game-theory discovery, transfer of properties and theorems, then a derivation under parsimony; the agentic workflow and the instantiation test follow with a reduced experimental scope. The project deck is linked above.
