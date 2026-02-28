/**
 * LETS Corporate Site - ANRI Style SPA
 * Three.js 3D Animation matching ANRI.vc design
 * Single Page Application with smooth transitions
 */

// ==========================================
// Global Variables
// ==========================================
let scene, camera, renderer;
let floatingObjects = [];
let logoLetters = [];
let currentPage = 0;
const totalPages = window.innerWidth <= 768 ? 4 : 3;
let isAnimating = false;
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;
let isIntroComplete = false;

// Page configurations
const pageConfig = {
    0: { name: 'ホーム', bg: '#c8c8c8', objectColors: { gray: 0x808080, dark: 0x1a1a1a, black: 0x0a0a0a } },
    1: { name: '事業内容', bg: '#d4c4d8', objectColors: { gray: 0x9070a0, dark: 0x4a2a5a, black: 0x2a1a3a } },
    2: { name: 'お問い合わせ', bg: '#c4d8c8', objectColors: { gray: 0x70a080, dark: 0x2a5a3a, black: 0x1a3a2a } },
    3: { name: '会社概要', bg: '#d8c8b8', objectColors: { gray: 0xa08070, dark: 0x5a3a2a, black: 0x3a2a1a } }
};

// ==========================================
// Initialize on Load
// ==========================================
window.addEventListener('load', () => {
    initThreeJS();
    initEventListeners();
    initSPANavigation();
    handleHashNavigation();

    // Animate loading percentage counter
    animateLoadingPercent();

    // Hide loading screen with fade, then start intro animation
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('loaded');
        }
        setTimeout(() => {
            playIntroAnimation();
            // Apply initial page colors after intro
            setTimeout(() => {
                animateObjectColors(currentPage);
            }, 100);
        }, 300);
    }, 5000);
});

// ==========================================
// Hash-based Navigation (for redirects from other pages)
// ==========================================
function handleHashNavigation() {
    const hash = window.location.hash.replace('#', '');
    const pageMap = {
        'home': 0,
        'about': 1,
        'team': 2,
        'projects': 3
    };

    if (hash && pageMap[hash] !== undefined) {
        currentPage = pageMap[hash];
        const config = pageConfig[currentPage];
        document.body.style.backgroundColor = config.bg;
        updateNavLinks();
        updateDots();
        updateBottomNav();
        updateViewButton();
    }
}

// Listen for hash changes
window.addEventListener('hashchange', () => {
    handleHashNavigation();
});

// ==========================================
// SPA Navigation Setup
// ==========================================
function initSPANavigation() {
    // Nav links with data-page attribute
    document.querySelectorAll('[data-page]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const pageIndex = parseInt(el.getAttribute('data-page'));
            if (!isNaN(pageIndex)) {
                navigateToPage(pageIndex);
            }
        });
    });

    // Prev/Next buttons with data-direction attribute
    document.querySelectorAll('[data-direction]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const direction = el.getAttribute('data-direction');
            if (direction === 'prev') {
                navigateToPage((currentPage - 1 + totalPages) % totalPages);
            } else if (direction === 'next') {
                navigateToPage((currentPage + 1) % totalPages);
            }
        });
    });

    // Update UI on init
    updateNavLinks();
    updateViewButton();
}

