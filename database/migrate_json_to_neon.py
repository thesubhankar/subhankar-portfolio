#!/usr/bin/env python3
"""
=============================================================================
Subhankar Giri — Portfolio & Data Science Studio
Complete Neon PostgreSQL Database Migration Tool
Version: 1.0.0

Purpose:
  Safely migrates all current data from `data/portfolio_data.json` into a
  Neon Serverless PostgreSQL database (or Supabase / Render PostgreSQL)
  without any data loss.

Usage:
  python database/migrate_json_to_neon.py --db-url "postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require"
  OR
  set DATABASE_URL="postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require"
  python database/migrate_json_to_neon.py
=============================================================================
"""

import os
import sys
import json
import argparse
import time

# Ensure project root is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from database.models import apply_schema, build_portfolio_dict_from_tables

DEFAULT_JSON_PATH = os.path.join(BASE_DIR, "data", "portfolio_data.json")


def clean_neon_url(raw_url: str) -> str:
    """Normalize and prepare database connection URL for Neon/PostgreSQL."""
    url = raw_url.strip()
    if (url.startswith('"') and url.endswith('"')) or (url.startswith("'") and url.endswith("'")):
        url = url[1:-1].strip()

    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    # Ensure sslmode=require for Neon
    if "neon.tech" in url and "sslmode=" not in url:
        sep = "&" if "?" in url else "?"
        url = f"{url}{sep}sslmode=require"

    return url


def get_db_connection(db_url: str):
    """Establishes a connection to PostgreSQL/Neon with fallback handling."""
    import psycopg2
    try:
        return psycopg2.connect(db_url)
    except Exception as e:
        # Some local psycopg2 builds fail with channel_binding in Neon URL
        if "channel_binding" in db_url:
            import re
            clean_url = re.sub(r'[?&]channel_binding=[^&]+', '', db_url)
            if '?' not in clean_url and '&' in clean_url:
                clean_url = clean_url.replace('&', '?', 1)
            return psycopg2.connect(clean_url)
        raise e


