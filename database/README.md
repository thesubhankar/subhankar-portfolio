# 🚀 Neon PostgreSQL Database Migration & Architecture

This directory contains the complete database schema, Python models, and automated migration tooling to move Subhankar Giri's Portfolio data from `data/portfolio_data.json` into a high-performance **Neon Serverless PostgreSQL Database** (or Supabase / Render PostgreSQL) with **zero data loss** and **100% backwards compatibility**.

---

## 📁 Files Overview

| File | Purpose |
| :--- | :--- |
| **`schema.sql`** | PostgreSQL DDL script creating all 9 normalized relational & state tables with indexes, foreign keys, and cascading updates. |
| **`models.py`** | Python dataclasses & ORM mapping layer. Provides bidirectional conversion between relational rows and the portfolio dictionary. |
| **`migrate_json_to_neon.py`** | Automated, production-ready migration script. Connects to Neon, creates tables, imports all data, and runs verification checks. |
| **`test_migration_offline.py`** | Offline data-integrity verification suite. Validates all field mappings and row counts without an active database connection. |

---

## 🗄️ Relational Database Schema

The database is structured into 9 clean, relational tables:

```
├── projects                  (id, title, category_badge, category_tag, description, code_url, demo_url, skills, sort_order)
│   └── project_slides        (id, project_id -> projects.id, webp, alt, sort_order)
├── certificates              (id, title, issuer, date, category, credential_url, verify_url, description, image, icon_key, icon_color, color, sort_order)
├── skill_categories          (id, name, badge, sort_order)
│   └── skill_items           (id, category_name -> skill_categories.name, name, key, svg, sort_order)
├── education                 (id, degree, institution, timeline, status, grade, color, details, link, sort_order)
├── resumes                   (id, title, file_name, file_path, file_size, uploaded_at, is_active, drive_url)
├── site_settings             (key, value, updated_at)
└── portfolio_state           (id, data JSONB, updated_at) [Compiled cache for sub-millisecond API response]
```

---

## ⚡ How to Run the Migration into Neon

### Step 1: Get your Free Neon PostgreSQL Connection String
1. Go to [neon.tech](https://neon.tech) and log in.
2. Create a new project (e.g. `subhankar-portfolio`).
3. Copy your connection string from the dashboard. It looks like:
   ```text
   postgresql://username:password@ep-cool-frost-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

### Step 2: Run the Migration Command
In your terminal, run:

```powershell
python database/migrate_json_to_neon.py --db-url "YOUR_NEON_DATABASE_URL"
```

Or set the environment variable first:

```powershell
$env:DATABASE_URL="YOUR_NEON_DATABASE_URL"
python database/migrate_json_to_neon.py
```

### Step 3: What the Script Does Automatically
1. **Connects securely** to your Neon PostgreSQL cluster with SSL.
2. **Applies `schema.sql`** to create all 9 tables idempotently (`CREATE TABLE IF NOT EXISTS`).
3. **Losslessly imports**:
   - All 5 projects and their 17 carousel slide images
   - All 9 certificates with verified credentials
   - All 9 skill categories and 30 official vector SVG brand logos
   - All 3 education milestones
   - Resume metadata and Google Drive direct links
   - Site settings
4. **Populates the `portfolio_state`** cache table for instant frontend responses.
5. **Verifies row counts** across all tables and outputs a clear completion summary.

---

## 🌐 Connecting your Live Backend (`server.py`)

In `server.py`, the backend is already configured to automatically detect and use `DATABASE_URL`:
- If `DATABASE_URL` is set in your environment (or on Render / Railway / Vercel), it queries and updates Neon PostgreSQL directly.
- It also maintains local `data/portfolio_data.json` as a dual backup for maximum security and fault tolerance.
- The existing frontend UI (`index.html`, `admin.html`, `script.js`, `admin.js`) works seamlessly with zero modifications required.