// ==========================================
// Animate Loading Percentage & Orbit
// ==========================================
function animateLoadingPercent() {
    const percentElements = document.querySelectorAll('.loader-percent');
    const orbitContainer = document.querySelector('.loader-orbit');
    if (percentElements.length === 0 || !orbitContainer) return;

    const startTime = Date.now();
    const percentDelay = 700;
    const moveDuration = 3500;
    const percentDuration = 3000;

    const orbitRect = orbitContainer.getBoundingClientRect();
    const radiusX = orbitRect.width / 2;
    const radiusY = orbitRect.height / 2;
    const centerX = radiusX;
    const centerY = radiusY;

    const startAngles = [-Math.PI / 2, Math.PI / 2];
    const endAngles = [0, Math.PI];

    function updateAnimation() {
        const elapsed = Date.now() - startTime;

        percentElements.forEach((el, index) => {
            if (elapsed > percentDelay) {
                const moveElapsed = elapsed - percentDelay;
                const moveProgress = Math.min(moveElapsed / moveDuration, 1);
                const eased = 1 - Math.pow(1 - moveProgress, 3);

                const startAngle = startAngles[index];
                const endAngle = endAngles[index];
                const currentAngle = startAngle + (endAngle - startAngle) * eased;

                const x = centerX + Math.cos(currentAngle) * radiusX;
                const y = centerY + Math.sin(currentAngle) * radiusY;

                el.style.left = x + 'px';
                el.style.top = y + 'px';
                el.style.transform = 'translate(-50%, -50%)';

                const percentProgress = Math.min(moveElapsed / percentDuration, 1);
                const percentEased = 1 - Math.pow(1 - percentProgress, 3);
                const percent = Math.floor(percentEased * 100);

                el.textContent = percent + '%';

                const fadeProgress = Math.min(moveElapsed / 300, 1);
                el.style.opacity = fadeProgress;
            }
        });

        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen && !loadingScreen.classList.contains('loaded')) {
            requestAnimationFrame(updateAnimation);
        }
    }

    updateAnimation();
}

// ==========================================
// Three.js Setup
// ==========================================
function initThreeJS() {
    const container = document.getElementById('three-container');
    if (!container) return;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 50;

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    setupLighting();
    createANRIStyleObjects();
    createLogoLetters();
    animate();
}

// ==========================================
// Lighting Setup
// ==========================================
function setupLighting() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(20, 30, 20);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight.position.set(-20, 10, 20);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
    rimLight.position.set(0, -20, -20);
    scene.add(rimLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 0.6);
    topLight.position.set(0, 40, 0);
    scene.add(topLight);
}

