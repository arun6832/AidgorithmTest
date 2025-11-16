// Careers Page 3D Visualization - Professional AI Theme
import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.152.2/examples/jsm/controls/OrbitControls.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('careerVisualization');
    const fallback = document.getElementById('careerFallback');

    if (!canvas) return;

    let renderer, scene, camera, controls, mainGroup;
    let animationId = null;

    try {
        // Initialize renderer with optimized settings
        renderer = new THREE.WebGLRenderer({ 
            canvas, 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        });
        console.log('Careers visualization: WebGL renderer initialized');
    } catch (err) {
        console.warn('WebGL not available, showing fallback', err);
        if (fallback) fallback.style.display = 'flex';
        return;
    }

    // Set pixel ratio with cap for performance
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    // Scene setup
    scene = new THREE.Scene();

    // Camera with responsive FOV
    camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
    camera.position.set(0, 8, 65);

    // Professional lighting setup for AI theme
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(30, 40, 40);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x4a9eff, 0.3);
    fillLight.position.set(-20, 10, -30);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x00ff88, 0.4);
    rimLight.position.set(0, -20, -40);
    scene.add(rimLight);

    // Create main group for all elements
    mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Professional color palette for AI company
    const colors = {
        primary: 0x00ff88,      // Accent green
        secondary: 0x0099ff,    // Tech blue
        tertiary: 0x6b5ce7,     // Purple accent
        glow: 0x00ffaa
    };

    // === Core AI Neural Network Sphere ===
    const coreGeometry = new THREE.IcosahedronGeometry(6, 3);
    const coreMaterial = new THREE.MeshStandardMaterial({
        color: colors.primary,
        metalness: 0.9,
        roughness: 0.1,
        emissive: colors.glow,
        emissiveIntensity: 0.4,
        wireframe: false
    });
    const coreSphere = new THREE.Mesh(coreGeometry, coreMaterial);
    mainGroup.add(coreSphere);

    // Wireframe overlay for neural network effect
    const wireframeGeometry = new THREE.IcosahedronGeometry(6.2, 2);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: colors.primary,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const wireframeMesh = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    mainGroup.add(wireframeMesh);

    // === Orbital Rings (Data Flow Visualization) ===
    const rings = [];
    const ringConfigs = [
        { radius: 15, tilt: [0.5, 0, 0], speed: 0.3, color: colors.primary },
        { radius: 20, tilt: [0, 0.4, 0.3], speed: -0.4, color: colors.secondary },
        { radius: 25, tilt: [0.3, 0.5, 0], speed: 0.35, color: colors.tertiary }
    ];

    ringConfigs.forEach((config, index) => {
        const points = [];
        const segments = 64;
        
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(
                Math.cos(angle) * config.radius,
                0,
                Math.sin(angle) * config.radius
            );
        }

        const ringGeometry = new THREE.BufferGeometry();
        ringGeometry.setAttribute('position', 
            new THREE.BufferAttribute(new Float32Array(points), 3)
        );

        const ringMaterial = new THREE.LineBasicMaterial({
            color: config.color,
            transparent: true,
            opacity: 0.6
        });

        const ring = new THREE.Line(ringGeometry, ringMaterial);
        ring.rotation.set(...config.tilt);
        mainGroup.add(ring);

        rings.push({ mesh: ring, speed: config.speed, baseRotation: config.tilt });
    });

    // === Data Nodes (Orbiting Elements) ===
    const dataNodes = [];
    const nodeCount = 8;
    const nodeGeometry = new THREE.SphereGeometry(0.8, 16, 16);

    for (let i = 0; i < nodeCount; i++) {
        const nodeMaterial = new THREE.MeshStandardMaterial({
            color: i % 2 === 0 ? colors.secondary : colors.tertiary,
            metalness: 0.8,
            roughness: 0.2,
            emissive: i % 2 === 0 ? colors.secondary : colors.tertiary,
            emissiveIntensity: 0.5
        });

        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
        const angle = (i / nodeCount) * Math.PI * 2;
        const radius = 18 + (i % 3) * 4;
        
        node.position.set(
            Math.cos(angle) * radius,
            Math.sin(angle * 1.5) * 5,
            Math.sin(angle) * radius
        );

        mainGroup.add(node);
        dataNodes.push({
            mesh: node,
            angle: angle,
            radius: radius,
            speed: 0.5 + (i * 0.1),
            offset: i * 0.4
        });
    }

    // === Particle Field (AI Processing Effect) ===
    const particleCount = 150;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        const radius = 35 + Math.random() * 25;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;

        particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        particlePositions[i * 3 + 2] = radius * Math.cos(phi);

        particleSpeeds[i] = 0.5 + Math.random() * 1.5;
    }

    particleGeometry.setAttribute('position', 
        new THREE.BufferAttribute(particlePositions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
        color: colors.primary,
        size: 0.4,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    mainGroup.add(particles);

    // === Subtle Floor Grid ===
    const gridHelper = new THREE.GridHelper(100, 20, colors.primary, colors.secondary);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.03;
    gridHelper.position.y = -25;
    scene.add(gridHelper);

    // === Controls ===
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minPolarAngle = Math.PI / 3;
    controls.maxPolarAngle = Math.PI / 1.5;

    // === Responsive Resize Handler ===
    const handleResize = () => {
        const width = canvas.clientWidth || 300;
        const height = canvas.clientHeight || 300;
        
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        
        // Adjust FOV for mobile
        if (width < 480) {
            camera.fov = 50;
            camera.position.z = 80;
        } else if (width < 768) {
            camera.fov = 45;
            camera.position.z = 70;
        } else {
            camera.fov = 40;
            camera.position.z = 65;
        }
        
        camera.updateProjectionMatrix();
        
        if (fallback) fallback.style.display = 'none';
    };

    // Use ResizeObserver for efficient resize handling
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);
    handleResize();

    // === Animation Loop ===
    const clock = new THREE.Clock();

    function animate() {
        animationId = requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();

        // Rotate main group gently
        mainGroup.rotation.y = elapsed * 0.08;

        // Pulse core sphere
        const pulse = 1 + Math.sin(elapsed * 1.5) * 0.04;
        coreSphere.scale.set(pulse, pulse, pulse);

        // Animate wireframe
        wireframeMesh.rotation.x = elapsed * 0.2;
        wireframeMesh.rotation.y = elapsed * 0.3;

        // Rotate rings at different speeds
        rings.forEach(ring => {
            ring.mesh.rotation.y += ring.speed * 0.01;
        });

        // Orbit data nodes
        dataNodes.forEach(node => {
            const time = elapsed * node.speed + node.offset;
            node.mesh.position.x = Math.cos(time) * node.radius;
            node.mesh.position.y = Math.sin(time * 0.7) * 6;
            node.mesh.position.z = Math.sin(time) * node.radius;

            // Subtle pulsing
            const scale = 1 + Math.sin(elapsed * 2 + node.offset) * 0.15;
            node.mesh.scale.set(scale, scale, scale);
        });

        // Animate particles
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3 + 1] += particleSpeeds[i] * 0.02;
            
            if (positions[i * 3 + 1] > 60) {
                positions[i * 3 + 1] = -60;
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;
        particles.rotation.y = elapsed * 0.05;

        controls.update();
        renderer.render(scene, camera);
    }

    animate();

    // === Cleanup on page unload ===
    window.addEventListener('beforeunload', () => {
        if (animationId) cancelAnimationFrame(animationId);
        resizeObserver.disconnect();
        renderer.dispose();
    });

    // === Performance optimization for mobile ===
    let rafThrottle = false;
    if (window.innerWidth < 768) {
        // Reduce particle count on mobile
        particleMaterial.size = 0.3;
        particleMaterial.opacity = 0.4;
    }

    // === Email Signup Form ===
    const emailSignup = document.getElementById('emailSignup');
    if (emailSignup) {
        emailSignup.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = emailSignup.querySelector('.email-input');
            const email = emailInput.value.trim();

            if (email && email.includes('@')) {
                alert(`Thanks for your interest! We'll notify ${email} when positions become available.`);
                emailInput.value = '';
            }
        });
    }

    // === Scroll-triggered animations ===
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-up').forEach(el => scrollObserver.observe(el));
});