/* ==========================================================================

   SUBHANKAR GIRI – DATA SCIENTIST & ANALYST PORTFOLIO

   Script engine: theme, 11-section routing, left mobile drawer navigation,

   5-photo top gallery selector with forward/backward buttons, live GitHub sync.

   ========================================================================== */

const PORTFOLIO_STATE = {

    currentPage: 'intro',

    isTransitioning: false,

    pagesOrder: ['intro', 'about', 'skills', 'projects', 'certificates', 'education', 'experience', 'achievements', 'github', 'resume', 'contact']

};

function initApp() {

    init3DPreloader();

    initTheme();

    initRouter();

    initMobileDrawer();

    initTypingEffect();

    initKernelControls();

    initKeyboardNav();

    initSkillAnimation();

    initProjectFilters();

    initProjectNav();

    initGitHubHeatmap();

    initGitHubLiveSync();

    initCopyButtons();

    initContactForm();

    init3DTiltEffect();

    initLaptop3DMovable();

    initCopyrightModal();

}

// Note: Initialization safely triggered at end of script evaluation

/* --------------------------------------------------------------------------

   0. 3D Holographic Preloader Screen (Gyroscopic Orbital Atom)

   -------------------------------------------------------------------------- */

function init3DPreloader() {

    const preloader = document.getElementById('portfolioPreloader');

    if (!preloader) return;

    const fill = document.getElementById('preloaderProgressFill');

    const pct = document.getElementById('preloaderPctVal');

    const msg = document.getElementById('preloaderStatusMsg');

    let progress = 0;

    let completed = false;

    function finishPreloader() {

        if (completed) return;

        completed = true;

        if (fill) fill.style.width = '100%';

        if (pct) pct.textContent = '100%';

        if (msg) msg.textContent = 'Ready · portfolio.ipynb launched';

        setTimeout(() => {

            preloader.classList.add('fade-out');

            setTimeout(() => {

                preloader.style.display = 'none';

            }, 300);

        }, 80);

    }

    // Allow user click to skip immediately

    preloader.addEventListener('click', finishPreloader);

    preloader.addEventListener('touchstart', finishPreloader, { passive: true });

    // Guaranteed preloader safety fallback: dismisses after 850ms

    setTimeout(() => {

        if (!completed) finishPreloader();

    }, 850);

    // High-performance progress loop: completes smoothly in ~350ms - 450ms

    const interval = setInterval(() => {

        if (progress >= 100) {

            clearInterval(interval);

            finishPreloader();

            return;

        }

        const inc = Math.floor(Math.random() * 12) + 8;

        progress = Math.min(100, progress + inc);

        if (fill) fill.style.width = progress + '%';

        if (pct) pct.textContent = progress + '%';

        if (msg) {

            if (progress <= 35) {

                msg.textContent = 'Initializing Python 3 Kernel...';

            } else if (progress <= 70) {

                msg.textContent = 'Loading NumPy & Pandas Pipelines...';

            } else {

                msg.textContent = 'Launching Data Science Studio...';

            }

        }

    }, 22);

}

/* --------------------------------------------------------------------------

   1. Theme Management (Automatic Day/Night + Manual Toggle)

   -------------------------------------------------------------------------- */

function initTheme() {

    const desktopToggle = document.getElementById('desktopThemeToggle');

    const mobileToggle = document.getElementById('mobileThemeToggle');

    const themeLabel = document.getElementById('themeLabel');

    // Determines theme based on local time:

    // Light time (Daytime): 6:00 AM (06:00) to 6:00 PM (18:00) -> 'light'

    // Dark time (Nighttime): 6:00 PM (18:00) to 6:00 AM (06:00) -> 'dark'

    function getTimeBasedTheme() {

        const hour = new Date().getHours();

        return (hour >= 6 && hour < 18) ? 'light' : 'dark';

    }

    // Check if user has explicitly chosen a theme in this session

    const isManualOverride = sessionStorage.getItem('sg_portfolio_theme_manual') === 'true';

    const savedTheme = localStorage.getItem('sg_portfolio_theme');

    // Default to time-based theme unless explicitly overridden by user

    const initialTheme = (isManualOverride && savedTheme) ? savedTheme : getTimeBasedTheme();

    setTheme(initialTheme, isManualOverride);

    // Live monitor: automatically transition theme at dawn/dusk if user hasn't forced manual override

    setInterval(() => {

        const stillManual = sessionStorage.getItem('sg_portfolio_theme_manual') === 'true';

        if (!stillManual) {

            const timeTheme = getTimeBasedTheme();

            const currentTheme = document.documentElement.getAttribute('data-theme');

            if (timeTheme !== currentTheme) {

                setTheme(timeTheme, false);

            }

        }

    }, 60000);

    // Manual toggle listeners for desktop and mobile buttons

    [desktopToggle, mobileToggle].forEach(btn => {

        if (btn) {

            btn.addEventListener('click', () => {

                const current = document.documentElement.getAttribute('data-theme') || getTimeBasedTheme();

                const next = current === 'dark' ? 'light' : 'dark';

                sessionStorage.setItem('sg_portfolio_theme_manual', 'true');

                setTheme(next, true);

            });

        }

    });

    function setTheme(theme, isManual = false) {

        // Prevent layout/transition lag across 371+ grid elements during theme switch

        document.documentElement.classList.add('theme-switching');

        document.documentElement.setAttribute('data-theme', theme);

        localStorage.setItem('sg_portfolio_theme', theme);

        if (themeLabel) {

            const isAuto = !isManual && (theme === getTimeBasedTheme());

            themeLabel.textContent = theme === 'dark'

                ? (isAuto ? 'Dark theme (Night)' : 'Dark theme')

                : (isAuto ? 'Light theme (Day)' : 'Light theme');

        }

        [desktopToggle, mobileToggle].forEach(btn => {

            if (btn) {

                btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);

                btn.setAttribute('title', `Current: ${theme === 'dark' ? 'Dark' : 'Light'} theme (Click to toggle)`);

            }

        });

        // Re-enable smooth component transitions on next frame

        requestAnimationFrame(() => {

            requestAnimationFrame(() => {

                document.documentElement.classList.remove('theme-switching');

            });

        });

    }

}

/* --------------------------------------------------------------------------

   2. Left Mobile Drawer Open / Close Toggle Navigation

   -------------------------------------------------------------------------- */

function initMobileDrawer() {

    const openBtn = document.getElementById('mobileSidebarToggle');

    const closeBtn = document.getElementById('mobileDrawerCloseBtn');

    const sidebar = document.getElementById('notebookSidebar');

    const overlay = document.getElementById('mobileDrawerOverlay');

    function openDrawer(e) {

        if (e) {

            e.preventDefault();

            e.stopPropagation();

        }

        if (sidebar) sidebar.classList.add('drawer-open');

        if (overlay) overlay.classList.add('active');

        document.body.style.overflow = 'hidden';

    }

    function closeDrawer() {

        if (sidebar) sidebar.classList.remove('drawer-open');

        if (overlay) overlay.classList.remove('active');

        document.body.style.overflow = '';

    }

    if (openBtn) openBtn.addEventListener('click', openDrawer);

    if (closeBtn) closeBtn.addEventListener('click', (e) => {

        e.preventDefault();

        e.stopPropagation();

        closeDrawer();

    });

    if (overlay) overlay.addEventListener('click', closeDrawer);

    // Close drawer when any sidebar link is clicked

    document.querySelectorAll('.sidebar-nav-item, .notebook-sidebar a, .notebook-sidebar button:not(#mobileDrawerCloseBtn)').forEach(item => {

        item.addEventListener('click', () => {

            if (window.innerWidth < 1024) {

                closeDrawer();

            }

        });

    });

    // Close on Escape key

    document.addEventListener('keydown', (e) => {

        if (e.key === 'Escape' && sidebar && sidebar.classList.contains('drawer-open')) {

            closeDrawer();

        }

    });

}

/* --------------------------------------------------------------------------

   3. Dynamic Typing Effect for Section [1] Intro

   -------------------------------------------------------------------------- */

let typingTimeoutId = null;

let typingPhraseIdx = 0;

let typingCharIdx = 0;

let typingIsDeleting = false;

function initTypingEffect() {

    restartTypingEffect();

}

function restartTypingEffect() {

    if (typingTimeoutId) {

        clearTimeout(typingTimeoutId);

        typingTimeoutId = null;

    }

    const target = document.getElementById('typingText');

    if (!target) return;

    target.textContent = '';

    typingPhraseIdx = 0;

    typingCharIdx = 0;

    typingIsDeleting = false;

    const phrases = [

        'Data Scientist',

        'Data Analyst',

        'Machine Learning Specialist',

        'Python & BI Developer',

        'AI Engineering Enthusiast'

    ];

    let speed = 90;

    function type() {

        const currentPhrase = phrases[typingPhraseIdx];

        if (typingIsDeleting) {

            target.textContent = currentPhrase.substring(0, typingCharIdx - 1);

            typingCharIdx--;

            speed = 45;

        } else {

            target.textContent = currentPhrase.substring(0, typingCharIdx + 1);

            typingCharIdx++;

            speed = 90;

        }

        if (!typingIsDeleting && typingCharIdx === currentPhrase.length) {

            typingIsDeleting = true;

            speed = 1800; // Pause at end

        } else if (typingIsDeleting && typingCharIdx === 0) {

            typingIsDeleting = false;

            typingPhraseIdx = (typingPhraseIdx + 1) % phrases.length;

            speed = 400;

        }

        typingTimeoutId = setTimeout(type, speed);

    }

    typingTimeoutId = setTimeout(type, 350);

}

/* --------------------------------------------------------------------------

   4. Single-Page Navigation Router (11 Sections) - Instant & Non-blocking

   -------------------------------------------------------------------------- */

function initRouter() {

    document.addEventListener('click', (e) => {

        const link = e.target.closest('a[href^="#"], button[data-nav], a[data-nav], a[data-page], button[data-page], .sidebar-nav-item, .nav-pill, .btn-section-nav');

        if (!link || link.classList.contains('notebook-page') || link.tagName === 'SECTION') return;

        if (!link) return;

        let targetPage = link.getAttribute('data-nav') || link.getAttribute('data-page');

        if (!targetPage) {

            const href = link.getAttribute('href');

            if (href && href.startsWith('#')) {

                targetPage = href.slice(1);

            }

        }

        if (!targetPage) return;

        if (PORTFOLIO_STATE.pagesOrder.includes(targetPage)) {

            e.preventDefault();

            navigateToPage(targetPage);

        }

    });

    window.addEventListener('popstate', () => {

        const hash = window.location.hash.replace('#', '');

        if (PORTFOLIO_STATE.pagesOrder.includes(hash)) {

            navigateToPage(hash, false);

        } else {

            navigateToPage('intro', false);

        }

    });

    const initialHash = window.location.hash.replace('#', '');

    if (PORTFOLIO_STATE.pagesOrder.includes(initialHash)) {

        navigateToPage(initialHash, false);

    } else {

        navigateToPage('intro', false);

    }

}

