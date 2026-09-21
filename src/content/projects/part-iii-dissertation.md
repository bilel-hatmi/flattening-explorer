---
# Long prose for /projects/part-iii-dissertation. First person throughout; the critical
# section follows the two concepts Bilel puts forward in every application.
---

<p class="lead">My Part III essay, on proximal causal inference, is the project that tested me most. It <strong>estimates a causal effect when the confounder is unobserved, from 2 noisy proxies</strong>.</p>

The essay offers a literature review connecting several estimators, from the simplest linear ones to non-parametric, doubly robust estimators derived very recently, and implements **4 of them in one Python library**: a linear two-stage baseline with a generated regressor, a two-stage kernel plug-in, a doubly robust score with cross-fitting, and a random-Fourier-feature estimator whose policy action has a closed form. The study includes simulations as well as real applications aimed at external validity: the effect of an additional year of schooling on wages (**NLSY79 cohort, N = 4,977**), and that of an arterial catheter on mortality in intensive care (**Connors et al., N = 5,735**). A **5-stage blind tuning protocol** selects hyperparameters from in-sample diagnostics only, never from the truth, and validates on disjoint seeds.

<aside class="callout">
This matters because, when a randomised experiment is infeasible, causal conclusions must come from observational data, and the usual worry is an unmeasured confounder. <strong>Proximal causal inference offers a route around it</strong>, provided 2 proxy variables of the confounder are available and the bridge functions can be estimated reliably. The question I pursued is whether that theoretical apparatus translates into estimators that are accurate, well calibrated and robustly tunable.
</aside>

## The two concepts that resisted: double robustness, ill-posedness

Two concepts made the project delicate, and neither was hard for the reason I expected.

**Double robustness.** Estimation rests on solving a Fredholm integral equation. The uniqueness conditions for this function cannot be verified, and the numerical stability of the solutions can degrade badly, even in defensible cases. The literature long tried to force this uniqueness through completeness conditions and to study regularisation methods, but the difficulty was turned around by Bennett et al., for whom only the final causal effect needs to be strongly identifiable. By defining an auxiliary function living in the dual space and tied to the final component, the bias becomes **a product of 2 biases, hence the double robustness property**, which does stabilise numerical estimation, as the comparative analyses I ran showed. What made it difficult is that nothing is verifiable at the level where one would like to work: one has to accept identifying the effect without ever identifying the function that produces it.

**The ill-posedness of the inverse problem, and the choice of regularisation.** The source condition, which determines the quality of convergence, compares the regularity of the target with the spectral decay of the operator, bringing out the regularity of the source. My own initiative was to anchor this in the real world, where binary policies are the approximation of a continuous phenomenon. A vaccine treatment mixes sources of variability tied to dose, timing and the patient's condition, so that treating the policy as a noisy Gaussian kernel markedly improves the stability of the solutions. I hold to this initiative because it required stepping away from the traditional framework, which treats the causal effect as a generally simpler binary contrast, effect with versus without treatment, in order to show that, in the case of the source condition, smoothing both limits the divergence of the inverse operator and is not artificial, since it is anchored in the practitioner's reality. The difficulty here was less technical than conceptual: seeing that the regularisation one was looking for was already present in the phenomenon, and only hidden by the binary convention.

## Where it stands

Submitted in May 2026 to the Department of Pure Mathematics and Mathematical Statistics, University of Cambridge, supervised by Dr P. Zhao and Prof. Q. Zhao; degree completed in June 2026. The essay and the code are both public: the PDF above, the library on GitHub.
