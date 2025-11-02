// Careers Page Specific JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Realistic Professional Handshake - Detailed and Proper
    const careerCanvas = document.getElementById('careerVisualization');
    
    if (careerCanvas) {
        const ctx = careerCanvas.getContext('2d');
        let animationFrame;
        let time = 0;
        
        function resizeCanvas() {
            careerCanvas.width = careerCanvas.offsetWidth * 2;
            careerCanvas.height = careerCanvas.offsetHeight * 2;
            ctx.scale(2, 2);
        }
        resizeCanvas();
        
        const resizeObserver = new ResizeObserver(() => resizeCanvas());
        resizeObserver.observe(careerCanvas);
        
        const width = () => careerCanvas.offsetWidth;
        const height = () => careerCanvas.offsetHeight;
        const centerX = () => width() / 2;
        const centerY = () => height() / 2;
        
        function drawHand(x, y, isLeftHand, shakeOffset = 0) {
            const baseX = x;
            const baseY = y;
            
            // Wrist
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.fillRect(baseX - 4, baseY - 8, 8, 12);
            
            // Palm
            ctx.beginPath();
            if (isLeftHand) {
                ctx.ellipse(baseX - 6, baseY + 4, 8, 12, 0, 0, Math.PI * 2);
            } else {
                ctx.ellipse(baseX + 6, baseY + 4, 8, 12, 0, 0, Math.PI * 2);
            }
            ctx.fill();
            
            // Thumb
            ctx.beginPath();
            if (isLeftHand) {
                ctx.ellipse(baseX - 10, baseY + 2, 4, 8, -0.5, 0, Math.PI * 2);
            } else {
                ctx.ellipse(baseX + 10, baseY + 2, 4, 8, 0.5, 0, Math.PI * 2);
            }
            ctx.fill();
            
            // Fingers (for handshake, fingers are together)
            const fingerY = baseY + 12;
            for (let i = 0; i < 4; i++) {
                const fingerX = isLeftHand ? baseX - 6 + i * 3 : baseX + 6 - i * 3;
                ctx.beginPath();
                ctx.ellipse(fingerX, fingerY + 5 + shakeOffset, 2.5, 6, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            
            return { x: baseX, y: baseY + 8 + shakeOffset };
        }
        
        function drawPersonSilhouette(x, y, facingRight) {
            const personY = y;
            
            // Head
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.arc(x, personY - 90, 22, 0, Math.PI * 2);
            ctx.fill();
            
            // Neck
            ctx.fillRect(x - 6, personY - 70, 12, 8);
            
            // Shoulders and torso
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.beginPath();
            ctx.moveTo(x - 25, personY - 60);
            ctx.lineTo(x + 25, personY - 60);
            ctx.lineTo(x + 20, personY + 10);
            ctx.lineTo(x - 20, personY + 10);
            ctx.closePath();
            ctx.fill();
            
            // Arms
            const shoulderY = personY - 50;
            const upperArmX = facingRight ? x + 20 : x - 20;
            
            // Upper arm
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 14;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(upperArmX, shoulderY);
            const elbowX = facingRight ? x + 50 : x - 50;
            const elbowY = personY - 25;
            ctx.lineTo(elbowX, elbowY);
            ctx.stroke();
            
            // Forearm extending for handshake
            const forearmAngle = facingRight ? -0.15 : 0.15;
            const forearmLength = 40;
            const wristX = elbowX + Math.cos(forearmAngle) * forearmLength * (facingRight ? 1 : -1);
            const wristY = elbowY + Math.sin(forearmAngle) * forearmLength;
            
            ctx.beginPath();
            ctx.moveTo(elbowX, elbowY);
            ctx.lineTo(wristX, wristY);
            ctx.stroke();
            
            // Legs
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.lineWidth = 12;
            ctx.beginPath();
            ctx.moveTo(x - 12, personY + 10);
            ctx.lineTo(x - 12, personY + 75);
            ctx.moveTo(x + 12, personY + 10);
            ctx.lineTo(x + 12, personY + 75);
            ctx.stroke();
            
            return { wristX, wristY, facingRight };
        }
        
        function animate() {
            time += 0.016;
            ctx.clearRect(0, 0, width(), height());
            
            // Subtle handshake motion
            const shakeOffset = Math.sin(time * 1.2) * 1.5;
            
            // Office desk
            const deskY = centerY() + 45;
            const deskWidth = width() * 0.5;
            const deskX = centerX() - deskWidth / 2;
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
            ctx.fillRect(deskX, deskY, deskWidth, 6);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
            ctx.lineWidth = 1;
            ctx.strokeRect(deskX, deskY, deskWidth, 6);
            
            // Draw person on left (facing right)
            const leftPersonX = centerX() - width() * 0.2;
            const leftPerson = drawPersonSilhouette(leftPersonX, centerY() + 15, true);
            
            // Draw person on right (facing left)
            const rightPersonX = centerX() + width() * 0.2;
            const rightPerson = drawPersonSilhouette(rightPersonX, centerY() + 15, false);
            
            // Handshake point - where hands meet
            const handshakeX = centerX();
            const handshakeY = centerY() - 15 + shakeOffset;
            
            // Draw left person's hand (right hand)
            const leftHandPos = drawHand(handshakeX - 12, handshakeY, false, shakeOffset);
            
            // Draw right person's hand (left hand)
            const rightHandPos = drawHand(handshakeX + 12, handshakeY, true, shakeOffset);
            
            // Connection glow effect
            const glowGradient = ctx.createRadialGradient(
                handshakeX, handshakeY, 0,
                handshakeX, handshakeY, 30
            );
            glowGradient.addColorStop(0, 'rgba(0, 255, 136, 0.3)');
            glowGradient.addColorStop(0.6, 'rgba(0, 255, 136, 0.1)');
            glowGradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
            
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(handshakeX, handshakeY, 30, 0, Math.PI * 2);
            ctx.fill();
            
            // Subtle particles
            for (let i = 0; i < 4; i++) {
                const angle = (time * 0.8 + i * Math.PI / 2) % (Math.PI * 2);
                const radius = 20 + Math.sin(time * 2 + i) * 3;
                const px = handshakeX + Math.cos(angle) * radius;
                const py = handshakeY + Math.sin(angle) * radius;
                
                const alpha = (Math.sin(time * 2 + i) + 1) / 2 * 0.5;
                ctx.fillStyle = `rgba(0, 255, 136, ${alpha})`;
                ctx.beginPath();
                ctx.arc(px, py, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
            
            animationFrame = requestAnimationFrame(animate);
        }
        
        // Optimized animation
        let lastFrameTime = 0;
        const targetFPS = 60;
        const frameInterval = 1000 / targetFPS;
        
        function optimizedAnimate(timestamp) {
            if (timestamp - lastFrameTime >= frameInterval) {
                animate();
                lastFrameTime = timestamp;
            }
            animationFrame = requestAnimationFrame(optimizedAnimate);
        }
        
        optimizedAnimate(0);
    }
    
    // Email Signup Form
    const emailSignup = document.getElementById('emailSignup');
    if (emailSignup) {
        emailSignup.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = emailSignup.querySelector('.email-input');
            const email = emailInput.value;
            
            // Simple validation
            if (email && email.includes('@')) {
                // In a real application, this would send to a backend
                alert(`Thanks for your interest! We'll notify ${email} when positions become available.`);
                emailInput.value = '';
            }
        });
    }
    
    // Scroll-triggered animations for careers page
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
});
