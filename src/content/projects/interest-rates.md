---
# Long prose for /projects/interest-rates.
---

Two discrete-time models of the term structure of interest rates, Ho-Lee and Heath–Jarrow–Morton, implemented, analysed and compared on the same task: pricing contingent claims, and caplets in particular.

The analytic part derived closed-form prices for zero-coupon bonds and caplets under each model, calibrated the parameters to the Black model by norm minimisation, and proved that the two models are asymptotically equivalent through a normalisation argument based on the central limit theorem. The practical part packaged it as a small app, *The Interest Rate Lab*, where the user enters the parameters and a payoff (a call by default, a put with one edit) and reads the price and the tree.

Group project at CentraleSupélec, 2023. Educational purpose only; nothing in it is financial advice.
