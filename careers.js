// Careers Page Specific JavaScript (module)
// Uses Three.js (from CDN) to render a simple, relevant 3D briefcase in the canvas.
import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.152.2/examples/jsm/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('careerVisualization');
    const fallback = document.getElementById('careerFallback');

    if (canvas) {
    let renderer, scene, camera, controls, logo, globe, ring, pinTop, laptop;

        try {
            renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
            console.log('careers.js: Created WebGL renderer.');
        } catch (err) {
            // If WebGL isn't available, show the fallback and don't crash.
            console.warn('WebGL not available, 3D visualization disabled.', err);
            renderer = null;
            if (fallback) fallback.style.display = 'flex';
        }

        if (renderer) {
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            console.log('careers.js: renderer pixel ratio set, canvas size', canvas.clientWidth, canvas.clientHeight);

            scene = new THREE.Scene();

            camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
            // Move camera a bit closer for the new logo
            camera.position.set(0, 12, 70);

            // Lights - stronger and layered for better contrast on dark background
            const ambient = new THREE.AmbientLight(0xffffff, 0.9);
            scene.add(ambient);

            const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
            dirLight.position.set(40, 60, 50);
            scene.add(dirLight);

            // Rim / back light to give separation from dark background
            const rimLight = new THREE.DirectionalLight(0x66ffd6, 0.25);
            rimLight.position.set(-30, 10, -50);
            scene.add(rimLight);

            // Create a "Work From Anywhere" logo: globe + orbit ring + location pin + laptop accent
            logo = new THREE.Group();

            // Materials
                const globeMat = new THREE.MeshStandardMaterial({ color: 0x0b1220, metalness: 0.05, roughness: 0.7, opacity: 0.98, transparent: true }); // near-black, slightly translucent
                const gridMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1, opacity: 0.9, transparent: true });
                const accentMat = new THREE.MeshStandardMaterial({ color: 0x00ff88, metalness: 0.6, roughness: 0.2, emissive: 0x002211, emissiveIntensity: 0.3 });

            // Globe
            globe = new THREE.Mesh(new THREE.SphereGeometry(20, 32, 32), globeMat);
            globe.position.set(0, 0, 0);
            logo.add(globe);

            // Wireframe grid over globe for stylized look
                const geo = new THREE.SphereGeometry(20.05, 32, 32);
                const grid = new THREE.LineSegments(new THREE.WireframeGeometry(geo), gridMat);
                grid.material.opacity = 0.9;
                logo.add(grid);

            // Orbit ring (like connectivity / remote orbit)
            ring = new THREE.Mesh(new THREE.TorusGeometry(28, 0.8, 8, 100), new THREE.MeshStandardMaterial({ color: 0x00ffcc, metalness: 0.2, roughness: 0.4, emissive: 0x002211, emissiveIntensity: 0.06 }));
                ring = new THREE.Mesh(new THREE.TorusGeometry(28, 0.6, 6, 120), new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.1, roughness: 0.6, emissive: 0xffffff, emissiveIntensity: 0.02 }));
            ring.rotation.x = Math.PI / 3.5;
            ring.position.y = 2;
            logo.add(ring);

            // Location pin (accent) - simple sphere + cone
            const pinGroup = new THREE.Group();
                pinTop = new THREE.Mesh(new THREE.SphereGeometry(1.8, 12, 12), accentMat);
                pinTop.position.set(0, 17, 6);
                const pinStem = new THREE.Mesh(new THREE.ConeGeometry(1.2, 4, 12), accentMat);
                pinStem.position.set(0, 14.5, 6);
                pinStem.rotation.x = Math.PI;
                pinGroup.add(pinTop, pinStem);
                logo.add(pinGroup);

            // Laptop accent - small box + screen floating near globe
            laptop = new THREE.Group();
                const base = new THREE.Mesh(new THREE.BoxGeometry(8, 0.6, 5), new THREE.MeshStandardMaterial({ color: 0x11121a, metalness: 0.1, roughness: 0.5 }));
                const screen = new THREE.Mesh(new THREE.PlaneGeometry(8, 4.8), new THREE.MeshStandardMaterial({ color: 0x081428, emissive: 0x001122, emissiveIntensity: 0.35 }));
                screen.position.set(0, 3.2, -1.2);
                screen.rotation.x = -0.35;
                laptop.add(base, screen);
                laptop.position.set(-24, -2, 6);
                laptop.scale.set(1.0, 1.0, 1.0);
                logo.add(laptop);

                // add a subtle hemisphere light to mimic the index page ambient
                const hemi = new THREE.HemisphereLight(0xffffff, 0x000000, 0.25);
                scene.add(hemi);

            scene.add(logo);

            // Floor (subtle)
            // Floor (subtle) - slightly reflective to catch light
            const floor = new THREE.Mesh(
                new THREE.PlaneGeometry(400, 400),
                new THREE.MeshStandardMaterial({ color: 0x050608, metalness: 0.1, roughness: 0.6, transparent: true, opacity: 0.06 })
            );
            floor.rotation.x = -Math.PI / 2;
            floor.position.y = -40;
            scene.add(floor);

            // Controls
            controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.08;
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.5;
            controls.enablePan = false;
            controls.minDistance = 40;
            controls.maxDistance = 220;

            // Resize handling
            const resize = () => {
                const w = canvas.clientWidth || 300;
                const h = canvas.clientHeight || 200;
                renderer.setSize(w, h, false);
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
                console.log('careers.js: resized renderer to', w, h);
                // hide fallback once renderer is sized
                if (fallback) fallback.style.display = 'none';
            };

            // Use ResizeObserver for canvas size changes
            const ro = new ResizeObserver(resize);
            ro.observe(canvas);
            resize();

            // Animation
            const clock = new THREE.Clock();

            function animate() {
                const t = clock.getElapsedTime();
                // rotate the logo group and bob the globe slightly
                if (logo) logo.rotation.y = t * 0.25;
                if (globe) globe.rotation.y = t * 0.15;
                if (ring) ring.rotation.z = t * 0.6;
                // pin pulse
                if (pinTop) {
                    const pulse = 0.6 + Math.sin(t * 3) * 0.15;
                    pinTop.scale.set(pulse, pulse, pulse);
                }
                // laptop subtle float
                if (laptop) laptop.position.y = -2 + Math.sin(t * 1.4) * 0.6;

                controls.update();
                renderer.render(scene, camera);
                // ensure fallback hidden after first render
                if (fallback && fallback.style.display !== 'none') fallback.style.display = 'none';
                requestAnimationFrame(animate);
            }

            animate();
        }
    }

    // Email Signup Form (preserve original behavior)
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

    // Scroll-triggered animations for careers page (keep original observer)
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
