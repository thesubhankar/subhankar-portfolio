"""
Subhankar Giri — Portfolio & Data Science Studio
Database Models & Python Mapping Layer for Neon PostgreSQL
Compatible with PostgreSQL 14+, Neon Serverless, psycopg2, and Flask
"""

import json
import os
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional

# =============================================================================
# 1. Dataclass Models (Mirroring JSON & Relational Tables 1:1)
# =============================================================================

@dataclass
class ProjectSlide:
    webp: str
    alt: str = ""
    sort_order: int = 0
    id: Optional[int] = None
    project_id: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "webp": self.webp,
            "alt": self.alt
        }


@dataclass
class Project:
    id: str
    title: str
    categoryBadge: str = "DATA SCIENCE"
    categoryTag: str = "data-science"
    description: str = ""
    codeUrl: str = ""
    demoUrl: str = ""
    slides: List[Dict[str, str]] = field(default_factory=list)
    skills: List[str] = field(default_factory=list)
    sort_order: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "categoryBadge": self.categoryBadge,
            "categoryTag": self.categoryTag,
            "description": self.description,
            "codeUrl": self.codeUrl,
            "demoUrl": self.demoUrl,
            "slides": self.slides,
            "skills": self.skills
        }


@dataclass
class Certificate:
    id: str
    title: str
    issuer: str
    date: str = "2024"
    category: str = "Data Science"
    credentialUrl: str = ""
    verifyUrl: str = ""
    description: str = ""
    image: str = ""
    iconKey: str = "medal"
    iconColor: str = "cyan"
    color: str = "cyan"
    sort_order: int = 0

    def to_dict(self) -> Dict[str, Any]:
        d = {
            "id": self.id,
            "title": self.title,
            "issuer": self.issuer,
            "date": self.date,
            "category": self.category,
            "credentialUrl": self.credentialUrl,
            "description": self.description,
            "image": self.image,
            "iconKey": self.iconKey,
            "iconColor": self.iconColor,
            "color": self.color
        }
        if self.verifyUrl:
            d["verifyUrl"] = self.verifyUrl
        return d


@dataclass
class SkillItem:
    name: str
    key: str
    svg: str
    category_name: str = ""
    sort_order: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "key": self.key,
            "svg": self.svg
        }


@dataclass
class SkillCategory:
    category: str
    badge: str = "85%"
    skills: List[Dict[str, Any]] = field(default_factory=list)
    sort_order: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "category": self.category,
            "badge": self.badge,
            "skills": self.skills
        }


@dataclass
class Education:
    id: str
    degree: str
    institution: str
    timeline: str
    status: str = "Completed"
    grade: str = ""
    color: str = "cyan"
    details: str = ""
    link: str = ""
    sort_order: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "degree": self.degree,
            "institution": self.institution,
            "timeline": self.timeline,
            "status": self.status,
            "grade": self.grade,
            "color": self.color,
            "details": self.details,
            "link": self.link
        }


@dataclass
class ResumeItem:
    id: str
    title: str
    fileName: str
    filePath: str
    fileSize: str = "1.0 MB"
    uploadedAt: str = ""
    isActive: bool = False
    driveUrl: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "fileName": self.fileName,
            "filePath": self.filePath,
            "fileSize": self.fileSize,
            "uploadedAt": self.uploadedAt,
            "isActive": self.isActive
        }


# =============================================================================
# 2. Database Schema Execution & DDL Helpers
# =============================================================================

