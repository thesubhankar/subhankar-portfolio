document.addEventListener("DOMContentLoaded", () => {
    
    /* ==========================================================================
       LOADING SCREEN
       ========================================================================== */
    window.addEventListener("load", () => {
        const loadingScreen = document.getElementById("loadingScreen");
        setTimeout(() => {
            loadingScreen.classList.add("fade-out");
        }, 800); // 800ms loading visual simulation
    });

    /* ==========================================================================
       THEME TOGGLE (DARK / LIGHT)
       ========================================================================== */
    const themeToggle = document.getElementById("themeToggle");
    const storedTheme = localStorage.getItem("theme") || "dark";
    
    // Set initial theme
    document.documentElement.setAttribute("data-theme", storedTheme);

    themeToggle.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    });

    /* ==========================================================================
       MOBILE NAVIGATION SYSTEM & DROPDOWN TOGGLER
       ========================================================================== */
    const mobileNavToggle = document.getElementById("mobileNavToggle");
    const navMenu = document.getElementById("navMenu");
    const navLinks = document.querySelectorAll(".nav-link, .dropdown-link");
    const moreToggle = document.getElementById("moreToggle");

    function toggleMenu() {
        mobileNavToggle.classList.toggle("active");
        navMenu.classList.toggle("active");
        
        // Prevent body scrolling when menu is active on mobile
        if (navMenu.classList.contains("active")) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }

    mobileNavToggle.addEventListener("click", toggleMenu);

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            // Only toggle menu if it is active, and is NOT the dropdown toggle trigger itself
            if (navMenu.classList.contains("active") && !link.classList.contains("dropdown-toggle")) {
                toggleMenu();
            }
        });
    });

    // Dropdown toggle click listener for both mobile and desktop views
    if (moreToggle) {
        const dropdownParent = moreToggle.parentElement;
        moreToggle.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropdownParent.classList.toggle("active");
        });

        // Close dropdown menu when clicking outside
        document.addEventListener("click", (e) => {
            if (!dropdownParent.contains(e.target)) {
                dropdownParent.classList.remove("active");
            }
        });
    }

    /* ==========================================================================
       SCROLL PERFORMANCE (STICKY NAV, PROGRESS BAR, BACK TO TOP)
       ========================================================================== */
    const mainHeader = document.getElementById("mainHeader");
    const scrollProgress = document.getElementById("scrollProgress");
    const backToTopBtn = document.getElementById("backToTopBtn");

    window.addEventListener("scroll", () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        // Sticky navigation trigger
        if (scrollTop > 50) {
            mainHeader.classList.add("scrolled");
        } else {
            mainHeader.classList.remove("scrolled");
        }

        // Scroll progress bar
        if (docHeight > 0) {
            const scrollPercentage = (scrollTop / docHeight) * 100;
            scrollProgress.style.width = `${scrollPercentage}%`;
        }

        // Back to top button visibility
        if (scrollTop > 500) {
            backToTopBtn.classList.add("visible");
        } else {
            backToTopBtn.classList.remove("visible");
        }
    });

    // Smooth scroll to top
    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    /* ==========================================================================
       HERO TEXT TYPING ANIMATION
       ========================================================================== */
    const typingTexts = ["Data Scientist", "Data Analyst", "Machine Learning Enthusiast"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingElement = document.getElementById("typing-text");

    function type() {
        const currentWord = typingTexts[wordIndex];
        
        if (isDeleting) {
            typingElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }

        let typingSpeed = 100;

        if (isDeleting) {
            typingSpeed /= 2;
        }

        if (!isDeleting && charIndex === currentWord.length) {
            typingSpeed = 1500; // Pause when word is completely typed
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % typingTexts.length;
            typingSpeed = 400; // Pause before typing the next word
        }

        setTimeout(type, typingSpeed);
    }

    if (typingElement) {
        setTimeout(type, 1000);
    }

    /* ==========================================================================
       HERO BACKGROUND PARTICLES GENERATION
       ========================================================================== */
    const heroBg = document.getElementById("heroBg");
    if (heroBg) {
        const particleCount = 15;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement("div");
            particle.classList.add("floating-shape");
            
            // Random sizes, positions, and animation delays
            const size = Math.floor(Math.random() * 120) + 40;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.floor(Math.random() * 100)}%`;
            particle.style.top = `${Math.floor(Math.random() * 100)}%`;
            particle.style.animationDelay = `${Math.random() * 8}s`;
            particle.style.animationDuration = `${Math.random() * 15 + 15}s`;
            
            heroBg.appendChild(particle);
        }
    }

    /* ==========================================================================
       PROJECTS FILTERING & SEE MORE SYSTEM
       ========================================================================== */
    const filterButtons = document.querySelectorAll(".filter-btn");
    const projectCards = document.querySelectorAll(".project-card");
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    let showingAllProjects = false;

    function filterProjects() {
        const activeFilterBtn = document.querySelector(".filter-btn.active");
        const filterValue = activeFilterBtn ? activeFilterBtn.getAttribute("data-filter") : "all";
        
        let visibleMatchingCount = 0;
        let totalMatchingCount = 0;
        
        projectCards.forEach(card => {
            const categoryList = card.getAttribute("data-category").split(" ");
            const matchesFilter = filterValue === "all" || categoryList.includes(filterValue);
            const isExtra = card.classList.contains("project-hidden");
            
            if (matchesFilter) {
                totalMatchingCount++;
                if (isExtra && !showingAllProjects) {
                    card.classList.add("fade-out");
                } else {
                    card.classList.remove("fade-out");
                    visibleMatchingCount++;
                }
            } else {
                card.classList.add("fade-out");
            }
        });

        // Manage "More Projects" button visibility and text
        if (loadMoreBtn) {
            const extraMatchingCount = totalMatchingCount - visibleMatchingCount;
            if (extraMatchingCount > 0) {
                loadMoreBtn.style.display = "inline-block";
                loadMoreBtn.textContent = "More Projects";
            } else if (showingAllProjects && totalMatchingCount > 4) { // Only show Less button if there are actually extra items
                loadMoreBtn.style.display = "inline-block";
                loadMoreBtn.textContent = "Show Less";
            } else {
                loadMoreBtn.style.display = "none";
            }
        }
    }

    // Bind event listeners
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            filterProjects();
        });
    });

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener("click", () => {
            showingAllProjects = !showingAllProjects;
            filterProjects();
            
            // Optional smooth scroll to top of projects if showing less
            if (!showingAllProjects) {
                const projectsSection = document.getElementById("projects");
                if (projectsSection) {
                    projectsSection.scrollIntoView({ behavior: "smooth" });
                }
            }
        });
    }

    // Run initial filter (hides extra projects on page load)
    filterProjects();

    /* ==========================================================================
       PROJECT CARD THUMBNAILS SWITCHER
       ========================================================================== */
    const projectThumbnails = document.querySelectorAll(".project-thumbnail");
    projectThumbnails.forEach(thumb => {
        thumb.addEventListener("click", () => {
            const targetIndex = thumb.getAttribute("data-target");
            const parentPane = thumb.closest(".project-visual-pane");
            if (!parentPane) return;
            
            // Toggle active state on sister thumbnails
            const thumbnails = parentPane.querySelectorAll(".project-thumbnail");
            thumbnails.forEach(t => t.classList.remove("active"));
            thumb.classList.add("active");
            
            // Toggle active state on corresponding main images
            const mainImages = parentPane.querySelectorAll(".main-image-wrapper");
            mainImages.forEach(img => {
                if (img.getAttribute("data-index") === targetIndex) {
                    img.classList.add("active");
                } else {
                    img.classList.remove("active");
                }
            });
        });
    });

    /* ==========================================================================
       INTERSECTION OBSERVER SCROLL SYSTEM
       ========================================================================== */
    
    // Active navigation links highlighting on scroll
    const sections = document.querySelectorAll("section");
    const navItems = document.querySelectorAll(".nav-link");

    const sectionObserverOptions = {
        root: null,
        rootMargin: "-25% 0px -70% 0px", // Focus center viewport
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                
                // Clear active classes from primary headers
                navItems.forEach(link => link.classList.remove("active"));
                
                // Try to locate a matching primary nav-link
                const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add("active");
                } else {
                    // Check if it is a nested dropdown section, highlighting "More" as active fallback
                    const dropdownLink = document.querySelector(`.dropdown-link[href="#${id}"]`);
                    if (dropdownLink) {
                        const moreToggle = document.getElementById("moreToggle");
                        if (moreToggle) {
                            moreToggle.classList.add("active");
                        }
                    }
                }
            }
        });
    }, sectionObserverOptions);

    sections.forEach(section => sectionObserver.observe(section));

    // Scroll reveal animations
    const reveals = document.querySelectorAll(".reveal-left, .reveal-right, .reveal-up");
    
    const revealObserverOptions = {
        root: null,
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("reveal-active");
                revealObserver.unobserve(entry.target); // Trigger only once
            }
        });
    }, revealObserverOptions);

    reveals.forEach(element => revealObserver.observe(element));

    // Skills progress bar animation trigger
    const skillsSection = document.getElementById("skills");
    const skillBars = document.querySelectorAll(".skill-bar");

    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                skillBars.forEach(bar => {
                    const targetProgress = bar.getAttribute("data-progress");
                    bar.style.width = `${targetProgress}%`;
                });
                skillObserver.unobserve(entry.target); // Animate once
            }
        });
    }, { threshold: 0.15 });

    if (skillsSection) {
        skillObserver.observe(skillsSection);
    }

    // Number Counter Animation
    const achievementsSection = document.getElementById("achievements");
    const counters = document.querySelectorAll(".counter");

    function startCounters() {
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute("data-target"), 10);
            const duration = 2000; // 2 seconds animation duration
            const increment = target / (duration / 16); // ~60fps refresh rate
            let current = 0;

            const updateCount = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCount);
                } else {
                    counter.textContent = target;
                }
            };
            updateCount();
        });
    }

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounters();
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    if (achievementsSection) {
        counterObserver.observe(achievementsSection);
    }

    /* ==========================================================================
       DYNAMIC GITHUB HEATMAP SIMULATION
       ========================================================================== */
    const heatmapGrid = document.getElementById("heatmapGrid");
    if (heatmapGrid) {
        // Create 24 columns * 7 days contribution blocks
        const totalCells = 24 * 7;
        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement("div");
            cell.classList.add("heatmap-cell");
            
            // Randomly weight contribution levels (0 to 4)
            const randomVal = Math.random();
            if (randomVal > 0.85) {
                cell.classList.add("level-4");
            } else if (randomVal > 0.7) {
                cell.classList.add("level-3");
            } else if (randomVal > 0.5) {
                cell.classList.add("level-2");
            } else if (randomVal > 0.25) {
                cell.classList.add("level-1");
            }
            // level-0 is default base-border background
            
            heatmapGrid.appendChild(cell);
        }
    }

    // GitHub Sync simulation button
    const syncGitBtn = document.getElementById("syncGitBtn");
    if (syncGitBtn) {
        syncGitBtn.addEventListener("click", () => {
            syncGitBtn.textContent = "Syncing...";
            syncGitBtn.style.pointerEvents = "none";
            
            setTimeout(() => {
                // Slightly randomize numbers to simulate API updates
                const repos = document.getElementById("gitRepos");
                const commits = document.getElementById("gitCommits");
                const stars = document.getElementById("gitStars");
                const followers = document.getElementById("gitFollowers");
                
                repos.textContent = parseInt(repos.textContent, 10) + Math.floor(Math.random() * 2);
                commits.textContent = parseInt(commits.textContent, 10) + Math.floor(Math.random() * 10);
                stars.textContent = parseInt(stars.textContent, 10) + Math.floor(Math.random() * 2);
                followers.textContent = parseInt(followers.textContent, 10) + Math.floor(Math.random() * 2);
                
                // Shuffle heatmap contributions
                const cells = document.querySelectorAll(".heatmap-cell");
                cells.forEach(cell => {
                    cell.className = "heatmap-cell"; // Reset classes
                    const val = Math.random();
                    if (val > 0.85) cell.classList.add("level-4");
                    else if (val > 0.7) cell.classList.add("level-3");
                    else if (val > 0.5) cell.classList.add("level-2");
                    else if (val > 0.25) cell.classList.add("level-1");
                });

                syncGitBtn.textContent = "Synced!";
                setTimeout(() => {
                    syncGitBtn.textContent = "Sync API";
                    syncGitBtn.style.pointerEvents = "auto";
                }, 2000);
            }, 1200);
        });
    }

    /* ==========================================================================
       CONTACT FORM VALIDATION & INTERACTIVE STATE
       ========================================================================== */
    const contactForm = document.getElementById("contactForm");
    const formSuccess = document.getElementById("formSuccess");
    
    // Elements
    const formName = document.getElementById("formName");
    const formEmail = document.getElementById("formEmail");
    const formSubject = document.getElementById("formSubject");
    const formMessage = document.getElementById("formMessage");

    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    }

    function checkInput(input, errorElementId, validationFn = (val) => val.trim() !== "") {
        const parent = input.parentElement;
        const isValid = validationFn(input.value);
        
        if (!isValid) {
            parent.classList.add("has-error");
            return false;
        } else {
            parent.classList.remove("has-error");
            return true;
        }
    }

    // Real-time blur listeners
    formName.addEventListener("blur", () => checkInput(formName, "nameError"));
    formEmail.addEventListener("blur", () => checkInput(formEmail, "emailError", validateEmail));
    formSubject.addEventListener("blur", () => checkInput(formSubject, "subjectError"));
    formMessage.addEventListener("blur", () => checkInput(formMessage, "messageError"));

    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const isNameValid = checkInput(formName, "nameError");
        const isEmailValid = checkInput(formEmail, "emailError", validateEmail);
        const isSubjectValid = checkInput(formSubject, "subjectError");
        const isMessageValid = checkInput(formMessage, "messageError");

        if (isNameValid && isEmailValid && isSubjectValid && isMessageValid) {
            // Form is fully validated. Execute simulated submit request
            const submitBtn = document.getElementById("submitBtn");
            submitBtn.textContent = "Sending Message...";
            submitBtn.style.pointerEvents = "none";
            
            setTimeout(() => {
                // Show success panel
                formSuccess.classList.add("active");
                contactForm.reset();
                submitBtn.textContent = "Send Message";
                submitBtn.style.pointerEvents = "auto";
                
                // Close success state after 4 seconds
                setTimeout(() => {
                    formSuccess.classList.remove("active");
                }, 4000);
            }, 1500);
        }
    });

});