// ==========================================
// Create ANRI-style 3D Objects
// ==========================================
function createANRIStyleObjects() {
    const grayMetal = new THREE.MeshStandardMaterial({
        color: 0x808080,
        metalness: 0.7,
        roughness: 0.35
    });

    const darkMetal = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.3,
        roughness: 0.7
    });

    const blackMetal = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        metalness: 0.2,
        roughness: 0.8
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xeeeeff,
        metalness: 0.1,
        roughness: 0.05,
        transparent: true,
        opacity: 0.6,
        envMapIntensity: 1.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
    });

    const objectConfigs = [
        { type: 'thickC', material: grayMetal, colorType: 'gray', pos: [45, 5, -10], scale: 14, rot: [0.3, 0.8, -0.2] },
        { type: 'thickC', material: grayMetal, colorType: 'gray', pos: [-42, -12, -8], scale: 12, rot: [0.5, -0.3, 0.4] },
        { type: 'doubleRing', material: glassMaterial, colorType: 'glass', pos: [-35, 12, 8], scale: 5, rot: [0.4, 0.2, 0.5] },
        { type: 'doubleRing', material: glassMaterial, colorType: 'glass', pos: [40, 15, 10], scale: 4, rot: [-0.2, 0.5, 0.2] },
        { type: 'cylinder', material: blackMetal, colorType: 'black', pos: [-12, 18, 5], scale: [1, 12, 1], rot: [0.3, 0.1, 0.6] },
        { type: 'cylinder', material: blackMetal, colorType: 'black', pos: [20, -18, 3], scale: [1.2, 14, 1.2], rot: [-0.4, 0.2, -0.5] },
        { type: 'cylinder', material: darkMetal, colorType: 'dark', pos: [-30, -25, 2], scale: [0.8, 8, 0.8], rot: [0.5, -0.2, 0.3] },
        { type: 'cylinder', material: blackMetal, colorType: 'black', pos: [35, 25, 0], scale: [0.6, 6, 0.6], rot: [-0.3, 0.4, 0.4] },
        { type: 'hexagon', material: darkMetal, colorType: 'dark', pos: [-20, -20, 8], scale: 3.5, rot: [0.4, 0.3, 0.5] },
        { type: 'hexagon', material: blackMetal, colorType: 'black', pos: [28, -25, 6], scale: 3, rot: [0.2, 0.5, 0.3] },
        { type: 'hexagon', material: grayMetal, colorType: 'gray', pos: [15, 22, 4], scale: 2.5, rot: [0.5, 0.4, 0.6] },
        { type: 'hexagon', material: darkMetal, colorType: 'dark', pos: [-38, 20, 5], scale: 2.5, rot: [0.6, 0.2, 0.4] },
        { type: 'hexagon', material: blackMetal, colorType: 'black', pos: [0, -30, 7], scale: 2, rot: [0.3, 0.6, 0.3] },
        { type: 'hexagon', material: darkMetal, colorType: 'dark', pos: [-8, 28, 6], scale: 2, rot: [0.5, 0.3, 0.5] },
    ];

    objectConfigs.forEach(config => {
        let mesh;

        switch(config.type) {
            case 'thickC':
                const arcCurve = new THREE.EllipseCurve(
                    0, 0, 1, 1,
                    0, Math.PI * 1.3,
                    false
                );
                const arcPoints = arcCurve.getPoints(50);
                const arcShape = new THREE.Shape();

                const thickness = 0.5;
                arcShape.moveTo(arcPoints[0].x - thickness/2, arcPoints[0].y);
                arcPoints.forEach(p => {
                    arcShape.lineTo(p.x, p.y);
                });
                for (let i = arcPoints.length - 1; i >= 0; i--) {
                    const p = arcPoints[i];
                    const nx = p.x * 1.5;
                    const ny = p.y * 1.5;
                    arcShape.lineTo(nx, ny);
                }
                arcShape.closePath();

                const extrudeSettings = {
                    steps: 1,
                    depth: 0.6,
                    bevelEnabled: true,
                    bevelThickness: 0.15,
                    bevelSize: 0.15,
                    bevelSegments: 8
                };

                const cGeom = new THREE.ExtrudeGeometry(arcShape, extrudeSettings);
                cGeom.center();
                mesh = new THREE.Mesh(cGeom, config.material.clone());
                mesh.material.side = THREE.DoubleSide;
                mesh.scale.set(config.scale, config.scale, config.scale);
                break;

            case 'doubleRing':
                const ringGroup = new THREE.Group();
                const ringGeom = new THREE.TorusGeometry(1, 0.08, 16, 60);
                const ring1 = new THREE.Mesh(ringGeom, config.material.clone());
                const ring2 = new THREE.Mesh(ringGeom, config.material.clone());
                ring2.position.x = 0.7;
                ring2.rotation.y = Math.PI / 2;
                ringGroup.add(ring1, ring2);

                const ringStartOffset = 150 + Math.random() * 100;
                const ringAngle = Math.random() * Math.PI * 2;
                const ringStartX = Math.cos(ringAngle) * ringStartOffset;
                const ringStartY = Math.sin(ringAngle) * ringStartOffset;
                const ringStartZ = -50 + Math.random() * 30;

                ringGroup.position.set(ringStartX, ringStartY, ringStartZ);
                ringGroup.rotation.set(config.rot[0], config.rot[1], config.rot[2]);
                ringGroup.scale.set(config.scale, config.scale, config.scale);
                ringGroup.userData = {
                    originalPos: { x: config.pos[0], y: config.pos[1], z: config.pos[2] },
                    startPos: { x: ringStartX, y: ringStartY, z: ringStartZ },
                    type: config.type,
                    colorType: config.colorType,
                    baseScale: config.scale,
                    introDelay: Math.random() * 0.5
                };
                scene.add(ringGroup);
                floatingObjects.push(ringGroup);
                return;

            case 'cylinder':
                const cylGeom = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
                mesh = new THREE.Mesh(cylGeom, config.material.clone());
                mesh.scale.set(config.scale[0], config.scale[1], config.scale[2]);
                break;

            case 'hexagon':
                const hexGeom = new THREE.CylinderGeometry(1, 1, 1.5, 6);
                mesh = new THREE.Mesh(hexGeom, config.material.clone());
                mesh.scale.set(config.scale, config.scale, config.scale);
                break;
        }

        if (mesh) {
            const startOffset = 150 + Math.random() * 100;
            const angle = Math.random() * Math.PI * 2;
            const startX = Math.cos(angle) * startOffset;
            const startY = Math.sin(angle) * startOffset;
            const startZ = -50 + Math.random() * 30;

            mesh.position.set(startX, startY, startZ);
            mesh.rotation.set(config.rot[0], config.rot[1], config.rot[2]);

            mesh.userData = {
                originalPos: { x: config.pos[0], y: config.pos[1], z: config.pos[2] },
                originalRot: { x: config.rot[0], y: config.rot[1], z: config.rot[2] },
                startPos: { x: startX, y: startY, z: startZ },
                type: config.type,
                colorType: config.colorType,
                baseScale: Array.isArray(config.scale) ? 1 : config.scale,
                introDelay: Math.random() * 0.5
            };

            scene.add(mesh);
            floatingObjects.push(mesh);
        }
    });
}

