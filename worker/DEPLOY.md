# Kostencheck Copilot worker — deployment status

**Deployed and running.** This was set up end-to-end (OCI CLI auth,
instance provisioning, deployment, secrets, systemd, firewall, embedding
backfill) directly from this machine on 2026-07-04.

## Live instance

- Name: `clerktree-kostencheck-worker`
- Shape: `VM.Standard.A1.Flex`, 2 OCPU / 12GB (Always Free tier ARM Ampere)
- Region: ap-mumbai-1 (`ap-south-1` in AWS-style naming)
- Public IP: `130.210.20.208`
- Health check: `curl http://130.210.20.208:8200/health` → `{"status":"ok"}`
- SSH: `ssh -i ~/.oci/clerktree-crm-ssh ubuntu@130.210.20.208`
- Service: `sudo systemctl status kostencheck-worker` (systemd, auto-restarts on failure)
- Code lives at `/home/ubuntu/kostencheck-worker` on the box

This is a **separate, new instance** from the pre-existing `clerktree-crm-server`
(140.238.254.77) — that one was provisioned earlier with a different SSH key
that wasn't available on this machine, so it was left untouched rather than
risking it. It's still running under your OCI account; deal with it
separately if it's not needed (check what's on it before terminating —
I didn't touch it or its contents).

## What had to be fixed during deployment (for future reference)

1. **Upload permission**: `main.py`'s `UPLOAD_DIR` (`/var/lib/kostencheck/uploads`)
   needs root to create. Fixed with `sudo mkdir -p /var/lib/kostencheck &&
   sudo chown ubuntu:ubuntu /var/lib/kostencheck` — already done on the live box.
2. **iptables**: Ubuntu's default Oracle-image firewall only allows inbound
   SSH (port 22) out of the box, independent of the OCI-side security list
   (which already had 8200 open). Had to add and persist an explicit rule:
   `sudo iptables -I INPUT 5 -p tcp -m state --state NEW -m tcp --dport 8200 -j ACCEPT`
   then `sudo netfilter-persistent save`.
3. **IPv6-only direct DB connection**: `db.[project-ref].supabase.co:5432` has
   no IPv4 (A) record on the free tier, and this VPS has no outbound IPv6
   route. Switched `DATABASE_URL` to the Supavisor **session pooler**
   (IPv4-compatible on every tier): `aws-1-ap-south-1.pooler.supabase.com:5432`,
   username `postgres.<project-ref>` instead of just `postgres`.
4. **Stale DB password**: the password pasted earlier in chat had been
   rotated since. Reset it via the Supabase Management API
   (`PATCH /v1/projects/{ref}/database/password`) using a Personal Access
   Token — this requires a PAT from `supabase.com/dashboard/account/tokens`;
   there's no MCP tool or raw-SQL path for it (the `postgres` role can't be
   `ALTER`'d directly, "Only superusers can alter privileged roles").

## Embeddings backfilled

All 12 seeded historical projects now have real `multilingual-e5-small`
embeddings (`select count(*) from pipeline_historical_projects where
embedding is not null` → 12). Academy's "Projects Indexed" KPI should now
show 12/12 instead of "Pending". To re-run after adding more historical
projects:

```bash
ssh -i ~/.oci/clerktree-crm-ssh ubuntu@130.210.20.208
cd kostencheck-worker && set -a && source .env && set +a
.venv/bin/python -c "
import db, embeddings
for company in db.fetch_all('select id from pipeline_companies'):
    for row in db.historical_projects_missing_embeddings(company['id'], limit=100):
        vec = embeddings.embed_passage(f'{row[\"title\"]}. {row[\"summary\"]} {row[\"outcome\"]}')
        db.set_historical_embedding(row['id'], vec)
"
```

## Demo API keys (already seeded)

```
THD GmbH                     thd_demo_d5845675b5bf43c28dd89724d1e85e46
Weber Präzisionstechnik GmbH  weber-praezisionstechnik_demo_360ff6136d824d7cbed7b43de61c751e
MK Anlagenbau GmbH            mk-anlagenbau_demo_01f0b92a457c4d7381710e6acd256286
```

Demo curl for the live meeting (uses the THD key):

```bash
curl -X POST http://130.210.20.208:8200/api/v1/documents \
  -H "X-API-Key: thd_demo_d5845675b5bf43c28dd89724d1e85e46" \
  -F "kind=bestellung" -F "doc_number=B-88431" -F "file=@bestellung.pdf"
```

These are demo-only values sitting in the `pipeline_companies.api_key`
column — fine for a pilot, treat as real secrets once a non-fictional
company is onboarded.

## Rotate afterward

The Groq API key and the original Supabase DB password were both pasted in
plaintext chat earlier in this project and are now sitting in the VPS's
`.env` file (mode 600, only readable by `ubuntu`/root). Worth rotating both
once you're past the demo, same as flagged earlier in this project.