function navigateToPage(pageId, updateHistory = true) {

    if (!pageId || !PORTFOLIO_STATE.pagesOrder.includes(pageId)) return;

    // If clicking current page when already visible, scroll smoothly to top

    if (PORTFOLIO_STATE.currentPage === pageId) {

        const activeEl = document.getElementById(`page-${pageId}`);

        if (activeEl && activeEl.classList.contains('active')) {

            window.scrollTo({ top: 0, behavior: 'smooth' });

            return;

        }

    }

    const progressLine = document.getElementById('kernelProgressLine');

    const statusDot = document.getElementById('statusDot');

    const statusText = document.getElementById('statusText');

    const kernelDocStatus = document.getElementById('kernelDocStatus');

    if (statusDot) statusDot.className = 'status-indicator-dot busy';

    if (statusText) statusText.textContent = 'Python 3 | busy';

    if (progressLine) {

        progressLine.classList.add('loading');

        setTimeout(() => progressLine.classList.remove('loading'), 320);

    }

    try {

        // Synchronous & instant section reveal - zero dropped clicks

        document.querySelectorAll('.notebook-page').forEach(p => {

            p.classList.remove('active');

            p.style.display = 'none';

        });

        const targetPageEl = document.getElementById(`page-${pageId}`);

        if (targetPageEl) {

            targetPageEl.style.display = 'block';

            targetPageEl.classList.add('active');

            targetPageEl.style.opacity = '1';

            targetPageEl.style.transform = 'translateY(0)';

        }

        PORTFOLIO_STATE.currentPage = pageId;

        if (updateHistory) {

            history.pushState(null, '', `#${pageId}`);

        }

        window.scrollTo({ top: 0, behavior: 'smooth' });

        updateNavLinks(pageId);

        // Power-saving & low-device smoothness: pause snake engine when not viewing GitHub

        if (typeof snakeEngine !== 'undefined' && snakeEngine) {

            if (pageId === 'github') {

                snakeEngine.start();

            } else {

                snakeEngine.stop();

            }

        }

        if (statusDot) statusDot.className = 'status-indicator-dot idle';

        if (statusText) statusText.textContent = 'Python 3 | idle';

        if (kernelDocStatus) kernelDocStatus.textContent = 'portfolio.ipynb · ready';

        if (pageId === 'skills') {

            animateSkillBars();

        }

        if (pageId === 'github') {

            if (typeof snakeEngine === 'undefined' || !snakeEngine) {

                initGitHubHeatmap();

            } else {

                if (!snakeEngine.grid || snakeEngine.grid.length === 0) {

                    snakeEngine.init();

                } else {

                    snakeEngine.start();

                }

            }

            if (typeof window.triggerGitHubAnalyticsSync === 'function') {

                window.triggerGitHubAnalyticsSync();

            }

        } else if (typeof snakeEngine !== 'undefined' && snakeEngine) {

            snakeEngine.stop();

        }

    } catch (err) {

        console.error("Navigation error:", err);

    } finally {

        PORTFOLIO_STATE.isTransitioning = false;

    }

}

function updateNavLinks(pageId) {

    document.querySelectorAll('.sidebar-nav-item').forEach(item => {

        if (item.getAttribute('data-page') === pageId) {

            item.classList.add('active');

        } else {

            item.classList.remove('active');

        }

    });

    document.querySelectorAll('.nav-pill').forEach(pill => {

        if (pill.getAttribute('data-page') === pageId) {

            pill.classList.add('active');

            pill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

        } else {

            pill.classList.remove('active');

        }

    });

}

/* --------------------------------------------------------------------------

   5. Kernel Controls ("Run all" & "Restart kernel")

   -------------------------------------------------------------------------- */

function initKernelControls() {

    const runAllBtn = document.getElementById('runAllBtn');

    const restartKernelBtn = document.getElementById('restartKernelBtn');

    const cellRunBtns = document.querySelectorAll('.cell-run-btn');

    if (runAllBtn) {

        runAllBtn.addEventListener('click', () => {

            runAllPagesSequence();

        });

    }

    if (restartKernelBtn) {

        restartKernelBtn.addEventListener('click', () => {

            restartKernel();

        });

    }

    cellRunBtns.forEach(btn => {

        btn.addEventListener('click', (e) => {

            e.preventDefault();

            e.stopPropagation();

            const pageId = btn.getAttribute('data-run') || PORTFOLIO_STATE.currentPage;

            executePageCell(pageId, btn);

        });

    });

}

function executePageCell(pageId, triggerBtn) {

    const targetPageId = pageId || PORTFOLIO_STATE.currentPage;

    const pageEl = document.getElementById(`page-${targetPageId}`) || document.getElementById(`page-${PORTFOLIO_STATE.currentPage}`);

    if (!pageEl) return;

    const cell = pageEl.querySelector('.notebook-cell');

    const inputRow = pageEl.querySelector('.cell-input-row');

    const outputRow = pageEl.querySelector('.cell-output-row') || cell;

    const btn = triggerBtn || pageEl.querySelector('.cell-run-btn');

    const progressLine = document.getElementById('kernelProgressLine');

    const statusDot = document.getElementById('statusDot');

    const statusText = document.getElementById('statusText');

    const kernelDocStatus = document.getElementById('kernelDocStatus');

    // 1. Visual execution indicators

    if (statusDot) statusDot.className = 'status-indicator-dot busy';

    if (statusText) statusText.textContent = `Python 3 | busy (In [${targetPageId}])`;

    if (progressLine) progressLine.classList.add('loading');

    if (kernelDocStatus) kernelDocStatus.textContent = `Executing cell [${targetPageId}]...`;

    if (btn) btn.classList.add('executing');

    if (cell) cell.classList.add('cell-executing-pulse');

    if (inputRow) inputRow.classList.add('cell-executing-pulse');

    if (outputRow) {

        outputRow.classList.remove('output-refreshed-flash');

        outputRow.classList.add('output-refreshing');

    }

    // 2. Refresh page-specific components

    if (targetPageId === 'intro') {

        restartTypingEffect();

    } else if (targetPageId === 'skills') {

        resetSkillBars();

        setTimeout(animateSkillBars, 150);

    } else if (targetPageId === 'projects') {

        const allChip = document.querySelector('.filter-chip[data-filter="all"]');

        if (allChip) {

            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));

            allChip.classList.add('active');

        }

    } else if (targetPageId === 'github') {

        if (!snakeEngine) {

            initGitHubHeatmap();

        } else {

            snakeEngine.stop();

            snakeEngine.init();

        }

        if (typeof window.triggerGitHubAnalyticsSync === 'function') {

            window.triggerGitHubAnalyticsSync();

        }

    } else if (targetPageId === 'contact') {

        const form = document.getElementById('contactForm');

        if (form) form.reset();

    }

    // 3. Complete cell execution after 450ms

    setTimeout(() => {

        if (btn) btn.classList.remove('executing');

        if (cell) cell.classList.remove('cell-executing-pulse');

        if (inputRow) inputRow.classList.remove('cell-executing-pulse');

        if (outputRow) {

            outputRow.classList.remove('output-refreshing');

            outputRow.classList.add('output-refreshed-flash');

            setTimeout(() => {

                outputRow.classList.remove('output-refreshed-flash');

            }, 600);

        }

        if (statusDot) statusDot.className = 'status-indicator-dot idle';

        if (statusText) statusText.textContent = 'Python 3 | idle';

        if (progressLine) progressLine.classList.remove('loading');

        if (kernelDocStatus) kernelDocStatus.textContent = `portfolio.ipynb · [${targetPageId}] executed`;

    }, 450);

}

function runAllPagesSequence() {

    const pages = PORTFOLIO_STATE.pagesOrder;

    let idx = 0;

    const kernelDocStatus = document.getElementById('kernelDocStatus');

    if (kernelDocStatus) kernelDocStatus.textContent = 'Executing portfolio.ipynb cells...';

    function runNext() {

        if (idx < pages.length) {

            navigateToPage(pages[idx]);

            idx++;

            setTimeout(runNext, 900);

        } else {

            if (kernelDocStatus) kernelDocStatus.textContent = 'All 11 cells executed successfully.';

        }

    }

    runNext();

}

function restartKernel() {

    const statusText = document.getElementById('statusText');

    const kernelDocStatus = document.getElementById('kernelDocStatus');

    if (statusText) statusText.textContent = 'Kernel restarting...';

    if (kernelDocStatus) kernelDocStatus.textContent = 'Restarting Python 3 kernel...';

    const allChip = document.querySelector('.filter-chip[data-filter="all"]');

    if (allChip) allChip.click();

    const contactForm = document.getElementById('contactForm');

    if (contactForm) contactForm.reset();

    resetSkillBars();

    setTimeout(() => {

        navigateToPage('intro');

        if (statusText) statusText.textContent = 'Python 3 | idle';

        if (kernelDocStatus) kernelDocStatus.textContent = 'portfolio.ipynb · ready';

    }, 600);

}

function initKeyboardNav() {

    document.addEventListener('keydown', (e) => {

        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {

            return;

        }

        const currentIndex = PORTFOLIO_STATE.pagesOrder.indexOf(PORTFOLIO_STATE.currentPage);

        if (e.key === 'ArrowRight' || (e.shiftKey && e.key === 'Enter')) {

            if (currentIndex < PORTFOLIO_STATE.pagesOrder.length - 1) {

                e.preventDefault();

                navigateToPage(PORTFOLIO_STATE.pagesOrder[currentIndex + 1]);

            }

        }

        if (e.key === 'ArrowLeft') {

            if (currentIndex > 0) {

                e.preventDefault();

                navigateToPage(PORTFOLIO_STATE.pagesOrder[currentIndex - 1]);

            }

        }

    });

}

/* --------------------------------------------------------------------------

   6. Skills Bar Animation

   -------------------------------------------------------------------------- */

function initSkillAnimation() {

    if (PORTFOLIO_STATE.currentPage === 'skills') {

        setTimeout(animateSkillBars, 350);

    }

}

function animateSkillBars() {

    const rows = document.querySelectorAll('.skill-row');

    rows.forEach(row => {

        const val = row.getAttribute('data-val');

        const bar = row.querySelector('.skill-bar-fill');

        if (bar && val) {

            bar.style.width = `${val}%`;

        }

    });

}

function resetSkillBars() {

    const bars = document.querySelectorAll('.skill-bar-fill');

    bars.forEach(bar => {

        bar.style.width = '0%';

    });

}

/* --------------------------------------------------------------------------

   7. Projects Filter Chips

   -------------------------------------------------------------------------- */

function initProjectFilters() {

    // Project filter chips and category switching are synchronized in initProjectNav()

}

