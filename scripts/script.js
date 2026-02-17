// ============================================
// THE WEBSTR - MAIN JAVASCRIPT
// Professional Animations & Interactions
// ============================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded — initializing main script');

    // ============================================
    // NAVIGATION SCROLL BEHAVIOR
    // ============================================
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-menu a');
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    console.log('Elements:', { navbar: !!navbar, navMenu: !!navMenu, menuToggle: !!menuToggle, navLinksCount: navLinks.length });

    // Accessibility: ensure menu toggle has explicit aria state
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');

    // Navbar scroll effect — hide on scroll down, show on scroll up.
    // Use the navbar's actual height for reliable hiding and avoid transform class conflicts.
    let lastScrollTop = window.scrollY || 0;
    let ticking = false;
    const HIDE_AFTER = 10; // start hiding after this many px scrolled

    function handleScroll(currentScroll) {
        if (!navbar) return;

        // show scrolled background after small offset
        if (currentScroll > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        console.log('handleScroll', { currentScroll, lastScrollTop, navMenuActive: navMenu && navMenu.classList.contains('active'), navbarTransform: navbar.style.transform });

        // if mobile menu is open, keep navbar visible
        if (navMenu && navMenu.classList.contains('active')) {
            navbar.style.transform = 'translateY(0)';
            lastScrollTop = currentScroll;
            return;
        }

        // hide on scroll down, show on scroll up
        if (currentScroll - lastScrollTop > HIDE_AFTER) {
            // scrolling down
            const h = navbar.offsetHeight || 80;
            navbar.style.transform = `translateY(-${h}px)`;
        } else if (lastScrollTop - currentScroll > 0) {
            // scrolling up
            navbar.style.transform = 'translateY(0)';
        }

        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }

    window.addEventListener('scroll', function () {
        const currentScroll = window.scrollY;
        if (!ticking) {
            window.requestAnimationFrame(function () {
                handleScroll(currentScroll);
                ticking = false;
            });
            ticking = true;
        }
    });

    // Mobile menu toggle (robust): toggle via function, support touch, close on outside click
    function setMobileMenu(open) {
        if (!navMenu) return;
        open = !!open;
        navMenu.classList.toggle('active', open);
        if (menuToggle) {
            menuToggle.classList.toggle('open', open);
            menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        }
        // keep header visible while menu open
        if (open && navbar) navbar.style.transform = 'translateY(0)';
        // prevent body scroll when menu open
        document.body.style.overflow = open ? 'hidden' : '';
    }

    if (menuToggle) {
        let lastToggleTime = 0;
        const TOGGLE_DEBOUNCE_MS = 350;

        const toggleHandler = function (e) {
            e.stopPropagation();
            if (e.type === 'touchstart') e.preventDefault();

            const now = Date.now();
            if (now - lastToggleTime < TOGGLE_DEBOUNCE_MS) {
                lastToggleTime = now;
                return;
            }
            lastToggleTime = now;

            const isOpen = navMenu && navMenu.classList.contains('active');
            console.log('menuToggle triggered (' + e.type + ') — currently open?', isOpen);
            setMobileMenu(!isOpen);
        };

        menuToggle.addEventListener('click', toggleHandler);
        // passive:false so we can call preventDefault on touchstart
        menuToggle.addEventListener('touchstart', toggleHandler, { passive: false });
    } else {
        console.log('menuToggle element not found — hamburger will not work on narrow screens');
    }

    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            if (window.innerWidth <= 1200 && navMenu) {
                setMobileMenu(false);
            }
        });
    });

    // Close menu when clicking outside the menu on mobile
    document.addEventListener('click', function (e) {
        if (!navMenu || !navMenu.classList.contains('active')) return;
        const target = e.target;
        if (menuToggle && menuToggle.contains(target)) return;
        if (navMenu.contains(target)) return;
        setMobileMenu(false);
    });

    // ============================================
    // ACTIVE NAVIGATION LINK
    // ============================================
    function setActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');

            if (href === currentPage ||
                (currentPage === '' && href === 'index.html') ||
                (currentPage === 'index.html' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    }

    setActiveNavLink();

    // ============================================
    // SCROLL ANIMATIONS
    // ============================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        observer.observe(section);
    });

    // Observe fade-in elements
    const fadeElements = document.querySelectorAll('.fade-in-up');
    fadeElements.forEach(element => {
        observer.observe(element);
    });

    // Observe stagger animation containers
    const staggerContainers = document.querySelectorAll('.stagger-animation');
    staggerContainers.forEach(container => {
        observer.observe(container);
    });

    // ============================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Don't prevent default for just '#'
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // FORM VALIDATION & SUBMISSION
    // ============================================
    const contactForm = document.querySelector('.contact-form form');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);

            // Basic validation
            let isValid = true;
            const requiredFields = contactForm.querySelectorAll('[required]');

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#dc2626';
                } else {
                    field.style.borderColor = '#E5E5EA';
                }
            });

            if (!isValid) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }

            // Email validation
            const emailField = contactForm.querySelector('input[type="email"]');
            if (emailField && !isValidEmail(emailField.value)) {
                emailField.style.borderColor = '#dc2626';
                showNotification('Please enter a valid email address', 'error');
                return;
            }

            // Perform real POST to /api/contact
            const submitBtn = contactForm.querySelector('.btn-primary');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).then(async (res) => {
                const body = await res.json().catch(() => ({}));
                if (res.ok) {
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
                    showNotification(body.message || 'Thank you! Your message has been sent.', 'success');
                    contactForm.reset();
                } else {
                    showNotification(body.error || 'Failed to send message. Try again later.', 'error');
                }
            }).catch(err => {
                console.error('Contact submit error', err);
                showNotification('Network error. Please try again later.', 'error');
            }).finally(() => {
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 1500);
            });
        });
    }

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    // Email validation
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#dc2626' : '#6B2FD6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;

        notification.querySelector('.notification-content').style.cssText = `
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 1rem;
        `;

        // Add to page
        document.body.appendChild(notification);

        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // ============================================
    // CARD HOVER EFFECTS
    // ============================================
    const cards = document.querySelectorAll('.card, .problem-card, .portfolio-card, .package-card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });

    // ============================================
    // PORTFOLIO IMAGE PLACEHOLDER ANIMATION
    // ============================================
    const portfolioImages = document.querySelectorAll('.portfolio-image');

    portfolioImages.forEach(img => {
        // Add subtle animation on load
        img.style.opacity = '0';
        img.style.transform = 'scale(0.95)';

        setTimeout(() => {
            img.style.transition = 'all 0.5s ease';
            img.style.opacity = '1';
            img.style.transform = 'scale(1)';
        }, 100);
    });

    // ============================================
    // BUTTON RIPPLE EFFECT
    // ============================================
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach(button => {
        button.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
            `;

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Add ripple animation
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);

    // ============================================
    // PERFORMANCE OPTIMIZATION
    // ============================================

    // Lazy load images if present
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // ============================================
    // ACCESSIBILITY ENHANCEMENTS
    // ============================================

    // Keyboard navigation for cards
    cards.forEach(card => {
        card.setAttribute('tabindex', '0');

        card.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                const link = this.querySelector('a');
                if (link) link.click();
            }
        });
    });

    // Focus visible for better accessibility
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', function () {
        document.body.classList.remove('keyboard-navigation');
    });

    // ============================================
    // INITIAL ANIMATIONS ON LOAD
    // ============================================

    // Trigger initial animations immediately
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.classList.add('visible');
    }

    // Mark ALL sections as visible on load
    const allSections = document.querySelectorAll('section');
    allSections.forEach((section) => {
        section.classList.add('visible');
    });

    // Mark all fade-in-up and stagger-animation elements in viewport on load
    const initialFadeElements = document.querySelectorAll('.fade-in-up, .stagger-animation');
    initialFadeElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            element.classList.add('visible');
        }
    });

    // ============================================
    // CONSOLE BRANDING
    // ============================================
    console.log('%c🌐 THE WEBSTR ', 'background: #6B2FD6; color: white; font-size: 16px; font-weight: bold; padding: 10px 20px; border-radius: 5px;');
    console.log('%cAuthority-Driven Websites for Executive Coaches', 'color: #2C2C2C; font-size: 12px; padding: 5px 0;');
    console.log('%cBuilt with precision and purpose.', 'color: #8E8E93; font-size: 11px; font-style: italic;');

});
