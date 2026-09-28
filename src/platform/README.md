# Meridian — synthetic fixture

**Meridian is fictional.** Every persona, metric, cluster name, price and capability in
this directory is invented for testing and demonstration.

It is written as a *category archetype* — a multi-cluster compute platform with several
sharply different personas and a solutions-engineering burden — because that archetype is
the ICP. It is deliberately not modelled on any specific real product, and must not be.
See `docs/IP-BOUNDARY.md`.

## Deliberate flaws

The fixture is designed to be bad in the exact ways the product fixes. Do not "improve"
these; the demo depends on them:

1. **One dense UI for three personas.** A platform engineer, an ML engineer and a FinOps
   analyst all see the same sixteen panels.
2. **Buried capabilities.** `budget.forecast` and `cluster.rightsize` exist and are never
   surfaced, so nobody discovers them.
3. **A dead-end empty state.** The Reports panel renders an empty table with no next action.
4. **A disabled control with no explanation.** Export is greyed out with no reason given,
   which is what generates the rage-clicks the audit later detects.
