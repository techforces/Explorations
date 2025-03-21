import * as THREE from "three";

import Stats from "three/addons/libs/stats.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let stats;
let camera, scene, renderer;

let group;

init();

function init() {
  const container = document.createElement("div");
  document.body.appendChild(container);

  // scene

  scene = new THREE.Scene();
  // scene.fog = new THREE.Fog(0xcce0ff, 5, 100);

  // camera

  camera = new THREE.PerspectiveCamera(
    30,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );

  // We use this particular camera position in order to expose a bug that can sometimes happen presumably
  // due to lack of precision when interpolating values over really large triangles.
  // It reproduced on at least NVIDIA GTX 1080 and GTX 1050 Ti GPUs when the ground plane was not
  // subdivided into segments.
  camera.position.x = 7;
  camera.position.y = 13;
  camera.position.z = 7;

  scene.add(camera);

  // lights

  scene.add(new THREE.AmbientLight(0xaaaaaa, 3));

  const light = new THREE.DirectionalLight(0xf0f6ff, 4.5);
  light.position.set(2, 8, 4);

  light.castShadow = true;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  light.shadow.camera.far = 20;

  scene.add(light);

  // scene.add(new DirectionalLightHelper(light));
  scene.add(new THREE.CameraHelper(light.shadow.camera));

  // group

  group = new THREE.Group();
  scene.add(group);

  const material = new THREE.MeshPhongMaterial({
    color: Math.random() * 0xffffff,
  });

  // ground

  const groundMaterial = new THREE.ShadowMaterial({ color: 0x898989 });

  groundMaterial.opacity = 1;

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(20000, 20000, 8, 8),
    groundMaterial
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // column

  const column = new THREE.Mesh(new THREE.BoxGeometry(1, 4, 1), material);
  column.position.set(3, 2, 3);
  column.castShadow = true;
  column.receiveShadow = true;
  scene.add(column);

  // overwrite shadowmap code

  let shader = THREE.ShaderChunk.shadowmap_pars_fragment;

  shader = shader.replace(
    "#ifdef USE_SHADOWMAP",
    "#ifdef USE_SHADOWMAP" + document.getElementById("PCSS").textContent
  );

  shader = shader.replace(
    "#if defined( SHADOWMAP_TYPE_PCF )",
    document.getElementById("PCSSGetShadow").textContent +
      "#if defined( SHADOWMAP_TYPE_PCF )"
  );

  THREE.ShaderChunk.shadowmap_pars_fragment = shader;

  // renderer
  const canvas = document.getElementById("scene");
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  // renderer.setClearColor(scene.fog.color);

  renderer.shadowMap.enabled = true;

  // controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.5;
  controls.minDistance = 10;
  controls.maxDistance = 75;
  controls.target.set(0, 2.5, 0);
  controls.update();

  // performance monitor

  stats = new Stats();
  container.appendChild(stats.dom);

  //

  window.addEventListener("resize", onWindowResize);
}

// Instantiate a GLTFLoader
const loader = new GLTFLoader();

// Load a GLTF or GLB file
loader.load(
  // path to your model file
  "./key.gltf",
  // called when resource is loaded
  function (gltf) {
    // The glTF file typically contains a scene (gltf.scene)
    const model = gltf.scene;

    // Scale the model down (e.g., to 10% size)
    model.scale.set(1, 1, 1);
    model.position.set(1, 2, 1);
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        // If you also want the model to self-shadow, do:
        // child.receiveShadow = true;
      }
    });

    // Add the loaded model to your scene
    scene.add(model);
  },
  // called while loading is progressing
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  // called if an error occurs
  function (error) {
    console.error("An error happened while loading the glTF model:", error);
  }
);

//

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

//

function animate() {
  const time = performance.now() / 1000;

  renderer.render(scene, camera);

  stats.update();
}