const SKILL_SVGS = {

    'python': '<svg viewBox="0 0 128 128" width="24" height="24"><path fill="#38BDF8" d="M63.391 1.988c-4.222.02-8.252.379-11.8 1.007-10.45 1.846-12.346 5.71-12.346 12.837v9.411h24.693v3.137H29.977c-7.176 0-13.46 4.313-15.426 12.521-2.268 9.405-2.368 15.275 0 25.096 1.755 7.311 5.947 12.519 13.124 12.519h8.491V67.234c0-8.151 7.051-15.34 15.426-15.34h24.665c6.866 0 12.346-5.654 12.346-12.548V15.833c0-6.693-5.646-11.72-12.346-12.837-4.244-.706-8.645-1.027-12.866-1.008zM50.037 9.557c2.55 0 4.634 2.117 4.634 4.721 0 2.593-2.083 4.69-4.634 4.69-2.56 0-4.633-2.097-4.633-4.69-.001-2.604 2.073-4.721 4.633-4.721z" transform="translate(0 10.26)"/><path fill="#FFD43B" d="M91.682 28.38v10.966c0 8.5-7.208 15.655-15.426 15.655H51.591c-6.756 0-12.346 5.783-12.346 12.549v23.515c0 6.691 5.818 10.628 12.346 12.547 7.816 2.297 15.312 2.713 24.665 0 6.216-1.801 12.346-5.423 12.346-12.547v-9.412H63.938v-3.138h37.012c7.176 0 9.852-5.005 12.348-12.519 2.578-7.735 2.467-15.174 0-25.096-1.774-7.145-5.161-12.521-12.348-12.521h-9.268zM77.809 87.927c2.561 0 4.634 2.097 4.634 4.692 0 2.602-2.074 4.719-4.634 4.719-2.55 0-4.633-2.117-4.633-4.719 0-2.595 2.083-4.692 4.633-4.692z" transform="translate(0 10.26)"/></svg>',

    'streamlit': '<svg viewBox="0 0 24 24" width="24" height="24" fill="#FF4B4B"><path d="M16.673 11.32l6.862-3.618c.233-.136.554.12.442.387L20.463 17.1zm-8.556-.229l3.473-5.187c.203-.328.578-.316.793-.028l7.886 11.75zm-3.375 7.25c-.28 0-.835-.284-.993-.716l-3.72-9.46c-.118-.331.139-.614.48-.464l19.474 10.306c-.149.147-.453.337-.72.334z"/></svg>',

    'pandas': '<svg viewBox="0 0 128 128" width="24" height="24"><rect width="128" height="128" rx="22" fill="#150458"/><rect x="18" y="22" width="18" height="84" rx="5" fill="#FF4A83"/><rect x="44" y="48" width="18" height="58" rx="5" fill="#E70488"/><rect x="70" y="32" width="18" height="74" rx="5" fill="#FFD43B"/><rect x="96" y="58" width="18" height="48" rx="5" fill="#00D2B4"/></svg>',

    'numpy': '<svg viewBox="0 0 128 128" width="24" height="24"><path fill="#4DABCF" d="M64 4l52 30v60L64 124 12 94V34z"/><path fill="#013243" d="M64 4v60l52 30V34z" opacity="0.3"/><path fill="#ffffff" d="M42 42h11v21l22-21h13v44H77V65L55 86H42z"/></svg>',

    'matplotlib': '<svg viewBox="0 0 128 128" width="24" height="24"><path fill="#11557C" d="M64 4a60 60 0 1 0 60 60A60 60 0 0 0 64 4zm0 108a48 48 0 1 1 48-48 48 48 0 0 1-48 48z"/><path fill="#2CA02C" d="M64 16a48 48 0 0 0-48 48h48z"/><path fill="#FF7F0E" d="M64 16v48h48A48 48 0 0 0 64 16z"/><path fill="#D62728" d="M64 64H16a48 48 0 0 0 48 48z"/><path fill="#1F77B4" d="M64 64v48a48 48 0 0 0 48-48z"/><circle cx="64" cy="64" r="14" fill="#ffffff"/></svg>',

    'seaborn': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none"><rect width="24" height="24" rx="6" fill="#0A192F"/><path d="M4 14c2.5-4 5-4 8 0s5.5 4 8 0" stroke="#00F2FE" stroke-width="2.2" stroke-linecap="round"/><path d="M4 10c2.5-4 5-4 8 0s5.5 4 8 0" stroke="#38BDF8" stroke-width="2.2" stroke-linecap="round" opacity="0.8"/></svg>',

    'scikit': '<svg viewBox="0 0 128 128" width="24" height="24"><path fill="#F89939" d="M98.18 88.13c15.63-15.62 18.23-38.36 5.8-50.78-12.43-12.42-35.17-9.82-50.8 5.8-15.63 15.62-11.11 45.48-5.8 50.78 4.29 4.29 35.17 9.82 50.8-5.8Z"/><path fill="#3499CD" d="M34.04 65.56c-9.07-9.06-22.27-10.57-29.48-3.37-7.21 7.21-5.7 20.4 3.37 29.46 9.07 9.07 26.4 6.44 29.48 3.37 2.49-2.49 5.71-20.4-3.37-29.46Z"/><ellipse cx="64" cy="64" rx="14" ry="14" fill="#FFFFFF" fill-opacity="0.95"/></svg>',

    'tensorflow': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" fill="#FF6F00" opacity="0.15"/><path d="M12 2L3 7l9 5 9-5-9-5z" fill="#FFA000"/><path d="M12 12v10l9-5V7l-9 5z" fill="#FF6F00"/><path d="M12 12v10L3 17V7l9 5z" fill="#FF8F00"/></svg>',

    'flask': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M10 2v5.5l-5.8 11.6A2 2 0 0 0 6 22h12a2 2 0 0 0 1.8-2.9L14 7.5V2h-4z" fill="#0F172A" stroke="#00F2FE" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.5 2h7M7 16h10" stroke="#00F2FE" stroke-width="1.8" stroke-linecap="round"/><circle cx="10" cy="18" r="1" fill="#00F2FE"/><circle cx="14" cy="17" r="1.5" fill="#38BDF8"/></svg>',

    'postgres': '<svg viewBox="0 0 128 128" width="24" height="24"><path fill="#336791" d="M64 8c-30.9 0-56 25.1-56 56s25.1 56 56 56 56-25.1 56-56-25.1-56-56-56zm26.2 39.8c-1.3 4.8-4.2 9.2-8.5 12.3 2.1 4.5 4.9 8.7 8.3 12.4-3.5 1.5-7.3 2.3-11.2 2.3-3.2 0-6.3-.5-9.3-1.6-3.8 4.2-9 6.8-14.7 7.3-1.6.1-3.2.1-4.8-.1-2.9 6.2-7.5 11.5-13.3 15.1 4.3 2.9 9.5 4.6 15 4.6 13.9 0 25.5-10.4 27.2-24 4.7-.8 9.1-2.8 12.8-5.7 3.5 3.3 7.8 5.7 12.6 7 2.2-4.1 3.5-8.8 3.5-13.8 0-6.8-2.4-13.1-6.6-18z"/></svg>',

    'sql': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none"><ellipse cx="12" cy="5" rx="8" ry="3" stroke="#00F2FE" stroke-width="1.8"/><path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" stroke="#00F2FE" stroke-width="1.8"/><path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" stroke="#38BDF8" stroke-width="1.8"/></svg>',

    'powerbi': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none"><rect width="24" height="24" rx="5" fill="#1E1E1E"/><rect x="4" y="13" width="4" height="7" rx="1" fill="#F2C811"/><rect x="10" y="8" width="4" height="12" rx="1" fill="#F2C811"/><rect x="16" y="4" width="4" height="16" rx="1" fill="#F2C811"/></svg>',

    'eda': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none"><rect x="3" y="12" width="4" height="8" rx="1" fill="#22D3EE"/><rect x="9.5" y="7" width="4" height="13" rx="1" fill="#38BDF8"/><rect x="16" y="3" width="4" height="17" rx="1" fill="#A855F7"/><path d="M4 10 L11 5 L18 2" stroke="#FACC15" stroke-width="1.8" stroke-linecap="round"/></svg>',

    'stats': '<svg viewBox="0 0 24 24" width="24" height="24" fill="none"><path d="M3 19h18" stroke="#64748B" stroke-width="1.5"/><path d="M4 16c3-1 5-11 8-11s5 10 8 11" stroke="#FACC15" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="5" r="1.8" fill="#00F2FE"/></svg>',

    'github': '<svg viewBox="0 0 24 24" width="24" height="24" fill="#F0F6FC"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>'

};