// ==========================================
// Create "Let's Media" Logo (3D Text)
// ==========================================
function createLogoLetters() {
    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        metalness: 0.9,
        roughness: 0.15,
        depthTest: false
    });

    const letsLogoY = -1.5;  // Let's slightly higher
    const mediaLogoY = -3;   // Media position
    const logoZ = 25;
    const introStartY = -80;

    const fontLoader = new THREE.FontLoader();

    fontLoader.load(
        'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/fonts/helvetiker_bold.typeface.json',
        function(font) {
            // Create "Let's" text (smaller size)
            const letsGeometry = new THREE.TextGeometry("Let's", {
                font: font,
                size: 3.5,
                height: 0.8,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.15,
                bevelSize: 0.08,
                bevelOffset: 0,
                bevelSegments: 5
            });
            letsGeometry.center();

            const letsMesh = new THREE.Mesh(letsGeometry, metalMaterial.clone());
            letsMesh.position.set(-6, introStartY, logoZ);
            letsMesh.renderOrder = 999;
            letsMesh.userData = {
                originalX: -6,
                originalY: letsLogoY,
                originalZ: logoZ,
                floatOffset: 0,
                introDelay: 0
            };
            scene.add(letsMesh);
            logoLetters.push(letsMesh);

            // Create "Media" with red "d" - split into "Me", "d", "ia"
            const redMaterial = new THREE.MeshStandardMaterial({
                color: 0xcc0000,
                metalness: 0.9,
                roughness: 0.15,
                depthTest: false
            });

            const textConfig = {
                font: font,
                size: 3.5,
                height: 0.8,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.15,
                bevelSize: 0.08,
                bevelOffset: 0,
                bevelSegments: 5
            };

            // Create "Me" part
            const meGeometry = new THREE.TextGeometry("Me", textConfig);
            meGeometry.computeBoundingBox();
            const meWidth = meGeometry.boundingBox.max.x - meGeometry.boundingBox.min.x;

            // Create "d" part (red)
            const dGeometry = new THREE.TextGeometry("d", textConfig);
            dGeometry.computeBoundingBox();
            const dWidth = dGeometry.boundingBox.max.x - dGeometry.boundingBox.min.x;

            // Create "ia" part
            const iaGeometry = new THREE.TextGeometry("ia", textConfig);
            iaGeometry.computeBoundingBox();
            const iaWidth = iaGeometry.boundingBox.max.x - iaGeometry.boundingBox.min.x;

            // Total width for centering
            const totalWidth = meWidth + dWidth + iaWidth;
            const startX = -totalWidth / 2;

            // Create Media group
            const mediaGroup = new THREE.Group();

            const meMesh = new THREE.Mesh(meGeometry, metalMaterial.clone());
            meMesh.position.x = startX;
            meMesh.renderOrder = 999;
            mediaGroup.add(meMesh);

            const dMesh = new THREE.Mesh(dGeometry, redMaterial);
            dMesh.position.x = startX + meWidth;
            dMesh.renderOrder = 999;
            mediaGroup.add(dMesh);

            const iaMesh = new THREE.Mesh(iaGeometry, metalMaterial.clone());
            iaMesh.position.x = startX + meWidth + dWidth;
            iaMesh.renderOrder = 999;
            mediaGroup.add(iaMesh);

            mediaGroup.position.set(6, introStartY, logoZ);
            mediaGroup.userData = {
                originalX: 6,
                originalY: mediaLogoY,
                originalZ: logoZ,
                floatOffset: 0,
                introDelay: 0.15
            };
            scene.add(mediaGroup);
            logoLetters.push(mediaGroup);
        },
        undefined,
        function() {
            console.warn('Font loading failed, using fallback');
            createFallbackLogo();
        }
    );
}

