# HubSpot Connection Setup — Trillium Scraper Pipeline

This guide explains exactly what is needed to connect the
[Scraper-Hubspot](https://github.com/BTizzy/Scraper-Hubspot) pipeline
to a live HubSpot account and push enriched contacts automatically.

---

## Current Status

| Component | Status | Notes |
|---|---|---|
| Pipeline output (`hubspot_import.csv`) | ✅ Ready | Generates HubSpot-formatted CSV |
| `push_to_hubspot.py` script | ✅ Ready | Handles create + upsert via API v3 |
| HubSpot Private App token | ❌ Missing | Must be created and added to `.env` |
| `crm.objects.contacts.write` scope | ❌ Needs enabling | Must be added to the Private App |
| `.env` file | ❌ Missing | Must be created locally (never committed) |

**Short answer:** The pipeline code is complete and tested. The only blockers are a
one-time HubSpot Private App configuration and creating a local `.env` file.

---

## Step 1 — Create a HubSpot Private App

1. Log in to [HubSpot](https://app.hubspot.com/) as an account admin.
2. Go to **Settings → Integrations → Private Apps**.
3. Click **Create a private app**.
4. Give the app a name, e.g. `Trillium Scraper Pipeline`.
5. Under **Scopes**, add the following:

   | Scope | Access level |
   |---|---|
   | `crm.objects.contacts.read` | Read |
   | `crm.objects.contacts.write` | Write |

   > **Important:** `crm.objects.contacts.write` is the scope that was previously
   > listed as NOT_AVAILABLE in the Trillium account. This must be enabled on the
   > Private App for `push_to_hubspot.py` to work.

6. Click **Create app** and then **Continue creating**.
7. Copy the **Access token** shown on the confirmation screen.
   It looks like: `pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

---

## Step 2 — Create the `.env` File

In the **root** of the `Scraper-Hubspot` repository (one level above `scripts/`),
create a file named `.env` with the following content:

```
# HubSpot Private App access token (from Step 1)
HUBSPOT_API_KEY=pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Optional: Hunter.io API key for contact enrichment
# HUNTER_API_KEY=your_hunter_key_here
```

> `.env` is already listed in `.gitignore` — it will **never** be committed.
> Do not share this token or store it in source control.

See [`.env.example`](.env.example) in this repository for a copy-paste template.

---

## Step 3 — Run the Pipeline and Push

### Option A — Generate CSV only (no API call)

Run the full pipeline to produce `hubspot_import.csv`, then import it manually
through the HubSpot Contacts import UI:

```bash
cd scripts
python run_pipeline.py \
  --sos test_data/sos_sample.csv \
  --skip-theharvester --skip-dorks \
  --min-level C \
  --output-dir output_run_$(date +%Y%m%d)
```

Then in HubSpot: **Contacts → Import → Start an import → File from computer**
and upload `hubspot_import.csv`. Map columns using the standard headers.

### Option B — Push directly via API

After completing Steps 1 and 2, push contacts from a generated CSV:

```bash
cd scripts

# Dry run first — prints what would be pushed without touching HubSpot:
python push_to_hubspot.py --input output_run_20260307/hubspot_import.csv --dry-run

# Live push (creates new contacts / updates existing by email):
python push_to_hubspot.py --input output_run_20260307/hubspot_import.csv
```

### Option C — Daily automation with automatic push

The `daily_run.py` wrapper includes a `--hubspot-push` flag that runs the
full pipeline and pushes novel contacts in a single command:

```bash
cd scripts
python daily_run.py \
  --sos sos_export.csv \
  --skip-theharvester --skip-dorks \
  --min-level C \
  --hubspot-push
```

Cross-day deduplication is handled automatically — contacts already pushed
in previous runs are skipped.

---

## HubSpot Field Mapping

The pipeline outputs a CSV with these headers, which map directly to
HubSpot contact properties:

| CSV Column | HubSpot Property |
|---|---|
| `Email` | `email` |
| `First Name` | `firstname` |
| `Last Name` | `lastname` |
| `Company` | `company` |
| `Job Title` | `jobtitle` |
| `Phone` | `phone` |
| `Website` | `website` |
| `City` | `city` |
| `Signal Tag` | `hs_lead_status` |
| `LinkedIn URL` | `hs_linkedin_url` |
| `Confidence Level` | `business_type` (custom property) |
| `Notes` | `notes_last_contacted` |

> **Note:** `Confidence Level` is mapped to the `business_type` custom property
> as a repurpose of an existing field. If you prefer a dedicated custom property,
> create one in HubSpot (**Settings → Properties → Contact properties → Create property**)
> and update the `FIELD_MAP` dict in `scripts/push_to_hubspot.py`.

---

## Troubleshooting

| Error | Likely cause | Fix |
|---|---|---|
| `Error: HUBSPOT_API_KEY env var not set` | `.env` not created or not in repo root | Create `.env` per Step 2 |
| `HTTP 403` on push | Private App missing write scope | Re-add `crm.objects.contacts.write` scope in HubSpot |
| `HTTP 401` on push | Access token expired or incorrect | Regenerate token in HubSpot Private Apps and update `.env` |
| `0 contacts pushed` | Quality gates filtered all records | Lower `--min-level` to `C` or run with `--disable-contract-gates` |
| Contacts created with no name | Officer permutation fallback used | This is expected for low-confidence records; review `rejects.csv` |

---

## Quick Reference

```
Scraper-Hubspot/
├── .env                  ← Create this locally (never commit)
└── scripts/
    ├── run_pipeline.py   ← Full pipeline orchestrator
    ├── push_to_hubspot.py← API push script (needs HUBSPOT_API_KEY)
    ├── daily_run.py      ← Daily wrapper with --hubspot-push flag
    └── build_csv.py      ← Generates hubspot_import.csv
```
