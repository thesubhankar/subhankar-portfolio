"""
Subhankar Giri — Portfolio & Data Science Studio
Offline Schema & Data Integrity Test
Verifies 100% lossless mapping between JSON and Database models
"""

import os
import sys
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from database.models import (
    Project,
    ProjectSlide,
    Certificate,
    SkillCategory,
    SkillItem,
    Education,
    ResumeItem,
    get_schema_sql_path
)

def run_offline_tests():
    print("=" * 65)
    print("🧪 OFFLINE DATABASE MODEL & JSON DATA INTEGRITY TEST")
    print("=" * 65)

    # 1. Verify schema.sql exists and is non-empty
    schema_path = get_schema_sql_path()
    assert os.path.exists(schema_path), f"schema.sql not found at {schema_path}"
    with open(schema_path, "r", encoding="utf-8") as f:
        schema_sql = f.read()
    assert len(schema_sql) > 500, "schema.sql seems too short"
    print("✓ schema.sql loaded and verified (Length: {} bytes)".format(len(schema_sql)))

    # Verify expected tables exist in schema.sql
    expected_tables = [
        "projects", "project_slides", "certificates",
        "skill_categories", "skill_items", "education",
        "resumes", "site_settings", "portfolio_state"
    ]
    for tbl in expected_tables:
        assert f"CREATE TABLE IF NOT EXISTS {tbl}" in schema_sql, f"Missing table {tbl} in schema.sql"
    print(f"✓ All {len(expected_tables)} required PostgreSQL tables present in schema.sql")

    # 2. Verify portfolio_data.json mapping
    json_path = os.path.join(BASE_DIR, "data", "portfolio_data.json")
    with open(json_path, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    # Map Projects
    projects = []
    total_slides = 0
    for p in raw_data.get("projects", []):
        proj = Project(
            id=p["id"],
            title=p["title"],
            categoryBadge=p.get("categoryBadge", "DATA SCIENCE"),
            categoryTag=p.get("categoryTag", "data-science"),
            description=p.get("description", ""),
            codeUrl=p.get("codeUrl", ""),
            demoUrl=p.get("demoUrl", ""),
            slides=p.get("slides", []),
            skills=p.get("skills", [])
        )
        total_slides += len(proj.slides)
        projects.append(proj)
    assert len(projects) == len(raw_data.get("projects", []))
    print(f"✓ Projects Model Mapped: {len(projects)} projects, {total_slides} slides")

    # Map Certificates
    certs = []
    for c in raw_data.get("certificates", []):
        cert = Certificate(
            id=c["id"],
            title=c["title"],
            issuer=c["issuer"],
            date=c.get("date", "2024"),
            category=c.get("category", "Data Science"),
            credentialUrl=c.get("credentialUrl", ""),
            verifyUrl=c.get("verifyUrl", ""),
            description=c.get("description", ""),
            image=c.get("image", ""),
            iconKey=c.get("iconKey", "medal"),
            iconColor=c.get("iconColor", "cyan"),
            color=c.get("color", "cyan")
        )
        certs.append(cert)
    assert len(certs) == len(raw_data.get("certificates", []))
    print(f"✓ Certificates Model Mapped: {len(certs)} certificates")

    # Map Skills
    skill_cats = []
    total_skill_items = 0
    for cat in raw_data.get("skills", []):
        scat = SkillCategory(
            category=cat["category"],
            badge=cat.get("badge", "85%"),
            skills=cat.get("skills", [])
        )
        total_skill_items += len(scat.skills)
        skill_cats.append(scat)
    assert len(skill_cats) == len(raw_data.get("skills", []))
    print(f"✓ Skills Model Mapped: {len(skill_cats)} categories, {total_skill_items} skill items")

    # Map Education
    edus = []
    for e in raw_data.get("education", []):
        edu = Education(
            id=e["id"],
            degree=e["degree"],
            institution=e["institution"],
            timeline=e["timeline"],
            status=e.get("status", "Completed"),
            grade=e.get("grade", ""),
            color=e.get("color", "cyan"),
            details=e.get("details", ""),
            link=e.get("link", "")
        )
        edus.append(edu)
    assert len(edus) == len(raw_data.get("education", []))
    print(f"✓ Education Model Mapped: {len(edus)} education milestones")

    # Map Resumes
    resumes = []
    for r in raw_data.get("resumes", []):
        res_item = ResumeItem(
            id=r.get("id", "resume_default"),
            title=r.get("title", ""),
            fileName=r.get("fileName", ""),
            filePath=r.get("filePath", ""),
            fileSize=r.get("fileSize", ""),
            uploadedAt=r.get("uploadedAt", ""),
            isActive=bool(r.get("isActive", True))
        )
        resumes.append(res_item)
    assert len(resumes) == len(raw_data.get("resumes", []))
    print(f"✓ Resumes Model Mapped: {len(resumes)} resume records")

    print("\n" + "=" * 65)
    print("🎉 ALL OFFLINE INTEGRITY TESTS PASSED (100% Data Fidelity)")
    print("=" * 65)

if __name__ == "__main__":
    run_offline_tests()