// Fallback logo if font fails to load
function createFallbackLogo() {
    const metalMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        metalness: 0.9,
        roughness: 0.15,
        depthTest: false
    });

    const logoY = -3;
    const logoZ = 25;
    const introStartY = -80;

    // "Let's" as abstract shapes (5 characters)
    const letsChars = ['L', 'e', 't', "'", 's'];
    const letsStartX = -35;
    letsChars.forEach((char, i) => {
        const geom = new THREE.TorusKnotGeometry(2.5, 0.6, 64, 16, 2 + i % 3, 3);
        const mesh = new THREE.Mesh(geom, metalMaterial.clone());
        const xPos = letsStartX + i * 7;
        mesh.position.set(xPos, introStartY, logoZ);
        mesh.renderOrder = 999;
        mesh.userData = {
            originalX: xPos,
            originalY: logoY + 2,
            originalZ: logoZ,
            floatOffset: i * (Math.PI / 5),
            introDelay: i * 0.05
        };
        scene.add(mesh);
        logoLetters.push(mesh);
    });

    // "Media" as abstract shapes (5 characters)
    const mediaChars = ['M', 'e', 'd', 'i', 'a'];
    const mediaStartX = 5;
    mediaChars.forEach((char, i) => {
        const geom = new THREE.TorusKnotGeometry(2.5, 0.6, 64, 16, 3, 2 + i % 4);
        const mesh = new THREE.Mesh(geom, metalMaterial.clone());
        const xPos = mediaStartX + i * 7;
        mesh.position.set(xPos, introStartY, logoZ);
        mesh.renderOrder = 999;
        mesh.userData = {
            originalX: xPos,
            originalY: logoY - 2,
            originalZ: logoZ,
            floatOffset: Math.PI / 2 + i * (Math.PI / 5),
            introDelay: 0.15 + i * 0.05
        };
        scene.add(mesh);
        logoLetters.push(mesh);
    });
}

// ==========================================
// Update Logo Scale for Mobile
// ==========================================
function updateLogoScale() {
    const width = window.innerWidth;
    let scale = 1;
    let cameraZ = 50;

    if (width <= 400) {
        scale = 0.2;
        cameraZ = 70;
    } else if (width <= 480) {
        scale = 0.25;
        cameraZ = 65;
    } else if (width <= 600) {
        scale = 0.35;
        cameraZ = 60;
    } else if (width <= 768) {
        scale = 0.45;
        cameraZ = 55;
    } else if (width <= 1024) {
        scale = 0.7;
    }

    logoLetters.forEach(letter => {
        letter.scale.set(scale, scale, scale);
    });

    if (camera) {
        camera.position.z = cameraZ;
    }
}

// ==========================================
// Intro Animation
// ==========================================
function playIntroAnimation() {
    if (typeof gsap === 'undefined') {
        floatingObjects.forEach(obj => {
            const ud = obj.userData;
            obj.position.set(ud.originalPos.x, ud.originalPos.y, ud.originalPos.z);
        });
        logoLetters.forEach(letter => {
            letter.position.y = letter.userData.originalY;
        });
        isIntroComplete = true;
        return;
    }

    floatingObjects.forEach((obj, index) => {
        const ud = obj.userData;
        const delay = ud.introDelay || (index * 0.05);

        gsap.to(obj.position, {
            x: ud.originalPos.x,
            y: ud.originalPos.y,
            z: ud.originalPos.z,
            duration: 1.8,
            delay: delay,
            ease: "power3.out"
        });
    });

    logoLetters.forEach((letter, index) => {
        const ud = letter.userData;
        const delay = 0.3 + (ud.introDelay || (index * 0.1));

        gsap.to(letter.position, {
            y: ud.originalY,
            duration: 1.5,
            delay: delay,
            ease: "back.out(1.2)"
        });
    });

    setTimeout(() => {
        isIntroComplete = true;
    }, 2500);
}

