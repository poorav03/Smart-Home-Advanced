let scene, camera, renderer, model;

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1c);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("scene-container").appendChild(renderer.domElement);

    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const loader = new THREE.GLTFLoader();

    loader.load("house.glb", (gltf) => {
        model = gltf.scene;
        model.scale.set(2,2,2);
        scene.add(model);
    }, undefined, () => {
        addFallbackModel();
    });

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function addFallbackModel() {
    const house = new THREE.Group();

    const base = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 1.5, 2.5),
        new THREE.MeshStandardMaterial({ color: 0x36d9ff })
    );
    house.add(base);

    const roof = new THREE.Mesh(
        new THREE.ConeGeometry(2.1, 1.3, 4),
        new THREE.MeshStandardMaterial({ color: 0x0f172a })
    );
    roof.position.y = 1.35;
    roof.rotation.y = Math.PI / 4;
    house.add(roof);

    model = house;
    scene.add(model);
}

function animate() {
    requestAnimationFrame(animate);

    if(model) model.rotation.y += 0.003;

    renderer.render(scene, camera);
}

function goTo(page) {
    window.location.href = page;
}
