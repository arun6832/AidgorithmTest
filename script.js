// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Custom Cursor
    const cursor = document.querySelector('.custom-cursor');
    let globalMouseX = 0;
    let globalMouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        globalMouseX = e.clientX;
        globalMouseY = e.clientY;
        
        if (cursor) {
            cursorX += (globalMouseX - cursorX) * 0.1;
            cursorY += (globalMouseY - cursorY) * 0.1;
        }
    });

    if (cursor) {
        // Smooth cursor animation using requestAnimationFrame
        function updateCursor() {
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            requestAnimationFrame(updateCursor);
        }
        updateCursor();

        // Cursor hover effect
        const hoverElements = document.querySelectorAll('a, button, .service-card, .project-card');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
    }

    // Navigation Auto-Hide on Scroll
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;
    let scrollTimeout;

    function handleScroll() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 50) {
            navbar.classList.remove('hidden');
        } else if (currentScroll > lastScroll) {
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
        }
        
        lastScroll = currentScroll;
    }

    // Throttle scroll events
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // 3D Data Visualization - Network Graph
    const dataCanvas = document.getElementById('dataVisualization');
    
    if (dataCanvas) {
        const ctx = dataCanvas.getContext('2d');
        let animationId;
        let rotationY = 0;
        let rotationX = 0.3;
        
        function resizeCanvas() {
            dataCanvas.width = dataCanvas.offsetWidth * 2;
            dataCanvas.height = dataCanvas.offsetHeight * 2;
            ctx.scale(2, 2);
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Create network nodes (representing data points)
        const nodes = [];
        const nodeCount = 12;
        
        for (let i = 0; i < nodeCount; i++) {
            const angle1 = (Math.PI * 2 * i) / nodeCount;
            const angle2 = Math.random() * Math.PI * 2;
            const radius = 80 + Math.random() * 60;
            
            nodes.push({
                x: Math.cos(angle1) * radius,
                y: Math.sin(angle1) * radius,
                z: Math.cos(angle2) * 60,
                size: 4 + Math.random() * 3,
                connections: []
            });
        }
        
        // Create connections between nodes
        nodes.forEach((node, i) => {
            const connections = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < connections; j++) {
                const targetIndex = (i + Math.floor(Math.random() * (nodeCount - 1)) + 1) % nodeCount;
                if (!node.connections.includes(targetIndex)) {
                    node.connections.push(targetIndex);
                }
            }
        });
        
        // Particle system for data flow
        const dataParticles = [];
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            dataParticles.push({
                startNode: Math.floor(Math.random() * nodeCount),
                endNode: Math.floor(Math.random() * nodeCount),
                progress: Math.random(),
                speed: 0.005 + Math.random() * 0.01
            });
        }
        
        function project3D(x, y, z) {
            const scale = 600 / (600 + z);
            const px = (x + dataCanvas.offsetWidth / 2) * scale;
            const py = (y + dataCanvas.offsetHeight / 2) * scale;
            return { x: px, y: py, scale, z };
        }
        
        function rotateY(x, z, angle) {
            return {
                x: x * Math.cos(angle) - z * Math.sin(angle),
                z: x * Math.sin(angle) + z * Math.cos(angle)
            };
        }
        
        function rotateX(y, z, angle) {
            return {
                y: y * Math.cos(angle) - z * Math.sin(angle),
                z: y * Math.sin(angle) + z * Math.cos(angle)
            };
        }
        
        function animate() {
            ctx.clearRect(0, 0, dataCanvas.offsetWidth, dataCanvas.offsetHeight);
            
            // Update rotation
            rotationY += 0.008;
            const normalizedX = (globalMouseX - window.innerWidth / 2) / window.innerWidth;
            const normalizedY = (globalMouseY - window.innerHeight / 2) / window.innerHeight;
            rotationX = 0.3 + normalizedY * 0.2;
            
            // Project and sort nodes by depth
            const projectedNodes = nodes.map(node => {
                let { x, z } = rotateY(node.x, node.z, rotationY);
                const rotated = rotateX(node.y, z, rotationX);
                const projected = project3D(x, rotated.y, rotated.z);
                return { ...projected, original: node, index: nodes.indexOf(node) };
            });
            
            projectedNodes.sort((a, b) => b.z - a.z);
            
            // Draw connections
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1;
            
            projectedNodes.forEach((projNode, i) => {
                const node = projNode.original;
                node.connections.forEach(connIndex => {
                    const targetNode = projectedNodes.find(n => n.index === connIndex);
                    if (targetNode && projNode.z > -500 && targetNode.z > -500) {
                        ctx.beginPath();
                        ctx.moveTo(projNode.x, projNode.y);
                        ctx.lineTo(targetNode.x, targetNode.y);
                        ctx.stroke();
                    }
                });
            });
            
            // Draw data flow particles
            dataParticles.forEach(particle => {
                particle.progress += particle.speed;
                if (particle.progress > 1) {
                    particle.progress = 0;
                    particle.startNode = Math.floor(Math.random() * nodeCount);
                    particle.endNode = Math.floor(Math.random() * nodeCount);
                }
                
                const startProj = projectedNodes.find(n => n.index === particle.startNode);
                const endProj = projectedNodes.find(n => n.index === particle.endNode);
                
                if (startProj && endProj) {
                    const px = startProj.x + (endProj.x - startProj.x) * particle.progress;
                    const py = startProj.y + (endProj.y - startProj.y) * particle.progress;
                    const alpha = Math.sin(particle.progress * Math.PI);
                    
                    ctx.beginPath();
                    ctx.arc(px, py, 3, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
                    ctx.fill();
                    
                    // Glow effect
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = `rgba(255, 255, 255, ${alpha * 0.5})`;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            });
            
            // Draw nodes
            projectedNodes.forEach(projNode => {
                if (projNode.z > -550) {
                    const alpha = Math.max(0, (projNode.z + 600) / 600);
                    const size = projNode.original.size * projNode.scale;
                    
                    // Outer glow
                    const gradient = ctx.createRadialGradient(
                        projNode.x, projNode.y, 0,
                        projNode.x, projNode.y, size * 2
                    );
                    gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.6})`);
                    gradient.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.2})`);
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(projNode.x, projNode.y, size * 2, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Node
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
                    ctx.beginPath();
                    ctx.arc(projNode.x, projNode.y, size, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Center dot
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(projNode.x, projNode.y, size * 0.4, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
            
            animationId = requestAnimationFrame(animate);
        }
        
        animate();
    }

    // Floating Particles
    const canvas = document.getElementById('particlesCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const particles = [];
        const particleCount = 50;

        function resizeCanvas() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.z = Math.random() * 1000;
                this.size = Math.random() * 2 + 1;
                this.speed = Math.random() * 0.5 + 0.2;
            }

            update() {
                this.z -= this.speed;
                if (this.z <= 0) {
                    this.z = 1000;
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                }
                
                // Parallax effect
                const parallaxX = (globalMouseX - canvas.width / 2) * 0.0001;
                const parallaxY = (globalMouseY - canvas.height / 2) * 0.0001;
                this.x += parallaxX * this.speed;
                this.y += parallaxY * this.speed;
            }

            draw() {
                const scale = 1000 / (1000 - this.z);
                const x = (this.x - canvas.width / 2) * scale + canvas.width / 2;
                const y = (this.y - canvas.height / 2) * scale + canvas.height / 2;
                const alpha = (1000 - this.z) / 1000;
                const size = this.size * scale;

                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }

    // Carousel Functionality
    const carouselTrack = document.getElementById('carouselTrack');
    const projectCards = document.querySelectorAll('.project-card');
    const carouselDots = document.getElementById('carouselDots');
    
    let currentIndex = 0;
    let autoAdvanceInterval;
    let isTransitioning = false;

    function updateCarousel(index) {
        if (isTransitioning) return;
        
        isTransitioning = true;
        currentIndex = index;
        
        // Check if mobile view
        const isMobile = window.innerWidth <= 768;
        
        projectCards.forEach((card, i) => {
            card.classList.remove('active', 'prev', 'next', 'hidden');
            
            if (isMobile) {
                // Mobile: Show only active card
                if (i === currentIndex) {
                    card.classList.add('active');
                } else {
                    card.classList.add('hidden');
                }
            } else {
                // Desktop: Modern slideshow - single active card with smooth transitions
                const diff = i - currentIndex;
                
                if (diff === 0) {
                    card.classList.add('active');
                } else if (diff === -1 || (diff === projectCards.length - 1)) {
                    card.classList.add('prev');
                } else if (diff === 1 || (diff === -(projectCards.length - 1))) {
                    card.classList.add('next');
                } else {
                    card.classList.add('hidden');
                }
            }
        });
        
        updateDots();
        
        setTimeout(() => {
            isTransitioning = false;
        }, 800);
    }
    
    // Update carousel on resize to handle mobile/desktop switch
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateCarousel(currentIndex);
        }, 250);
    });

    function updateDots() {
        const dots = carouselDots.querySelectorAll('.carousel-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    function createDots() {
        projectCards.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            if (i === 0) dot.classList.add('active');
            dot.setAttribute('aria-label', `Go to project ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            carouselDots.appendChild(dot);
        });
    }

    function nextSlide() {
        const next = (currentIndex + 1) % projectCards.length;
        updateCarousel(next);
    }

    function prevSlide() {
        const prev = (currentIndex - 1 + projectCards.length) % projectCards.length;
        updateCarousel(prev);
    }

    function goToSlide(index) {
        if (index !== currentIndex) {
            updateCarousel(index);
        }
    }

    function startAutoAdvance() {
        clearInterval(autoAdvanceInterval);
        autoAdvanceInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoAdvance() {
        clearInterval(autoAdvanceInterval);
    }

    // Navigation is now swipe/drag only - no buttons
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            stopAutoAdvance();
            startAutoAdvance();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            stopAutoAdvance();
            startAutoAdvance();
        }
    });

    // Enhanced Swipe Support - Works on both Desktop (mouse drag) and Mobile (touch)
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    let isDragging = false;
    let dragOffset = 0;
    const carouselContainer = document.getElementById('carouselContainer');
    const activeCard = () => document.querySelector('.project-card.active');

    if (carouselContainer) {
        // Touch events for mobile
        carouselContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
            isDragging = true;
        }, { passive: true });

        carouselContainer.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const currentX = e.changedTouches[0].screenX;
            const currentY = e.changedTouches[0].screenY;
            const diffX = Math.abs(currentX - touchStartX);
            const diffY = Math.abs(currentY - touchStartY);
            
            // If horizontal swipe is more than vertical, prevent default scroll
            if (diffX > diffY && diffX > 10) {
                e.preventDefault();
                dragOffset = currentX - touchStartX;
                
                // Apply visual drag feedback
                const card = activeCard();
                if (card) {
                    const maxDrag = 100;
                    const dragPercent = Math.max(-1, Math.min(1, dragOffset / maxDrag));
                    card.style.transform = `translate(calc(-50% + ${dragOffset * 0.5}px), -50%) scale(1)`;
                    card.style.opacity = 1 - Math.abs(dragPercent) * 0.3;
                }
            }
        }, { passive: false });

        carouselContainer.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
            
            // Reset drag
            isDragging = false;
            dragOffset = 0;
            const card = activeCard();
            if (card) {
                card.style.transform = '';
                card.style.opacity = '';
            }
        }, { passive: true });

        // Mouse events for desktop drag
        carouselContainer.addEventListener('mousedown', (e) => {
            touchStartX = e.clientX;
            touchStartY = e.clientY;
            isDragging = true;
            carouselContainer.style.cursor = 'grabbing';
        }, { passive: true });

        carouselContainer.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const currentX = e.clientX;
            const currentY = e.clientY;
            const diffX = Math.abs(currentX - touchStartX);
            const diffY = Math.abs(currentY - touchStartY);
            
            if (diffX > diffY && diffX > 10) {
                dragOffset = currentX - touchStartX;
                
                // Apply visual drag feedback
                const card = activeCard();
                if (card) {
                    const maxDrag = 150;
                    const dragPercent = Math.max(-1, Math.min(1, dragOffset / maxDrag));
                    card.style.transform = `translate(calc(-50% + ${dragOffset * 0.5}px), -50%) scale(1)`;
                    card.style.opacity = 1 - Math.abs(dragPercent) * 0.3;
                }
            }
        });

        carouselContainer.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            
            touchEndX = e.clientX;
            touchEndY = e.clientY;
            handleSwipe();
            
            // Reset drag
            isDragging = false;
            dragOffset = 0;
            carouselContainer.style.cursor = 'grab';
            const card = activeCard();
            if (card) {
                card.style.transform = '';
                card.style.opacity = '';
            }
        });

        carouselContainer.addEventListener('mouseleave', () => {
            if (isDragging) {
                isDragging = false;
                dragOffset = 0;
                carouselContainer.style.cursor = 'grab';
                const card = activeCard();
                if (card) {
                    card.style.transform = '';
                    card.style.opacity = '';
                }
            }
        });

        function handleSwipe() {
            const swipeThreshold = 80;
            const diffX = touchStartX - touchEndX;
            const diffY = Math.abs(touchStartY - touchEndY);
            
            // Only trigger swipe if horizontal movement is greater than vertical
            if (Math.abs(diffX) > swipeThreshold && Math.abs(diffX) > diffY) {
                if (diffX > 0) {
                    // Swipe left - next
                    nextSlide();
                } else {
                    // Swipe right - previous
                    prevSlide();
                }
                stopAutoAdvance();
                startAutoAdvance();
            }
        }
    }

    // Initialize carousel
    if (projectCards.length > 0) {
        createDots();
        updateCarousel(0);
        startAutoAdvance();

        // Pause auto-advance on hover
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', stopAutoAdvance);
            carouselContainer.addEventListener('mouseleave', startAutoAdvance);
        }
    }

    // Scroll-triggered Fade-up Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-up');
    fadeElements.forEach(el => observer.observe(el));

    // Smooth scroll with offset for fixed nav
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 100;
                const targetPosition = target.offsetTop - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Performance optimization: GPU acceleration hints
    const animatedElements = document.querySelectorAll('.cube, .project-card, .fade-up, .service-card');
    animatedElements.forEach(el => {
        el.style.willChange = 'transform, opacity';
    });
});