// ==========================================
// Animation Loop
// ==========================================
function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    targetMouseX += (mouseX - targetMouseX) * 0.05;
    targetMouseY += (mouseY - targetMouseY) * 0.05;

    if (isIntroComplete) {
        floatingObjects.forEach(obj => {
            const ud = obj.userData;

            if (!ud.velocity) {
                ud.velocity = new THREE.Vector3(
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.01
                );
                ud.pulsePhase = Math.random() * Math.PI * 2;
            }

            obj.position.x += ud.velocity.x;
            obj.position.y += ud.velocity.y;
            obj.position.z += ud.velocity.z;

            const boundX = 60, boundY = 40;
            const boundZMin = -30, boundZMax = 15; // Max Z is behind logo (logoZ = 25)
            if (Math.abs(obj.position.x) > boundX) {
                ud.velocity.x *= -1;
                obj.position.x = Math.sign(obj.position.x) * boundX;
            }
            if (Math.abs(obj.position.y) > boundY) {
                ud.velocity.y *= -1;
                obj.position.y = Math.sign(obj.position.y) * boundY;
            }
            if (obj.position.z < boundZMin) {
                ud.velocity.z *= -1;
                obj.position.z = boundZMin;
            }
            if (obj.position.z > boundZMax) {
                ud.velocity.z *= -1;
                obj.position.z = boundZMax;
            }

            obj.rotation.x += 0.002;
            obj.rotation.y += 0.003;

            ud.pulsePhase += 0.01;
            const pulse = Math.sin(ud.pulsePhase) * 0.02 + 1;
            if (ud.type === 'cube' || ud.type === 'triangle') {
                obj.scale.setScalar(obj.userData.baseScale ? obj.userData.baseScale * pulse : pulse);
            }
        });
    }

    // Logo with ANRI-style subtle movement
    logoLetters.forEach((letter) => {
        // Subtle floating Y movement
        const floatY = Math.sin(time * 0.3 + letter.userData.floatOffset) * 0.4;
        const targetY = letter.userData.originalY + floatY;
        letter.position.y += (targetY - letter.position.y) * 0.05;

        // Subtle X drift (ANRI-style)
        const floatX = Math.sin(time * 0.2 + letter.userData.floatOffset + Math.PI) * 0.3;
        const targetX = letter.userData.originalX + floatX;
        letter.position.x += (targetX - letter.position.x) * 0.05;

        // Very subtle rotation (still readable but alive)
        const targetRotY = Math.sin(time * 0.15 + letter.userData.floatOffset) * 0.03;
        const targetRotX = Math.sin(time * 0.12 + letter.userData.floatOffset) * 0.02;
        letter.rotation.y += (targetRotY - letter.rotation.y) * 0.03;
        letter.rotation.x += (targetRotX - letter.rotation.x) * 0.03;
    });

    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
}

// ==========================================
// Event Listeners
// ==========================================
function initEventListeners() {
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2);
        mouseY = (e.clientY - window.innerHeight / 2);
    });

    document.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (isAnimating) return;

        if (e.deltaY > 30) {
            navigateToPage((currentPage + 1) % totalPages);
        } else if (e.deltaY < -30) {
            navigateToPage((currentPage - 1 + totalPages) % totalPages);
        }
    }, { passive: false });

    let touchStartY = 0;
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    });

    document.addEventListener('touchmove', (e) => {
        const diff = touchStartY - e.touches[0].clientY;
        if (Math.abs(diff) > 50 && !isAnimating) {
            if (diff > 0) navigateToPage((currentPage + 1) % totalPages);
            else navigateToPage((currentPage - 1 + totalPages) % totalPages);
            touchStartY = e.touches[0].clientY;
        }
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        updateLogoScale();
    });

    // Initial scale adjustment for mobile
    updateLogoScale();

    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            navigateToPage((currentPage + 1) % totalPages);
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            navigateToPage((currentPage - 1 + totalPages) % totalPages);
        }
    });
}

