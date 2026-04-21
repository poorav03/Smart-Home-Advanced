let scene;
let camera;
let renderer;
let model;
let orbitGroup;

const heroStatusText = document.getElementById("heroStatusText");
const heroStatusDot = document.getElementById("heroStatusDot");
const heroDeviceText = document.getElementById("heroDeviceText");
const heroToggleButton = document.getElementById("heroToggleButton");
const sceneContainer = document.getElementById("scene-container");

if (sceneContainer) {
  initScene();
  animateScene();
  loadServerStatus();
  setInterval(loadServerStatus, 5000);

  if (heroToggleButton) {
    heroToggleButton.addEventListener("click", toggleLight);
  }
}

function initScene() {
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x09101a, 8, 18);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2.3, 6.8);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
  sceneContainer.appendChild(renderer.domElement);

  const ambient = new THREE.HemisphereLight(0xffffff, 0x23324f, 1.2);
  scene.add(ambient);

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
  mainLight.position.set(5, 10, 3);
  scene.add(mainLight);

  const fillLight = new THREE.PointLight(0x52f1ff, 2.2, 18);
  fillLight.position.set(-4, 3, 4);
  scene.add(fillLight);

  addSceneEnvironment();

  const loader = new THREE.GLTFLoader();
  loader.load("house.glb", handleModelLoad, undefined, addFallbackModel);

  window.addEventListener("resize", handleResize);
}

function addSceneEnvironment() {
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(4.7, 48),
    new THREE.MeshStandardMaterial({
      color: 0x0e2234,
      emissive: 0x08111d,
      roughness: 0.92,
      metalness: 0.1
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.25;
  scene.add(floor);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.2, 0.06, 16, 120),
    new THREE.MeshStandardMaterial({
      color: 0x52f1ff,
      emissive: 0x2fd8e7,
      emissiveIntensity: 0.85
    })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -1.1;
  scene.add(ring);

  orbitGroup = new THREE.Group();
  scene.add(orbitGroup);

  const colors = [0x52f1ff, 0xff9d4d, 0xbdf85b, 0xff5ca8];
  for (let i = 0; i < 12; i += 1) {
    const node = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 20, 20),
      new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        emissive: colors[i % colors.length],
        emissiveIntensity: 0.9
      })
    );

    const angle = (Math.PI * 2 * i) / 12;
    node.position.set(Math.cos(angle) * 3.2, -0.2 + Math.sin(angle * 2) * 0.15, Math.sin(angle) * 3.2);
    orbitGroup.add(node);
  }
}

function handleModelLoad(gltf) {
  model = gltf.scene;
  model.scale.set(1.5, 1.5, 1.5);
  model.position.y = -0.5;
  scene.add(model);
}

function addFallbackModel() {
  const house = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 1.65, 2.6),
    new THREE.MeshStandardMaterial({
      color: 0x85ecff,
      emissive: 0x0d4158,
      roughness: 0.45,
      metalness: 0.1
    })
  );
  house.add(body);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(2.05, 1.4, 4),
    new THREE.MeshStandardMaterial({
      color: 0xff9d4d,
      emissive: 0x5f2600,
      roughness: 0.4
    })
  );
  roof.position.y = 1.35;
  roof.rotation.y = Math.PI / 4;
  house.add(roof);

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.85, 0.08),
    new THREE.MeshStandardMaterial({
      color: 0x11233f,
      emissive: 0x09111f
    })
  );
  door.position.set(0, -0.38, 1.34);
  house.add(door);

  const windowGeometry = new THREE.BoxGeometry(0.42, 0.32, 0.06);
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0xbdf85b,
    emissive: 0x557014,
    emissiveIntensity: 0.9
  });

  const leftWindow = new THREE.Mesh(windowGeometry, windowMaterial);
  leftWindow.position.set(-0.78, 0.15, 1.34);
  house.add(leftWindow);

  const rightWindow = leftWindow.clone();
  rightWindow.position.x = 0.78;
  house.add(rightWindow);

  model = house;
  model.position.y = -0.32;
  scene.add(model);
}

function animateScene() {
  requestAnimationFrame(animateScene);

  if (model) {
    model.rotation.y += 0.004;
    model.position.y = -0.35 + Math.sin(Date.now() * 0.0012) * 0.08;
  }

  if (orbitGroup) {
    orbitGroup.rotation.y -= 0.003;
  }

  renderer.render(scene, camera);
}

function handleResize() {
  if (!sceneContainer || !renderer || !camera) {
    return;
  }

  const width = sceneContainer.clientWidth;
  const height = sceneContainer.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

async function loadServerStatus() {
  if (!heroStatusText || !heroDeviceText || !heroStatusDot) {
    return;
  }

  try {
    const response = await fetch("/status");
    const data = await response.json();

    heroStatusText.textContent = "Online and ready to handle smart home requests.";
    heroDeviceText.textContent = data.light ? "Demo light is currently ON." : "Demo light is currently OFF.";
    heroStatusDot.classList.add("online");
  } catch (error) {
    heroStatusText.textContent = "Server is offline or unreachable right now.";
    heroDeviceText.textContent = "Live device state is unavailable.";
    heroStatusDot.classList.remove("online");
  }
}

async function toggleLight() {
  if (!heroToggleButton) {
    return;
  }

  heroToggleButton.disabled = true;
  heroToggleButton.textContent = "Updating...";

  try {
    const response = await fetch("/toggle", { method: "POST" });
    const data = await response.json();
    heroDeviceText.textContent = data.light ? "Demo light is currently ON." : "Demo light is currently OFF.";
    heroStatusText.textContent = "Server received the command and updated the appliance state.";
    heroStatusDot.classList.add("online");
  } catch (error) {
    heroStatusText.textContent = "Command failed because the server is unavailable.";
    heroStatusDot.classList.remove("online");
  } finally {
    heroToggleButton.disabled = false;
    heroToggleButton.textContent = "Toggle Demo Light";
  }
}
