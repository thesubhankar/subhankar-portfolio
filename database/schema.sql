-- =============================================================================
-- Subhankar Giri — Portfolio & Data Science Studio
-- Neon PostgreSQL Relational Database Schema
-- Version: 1.0.0
-- Compatible with: Neon Serverless Postgres, PostgreSQL 14+, Supabase, Render
-- =============================================================================

-- Enable standard UUID extensions if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. Projects Table
-- Stores high-level project metadata, categories, repository & live demo links
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category_badge VARCHAR(128) NOT NULL DEFAULT 'DATA SCIENCE',
    category_tag VARCHAR(255) NOT NULL DEFAULT 'data-science',
    description TEXT,
    code_url TEXT,
    demo_url TEXT,
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON projects(sort_order);

-- -----------------------------------------------------------------------------
-- 2. Project Slides Table
-- 1-to-many relationship with projects for multi-image project carousels
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_slides (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE,
    webp TEXT NOT NULL,
    alt TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_slides_project_id ON project_slides(project_id);
CREATE INDEX IF NOT EXISTS idx_project_slides_sort ON project_slides(project_id, sort_order);

-- -----------------------------------------------------------------------------
-- 3. Certificates Table
-- Stores credentials, issuing organizations, verification links & credential badges
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS certificates (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    issuer VARCHAR(255) NOT NULL,
    date VARCHAR(64) NOT NULL DEFAULT '2024',
    category VARCHAR(128) NOT NULL DEFAULT 'Data Science',
    credential_url TEXT,
    verify_url TEXT,
    description TEXT,
    image TEXT,
    icon_key VARCHAR(64) NOT NULL DEFAULT 'medal',
    icon_color VARCHAR(64) NOT NULL DEFAULT 'cyan',
    color VARCHAR(64) NOT NULL DEFAULT 'cyan',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_certificates_sort_order ON certificates(sort_order);

-- -----------------------------------------------------------------------------
-- 4. Skill Categories Table
-- Stores categories like Programming, Data Analysis, Machine Learning & proficiency badge
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS skill_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128) UNIQUE NOT NULL,
    badge VARCHAR(32) NOT NULL DEFAULT '85%',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_skill_categories_sort_order ON skill_categories(sort_order);

-- -----------------------------------------------------------------------------
-- 5. Skill Items Table
-- Individual technology skills with official SVG vector branding
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS skill_items (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(128) NOT NULL REFERENCES skill_categories(name) ON DELETE CASCADE ON UPDATE CASCADE,
    name VARCHAR(128) NOT NULL,
    key VARCHAR(128) NOT NULL,
    svg TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_skill_items_cat_name ON skill_items(category_name);
CREATE INDEX IF NOT EXISTS idx_skill_items_sort ON skill_items(category_name, sort_order);

-- -----------------------------------------------------------------------------
-- 6. Education Timeline Table
-- Academic credentials, degrees, institutions, grades & verified documents
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS education (
    id VARCHAR(64) PRIMARY KEY,
    degree VARCHAR(255) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    timeline VARCHAR(128) NOT NULL,
    status VARCHAR(128) NOT NULL DEFAULT 'Completed',
    grade VARCHAR(128),
    color VARCHAR(64) NOT NULL DEFAULT 'cyan',
    details TEXT,
    link TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_education_sort_order ON education(sort_order);

-- -----------------------------------------------------------------------------
-- 7. Resumes Table
-- Tracks multiple CV versions, active status, file sizes & Google Drive links
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS resumes (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size VARCHAR(64),
    uploaded_at VARCHAR(128),
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    drive_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 8. Site Settings & Global Metadata Table
-- Key-value store for Drive folder links, contact email, social handles, etc.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
    key VARCHAR(128) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 9. Portfolio State Document Table
-- High-Speed compiled state cache for sub-millisecond API responses to /api/portfolio-data
-- Ensures 100% zero-regression backward compatibility with existing front-end JS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS portfolio_state (
    id VARCHAR(64) PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
