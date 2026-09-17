---
# Long prose for /projects/well-being-panel (Elements Impact, Boussole, summer 2023).
---

<p class="lead">My attachment to making AI a tool in the service of human capital was born here, in a summer research internship at Elements Impact where I modelled well-being mathematically, under Emmanuelle Bioud (PhD, cognitive science).</p>

The Boussole project set out to estimate the impact of an entrepreneurial project on the subjective well-being of all its stakeholders. The work started upstream of any model, with a state of the art in welfare economics and in the mathematical modelling of well-being: reviewing subjective well-being indicators, hedonic, eudaimonic and capabilities-based, and translating them into operational variables and predictive targets that an impact assessment could use.

<dl class="work">
<dt>Predictive modelling</dt><dd>I trained, evaluated and selected supervised models on a twenty-year longitudinal panel of more than a thousand individuals, with feature engineering, cross-validation and sensitivity analyses. The result was an operational prototype.</dd>
<dt>Corrective mechanisms</dt><dd>The measure folds in market constraints (competition, expertise, resource allocation) through sensitivity and scenario analyses, so that scores and decision thresholds stay robust when the measurement is heterogeneous and noisy.</dd>
<dt>Benchmark and use case</dt><dd>The impact measure was benchmarked on typical projects, and a use case of arbitration between projects led to implementation recommendations.</dd>
</dl>

The code that followed the internship, a Streamlit application with the model and its parametrisation, is on GitHub. The summer's lesson: signal quality in large-scale behavioural measurement is often weak, because the measurements are heterogeneous, noisy and sensitive to definitional choices, so most of the work is deciding what the number means before estimating it.