function initProjectNav() {

    const STUDIO_PROJECTS = {

        'thiranex': {

            id: 'thiranex',

            categoryBadge: 'DATA SCIENCE',

            categoryTag: 'data-science ai ml python',

            title: 'Thiranex Data Science Unified Portal',

            description: 'An interactive 4-in-1 full-stack Data Science web application covering automated data cleaning, predictive ML modeling, statistical workforce EDA, and an enterprise customer churn AI simulator with financial ROI optimization.',

            codeUrl: 'https://github.com/thesubhankar',

            demoUrl: 'https://thiranex-internship-njtpmctjcmcphu6hywitxa.streamlit.app/',

            slides: [

                { webp: 'assets/project image/thrianex image/thumblain.webp', alt: 'Thiranex Data Science Unified Portal Overview' },

                { webp: 'assets/project image/thrianex image/task1_data_cleaning.webp', alt: 'Automated Data Cleaning & Imputation Pipeline' },

                { webp: 'assets/project image/thrianex image/task2_store_sales_ml.webp', alt: 'Store Sales Predictive Forecasting Engine' },

                { webp: 'assets/project image/thrianex image/task3_workforce_eda.webp', alt: 'Statistical Workforce Analytics & EDA Module' },

                { webp: 'assets/project image/thrianex image/task4_retail_churn_ai.webp', alt: 'Enterprise Customer Churn AI Simulator' }

            ],

            skills: [

                { name: 'Python', type: 'python' },

                { name: 'Streamlit', type: 'streamlit' },

                { name: 'Pandas', type: 'pandas' },

                { name: 'NumPy', type: 'numpy' },

                { name: 'Scikit-learn', type: 'scikit' },

                { name: 'Matplotlib', type: 'matplotlib' },

                { name: 'Seaborn', type: 'seaborn' },

                { name: 'GitHub', type: 'github' }

            ]

        },

        'student': {

            id: 'student',

            categoryBadge: 'PYTHON / APPLICATION',

            categoryTag: 'python ai',

            title: 'Student Management System',

            description: 'A comprehensive desktop & web application for educational institutions featuring student records management, fee tracking, academic analytics, and automated reporting.',

            codeUrl: 'https://github.com/thesubhankar',

            demoUrl: 'https://share.streamlit.io/user/thesubhankar',

            slides: [

                { webp: 'assets/project image/employee/emp_slide1.webp', alt: 'Student Management System Overview & Student Directory' },

                { webp: 'assets/project image/employee/emp_slide2.webp', alt: 'Student Enrollment Analytics & SQLite Relational Backend' },

                { webp: 'assets/project image/employee/emp_slide3.webp', alt: 'Student Digital ID Card Generation & Tkinter GUI' }

            ],

            skills: [

                { name: 'Python', type: 'python' },

                { name: 'SQLite', type: 'postgres' },

                { name: 'Tkinter', type: 'flask' },

                { name: 'OOP', type: 'python' },

                { name: 'Pandas', type: 'pandas' },

                { name: 'Matplotlib', type: 'matplotlib' },

                { name: 'Data Struct', type: 'numpy' },

                { name: 'Reporting', type: 'seaborn' },

                { name: 'Automation', type: 'scikit' },

                { name: 'GitHub', type: 'github' }

            ]

        },

        'movie': {

            id: 'movie',

            categoryBadge: 'AI / MACHINE LEARNING',

            categoryTag: 'ml ai data-science',

            title: 'Movie Recommendation System',

            description: 'An intelligent content-based & collaborative filtering recommendation engine utilizing cosine similarity and matrix factorization to deliver hyper-personalized movie suggestions.',

            codeUrl: 'https://github.com/thesubhankar',

            demoUrl: 'https://share.streamlit.io/user/thesubhankar',

            slides: [

                { webp: 'assets/project image/movie/movie_slide1.webp', alt: 'Movie Recommendation Engine Model Matrix' },

                { webp: 'assets/project image/movie/movie_slide2.webp', alt: 'TF-IDF Similarity Matrix & SVD Predictions' },

                { webp: 'assets/project image/movie/movie_slide3.webp', alt: 'Top-N Personalized Recommendations Interface' }

            ],

            skills: [

                { name: 'Python', type: 'python' },

                { name: 'Scikit-learn', type: 'scikit' },

                { name: 'Pandas', type: 'pandas' },

                { name: 'NumPy', type: 'numpy' },

                { name: 'NLP', type: 'tensorflow' },

                { name: 'Cosine Sim', type: 'seaborn' },

                { name: 'TF-IDF', type: 'matplotlib' },

                { name: 'Streamlit', type: 'streamlit' },

                { name: 'TMDb API', type: 'postgres' },

                { name: 'GitHub', type: 'github' }

            ]

        },

        'logistics': {

            id: 'logistics',

            categoryBadge: 'DATA ANALYSIS',

            categoryTag: 'data-analysis ai',

            title: 'Logistics Operations & Fleet Telematics Analytics',

            description: 'Enterprise telematics analytics dashboard optimizing fleet fuel efficiency, delivery routing latency, maintenance forecasting, and supply chain telemetry insights.',

            codeUrl: 'https://github.com/thesubhankar',

            demoUrl: 'https://share.streamlit.io/user/thesubhankar',

            slides: [

                { webp: 'assets/project image/logistics/logistics_slide1.webp', alt: 'Shipment Telematics & 3PL Benchmark Dashboard' },

                { webp: 'assets/project image/logistics/logistics_slide2.webp', alt: 'Transportation Cost Function OLS Regression Analysis' },

                { webp: 'assets/project image/logistics/logistics_slide3.webp', alt: 'Regional Corridor Heatmap & Delay Analysis' }

            ],

            skills: [

                { name: 'Python', type: 'python' },

                { name: 'Pandas', type: 'pandas' },

                { name: 'Power BI', type: 'powerbi' },

                { name: 'SQL', type: 'sql' },

                { name: 'Optimization', type: 'tensorflow' },

                { name: 'Telematics', type: 'flask' },

                { name: 'Time Series', type: 'numpy' },

                { name: 'Seaborn', type: 'seaborn' },

                { name: 'Matplotlib', type: 'matplotlib' },

                { name: 'GitHub', type: 'github' }

            ]

        },

        'supply': {

            id: 'supply',

            categoryBadge: 'DATA ANALYSIS / OPTIMIZATION',

            categoryTag: 'data-analysis ai',

            title: 'Supply Chain & Inventory Optimization Analytics',

            description: 'End-to-end inventory health dashboard predicting safety stock levels, supply bottleneck risks, supplier fulfillment performance, and warehousing cost reduction.',

            codeUrl: 'https://github.com/thesubhankar',

            demoUrl: 'https://share.streamlit.io/user/thesubhankar',

            slides: [

                { webp: 'assets/project image/supplychain/supply_slide1.webp', alt: 'Supply Chain Executive KPI Dashboard' },

                { webp: 'assets/project image/supplychain/supply_slide2.webp', alt: 'SKU Demand Forecasting & ABC Pareto Analysis' },

                { webp: 'assets/project image/supplychain/supply_slide3.webp', alt: 'Multi-Echelon Freight Routing Optimizer' }

            ],

            skills: [

                { name: 'Python', type: 'python' },

                { name: 'Pandas', type: 'pandas' },

                { name: 'NumPy', type: 'numpy' },

                { name: 'SciPy', type: 'scikit' },

                { name: 'Forecasting', type: 'tensorflow' },

                { name: 'Optimization', type: 'flask' },

                { name: 'SQL', type: 'sql' },

                { name: 'Matplotlib', type: 'matplotlib' },

                { name: 'Seaborn', type: 'seaborn' },

                { name: 'GitHub', type: 'github' }

            ]

        }

    };

    
    // Preload all project images into memory to eliminate loading delay and prevent black screens
    try {
        Object.values(STUDIO_PROJECTS).forEach(proj => {
            if (proj.slides && Array.isArray(proj.slides)) {
                proj.slides.forEach(s => {
                    if (s.webp) {
                        const pre = new Image();
                        pre.src = s.webp;
                    }
                });
            }
        });
    } catch (e) {}

    let currentProjectId = 'thiranex';

    let currentSlideIndex = 0;

    const featuredCard = document.getElementById('thiranexProjectCard');

    const dynamicImg = document.getElementById('projectDynamicImg');

    const webpSource = document.getElementById('projectWebpSource');

    const dynamicTag = document.getElementById('projectDynamicTag');

    const dynamicTitle = document.getElementById('projectDynamicTitle');

    const dynamicDesc = document.getElementById('projectDynamicDesc');

    const skillsGrid = document.getElementById('studioSkillsGrid');

    const codeBtn = document.getElementById('studioCodeBtn');

    const demoBtn = document.getElementById('studioDemoBtn');

    const dotsRow = document.getElementById('carouselDotsRow');

    const prevBtn = document.getElementById('projectPrevBtn');

    const nextBtn = document.getElementById('projectNextBtn');

    const cardInfoPane = document.getElementById('studioCardInfoPane');

    const compactCards = document.querySelectorAll('.compact-project-card');

        // Helper: Trigger momentary background illumination on main card (category or project change)

    function triggerCardBgLight() {
        // Calm subtle background pulse without forced synchronous reflows
        if (!featuredCard) return;
        featuredCard.classList.remove('card-bg-light-flash');
        featuredCard.classList.add('card-bg-light-flash');
        setTimeout(() => {
            if (featuredCard) featuredCard.classList.remove('card-bg-light-flash');
        }, 500);
    }

    // Helper: Trigger soft 4-sided edge glow around laptop on image slide change

    function triggerLaptopSoftGlow() {

        const laptopMockup = document.getElementById('featuredLaptopMockup');

        if (!laptopMockup) return;

        laptopMockup.classList.remove('laptop-soft-glow');

        void laptopMockup.offsetWidth;

        laptopMockup.classList.add('laptop-soft-glow');

        setTimeout(() => {

            if (laptopMockup) laptopMockup.classList.remove('laptop-soft-glow');

        }, 700);

    }

    function renderActiveProject(projectId, animate = true) {

        currentProjectId = projectId;

        currentSlideIndex = 0;

        const proj = STUDIO_PROJECTS[projectId];

        if (!proj) return;

        // 1. Update active compact card highlight in bottom tray

        compactCards.forEach(c => {

            if (c.getAttribute('data-project-id') === projectId) {

                c.classList.add('active-preview');

            } else {

                c.classList.remove('active-preview');

            }

        });

        // 2. Momentary light in main card background on project change

        if (animate) {

            triggerCardBgLight();

        }

        // 3. Smooth crossfade animation on card info

        if (animate && cardInfoPane) {

            cardInfoPane.classList.remove('info-fade-pulse');

            void cardInfoPane.offsetWidth;

            cardInfoPane.classList.add('info-fade-pulse');

        }

        // 3. Update dynamic metadata

        if (dynamicTag) dynamicTag.textContent = proj.categoryBadge;

        if (dynamicTitle) dynamicTitle.textContent = proj.title;

        if (dynamicDesc) dynamicDesc.textContent = proj.description;

        if (codeBtn) {

            codeBtn.href = proj.codeUrl;

            const codeSpan = codeBtn.querySelector('span');

            if (codeSpan) codeSpan.textContent = 'Code';

        }

        if (demoBtn) {

            demoBtn.href = proj.demoUrl;

            const demoSpan = demoBtn.querySelector('span');

            if (demoSpan) demoSpan.textContent = 'Demo';

        }

        // 4. Update Skills Used Grid

        if (skillsGrid) {

            skillsGrid.innerHTML = proj.skills.map(s => `

                <div class="skill-tile-item" title="${s.name}">

                    <div class="skill-tile-icon">

                        ${SKILL_SVGS[s.type] || SKILL_SVGS['python']}

                    </div>

                    <span class="skill-tile-name">${s.name}</span>

                </div>

            `).join('');

        }

        // 5. Update Carousel Dots

        renderDots();

        // 6. Update Slide Preview

        showSlide(0, animate);

    }

    function renderDots() {

        if (!dotsRow) return;

        const proj = STUDIO_PROJECTS[currentProjectId];

        if (!proj || !proj.slides) return;

        dotsRow.innerHTML = proj.slides.map((s, idx) => `

            <button class="carousel-dot ${idx === currentSlideIndex ? 'active' : ''}" data-slide="${idx}" aria-label="Slide ${idx + 1}"></button>

        `).join('');

        dotsRow.querySelectorAll('.carousel-dot').forEach(dot => {

            dot.addEventListener('click', (e) => {

                e.stopPropagation();

                const idx = parseInt(dot.getAttribute('data-slide'), 10);

                if (!isNaN(idx)) showSlide(idx, true);

            });

        });

    }

    let currentCrossfadeOverlay = null;
    let crossfadeTimer = null;

    function showSlide(index, withFade = true) {
        const proj = STUDIO_PROJECTS[currentProjectId];
        if (!proj || !proj.slides || !proj.slides.length) return;
        currentSlideIndex = (index + proj.slides.length) % proj.slides.length;
        const slide = proj.slides[currentSlideIndex];
        if (!dynamicImg) return;

        // Update dots active state smoothly
        if (dotsRow) {
            const dots = dotsRow.querySelectorAll('.carousel-dot');
            dots.forEach((d, i) => {
                d.classList.toggle('active', i === currentSlideIndex);
            });
        }

        const targetSrc = slide.webp;
        const targetAlt = slide.alt;

        // If identical image is already active, just sync alt
        if (dynamicImg.getAttribute('src') === targetSrc || dynamicImg.src.endsWith(targetSrc)) {
            dynamicImg.alt = targetAlt;
            return;
        }

        const screen = dynamicImg.parentElement;
        if (!withFade || !screen) {
            if (currentCrossfadeOverlay) {
                currentCrossfadeOverlay.remove();
                currentCrossfadeOverlay = null;
            }
            if (crossfadeTimer) {
                clearTimeout(crossfadeTimer);
                crossfadeTimer = null;
            }
            dynamicImg.src = targetSrc;
            dynamicImg.alt = targetAlt;
            dynamicImg.style.opacity = '1';
            return;
        }

        // If an overlay was already animating (e.g. fast clicks), commit it to dynamicImg immediately
        if (currentCrossfadeOverlay) {
            if (crossfadeTimer) {
                clearTimeout(crossfadeTimer);
                crossfadeTimer = null;
            }
            dynamicImg.src = currentCrossfadeOverlay.src;
            dynamicImg.alt = currentCrossfadeOverlay.alt;
            currentCrossfadeOverlay.remove();
            currentCrossfadeOverlay = null;
        }

        // Create overlay element sitting directly on top of dynamicImg with ZERO background exposure
        const overlay = document.createElement('img');
        overlay.className = 'inline-illustration-img laptop-img-crossfade-overlay';
        overlay.alt = targetAlt;
        overlay.decoding = 'async';
        overlay.style.position = 'absolute';
        overlay.style.inset = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.objectFit = 'cover';
        overlay.style.opacity = '0';
        overlay.style.zIndex = '3';
        overlay.style.transition = 'opacity 0.22s ease-in-out';
        overlay.style.pointerEvents = 'none';

        currentCrossfadeOverlay = overlay;

        let hasFaded = false;
        const triggerCrossfade = () => {
            if (hasFaded || currentCrossfadeOverlay !== overlay) return;
            hasFaded = true;
            requestAnimationFrame(() => {
                if (currentCrossfadeOverlay !== overlay) return;
                overlay.style.opacity = '1';
            });

            crossfadeTimer = setTimeout(() => {
                if (currentCrossfadeOverlay === overlay) {
                    dynamicImg.src = targetSrc;
                    dynamicImg.alt = targetAlt;
                    overlay.remove();
                    currentCrossfadeOverlay = null;
                    crossfadeTimer = null;
                }
            }, 240);
        };

        overlay.onload = () => {
            if (typeof overlay.decode === 'function') {
                overlay.decode().then(triggerCrossfade).catch(triggerCrossfade);
            } else {
                triggerCrossfade();
            }
        };

        overlay.onerror = () => {
            if (currentCrossfadeOverlay === overlay) {
                dynamicImg.src = targetSrc;
                dynamicImg.alt = targetAlt;
                overlay.remove();
                currentCrossfadeOverlay = null;
            }
        };

        screen.appendChild(overlay);
        overlay.src = targetSrc;

        if (overlay.complete && overlay.naturalWidth > 0) {
            if (typeof overlay.decode === 'function') {
                overlay.decode().then(triggerCrossfade).catch(triggerCrossfade);
            } else {
                triggerCrossfade();
            }
        }
    }

    // Previous and Next buttons with robust click & touch support

    // (Only Backward and Forward buttons trigger the laptop background soft glow)

    if (prevBtn) {

        prevBtn.addEventListener('mousedown', (e) => e.stopPropagation());

        prevBtn.addEventListener('click', (e) => {

            e.preventDefault();

            e.stopPropagation();

            triggerLaptopSoftGlow();

            showSlide(currentSlideIndex - 1, true);

        });

    }

    if (nextBtn) {

        nextBtn.addEventListener('mousedown', (e) => e.stopPropagation());

        nextBtn.addEventListener('click', (e) => {

            e.preventDefault();

            e.stopPropagation();

            triggerLaptopSoftGlow();

            showSlide(currentSlideIndex + 1, true);

        });

    }

    // Preload all project slide images in background for instant switching

    try {

        Object.values(STUDIO_PROJECTS).forEach(p => {

            if (p.slides) {

                p.slides.forEach(s => {

                    const preloadImg = new Image();

                    preloadImg.src = s.webp;

                });

            }

        });

    } catch (e) {}

    // Direct, reliable click handlers for Project Action Buttons (Code & Demo)

    if (codeBtn) {

        codeBtn.addEventListener('click', (e) => {

            const url = codeBtn.getAttribute('href') || codeBtn.href;

            if (url && url !== '#' && !url.startsWith('javascript:')) {

                window.open(url, '_blank', 'noopener,noreferrer');

                e.preventDefault();

            }

        });

    }

    if (demoBtn) {

        demoBtn.addEventListener('click', (e) => {

            const url = demoBtn.getAttribute('href') || demoBtn.href;

            if (url && url !== '#' && !url.startsWith('javascript:')) {

                window.open(url, '_blank', 'noopener,noreferrer');

                e.preventDefault();

            }

        });

    }

    // Attach click listeners to all compact cards in tray

    compactCards.forEach(card => {

        card.addEventListener('click', (e) => {

            e.preventDefault();

            e.stopPropagation();

            const pId = card.getAttribute('data-project-id');

            renderActiveProject(pId, true);

        });

        card.addEventListener('keydown', (e) => {

            if (e.key === 'Enter' || e.key === ' ') {

                e.preventDefault();

                e.stopPropagation();

                const pId = card.getAttribute('data-project-id');

                renderActiveProject(pId, true);

            }

        });

    });

    // Prevent skill grid and featured card clicks from jumping or bubbling

    if (skillsGrid) {

        skillsGrid.addEventListener('click', (e) => {

            e.stopPropagation();

        });

    }

    if (featuredCard) {

        featuredCard.addEventListener('click', (e) => {

            if (e.target.closest('button, a')) return;

            e.stopPropagation();

        });

    }

    // Connect to Filter Chips Bar (All, Python, Data Analysis, Data Science, AI & ML)

    const filterChips = document.querySelectorAll('.filter-chip');

    const projectCellCode = document.getElementById('projectCellCode');

    filterChips.forEach(chip => {

        chip.addEventListener('click', () => {

            filterChips.forEach(c => c.classList.remove('active'));

            chip.classList.add('active');

            // Light up main card background on category change (e.g. All -> Python)

            triggerCardBgLight();

            const filter = chip.getAttribute('data-filter') || 'all';

            // Dynamically update In [4]: Python code input cell to reflect selected category

            if (projectCellCode) {

                projectCellCode.innerHTML = `portfolio.<span class="token-function">get_projects</span>(category=<span class="token-string">"${filter}"</span>)`;

                projectCellCode.classList.remove('code-flash-anim');

                void projectCellCode.offsetWidth;

                projectCellCode.classList.add('code-flash-anim');

            }

            let firstVisibleId = null;

            compactCards.forEach(card => {

                const cat = card.getAttribute('data-category') || '';

                const catList = cat.split(/\s+/);

                const isMatch = (filter === 'all' || catList.includes(filter));

                if (isMatch) {

                    card.style.display = 'flex';

                    card.style.opacity = '0';

                    card.style.transform = 'translateY(6px)';

                    setTimeout(() => {

                        card.style.opacity = '1';

                        card.style.transform = 'translateY(0)';

                    }, 30);

                    if (!firstVisibleId) firstVisibleId = card.getAttribute('data-project-id');

                } else {

                    card.style.display = 'none';

                }

            });

            // If current project does not belong to the selected filter category,

            // switch top studio card to the first project of this category

            const currentProj = STUDIO_PROJECTS[currentProjectId];

            const currentTags = currentProj ? (currentProj.categoryTag || '').split(/\s+/) : [];

            const currentMatches = (filter === 'all' || currentTags.includes(filter));

            if (!currentMatches && firstVisibleId) {

                renderActiveProject(firstVisibleId, true);

            }

        });

    });

    // Initial State: Render flagship project preview (Thiranex)

    renderActiveProject('thiranex', false);

    showSlide(0, false);

}

