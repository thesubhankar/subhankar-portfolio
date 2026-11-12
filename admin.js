/* ==========================================================================
   SUBHANKAR GIRI PORTFOLIO - ADMIN STUDIO ENGINE (admin.js)
   ========================================================================== */

let PORTFOLIO_DATA = { projects: [], certificates: [], resume: {}, skills: [], education: [] };
        let AVAILABLE_LOGOS = {};

        // --- Theme Engine Initialization (Matches script.js) ---
        function initTheme() {
            const desktopToggle = document.getElementById('desktopThemeToggle');
            const mobileToggle = document.getElementById('mobileThemeToggle');
            const themeLabel = document.getElementById('themeLabel');
            const themeContainers = document.querySelectorAll('.theme-switch-container');

            function getTimeBasedTheme() {
                const hour = new Date().getHours();
                return (hour >= 6 && hour < 18) ? 'light' : 'dark';
            }

            const savedTheme = localStorage.getItem('sg_portfolio_theme');
            const initialTheme = (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : getTimeBasedTheme();

            setTheme(initialTheme);

            function toggleTheme(e) {
                if (e && typeof e.preventDefault === 'function') {
                    e.preventDefault();
                }
                if (e && typeof e.stopPropagation === 'function') {
                    e.stopPropagation();
                }
                const current = document.documentElement.getAttribute('data-theme') || getTimeBasedTheme();
                const next = current === 'dark' ? 'light' : 'dark';
                localStorage.setItem('sg_portfolio_theme', next);
                localStorage.setItem('sg_portfolio_theme_manual', 'true');
                sessionStorage.setItem('sg_portfolio_theme_manual', 'true');
                setTheme(next);
            }

            // Multi-target event binding: button, container, label, touch & click
            [desktopToggle, mobileToggle].forEach(btn => {
                if (btn) {
                    btn.addEventListener('click', toggleTheme);
                    btn.addEventListener('touchend', (e) => {
                        e.preventDefault();
                        toggleTheme(e);
                    }, { passive: false });
                }
            });

            themeContainers.forEach(container => {
                container.addEventListener('click', (e) => {
                    if (e && e.target && typeof e.target.closest === 'function' && e.target.closest('.theme-toggle-pill')) return;
                    toggleTheme(e);
                });
            });

            if (themeLabel) {
                themeLabel.addEventListener('click', toggleTheme);
            }

            // Cross-tab synchronization
            window.addEventListener('storage', (e) => {
                if (e.key === 'sg_portfolio_theme' && (e.newValue === 'light' || e.newValue === 'dark')) {
                    setTheme(e.newValue);
                }
            });

            function setTheme(theme) {
                document.documentElement.classList.add('theme-switching');
                document.documentElement.setAttribute('data-theme', theme);
                if (document.body) {
                    document.body.setAttribute('data-theme', theme);
                }
                localStorage.setItem('sg_portfolio_theme', theme);

                if (themeLabel) {
                    themeLabel.textContent = theme === 'dark' ? 'Dark theme' : 'Light theme';
                }

                [desktopToggle, mobileToggle].forEach(btn => {
                    if (btn) {
                        btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
                        btn.setAttribute('title', `Current: ${theme === 'dark' ? 'Dark' : 'Light'} theme (Click to toggle)`);
                    }
                });

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        document.documentElement.classList.remove('theme-switching');
                    });
                });
            }
        }

        // Clear any old persistent tokens immediately upon opening admin
        localStorage.removeItem('sg_admin_token');
        sessionStorage.removeItem('sg_admin_token');

        let isKernelAuthenticated = false;

        // --- Authentication Handler ---
        function checkAuth() {
            const overlay = document.getElementById('loginOverlay');
            if (isKernelAuthenticated) {
                if (overlay) overlay.classList.add('hidden');
                loadData();
            } else {
                if (overlay) overlay.classList.remove('hidden');
                const pInput = document.getElementById('loginPassword');
                if (pInput) {
                    pInput.value = '';
                    setTimeout(() => pInput.focus(), 150);
                }
            }
        }

        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const u = document.getElementById('loginUsername').value.trim();
            const p = document.getElementById('loginPassword').value.trim();
            const errEl = document.getElementById('loginError');
            if (errEl) errEl.style.display = 'none';

            try {
                const res = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: u, password: p })
                });
                const d = await res.json();
                if (d.success) {
                    isKernelAuthenticated = true;
                    sessionStorage.setItem('sg_admin_token', d.token);
                    checkAuth();
                    showNotify('🔓 Access granted. Admin kernel unlocked!');
                } else {
                    showLoginError(d.message || 'Authentication rejected. Invalid password.');
                }
            } catch (err) {
                showLoginError('Failed to communicate with Flask backend. Ensure server.py is running.');
            }
        });

        function logoutAdmin() {
            isKernelAuthenticated = false;
            sessionStorage.removeItem('sg_admin_token');
            localStorage.removeItem('sg_admin_token');
            checkAuth();
            showNotify('🔒 Admin kernel locked successfully');
        }

        function showLoginError(msg) {
            const el = document.getElementById('loginError');
            el.innerText = msg;
            el.style.display = 'block';
        }

        function showNotify(msg, isSuccess = true) {
            if (isSuccess) {
                try {
                    localStorage.setItem('sg_portfolio_updated', String(Date.now()));
                } catch (e) {}
            }
            const el = document.getElementById('notifyBanner');
            el.innerText = msg;
            el.className = isSuccess ? 'admin-notification-toast success' : 'admin-notification-toast error';
            el.style.display = 'flex';
            setTimeout(() => {
                el.style.display = 'none';
            }, 3800);
        }

        // --- Tab / Page Switcher ---
        function switchPage(pageId, ev) {
    if (ev) ev.preventDefault();

    // 1. Hide all pages, activate target page
    document.querySelectorAll('.notebook-page').forEach(page => {
        page.classList.remove('active');
    });
    const targetPage = document.getElementById('page-' + pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // 2. Update active highlight and color on sidebar navigation buttons
    document.querySelectorAll('.sidebar-nav-item, .sidebar-admin-item').forEach(item => {
        item.classList.remove('active');
    });
    const targetNav = document.querySelector(`.sidebar-nav-item[data-page="${pageId}"], .sidebar-admin-item[data-page="${pageId}"]`);
    if (targetNav) {
        targetNav.classList.add('active');
    }

    // 3. Update document status
    const docStatus = document.getElementById('kernelDocStatus');
    if (docStatus) {
        docStatus.textContent = `admin.ipynb · ${pageId}`;
    }

    window.location.hash = pageId;

    // 4. Close mobile sidebar if open
    const sidebar = document.getElementById('notebookSidebar');
    if (sidebar && sidebar.classList.contains('drawer-open')) {
        sidebar.classList.remove('drawer-open');
    }
}

        // --- Data Fetching & Rendering ---
        async function loadData() {
            const statusDot = document.getElementById('statusDot');
            const statusText = document.getElementById('statusText');
            if (statusDot) statusDot.className = 'status-indicator-dot busy';
            if (statusText) statusText.textContent = 'Python 3 | syncing...';

            try {
                // Fetch official logo dictionary first so renderers can use it
                const lRes = await fetch('/api/skill-logos');
                const lData = await lRes.json();
                AVAILABLE_LOGOS = lData.logos || {};

                const res = await fetch('/api/portfolio-data');
                PORTFOLIO_DATA = await res.json();
                renderProjects();
                renderCertificates();
                renderSkills();
                renderEducation();
                renderResume();

                if (statusDot) statusDot.className = 'status-indicator-dot idle';
                if (statusText) statusText.textContent = 'Python 3 | admin';
            } catch (err) {
                console.error('Error loading portfolio data:', err);
                if (statusDot) statusDot.className = 'status-indicator-dot idle';
                if (statusText) statusText.textContent = 'Python 3 | idle';
            }
        }

        function formatFileSize(bytes) {
            if (!bytes || bytes <= 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        }

        // Helper to match skill logos
        function getSkillLogoHtml(skillName, customSvg) {
            if (customSvg) return customSvg;
            const clean = (skillName || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            const keyMap = {
                'pytorch': 'pytorch', 'torch': 'pytorch', 'python': 'python', 'tensorflow': 'tensorflow', 'tf': 'tensorflow',
                'keras': 'keras', 'pandas': 'pandas', 'numpy': 'numpy', 'scikit': 'scikit-learn', 'scikitlearn': 'scikit-learn', 'sklearn': 'scikit-learn',
                'powerbi': 'powerbi', 'tableau': 'tableau', 'matplotlib': 'matplotlib', 'seaborn': 'seaborn',
                'sql': 'sql', 'mysql': 'mysql', 'postgres': 'postgresql', 'postgresql': 'postgresql', 'sqlite': 'sqlite', 'tkinter': 'tkinter', 'tk': 'tkinter', 'scipy': 'scipy', 'tmdb': 'tmdb', 'tmdbapi': 'tmdb', 'oop': 'oop', 'datastruct': 'datastruct', 'datastructures': 'datastruct', 'reporting': 'reporting', 'automation': 'automation', 'cosinesim': 'cosinesim', 'cosinesimilarity': 'cosinesim', 'tfidf': 'tfidf', 'telematics': 'telematics', 'forecasting': 'forecasting',
                'mongodb': 'mongodb', 'docker': 'docker', 'fastapi': 'fastapi', 'flask': 'flask', 'streamlit': 'streamlit',
                'git': 'git', 'github': 'github', 'vscode': 'vscode', 'jupyter': 'jupyter', 'excel': 'excel',
                'anaconda': 'anaconda', 'opencv': 'opencv', 'langchain': 'langchain', 'huggingface': 'huggingface',
                'aws': 'aws', 'azure': 'azure', 'gcp': 'gcp',
                'math': 'math', 'mathematics': 'mathematics', 'calculus': 'calculus', 'linearalgebra': 'linearalgebra',
                'algebra': 'linearalgebra', 'matrix': 'linearalgebra', 'probability': 'probability', 'prob': 'probability',
                'optimization': 'optimization', 'statistics': 'stats', 'stats': 'stats',
                'dataanalysis': 'dataanalysis', 'dataanalytics': 'dataanalysis', 'analytics': 'dataanalysis',
                'timeseries': 'timeseries', 'forecasting': 'timeseries', 'regression': 'regression', 'clustering': 'clustering',
                'nlp': 'nlp', 'computervision': 'computervision', 'cv': 'computervision', 'genai': 'genai', 'generativeai': 'genai',
                'llm': 'llm', 'transformers': 'transformers', 'xgboost': 'xgboost',
                'spark': 'spark', 'pyspark': 'pyspark', 'hadoop': 'hadoop', 'kafka': 'kafka', 'airflow': 'airflow',
                'snowflake': 'snowflake', 'databricks': 'databricks', 'kubernetes': 'kubernetes', 'mlflow': 'mlflow',
                'plotly': 'plotly', 'r': 'r', 'cpp': 'cpp', 'java': 'java', 'linux': 'linux', 'bash': 'bash'
            };
            const matchedKey = keyMap[clean] || clean;
            return AVAILABLE_LOGOS[matchedKey] || '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#00F2FE" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9h6v6H9z"/></svg>';
        }

        // =========================================================================
        // 1. Projects Management (with Edit, 3-5 Images & Free-Text Category)
        // =========================================================================
        function renderProjects() {
            const list = document.getElementById('projectsList');
            if (!list) return;
            list.innerHTML = '';

            const projects = PORTFOLIO_DATA.projects || [];
            if (projects.length === 0) {
                list.innerHTML = '<div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); padding: 1rem;">No custom projects published yet.</div>';
                return;
            }

            projects.forEach(p => {
                const card = document.createElement('div');
                card.className = 'admin-item-card';

                const firstImg = (p.slides && p.slides[0]?.webp) 
                    ? p.slides[0].webp 
                    : ((p.slides && p.slides[0]?.png) ? p.slides[0].png : 'assets/uploads/projects/thrianex image/thumblain.webp');

                const skillsText = (p.skills || []).map(s => typeof s === 'string' ? s : (s.name || '')).join(' · ');

                card.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 0.65rem;">
                        <div class="admin-item-thumb">
                            <img src="/${firstImg}" alt="${p.title}" onerror="this.src='assets/images/profile.jpg'" />
                        </div>
                        <div class="admin-card-header">
                            <span class="tech-chip" style="color: var(--color-cyan, #00F2FE); border-color: rgba(0, 242, 254, 0.35);">
                                ${p.categoryBadge || 'PROJECT'}
                            </span>
                            <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted);">
                                ${(p.slides || []).length} image(s)
                            </span>
                        </div>
                        <h4 class="admin-card-title">${p.title}</h4>
                        <p class="admin-card-desc">${p.description || ''}</p>
                    </div>

                    <div class="admin-card-footer">
                        <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 140px;">
                            ${skillsText}
                        </span>
                        <div style="display: flex; gap: 6px; align-items: center;">
                            <button type="button" onclick="editProject('${p.id}')" class="btn-action-icon btn-edit-cyber" title="Edit Project" aria-label="Edit Project">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button type="button" onclick="deleteProject('${p.id}')" class="btn-action-icon btn-delete-cyber" title="Delete Project" aria-label="Delete Project">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                `;
                list.appendChild(card);
            });
        }

        // Live skills preview for project tech stack input
        const projSkillsInput = document.getElementById('projSkills');
        const projSkillsLivePills = document.getElementById('projSkillsLivePills');
        if (projSkillsInput && projSkillsLivePills) {
            projSkillsInput.addEventListener('input', updateProjSkillsPreview);
        }

        function updateProjSkillsPreview() {
            if (!projSkillsInput || !projSkillsLivePills) return;
            const raw = projSkillsInput.value;
            const items = raw.split(',').map(s => s.trim()).filter(Boolean);
            projSkillsLivePills.innerHTML = '';
            items.forEach(skillName => {
                const pill = document.createElement('span');
                pill.className = 'admin-skill-pill-tag';
                const iconSvg = getSkillLogoHtml(skillName);
                pill.innerHTML = `<span>${iconSvg}</span><span>${skillName}</span>`;
                projSkillsLivePills.appendChild(pill);
            });
        }

        // 3-5 Project images unified multi-file accumulator & preview system
        const projImagesInput = document.getElementById('projImages');
        const projImagesPreviewRow = document.getElementById('projImagesPreviewRow');
        const projImagesNotice = document.getElementById('projImagesNotice');

        let projectSlideItems = [];

        function renderProjImagesPreviews() {
            if (!projImagesPreviewRow) return;
            projImagesPreviewRow.innerHTML = '';

            const totalCount = projectSlideItems.length;

            if (projImagesNotice) {
                if (totalCount === 0) {
                    projImagesNotice.textContent = 'Upload 3-5 images for carousel. You can select multiple images at once (Ctrl/Shift) or pick them one-by-one:';
                    projImagesNotice.style.color = 'var(--text-muted)';
                } else {
                    const hasNew = projectSlideItems.some(i => i.type === 'new');
                    const hasExisting = projectSlideItems.some(i => i.type === 'existing');
                    if (hasNew && hasExisting) {
                        projImagesNotice.innerHTML = `✨ <strong>#1 is Primary Thumbnail</strong>. New upload placed at #1 while all previous slides are preserved! Use ◀ / ▶ to change order. (${totalCount} total)`;
                        projImagesNotice.style.color = '#10B981';
                    } else if (totalCount < 3) {
                        projImagesNotice.innerHTML = `⚠️ ${totalCount} image(s) ready (3 to 5 recommended). Click 'Choose Files' to add more. Slide #1 will be the primary thumbnail.`;
                        projImagesNotice.style.color = '#F59E0B';
                    } else {
                        projImagesNotice.innerHTML = `✓ ${totalCount} images ready for carousel. Slide #1 is the primary thumbnail shown on the website.`;
                        projImagesNotice.style.color = '#10B981';
                    }
                }
            }

            projectSlideItems.forEach((item, idx) => {
                const isPrimary = (idx === 0);
                const isNew = (item.type === 'new');
                
                let imgUrl = '';
                let fileName = '';
                let metaTagHtml = '';
                let sizeInfo = '';

                if (isNew) {
                    imgUrl = item.objectUrl || URL.createObjectURL(item.file);
                    fileName = item.file.name;
                    metaTagHtml = isPrimary ? '<span class="preview-tag primary-tag">★ New Primary</span>' : '<span class="preview-tag new-tag">New Upload</span>';
                    sizeInfo = formatFileSize(item.file.size);
                } else {
                    imgUrl = '/' + (item.slide.webp || item.slide.png || 'assets/images/profile.jpg');
                    fileName = (item.slide.webp || item.slide.png || '').split('/').pop() || `Slide #${idx + 1}`;
                    metaTagHtml = isPrimary ? '<span class="preview-tag primary-tag">★ Primary Slide</span>' : '<span class="preview-tag existing-tag">✓ Preserved</span>';
                    sizeInfo = 'Preserved';
                }

                const card = document.createElement('div');
                card.className = `admin-preview-file-card ${isPrimary ? 'is-primary' : ''} ${isNew ? 'new-upload' : 'existing-slide'}`;
                card.innerHTML = `
                    <div class="preview-card-thumb">
                        <img src="${imgUrl}" alt="${fileName}" />
                        <span class="preview-badge-num ${isPrimary ? 'primary-badge' : ''}">${isPrimary ? '★ #1' : '#' + (idx + 1)}</span>
                    </div>
                    <div class="preview-card-info">
                        <div class="preview-card-name" title="${fileName}">${fileName}</div>
                        <div class="preview-card-meta">
                            ${metaTagHtml}
                            <span class="preview-size">${sizeInfo}</span>
                        </div>
                    </div>
                    <div class="preview-card-controls">
                        ${idx > 0 ? `<button type="button" class="btn-move-preview" title="Move Left (Make Primary / Earlier)" onclick="moveProjectSlide(${idx}, -1)">◀</button>` : ''}
                        ${idx < projectSlideItems.length - 1 ? `<button type="button" class="btn-move-preview" title="Move Right" onclick="moveProjectSlide(${idx}, 1)">▶</button>` : ''}
                        <button type="button" class="btn-remove-preview" title="Remove this slide" onclick="removeProjectSlide(${idx})">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                `;
                projImagesPreviewRow.appendChild(card);
            });
        }

        window.moveProjectSlide = function(index, delta) {
            const target = index + delta;
            if (target < 0 || target >= projectSlideItems.length) return;
            const temp = projectSlideItems[index];
            projectSlideItems[index] = projectSlideItems[target];
            projectSlideItems[target] = temp;
            renderProjImagesPreviews();
        };

        window.removeProjectSlide = function(index) {
            projectSlideItems.splice(index, 1);
            renderProjImagesPreviews();
        };

        // Backward-compat aliases
        window.removeProjectFile = function(index) {
            removeProjectSlide(index);
        };
        window.removeProjectExistingSlide = function(index) {
            removeProjectSlide(index);
        };

        if (projImagesInput) {
            projImagesInput.addEventListener('change', () => {
                const files = Array.from(projImagesInput.files || []);
                files.forEach(f => {
                    const alreadyExists = projectSlideItems.some(i => i.type === 'new' && i.file.name === f.name && i.file.size === f.size);
                    if (!alreadyExists) {
                        // Prepend newly selected files to FRONT so they become Primary Slide #1 immediately!
                        projectSlideItems.unshift({
                            type: 'new',
                            file: f,
                            objectUrl: URL.createObjectURL(f)
                        });
                    }
                });
                projImagesInput.value = '';
                renderProjImagesPreviews();
            });
        }

        function editProject(id) {
            const project = (PORTFOLIO_DATA.projects || []).find(p => p.id === id);
            if (!project) return;

            document.getElementById('projId').value = project.id;
            document.getElementById('projTitle').value = project.title || '';
            document.getElementById('projCategory').value = project.categoryBadge || '';
            document.getElementById('projCode').value = project.codeUrl || '';
            document.getElementById('projDemo').value = project.demoUrl || '';
            document.getElementById('projDesc').value = project.description || '';

            // Format skills
            const skillsStr = (project.skills || []).map(s => typeof s === 'string' ? s : (s.name || '')).join(', ');
            document.getElementById('projSkills').value = skillsStr;
            updateProjSkillsPreview();

            // Populate existing slides
            projectSlideItems = (project.slides || []).map(s => ({
                type: 'existing',
                slide: s
            }));
            if (projImagesInput) projImagesInput.value = '';
            renderProjImagesPreviews();

            // Update submit button & show cancel
            const submitBtn = document.getElementById('projectSubmitBtn');
            if (submitBtn) submitBtn.innerHTML = '<span>💾 Save Project Changes</span>';
            const cancelBtn = document.getElementById('projectCancelBtn');
            if (cancelBtn) cancelBtn.style.display = 'inline-flex';

            // Scroll to form
            document.getElementById('projectForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function cancelProjectEdit() {
            document.getElementById('projectForm').reset();
            document.getElementById('projId').value = '';
            projectSlideItems = [];
            if (projImagesInput) projImagesInput.value = '';
            renderProjImagesPreviews();
            if (projSkillsLivePills) projSkillsLivePills.innerHTML = '';
            const submitBtn = document.getElementById('projectSubmitBtn');
            if (submitBtn) submitBtn.innerHTML = '<span>💾 Publish Project to Portfolio</span>';
            const cancelBtn = document.getElementById('projectCancelBtn');
            if (cancelBtn) cancelBtn.style.display = 'none';
        }

        document.getElementById('projectForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = new FormData();
            const projId = document.getElementById('projId').value;
            if (projId) form.append('id', projId);

            form.append('title', document.getElementById('projTitle').value);
            form.append('categoryBadge', document.getElementById('projCategory').value);
            form.append('description', document.getElementById('projDesc').value);
            form.append('skills', document.getElementById('projSkills').value);
            form.append('codeUrl', document.getElementById('projCode').value);
            form.append('demoUrl', document.getElementById('projDemo').value);

            // Separate new files, existing preserved slides, and exact order plan
            const newFiles = [];
            const existingSlides = [];
            const slideOrderPlan = [];

            projectSlideItems.forEach(item => {
                if (item.type === 'new') {
                    const currentIdx = newFiles.length;
                    newFiles.push(item.file);
                    slideOrderPlan.push(`new:${currentIdx}`);
                } else if (item.type === 'existing') {
                    const currentIdx = existingSlides.length;
                    existingSlides.push(item.slide);
                    slideOrderPlan.push(`existing:${currentIdx}`);
                }
            });

            newFiles.forEach(f => form.append('images', f));
            form.append('existingSlidesJson', JSON.stringify(existingSlides));
            form.append('slideOrderPlanJson', JSON.stringify(slideOrderPlan));

            try {
                const res = await fetch('/api/admin/projects', { method: 'POST', body: form });
                const d = await res.json();
                if (d.success) {
                    showNotify(projId ? 'Project updated successfully! Newly uploaded item set as primary.' : 'Project published successfully to portfolio!');
                    cancelProjectEdit();
                    loadData();
                } else {
                    showNotify(d.message || 'Error saving project', false);
                }
            } catch (err) {
                showNotify('Failed to publish project', false);
            }
        });

        async function deleteProject(id) {
            if (!confirm('Are you sure you want to delete this project from the live portfolio?')) return;
            try {
                const res = await fetch('/api/admin/projects/' + id, { method: 'DELETE' });
                const d = await res.json();
                if (d.success) {
                    showNotify('Project deleted successfully');
                    loadData();
                }
            } catch (err) {
                showNotify('Failed to delete project', false);
            }
        }

        // =========================================================================
        // 2. Certificates Management (with Edit & Free-Text Category)
        // =========================================================================
        function renderCertificates() {
            const list = document.getElementById('certsList');
            if (!list) return;
            list.innerHTML = '';

            const certs = PORTFOLIO_DATA.certificates || [];
            if (certs.length === 0) {
                list.innerHTML = '<div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); padding: 1rem;">No certificates yet.</div>';
                return;
            }

            certs.forEach(c => {
                const card = document.createElement('div');
                card.className = 'admin-item-card';

                card.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <div class="admin-card-header">
                            <span class="tech-chip" style="color: #FF2D95; border-color: rgba(255, 45, 149, 0.35);">
                                ${c.date || '2024'}
                            </span>
                            <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted);">
                                ${c.category || 'General'}
                            </span>
                        </div>
                        <h4 class="admin-card-title">${c.title}</h4>
                        <p style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--color-cyan, #00F2FE); margin: 0;">
                            ${c.issuer}
                        </p>
                        <p class="admin-card-desc">${c.description || ''}</p>
                    </div>

                    <div class="admin-card-footer">
                        ${c.credentialUrl ? `<a href="${c.credentialUrl}" target="_blank" class="sidebar-admin-link" style="font-size: 10px;">Verify &nearr;</a>` : '<span></span>'}
                        <div style="display: flex; gap: 6px; align-items: center;">
                            <button type="button" onclick="editCert('${c.id}')" class="btn-action-icon btn-edit-cyber" title="Edit Certificate" aria-label="Edit Certificate">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button type="button" onclick="deleteCert('${c.id}')" class="btn-action-icon btn-delete-cyber" title="Delete Certificate" aria-label="Delete Certificate">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                `;
                list.appendChild(card);
            });
        }

        // Certificate badge image preview state & handling
        let certSelectedFile = null;
        let certExistingImage = '';
        const certImageInput = document.getElementById('certImage');
        const certImagePreviewRow = document.getElementById('certImagePreviewRow');

        function renderCertImagePreview() {
            if (!certImagePreviewRow) return;
            certImagePreviewRow.innerHTML = '';

            if (certSelectedFile) {
                const objUrl = URL.createObjectURL(certSelectedFile);
                const card = document.createElement('div');
                card.className = 'admin-single-card';
                card.innerHTML = `
                    <div class="single-card-thumb">
                        <img src="${objUrl}" alt="${certSelectedFile.name}" />
                    </div>
                    <div class="single-card-info">
                        <div class="single-card-title" title="${certSelectedFile.name}">${certSelectedFile.name}</div>
                        <div class="single-card-meta">
                            <span class="preview-tag new-tag">Badge Image</span>
                            <span class="single-card-size">${formatFileSize(certSelectedFile.size)}</span>
                            <span class="single-card-status">✓ Ready to upload</span>
                        </div>
                    </div>
                    <button type="button" class="btn-remove-single" title="Remove image" onclick="removeCertImage()">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        <span>Remove</span>
                    </button>
                `;
                certImagePreviewRow.appendChild(card);
            } else if (certExistingImage) {
                const imgUrl = '/' + certExistingImage;
                const fname = certExistingImage.split('/').pop() || 'Certificate Badge';
                const card = document.createElement('div');
                card.className = 'admin-single-card';
                card.innerHTML = `
                    <div class="single-card-thumb">
                        <img src="${imgUrl}" alt="${fname}" />
                    </div>
                    <div class="single-card-info">
                        <div class="single-card-title" title="${fname}">${fname}</div>
                        <div class="single-card-meta">
                            <span class="preview-tag existing-tag">Active Badge</span>
                            <span class="single-card-size">Saved on Server</span>
                            <span class="single-card-status">✓ Live Image</span>
                        </div>
                    </div>
                    <button type="button" class="btn-remove-single" title="Remove badge image" onclick="removeCertImage()">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        <span>Remove</span>
                    </button>
                `;
                certImagePreviewRow.appendChild(card);
            }
        }

        window.removeCertImage = function() {
            certSelectedFile = null;
            certExistingImage = '';
            if (certImageInput) certImageInput.value = '';
            renderCertImagePreview();
        };

        if (certImageInput) {
            certImageInput.addEventListener('change', () => {
                if (certImageInput.files && certImageInput.files[0]) {
                    certSelectedFile = certImageInput.files[0];
                } else {
                    certSelectedFile = null;
                }
                renderCertImagePreview();
            });
        }

        function editCert(id) {
            const cert = (PORTFOLIO_DATA.certificates || []).find(c => c.id === id);
            if (!cert) return;

            document.getElementById('certId').value = cert.id;
            document.getElementById('certTitle').value = cert.title || '';
            document.getElementById('certIssuer').value = cert.issuer || '';
            document.getElementById('certDate').value = cert.date || '';
            document.getElementById('certCategory').value = cert.category || '';
            document.getElementById('certUrl').value = cert.credentialUrl || '';
            document.getElementById('certDesc').value = cert.description || '';

            certSelectedFile = null;
            certExistingImage = cert.image || '';
            if (certImageInput) certImageInput.value = '';
            renderCertImagePreview();

            const submitBtn = document.getElementById('certSubmitBtn');
            if (submitBtn) submitBtn.innerHTML = '<span>💾 Save Certificate Changes</span>';
            const cancelBtn = document.getElementById('certCancelBtn');
            if (cancelBtn) cancelBtn.style.display = 'inline-flex';

            document.getElementById('certForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function cancelCertEdit() {
            document.getElementById('certForm').reset();
            document.getElementById('certId').value = '';
            certSelectedFile = null;
            certExistingImage = '';
            if (certImageInput) certImageInput.value = '';
            renderCertImagePreview();
            const submitBtn = document.getElementById('certSubmitBtn');
            if (submitBtn) submitBtn.innerHTML = '<span>📜 Publish Certificate</span>';
            const cancelBtn = document.getElementById('certCancelBtn');
            if (cancelBtn) cancelBtn.style.display = 'none';
        }

        document.getElementById('certForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = new FormData();
            const certId = document.getElementById('certId').value;
            if (certId) form.append('id', certId);

            form.append('title', document.getElementById('certTitle').value);
            form.append('issuer', document.getElementById('certIssuer').value);
            form.append('date', document.getElementById('certDate').value);
            form.append('category', document.getElementById('certCategory').value);
            form.append('credentialUrl', document.getElementById('certUrl').value);
            form.append('description', document.getElementById('certDesc').value);

            if (certSelectedFile) {
                form.append('image', certSelectedFile);
            } else if (certExistingImage) {
                form.append('existingImage', certExistingImage);
            } else {
                form.append('existingImage', '');
            }

            try {
                const res = await fetch('/api/admin/certificates', { method: 'POST', body: form });
                const d = await res.json();
                if (d.success) {
                    showNotify(certId ? 'Certificate updated successfully!' : 'Certificate published successfully!');
                    cancelCertEdit();
                    loadData();
                } else {
                    showNotify(d.message || 'Error saving certificate', false);
                }
            } catch (err) {
                showNotify('Failed to publish certificate', false);
            }
        });

        async function deleteCert(id) {
            if (!confirm('Are you sure you want to delete this certificate?')) return;
            try {
                const res = await fetch('/api/admin/certificates/' + id, { method: 'DELETE' });
                const d = await res.json();
                if (d.success) {
                    showNotify('Certificate deleted');
                    loadData();
                }
            } catch (err) {
                showNotify('Failed to delete certificate', false);
            }
        }

        // =========================================================================
        // 3. Skills & Logos Management (with Category Edit & 60+ Official SVGs)
        // =========================================================================
        function renderSkills() {
            const list = document.getElementById('skillsCategoriesList');
            if (!list) return;
            list.innerHTML = '';

            const datalist = document.getElementById('skillCategoriesDatalist');
            if (datalist) {
                datalist.innerHTML = '';
            }

            const skills = PORTFOLIO_DATA.skills || [];
            skills.forEach(cat => {
                const catName = cat.category || 'Custom Skills';
                
                // Add to datalist
                if (datalist) {
                    const opt = document.createElement('option');
                    opt.value = catName;
                    datalist.appendChild(opt);
                }

                const box = document.createElement('div');
                box.className = 'admin-item-card';

                let pillsHtml = '';
                (cat.skills || []).forEach(s => {
                    const svgContent = s.svg || getSkillLogoHtml(s.name, AVAILABLE_LOGOS[s.key]);
                    pillsHtml += `
                        <span class="skill-pill" style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; font-size: 0.72rem; font-family: var(--font-mono); margin: 3px;">
                            <span style="display: flex; align-items: center; width: 16px; height: 16px;">${svgContent}</span>
                            <span class="skill-pill-text">${s.name}</span>
                            <button onclick="deleteSkill('${catName}', '${s.name}')" class="skill-delete-tag-btn" title="Remove Skill">
                                &times;
                            </button>
                        </span>
                    `;
                });

                box.innerHTML = `
                    <div class="admin-card-header" style="padding-bottom: 0.5rem; border-bottom: var(--border-card);">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <h4 class="admin-card-title">${catName}</h4>
                            <span class="tech-chip" style="color: var(--color-cyan, #00F2FE); font-size: 10px;">${cat.badge || 'PRO'}</span>
                        </div>
                        <div style="display: flex; gap: 6px; align-items: center;">
                            <button type="button" onclick="editSkillCategory('${catName}', '${cat.badge || '85%'}')" class="btn-action-icon btn-edit-cyber" title="Edit Category" aria-label="Edit Category">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button type="button" onclick="deleteSkillCategory('${catName}')" class="btn-action-icon btn-delete-cyber" title="Delete Category" aria-label="Delete Category">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 4px; padding-top: 0.5rem;">
                        ${pillsHtml || '<span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">No skills added.</span>'}
                    </div>
                `;
                list.appendChild(box);
            });
        }

        async function editSkillCategory(oldName, oldBadge) {
            const newName = prompt('Enter new category name:', oldName);
            if (newName === null) return;
            const newBadge = prompt('Enter category mastery badge (e.g. 90%, PRO, ADVANCED):', oldBadge || '85%');
            if (newBadge === null) return;

            try {
                const res = await fetch('/api/admin/skill-category', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ oldCategory: oldName, newCategory: newName.trim(), badge: newBadge.trim() })
                });
                const d = await res.json();
                if (d.success) {
                    showNotify('Category updated successfully');
                    loadData();
                } else {
                    showNotify(d.message || 'Error updating category', false);
                }
            } catch (err) {
                showNotify('Failed to update category', false);
            }
        }

        async function deleteSkillCategory(catName) {
            if (!confirm(`Are you sure you want to delete the whole category "${catName}" and all its skills?`)) return;
            try {
                const res = await fetch('/api/admin/skill-category', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ category: catName })
                });
                const d = await res.json();
                if (d.success) {
                    showNotify(`Category "${catName}" removed`);
                    loadData();
                } else {
                    showNotify(d.message || 'Error deleting category', false);
                }
            } catch (err) {
                showNotify('Failed to delete category', false);
            }
        }

        // Real-time SVG Matcher on keypress
        const skillNameInput = document.getElementById('skillName');
        const skillLogoPreview = document.getElementById('skillLogoPreview');
        const skillMatchLabel = document.getElementById('skillMatchLabel');

        if (skillNameInput && skillLogoPreview && skillMatchLabel) {
            skillNameInput.addEventListener('input', () => {
                const val = skillNameInput.value.trim();
                if (!val) {
                    skillLogoPreview.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#00F2FE" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 9h6v6H9z"/></svg>';
                    skillMatchLabel.innerText = 'Type a skill name to test SVG auto-match...';
                    skillMatchLabel.style.color = 'var(--color-cyan, #00F2FE)';
                    return;
                }

                const svg = getSkillLogoHtml(val);
                skillLogoPreview.innerHTML = svg;
                if (!svg.includes('rect x="4" y="4" width="16" height="16"')) {
                    skillMatchLabel.innerText = `Official Vector SVG Matched for "${val}"!`;
                    skillMatchLabel.style.color = '#10B981';
                } else {
                    skillMatchLabel.innerText = `Custom Tech Pill (No official SVG for "${val}")`;
                    skillMatchLabel.style.color = 'var(--color-cyan, #00F2FE)';
                }
            });
        }

        document.getElementById('skillForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const cat = document.getElementById('skillCategory').value.trim();
            const name = document.getElementById('skillName').value.trim();

            try {
                const res = await fetch('/api/admin/skills', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ category: cat, name: name })
                });
                const d = await res.json();
                if (d.success) {
                    showNotify(d.message || 'Skill added successfully!');
                    document.getElementById('skillName').value = '';
                    loadData();
                } else {
                    showNotify(d.message || 'Failed to add skill', false);
                }
            } catch (err) {
                showNotify('Failed to add skill', false);
            }
        });

        async function deleteSkill(category, name) {
            if (!confirm(`Delete skill "${name}" from ${category}?`)) return;
            try {
                const res = await fetch('/api/admin/skills', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ category, name })
                });
                const d = await res.json();
                if (d.success) {
                    showNotify('Skill deleted');
                    loadData();
                } else {
                    showNotify(d.message || 'Failed to delete skill', false);
                }
            } catch (err) {
                showNotify('Failed to delete skill', false);
            }
        }

        // =========================================================================
        // 4. Education Manager (New Feature)
        // =========================================================================
        function renderEducation() {
            const list = document.getElementById('educationList');
            if (!list) return;
            list.innerHTML = '';

            const eduList = PORTFOLIO_DATA.education || [];
            if (eduList.length === 0) {
                list.innerHTML = '<div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); padding: 1rem;">No education milestones published yet.</div>';
                return;
            }

            eduList.forEach(edu => {
                const card = document.createElement('div');
                card.className = 'admin-item-card';

                const colorDotMap = {
                    cyan: '#00F2FE',
                    blue: '#38BDF8',
                    purple: '#A855F7',
                    pink: '#FF2D95',
                    green: '#10B981'
                };
                const dotColor = colorDotMap[edu.color] || '#00F2FE';

                card.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 0.65rem; flex: 1 1 auto;">
                        <div class="admin-card-header">
                            <span class="tech-chip" style="color: ${dotColor}; border-color: ${dotColor}55;">
                                ${edu.timeline || '2023 - 2027'}
                            </span>
                            <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted);">
                                ${edu.status || 'Completed'}
                            </span>
                        </div>
                        <h4 class="admin-card-title" style="margin: 0; line-height: 1.35;">${edu.degree}</h4>
                        <p style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--color-cyan, #00F2FE); margin: 0;">
                            ${edu.institution}
                        </p>
                        ${edu.grade ? `<p style="font-family: var(--font-mono); font-size: 0.74rem; color: #10B981; margin: 0; font-weight: 600;">${edu.grade}</p>` : ''}
                        <p class="admin-card-desc" style="margin-top: 0.25rem;">${edu.details || ''}</p>
                    </div>

                    <div class="admin-card-footer" style="margin-top: 0.75rem;">
                        ${edu.link ? `<a href="${edu.link}" target="_blank" rel="noopener noreferrer" class="sidebar-admin-link" style="font-size: 11px;">Credentials &nearr;</a>` : '<span></span>'}
                        <div style="display: flex; gap: 6px; align-items: center;">
                            <button type="button" onclick="editEducation('${edu.id}')" class="btn-action-icon btn-edit-cyber" title="Edit Education Milestone" aria-label="Edit Education Milestone">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button type="button" onclick="deleteEducation('${edu.id}')" class="btn-action-icon btn-delete-cyber" title="Delete Education Milestone" aria-label="Delete Education Milestone">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                `;
                list.appendChild(card);
            });
        }

        function editEducation(id) {
            const edu = (PORTFOLIO_DATA.education || []).find(e => e.id === id);
            if (!edu) return;

            document.getElementById('eduId').value = edu.id;
            document.getElementById('eduDegree').value = edu.degree || '';
            document.getElementById('eduInstitution').value = edu.institution || '';
            document.getElementById('eduTimeline').value = edu.timeline || '';
            document.getElementById('eduStatus').value = edu.status || '';
            document.getElementById('eduGrade').value = edu.grade || '';
            document.getElementById('eduColor').value = edu.color || 'cyan';
            document.getElementById('eduLink').value = edu.link || '';
            document.getElementById('eduDetails').value = edu.details || '';

            const submitBtn = document.getElementById('eduSubmitBtn');
            if (submitBtn) submitBtn.innerHTML = '<span>💾 Save Education Changes</span>';
            const cancelBtn = document.getElementById('eduCancelBtn');
            if (cancelBtn) cancelBtn.style.display = 'inline-flex';

            document.getElementById('eduForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function cancelEduEdit() {
            document.getElementById('eduForm').reset();
            document.getElementById('eduId').value = '';
            const submitBtn = document.getElementById('eduSubmitBtn');
            if (submitBtn) submitBtn.innerHTML = '<span>🎓 Publish Education Milestone</span>';
            const cancelBtn = document.getElementById('eduCancelBtn');
            if (cancelBtn) cancelBtn.style.display = 'none';
        }

        const eduForm = document.getElementById('eduForm');
        if (eduForm) {
            eduForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const eduId = document.getElementById('eduId').value;
                const payload = {
                    id: eduId || undefined,
                    degree: document.getElementById('eduDegree').value.trim(),
                    institution: document.getElementById('eduInstitution').value.trim(),
                    timeline: document.getElementById('eduTimeline').value.trim(),
                    status: document.getElementById('eduStatus').value.trim(),
                    grade: document.getElementById('eduGrade').value.trim(),
                    color: document.getElementById('eduColor').value.trim(),
                    link: document.getElementById('eduLink').value.trim(),
                    details: document.getElementById('eduDetails').value.trim()
                };

                try {
                    const res = await fetch('/api/admin/education', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const d = await res.json();
                    if (d.success) {
                        showNotify(eduId ? 'Education milestone updated successfully!' : 'Education milestone published!');
                        cancelEduEdit();
                        loadData();
                    } else {
                        showNotify(d.message || 'Error saving education milestone', false);
                    }
                } catch (err) {
                    showNotify('Failed to save education milestone', false);
                }
            });
        }

        async function deleteEducation(id) {
            if (!confirm('Are you sure you want to delete this education milestone?')) return;
            try {
                const res = await fetch('/api/admin/education/' + id, { method: 'DELETE' });
                const d = await res.json();
                if (d.success) {
                    showNotify('Education milestone deleted');
                    loadData();
                } else {
                    showNotify(d.message || 'Failed to delete education milestone', false);
                }
            } catch (err) {
                showNotify('Failed to delete education milestone', false);
            }
        }

        // =========================================================================
        // 5. Resume Management
        // =========================================================================
        let resumeSelectedFile = null;
        const resumePdfInput = document.getElementById('resumePdf');
        const resumePdfPreviewRow = document.getElementById('resumePdfPreviewRow');

        function renderResumePdfPreview() {
            if (!resumePdfPreviewRow) return;
            resumePdfPreviewRow.innerHTML = '';

            if (resumeSelectedFile) {
                const card = document.createElement('div');
                card.className = 'admin-single-card pdf-card';
                card.innerHTML = `
                    <div class="single-card-thumb pdf-thumb">
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                    </div>
                    <div class="single-card-info">
                        <div class="single-card-title" title="${resumeSelectedFile.name}">${resumeSelectedFile.name}</div>
                        <div class="single-card-meta">
                            <span class="preview-tag pdf-tag">PDF Document</span>
                            <span class="single-card-size">${formatFileSize(resumeSelectedFile.size)}</span>
                            <span class="single-card-status">✓ Ready to deploy</span>
                        </div>
                    </div>
                    <button type="button" class="btn-remove-single" title="Remove selected PDF" onclick="removeResumePdf()">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        <span>Remove</span>
                    </button>
                `;
                resumePdfPreviewRow.appendChild(card);
            } else {
                const r = PORTFOLIO_DATA.resume || {};
                const filePath = r.filePath || 'assets/resume.pdf';
                const card = document.createElement('div');
                card.className = 'admin-single-card pdf-card';
                card.innerHTML = `
                    <div class="single-card-thumb pdf-thumb">
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                    </div>
                    <div class="single-card-info">
                        <div class="single-card-title" title="Live Resume (${filePath})">Live Portfolio Resume (${filePath})</div>
                        <div class="single-card-meta">
                            <span class="preview-tag existing-tag">Deployed PDF</span>
                            <span class="single-card-size">Updated: ${r.lastUpdated || 'Current'}</span>
                            <span class="single-card-status">✓ Active on Site</span>
                        </div>
                    </div>
                    <a href="/${filePath}" target="_blank" class="btn-view-single" title="View Current PDF">
                        <span>View &nearr;</span>
                    </a>
                `;
                resumePdfPreviewRow.appendChild(card);
            }
        }

        window.removeResumePdf = function() {
            resumeSelectedFile = null;
            if (resumePdfInput) resumePdfInput.value = '';
            renderResumePdfPreview();
        };

        if (resumePdfInput) {
            resumePdfInput.addEventListener('change', () => {
                if (resumePdfInput.files && resumePdfInput.files[0]) {
                    resumeSelectedFile = resumePdfInput.files[0];
                } else {
                    resumeSelectedFile = null;
                }
                renderResumePdfPreview();
            });
        }

        function renderResume() {
            const r = PORTFOLIO_DATA.resume || {};
            if (r.driveUrl) {
                document.getElementById('resumeDriveUrl').value = r.driveUrl;
            }
            renderResumePdfPreview();
        }

        document.getElementById('resumeForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = new FormData();
            form.append('driveUrl', document.getElementById('resumeDriveUrl').value);
            if (resumeSelectedFile) {
                form.append('resume', resumeSelectedFile);
            }

            try {
                const res = await fetch('/api/admin/resume', { method: 'POST', body: form });
                const d = await res.json();
                if (d.success) {
                    showNotify('Resume deployed successfully!');
                    resumeSelectedFile = null;
                    if (resumePdfInput) resumePdfInput.value = '';
                    renderResumePdfPreview();
                    loadData();
                } else {
                    showNotify(d.message || 'Error deploying resume', false);
                }
            } catch (err) {
                showNotify('Failed to deploy resume', false);
            }
        });

        // --- Mobile Drawer Handlers ---
        const drawerOpenBtn = document.getElementById('mobileDrawerOpenBtn');
        const drawerCloseBtn = document.getElementById('mobileDrawerCloseBtn');
        const sidebar = document.getElementById('notebookSidebar');

        if (drawerOpenBtn && sidebar) {
            drawerOpenBtn.addEventListener('click', () => {
                sidebar.classList.add('drawer-open');
            });
        }
        if (drawerCloseBtn && sidebar) {
            drawerCloseBtn.addEventListener('click', () => {
                sidebar.classList.remove('drawer-open');
            });
        }

        // Check URL Hash for deep linking
        window.addEventListener('DOMContentLoaded', () => {
            initTheme();
            const hash = window.location.hash.replace('#', '');
            if (hash && ['projects', 'certificates', 'skills', 'education', 'resume'].includes(hash)) {
                switchPage(hash);
            }
            checkAuth();
        });
