/**
 * Sushmita Dubey - Portfolio Interactions
 * Performance-focused Vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Global DOM Selectors ---
    const video = document.getElementById('hero-video');
    const audioToggle = document.getElementById('audio-toggle');
    // START Screen Elements
    const startScreen = document.getElementById('start-screen');
    const startBtn = document.getElementById('start-btn');

    // Global listener to unmute on first page interaction
    const unmuteFromInteraction = () => {
        if (!video) return;
        video.muted = false;
        video.play().then(() => {
            localStorage.setItem('portfolio-video-unmuted', 'true');
        }).catch(err => console.log("Failed to play unmuted on page interaction:", err));
        removeInteractionListeners();
    };

    const addInteractionListeners = () => {
        document.addEventListener('click', unmuteFromInteraction, { once: true });
        document.addEventListener('touchstart', unmuteFromInteraction, { once: true });
        document.addEventListener('keydown', unmuteFromInteraction, { once: true });
    };

    const removeInteractionListeners = () => {
        document.removeEventListener('click', unmuteFromInteraction);
        document.removeEventListener('touchstart', unmuteFromInteraction);
        document.removeEventListener('keydown', unmuteFromInteraction);
    };

    // --- Robust Audio Unmuting Controller ---
    const enableAudio = () => {
        if (!video) return;

        const savedAudioPref = localStorage.getItem('portfolio-video-unmuted');

        // Attempt to automatically unmute and play
        video.muted = false;
        video.play().then(() => {
            localStorage.setItem('portfolio-video-unmuted', 'true');
        }).catch(err => {
            console.log("Audio autoplay waiting for user interaction:", err);
            // Fallback: Re-mute the video so it continues playing muted instead of pausing/freezing
            video.muted = true;
            video.play().catch(e => console.log("Failed to play muted fallback:", e));

            // Listen for first document interaction to unmute automatically
            addInteractionListeners();
        });
    };

    // Immediately mark body loaded as preloader is removed
    document.body.classList.add('loaded');

    // Handle START Button Click to reveal site, unmute audio, and start typing
    if (startBtn && startScreen) {
        startBtn.addEventListener('click', () => {
            startScreen.classList.add('fade-out');
            
            // Enable unmuted audio playing on user gesture
            enableAudio();
            
            // Trigger typing effect after screen begins fading
            setTimeout(typeEffect, 600);
        });
    }

    // --- Autoplay Video Loader Transition ---
    if (video) {
        // Start video muted initially for safe browser autoplay
        video.muted = true;

        // If video is already playing or loaded
        if (video.readyState >= 3) {
            video.classList.add('loaded');
        } else {
            video.addEventListener('playing', () => {
                video.classList.add('loaded');
            });
        }
    }

    // --- Interactive Video Audio Controller ---
    if (audioToggle && video) {
        // Function to sync toggle button visual state with video mute state
        const syncAudioButton = () => {
            if (video.muted) {
                audioToggle.classList.remove('unmuted');
                audioToggle.setAttribute('aria-pressed', 'false');
                audioToggle.setAttribute('aria-label', 'Unmute background video');
            } else {
                audioToggle.classList.add('unmuted');
                audioToggle.setAttribute('aria-pressed', 'true');
                audioToggle.setAttribute('aria-label', 'Mute background video');
            }
        };

        // Listen for video volume/mute changes to keep UI in sync
        video.addEventListener('volumechange', syncAudioButton);

        // Run once initially to sync
        syncAudioButton();

        // Toggle action on click
        audioToggle.addEventListener('click', (e) => {
            // Cancel automatic interaction unmuting since manual toggle occurred
            removeInteractionListeners();

            // Toggle muted state
            video.muted = !video.muted;

            // Try to play if unmuted manually
            if (!video.muted) {
                video.play().catch(err => {
                    console.log("Failed to play unmuted on click:", err);
                });
                localStorage.setItem('portfolio-video-unmuted', 'true');
            } else {
                localStorage.setItem('portfolio-video-unmuted', 'false');
            }

            createRipple(e, audioToggle);
        });

        // Toggle action on Keyboard Enter/Space for accessibility
        audioToggle.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                audioToggle.click();
            }
        });
    }

    // Dynamic Ripple Click Effect Spawner
    function createRipple(event, button) {
        const circle = document.createElement("span");
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        const rect = button.getBoundingClientRect();
        circle.style.width = circle.style.height = `${diameter}px`;

        // If triggered by click with coordinate positions
        if (event.clientX && event.clientY) {
            circle.style.left = `${event.clientX - rect.left - radius}px`;
            circle.style.top = `${event.clientY - rect.top - radius}px`;
        } else {
            // Keyboard event fallback center-spawns ripple
            circle.style.left = `0px`;
            circle.style.top = `0px`;
        }

        circle.classList.add("ripple");

        // Remove past ripples
        const prevRipple = button.querySelector(".ripple");
        if (prevRipple) {
            prevRipple.remove();
        }

        button.appendChild(circle);
    }

    // --- Typing Animation (Rotating Titles) ---
    const titles = [
        "Software Developer",
        "AI Enthusiast",
        "MERN Stack Developer",
        "Creative Problem Solver"
    ];

    let titleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typedTextSpan = document.getElementById('typed-text');
    const typedPrefixSpan = document.getElementById('typed-prefix');

    function typeEffect() {
        if (!typedTextSpan) return;

        const currentTitle = titles[titleIndex];

        if (typedPrefixSpan) {
            if (currentTitle.startsWith('AI')) {
                typedPrefixSpan.innerHTML = 'Sushmita is an&nbsp;';
            } else {
                typedPrefixSpan.innerHTML = 'Sushmita is a&nbsp;';
            }
        }

        if (isDeleting) {
            typedTextSpan.textContent = currentTitle.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typedTextSpan.textContent = currentTitle.substring(0, charIndex + 1);
            charIndex++;
        }

        let typingSpeed = 90; // Default typing speed

        if (isDeleting) {
            typingSpeed /= 2.2; // Delete faster than type
        }

        // Word completed
        if (!isDeleting && charIndex === currentTitle.length) {
            typingSpeed = 2000; // Pause at end of word
            isDeleting = true;
        }
        // Deletion completed
        else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            titleIndex = (titleIndex + 1) % titles.length;
            typingSpeed = 400; // Pause before typing next word
        }

        setTimeout(typeEffect, typingSpeed);
    }

    // Start the typing animation (fallback if start screen is not present)
    if (!document.getElementById('start-screen')) {
        setTimeout(typeEffect, 1000);
        setTimeout(enableAudio, 500);
    }

    // --- Navbar Scroll Handling (Blur & Background Transition) ---
    const navbar = document.getElementById('navbar');

    function handleNavbarScroll() {
        if (!navbar) return;
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
    // Run once on load to handle pre-scrolled state
    handleNavbarScroll();

    // --- Mobile Hamburger Menu Toggle ---
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            const isOpened = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isOpened);
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // --- Active Link Observer (Highlight Link on Scroll) ---
    const sections = document.querySelectorAll('header, section');
    const navLinks = document.querySelectorAll('.nav-link');

    const observerOptions = {
        root: null,
        rootMargin: '-40% 0px -50% 0px', // Triggers when the section covers the viewport center
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // --- Smooth Scroll for Scrolling Indicator and Navbar Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            // Check if standard anchor point exists
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();
                const offset = 80; // Height of fixed header
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = targetId === '#home' ? 0 : elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Scroll Reveal Animations ---
    const revealSections = document.querySelectorAll('.about-section, .skills-section, .achievements-section, .projects-section, .contact-section');
    const revealObserverOptions = {
        root: null,
        threshold: 0.15
    };

    function animateCountUp(element, target) {
        let current = 0;
        const duration = 1500; // Matches CSS transition duration
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            // Ease out quad
            const easeProgress = progress * (2 - progress);
            current = Math.floor(easeProgress * target);
            
            element.textContent = `${current}%`;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = `${target}%`;
            }
        }
        
        requestAnimationFrame(update);
    }

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                
                // If it is the skills section, animate progress bars & count up percentage text
                if (entry.target.id === 'skills') {
                    const fills = entry.target.querySelectorAll('.progress-bar-fill');
                    fills.forEach(fill => {
                        const targetPercent = parseInt(fill.getAttribute('data-percent'), 10);
                        fill.style.transform = `scaleX(${targetPercent / 100})`;
                        
                        const progressItem = fill.closest('.progress-item');
                        if (progressItem) {
                            const valSpan = progressItem.querySelector('.progress-val');
                            if (valSpan) {
                                animateCountUp(valSpan, targetPercent);
                            }
                        }
                    });
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, revealObserverOptions);

    revealSections.forEach(section => {
        revealObserver.observe(section);
    });

    // --- Reusable Canvas Particle Animation Helper ---
    function initCanvasParticles(canvasId, sectionId, drawConnectionsFlag = true) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationFrameId;

        // Match canvas size to section size
        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };

        // Track mouse position relative to canvas
        let mouse = { x: null, y: null, radius: 150 };
        const section = document.getElementById(sectionId);
        if (section) {
            section.addEventListener('mousemove', (e) => {
                const rect = section.getBoundingClientRect();
                mouse.x = e.clientX - rect.left;
                mouse.y = e.clientY - rect.top;
            });

            section.addEventListener('mouseleave', () => {
                mouse.x = null;
                mouse.y = null;
            });
        }

        class Particle {
            constructor(width, height) {
                this.width = width;
                this.height = height;
                this.x = Math.random() * width;
                this.y = Math.random() * height;

                // Slow speeds for elegant movement
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;

                this.radius = Math.random() * 2 + 1;

                // Select a color from our theme palette
                const colors = [
                    'rgba(124, 58, 237, 0.45)', // Primary violet
                    'rgba(56, 189, 248, 0.45)',  // Secondary sky blue
                    'rgba(244, 114, 182, 0.45)'  // Accent pink
                ];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update(width, height) {
                // Bounds collision/wrap around
                if (this.x < 0 || this.x > width) this.vx = -this.vx;
                if (this.y < 0 || this.y > height) this.vy = -this.vy;

                this.x += this.vx;
                this.y += this.vy;

                // Mouse interactive repulsion effect
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = this.x - mouse.x;
                    const dy = this.y - mouse.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < mouse.radius) {
                        const force = (mouse.radius - dist) / mouse.radius;
                        // Gently push away
                        this.x += (dx / dist) * force * 1.5;
                        this.y += (dy / dist) * force * 1.5;
                    }
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        const initParticles = () => {
            const rect = canvas.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;
            particles = [];

            // Adjust particle density by screen size
            const count = Math.min(Math.floor((w * h) / 14000), 100);
            for (let i = 0; i < count; i++) {
                particles.push(new Particle(w, h));
            }
        };

        const drawConnections = () => {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.hypot(dx, dy);

                    if (dist < 110) {
                        // Draw line with opacity dependent on proximity
                        const opacity = (110 - dist) / 110 * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(124, 58, 237, ${opacity})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }
        };

        const animate = () => {
            const rect = canvas.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;

            ctx.clearRect(0, 0, w, h);

            particles.forEach(p => {
                p.update(w, h);
                p.draw();
            });

            if (drawConnectionsFlag) {
                drawConnections();
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        // Handle window resizing
        window.addEventListener('resize', () => {
            resizeCanvas();
            initParticles();
        });

        // Initialize
        resizeCanvas();
        initParticles();
        animate();
    }

    const cards = document.querySelectorAll('.skill-card, .achievement-card, .project-card, .contact-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // --- Contact Form Handling & Validation ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const nameInput = document.getElementById('form-name');
        const emailInput = document.getElementById('form-email');
        const subjectInput = document.getElementById('form-subject');
        const messageInput = document.getElementById('form-message');
        const successContainer = document.getElementById('form-success');
        const submitBtn = document.getElementById('btn-submit');

        const validateEmail = (email) => {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(String(email).toLowerCase());
        };

        const showError = (input, show) => {
            const group = input.parentElement;
            if (show) {
                group.classList.add('has-error');
            } else {
                group.classList.remove('has-error');
            }
        };

        const validateField = (input) => {
            let isValid = true;
            if (input.required && !input.value.trim()) {
                isValid = false;
            } else if (input.type === 'email' && !validateEmail(input.value.trim())) {
                isValid = false;
            }
            showError(input, !isValid);
            return isValid;
        };

        // Live validation on input & blur
        [nameInput, emailInput, subjectInput, messageInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    if (input.parentElement.classList.contains('has-error')) {
                        validateField(input);
                    }
                });
                input.addEventListener('blur', () => {
                    validateField(input);
                });
            }
        });

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            let formIsValid = true;
            [nameInput, emailInput, subjectInput, messageInput].forEach(input => {
                if (!validateField(input)) {
                    formIsValid = false;
                }
            });

            if (formIsValid) {
                // Trigger submitting state
                contactForm.classList.add('submitting');
                submitBtn.disabled = true;

                // Simulate server request delay
                setTimeout(() => {
                    contactForm.classList.remove('submitting');
                    // Hide all inputs & labels & submit button
                    Array.from(contactForm.children).forEach(child => {
                        if (child !== successContainer) {
                            child.style.display = 'none';
                        }
                    });
                    
                    // Show success message container
                    successContainer.style.display = 'flex';
                    contactForm.reset();
                }, 1800);
            }
        });
    }

    // --- Floating Back to Top Button ---
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
                backToTopBtn.setAttribute('tabindex', '0');
            } else {
                backToTopBtn.classList.remove('visible');
                backToTopBtn.setAttribute('tabindex', '-1');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Initialize particles on sections
    initCanvasParticles('about-canvas', 'about', false);
    initCanvasParticles('skills-canvas', 'skills', false);
    initCanvasParticles('achievements-canvas', 'achievements', false);
    initCanvasParticles('projects-canvas', 'projects', false);
    initCanvasParticles('contact-canvas', 'contact', false);
});
