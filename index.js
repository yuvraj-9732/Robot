// Declare global variables
let model;
let scene;
let ambientLight;
let renderer;
let cameraDistance;
let controls;
let dark = false;


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
    // Create a new scene
    scene = new THREE.Scene();

    // Set up the camera to keep the model centered
    const modelCenter = new THREE.Vector3(0, 0, 0);
     cameraDistance = 10; // Setting up constant distance to ensure responsiveness

    // Create a perspective camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Set the camera's position relative to the model's center
    camera.position.copy(modelCenter.clone().add(new THREE.Vector3(cameraDistance, cameraDistance / 2, cameraDistance)));
}


// Function to load the 3D model
function loadModel(modelPath) {
    const loader = new THREE.GLTFLoader();
    loader.load(
        modelPath,
        function (gltf) {
            if (model) {
                scene.remove(model); // Remove the previous model from the scene
            }

            if (modelPath === "lowpoly_backpack/scene.gltf"){
                cameraDistance = 1;
            } else if (modelPath === "sugarcube_corner/scene.gltf"){
                cameraDistance = 5;
            } else if (modelPath === "2x2_cube/scene.gltf"){
                cameraDistance = 2;
            } else if (modelPath === "forest_house/scene.gltf"){
                cameraDistance = 15;
            }
            model = gltf.scene;
            scene.add(model);

            // Automatically center the model
            const bbox = new THREE.Box3().setFromObject(model);
            const center = bbox.getCenter(new THREE.Vector3());
            model.position.sub(center);

            // Apply smooth shading to model materials
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true; // Enable shadow casting
                    child.receiveShadow = true; // Enable shadow receiving

                    // Adjust material properties for better shadow effects
                    child.material.flatShading = true; // Apply flat shading
                    child.material.side = THREE.DoubleSide; // Ensure both sides of geometry receive shadows
                }
            });

             // Update camera position
             camera.position.copy(center.clone().add(new THREE.Vector3(cameraDistance, cameraDistance / 2, cameraDistance)));

            // Setup orbit controls
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.25;
            controls.enableZoom = true;
        },
        undefined,
        //Handling errors in loading the model
        function (error) {
            console.error('Error loading model:', error);
        }
    );
}


// Function to set up the WebGL renderer
function setupRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Set the pixel ratio to match the device's pixel density for better rendering on high-resolution displays
    renderer.setPixelRatio(window.devicePixelRatio);
    // Set the background color of the renderer, during night its dark blue and at day it is sky blue
    renderer.setClearColor(0x191970);
        
    renderer.shadowMap.enabled = true; // Enable shadow mapping in the renderer
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows for smoother edges

    document.body.appendChild(renderer.domElement);
}


// Function to set up ambient and directional lights
function setupLights() {
    // Add ambient light
    ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Adjust ambient light intensity
    scene.add(ambientLight);

    // Add directional light (simulating sunlight)
    const sunLight = new THREE.DirectionalLight(0xffe4c4, 1);
    sunLight.position.set(40, 50, 40);

    // Enable shadow casting from the directional light
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048; // Shadow map resolution
    sunLight.shadow.mapSize.height = 2048;

    // Set up shadow camera frustum to focus the shadow in a diagonal direction
    const shadowCameraSize = 20; 
    sunLight.shadow.camera.left = -shadowCameraSize;
    sunLight.shadow.camera.right = shadowCameraSize;
    sunLight.shadow.camera.top = -shadowCameraSize;
    sunLight.shadow.camera.bottom = shadowCameraSize;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 100;

    scene.add(sunLight);

    // Configure model to receive and cast shadows
    if (model) {
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }
}


// Function to set up event listeners
function setupEventListeners() {
    window.addEventListener('resize', onWindowResize);

    //Calling function when the mouse/cursor hovers over the model
    renderer.domElement.addEventListener('mousemove', handleMouseMove);

    //When the mouse/cursor is in the screen, the background music plays 
    renderer.domElement.addEventListener('mouseenter', playAmbientSound);

    //When the mouse/cursor leaves the screen, the background music stops
    renderer.domElement.addEventListener('mouseleave', pauseAmbientSound);

    //Handles arrow key such that when its arrow up, the camera moves forward
    //and when its arrow down, then the camera moves backward
    document.addEventListener('keydown', handleKeyDown); // Keyboard input
}


// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate the model continuously around the y-axis
    if (model) {
        model.rotation.y += 0.003;
    }

    // Update controls if available
    if (controls) {
        controls.update();
    }

    // Render the scene
    renderer.render(scene, camera);
}


// Function to handle window resizing
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


// Function to handle mouse move events
function handleMouseMove(event) {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1; 
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1; 

    // Create a raycaster from the camera position and mouse coordinates
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera);

    // Perform raycasting to detect intersections with scene objects
    const intersects = raycaster.intersectObjects(scene.children, true);

    // Check if there are any intersections with the model
    if (intersects.length > 0) {
        // Set custom cursor style when hovering over the model
        renderer.domElement.style.cursor = 'url("media/cursor-glow.png"), auto';
    } else {
        // Reset cursor to default when not hovering over any object
        renderer.domElement.style.cursor = 'auto';
    }
}


// Function to play ambient sound
function playAmbientSound() {
    const ambientSound = document.getElementById('ambientSound');
    ambientSound.play();
}


// Function to pause ambient sound
function pauseAmbientSound() {
    const ambientSound = document.getElementById('ambientSound');
    ambientSound.pause();
}


// Function to handle keyboard input for navigation
function handleKeyDown(event) {
    const speed = 0.3;
    switch (event.key) {
        case 'ArrowUp':
            camera.position.z -= speed; // Move camera forward
            break;
        case 'ArrowDown':
            camera.position.z += speed; // Move camera backward
            break;
    }
}


// Function to toggle ambient light
function toggleLights() {
    dark = !dark; // Toggle state when clicked on mode button

    // Toggle background color
    renderer.setClearColor(dark ? 0x191970 : 0x87CEEB);

    const modeButton = document.getElementById('modeButton'); //Refers to mode button 
    const modeDisplay = document.getElementById('modeDisplay'); //Refers to moon and sun images

    if (dark) {
        modeButton.style.backgroundColor = 'blue';
        modeButton.style.backgroundImage = 'url(/media/night.png)';
        modeButton.style.backgroundPosition = 'left';
        modeDisplay.src = 'media/moon.png';
        ambientLight.intensity = 0.3; // Ambient light off (dark mode)
    } else {
        modeButton.style.backgroundColor = 'rgb(39, 196, 236)';
        modeButton.style.backgroundImage = 'url(/media/day.png)';
        modeButton.style.backgroundPosition = 'right';
        modeDisplay.src = 'media/sun.png';
        ambientLight.intensity = 1; // Ambient light on (day mode)
    }
}


// Call init() to start the application
init();
