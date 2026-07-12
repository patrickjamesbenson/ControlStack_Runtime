# Research mission — zencontrol emergency converter data (for ControlStack emergency IES selection)

**Goal:** capture the exact zencontrol emergency-converter data needed to (a) pick the right converter + power setting + battery for a required emergency duration, and (b) convert the converter's rated emergency **watts** into an LED **drive current (mA)** so ControlStack can offer the correct emergency IES file. Return structured tables, not prose, plus source URLs/PDFs for every number.

## What we already know (don't re-derive — confirm & extend)
- Two models, split on isolation class:
  - **zc-smart-em-50** — output power selectable **1.5 W / 2.5 W / 3.5 W**, output **10–50 V, SELV**.
  - **zc-smart-em-250** — output power selectable **2.5 W / 3.5 W / 4.5 W**, output **50–250 V, Non-SELV**.
- Duration selector on the unit: **1 / 2 / 3 hour**.
- Variants: automatic **self-test**, **DALI** test & monitoring (DT51 power monitoring), and **wireless** (IEC 62386-104 over Thread).
- Batteries: high-temperature **LiFePO4**, **5-year** (standard) or **10-year** (long) design life, packs include internal **BMS**.
- Source page: https://zencontrol.com/emergency-converter/ · product spec: https://zencontrol.com/products/smart-emergency-converter/ and https://zencontrol.com/products/wireless-emergency-converter/ · downloads: https://zencontrol.com/downloads/

## Deliverable 1 — Output current envelope (the watts→mA lookup)
Transcribe the "output range" table/graph (it's published as an image and in the datasheet). For **each model × each power setting**, give the guaranteed emergency output as a power-into-voltage envelope:

| Model | Power setting (W) | Output voltage range (V) | Output current range (mA) | Constant power or constant current? | Notes |
|---|---|---|---|---|---|

- State explicitly whether the rated watts is **LED power delivered** or **battery draw** (and the converter efficiency if given).
- Give the current at the **ends of the voltage window** for each power setting (e.g. em-50 @ 3.5 W: mA at 10 V and at 50 V), so we can interpolate mA for any string voltage.
- Note any minimum/maximum LED load (min string voltage, max current) and any derating.

## Deliverable 2 — Battery selection table (the size table we can't find)
For **each model × power setting × duration (1/2/3 h) × design-life (5 yr / 10 yr)**, give the required battery pack:

| Model | Power (W) | Duration (h) | Design life | Battery pack part no. | Chemistry | Nominal voltage (V) | Capacity (mAh / Wh) | Cell config | Datasheet URL |
|---|---|---|---|---|---|---|---|---|---|

- Include the battery pack **part numbers** and their own datasheets.
- Note temperature ratings (max ambient / cell temp) and any hot-location restriction.

## Deliverable 3 — Converter datasheets & integration
- Direct links to the **datasheet PDFs** for zc-smart-em-50, zc-smart-em-250, and the wireless/IoT variant.
- Physical: dimensions, connector/interface (Zhaga? flying leads?), and the LED-output connector.
- Emergency behaviour: rated emergency **lumen output** vs normal (or the emergency light output factor), start-up, and end-of-duration cutoff.
- The DALI **DT51** / self-test data model: what the converter reports (battery status, duration test results, power) and over what interface.
- SELV vs Non-SELV: what each implies for luminaire classification and which one a given LED string voltage forces.

## Deliverable 4 — The selection logic, stated back
In one short section, state the decision path the way a selector would run it:
1. Required duration → sets duration switch (1/2/3 h).
2. LED string voltage of the target module → SELV (em-50) vs Non-SELV (em-250).
3. Desired emergency power (W) → picks the power setting within that model.
4. Power ÷ string voltage → **emergency drive current (mA)** → the IES file to offer (base curve scaled to that current).
5. Power + duration + design-life → battery pack from Deliverable 2.

## Output format
Machine-readable tables (Markdown or CSV), one row per combination, with a source URL/PDF + page/figure for every value. Flag anything only available on request from zencontrol (so we know to ask them directly). Do not estimate — mark unknowns as "confirm with zencontrol."
