/* ==========================================================================
   SUBHANKAR GIRI PORTFOLIO - ADMIN STUDIO ENGINE (admin.js)
   ========================================================================== */

let PORTFOLIO_DATA = { projects: [], certificates: [], resume: {}, skills: [], education: [], experience: [] };
        let AVAILABLE_LOGOS = {};

        // --- Theme Engine Initialization (Matches script.js) ---
        function initTheme() {
            const desktopToggle = document.getElementById('desktopThemeToggle');
            const mobileToggle = document.getElementById('mobileThemeToggle');
            const themeLabel = document.getElementById('themeLabel');
            const themeContainers = document.querySelectorAll('.theme-switch-container');

            // Default theme is strictly DARK, respecting saved explicit user toggle
            const savedTheme = localStorage.getItem('sg_portfolio_theme');
            const initialTheme = (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';

            setTheme(initialTheme);

            function toggleTheme(e) {
                if (e && typeof e.preventDefault === 'function') {
                    e.preventDefault();
                }
                if (e && typeof e.stopPropagation === 'function') {
                    e.stopPropagation();
                }
                const current = document.documentElement.getAttribute('data-theme') || 'dark';
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

        // Restore active session token if present; do not kick user out on refresh
        const existingSessionToken = sessionStorage.getItem('sg_admin_token');
        let isKernelAuthenticated = Boolean(existingSessionToken && existingSessionToken.length > 10);

        // --- Authentication Handler ---
        function checkAuth() {
            const overlay = document.getElementById('loginOverlay');
            if (isKernelAuthenticated) {
                if (overlay) overlay.classList.add('hidden');
                renderFromLocalCache();
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

        
        // Password visibility toggle handler
        const togglePwdBtn = document.getElementById('togglePasswordBtn');
        const loginPwdInput = document.getElementById('loginPassword');
        const eyeOpen = document.getElementById('eyeIconOpen');
        const eyeClosed = document.getElementById('eyeIconClosed');

        if (togglePwdBtn && loginPwdInput) {
            togglePwdBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const isPassword = loginPwdInput.type === 'password';
                loginPwdInput.type = isPassword ? 'text' : 'password';
                if (eyeOpen && eyeClosed) {
                    eyeOpen.style.display = isPassword ? 'none' : 'block';
                    eyeClosed.style.display = isPassword ? 'block' : 'none';
                }
                togglePwdBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
                loginPwdInput.focus();
            });
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
                    if (window.PORTFOLIO_DATA) {
                        localStorage.setItem('sg_portfolio_data', JSON.stringify(window.PORTFOLIO_DATA));
                    }
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
        function renderFromLocalCache() {
            try {
                const cachedLogos = localStorage.getItem('sg_skill_logos');
                if (cachedLogos && (!AVAILABLE_LOGOS || Object.keys(AVAILABLE_LOGOS).length === 0)) {
                    AVAILABLE_LOGOS = JSON.parse(cachedLogos) || {};
                }
                const saved = localStorage.getItem('sg_portfolio_data');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (data && (data.projects || data.certificates || data.skills || data.education || data.experience)) {
                        PORTFOLIO_DATA = data;
                        window.PORTFOLIO_DATA = PORTFOLIO_DATA;
                        renderProjects();
                        renderCertificates();
                        renderSkills();
                        renderEducation();
                        renderExperience();
                        renderResume();
                        return true;
                    }
                }
            } catch (e) {}
            return false;
        }

        async function loadData() {
            // Instant 0ms render from cache on startup
            if (!window._initialCacheRendered) {
                window._initialCacheRendered = renderFromLocalCache();
            }

            const statusDot = document.getElementById('statusDot');
            const statusText = document.getElementById('statusText');
            if (statusDot) statusDot.className = 'status-indicator-dot busy';
            if (statusText) statusText.textContent = 'Python 3 | syncing...';

            try {
                // 1. Skill Logos: Fetch once and cache in memory & localStorage (no redundant roundtrips)
                let logoPromise = Promise.resolve(null);
                if (!window._logosLoaded && (!AVAILABLE_LOGOS || Object.keys(AVAILABLE_LOGOS).length === 0)) {
                    logoPromise = fetch('/api/skill-logos?_t=' + Date.now(), { cache: 'no-store' })
                        .then(r => r.ok ? r.json() : null)
                        .catch(() => null);
                }

                // 2. Fetch fresh portfolio data in parallel
                const dataPromise = fetch('/api/portfolio-data?_t=' + Date.now(), { cache: 'no-store' })
                    .then(r => r.ok ? r.json() : null)
                    .catch(() => null);

                const [lData, freshData] = await Promise.all([logoPromise, dataPromise]);

                if (lData && lData.logos) {
                    AVAILABLE_LOGOS = lData.logos;
                    window._logosLoaded = true;
                    try { localStorage.setItem('sg_skill_logos', JSON.stringify(AVAILABLE_LOGOS)); } catch (e) {}
                }

                if (freshData) {
                    PORTFOLIO_DATA = freshData;
                    window.PORTFOLIO_DATA = PORTFOLIO_DATA;
                    try {
                        localStorage.setItem('sg_portfolio_data', JSON.stringify(PORTFOLIO_DATA));
                        localStorage.setItem('sg_portfolio_updated', String(Date.now()));
                    } catch (e) {}
                } else if (!window._initialCacheRendered) {
                    renderFromLocalCache();
                }

                renderProjects();
                renderCertificates();
                renderSkills();
                renderEducation();
                renderExperience();
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

        function escapeHtml(str) {
            if (str === null || str === undefined) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function escapeJs(str) {
            if (str === null || str === undefined) return '';
            return String(str)
                .replace(/\\/g, '\\\\')
                .replace(/'/g, "\\'")
                .replace(/"/g, '\\"');
        }

        // Helper to match skill logos
        function getSkillLogoHtml(skillName, customSvg) {
            if (customSvg) return customSvg;
            const clean = (skillName || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            const keyMap = {
                'pytorch': 'pytorch', 'torch': 'pytorch', 'python': 'python', 'tensorflow': 'tensorflow', 'tf': 'tensorflow',
                'keras': 'keras', 'pandas': 'pandas', 'numpy': 'numpy', 'scikit': 'scikit-learn', 'scikitlearn': 'scikit-learn', 'sklearn': 'scikit-learn',
                'knn': 'knn', 'knearestneighbors': 'knn', 'knearestneighbor': 'knn', 'nearestneighbors': 'knn',
                'powerbi': 'powerbi', 'tableau': 'tableau', 'matplotlib': 'matplotlib', 'seaborn': 'seaborn',
                'sql': 'sql', 'mysql': 'mysql', 'postgres': 'postgresql', 'postgresql': 'postgresql', 'sqlite': 'sqlite', 'tkinter': 'tkinter', 'tk': 'tkinter', 'scipy': 'scipy', 'tmdb': 'tmdb', 'tmdbapi': 'tmdb', 'oop': 'oop', 'datastruct': 'datastruct', 'datastructures': 'datastruct', 'reporting': 'reporting', 'automation': 'automation', 'cosinesim': 'cosinesim', 'cosinesimilarity': 'cosinesim', 'tfidf': 'tfidf', 'telematics': 'telematics', 'forecasting': 'forecasting', 'reportlab': 'reportlab', 'machinelearning': 'machinelearning', 'ml': 'machinelearning', 'scikitlearn': 'scikit-learn', 'sklearn': 'scikit-learn',
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
        // Unified Brand Logos Library for Categories, Certificates & Education
        // (Guarantees 100% visual parity between Portfolio and Admin Studio)
        // =========================================================================
        const CATEGORY_BRAND_ICONS = {
            'programming': `<svg class="cat-brand-svg" viewBox="0 0 128 128" width="28" height="28">
                <defs>
                    <linearGradient id="py-hdr-sync-b-adm" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#5A9FD4"/><stop offset="100%" stop-color="#306998"/></linearGradient>
                    <linearGradient id="py-hdr-sync-y-adm" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFD43B"/><stop offset="100%" stop-color="#FFE873"/></linearGradient>
                </defs>
                <path fill="url(#py-hdr-sync-b-adm)" d="M63.391 1.988c-4.222.02-8.252.379-11.8 1.007-10.45 1.846-12.346 5.71-12.346 12.837v9.411h24.693v3.137H29.977c-7.176 0-13.46 4.313-15.426 12.521-2.268 9.405-2.368 15.275 0 25.096 1.755 7.311 5.947 12.519 13.124 12.519h8.491V67.234c0-8.151 7.051-15.34 15.426-15.34h24.665c6.866 0 12.346-5.654 12.346-12.548V15.833c0-6.693-5.646-11.72-12.346-12.837-4.244-.706-8.645-1.027-12.866-1.008zM50.037 9.557c2.55 0 4.634 2.117 4.634 4.721 0 2.593-2.083 4.69-4.634 4.69-2.56 0-4.633-2.097-4.633-4.69-.001-2.604 2.073-4.721 4.633-4.721z" transform="translate(0 10.26)"/>
                <path fill="url(#py-hdr-sync-y-adm)" d="M91.682 28.38v10.966c0 8.5-7.208 15.655-15.426 15.655H51.591c-6.756 0-12.346 5.783-12.346 12.549v23.515c0 6.691 5.818 10.628 12.346 12.547 7.816 2.297 15.312 2.713 24.665 0 6.216-1.801 12.346-5.423 12.346-12.547v-9.412H63.938v-3.138h37.012c7.176 0 9.852-5.005 12.348-12.519 2.578-7.735 2.467-15.174 0-25.096-1.774-7.145-5.161-12.521-12.348-12.521h-9.268zM77.809 87.927c2.561 0 4.634 2.097 4.634 4.692 0 2.602-2.074 4.719-4.634 4.719-2.55 0-4.633-2.117-4.633-4.719 0-2.595 2.083-4.692 4.633-4.692z" transform="translate(0 10.26)"/>
            </svg>`,
            'data analysis': `<svg class="cat-brand-svg" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#00F2FE" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>`,
            'data visualization': `<svg class="cat-brand-svg" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#00F2FE" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>`,
            'machine learning': `<svg class="cat-brand-svg" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#00F2FE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9.5 2A2.5 2.5 0 0 0 7 4.5v.7A4 4 0 0 0 4 9c0 1.4.7 2.6 1.8 3.3A4 4 0 0 0 5 15c0 1.9 1.3 3.5 3.1 3.9A3 3 0 0 0 11 22h2a3 3 0 0 0 2.9-3.1 4 4 0 0 0 3.1-3.9 4 4 0 0 0-.8-2.7 4 4 0 0 0 1.8-3.3 4 4 0 0 0-3-3.8v-.7A2.5 2.5 0 0 0 14.5 2h-5z" stroke="#00F2FE" stroke-width="1.8" fill="rgba(0,242,254,0.1)"/>
                <path d="M12 2v20" stroke="#8B5CF6" stroke-width="1.8"/><circle cx="8" cy="8" r="1.3" fill="#00F2FE" stroke="none"/><circle cx="16" cy="8" r="1.3" fill="#00F2FE" stroke="none"/>
            </svg>`,
            'deep learning': `<svg class="cat-brand-svg" viewBox="58 50 150 168" width="26" height="26">
                <defs>
                    <linearGradient id="tf-hdr-sync-l-adm" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FFA000"/><stop offset="100%" stop-color="#FF6F00"/></linearGradient>
                    <linearGradient id="tf-hdr-sync-r-adm" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF6F00"/><stop offset="100%" stop-color="#E65100"/></linearGradient>
                </defs>
                <polygon points="66.03 95.86 130.5 59.02 130.5 210 104.74 195.04 104.74 106.85 65.94 129.27 66.03 95.86" fill="url(#tf-hdr-sync-l-adm)"/>
                <polygon points="200.76 95.86 136.29 59.02 136.29 210 162.05 195.04 162.05 152.57 181.5 163.82 181.39 134.77 162.05 123.72 162.05 106.85 200.85 129.27 200.76 95.86" fill="url(#tf-hdr-sync-r-adm)"/>
            </svg>`,
            'databases': `<svg class="cat-brand-svg" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#00F2FE" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>`,
            'tools': `<svg class="cat-brand-svg" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#00F2FE" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>`,
            'version control': `<svg class="cat-brand-svg" viewBox="0 0 128 128" width="26" height="26">
                <path fill="#F05032" d="M124.7 58.4L69.6 3.3c-3.2-3.2-8.3-3.2-11.5 0L46.7 14.7l14.5 14.5c3.4-1.1 7.2-.4 9.9 2.3 2.7 2.7 3.5 6.6 2.3 10l14 14c3.4-1.2 7.3-.4 10 2.3 3.8 3.8 3.8 9.9 0 13.7a9.7 9.7 0 01-13.7 0 9.7 9.7 0 01-2.1-10.5L68.6 47.9v34.3a9.7 9.7 0 012.6 1.8c3.8 3.8 3.8 9.9 0 13.7s-9.9 3.8-13.7 0-3.8-9.9 0-13.7a9.7 9.7 0 013.2-2.1V47.3a9.6 9.6 0 01-3.2-2.1c-2.9-2.9-3.6-7.1-2.1-10.6L41.1 20.3 3.3 58.1a8.1 8.1 0 000 11.5l55.1 55.1c3.2 3.2 8.3 3.2 11.5 0l54.8-54.8a8.1 8.1 0 000-11.5z"/>
            </svg>`,
            'deployment & web frameworks': `<svg class="cat-brand-svg" viewBox="0 0 24 24" width="26" height="26">
                <circle cx="12" cy="12" r="10" fill="#009688"/><path d="M12.5 4L6.5 13.5h5L10.5 20l7-10.5h-5.5L12.5 4z" fill="#FFFFFF"/>
            </svg>`
        };

        function getCategoryBrandSvg(catName) {
            const key = (catName || '').trim().toLowerCase();
            if (CATEGORY_BRAND_ICONS[key]) return CATEGORY_BRAND_ICONS[key];
            for (const k in CATEGORY_BRAND_ICONS) {
                if (key.includes(k) || k.includes(key)) return CATEGORY_BRAND_ICONS[k];
            }
            return `<svg class="cat-brand-svg" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#00F2FE" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>
            </svg>`;
        }

        const OFFICIAL_CERT_ICONS = {
            'medal': { color: 'cyan', svg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>` },
            'python': { color: 'blue', svg: `<svg viewBox="0 0 128 128" width="22" height="22" style="flex-shrink:0;"><path fill="#38BDF8" d="M63.391 1.988c-4.222.02-8.252.379-11.8 1.007-10.45 1.846-12.346 5.71-12.346 12.837v9.411h24.693v3.137H29.977c-7.176 0-13.46 4.313-15.426 12.521-2.268 9.405-2.368 15.275 0 25.096 1.755 7.311 5.947 12.519 13.124 12.519h8.491V67.234c0-8.151 7.051-15.34 15.426-15.34h24.665c6.866 0 12.346-5.654 12.346-12.548V15.833c0-6.693-5.646-11.72-12.346-12.837-4.244-.706-8.645-1.027-12.866-1.008zM50.037 9.557c2.55 0 4.634 2.117 4.634 4.721 0 2.593-2.083 4.69-4.634 4.69-2.56 0-4.633-2.097-4.633-4.69-.001-2.604 2.073-4.721 4.633-4.721z" transform="translate(0 10.26)"/><path fill="#FFD43B" d="M91.682 28.38v10.966c0 8.5-7.208 15.655-15.426 15.655H51.591c-6.756 0-12.346 5.783-12.346 12.549v23.515c0 6.691 5.818 10.628 12.346 12.547 7.816 2.297 15.312 2.713 24.665 0 6.216-1.801 12.346-5.423 12.346-12.547v-9.412H63.938v-3.138h37.012c7.176 0 9.852-5.005 12.348-12.519 2.578-7.735 2.467-15.174 0-25.096-1.774-7.145-5.161-12.521-12.348-12.521h-9.268zM77.809 87.927c2.561 0 4.634 2.097 4.634 4.692 0 2.602-2.074 4.719-4.634 4.719-2.55 0-4.633-2.117-4.633-4.719 0-2.595 2.083-4.692 4.633-4.692z" transform="translate(0 10.26)"/></svg>` },
            'sql': { color: 'blue', svg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>` },
            'powerbi': { color: 'orange', svg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="12" width="4" height="8" rx="1"></rect><rect x="10" y="8" width="4" height="12" rx="1"></rect><rect x="17" y="4" width="4" height="16" rx="1"></rect></svg>` },
            'excel': { color: 'green', svg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M8 13l3 4m0-4l-3 4"></path><line x1="14" y1="13" x2="17" y2="13"></line></svg>` },
            'deeplearning': { color: 'purple', svg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M3 9a9 9 0 0 1 9-9 9 9 0 0 1 9 9"></path><path d="M3 15a9 9 0 0 0 9 9 9 9 0 0 0 9-9"></path></svg>` },
            'encoderdecoder': { color: 'cyan', svg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>` },
            'genai': { color: 'orange', svg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path></svg>` },
            'llm': { color: 'cyan', svg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>` }
        };
        // 1-to-1 Aliases
        OFFICIAL_CERT_ICONS['cert-1'] = OFFICIAL_CERT_ICONS['medal'];
        OFFICIAL_CERT_ICONS['cert-2'] = OFFICIAL_CERT_ICONS['python'];
        OFFICIAL_CERT_ICONS['cert-3'] = OFFICIAL_CERT_ICONS['sql'];
        OFFICIAL_CERT_ICONS['cert-4'] = OFFICIAL_CERT_ICONS['powerbi'];
        OFFICIAL_CERT_ICONS['cert-5'] = OFFICIAL_CERT_ICONS['excel'];
        OFFICIAL_CERT_ICONS['cert-6'] = OFFICIAL_CERT_ICONS['deeplearning'];
        OFFICIAL_CERT_ICONS['cert-7'] = OFFICIAL_CERT_ICONS['encoderdecoder'];
        OFFICIAL_CERT_ICONS['cert-8'] = OFFICIAL_CERT_ICONS['genai'];
        OFFICIAL_CERT_ICONS['cert-9'] = OFFICIAL_CERT_ICONS['llm'];

        function getCertificateIconData(cert, idx) {
            if (cert && cert.image) {
                return {
                    color: 'cyan',
                    html: `<img src="/${escapeHtml(cert.image)}" alt="${escapeHtml(cert.title)}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%;" />`
                };
            }
            // Standardized official verified credential emblem across Portfolio & Admin (100% parity)
            return {
                color: (cert && (cert.color || cert.iconColor)) || 'cyan',
                html: OFFICIAL_CERT_ICONS['medal'].svg
            };
        }

        function getEducationIconSvg(degreeName, idx) {
            const clean = (degreeName || '').toLowerCase();
            if (clean.includes('b.tech') || clean.includes('btech') || clean.includes('engineering') || clean.includes('computer science') || clean.includes('bachelor') || clean.includes('college')) {
                return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>`;
            }
            if (clean.includes('+2') || clean.includes('higher secondary') || clean.includes('chse') || clean.includes('intermediate') || clean.includes('12th')) {
                return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>`;
            }
            return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>`;
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

                    <div class="admin-card-footer" style="display: flex; justify-content: space-between; align-items: center; gap: 0.65rem; margin-top: 1rem; padding-top: 0.85rem; border-top: 1px solid rgba(255, 255, 255, 0.08); flex-wrap: wrap;">
                        <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 130px;" title="${escapeHtml(skillsText)}">
                            ${escapeHtml(skillsText)}
                        </span>
                        <div style="display: flex; gap: 0.45rem; align-items: center;">
                            <!-- 1. 3D View Button -->
                            <a href="${p.demoUrl || p.codeUrl || '#'}" target="_blank" class="btn-3d btn-3d-view" title="View Project Live / Source Code">
                                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                <span>View</span>
                            </a>

                            <!-- 2. 3D Edit Button -->
                            <button type="button" onclick="editProject('${p.id}')" class="btn-3d btn-3d-edit" title="Edit Project">
                                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                <span>Edit</span>
                            </button>

                            <!-- 3. 3D Delete Button -->
                            <button type="button" onclick="deleteProject('${p.id}')" class="btn-3d btn-3d-delete" title="Delete Project">
                                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                                <span>Delete</span>
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
            PORTFOLIO_DATA.projects = (PORTFOLIO_DATA.projects || []).filter(p => p.id !== id);
            renderProjects();
            try { localStorage.setItem('sg_portfolio_data', JSON.stringify(PORTFOLIO_DATA)); } catch (e) {}

            try {
                const res = await fetch('/api/admin/projects/' + id, { method: 'DELETE' });
                const d = await res.json();
                if (d.success) {
                    showNotify('Project deleted successfully');
                    loadData();
                } else {
                    showNotify(d.message || 'Failed to delete project', false);
                    loadData();
                }
            } catch (err) {
                showNotify('Failed to delete project', false);
                loadData();
            }
        }

        // =========================================================================
        // 2. Certificates Management (with Edit & Free-Text Category)
        // =========================================================================
        function renderCertificates() {
            const list = document.getElementById('certsList');
            if (!list) return;
            list.innerHTML = '';

            // Populate More Certificates Drive Folder URL
            const folderInput = document.getElementById('moreCertsFolderUrl');
            const folderLink = document.getElementById('moreCertsDrivePreviewLink');
            const folderUrl = PORTFOLIO_DATA.moreCertificatesDriveUrl || PORTFOLIO_DATA.certificatesDriveFolder || '';
            if (folderInput) {
                folderInput.value = folderUrl;
            }
            if (folderLink) {
                if (folderUrl) {
                    folderLink.href = folderUrl;
                    folderLink.style.display = 'inline-flex';
                } else {
                    folderLink.style.display = 'none';
                }
            }

            const certs = PORTFOLIO_DATA.certificates || [];
            if (certs.length === 0) {
                list.innerHTML = '<div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); padding: 1rem;">No certificates yet.</div>';
                return;
            }

            certs.forEach((c, idx) => {
                const card = document.createElement('div');
                card.className = 'admin-item-card';

                const certIcon = getCertificateIconData(c, idx);

                card.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                        <div class="admin-card-header" style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;">
                            <!-- Left: 3D Certificate Logo Emblem matching Portfolio 1:1 -->
                            <div class="cert-logo-3d cert-badge-circle ${certIcon.color}" title="${escapeHtml(c.title)} Official Credential Logo" style="display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 8px; background: rgba(0, 242, 254, 0.08); border: 1px solid rgba(0, 242, 254, 0.25); flex-shrink: 0; box-shadow: 0 4px 12px rgba(0, 242, 254, 0.15);">
                                ${certIcon.html}
                            </div>

                            <!-- Right: Year & Role Badges -->
                            <div style="display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap; justify-content: flex-end;">
                                <span class="tech-chip" style="color: #00F2FE; border-color: rgba(0, 242, 254, 0.4); background: rgba(0, 242, 254, 0.08); font-size: 0.74rem; padding: 0.2rem 0.6rem; font-weight: 700; box-shadow: 0 2px 6px rgba(0, 242, 254, 0.15);">
                                    📅 ${escapeHtml(c.date || '2024')}
                                </span>
                                <span class="tech-chip" style="color: #FF2D95; border-color: rgba(255, 45, 149, 0.4); background: rgba(255, 45, 149, 0.08); font-size: 0.74rem; padding: 0.2rem 0.6rem; font-weight: 700; box-shadow: 0 2px 6px rgba(255, 45, 149, 0.15);">
                                    🎯 ${escapeHtml(c.category || 'General')}
                                </span>
                            </div>
                        </div>

                        <div>
                            <h4 class="admin-card-title" style="margin: 0; font-size: 1.05rem; line-height: 1.35;">${escapeHtml(c.title)}</h4>
                            <p style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--color-cyan, #00F2FE); margin: 3px 0 0 0;">
                                ${escapeHtml(c.issuer)}
                            </p>
                        </div>
                        <p class="admin-card-desc" style="margin: 0;">${escapeHtml(c.description || '')}</p>
                    </div>

                    <div class="admin-card-footer" style="display: flex; justify-content: flex-end; align-items: center; gap: 0.45rem; margin-top: 1rem; padding-top: 0.85rem; border-top: 1px solid rgba(255, 255, 255, 0.08); flex-wrap: wrap;">
                        <!-- 1. 3D View Button -->
                        <a href="${c.credentialUrl || '#'}" target="_blank" class="btn-3d btn-3d-view" title="View Certificate Document">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <span>View</span>
                        </a>

                        <!-- 2. 3D Edit Button -->
                        <button type="button" onclick="editCert('${c.id}')" class="btn-3d btn-3d-edit" title="Edit Certificate">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            <span>Edit</span>
                        </button>

                        <!-- 3. 3D Delete Button -->
                        <button type="button" onclick="deleteCert('${c.id}')" class="btn-3d btn-3d-delete" title="Delete Certificate">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                            <span>Delete</span>
                        </button>
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
            PORTFOLIO_DATA.certificates = (PORTFOLIO_DATA.certificates || []).filter(c => c.id !== id);
            renderCertificates();
            try { localStorage.setItem('sg_portfolio_data', JSON.stringify(PORTFOLIO_DATA)); } catch (e) {}

            try {
                const res = await fetch('/api/admin/certificates/' + id, { method: 'DELETE' });
                const d = await res.json();
                if (d.success) {
                    showNotify('Certificate deleted');
                    loadData();
                } else {
                    showNotify(d.message || 'Failed to delete certificate', false);
                    loadData();
                }
            } catch (err) {
                showNotify('Failed to delete certificate', false);
                loadData();
            }
        }

        // =========================================================================
        // 3. Skills & Logos Management (with In-Place Category Card Edit & Live SVGs)
        // =========================================================================
        let editingSkillCatIdx = null;

        function openSkillCategoryEdit(catIdx) {
            editingSkillCatIdx = catIdx;
            renderSkills();
            setTimeout(() => {
                const input = document.getElementById(`editCatName_${catIdx}`);
                if (input) {
                    input.focus();
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 60);
        }

        function cancelSkillCategoryEdit() {
            editingSkillCatIdx = null;
            renderSkills();
        }

        function removeSkillFromEdit(catIdx, skillNameToRemove) {
            const textarea = document.getElementById(`editCatSkills_${catIdx}`);
            if (!textarea) return;
            const items = textarea.value.split(',').map(s => s.trim()).filter(Boolean);
            const filtered = items.filter(s => s.toLowerCase() !== (skillNameToRemove || '').toLowerCase());
            textarea.value = filtered.join(', ');
            updateEditSkillsPreview(catIdx);
        }

        function updateEditSkillsPreview(catIdx) {
            const textarea = document.getElementById(`editCatSkills_${catIdx}`);
            const previewContainer = document.getElementById(`editCatPreview_${catIdx}`);
            const countBadge = document.getElementById(`editCatCount_${catIdx}`);
            if (!textarea || !previewContainer) return;

            const raw = textarea.value;
            const items = raw.split(',').map(s => s.trim()).filter(Boolean);
            if (countBadge) {
                countBadge.textContent = `${items.length} skill${items.length === 1 ? '' : 's'}`;
            }

            if (items.length === 0) {
                previewContainer.innerHTML = '<span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono); font-style: italic;">No skills typed yet. Separate skills with commas (e.g. Python, SQL, Docker).</span>';
                return;
            }

            let html = '';
            items.forEach(name => {
                const svg = getSkillLogoHtml(name);
                html += `
                    <span class="skill-pill">
                        <span class="skill-icon-wrap">${svg}</span>
                        <span class="skill-pill-text">${escapeHtml(name)}</span>
                        <button type="button" onclick="removeSkillFromEdit(${catIdx}, '${escapeJs(name)}')" class="skill-delete-tag-btn" title="Remove ${escapeHtml(name)} from category">
                            &times;
                        </button>
                    </span>
                `;
            });
            previewContainer.innerHTML = html;
        }

        /* -------------------------------------------------------------
           Inline Proficiency Percentage Helpers (Edit Mode)
           ------------------------------------------------------------- */
        function onInlinePctSliderChange(catIdx, val) {
            const textInput = document.getElementById(`editCatBadge_${catIdx}`);
            const displaySpan = document.getElementById(`editCatBadgeDisplay_${catIdx}`);
            const formatted = `${val}%`;
            if (textInput) textInput.value = formatted;
            if (displaySpan) displaySpan.textContent = formatted;
            highlightInlinePctChips(catIdx, val);
        }

        function onInlinePctInputChange(catIdx, val) {
            const slider = document.getElementById(`editCatBadgeSlider_${catIdx}`);
            const displaySpan = document.getElementById(`editCatBadgeDisplay_${catIdx}`);
            if (displaySpan) displaySpan.textContent = val || '0%';
            const num = parseInt(val);
            if (!isNaN(num) && num >= 50 && num <= 100) {
                if (slider) slider.value = num;
                highlightInlinePctChips(catIdx, num);
            }
        }

        function setInlinePctPreset(catIdx, val) {
            const textInput = document.getElementById(`editCatBadge_${catIdx}`);
            const slider = document.getElementById(`editCatBadgeSlider_${catIdx}`);
            const displaySpan = document.getElementById(`editCatBadgeDisplay_${catIdx}`);
            const formatted = `${val}%`;
            if (textInput) textInput.value = formatted;
            if (slider) slider.value = val;
            if (displaySpan) displaySpan.textContent = formatted;
            highlightInlinePctChips(catIdx, val);
        }

        function highlightInlinePctChips(catIdx, val) {
            const container = document.getElementById(`editCatBadgePresets_${catIdx}`);
            if (!container) return;
            const chips = container.querySelectorAll('.pct-preset-chip');
            chips.forEach(c => {
                if (parseInt(c.textContent) === parseInt(val)) {
                    c.classList.add('active');
                } else {
                    c.classList.remove('active');
                }
            });
        }

        /* -------------------------------------------------------------
           Quick Skill Percentage Modal Helpers (Click Badge on Card)
           ------------------------------------------------------------- */
        let currentModalSkillCatIdx = null;

        function openSkillPercentageModal(catIdx) {
            const skills = PORTFOLIO_DATA.skills || [];
            const cat = skills[catIdx];
            if (!cat) return;

            currentModalSkillCatIdx = catIdx;
            const catName = cat.category || 'Custom Skills';
            const catBrandSvg = getCategoryBrandSvg(catName);
            const badge = cat.badge || '85%';
            const num = parseInt(badge) || 85;

            const modal = document.getElementById('skillPctModal');
            const iconWrap = document.getElementById('modalPctCatIcon');
            const nameSpan = document.getElementById('modalPctCatName');
            const valDisplay = document.getElementById('modalPctValueDisplay');
            const progressBar = document.getElementById('modalPctProgressBar');
            const slider = document.getElementById('modalPctSlider');
            const customInput = document.getElementById('modalPctCustomInput');

            if (iconWrap) iconWrap.innerHTML = catBrandSvg;
            if (nameSpan) nameSpan.textContent = `Category: ${catName}`;
            if (valDisplay) valDisplay.textContent = num;
            if (progressBar) progressBar.style.width = `${Math.min(100, Math.max(10, num))}%`;
            if (slider) slider.value = num;
            if (customInput) customInput.value = badge;

            updateModalPresetChips(num);

            if (modal) {
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        }

        function closeSkillPercentageModal() {
            const modal = document.getElementById('skillPctModal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
            currentModalSkillCatIdx = null;
        }

        function onModalPctSliderChange(val) {
            const valDisplay = document.getElementById('modalPctValueDisplay');
            const progressBar = document.getElementById('modalPctProgressBar');
            const customInput = document.getElementById('modalPctCustomInput');
            const num = parseInt(val) || 85;

            if (valDisplay) valDisplay.textContent = num;
            if (progressBar) progressBar.style.width = `${num}%`;
            if (customInput) customInput.value = `${num}%`;

            updateModalPresetChips(num);
        }

        function setModalPctPreset(val) {
            const slider = document.getElementById('modalPctSlider');
            if (slider) slider.value = val;
            onModalPctSliderChange(val);
        }

        function onModalPctCustomInputChange(val) {
            const valDisplay = document.getElementById('modalPctValueDisplay');
            const progressBar = document.getElementById('modalPctProgressBar');
            const slider = document.getElementById('modalPctSlider');
            const num = parseInt(val);

            if (!isNaN(num)) {
                if (valDisplay) valDisplay.textContent = num;
                if (progressBar) progressBar.style.width = `${Math.min(100, Math.max(0, num))}%`;
                if (slider && num >= 50 && num <= 100) slider.value = num;
                updateModalPresetChips(num);
            } else {
                if (valDisplay) valDisplay.textContent = val || '0';
            }
        }

        function updateModalPresetChips(val) {
            const chips = document.querySelectorAll('#skillPctModal .pct-preset-chip');
            chips.forEach(c => {
                if (parseInt(c.textContent) === parseInt(val)) {
                    c.classList.add('active');
                } else {
                    c.classList.remove('active');
                }
            });
        }

        async function saveSkillPercentageFromModal() {
            if (currentModalSkillCatIdx === null) return;
            const skills = PORTFOLIO_DATA.skills || [];
            const cat = skills[currentModalSkillCatIdx];
            if (!cat) return;

            const customInput = document.getElementById('modalPctCustomInput');
            const slider = document.getElementById('modalPctSlider');
            let newBadge = customInput ? customInput.value.trim() : '';
            if (!newBadge && slider) {
                newBadge = `${slider.value}%`;
            }
            if (newBadge && /^\d+$/.test(newBadge)) {
                newBadge = `${newBadge}%`;
            }
            if (!newBadge) newBadge = '85%';

            const saveBtn = document.getElementById('saveModalPctBtn');
            if (saveBtn) {
                saveBtn.disabled = true;
                saveBtn.innerHTML = '<span>⏳ Saving...</span>';
            }

            try {
                const res = await fetch('/api/admin/skill-category', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        oldCategory: cat.category,
                        newCategory: cat.category,
                        badge: newBadge,
                        skills: cat.skills
                    })
                });
                const d = await res.json();
                if (d.success) {
                    showNotify(`Updated "${cat.category}" percentage to ${newBadge}!`);
                    closeSkillPercentageModal();
                    cat.badge = newBadge;
                    renderSkills();
                    try { localStorage.setItem('sg_portfolio_data', JSON.stringify(PORTFOLIO_DATA)); } catch (e) {}
                    loadData();
                } else {
                    showNotify(d.message || 'Error updating percentage', false);
                }
            } catch (err) {
                console.error('Error saving skill percentage:', err);
                showNotify('Failed to save percentage', false);
            } finally {
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = '<span>💾 Save Percentage</span>';
                }
            }
        }

        // Close modal on backdrop click
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('skillPctModal');
            if (modal && e.target === modal) {
                closeSkillPercentageModal();
            }
        });

        async function saveSkillCategoryEdit(catIdx, oldName) {
            const nameInput = document.getElementById(`editCatName_${catIdx}`);
            const badgeInput = document.getElementById(`editCatBadge_${catIdx}`);
            const skillsInput = document.getElementById(`editCatSkills_${catIdx}`);

            const newName = nameInput ? nameInput.value.trim() : oldName;
            let badge = badgeInput ? badgeInput.value.trim() : '85%';
            if (badge && /^\d+$/.test(badge)) {
                badge = `${badge}%`;
            }
            const skillsText = skillsInput ? skillsInput.value : '';
            const skillsList = skillsText.split(',').map(s => s.trim()).filter(Boolean);

            if (!newName) {
                showNotify('Category name cannot be empty', false);
                if (nameInput) nameInput.focus();
                return;
            }

            try {
                const res = await fetch('/api/admin/skill-category', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        oldCategory: oldName,
                        newCategory: newName,
                        badge: badge,
                        skills: skillsList
                    })
                });
                const d = await res.json();
                if (d.success) {
                    showNotify(`Category "${newName}" updated successfully!`);
                    editingSkillCatIdx = null;
                    const catObj = (PORTFOLIO_DATA.skills || []).find(c => (c.category || '').toLowerCase() === oldName.toLowerCase());
                    if (catObj) {
                        catObj.category = newName;
                        catObj.badge = badge;
                    }
                    renderSkills();
                    try { localStorage.setItem('sg_portfolio_data', JSON.stringify(PORTFOLIO_DATA)); } catch (e) {}
                    loadData();
                } else {
                    showNotify(d.message || 'Error updating category', false);
                }
            } catch (err) {
                console.error('Error updating skill category:', err);
                showNotify('Failed to update category', false);
            }
        }

        function renderSkills() {
            const list = document.getElementById('skillsCategoriesList');
            if (!list) return;
            list.innerHTML = '';

            const datalist = document.getElementById('skillCategoriesDatalist');
            if (datalist) {
                datalist.innerHTML = '';
            }

            const skills = PORTFOLIO_DATA.skills || [];
            skills.forEach((cat, catIdx) => {
                const catName = cat.category || 'Custom Skills';
                const catBrandSvg = getCategoryBrandSvg(catName);
                
                // Add to datalist
                if (datalist) {
                    const opt = document.createElement('option');
                    opt.value = catName;
                    datalist.appendChild(opt);
                }

                const box = document.createElement('div');

                if (editingSkillCatIdx === catIdx) {
                    // Inline Edit Mode
                    box.className = 'admin-item-card admin-card-editing';
                    const skillsStr = (cat.skills || []).map(s => typeof s === 'string' ? s : (s.name || '')).filter(Boolean).join(', ');
                    const skillsCount = (cat.skills || []).length;
                    const currentBadge = cat.badge || '85%';
                    const currentPctNum = parseInt(currentBadge) || 85;

                    box.innerHTML = `
                        <div class="admin-card-header" style="padding-bottom: 0.6rem; border-bottom: 1px solid rgba(0, 242, 254, 0.3);">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span class="cat-card-icon-wrap" style="display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 8px; background: rgba(0, 242, 254, 0.15); flex-shrink: 0;">
                                    ${catBrandSvg}
                                </span>
                                <h4 class="admin-card-title" style="color: var(--color-cyan, #00F2FE); font-size: 0.95rem; font-weight: 700; margin: 0;">
                                    Editing Category: <span style="color: var(--text-main);">${escapeHtml(catName)}</span>
                                </h4>
                            </div>
                            <button type="button" onclick="cancelSkillCategoryEdit()" class="btn-action-icon" title="Cancel Editing" style="color: var(--text-muted); width: 28px; height: 28px;">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 0.85rem; padding-top: 0.75rem;">
                            <div class="admin-grid-2col" style="gap: 0.85rem;">
                                <div class="form-group" style="margin-bottom: 0;">
                                    <label class="form-label" style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 4px; display: block;">
                                        Category Name *
                                    </label>
                                    <input type="text" id="editCatName_${catIdx}" class="form-input" value="${escapeHtml(catName)}" placeholder="e.g. Core Data Science & ML" style="padding: 0.5rem 0.7rem; font-size: 0.85rem;" required />
                                </div>

                                <!-- Proficiency Percentage Editor with Slider & Preset Chips -->
                                <div class="form-group" style="margin-bottom: 0;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                        <label class="form-label" style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 0; display: block;">
                                            Proficiency Percentage (%) *
                                        </label>
                                        <span id="editCatBadgeDisplay_${catIdx}" style="font-size: 0.85rem; font-weight: 800; font-family: var(--font-mono); color: #00F2FE;">
                                            ${escapeHtml(currentBadge)}
                                        </span>
                                    </div>
                                    <div style="display: flex; gap: 8px; align-items: center;">
                                        <input type="range" id="editCatBadgeSlider_${catIdx}" min="50" max="100" step="1" value="${currentPctNum}" style="flex: 1; accent-color: #00F2FE; cursor: pointer;" oninput="onInlinePctSliderChange(${catIdx}, this.value)" />
                                        <input type="text" id="editCatBadge_${catIdx}" class="form-input" value="${escapeHtml(currentBadge)}" placeholder="e.g. 90%" style="width: 80px; padding: 0.45rem 0.6rem; font-size: 0.82rem; font-family: var(--font-mono); text-align: center;" oninput="onInlinePctInputChange(${catIdx}, this.value)" />
                                    </div>
                                    <div id="editCatBadgePresets_${catIdx}" style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px;">
                                        <button type="button" class="pct-preset-chip ${currentPctNum === 75 ? 'active' : ''}" onclick="setInlinePctPreset(${catIdx}, 75)">75%</button>
                                        <button type="button" class="pct-preset-chip ${currentPctNum === 80 ? 'active' : ''}" onclick="setInlinePctPreset(${catIdx}, 80)">80%</button>
                                        <button type="button" class="pct-preset-chip ${currentPctNum === 82 ? 'active' : ''}" onclick="setInlinePctPreset(${catIdx}, 82)">82%</button>
                                        <button type="button" class="pct-preset-chip ${currentPctNum === 85 ? 'active' : ''}" onclick="setInlinePctPreset(${catIdx}, 85)">85%</button>
                                        <button type="button" class="pct-preset-chip ${currentPctNum === 88 ? 'active' : ''}" onclick="setInlinePctPreset(${catIdx}, 88)">88%</button>
                                        <button type="button" class="pct-preset-chip ${currentPctNum === 90 ? 'active' : ''}" onclick="setInlinePctPreset(${catIdx}, 90)">90%</button>
                                        <button type="button" class="pct-preset-chip ${currentPctNum === 95 ? 'active' : ''}" onclick="setInlinePctPreset(${catIdx}, 95)">95%</button>
                                        <button type="button" class="pct-preset-chip ${currentPctNum === 100 ? 'active' : ''}" onclick="setInlinePctPreset(${catIdx}, 100)">100%</button>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group" style="margin-bottom: 0;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                    <label class="form-label" style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 0;">
                                        Skills in this Category (Comma Separated)
                                    </label>
                                    <span id="editCatCount_${catIdx}" class="tech-chip" style="font-size: 10px; color: var(--color-cyan, #00F2FE);">
                                        ${skillsCount} skill${skillsCount === 1 ? '' : 's'}
                                    </span>
                                </div>
                                <textarea id="editCatSkills_${catIdx}" class="form-input" rows="3" style="resize: vertical; font-family: var(--font-mono); font-size: 0.8rem; line-height: 1.4; padding: 0.5rem 0.7rem;" placeholder="e.g. Python, Pandas, NumPy, Scikit-Learn, Docker" oninput="updateEditSkillsPreview(${catIdx})">${escapeHtml(skillsStr)}</textarea>
                                <span style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono); margin-top: 3px; display: block;">
                                    💡 Tip: Add, remove or edit skills separated by commas. Official 3D vector SVGs auto-match live below!
                                </span>
                            </div>

                            <!-- Live Preview of Vector SVGs -->
                            <div style="padding: 0.75rem; border-radius: 12px; background: rgba(0, 242, 254, 0.04); border: 1px dashed rgba(0, 242, 254, 0.25);">
                                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                                    <span style="font-size: 0.75rem; color: var(--color-cyan, #00F2FE); font-family: var(--font-mono); font-weight: 700;">
                                        👁️ Live 3D Vector Logo Preview:
                                    </span>
                                    <span style="font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-mono);">
                                        Updates as you type • Click &times; to remove
                                    </span>
                                </div>
                                <div id="editCatPreview_${catIdx}" class="skill-pills-wrap"></div>
                            </div>

                            <!-- Action Buttons -->
                            <div class="skill-edit-action-row" style="display: flex; gap: 8px; justify-content: flex-end; align-items: center; margin-top: 0.5rem; flex-wrap: wrap; width: 100%;">
                                <button type="button" onclick="cancelSkillCategoryEdit()" class="btn-3d btn-3d-delete" style="padding: 0.5rem 1rem; font-size: 0.8rem;">
                                    <span>✕ Cancel</span>
                                </button>
                                <button type="button" onclick="saveSkillCategoryEdit(${catIdx}, '${escapeJs(catName)}')" class="btn-3d btn-3d-view" style="padding: 0.5rem 1.25rem; font-size: 0.8rem; background: linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%); color: #040812; font-weight: 700;">
                                    <span>💾 Save Category Changes</span>
                                </button>
                            </div>
                        </div>
                    `;

                    list.appendChild(box);
                    // Populate preview immediately
                    updateEditSkillsPreview(catIdx);

                } else {
                    // Normal Responsive 3D Card View
                    box.className = 'admin-item-card skill-cat-admin-card';

                    let pillsHtml = '';
                    (cat.skills || []).forEach(s => {
                        const svgContent = s.svg || getSkillLogoHtml(s.name, AVAILABLE_LOGOS[s.key]);
                        pillsHtml += `
                            <span class="skill-pill">
                                <span class="skill-icon-wrap">${svgContent}</span>
                                <span class="skill-pill-text">${escapeHtml(s.name)}</span>
                                <button type="button" onclick="deleteSkill('${escapeJs(catName)}', '${escapeJs(s.name)}')" class="skill-delete-tag-btn" title="Remove ${escapeHtml(s.name)}">
                                    &times;
                                </button>
                            </span>
                        `;
                    });

                    box.innerHTML = `
                        <div class="admin-card-header skill-cat-card-header">
                            <div class="skill-cat-header-title-group">
                                <span class="cat-card-icon-wrap" title="${escapeHtml(catName)}">
                                    ${catBrandSvg}
                                </span>
                                <h4 class="admin-card-title">${escapeHtml(catName)}</h4>
                                <button type="button" class="cat-pct-badge-btn" onclick="openSkillPercentageModal(${catIdx})" title="Click to edit proficiency percentage (${escapeHtml(cat.badge || '85%')})">
                                    <span class="pct-badge-label">${escapeHtml(cat.badge || '85%')}</span>
                                    <span class="pct-badge-icon">
                                        <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M12 20h9"></path>
                                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                        </svg>
                                    </span>
                                </button>
                            </div>
                            <div class="skill-cat-header-actions">
                                <button type="button" onclick="openSkillCategoryEdit(${catIdx})" class="btn-3d btn-3d-edit" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;" title="Edit Category" aria-label="Edit Category">
                                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                    <span>Edit</span>
                                </button>
                                <button type="button" onclick="deleteSkillCategory('${escapeJs(catName)}')" class="btn-3d btn-3d-delete" style="padding: 0.35rem 0.75rem; font-size: 0.75rem;" title="Delete Category" aria-label="Delete Category">
                                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                        <div class="skill-pills-wrap">
                            ${pillsHtml || '<span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">No skills added.</span>'}
                        </div>
                    `;
                    list.appendChild(box);
                }
            });
        }

        async function editSkillCategory(oldName, oldBadge) {
            // Backward-compatibility wrapper for any direct calls
            const catIdx = (PORTFOLIO_DATA.skills || []).findIndex(c => (c.category || '').toLowerCase() === (oldName || '').toLowerCase());
            if (catIdx !== -1) {
                openSkillCategoryEdit(catIdx);
            }
        }


        async function deleteSkillCategory(catName) {
            if (!confirm(`Are you sure you want to delete the whole category "${catName}" and all its skills?`)) return;
            // Instant optimistic removal from UI
            PORTFOLIO_DATA.skills = (PORTFOLIO_DATA.skills || []).filter(c => (c.category || '').toLowerCase() !== catName.toLowerCase());
            editingSkillCatIdx = null;
            renderSkills();
            try { localStorage.setItem('sg_portfolio_data', JSON.stringify(PORTFOLIO_DATA)); } catch (e) {}

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
                    loadData();
                }
            } catch (err) {
                showNotify('Failed to delete category', false);
                loadData();
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

        // New Skill Percentage Controls
        function onNewSkillPctSliderChange(val) {
            const v = parseInt(val, 10) || 90;
            const inp = document.getElementById('skillCategoryPercentage');
            const disp = document.getElementById('newSkillPctDisplay');
            if (inp) inp.value = v;
            if (disp) disp.textContent = v + '%';
            highlightNewSkillPreset(v);
        }

        function onNewSkillPctInputChange(val) {
            let v = parseInt(val, 10);
            if (isNaN(v)) return;
            v = Math.max(1, Math.min(100, v));
            const slider = document.getElementById('newSkillPctSlider');
            const disp = document.getElementById('newSkillPctDisplay');
            if (slider) slider.value = Math.max(50, Math.min(100, v));
            if (disp) disp.textContent = v + '%';
            highlightNewSkillPreset(v);
        }

        function setNewSkillPctPreset(val) {
            const slider = document.getElementById('newSkillPctSlider');
            const inp = document.getElementById('skillCategoryPercentage');
            const disp = document.getElementById('newSkillPctDisplay');
            if (slider) slider.value = val;
            if (inp) inp.value = val;
            if (disp) disp.textContent = val + '%';
            highlightNewSkillPreset(val);
        }

        function highlightNewSkillPreset(val) {
            document.querySelectorAll('#skillForm .pct-preset-chip').forEach(btn => {
                if (parseInt(btn.textContent, 10) === val) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }

        window.onNewSkillPctSliderChange = onNewSkillPctSliderChange;
        window.onNewSkillPctInputChange = onNewSkillPctInputChange;
        window.setNewSkillPctPreset = setNewSkillPctPreset;

        // Auto-detect existing category percentage when user types or selects category
        const skillCatInputEl = document.getElementById('skillCategory');
        if (skillCatInputEl) {
            skillCatInputEl.addEventListener('input', () => {
                const val = (skillCatInputEl.value || '').trim().toLowerCase();
                if (!val || !PORTFOLIO_DATA || !Array.isArray(PORTFOLIO_DATA.skills)) return;
                const matched = PORTFOLIO_DATA.skills.find(c => (c.category || '').toLowerCase() === val);
                if (matched && matched.badge) {
                    const num = parseInt(matched.badge, 10);
                    if (!isNaN(num)) {
                        setNewSkillPctPreset(num);
                    }
                }
            });
        }

        document.getElementById('skillForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const cat = document.getElementById('skillCategory').value.trim();
            const name = document.getElementById('skillName').value.trim();
            const pctVal = (document.getElementById('skillCategoryPercentage')?.value || '').trim();
            const badgeVal = pctVal ? (pctVal.endsWith('%') ? pctVal : `${pctVal}%`) : '90%';

            try {
                const res = await fetch('/api/admin/skills', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ category: cat, name: name, badge: badgeVal })
                });
                const d = await res.json();
                if (d.success) {
                    showNotify(d.message || 'Skill added successfully!');
                    document.getElementById('skillName').value = '';

                    // Instant in-memory and UI update!
                    const targetCat = (PORTFOLIO_DATA.skills || []).find(c => (c.category || '').toLowerCase() === cat.toLowerCase());
                    const newSkillItem = { name: name, key: d.key, svg: d.svg };
                    if (targetCat) {
                        if (badgeVal) targetCat.badge = badgeVal;
                        targetCat.skills = targetCat.skills || [];
                        if (!targetCat.skills.some(s => s.name.toLowerCase() === name.toLowerCase())) {
                            targetCat.skills.unshift(newSkillItem);
                        }
                    } else {
                        PORTFOLIO_DATA.skills.push({
                            category: cat,
                            badge: badgeVal || '90%',
                            skills: [newSkillItem]
                        });
                    }
                    renderSkills();
                    try { localStorage.setItem('sg_portfolio_data', JSON.stringify(PORTFOLIO_DATA)); } catch (e) {}
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
            // Instant optimistic removal from UI
            const catObj = (PORTFOLIO_DATA.skills || []).find(c => (c.category || '').toLowerCase() === category.toLowerCase());
            if (catObj && catObj.skills) {
                catObj.skills = catObj.skills.filter(s => (s.name || '').toLowerCase() !== name.toLowerCase());
                renderSkills();
                try { localStorage.setItem('sg_portfolio_data', JSON.stringify(PORTFOLIO_DATA)); } catch (e) {}
            }

            try {
                const res = await fetch('/api/admin/skills', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ category, name })
                });
                const d = await res.json();
                if (d.success) {
                    showNotify('Skill deleted');
                } else {
                    showNotify(d.message || 'Failed to delete skill', false);
                    loadData();
                }
            } catch (err) {
                showNotify('Failed to delete skill', false);
                loadData();
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

            eduList.forEach((edu, idx) => {
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
                const eduIconSvg = getEducationIconSvg(edu.degree, idx);

                card.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 0.65rem; flex: 1 1 auto;">
                        <div class="admin-card-header" style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div class="edu-badge-circle ${edu.color || 'cyan'}" style="display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 8px; background: ${dotColor}18; border: 1px solid ${dotColor}40; color: ${dotColor}; flex-shrink: 0; box-shadow: 0 4px 10px ${dotColor}25;">
                                    ${eduIconSvg}
                                </div>
                                <span class="tech-chip" style="color: ${dotColor}; border-color: ${dotColor}55;">
                                    ${edu.timeline || '2023 - 2027'}
                                </span>
                            </div>
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

                    <div class="admin-card-footer" style="display: flex; justify-content: flex-end; align-items: center; gap: 0.45rem; margin-top: 1rem; padding-top: 0.85rem; border-top: 1px solid rgba(255, 255, 255, 0.08); flex-wrap: wrap;">
                        <!-- 1. 3D View Button -->
                        <a href="${edu.viewLink || edu.downloadLink || (edu.link && !edu.link.includes('github.com') ? edu.link : '') || '#'}" target="_blank" class="btn-3d btn-3d-view" title="View Education Credential">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <span>View</span>
                        </a>

                        <!-- 2. 3D Edit Button -->
                        <button type="button" onclick="editEducation('${edu.id}')" class="btn-3d btn-3d-edit" title="Edit Education Milestone">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            <span>Edit</span>
                        </button>

                        <!-- 3. 3D Delete Button -->
                        <button type="button" onclick="deleteEducation('${edu.id}')" class="btn-3d btn-3d-delete" title="Delete Education Milestone">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                            <span>Delete</span>
                        </button>
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
            document.getElementById('eduViewLink').value = edu.viewLink || (edu.link && !edu.link.includes('github.com') ? edu.link : '') || '';
            document.getElementById('eduDownloadLink').value = edu.downloadLink || '';
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
                    color: (eduId && (PORTFOLIO_DATA.education || []).find(e => e.id === eduId)?.color) || 'cyan',
                    viewLink: document.getElementById('eduViewLink').value.trim(),
                    downloadLink: document.getElementById('eduDownloadLink').value.trim(),
                    link: document.getElementById('eduViewLink').value.trim() || document.getElementById('eduDownloadLink').value.trim(),
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
                        if (d.education) {
                            const edus = PORTFOLIO_DATA.education || [];
                            const eIdx = edus.findIndex(e => e.id === d.education.id);
                            if (eIdx >= 0) {
                                edus[eIdx] = d.education;
                            } else {
                                edus.push(d.education);
                            }
                            PORTFOLIO_DATA.education = edus;
                            renderEducation();
                            try { localStorage.setItem('sg_portfolio_data', JSON.stringify(PORTFOLIO_DATA)); } catch (e) {}
                        }
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
            // Instant optimistic removal from UI
            PORTFOLIO_DATA.education = (PORTFOLIO_DATA.education || []).filter(e => e.id !== id);
            renderEducation();
            try { localStorage.setItem('sg_portfolio_data', JSON.stringify(PORTFOLIO_DATA)); } catch (e) {}

            try {
                const res = await fetch('/api/admin/education/' + id, { method: 'DELETE' });
                const d = await res.json();
                if (d.success) {
                    showNotify('Education milestone deleted');
                } else {
                    showNotify(d.message || 'Failed to delete education milestone', false);
                    loadData();
                }
            } catch (err) {
                showNotify('Failed to delete education milestone', false);
                loadData();
            }
        }

        // =========================================================================
        // 5. Professional Experience Manager
        // =========================================================================
        function getExperienceIconSvg(iconKey, roleTitle) {
            const key = (iconKey || '').toLowerCase();
            const clean = (roleTitle || '').toLowerCase();

            if (key === 'chart' || key === 'analytics' || clean.includes('analyst') || clean.includes('analytics') || clean.includes('bi')) {
                return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>`;
            }
            if (key === 'rocket' || key === 'ai' || clean.includes('rocket') || clean.includes('ai') || clean.includes('open source') || clean.includes('engineer')) {
                return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
                    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
                </svg>`;
            }
            if (key === 'code' || key === 'laptop' || clean.includes('developer') || clean.includes('software')) {
                return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                </svg>`;
            }
            // Default: Briefcase
            return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>`;
        }

        function renderExperience() {
            const list = document.getElementById('experienceList');
            if (!list) return;
            list.innerHTML = '';

            const expList = PORTFOLIO_DATA.experience || [];
            if (expList.length === 0) {
                list.innerHTML = '<div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); padding: 1rem;">No professional experience roles published yet.</div>';
                return;
            }

            expList.forEach((exp) => {
                const card = document.createElement('div');
                card.className = 'admin-item-card';

                const colorDotMap = {
                    cyan: '#00F2FE',
                    blue: '#38BDF8',
                    purple: '#A855F7',
                    orange: '#F97316',
                    green: '#10B981'
                };
                const dotColor = colorDotMap[exp.color] || '#00F2FE';
                const iconSvg = getExperienceIconSvg(exp.icon, exp.role);

                let bulletsHtml = '';
                if (Array.isArray(exp.bullets) && exp.bullets.length > 0) {
                    bulletsHtml = '<ul style="margin: 0.4rem 0 0 0; padding-left: 1.2rem; font-size: 0.78rem; color: var(--text-muted); line-height: 1.5; font-family: var(--font-sans);">' +
                        exp.bullets.map(b => `<li style="margin-bottom: 3px;">${escapeHtml(b)}</li>`).join('') +
                        '</ul>';
                }

                card.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 0.65rem; flex: 1 1 auto;">
                        <div class="admin-card-header" style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div class="exp-badge-3d ${exp.color || 'cyan'}" style="width: 38px; height: 38px; min-width: 38px; border-radius: 10px;">
                                    ${iconSvg}
                                </div>
                                <div>
                                    <h4 class="admin-card-title" style="margin: 0; line-height: 1.3; font-size: 0.95rem;">${escapeHtml(exp.role)}</h4>
                                    <p style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--color-cyan, #00F2FE); margin: 2px 0 0 0;">
                                        ${escapeHtml(exp.company)}
                                    </p>
                                </div>
                            </div>
                            <span class="tech-chip" style="color: ${dotColor}; border-color: ${dotColor}55;">
                                ${escapeHtml(exp.duration || 'Present')}
                            </span>
                        </div>
                        ${bulletsHtml}
                    </div>

                    <div class="admin-card-footer" style="display: flex; justify-content: flex-end; align-items: center; gap: 0.45rem; margin-top: 1rem; padding-top: 0.85rem; border-top: 1px solid rgba(255, 255, 255, 0.08); flex-wrap: wrap;">
                        <!-- 3D Edit Button -->
                        <button type="button" onclick="editExperience('${escapeJs(exp.id)}')" class="btn-3d btn-3d-edit" title="Edit Professional Role">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            <span>Edit</span>
                        </button>

                        <!-- 3D Delete Button -->
                        <button type="button" onclick="deleteExperience('${escapeJs(exp.id)}')" class="btn-3d btn-3d-delete" title="Delete Professional Role">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            <span>Delete</span>
                        </button>
                    </div>
                `;
                list.appendChild(card);
            });
        }

        function editExperience(id) {
            const expList = PORTFOLIO_DATA.experience || [];
            const exp = expList.find(e => e.id === id);
            if (!exp) return;

            document.getElementById('expId').value = exp.id;
            document.getElementById('expRole').value = exp.role || '';
            document.getElementById('expCompany').value = exp.company || '';
            document.getElementById('expDuration').value = exp.duration || '';
            document.getElementById('expIcon').value = exp.icon || 'briefcase';
            document.getElementById('expColor').value = exp.color || 'cyan';
            document.getElementById('expBullets').value = Array.isArray(exp.bullets) ? exp.bullets.join('\n') : (exp.bullets || '');

            const submitBtn = document.getElementById('expSubmitBtn');
            if (submitBtn) submitBtn.innerHTML = '<span>💾 Update Experience Role</span>';
            const cancelBtn = document.getElementById('expCancelBtn');
            if (cancelBtn) cancelBtn.style.display = 'inline-flex';

            const formCard = document.getElementById('expFormTitle');
            if (formCard) formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function cancelExpEdit() {
            const form = document.getElementById('expForm');
            if (form) form.reset();
            document.getElementById('expId').value = '';
            const submitBtn = document.getElementById('expSubmitBtn');
            if (submitBtn) submitBtn.innerHTML = '<span>💼 Publish Experience Role</span>';
            const cancelBtn = document.getElementById('expCancelBtn');
            if (cancelBtn) cancelBtn.style.display = 'none';
        }

        const expForm = document.getElementById('expForm');
        if (expForm) {
            expForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const expId = document.getElementById('expId').value;
                const bulletsText = document.getElementById('expBullets').value;
                const bulletsList = bulletsText.split('\n').map(b => b.trim().replace(/^[•\-\*]\s*/, '')).filter(Boolean);

                const payload = {
                    id: expId || undefined,
                    role: document.getElementById('expRole').value.trim(),
                    company: document.getElementById('expCompany').value.trim(),
                    duration: document.getElementById('expDuration').value.trim(),
                    icon: document.getElementById('expIcon').value.trim(),
                    color: document.getElementById('expColor').value.trim(),
                    bullets: bulletsList
                };

                try {
                    const res = await fetch('/api/admin/experience', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const d = await res.json();
                    if (d.success) {
                        showNotify(expId ? 'Experience role updated successfully!' : 'Experience role published successfully!');
                        cancelExpEdit();
                        if (d.experience) {
                            const exps = PORTFOLIO_DATA.experience || [];
                            const exIdx = exps.findIndex(e => e.id === d.experience.id);
                            if (exIdx >= 0) {
                                exps[exIdx] = d.experience;
                            } else {
                                exps.unshift(d.experience);
                            }
                            PORTFOLIO_DATA.experience = exps;
                            renderExperience();
                            try { localStorage.setItem('sg_portfolio_data', JSON.stringify(PORTFOLIO_DATA)); } catch (e) {}
                        }
                        loadData();
                    } else {
                        showNotify(d.message || 'Error saving experience role', false);
                    }
                } catch (err) {
                    showNotify('Failed to save experience role', false);
                }
            });
        }

        async function deleteExperience(id) {
            if (!confirm('Are you sure you want to delete this experience role?')) return;
            // Instant optimistic removal from UI
            PORTFOLIO_DATA.experience = (PORTFOLIO_DATA.experience || []).filter(e => e.id !== id);
            renderExperience();
            try { localStorage.setItem('sg_portfolio_data', JSON.stringify(PORTFOLIO_DATA)); } catch (e) {}

            try {
                const res = await fetch('/api/admin/experience/' + id, { method: 'DELETE' });
                const d = await res.json();
                if (d.success) {
                    showNotify('Experience role deleted');
                    loadData();
                } else {
                    showNotify(d.message || 'Failed to delete experience role', false);
                    loadData();
                }
            } catch (err) {
                showNotify('Failed to delete experience role', false);
                loadData();
            }
        }

        // =========================================================================
        // 6. Resume Management
        // =========================================================================
        // ============================================================
        // Multi-Resume Library Manager Logic (Upload + Individual Cards with View, Edit, Delete)
        // ============================================================
        let resumeSelectedFile = null;
        const resumePdfInput = document.getElementById('resumePdf');
        const resumePdfPreviewRow = document.getElementById('resumePdfPreviewRow');
        const resumeForm = document.getElementById('resumeForm');
        const resumeIdInput = document.getElementById('resumeId');
        const resumeTitleInput = document.getElementById('resumeTitle');
        const resumeIsActiveInput = document.getElementById('resumeIsActive');
        const resumeCancelBtn = document.getElementById('resumeCancelBtn');
        const resumeFormTitle = document.getElementById('resumeFormTitle');
        const resumeSubmitBtnText = document.getElementById('resumeSubmitBtnText');
        const resumeFileReqText = document.getElementById('resumeFileReqText');

        if (resumePdfInput) {
            resumePdfInput.addEventListener('change', (e) => {
                const file = e.target.files && e.target.files[0];
                if (file) {
                    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                        showNotify('Please select a valid PDF file!', false);
                        resumePdfInput.value = '';
                        resumeSelectedFile = null;
                        renderResumePdfPreview();
                        return;
                    }
                    resumeSelectedFile = file;
                    if (resumeTitleInput && !resumeTitleInput.value.trim()) {
                        const baseName = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
                        resumeTitleInput.value = baseName;
                    }
                } else {
                    resumeSelectedFile = null;
                }
                renderResumePdfPreview();
            });
        }

        function renderResumePdfPreview() {
            if (!resumePdfPreviewRow) return;
            resumePdfPreviewRow.innerHTML = '';

            if (resumeSelectedFile) {
                const item = document.createElement('div');
                item.className = 'admin-preview-item';
                item.style.padding = '0.5rem 0.75rem';
                item.innerHTML = `
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <span style="font-size:1.2rem;">📄</span>
                        <div style="display:flex; flex-direction:column;">
                            <span style="font-size:0.75rem; font-weight:600; color:var(--text-main);">${escapeHtml(resumeSelectedFile.name)}</span>
                            <span style="font-size:0.7rem; color:var(--text-muted);">${(resumeSelectedFile.size / 1024).toFixed(1)} KB</span>
                        </div>
                    </div>
                    <button type="button" class="admin-preview-remove" title="Remove PDF" style="background:none; border:none; color:#EF4444; font-size:1.1rem; cursor:pointer;">&times;</button>
                `;
                item.querySelector('.admin-preview-remove').addEventListener('click', () => {
                    resumeSelectedFile = null;
                    if (resumePdfInput) resumePdfInput.value = '';
                    renderResumePdfPreview();
                });
                resumePdfPreviewRow.appendChild(item);
            }
        }

        if (resumeCancelBtn) {
            resumeCancelBtn.addEventListener('click', () => {
                resetResumeForm();
            });
        }

        function resetResumeForm() {
            if (resumeIdInput) resumeIdInput.value = '';
            if (resumeTitleInput) resumeTitleInput.value = '';
            if (resumePdfInput) {
                resumePdfInput.value = '';
                resumePdfInput.required = true;
            }
            if (resumeIsActiveInput) resumeIsActiveInput.checked = true;
            if (resumeCancelBtn) resumeCancelBtn.style.display = 'none';
            if (resumeFormTitle) resumeFormTitle.textContent = '🚀 Upload New Resume PDF';
            if (resumeSubmitBtnText) resumeSubmitBtnText.textContent = '🚀 Upload & Add Resume';
            if (resumeFileReqText) resumeFileReqText.textContent = 'Required *';
            resumeSelectedFile = null;
            renderResumePdfPreview();
        }

        function renderResume() {
            const grid = document.getElementById('resumeCardsList');
            const badge = document.getElementById('resumeCountBadge');
            if (!grid) return;
            grid.innerHTML = '';

            let resumes = PORTFOLIO_DATA.resumes || [];
            if (!Array.isArray(resumes) || resumes.length === 0) {
                const legacy = PORTFOLIO_DATA.resume || {};
                resumes = [{
                    id: 'resume_default',
                    title: 'Subhankar Giri — Official CV / Resume',
                    fileName: 'resume.pdf',
                    filePath: legacy.filePath || 'assets/resume.pdf',
                    fileSize: '1.1 KB',
                    uploadedAt: legacy.lastUpdated || 'November 2026',
                    isActive: true
                }];
            }

            if (badge) {
                badge.textContent = `${resumes.length} Resume${resumes.length === 1 ? '' : 's'} Available`;
            }

            resumes.forEach(r => {
                const card = document.createElement('div');
                card.className = 'admin-item-card';
                card.style.padding = '1.35rem';
                card.style.display = 'flex';
                card.style.flexDirection = 'column';
                card.style.justifyContent = 'space-between';
                card.style.gap = '1.1rem';
                card.style.background = 'var(--bg-card)';
                card.style.border = r.isActive ? '1.5px solid rgba(16, 185, 129, 0.45)' : 'var(--border-card)';
                card.style.borderRadius = '14px';
                card.style.boxShadow = r.isActive ? '0 10px 25px rgba(16, 185, 129, 0.12)' : 'var(--shadow-sm)';

                card.innerHTML = `
                    <div style="display: flex; gap: 1rem; align-items: flex-start;">
                        <div class="method-icon-box method-icon-3d ${r.isActive ? 'method-icon-emerald' : 'method-icon-cyan'}" style="width: 48px; height: 48px; min-width: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                            </svg>
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 4px;">
                                <span class="tech-chip" style="${r.isActive ? 'color: #10B981; border-color: rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.1);' : 'color: var(--text-muted); border-color: rgba(255, 255, 255, 0.15);'}">
                                    ${r.isActive ? '● Active Live' : '○ Standby'}
                                </span>
                                <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted);">${escapeHtml(r.fileSize || 'PDF')}</span>
                            </div>
                            <h4 class="admin-card-title" style="margin: 0; font-size: 1.02rem; line-height: 1.35;" title="${escapeHtml(r.title)}">${escapeHtml(r.title)}</h4>
                            <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-cyan, #00F2FE); display: block; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                /${escapeHtml(r.filePath || 'assets/resume.pdf')}
                            </span>
                            <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); display: block; margin-top: 3px;">
                                Uploaded: ${escapeHtml(r.uploadedAt || 'Current')}
                            </span>
                        </div>
                    </div>

                    <!-- 3D Buttons: View, Edit, Delete, Set Active -->
                    <div style="display: flex; gap: 0.5rem; align-items: center; justify-content: space-between; padding-top: 0.85rem; border-top: 1px solid rgba(255, 255, 255, 0.08); flex-wrap: wrap;">
                        <div>
                            ${!r.isActive ? `
                                <button type="button" onclick="activateResume('${escapeHtml(r.id)}')" class="btn-3d btn-3d-activate" title="Make this the live portfolio resume">
                                    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                    </svg>
                                    <span>Set Active</span>
                                </button>
                            ` : `
                                <div style="display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.38rem 0.75rem; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); border-radius: 8px;">
                                    <span style="font-family: var(--font-mono); font-size: 0.74rem; color: #10B981; font-weight: 700;">✓ Live on Site</span>
                                </div>
                            `}
                        </div>

                        <div style="display: flex; gap: 0.45rem; align-items: center;">
                            <!-- 1. 3D View Button -->
                            <a href="/${escapeHtml(r.filePath || 'assets/resume.pdf')}" target="_blank" class="btn-3d btn-3d-view" title="Preview Resume PDF">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                <span>View</span>
                            </a>

                            <!-- 2. 3D Edit Button -->
                            <button type="button" onclick="editResume('${escapeHtml(r.id)}')" class="btn-3d btn-3d-edit" title="Edit Resume Details or Replace PDF">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                <span>Edit</span>
                            </button>

                            <!-- 3. 3D Delete Button -->
                            <button type="button" onclick="deleteResume('${escapeHtml(r.id)}')" class="btn-3d btn-3d-delete" title="Delete Resume">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            });
        }

        window.editResume = function(id) {
            const resumes = PORTFOLIO_DATA.resumes || [];
            const r = resumes.find(item => item.id === id);
            if (!r) return;

            if (resumeIdInput) resumeIdInput.value = r.id;
            if (resumeTitleInput) resumeTitleInput.value = r.title || '';
            if (resumeIsActiveInput) resumeIsActiveInput.checked = !!r.isActive;
            if (resumePdfInput) {
                resumePdfInput.value = '';
                resumePdfInput.required = false;
            }
            if (resumeCancelBtn) resumeCancelBtn.style.display = 'inline-flex';
            if (resumeFormTitle) resumeFormTitle.textContent = `✏️ Edit Resume: ${r.title}`;
            if (resumeSubmitBtnText) resumeSubmitBtnText.textContent = '💾 Update Resume';
            if (resumeFileReqText) resumeFileReqText.textContent = 'Optional (leave blank to keep current)';

            resumeSelectedFile = null;
            renderResumePdfPreview();

            const formCard = document.getElementById('page-resume');
            if (formCard) formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };

        window.activateResume = async function(id) {
            try {
                const res = await fetch(`/api/admin/resumes/${encodeURIComponent(id)}/activate`, { method: 'POST' });
                const d = await res.json();
                if (d.success) {
                    showNotify('Resume set as active live portfolio resume!');
                    loadData();
                } else {
                    showNotify(d.message || 'Failed to activate resume', false);
                }
            } catch (err) {
                showNotify('Error activating resume', false);
            }
        };

        window.deleteResume = async function(id) {
            const resumes = PORTFOLIO_DATA.resumes || [];
            const r = resumes.find(item => item.id === id);
            const title = r ? r.title : 'this resume';

            if (!confirm(`Are you sure you want to delete "${title}"?`)) {
                return;
            }

            try {
                const res = await fetch(`/api/admin/resumes/${encodeURIComponent(id)}`, { method: 'DELETE' });
                const d = await res.json();
                if (d.success) {
                    showNotify('Resume deleted successfully!');
                    resetResumeForm();
                    loadData();
                } else {
                    showNotify(d.message || 'Failed to delete resume', false);
                }
            } catch (err) {
                showNotify('Error deleting resume', false);
            }
        };

        if (resumeForm) {
            resumeForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = resumeIdInput ? resumeIdInput.value.trim() : '';
                const title = resumeTitleInput ? resumeTitleInput.value.trim() : '';
                const isActive = resumeIsActiveInput ? resumeIsActiveInput.checked : true;

                if (!title) {
                    showNotify('Please enter a resume title / label!', false);
                    return;
                }

                if (!id && !resumeSelectedFile) {
                    showNotify('Please select a PDF file to upload!', false);
                    return;
                }

                const form = new FormData();
                if (id) form.append('id', id);
                form.append('title', title);
                form.append('isActive', isActive ? 'true' : 'false');
                if (resumeSelectedFile) {
                    form.append('resume', resumeSelectedFile);
                }

                try {
                    const res = await fetch('/api/admin/resumes', { method: 'POST', body: form });
                    const d = await res.json();
                    if (d.success) {
                        showNotify(id ? 'Resume updated successfully!' : 'Resume uploaded & added successfully!');
                        resetResumeForm();
                        loadData();
                    } else {
                        showNotify(d.message || 'Error saving resume', false);
                    }
                } catch (err) {
                    showNotify('Failed to save resume', false);
                }
            });
        }


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
            renderFromLocalCache(); // Instantaneous 0ms render from cache!
            const hash = window.location.hash.replace('#', '');
            if (hash && ['projects', 'certificates', 'skills', 'education', 'experience', 'resume'].includes(hash)) {
                switchPage(hash);
            }
            checkAuth();
        
        // Handle More Certificates Drive Folder Form Submission
        const moreCertsForm = document.getElementById('moreCertsFolderForm');
        if (moreCertsForm) {
            moreCertsForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const folderUrl = document.getElementById('moreCertsFolderUrl').value.trim();
                const saveBtn = document.getElementById('saveMoreCertsFolderBtn');
                if (saveBtn) saveBtn.innerHTML = '<span>Saving...</span>';

                try {
                    const res = await fetch('/api/admin/certificates/drive-folder', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url: folderUrl })
                    });
                    const d = await res.json();
                    if (d.success) {
                        showNotify('Certificates Drive Folder link saved successfully!');
                        PORTFOLIO_DATA.moreCertificatesDriveUrl = folderUrl;
                        PORTFOLIO_DATA.certificatesDriveFolder = folderUrl;
                        const folderLink = document.getElementById('moreCertsDrivePreviewLink');
                        if (folderLink) {
                            if (folderUrl) {
                                folderLink.href = folderUrl;
                                folderLink.style.display = 'inline-flex';
                            } else {
                                folderLink.style.display = 'none';
                            }
                        }
                    } else {
                        showNotify(d.message || 'Error saving folder URL', false);
                    }
                } catch (err) {
                    showNotify('Failed to connect to server: ' + err.message, false);
                } finally {
                    if (saveBtn) saveBtn.innerHTML = '<span>💾 Save Folder URL</span>';
                }
            });
        }

        window.editExperience = editExperience;
        window.deleteExperience = deleteExperience;
        window.cancelExpEdit = cancelExpEdit;

});
