// Declare global variables
let model, scene, renderer, camera, controls;
let dark = false; // Dark mode state


// Entry point to initialize the application
function init() {
    setupScene(); // Setup 3D scene
    setupRenderer(); // Setup WebGL renderer
    setupLights(); // Setup ambient and directional lights
    setupEventListeners(); // Setup event listeners
    animate(); // Start animation loop
}

// Function to set up the 3D scene
function setupScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(10, 5, 10); // Set initial camera position
}

// Function to load the 3D model
function loadModel(modelPath) {
    const loader = new THREE.GLTFLoader();
    loader.load(modelPath, function (gltf) {
        if (model) {
            scene.remove(model); // Remove the previous model if it exists
        }
        model = gltf.scene;
        scene.add(model);

        // Center the model in the scene
        const bbox = new THREE.Box3().setFromObject(model);
        const center = bbox.getCenter(new THREE.Vector3());
        model.position.sub(center);

        // Update camera and controls
        camera.lookAt(center);
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

    }, undefined, function (error) {
        console.error('Error loading model:', error);
    });
}

// Function to set up the WebGL renderer
function setupRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x191970);
    document.body.appendChild(renderer.domElement);
}

// Function to set up lights
function setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
}

// Function to handle window resizing
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Function to handle the animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Call init() to start the application
init();