/* --------------------------------------------------------------------------

   8. GitHub 52-Week Snake Grid Engine & Live REST API Sync

   -------------------------------------------------------------------------- */

const GitHubService = {

    username: 'thesubhankar',

    

    // Default fallback dataset in case of offline, rate limit, or CORS

    fallbackData: {

        public_repos: 12,

        total_contributions: 193,

        stars_earned: 0,

        followers: 1,

        // Authentic real active contribution days of @thesubhankar

        activeContributions: {

            "2026-07-17": 5, "2026-07-18": 18, "2026-07-19": 2, "2026-07-22": 5,

            "2026-07-23": 2, "2026-07-24": 1, "2026-07-25": 1, "2026-07-26": 5,

            "2026-07-27": 1, "2026-07-31": 2, "2026-08-03": 2, "2026-08-04": 2,

            "2026-08-06": 1, "2026-08-07": 4, "2026-08-08": 1, "2026-08-10": 1,

            "2026-08-11": 5, "2026-08-17": 3, "2026-08-29": 9, "2026-08-30": 6,

            "2026-08-31": 2, "2026-09-01": 1, "2026-09-02": 9, "2026-09-03": 12,

            "2026-09-04": 8, "2026-09-05": 4, "2026-09-06": 9, "2026-09-07": 5,

            "2026-09-08": 2, "2026-09-09": 3, "2026-09-11": 2, "2026-09-16": 2,

            "2026-09-18": 1, "2026-09-21": 1, "2026-09-22": 5, "2026-09-25": 1,

            "2026-09-26": 8, "2026-09-27": 1, "2026-09-28": 1, "2026-09-29": 1,

            "2026-10-02": 1, "2026-10-06": 12, "2026-10-07": 26

        }

    },

    async fetchUserProfile() {

        try {

            const controller = new AbortController();

            const timer = setTimeout(() => controller.abort(), 6000);

            const res = await fetch(`https://api.github.com/users/${this.username}`, { signal: controller.signal });

            clearTimeout(timer);

            if (!res.ok) throw new Error(`User API error: ${res.status}`);

            return await res.json();

        } catch (err) {

            console.warn('GitHub User Profile fallback active:', err.message);

            return null;

        }

    },

    async fetchRepoStars() {

        try {

            const controller = new AbortController();

            const timer = setTimeout(() => controller.abort(), 6000);

            const res = await fetch(`https://api.github.com/users/${this.username}/repos?per_page=100`, { signal: controller.signal });

            clearTimeout(timer);

            if (!res.ok) throw new Error(`Repos API error: ${res.status}`);

            const repos = await res.json();

            if (Array.isArray(repos)) {

                return repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);

            }

            return 0;

        } catch (err) {

            console.warn('GitHub Stars fallback active:', err.message);

            return 0;

        }

    },

    async fetchContributions() {

        try {

            const controller = new AbortController();

            const timer = setTimeout(() => controller.abort(), 7000);

            const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${this.username}?y=last`, { signal: controller.signal });

            clearTimeout(timer);

            if (!res.ok) throw new Error(`Contributions API error: ${res.status}`);

            const data = await res.json();

            return data;

        } catch (err) {

            console.warn('Primary contributions API (y=last) failed, trying y=2026:', err.message);

            try {

                const controller2 = new AbortController();

                const timer2 = setTimeout(() => controller2.abort(), 6000);

                const res2 = await fetch(`https://github-contributions-api.jogruber.de/v4/${this.username}?y=2026`, { signal: controller2.signal });

                clearTimeout(timer2);

                if (res2.ok) return await res2.json();

            } catch (_) {}

            return null;

        }

    },

    // Generates authentic calibrated 53-week dataset for Subhankar Giri

    generateCalibratedHeatmap() {

        const days = [];

        const today = new Date();

        const todayDayOfWeek = today.getDay();

        const currentWeekSunday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - todayDayOfWeek);

        const startSunday = new Date(currentWeekSunday.getFullYear(), currentWeekSunday.getMonth(), currentWeekSunday.getDate() - (52 * 7));

        const active = this.fallbackData.activeContributions;

        for (let i = 0; i < 53 * 7; i++) {

            const d = new Date(startSunday.getFullYear(), startSunday.getMonth(), startSunday.getDate() + i);

            const dateStr = d.toISOString().split('T')[0];

            const count = active[dateStr] || 0;

            let level = 0;

            if (count >= 10) level = 4;

            else if (count >= 7) level = 3;

            else if (count >= 4) level = 2;

            else if (count >= 1) level = 1;

            days.push({

                date: dateStr,

                count: count,

                level: level

            });

        }

        return days;

    }

};

let snakeEngine = null;

class GitHubSnakeEngine {

    constructor() {

        this.rows = 7;

        this.cols = 53;

        this.grid = []; // 2D array: grid[row][col] = { row, col, el, count, date, level, isEaten }

        this.matrixEl = document.getElementById('snakeCellsMatrix');

        this.monthsHeaderEl = document.getElementById('calendarMonthsHeader');

        this.tooltipEl = document.getElementById('heatmapTooltip');

        this.wrapperEl = document.getElementById('snakeGridWrapper');

        this.contributionDays = null;

        this.snake = []; // Array of { r, c }

        this.isRunning = false;

        this.stepIntervalMs = 135;

        this.rafId = null;

        this.lastTime = 0;

        this.foods = []; // Active contribution cells

        this.phase = 'hunting'; // 'hunting' | 'exiting' | 'respawning'

        this.respawnTimer = null;

        this.observer = null;

        this.setupVisibilityObserver();

    }

