---
# Long prose for /projects/interest-rates.
---

2 discrete-time models of the term structure of interest rates, **Ho-Lee and Heath–Jarrow–Morton**, implemented, analysed and compared on the same task: pricing contingent claims, and caplets in particular.

The analytic part derived **closed-form prices for zero-coupon bonds and caplets** under each model, calibrated the parameters to the Black model by norm minimisation, and proved that **the 2 models are asymptotically equivalent** through a normalisation argument based on the central limit theorem. The practical part packaged it as a small app, *The Interest Rate Lab*, where the user enters the parameters and a payoff (a call by default, a put with one edit) and reads the price and the tree.

Group project at CentraleSupélec, February to June 2023, with Fares Dridi, Tomas Espana and Alexandra Kortchemski; the report (in French) and the code are linked above. Educational purpose only; nothing in it is financial advice.
