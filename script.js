/**
 * =========================================
 * MARKETIX ADS - CORE CLIENT-SIDE BEHAVIORS
 * =========================================
 * Handles header scrolling effects, mobile navigation toggling,
 * scrollspy navigation updates, scroll-triggered reveals, and
 * client-side form validation.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const header = document.querySelector('.site-header');
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    const contactForm = document.getElementById('contactForm');

    /**
     * FEATURE: Sticky Header Scroll Trigger
     * PURPOSE: Changes header styling (adding glassmorphic blur and light logo) on scroll.
     * TRIGGER: Triggers when vertical scroll position exceeds 40px.
     */
    const handleHeaderScroll = () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    // Bind scroll listener for header
    window.addEventListener('scroll', handleHeaderScroll);
    handleHeaderScroll(); // Run on startup to check initial scroll position

    /**
     * FEATURE: Responsive Mobile Menu Navigation
     * PURPOSE: Toggles the mobile side-drawer navigation and handles hamburger animations.
     * TRIGGER: Click events on mobile nav toggle button and list links.
     */
    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', () => {
            mobileNavToggle.classList.toggle('active');
            navMenu.classList.toggle('open');
            // Disable page scroll when mobile nav is open
            document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
        });
    }

    // Close mobile menu when any navigation link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('open')) {
                mobileNavToggle.classList.remove('active');
                navMenu.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    });

    /**
     * FEATURE: Scroll-Triggered Reveal Animations (Intersection Observer)
     * PURPOSE: Smoothly fades and slides elements into view as the user scrolls.
     * BEHAVIOR: Observes elements with class '.reveal' and adds '.active' class when they cross 15% visibility.
     */
    const revealElements = document.querySelectorAll('.reveal');
    
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Unobserve element once animated to lock the visible state
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null, // Viewport is the root
            threshold: 0.12, // Trigger when 12% of the element is visible
            rootMargin: '0px 0px -40px 0px' // Margins around viewport
        });

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback: instantly show all elements if IntersectionObserver is not supported
        revealElements.forEach(el => el.classList.add('active'));
    }

    /**
     * FEATURE: Navigation Scrollspy Link Highlighter
     * PURPOSE: Automatically highlights the current section link in the header as you scroll.
     * TRIGGER: Scroll events calculated using current vertical offset and height of sections.
     */
    const activeScrollspy = () => {
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 120; // Offset for header height
            const sectionId = section.getAttribute('id');
            const correspondingLink = document.querySelector(`.nav-link[href*=${sectionId}]`);

            if (correspondingLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    correspondingLink.classList.add('active');
                }
            }
        });
    };
    
    window.addEventListener('scroll', activeScrollspy);

    /**
     * FEATURE: Client-Side Contact Form Validation & Submission
     * PURPOSE: Validates contact details on input blur and form submission.
     * BEHAVIOR: Prevents submission on validation failures, highlights empty/invalid fields, and displays loading feedback on success.
     */
    if (contactForm) {
        const inputs = contactForm.querySelectorAll('.form-input');

        // Helper to validate a single field
        const validateField = (input) => {
            const formGroup = input.parentElement;
            let isValid = true;

            // Check standard validity
            if (input.required && !input.value.trim()) {
                isValid = false;
            }

            // Email format verification
            if (isValid && input.type === 'email') {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailPattern.test(input.value.trim());
            }

            // Phone format verification (digits and basic symbols)
            if (isValid && input.type === 'tel') {
                const phonePattern = /^[\d\s()+-]{7,20}$/;
                isValid = phonePattern.test(input.value.trim());
            }

            // Toggle error classes based on validity
            if (!isValid) {
                formGroup.classList.add('invalid');
            } else {
                formGroup.classList.remove('invalid');
            }

            return isValid;
        };

        // Validate fields dynamically when the user leaves the input field (blur event)
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            // Remove validation error on typing
            input.addEventListener('input', () => {
                if (input.value.trim()) {
                    input.parentElement.classList.remove('invalid');
                }
            });
        });

        // Form submission interceptor
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let isFormValid = true;

            // Validate all inputs before submission
            inputs.forEach(input => {
                const isFieldValid = validateField(input);
                if (!isFieldValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                const submitBtn = contactForm.querySelector('.form-submit');
                const originalBtnHTML = submitBtn.innerHTML;

                // Visual loading state on the button
                submitBtn.disabled = true;
                submitBtn.innerHTML = `
                    Sending Message...
                    <svg class="btn-icon spinning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                `;

                // Add spinning animation style dynamically
                const style = document.createElement('style');
                style.innerHTML = `
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    .spinning { animation: spin 1s linear infinite; }
                `;
                document.head.appendChild(style);

                // Simulate API post with setTimeout
                setTimeout(() => {
                    // Success visual: replace form contents with thank you message
                    const formParent = contactForm.parentElement;
                    formParent.style.opacity = '0';
                    formParent.style.transition = 'opacity 0.4s ease';

                    setTimeout(() => {
                        formParent.innerHTML = `
                            <div class="form-success-message text-center" style="padding: 40px 0; color: var(--color-text-dark);">
                                <div class="success-icon-circle" style="width: 72px; height: 72px; border-radius: 50%; background-color: rgba(240, 80, 80, 0.1); border: 2px solid var(--color-accent-coral); color: var(--color-accent-coral); display: flex; align-items: center; justify-content: center; margin: 0 auto 24px auto;">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width: 32px; height: 32px;"><polyline points="20 6 9 17 4 12"/></svg>
                                </div>
                                <h3 style="font-size: 1.75rem; font-family: var(--font-headings); font-weight: 700; margin-bottom: 12px; color: var(--color-primary-dark);">Message Sent Successfully!</h3>
                                <p style="color: var(--color-text-muted); max-width: 360px; margin: 0 auto; font-size: 0.95rem;">Thank you for contacting Marketix Ads. A campaign strategist will review your query and contact you within 24 hours.</p>
                            </div>
                        `;
                        formParent.style.opacity = '1';
                    }, 400);

                }, 1800);
            }
        });
    }

    /**
     * FEATURE: Floating WhatsApp Button Reveal
     * PURPOSE: Shows the floating WhatsApp button after scrolling down.
     */
    const floatingWhatsapp = document.querySelector('.floating-whatsapp');
    const handleWhatsappScroll = () => {
        if (floatingWhatsapp) {
            if (window.scrollY > 300) {
                floatingWhatsapp.classList.add('visible');
            } else {
                floatingWhatsapp.classList.remove('visible');
            }
        }
    };
    
    window.addEventListener('scroll', handleWhatsappScroll);
    handleWhatsappScroll(); // Initial check

});