// ==========================================
// Page Navigation (SPA)
// ==========================================
function navigateToPage(index) {
    if (isAnimating || index === currentPage) return;
    if (index < 0) index = totalPages - 1;
    if (index >= totalPages) index = 0;

    isAnimating = true;
    const prevPage = currentPage;
    currentPage = index;
    const direction = index > prevPage ? 1 : -1;

    const config = pageConfig[currentPage];

    // Animate background color change
    if (typeof gsap !== 'undefined') {
        gsap.to(document.body, {
            backgroundColor: config.bg,
            duration: 0.8,
            ease: "power2.inOut"
        });
    } else {
        document.body.style.backgroundColor = config.bg;
    }

    // Animate 3D objects rotation and position (ANRI-style "gurutto" animation)
    animateObjectsTransition(direction);

    // Animate 3D object colors
    animateObjectColors(currentPage);

    // Update UI elements
    updateNavLinks();
    updateDots();
    updateBottomNav();
    updateViewButton();

    setTimeout(() => {
        isAnimating = false;
    }, 1000);
}

// ==========================================
// Animate 3D Objects Transition (ANRI-style - fly out and in)
// ==========================================
function animateObjectsTransition(direction) {
    if (typeof gsap === 'undefined') return;

    // ANRI-style: Objects fly out to screen edges, then fly back to new positions
    floatingObjects.forEach((obj, index) => {
        const delay = index * 0.03;
        const ud = obj.userData;

        // Calculate fly-out direction (towards screen edge in movement direction)
        const flyOutX = direction * (80 + Math.random() * 40); // Fly far off screen
        const flyOutY = (Math.random() - 0.5) * 60;
        const flyOutZ = -30 + Math.random() * 20;

        // Generate new random position for landing (Z must stay behind logo)
        const newX = (Math.random() - 0.5) * 100;
        const newY = (Math.random() - 0.5) * 60;
        const newZ = -30 + Math.random() * 45; // Range: -30 to 15 (behind logo at Z=25)

        // Store new position as original
        ud.originalPos = { x: newX, y: newY, z: newZ };

        // Phase 1: Fly out with rotation
        gsap.to(obj.position, {
            x: flyOutX,
            y: flyOutY,
            z: flyOutZ,
            duration: 0.5,
            delay: delay,
            ease: "power2.in",
            onComplete: () => {
                // Teleport to opposite side
                obj.position.x = -flyOutX * 0.8;
                obj.position.y = (Math.random() - 0.5) * 40;
                obj.position.z = flyOutZ;

                // Phase 2: Fly in to new position
                gsap.to(obj.position, {
                    x: newX,
                    y: newY,
                    z: newZ,
                    duration: 0.6,
                    ease: "power2.out"
                });
            }
        });

        // Rotation during transition
        gsap.to(obj.rotation, {
            x: obj.rotation.x + Math.PI * 2 * direction,
            y: obj.rotation.y + Math.PI * 1.5 * direction,
            z: obj.rotation.z + Math.PI * direction,
            duration: 1.1,
            delay: delay,
            ease: "power2.inOut"
        });
    });

    // Logo ANRI-style page transition animation
    logoLetters.forEach((letter, index) => {
        const delay = index * 0.1;
        const ud = letter.userData;

        // Fly out in direction, then come back
        const flyOutX = ud.originalX + direction * 30;
        const flyOutY = ud.originalY + (index === 0 ? -8 : 8);

        // Phase 1: Fly out
        gsap.to(letter.position, {
            x: flyOutX,
            y: flyOutY,
            duration: 0.4,
            delay: delay,
            ease: "power2.in",
            onComplete: () => {
                // Phase 2: Fly back to original position
                gsap.to(letter.position, {
                    x: ud.originalX,
                    y: ud.originalY,
                    duration: 0.5,
                    ease: "power2.out"
                });
            }
        });

        // Rotation during transition
        gsap.to(letter.rotation, {
            y: letter.rotation.y + direction * 0.3,
            x: letter.rotation.x + direction * 0.15,
            duration: 0.9,
            delay: delay,
            ease: "power2.inOut",
            onComplete: () => {
                // Return rotation smoothly
                gsap.to(letter.rotation, {
                    y: 0,
                    x: 0,
                    duration: 0.4,
                    ease: "power2.out"
                });
            }
        });
    });
}

