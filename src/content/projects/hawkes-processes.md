---
# Long prose for /projects/hawkes-processes.
---

A Hawkes process is a point process that excites itself: each event raises the rate of the next for a while. The standard estimators assume the exact event times are known. In practice the data often arrive binned, as counts per interval, and the question of this project was how well the parameters can be recovered from that coarser view.

The project implemented estimation for a two-exponential Hawkes process and examined a supervised alternative for the one-exponential case, then compared four routes on the same simulated streams: maximum likelihood, the Whittle spectral estimator, a uniform-binning approximation, and neural estimators (an MLP and an LSTM trained on simulated data). Fitting quality was also checked on real empirical event data.

The findings were clear-cut. Maximum likelihood with random restarts was the most effective method on clean binned data; when the data were degraded, only the Whittle estimator remained usable. Group project at CentraleSupélec, supervised by Ioane Muni Toke; the report and the code are linked above.