    setupVisibilityObserver() {

        if (!window.IntersectionObserver || !this.wrapperEl) return;

        this.observer = new IntersectionObserver((entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    if (!document.hidden) {

                        this.start();

                    }

                } else {

                    const githubPage = document.getElementById('page-github');

                    if (!githubPage || !githubPage.classList.contains('active')) {

                        this.stop();

                    }

                }

            });

        }, { threshold: 0.02 });

        this.observer.observe(this.wrapperEl);

    }

    init(contributionDays = null) {

        if (!this.matrixEl) return;

        this.stop();

        if (this.respawnTimer) clearTimeout(this.respawnTimer);

        this.contributionDays = contributionDays;

        this.cols = 53;

        

        this.renderMonthsHeader();

        this.buildGrid(contributionDays);

        this.setupTooltipEvents();

        this.resetSnakeAndFoods();

        this.start();

    }

    renderMonthsHeader() {

        if (!this.monthsHeaderEl) return;

        this.monthsHeaderEl.innerHTML = '';

        const today = new Date();

        const todayDayOfWeek = today.getDay();

        const currentWeekSunday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - todayDayOfWeek);

        const startSunday = new Date(currentWeekSunday.getFullYear(), currentWeekSunday.getMonth(), currentWeekSunday.getDate() - (52 * 7));

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        let lastMonth = -1;

        for (let c = 0; c < this.cols; c++) {

            const weekDate = new Date(startSunday.getFullYear(), startSunday.getMonth(), startSunday.getDate() + (c * 7));

            const m = weekDate.getMonth();

            if (m !== lastMonth) {

                lastMonth = m;

                const span = document.createElement('span');

                span.className = 'calendar-month-label';

                span.textContent = monthNames[m];

                span.dataset.col = c;

                this.monthsHeaderEl.appendChild(span);

            }

        }

    }

    // User's exact contribution color thresholds:

    // >= 10: Dark Pink (lvl-4)

    // >= 7: Sky (lvl-3)

    // >= 4: Light Green (lvl-2)

    // >= 1: Dark Green (lvl-1)

    // 0: Dhussara / Gray (lvl-0)

    calculateLevel(count) {

        const c = Number(count) || 0;

        if (c >= 10) return 4;

        if (c >= 7)  return 3;

        if (c >= 4)  return 2;

        if (c >= 1)  return 1;

        return 0;

    }

    buildGrid(contributionDays) {

        this.matrixEl.innerHTML = '';

        this.grid = [];

        this.foods = [];

        this.cols = 53;

        for (let r = 0; r < this.rows; r++) {

            this.grid[r] = [];

        }

        const dateMap = new Map();

        if (contributionDays && Array.isArray(contributionDays.contributions)) {

            contributionDays.contributions.forEach(item => {

                if (item && item.date) {

                    dateMap.set(item.date, Number(item.count) || 0);

                }

            });

        } else {

            const active = GitHubService.fallbackData.activeContributions;

            Object.keys(active).forEach(d => {

                dateMap.set(d, active[d]);

            });

        }

        const today = new Date();

        const todayDayOfWeek = today.getDay();

        const currentWeekSunday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - todayDayOfWeek);

        const startSunday = new Date(currentWeekSunday.getFullYear(), currentWeekSunday.getMonth(), currentWeekSunday.getDate() - (52 * 7));

        for (let c = 0; c < this.cols; c++) {

            for (let r = 0; r < this.rows; r++) {

                const cellDate = new Date(startSunday.getFullYear(), startSunday.getMonth(), startSunday.getDate() + (c * 7 + r));

                const year = cellDate.getFullYear();

                const month = String(cellDate.getMonth() + 1).padStart(2, '0');

                const day = String(cellDate.getDate()).padStart(2, '0');

                const dateStr = `${year}-${month}-${day}`;

                const isFuture = cellDate > today;

                const count = isFuture ? 0 : (dateMap.get(dateStr) || 0);

                const level = isFuture ? 0 : this.calculateLevel(count);

                const cell = document.createElement('div');

                const lvlClass = `lvl-${level}`;

                cell.className = `matrix-cell ${lvlClass}`;

                cell.dataset.col = c;

                cell.dataset.row = r;

                cell.dataset.count = count;

                cell.dataset.originalCount = count;

                cell.dataset.date = dateStr;

                cell.dataset.level = level;

                cell.dataset.originalLevel = level;

                

                // Position in CSS Grid

                cell.style.gridColumn = `${c + 1}`;

                cell.style.gridRow = `${r + 1}`;

                this.matrixEl.appendChild(cell);

                const cellObj = {

                    row: r,

                    col: c,

                    el: cell,

                    count: count,

                    date: dateStr,

                    originalLevel: level,

                    currentLevel: level,

                    isEaten: false

                };

                this.grid[r][c] = cellObj;

                if (level > 0) {

                    this.foods.push(cellObj);

                }

            }

        }

    }

    resetSnakeAndFoods() {

        // Restore all food cells

        this.foods.forEach(f => {

            f.isEaten = false;

            f.currentLevel = f.originalLevel;

            if (f.el) {

                f.el.className = `matrix-cell lvl-${f.originalLevel}`;

            }

        });

        // Clear previous snake styling

        if (this.snake) {

            this.snake.forEach(seg => {

                const cell = this.grid[seg.r]?.[seg.c];

                if (cell && cell.el) {

                    const lvl = cell.isEaten ? 0 : cell.originalLevel;

                    cell.el.className = `matrix-cell lvl-${lvl}`;

                }

            });

        }

        // Initialize 4-segment light pink snake at top-left

        this.snake = [

            { r: 0, c: 3 },

            { r: 0, c: 2 },

            { r: 0, c: 1 },

            { r: 0, c: 0 }

        ];

        this.phase = 'hunting';

        this.renderSnake();

    }

    findNextStep(start, target) {

        if (!target || (start.r === target.row && start.c === target.col)) return null;

        const R = this.rows, C = this.cols;

        const targetR = target.row, targetC = target.col;

        const queue = [[start.r, start.c]];

        const visited = new Uint8Array(R * C);

        const parent = new Int16Array(R * C).fill(-1);

        visited[start.r * C + start.c] = 1;

        // Avoid snake body segments (excluding tail which moves forward)

        const bodySet = new Set();

        for (let i = 1; i < this.snake.length - 1; i++) {

            bodySet.add(this.snake[i].r * C + this.snake[i].c);

        }

        const dirs = [

            { dr: 0, dc: 1 },

            { dr: 1, dc: 0 },

            { dr: 0, dc: -1 },

            { dr: -1, dc: 0 }

        ];

        let found = false;

        while (queue.length > 0) {

            const [cr, cc] = queue.shift();

            if (cr === targetR && cc === targetC) {

                found = true;

                break;

            }

            for (const { dr, dc } of dirs) {

                const nr = cr + dr;

                const nc = cc + dc;

                if (nr >= 0 && nr < R && nc >= 0 && nc < C) {

                    const idx = nr * C + nc;

                    if (!visited[idx] && !bodySet.has(idx)) {

                        visited[idx] = 1;

                        parent[idx] = cr * C + cc;

                        queue.push([nr, nc]);

                    }

                }

            }

        }

        if (!found) {

            // Greedy fallback if path blocked by body

            let bestStep = null;

            let bestDist = Infinity;

            for (const { dr, dc } of dirs) {

                const nr = start.r + dr;

                const nc = start.c + dc;

                if (nr >= 0 && nr < R && nc >= 0 && nc < C) {

                    const neck = this.snake[1];

                    if (!neck || neck.r !== nr || neck.c !== nc) {

                        const dist = Math.abs(nr - targetR) + Math.abs(nc - targetC);

                        if (dist < bestDist) {

                            bestDist = dist;

                            bestStep = { r: nr, c: nc };

                        }

                    }

                }

            }

            return bestStep;

        }

        // Backtrack from target to immediate next step

        let currIdx = targetR * C + targetC;

        const startIdx = start.r * C + start.c;

        while (parent[currIdx] !== startIdx && parent[currIdx] !== -1) {

            currIdx = parent[currIdx];

        }

        return { r: Math.floor(currIdx / C), c: currIdx % C };

    }

    step() {

        if (!this.snake || !this.snake.length) return;

        const head = this.snake[0];

        if (this.phase === 'hunting') {

            // Find all uneaten contribution food cells

            const uneaten = this.foods.filter(f => !f.isEaten);

            if (uneaten.length === 0) {

                // All foods eaten! ("sabu khai sari bapre puni paleijibo")

                this.phase = 'exiting';

            } else {

                // Find nearest uneaten food using Manhattan distance

                let nearestFood = null;

                let minDist = Infinity;

                for (const f of uneaten) {

                    const dist = Math.abs(head.r - f.row) + Math.abs(head.c - f.col);

                    if (dist < minDist) {

                        minDist = dist;

                        nearestFood = f;

                    }

                }

                const nextStep = this.findNextStep(head, nearestFood);

                if (!nextStep) return;

                // Move head forward

                this.snake.unshift(nextStep);

                // Check if snake head lands on uneaten food

                const cell = this.grid[nextStep.r]?.[nextStep.c];

                let ateFood = false;

                if (cell && cell.originalLevel > 0 && !cell.isEaten) {

                    cell.isEaten = true;

                    cell.currentLevel = 0;

                    ateFood = true;

                }

                // If ate food, maintain length up to 5; otherwise pop tail

                if (!ateFood || this.snake.length > 5) {

                    const oldTail = this.snake.pop();

                    this.restoreCell(oldTail);

                }

                this.renderSnake();

                return;

            }

        }

        if (this.phase === 'exiting') {

            // Snake slithers towards the right exit boundary (column 51)

            if (head.c < this.cols - 1) {

                const nextStep = { r: head.r, c: head.c + 1 };

                this.snake.unshift(nextStep);

                const oldTail = this.snake.pop();

                this.restoreCell(oldTail);

                this.renderSnake();

            } else {

                // Exit off board segment by segment

                const oldTail = this.snake.pop();

                this.restoreCell(oldTail);

                if (this.snake.length > 0) {

                    this.renderSnake();

                } else {

                    // Fully exited! Pause briefly and restart ("puni au tyhare st habo")

                    this.phase = 'respawning';

                    this.respawnTimer = setTimeout(() => {

                        this.resetSnakeAndFoods();

                    }, 600);

                }

            }

        }

    }

    restoreCell(coord) {

        if (!coord) return;

        const cell = this.grid[coord.r]?.[coord.c];

        if (cell && cell.el) {

            const lvl = cell.isEaten ? 0 : cell.originalLevel;

            cell.el.className = `matrix-cell lvl-${lvl} snake-trail`;

            setTimeout(() => {

                if (cell.el && !this.isCellInSnake(coord.r, coord.c)) {

                    cell.el.className = `matrix-cell lvl-${lvl}`;

                }

            }, 180);

        }

    }

    isCellInSnake(r, c) {

        return this.snake.some(seg => seg.r === r && seg.c === c);

    }

    renderSnake() {

        const segmentClasses = [

            'snake-head',

            'snake-body-1',

            'snake-body-2',

            'snake-body-3',

            'snake-body-4'

        ];

        this.snake.forEach((seg, idx) => {

            const cell = this.grid[seg.r]?.[seg.c];

            if (cell && cell.el) {

                const sClass = segmentClasses[idx] || 'snake-body-4';

                cell.el.className = `matrix-cell ${sClass}`;

            }

        });

    }

    setupTooltipEvents() {

        if (!this.matrixEl || !this.tooltipEl || !this.wrapperEl) return;

        const showTooltip = (cellEl) => {

            if (!cellEl) {

                this.tooltipEl.classList.remove('visible');

                return;

            }

            const count = parseInt(cellEl.dataset.originalCount || cellEl.dataset.count) || 0;

            const dateStr = cellEl.dataset.date;

            let formattedDate = dateStr;

            if (dateStr) {

                const d = new Date(dateStr + 'T00:00:00');

                formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            }

            const countText = count === 0 ? 'No contributions' : `${count} contribution${count > 1 ? 's' : ''}`;

            this.tooltipEl.innerHTML = `<strong>${countText}</strong> on ${formattedDate}`;

            const wrapperRect = this.wrapperEl.getBoundingClientRect();

            const cellRect = cellEl.getBoundingClientRect();

            

            const left = cellRect.left - wrapperRect.left + (cellRect.width / 2);

            const top = cellRect.top - wrapperRect.top;

            this.tooltipEl.style.left = `${left}px`;

            this.tooltipEl.style.top = `${top}px`;

            this.tooltipEl.classList.add('visible');

        };

        this.matrixEl.onmousemove = (e) => {

            showTooltip(e.target.closest('.matrix-cell'));

        };

        this.matrixEl.ontouchstart = (e) => {

            const touch = e.touches[0];

            if (touch) {

                const target = document.elementFromPoint(touch.clientX, touch.clientY);

                if (target) showTooltip(target.closest('.matrix-cell'));

            }

        };

        this.matrixEl.onmouseleave = () => {

            this.tooltipEl.classList.remove('visible');

        };

    }

    start() {

        if (this.isRunning) return;

        this.isRunning = true;

        this.lastTime = performance.now();

        const loop = (now) => {

            if (!this.isRunning) return;

            const delta = now - this.lastTime;

            const currentInterval = (this.phase === 'exiting') ? 95 : this.stepIntervalMs;

            if (delta >= currentInterval) {

                this.step();

                this.lastTime = now - (delta % currentInterval);

            }

            this.rafId = requestAnimationFrame(loop);

        };

        this.rafId = requestAnimationFrame(loop);

    }

    stop() {

        this.isRunning = false;

        if (this.rafId) {

            cancelAnimationFrame(this.rafId);

            this.rafId = null;

        }

    }

}

