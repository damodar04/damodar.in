
// --- REALISTIC 3D SOLAR SYSTEM ---
import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';

const bgCanvas = document.querySelector('#bg-canvas');
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 40); // Slightly lower angle for realism
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: bgCanvas,
    alpha: true,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Texture Loader
const loader = new THREE.TextureLoader();

// --- TEXTURES (Wikimedia / NASA) ---
// Note: Using standard images. If they fail to load, materials will use fallback colors.
const earthTexture = loader.load('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Aurora_as_seen_by_IMAGE.jpg/640px-Aurora_as_seen_by_IMAGE.jpg', undefined, undefined, (err) => console.log('Texture Error')); // Using a cool abstract/dark earth map or blue marble
// Better Earth Map
const earthMap = loader.load('https://upload.wikimedia.org/wikipedia/commons/2/22/Earth_Western_Hemisphere_transparent_background.png');

const moonTexture = loader.load('https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg');

// --- LIGHTS ---
const ambientLight = new THREE.AmbientLight(0x333333); // Dark space
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xffffff, 2, 300);
sunLight.position.set(0, 0, 0); // Sun is source
scene.add(sunLight);

// --- OBJECTS ---

// 1. GALAXY / STARFIELD
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 8000;
const posArray = new Float32Array(particlesCount * 3);
const colorsArray = new Float32Array(particlesCount * 3);

// Create a spiral galaxy shape + random stars
for (let i = 0; i < particlesCount; i++) {
    const i3 = i * 3;
    // Mix of random spread and spiral arms
    const radius = Math.random() * 100 + 10;
    const spinAngle = radius * 0.2;
    const branchAngle = (i % 3) * ((Math.PI * 2) / 3); // 3 arms

    const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 20;
    const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 20;
    const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 20;

    // Mostly flat disk galaxy
    if (i < 5000) {
        posArray[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        posArray[i3 + 1] = randomY * 0.5; // Flatten Y
        posArray[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
    } else {
        // Background stars
        posArray[i3] = (Math.random() - 0.5) * 400;
        posArray[i3 + 1] = (Math.random() - 0.5) * 400;
        posArray[i3 + 2] = (Math.random() - 0.5) * 400;
    }

    // Color: Blue/Purple/White
    const mixedColor = i < 5000 ? new THREE.Color(0x88ccff) : new THREE.Color(0xffffff);
    colorsArray[i3] = mixedColor.r;
    colorsArray[i3 + 1] = mixedColor.g;
    colorsArray[i3 + 2] = mixedColor.b;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
});
const galaxy = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(galaxy);


// 2. SUN (Realistic Glow)
const sunGeo = new THREE.SphereGeometry(6, 64, 64);
const sunMat = new THREE.MeshBasicMaterial({
    color: 0xffdd44,
});
const sun = new THREE.Mesh(sunGeo, sunMat);

// Sun Glow Atmosphere
const sunGlowGeo = new THREE.SphereGeometry(7, 32, 32);
const sunGlowMat = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    transparent: true,
    opacity: 0.2,
    side: THREE.BackSide
});
const sunGlow = new THREE.Mesh(sunGlowGeo, sunGlowMat);
sun.add(sunGlow);
scene.add(sun);


// 3. EARTH (Textured)
const earthGeo = new THREE.SphereGeometry(3, 64, 64);
const earthMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: earthMap, // Texture
    roughness: 0.5,
    metalness: 0
});
const earth = new THREE.Mesh(earthGeo, earthMat);

const earthOrbit = new THREE.Object3D();
earthOrbit.add(earth);
earth.position.set(25, 0, 0); // Distance
scene.add(earthOrbit);


// 4. MOON
const moonGeo = new THREE.SphereGeometry(0.8, 32, 32);
const moonMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: moonTexture
});
const moon = new THREE.Mesh(moonGeo, moonMat);
const moonPivot = new THREE.Object3D();
earth.add(moonPivot);
moonPivot.add(moon);
moon.position.set(5, 0, 0);


// MOUSE INTERACTION
let mouseX = 0;
let mouseY = 0;
document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});


function renderLoop() {
    requestAnimationFrame(renderLoop);

    // Rotate Galaxy slowly
    galaxy.rotation.y += 0.0003;

    // Sun spin
    sun.rotation.y += 0.002;

    // Earth Orbit
    earthOrbit.rotation.y += 0.0015;
    // Earth Spin
    earth.rotation.y += 0.005;

    // Moon Orbit
    moonPivot.rotation.y += 0.01;

    // Parallax
    camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
    camera.position.y += (mouseY * 5 + 10 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}
renderLoop();


// WINDOW RESIZE
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// --- TYPEWRITER (Same as before) ---
const typeOutput = document.getElementById("typewriter-text");
if (typeOutput) {
    const words = ["Data Scientist", "AI Engineer", "Problem Solver"];
    let i = 0;
    let timer;
    function typingEffect() {
        let word = words[i].split("");
        var loopTyping = function () {
            if (word.length > 0) {
                typeOutput.innerHTML += word.shift();
            } else {
                setTimeout(deletingEffect, 2000);
                return false;
            }
            timer = setTimeout(loopTyping, 100);
        };
        loopTyping();
    }
    function deletingEffect() {
        let word = words[i].split("");
        var loopDeleting = function () {
            if (word.length > 0) {
                word.pop();
                typeOutput.innerHTML = word.join("");
            } else {
                if (words.length > (i + 1)) { i++; } else { i = 0; }
                typingEffect();
                return false;
            }
            timer = setTimeout(loopDeleting, 50);
        };
        loopDeleting();
    }
    typingEffect();
}

// --- SCROLL ANIMATION ---
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
}, { threshold: 0.1 });
document.querySelectorAll('.hidden').forEach((el) => observer.observe(el));