// ==========================================
// Animate 3D Object Colors
// ==========================================
function animateObjectColors(pageIndex) {
    const config = pageConfig[pageIndex];
    if (!config || !config.objectColors) return;

    floatingObjects.forEach(obj => {
        const colorType = obj.userData.colorType;
        if (colorType === 'glass') return; // Don't change glass objects

        const targetColor = config.objectColors[colorType];
        if (!targetColor) return;

        // Get material(s) to animate
        let materials = [];
        if (obj.material) {
            materials.push(obj.material);
        }
        if (obj.children) {
            obj.children.forEach(child => {
                if (child.material) materials.push(child.material);
            });
        }

        materials.forEach(material => {
            if (typeof gsap !== 'undefined') {
                gsap.to(material.color, {
                    r: ((targetColor >> 16) & 255) / 255,
                    g: ((targetColor >> 8) & 255) / 255,
                    b: (targetColor & 255) / 255,
                    duration: 0.8,
                    ease: "power2.inOut"
                });
            } else {
                material.color.setHex(targetColor);
            }
        });
    });
}

// ==========================================
// Update UI Elements
// ==========================================
function updateNavLinks() {
    // Header nav links
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
        const pageIndex = parseInt(link.getAttribute('data-page'));
        link.classList.toggle('active', pageIndex === currentPage);
    });

    // Mobile nav links
    document.querySelectorAll('.mobile-nav-link[data-page]').forEach(link => {
        const pageIndex = parseInt(link.getAttribute('data-page'));
        link.classList.toggle('active', pageIndex === currentPage);
    });
}

function updateDots() {
    document.querySelectorAll('.dot[data-page]').forEach(dot => {
        const pageIndex = parseInt(dot.getAttribute('data-page'));
        dot.classList.toggle('active', pageIndex === currentPage);
    });
}

function updateBottomNav() {
    const isMobile = window.innerWidth <= 768;
    const pages = isMobile
        ? ['ホーム', '事業内容', 'お問い合わせ', '会社概要']
        : ['ホーム', '事業内容', 'お問い合わせ'];
    const numPages = pages.length;
    const prev = (currentPage - 1 + numPages) % numPages;
    const next = (currentPage + 1) % numPages;

    const prevEl = document.querySelector('.bottom-link.prev-page');
    const currentEl = document.querySelector('.bottom-link.current-page');
    const nextEl = document.querySelector('.bottom-link.next-page');

    if (prevEl) prevEl.textContent = pages[prev];
    if (currentEl) currentEl.textContent = pages[currentPage];
    if (nextEl) nextEl.textContent = pages[next];
}

function updateViewButton() {
    const viewPage = document.querySelector('.view-page');
    const viewButton = document.querySelector('.view-button');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const isMobile = window.innerWidth <= 768;

    if (viewPage) {
        const pages = isMobile
            ? ['Home', 'Services', 'Contact', 'Company']
            : ['Home', 'Services', 'Contact'];
        viewPage.textContent = pages[currentPage] || pages[0];
    }

    // Home (page 0): show scroll indicator, hide view button
    // Other pages: show view button, hide scroll indicator
    if (scrollIndicator && viewButton) {
        if (currentPage === 0) {
            scrollIndicator.style.display = 'block';
            viewButton.style.display = 'none';
        } else {
            scrollIndicator.style.display = 'none';
            viewButton.style.display = 'flex';
        }
    }

    // Add click handler for view button
    if (viewButton) {
        viewButton.onclick = () => {
            navigateToDetailPage(currentPage);
        };
    }
}

// ==========================================
// Navigate to Detail Pages
// ==========================================
function navigateToDetailPage(pageIndex) {
    const pageUrls = {
        1: 'business.html',  // 事業内容
        2: 'contact.html',   // お問い合わせ
        3: 'company.html'    // 会社概要
    };

    const url = pageUrls[pageIndex];
    if (url) {
        window.location.href = url;
    }
}

// ==========================================
// Company name blink (background white/black)
// ==========================================
let isDark = false;

setInterval(() => {
    const el = document.querySelector('.featured-company');
    if (el) {
        isDark = !isDark;
        if (isDark) {
            el.style.backgroundColor = '#000000';
            el.style.color = '#ffffff';
        } else {
            el.style.backgroundColor = '#ffffff';
            el.style.color = '#000000';
        }
    }
}, 1000);
