# IES report card generator

Runtime-owned photometric report card generator for linear luminaire datasheet assets.

## Current scope

- Details card
- Polar plot
- Linear plot
- Candela intensity table
- Datasheet-light default theme
- Screen-dark review theme
- Transparent asset theme

## Command

```powershell
node tools/ies-report/renderReportCardCli.js --ies tools/ies-report/fixtures/sample-linear.ies --out .\_tmp\ies-report-card --basename sample-linear --confirm-write
```

Optional theme:

```powershell
node tools/ies-report/renderReportCardCli.js --ies product.ies --out .\exports --basename product-code --theme datasheet-light --confirm-write
```

Generated report assets:

- `.report.html`
- `.polar.svg`
- `.linear.svg`
- `.intensities.html`

## Safety boundary

- Report render only
- No IES creation
- No IES source modification
- No RuntimeData writes
- No donor Engine call
- No external website fetch
- No PhotometricEditor dependency
- No route or POST endpoint

## Data flow

```text
LM-63 IES text
→ read-only parser
→ report-card JSON contract
→ SVG and HTML renderers
→ optional confirmed local report asset write
```

## Notes

The generator uses the IES photometric values for lumens, watts, dimensions, angles and candela values where available. Product metadata can be supplied separately when needed for fields that are not consistently carried in IES files.