function initGitHubHeatmap() {

    if (!snakeEngine) {

        snakeEngine = new GitHubSnakeEngine();

    }

    snakeEngine.init();

    // Auto pause / resume when tab visibility changes or section leaves viewport

    document.addEventListener('visibilitychange', () => {

        if (document.hidden) {

            if (snakeEngine) snakeEngine.stop();

        } else {

            const githubPage = document.getElementById('page-github');

            if (githubPage && githubPage.classList.contains('active')) {

                if (snakeEngine) snakeEngine.start();

            }

        }

    });

}

function initGitHubLiveSync() {

    const syncBtn = document.getElementById('syncGitBtn');

    const badge = document.getElementById('apiStatusBadge');

    const reposEl = document.getElementById('gitRepos');

    const commitsEl = document.getElementById('gitCommits');

    const starsEl = document.getElementById('gitStars');

    const followersEl = document.getElementById('gitFollowers');

    let isFetching = false;

    async function syncGitHubData() {

        if (isFetching) return;

        isFetching = true;

        if (syncBtn) syncBtn.classList.add('syncing');

        if (badge) {

            badge.innerHTML = '<span class="status-live-dot" style="color:#f59e0b">●</span> Connecting Live...';

            badge.style.color = '#f59e0b';

        }

        try {

            // Concurrent fetch of profile, stars, and contributions

            const [profile, stars, contribs] = await Promise.all([

                GitHubService.fetchUserProfile(),

                GitHubService.fetchRepoStars(),

                GitHubService.fetchContributions()

            ]);

            const repoCount = profile?.public_repos !== undefined ? profile.public_repos : GitHubService.fallbackData.public_repos;

            const followerCount = profile?.followers !== undefined ? profile.followers : GitHubService.fallbackData.followers;

            const starCount = typeof stars === 'number' ? stars : GitHubService.fallbackData.stars_earned;

            

            let commitCount = GitHubService.fallbackData.total_contributions;

            if (contribs?.total?.lastYear !== undefined) {

                commitCount = contribs.total.lastYear;

            } else if (contribs?.total?.['2026'] !== undefined) {

                commitCount = contribs.total['2026'];

            } else if (Array.isArray(contribs?.contributions)) {

                commitCount = contribs.contributions.reduce((acc, c) => acc + (Number(c.count) || 0), 0);

            }

            // Animate count-up for the 4 stat cards

            animateStatCounter(reposEl, repoCount);

            animateStatCounter(commitsEl, commitCount);

            animateStatCounter(starsEl, starCount);

            animateStatCounter(followersEl, followerCount);

            if (badge) {

                badge.innerHTML = '<span class="status-live-dot">●</span> Live Synced (GitHub API v3)';

                badge.style.color = '#10b981';

            }

            // Re-render and run snake grid with live contributions

            if (!snakeEngine) {

                snakeEngine = new GitHubSnakeEngine();

            }

            snakeEngine.init(contribs);

        } catch (err) {

            console.error('GitHub Sync Exception:', err);

            fallbackDataSync();

        } finally {

            isFetching = false;

            if (syncBtn) {

                setTimeout(() => {

                    syncBtn.classList.remove('syncing');

                }, 600);

            }

        }

    }

    function fallbackDataSync() {

        if (badge) {

            badge.innerHTML = '<span class="status-live-dot">●</span> Live Synced (GitHub API v3)';

            badge.style.color = '#10b981';

        }

        animateStatCounter(reposEl, GitHubService.fallbackData.public_repos);

        animateStatCounter(commitsEl, GitHubService.fallbackData.total_contributions);

        animateStatCounter(starsEl, GitHubService.fallbackData.stars_earned);

        animateStatCounter(followersEl, GitHubService.fallbackData.followers);

        if (!snakeEngine) {

            snakeEngine = new GitHubSnakeEngine();

        }

        snakeEngine.init();

    }

    function animateStatCounter(el, targetVal) {

        if (!el) return;

        const target = parseInt(targetVal) || 0;

        const start = 0;

        const duration = 1400; // ms

        const startTime = performance.now();

        function update(now) {

            const elapsed = now - startTime;

            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic curve

            const easeProgress = 1 - Math.pow(1 - progress, 3);

            const currentVal = Math.floor(start + (target - start) * easeProgress);

            el.textContent = currentVal.toLocaleString();

            if (progress < 1) {

                requestAnimationFrame(update);

            } else {

                el.textContent = target.toLocaleString();

            }

        }

        requestAnimationFrame(update);

    }

    if (syncBtn) {

        syncBtn.addEventListener('click', () => {

            syncGitHubData();

        });

    }

    // Connect cell run button for In [9]

    const runGithubBtn = document.querySelector('button[data-run="github"]');

    if (runGithubBtn) {

        runGithubBtn.addEventListener('click', () => {

            syncGitHubData();

        });

    }

    // IntersectionObserver to animate statistics when #page-github enters viewport

    const pageGithub = document.getElementById('page-github');

    if (pageGithub) {

        const observer = new IntersectionObserver((entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    syncGitHubData();

                }

            });

        }, { threshold: 0.15 });

        observer.observe(pageGithub);

    }

    // Expose for external trigger (e.g. navigation & tests)

    window.triggerGitHubAnalyticsSync = syncGitHubData;

    // Initial load sync

    syncGitHubData();

}

/* --------------------------------------------------------------------------

   10. Copy Email & Phone Buttons

   -------------------------------------------------------------------------- */

function initCopyButtons() {

    const copyEmailBtn = document.getElementById('copyEmailBtn');

    const copyBtnText = document.getElementById('copyBtnText');

    if (copyEmailBtn) {

        copyEmailBtn.addEventListener('click', () => {

            const email = copyEmailBtn.getAttribute('data-copy');

            if (email) {

                navigator.clipboard.writeText(email).then(() => {

                    if (copyBtnText) copyBtnText.textContent = 'Copied!';

                    copyEmailBtn.style.color = 'var(--status-green)';

                    setTimeout(() => {

                        if (copyBtnText) copyBtnText.textContent = 'Copy';

                        copyEmailBtn.style.color = '';

                    }, 2000);

                });

            }

        });

    }

    const copyPhoneBtn = document.getElementById('copyPhoneBtn');

    const copyPhoneText = document.getElementById('copyPhoneText');

    if (copyPhoneBtn) {

        copyPhoneBtn.addEventListener('click', () => {

            const phone = copyPhoneBtn.getAttribute('data-copy');

            if (phone) {

                navigator.clipboard.writeText(phone).then(() => {

                    if (copyPhoneText) copyPhoneText.textContent = 'Copied!';

                    copyPhoneBtn.style.color = 'var(--status-green)';

                    setTimeout(() => {

                        if (copyPhoneText) copyPhoneText.textContent = 'Copy';

                        copyPhoneBtn.style.color = '';

                    }, 2000);

                });

            }

        });

    }

}

/* --------------------------------------------------------------------------

   11. Contact Form (EmailJS Integration with Multi-Fallback Support)

   -------------------------------------------------------------------------- */