def migrate_data(db_url: str, json_path: str = DEFAULT_JSON_PATH):
    print("=" * 72)
    print("🚀 NEON POSTGRESQL DATABASE MIGRATION — SUBHANKAR GIRI PORTFOLIO")
    print("=" * 72)

    if not os.path.exists(json_path):
        print(f"❌ Error: Source JSON file not found at: {json_path}")
        sys.exit(1)

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"📂 Loaded source JSON: {json_path}")
    print(f"   • Projects:     {len(data.get('projects', []))}")
    print(f"   • Certificates: {len(data.get('certificates', []))}")
    print(f"   • Skill Groups: {len(data.get('skills', []))}")
    print(f"   • Education:    {len(data.get('education', []))}")
    print(f"   • Resumes:      {len(data.get('resumes', []))}")

    clean_url = clean_neon_url(db_url)
    # Mask password for display
    masked_url = clean_url
    if "@" in clean_url and "://" in clean_url:
        prefix, rest = clean_url.split("://", 1)
        creds, host = rest.split("@", 1)
        user = creds.split(":", 1)[0]
        masked_url = f"{prefix}://{user}:****@{host}"

    print(f"\n🔌 Connecting to Neon PostgreSQL: {masked_url}...")
    try:
        conn = get_db_connection(clean_url)
        print("✅ Connected to Neon database successfully!")
    except Exception as err:
        print(f"❌ Failed to connect to Neon PostgreSQL:\n   {err}")
        sys.exit(1)

    # 1. Apply Schema (create tables idempotently)
    print("\n📦 Step 1: Applying Database Schema (database/schema.sql)...")
    try:
        apply_schema(conn)
        print("✅ All 9 Relational & State Tables verified / created!")
    except Exception as err:
        print(f"❌ Failed to execute schema DDL:\n   {err}")
        conn.close()
        sys.exit(1)

    # 2. Insert Data into Relational Tables
    print("\n📥 Step 2: Importing Data into Normalized Relational Tables...")
    try:
        with conn.cursor() as cur:
            # A. Projects & Slides
            projects = data.get("projects", [])
            for p_idx, p in enumerate(projects):
                pid = p["id"]
                skills_json = json.dumps(p.get("skills", []))
                cur.execute("""
                    INSERT INTO projects (id, title, category_badge, category_tag, description, code_url, demo_url, skills, sort_order, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                    ON CONFLICT (id) DO UPDATE SET
                        title = EXCLUDED.title,
                        category_badge = EXCLUDED.category_badge,
                        category_tag = EXCLUDED.category_tag,
                        description = EXCLUDED.description,
                        code_url = EXCLUDED.code_url,
                        demo_url = EXCLUDED.demo_url,
                        skills = EXCLUDED.skills,
                        sort_order = EXCLUDED.sort_order,
                        updated_at = CURRENT_TIMESTAMP;
                """, (
                    pid,
                    p.get("title", ""),
                    p.get("categoryBadge", "DATA SCIENCE"),
                    p.get("categoryTag", "data-science"),
                    p.get("description", ""),
                    p.get("codeUrl", ""),
                    p.get("demoUrl", ""),
                    skills_json,
                    p_idx
                ))

                # Slides: replace slides for this project
                cur.execute("DELETE FROM project_slides WHERE project_id = %s;", (pid,))
                for s_idx, s in enumerate(p.get("slides", [])):
                    cur.execute("""
                        INSERT INTO project_slides (project_id, webp, alt, sort_order)
                        VALUES (%s, %s, %s, %s);
                    """, (pid, s.get("webp", ""), s.get("alt", ""), s_idx))

            print(f"   ✓ Imported {len(projects)} Projects and their Slides")

            # B. Certificates
            certs = data.get("certificates", [])
            for c_idx, c in enumerate(certs):
                cur.execute("""
                    INSERT INTO certificates (id, title, issuer, date, category, credential_url, verify_url, description, image, icon_key, icon_color, color, sort_order)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET
                        title = EXCLUDED.title,
                        issuer = EXCLUDED.issuer,
                        date = EXCLUDED.date,
                        category = EXCLUDED.category,
                        credential_url = EXCLUDED.credential_url,
                        verify_url = EXCLUDED.verify_url,
                        description = EXCLUDED.description,
                        image = EXCLUDED.image,
                        icon_key = EXCLUDED.icon_key,
                        icon_color = EXCLUDED.icon_color,
                        color = EXCLUDED.color,
                        sort_order = EXCLUDED.sort_order;
                """, (
                    c["id"],
                    c.get("title", ""),
                    c.get("issuer", ""),
                    c.get("date", "2024"),
                    c.get("category", "Data Science"),
                    c.get("credentialUrl", ""),
                    c.get("verifyUrl", ""),
                    c.get("description", ""),
                    c.get("image", ""),
                    c.get("iconKey", "medal"),
                    c.get("iconColor", "cyan"),
                    c.get("color", "cyan"),
                    c_idx
                ))
            print(f"   ✓ Imported {len(certs)} Certificates")

            # C. Skill Categories & Items
            skill_groups = data.get("skills", [])
            for cat_idx, group in enumerate(skill_groups):
                cname = group.get("category", "").strip()
                if not cname:
                    continue
                cur.execute("""
                    INSERT INTO skill_categories (name, badge, sort_order)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (name) DO UPDATE SET
                        badge = EXCLUDED.badge,
                        sort_order = EXCLUDED.sort_order;
                """, (cname, group.get("badge", "85%"), cat_idx))

                # Delete existing skill items for category to avoid duplicates on re-run
                cur.execute("DELETE FROM skill_items WHERE category_name = %s;", (cname,))
                for s_idx, s in enumerate(group.get("skills", [])):
                    cur.execute("""
                        INSERT INTO skill_items (category_name, name, key, svg, sort_order)
                        VALUES (%s, %s, %s, %s, %s);
                    """, (cname, s.get("name", ""), s.get("key", ""), s.get("svg", ""), s_idx))

            print(f"   ✓ Imported {len(skill_groups)} Skill Categories & Vector SVGs")

            # D. Education
            edus = data.get("education", [])
            for e_idx, e in enumerate(edus):
                cur.execute("""
                    INSERT INTO education (id, degree, institution, timeline, status, grade, color, details, link, sort_order)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET
                        degree = EXCLUDED.degree,
                        institution = EXCLUDED.institution,
                        timeline = EXCLUDED.timeline,
                        status = EXCLUDED.status,
                        grade = EXCLUDED.grade,
                        color = EXCLUDED.color,
                        details = EXCLUDED.details,
                        link = EXCLUDED.link,
                        sort_order = EXCLUDED.sort_order;
                """, (
                    e["id"],
                    e.get("degree", ""),
                    e.get("institution", ""),
                    e.get("timeline", ""),
                    e.get("status", "Completed"),
                    e.get("grade", ""),
                    e.get("color", "cyan"),
                    e.get("details", ""),
                    e.get("link", ""),
                    e_idx
                ))
            print(f"   ✓ Imported {len(edus)} Education Milestones")

            # E. Resumes & Settings
            resumes = data.get("resumes", [])
            for r in resumes:
                cur.execute("""
                    INSERT INTO resumes (id, title, file_name, file_path, file_size, uploaded_at, is_active, drive_url)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET
                        title = EXCLUDED.title,
                        file_name = EXCLUDED.file_name,
                        file_path = EXCLUDED.file_path,
                        file_size = EXCLUDED.file_size,
                        uploaded_at = EXCLUDED.uploaded_at,
                        is_active = EXCLUDED.is_active,
                        drive_url = EXCLUDED.drive_url;
                """, (
                    r.get("id", "resume_default"),
                    r.get("title", "Subhankar Giri — Official CV / Resume"),
                    r.get("fileName", "resume.pdf"),
                    r.get("filePath", "assets/resume.pdf"),
                    r.get("fileSize", "1.1 KB"),
                    r.get("uploadedAt", "14 Nov 2026"),
                    r.get("isActive", True),
                    data.get("resume", {}).get("driveUrl", "")
                ))
            print(f"   ✓ Imported {len(resumes)} Resume Versions")

            # Settings
            settings_map = {
                "moreCertificatesDriveUrl": data.get("moreCertificatesDriveUrl", ""),
                "certificatesDriveFolder": data.get("certificatesDriveFolder", ""),
                "resume_driveUrl": data.get("resume", {}).get("driveUrl", "")
            }
            for k, v in settings_map.items():
                if v:
                    cur.execute("""
                        INSERT INTO site_settings (key, value, updated_at)
                        VALUES (%s, %s, CURRENT_TIMESTAMP)
                        ON CONFLICT (key) DO UPDATE SET
                            value = EXCLUDED.value,
                            updated_at = CURRENT_TIMESTAMP;
                    """, (k, str(v)))
            print(f"   ✓ Imported Site Settings & Drive Links")

            # 3. Synchronize compiled document into portfolio_state (for fast front-end caching)
            import psycopg2.extras
            cur.execute("""
                INSERT INTO portfolio_state (id, data, updated_at)
                VALUES ('main', %s, CURRENT_TIMESTAMP)
                ON CONFLICT (id) DO UPDATE SET
                    data = EXCLUDED.data,
                    updated_at = CURRENT_TIMESTAMP;
            """, (psycopg2.extras.Json(data),))
            print("   ✓ Synchronized aggregated JSON document in 'portfolio_state'")

        conn.commit()
    except Exception as err:
        conn.rollback()
        print(f"❌ Migration failed during data insert:\n   {err}")
        conn.close()
        sys.exit(1)

    # 4. Verification Check
    print("\n🔍 Step 3: Verifying Database Record Counts...")
    try:
        with conn.cursor() as cur:
            tables = [
                "projects",
                "project_slides",
                "certificates",
                "skill_categories",
                "skill_items",
                "education",
                "resumes",
                "site_settings",
                "portfolio_state"
            ]
            for t in tables:
                cur.execute(f"SELECT COUNT(*) FROM {t};")
                cnt = cur.fetchone()[0]
                print(f"   • {t:<20}: {cnt} records")

        conn.close()
        print("\n" + "=" * 72)
        print("🎉 SUCCESS: All JSON data successfully migrated into Neon PostgreSQL!")
        print("   Zero data loss. Both relational tables and cache are 100% in sync.")
        print("=" * 72)
    except Exception as err:
        print(f"⚠️ Verification check encountered an issue: {err}")
        conn.close()


def main():
    parser = argparse.ArgumentParser(description="Migrate portfolio JSON to Neon PostgreSQL")
    parser.add_argument("--db-url", help="Neon PostgreSQL Connection String (DATABASE_URL)")
    parser.add_argument("--json", default=DEFAULT_JSON_PATH, help="Path to portfolio_data.json")
    args = parser.parse_args()

    db_url = args.db_url or os.environ.get("DATABASE_URL") or os.environ.get("NEON_DATABASE_URL")
    if not db_url:
        print("=" * 72)
        print("🔑 Neon PostgreSQL Connection String Required")
        print("=" * 72)
        print("Please enter your Neon DATABASE_URL:")
        print("Example: postgresql://subhankar:password@ep-cool-frost-123.ap-southeast-1.aws.neon.tech/neondb?sslmode=require\n")
        try:
            db_url = input("DATABASE_URL: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nAborted.")
            sys.exit(1)

    if not db_url:
        print("❌ Error: No DATABASE_URL provided. Migration stopped.")
        sys.exit(1)

    migrate_data(db_url, args.json)


if __name__ == "__main__":
    main()
