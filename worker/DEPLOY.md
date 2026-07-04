# Deploying the Kostencheck Copilot worker

I (Claude) do not have SSH access to your Oracle VPS, so I can't run these
steps myself — this is a copy-paste guide for you to run there. It follows
the same pattern as the existing `thd-pipeline` service already on that box
(systemd unit, plain venv, no Docker), just on a different port (8200
instead of thd-pipeline's 8100) so the two run side by side.

## 1. Ship the code

From your Mac:

```bash
rsync -avz --exclude .venv --exclude __pycache__ worker/ your-user@your-vps-host:/opt/kostencheck-worker/
```

(Or `git clone` the repo on the VPS and use the `worker/` subdirectory —
either works, rsync is simplest if you don't want the whole frontend repo
on the box.)

## 2. Install system dependencies (Debian/Ubuntu)

```bash
sudo apt-get update
sudo apt-get install -y python3-venv python3-pip tesseract-ocr tesseract-ocr-deu poppler-utils
```

## 3. Python environment

```bash
cd /opt/kostencheck-worker
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

The first `sentence-transformers` install will download the
`multilingual-e5-small` model (~470MB) on first run — expect a few minutes
and make sure there's disk headroom.

## 4. Configure secrets

```bash
cp .env.example .env
nano .env   # fill in DATABASE_URL and GROQ_API_KEY
```

Get `DATABASE_URL` from the Supabase dashboard: Project Settings →
Database → Connection string (URI). Use a fresh Groq API key — rotate the
one that was pasted in plaintext chat earlier in this project.

## 5. Systemd service

Create `/etc/systemd/system/kostencheck-worker.service`:

```ini
[Unit]
Description=Kostencheck Copilot worker
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/opt/kostencheck-worker
EnvironmentFile=/opt/kostencheck-worker/.env
ExecStart=/opt/kostencheck-worker/.venv/bin/python main.py
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now kostencheck-worker
sudo systemctl status kostencheck-worker
curl http://127.0.0.1:8200/health
```

## 6. Expose it publicly (for the customer ERP demo curl)

Whatever reverse proxy already fronts `thd-pipeline` on this box, add a
matching site/location block pointing at port 8200. If you're using Nginx,
something like:

```nginx
location /kostencheck/ {
    proxy_pass http://127.0.0.1:8200/;
    proxy_set_header Host $host;
}
```

then `curl -X POST https://your-domain/kostencheck/api/v1/documents ...`
during the demo instead of a raw IP:port.

## 7. Backfill embeddings for the seeded historical projects

The 12 historical projects seeded in Supabase have `embedding = null` right
now (they were inserted directly via SQL, not through this worker). Once
the service is running, backfill them once:

```bash
source .venv/bin/activate
python -c "
import db, embeddings
for company in db.fetch_all('select id from pipeline_companies'):
    for row in db.historical_projects_missing_embeddings(company['id'], limit=100):
        vec = embeddings.embed_passage(f'{row[\"title\"]}. {row[\"summary\"]} {row[\"outcome\"]}')
        db.set_historical_embedding(row['id'], vec)
print('done')
"
```

## Demo API keys (already seeded)

```
THD GmbH                    thd_demo_d5845675b5bf43c28dd89724d1e85e46
Weber Präzisionstechnik GmbH weber-praezisionstechnik_demo_360ff6136d824d7cbed7b43de61c751e
MK Anlagenbau GmbH           mk-anlagenbau_demo_01f0b92a457c4d7381710e6acd256286
```

Use the THD key for the live demo curl. These are demo-only values sitting
in the `pipeline_companies.api_key` column — fine for a pilot, but treat
them as real secrets once any non-fictional company is onboarded.

## What I have NOT done

- Not created any Oracle Cloud resources (the `oci compute instance launch`
  commands pasted earlier are still sitting unexecuted — provisioning a new
  paid VM is your call, not something to run automatically).
- Not touched the existing `thd-pipeline` or `thd-voice` services.
- Not run this worker or verified it end-to-end against a real PDF — do
  that on the VPS itself once deployed, ideally with the demo Angebot/
  Bestellung PDF pair before the live client meeting.
