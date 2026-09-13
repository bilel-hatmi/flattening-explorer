---
# Long prose for /projects/part-iii-dissertation.
---

When a randomised experiment is infeasible, causal conclusions must come from observational data, and the usual worry is an unmeasured confounder. Proximal causal inference offers a route around it: if two proxy variables of the confounder are available and satisfy certain regularity conditions, the causal effect is identified without ever modelling the confounder itself. The price is that the identification runs through bridge functions, solutions of integral equations of the first kind, and those are ill-posed to estimate.

## The question

Does the theoretical apparatus translate into estimators that are accurate, well calibrated and robustly tunable? The essay develops the framework from identification through to inference and implements it in four estimators of increasing generality: a linear two-stage baseline with a generated regressor, a two-stage kernel plug-in, a doubly-robust score with cross-fitting on top of it, and a random-Fourier-feature estimator whose policy action has a closed form. All four are judged on the same data-generating processes by the same six Monte Carlo diagnostics.

## What came out

The simulations locate the regimes in which each estimator stays reliable and the ones in which it quietly fails. Two real-data applications triangulate the proximal estimates against external anchors: the return to schooling in the NLSY79 cohort, and the effect of right-heart catheterisation on 30-day mortality in the Connors et al. trial. Binary policies are smoothed by a noisy Gaussian kernel to stabilise the inverse problem. A five-stage blind tuning protocol selects hyperparameters from in-sample diagnostics only, never from the truth, and validates on disjoint seeds; the lengthscale is the one parameter the analyst still has to anchor from outside.

## Where it stands

Submitted in May 2026 to the Department of Pure Mathematics and Mathematical Statistics, University of Cambridge, supervised by Dr P. Zhao and Prof. Q. Zhao. The code is public; the essay will be released once the examination process and the supervisors' authorisation allow.