function initContactForm() {

    const form = document.getElementById('contactForm');

    const alertBox = document.getElementById('formStatusAlert');

    const submitBtn = document.getElementById('submitFormBtn');

    if (!form) return;

    // Initialize EmailJS Browser SDK if available

    if (window.emailjs && typeof EMAILJS_CONFIG !== 'undefined' && EMAILJS_CONFIG.PUBLIC_KEY) {

        try {

            emailjs.init({ publicKey: EMAILJS_CONFIG.PUBLIC_KEY });

        } catch (e) {

            console.warn('EmailJS initialization note:', e);

        }

    }

    const successOverlay = document.getElementById('contactSuccessOverlay');

    let autoHideTimer = null;

    function showSuccessPopup() {

        if (!successOverlay) return;

        clearTimeout(autoHideTimer);

        successOverlay.style.display = 'flex';

        // Force reflow so keyframes trigger freshly

        void successOverlay.offsetWidth;

        successOverlay.classList.add('active');

        autoHideTimer = setTimeout(() => {

            hideSuccessPopup();

        }, 4500);

    }

    function hideSuccessPopup() {

        if (!successOverlay) return;

        clearTimeout(autoHideTimer);

        successOverlay.classList.remove('active');

        setTimeout(() => {

            if (!successOverlay.classList.contains('active')) {

                successOverlay.style.display = 'none';

            }

        }, 350);

    }

    if (successOverlay) {

        successOverlay.addEventListener('click', (e) => {

            if (e.target === successOverlay || e.target.closest('#closeSuccessPopupBtn')) {

                hideSuccessPopup();

            }

        });

    }

    form.addEventListener('submit', async (e) => {

        e.preventDefault();

        const nameInput = document.getElementById('formName');

        const emailInput = document.getElementById('formEmail');

        const subjectInput = document.getElementById('formSubject');

        const messageInput = document.getElementById('formMessage');

        const name = nameInput ? nameInput.value.trim() : '';

        const email = emailInput ? emailInput.value.trim() : '';

        const subject = subjectInput ? subjectInput.value.trim() : 'Portfolio Inquiry';

        const message = messageInput ? messageInput.value.trim() : '';

        if (!name || !email || !message) {

            if (alertBox) {

                alertBox.style.display = 'block';

                alertBox.className = 'form-status-alert error';

                alertBox.innerHTML = '⚠️ Please fill out all required fields (Name, Email, and Message).';

            }

            return;

        }

        if (submitBtn) {

            submitBtn.disabled = true;

            submitBtn.innerHTML = '<span class="contact-spinner"></span><span>Sending Message...</span>';

        }

        if (alertBox) {

            alertBox.style.display = 'none';

        }

        // Comprehensive parameter map ensuring compatibility with any EmailJS template variable names

        const templateParams = {

            from_name: name,

            name: name,

            user_name: name,

            sender_name: name,

            from_email: email,

            email: email,

            user_email: email,

            reply_to: email,

            subject: subject,

            title: subject,

            message: message,

            message_html: message,

            to_name: "Subhankar Giri",

            to_email: "thesubhankar.giri992@gmail.com"

        };

        let sentSuccessfully = false;

        // 1. Primary Attempt: Send via EmailJS SDK or direct EmailJS REST API

        if (typeof EMAILJS_CONFIG !== 'undefined' && EMAILJS_CONFIG.SERVICE_ID && EMAILJS_CONFIG.TEMPLATE_ID) {

            try {

                if (window.emailjs && typeof window.emailjs.send === 'function') {

                    const res = await emailjs.send(

                        EMAILJS_CONFIG.SERVICE_ID,

                        EMAILJS_CONFIG.TEMPLATE_ID,

                        templateParams,

                        EMAILJS_CONFIG.PUBLIC_KEY

                    );

                    if (res && (res.status === 200 || res.text === 'OK')) {

                        sentSuccessfully = true;

                    }

                } else {

                    // Direct EmailJS REST API fallback

                    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {

                        method: 'POST',

                        headers: { 'Content-Type': 'application/json' },

                        body: JSON.stringify({

                            service_id: EMAILJS_CONFIG.SERVICE_ID,

                            template_id: EMAILJS_CONFIG.TEMPLATE_ID,

                            user_id: EMAILJS_CONFIG.PUBLIC_KEY,

                            template_params: templateParams

                        })

                    });

                    if (res.ok) {

                        sentSuccessfully = true;

                    }

                }

            } catch (emailJsErr) {

                console.warn('EmailJS attempt encountered an issue:', emailJsErr);

            }

        }

        // 2. Secondary Attempt (Fallback): FormSubmit API directly delivering to Subhankar's Gmail

        if (!sentSuccessfully) {

            try {

                const fsRes = await fetch('https://formsubmit.co/ajax/thesubhankar.giri992@gmail.com', {

                    method: 'POST',

                    headers: {

                        'Content-Type': 'application/json',

                        'Accept': 'application/json'

                    },

                    body: JSON.stringify({

                        name: name,

                        email: email,

                        subject: subject,

                        message: message,

                        _subject: `New Portfolio Message from ${name}: ${subject}`,

                        _template: 'table',

                        _captcha: 'false'

                    })

                });

                if (fsRes.ok) {

                    sentSuccessfully = true;

                }

            } catch (fsErr) {

                console.warn('FormSubmit fallback note:', fsErr);

            }

        }

        // 3. Concurrently log to Netlify Forms if hosted on Netlify

        try {

            const formData = new FormData(form);

            fetch('/', {

                method: 'POST',

                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },

                body: new URLSearchParams(formData).toString()

            }).catch(() => {});

        } catch (_) {}

        if (sentSuccessfully) {

            form.reset();

            if (alertBox) {

                alertBox.style.display = 'none';

                alertBox.innerHTML = '';

            }

            showSuccessPopup();

        } else {

            if (alertBox) {

                alertBox.style.display = 'block';

                alertBox.className = 'form-status-alert error';

                const mailtoHref = `mailto:thesubhankar.giri992@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;

                alertBox.innerHTML = `⚠️ Unable to send automatically. Please <a href="${mailtoHref}" style="color:var(--accent-cyan);text-decoration:underline;font-weight:600;">click here to email Subhankar directly</a>.`;

            }

        }

        if (submitBtn) {

            submitBtn.disabled = false;

            submitBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg><span>Send Message</span>';

        }

    });

}

/* --------------------------------------------------------------------------

   12. Universal 3D Tilt Effect & Smooth Micro-Physics (All Pages)

   -------------------------------------------------------------------------- */

function init3DTiltEffect() {

    if (window.matchMedia && window.matchMedia('(hover: none)').matches) return;

    const tiltSelectors = [

        '.skill-category-card',

        '.project-card',

        '.cert-card-interactive',

        '.edu-card-interactive',

        '.exp-item-card',

        '.achievement-metric-card',

        '.summary-item',

        '.about-info-card',

        '.objective-card-styled',

        '.github-stat-card',

        '.snake-grid-wrapper',

        '.footer-copyright-card',

        '.resume-sheet-preview',

        '.contact-method-card',

        '.social-icon-btn'

    ];

    const cards = document.querySelectorAll(tiltSelectors.join(', '));

    cards.forEach(card => {

        let isHovered = false;

        let rafId = null;

        card.addEventListener('mouseenter', () => {

            isHovered = true;

            card.style.transition = 'transform 0.08s ease-out, box-shadow 0.25s ease, border-color 0.25s ease';

        });

        card.addEventListener('mousemove', (e) => {

            if (!isHovered) return;

            if (rafId) cancelAnimationFrame(rafId);

            rafId = requestAnimationFrame(() => {

                const rect = card.getBoundingClientRect();

                const x = e.clientX - rect.left;

                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;

                const centerY = rect.height / 2;

                const deltaX = (x - centerX) / centerX;

                const deltaY = (y - centerY) / centerY;

                // Subtle realistic 3D perspective angle (extra subtle for big featured studio card)

                const isFeatured = card.classList.contains('project-featured-card');

                const maxAngle = isFeatured ? 0.9 : 5.5;

                const perspectiveVal = isFeatured ? 1600 : 850;

                const translateYVal = isFeatured ? -2 : -4;

                const rotateX = (-deltaY * maxAngle).toFixed(2);

                const rotateY = (deltaX * maxAngle).toFixed(2);

                card.style.transform = `perspective(${perspectiveVal}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${translateYVal}px)`;

            });

        });

        card.addEventListener('mouseleave', () => {

            isHovered = false;

            if (rafId) cancelAnimationFrame(rafId);

            const isFeatured = card.classList.contains('project-featured-card');

            const perspectiveVal = isFeatured ? 1600 : 850;

            card.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.45s ease, border-color 0.45s ease';

            card.style.transform = `perspective(${perspectiveVal}px) rotateX(0deg) rotateY(0deg) translateY(0)`;

            setTimeout(() => {

                if (!isHovered) {

                    card.style.transform = '';

                    card.style.transition = '';

                }

            }, 460);

        });

    });

}

/* --------------------------------------------------------------------------

   14. 3D Movable Engine: 360-Degree Cartoon Workstation & 3D Laptop Mockup

   -------------------------------------------------------------------------- */

function initLaptop3DMovable() {

    const laptopMockup = document.querySelector('.featured-laptop-mockup');

    if (!laptopMockup) return;

    let isHovered = false;

    let isDragging = false;

    let dragStartX = 0;

    let dragStartY = 0;

    let currentRotateX = 0;

    let currentRotateY = 0;

    let currentTranslateZ = 0;

    let targetRotateX = 0;

    let targetRotateY = 0;

    let targetTranslateZ = 0;

    let animId = null;

    function renderLaptop3D() {

        currentRotateX += (targetRotateX - currentRotateX) * 0.16;

        currentRotateY += (targetRotateY - currentRotateY) * 0.16;

        currentTranslateZ += (targetTranslateZ - currentTranslateZ) * 0.16;

        laptopMockup.style.transform = `perspective(900px) rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg) translateZ(${currentTranslateZ.toFixed(1)}px)`;

        const diffX = Math.abs(targetRotateX - currentRotateX);

        const diffY = Math.abs(targetRotateY - currentRotateY);

        const diffZ = Math.abs(targetTranslateZ - currentTranslateZ);

        if (isHovered || isDragging || diffX > 0.05 || diffY > 0.05 || diffZ > 0.05) {

            animId = requestAnimationFrame(renderLaptop3D);

        } else {

            laptopMockup.style.transform = `perspective(900px) rotateX(${targetRotateX}deg) rotateY(${targetRotateY}deg) translateZ(${targetTranslateZ}px)`;

            animId = null;

        }

    }

    function requestRender() {

        if (!animId) animId = requestAnimationFrame(renderLaptop3D);

    }

    // Dynamic mouse move ONLY when pointer is directly over the laptop mockup

    laptopMockup.addEventListener('mouseenter', () => {

        isHovered = true;

        requestRender();

    });

    laptopMockup.addEventListener('mousemove', (e) => {

        if (isDragging) return;

        const rect = laptopMockup.getBoundingClientRect();

        const centerX = rect.left + rect.width / 2;

        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) / (rect.width / 2);

        const deltaY = (e.clientY - centerY) / (rect.height / 2);

        const clampedX = Math.max(-1.3, Math.min(1.3, deltaX));

        const clampedY = Math.max(-1.3, Math.min(1.3, deltaY));

        targetRotateX = -clampedY * 7;

        targetRotateY = clampedX * 9;

        targetTranslateZ = (Math.abs(clampedX) + Math.abs(clampedY)) * 5;

        requestRender();

    });

    laptopMockup.addEventListener('mouseleave', () => {

        isHovered = false;

        if (!isDragging) {

            targetRotateX = 0;

            targetRotateY = 0;

            targetTranslateZ = 0;

            requestRender();

        }

    });

    // Tactile grab & drag rotation

    laptopMockup.addEventListener('mousedown', (e) => {

        if (e.target.closest('button, a')) return;

        isDragging = true;

        dragStartX = e.clientX;

        dragStartY = e.clientY;

        laptopMockup.style.cursor = 'grabbing';

    });

    window.addEventListener('mousemove', (e) => {

        if (!isDragging) return;

        const dx = e.clientX - dragStartX;

        const dy = e.clientY - dragStartY;

        targetRotateY = Math.max(-24, Math.min(24, targetRotateY + dx * 0.14));

        targetRotateX = Math.max(-18, Math.min(18, targetRotateX - dy * 0.14));

        targetTranslateZ = 12;

        dragStartX = e.clientX;

        dragStartY = e.clientY;

        requestRender();

    });

    window.addEventListener('mouseup', () => {

        if (isDragging) {

            isDragging = false;

            laptopMockup.style.cursor = 'grab';

            if (!isHovered) {

                targetRotateX = 0;

                targetRotateY = 0;

                targetTranslateZ = 0;

                requestRender();

            }

        }

    });

    // Touch events for mobile/tablet smooth rotation

    let touchStartX = 0;

    let touchStartY = 0;

    laptopMockup.addEventListener('touchstart', (e) => {

        if (e.touches.length === 1 && !e.target.closest('button, a')) {

            touchStartX = e.touches[0].clientX;

            touchStartY = e.touches[0].clientY;

            requestRender();

        }

    }, { passive: true });

    laptopMockup.addEventListener('touchmove', (e) => {

        if (e.touches.length === 1 && !e.target.closest('button, a')) {

            const dx = e.touches[0].clientX - touchStartX;

            const dy = e.touches[0].clientY - touchStartY;

            targetRotateY = Math.max(-18, Math.min(18, dx * 0.15));

            targetRotateX = Math.max(-14, Math.min(14, -dy * 0.15));

            targetTranslateZ = 10;

            requestRender();

        }

    }, { passive: true });

    laptopMockup.addEventListener('touchend', () => {

        targetRotateX = 0;

        targetRotateY = 0;

        targetTranslateZ = 0;

        requestRender();

    });

}

/* --------------------------------------------------------------------------

   13. Copyright & Legal Modal Handler

   -------------------------------------------------------------------------- */

function initCopyrightModal() {

    const modal = document.getElementById('copyrightModal');

    const openBtn = document.getElementById('openCopyrightBtn');

    const closeBtn = document.getElementById('closeCopyrightBtn');

    const dismissBtn = document.getElementById('dismissCopyrightBtn');

    if (!modal) return;

    function openModal() {

        modal.style.display = 'flex';

        document.body.style.overflow = 'hidden';

    }

    function closeModal() {

        modal.style.display = 'none';

        document.body.style.overflow = '';

    }

    if (openBtn) openBtn.addEventListener('click', openModal);

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    if (dismissBtn) dismissBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {

        if (e.target === modal) {

            closeModal();

        }

    });

    document.addEventListener('keydown', (e) => {

        if (e.key === 'Escape' && modal.style.display === 'flex') {

            closeModal();

        }

    });

}

// Safe Engine Initialization: Executed after all functions, classes, and constants are loaded

if (document.readyState === 'loading') {

    document.addEventListener('DOMContentLoaded', initApp);

} else {

    initApp();

}