def get_schema_sql_path() -> str:
    """Returns absolute path to database/schema.sql."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_dir, "schema.sql")


def apply_schema(conn) -> bool:
    """Applies database/schema.sql to the given database connection."""
    sql_path = get_schema_sql_path()
    if not os.path.exists(sql_path):
        raise FileNotFoundError(f"Schema file not found at: {sql_path}")

    with open(sql_path, "r", encoding="utf-8") as f:
        ddl = f.read()

    with conn.cursor() as cur:
        cur.execute(ddl)
    conn.commit()
    return True


# =============================================================================
# 3. Synchronizing Relational Tables -> Unified Portfolio JSON Dictionary
# =============================================================================

def build_portfolio_dict_from_tables(conn) -> Dict[str, Any]:
    """
    Queries all normalized relational tables and reconstructs the complete
    portfolio data dictionary identically to portfolio_data.json.
    """
    result: Dict[str, Any] = {
        "projects": [],
        "certificates": [],
        "resume": {},
        "skills": [],
        "education": [],
        "moreCertificatesDriveUrl": "",
        "certificatesDriveFolder": "",
        "resumes": []
    }

    with conn.cursor() as cur:
        # 1. Projects & Slides
        cur.execute("""
            SELECT id, title, category_badge, category_tag, description, code_url, demo_url, skills, sort_order
            FROM projects
            ORDER BY sort_order ASC, created_at ASC;
        """)
        proj_rows = cur.fetchall()

        # Fetch all slides grouped
        cur.execute("""
            SELECT project_id, webp, alt
            FROM project_slides
            ORDER BY project_id, sort_order ASC, id ASC;
        """)
        slide_rows = cur.fetchall()
        slides_by_proj: Dict[str, List[Dict[str, str]]] = {}
        for pid, webp, alt in slide_rows:
            slides_by_proj.setdefault(pid, []).append({"webp": webp, "alt": alt or ""})

        for row in proj_rows:
            pid = row[0]
            skills_val = row[7]
            if isinstance(skills_val, str):
                try:
                    skills_list = json.loads(skills_val)
                except Exception:
                    skills_list = [s.strip() for s in skills_val.split(",") if s.strip()]
            elif isinstance(skills_val, list):
                skills_list = skills_val
            else:
                skills_list = []

            result["projects"].append({
                "id": pid,
                "title": row[1],
                "categoryBadge": row[2] or "DATA SCIENCE",
                "categoryTag": row[3] or "data-science",
                "description": row[4] or "",
                "codeUrl": row[5] or "",
                "demoUrl": row[6] or "",
                "slides": slides_by_proj.get(pid, []),
                "skills": skills_list
            })

        # 2. Certificates
        cur.execute("""
            SELECT id, title, issuer, date, category, credential_url, verify_url, description, image, icon_key, icon_color, color
            FROM certificates
            ORDER BY sort_order ASC, created_at ASC;
        """)
        for r in cur.fetchall():
            cert_dict = {
                "id": r[0],
                "title": r[1],
                "issuer": r[2],
                "date": r[3] or "2024",
                "category": r[4] or "Data Science",
                "credentialUrl": r[5] or "",
                "description": r[7] or "",
                "image": r[8] or "",
                "iconKey": r[9] or "medal",
                "iconColor": r[10] or "cyan",
                "color": r[11] or "cyan"
            }
            if r[6]:  # verify_url
                cert_dict["verifyUrl"] = r[6]
            result["certificates"].append(cert_dict)

        # 3. Skill Categories & Items
        cur.execute("""
            SELECT name, badge
            FROM skill_categories
            ORDER BY sort_order ASC, id ASC;
        """)
        cat_rows = cur.fetchall()

        cur.execute("""
            SELECT category_name, name, key, svg
            FROM skill_items
            ORDER BY category_name, sort_order ASC, id ASC;
        """)
        item_rows = cur.fetchall()
        items_by_cat: Dict[str, List[Dict[str, str]]] = {}
        for cname, iname, ikey, isvg in item_rows:
            items_by_cat.setdefault(cname, []).append({
                "name": iname,
                "key": ikey,
                "svg": isvg
            })

        for cname, cbadge in cat_rows:
            result["skills"].append({
                "category": cname,
                "badge": cbadge or "85%",
                "skills": items_by_cat.get(cname, [])
            })

        # 4. Education
        cur.execute("""
            SELECT id, degree, institution, timeline, status, grade, color, details, link
            FROM education
            ORDER BY sort_order ASC, created_at ASC;
        """)
        for r in cur.fetchall():
            result["education"].append({
                "id": r[0],
                "degree": r[1],
                "institution": r[2],
                "timeline": r[3],
                "status": r[4] or "Completed",
                "grade": r[5] or "",
                "color": r[6] or "cyan",
                "details": r[7] or "",
                "link": r[8] or ""
            })

        # 5. Resumes
        cur.execute("""
            SELECT id, title, file_name, file_path, file_size, uploaded_at, is_active, drive_url
            FROM resumes
            ORDER BY is_active DESC, created_at DESC;
        """)
        active_resume_found = False
        for r in cur.fetchall():
            res_item = {
                "id": r[0],
                "title": r[1],
                "fileName": r[2],
                "filePath": r[3],
                "fileSize": r[4] or "",
                "uploadedAt": r[5] or "",
                "isActive": bool(r[6])
            }
            result["resumes"].append(res_item)
            if r[6] and not active_resume_found:  # is_active
                result["resume"] = {
                    "filePath": r[3],
                    "driveUrl": r[7] or "",
                    "lastUpdated": r[5] or "",
                    "hasUploadedPdf": True
                }
                active_resume_found = True

        # Fallback if no active resume in resumes table
        if not result["resume"]:
            result["resume"] = {
                "filePath": "assets/resume.pdf",
                "driveUrl": "https://drive.google.com/file/d/1vtCEfBZiPKz9CQ8ARMHXGsyeW9zrHi7P/view?usp=drive_link",
                "lastUpdated": "November 2026",
                "hasUploadedPdf": True
            }

        # 6. Site Settings
        cur.execute("SELECT key, value FROM site_settings;")
        for k, v in cur.fetchall():
            if k in result:
                result[k] = v

    return result
