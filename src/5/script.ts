import * as THREE from "three";

import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import gsap from "gsap";
import { CustomEase, ScrollTrigger } from "gsap/all";

import { InitGrid } from "./grid";

gsap.registerPlugin(CustomEase);
gsap.registerPlugin(ScrollTrigger);

let camera, scene, renderer;

let group;

init();
InitGrid();

let contentContainer = document.querySelector(".content");
let maxOffset: any = contentContainer?.getBoundingClientRect().height + 750;

ScrollTrigger.defaults({ scroller: ".content" });

const mainContainer = document.querySelector(".main");
const canvasContainer = document.querySelector(".canvas-container");

let pageOffset = 0;
const toY = gsap.quickTo(".content", "y", {
  duration: 1,
  overwrite: true,
  force3D: true,
  ease: "power2.out",
  onUpdate: () => {
    ScrollTrigger.update();
    canvasContainer.style.height = `min(calc(100% + ${
      mainContainer?.getBoundingClientRect().bottom - window.innerHeight
    }px), 100%)`;
  },
});

window.addEventListener("load", () => {
  const containers = document.querySelectorAll(".img-container");
  containers.forEach((container) => {
    const o = {
      val: 1,
    };

    const cover = container.querySelector(".img-cover");
    const img = container.querySelector("img");

    gsap.to(o, {
      val: 0,
      scrollTrigger: container,
      delay: 0.25,
      duration: 0.5,
      onUpdate: () => {
        cover.style.opacity = o.val;
        img.style.transform = `scale(${1 + 0.25 * o.val})`;
      },
    });
  });

  const textTuples = document.querySelectorAll(".text-tuple");
  textTuples.forEach((textTuple) => {
    const o = {
      val: 0.35,
    };

    gsap.to(o, {
      val: 1,
      scrollTrigger: textTuple,
      delay: 0.25,
      duration: 0.5,
      onUpdate: () => {
        textTuple.style.opacity = o.val;
      },
    });
  });
});

window.addEventListener("wheel", (e) => {
  pageOffset = Math.min(
    Math.max(0, pageOffset + e.deltaY),
    maxOffset - window.innerHeight
  );
  toY(-pageOffset);
});

ScrollTrigger.scrollerProxy(".content", {
  scrollTop(value) {
    if (arguments.length) {
      toY(-value); // the same quickTo you already have
    }
    return -gsap.getProperty(".content", "y"); // ← current scroll
  },
  getBoundingClientRect() {
    return {
      top: 0,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  },
});

let needsRender = true;

function init() {
  // scene

  scene = new THREE.Scene();

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
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 10;

  scene.add(camera);

  // lights
  const pointLightColor = 0xffea97;

  scene.add(new THREE.AmbientLight(0xaaaaaa, 1));
  const light = new THREE.DirectionalLight(pointLightColor, 1);
  light.position.set(0, 1, 4);
  light.castShadow = true;
  // light.shadow.mapSize.width = 1024;
  // light.shadow.mapSize.height = 1024;
  light.shadow.camera.far = 20;
  scene.add(light);

  //Front
  const pointLight = new THREE.PointLight(pointLightColor, 15, 100);
  pointLight.position.set(0, 1, 4);
  pointLight.lookAt(0, 0, 0);
  scene.add(pointLight);

  // Top Left
  const pointLight2 = new THREE.PointLight(pointLightColor, 20, 10);
  pointLight2.position.set(-2, 4, 0);
  pointLight2.lookAt(0, 0, 0);
  scene.add(pointLight2);

  // Top right
  const pointLight3 = new THREE.PointLight(pointLightColor, 50, 10);
  pointLight3.position.set(2, 4, -2);
  scene.add(pointLight3);

  // Top
  const pointLight4 = new THREE.PointLight(pointLightColor, 15, 100);
  pointLight4.position.set(0, 4, 0);
  scene.add(pointLight4);

  // Bottom
  const pointLight5 = new THREE.PointLight(pointLightColor, 15, 200);
  pointLight5.position.set(0, -4, 0);
  scene.add(pointLight5);

  // Bottom Right
  const pointLight6 = new THREE.PointLight(pointLightColor, 50, 10);
  pointLight6.position.set(3, -4, 2);
  scene.add(pointLight6);

  // Bottom Left
  const pointLight7 = new THREE.PointLight(pointLightColor, 10, 10);
  pointLight7.position.set(-2, -4, 1);
  scene.add(pointLight7);

  // Left
  const pointLight8 = new THREE.PointLight(pointLightColor, 35, 10);
  pointLight8.position.set(-4, 0, 0);
  scene.add(pointLight8);

  const pointLight9 = new THREE.PointLight(pointLightColor, 2, 10);
  pointLight9.position.set(-0.5, 0, 1);
  scene.add(pointLight9);

  // scene.add(new DirectionalLightHelper(light));
  // scene.add(new THREE.CameraHelper(light.shadow.camera));

  // group

  group = new THREE.Group();
  scene.add(group);

  const material = new THREE.MeshPhongMaterial({
    color: Math.random() * 0xffffff,
  });

  // ground

  const groundMaterial = new THREE.ShadowMaterial({ color: 0x000000 });

  groundMaterial.opacity = 0.25;

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(20000, 20000, 8, 8),
    groundMaterial
  );
  ground.position.z = -1;
  ground.rotation.z = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

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

  const DPR_LIMIT = 2;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, DPR_LIMIT));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);

  renderer.shadowMap.enabled = true;
  renderer.toneMapping = THREE.ReinhardToneMapping;

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
    model.position.set(0, -5, 0);
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        // If you also want the model to self-shadow, do:
        // child.receiveShadow = true;
      }
    });

    const zAxis = new THREE.Vector3(0, 0, 1);
    model.rotateOnWorldAxis(zAxis, -0.5);
    window.addEventListener(
      "wheel",
      (e) => {
        gsap.to(model.rotation, {
          x: model.rotation.x + e.deltaY / 100,
          duration: 1,
          overwrite: true,
          onUpdate: () => {
            needsRender = true;
          },
          onComplete: () => {
            needsRender = true;
          },
        });
      },
      { passive: true }
    );

    let val = {
      y: -5,
      deg: -1,
      prevDeg: -0.5,
    };
    gsap.to(val, 4, {
      y: 0,
      deg: 0,
      delay: 5.5,
      ease: CustomEase.create(
        "custom",
        "M0,0 C0.28,0.064 0.187,0.673 0.3,0.9 0.354,1.01 0.72,1 1,1"
      ),
      onUpdate: () => {
        model.position.y = val.y;
        model.rotateOnWorldAxis(zAxis, val.deg - val.prevDeg);
        val.prevDeg = val.deg;
        needsRender = true;
      },
      onComplete: () => {
        needsRender = true;
      },
    });

    startAnimations();

    // Add the loaded model to your scene
    scene.add(model);
  },
  // called while loading is progressing
  function (xhr) {
    // console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  // called if an error occurs
  function (error) {
    console.error("An error happened while loading the glTF model:", error);
  }
);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

//

function animate() {
  if (!needsRender) return;
  needsRender = false;
  renderer.render(scene, camera);
}

function startAnimations() {
  // ANIMATIONS
  const imgContainer: any = document.querySelector(
    ".intro-img-container-inner"
  );
  const imgContainerProps = {
    bottom: 25,
    height: 0,
    width: 50,
    scale: 1.5,
  };
  const img: any = document.querySelector(".intro-img-container-inner img");

  gsap.to(imgContainerProps, 2, {
    height: 50,

    ease: "power3.inOut",
    onUpdate: () => {
      imgContainer.style.height = `${imgContainerProps.height}%`;
      needsRender = true;
    },
    onComplete: () => {
      imgContainer.style.bottom = `50%`;
      imgContainer.style.transform = `translate(-50%, 50%)`;
      needsRender = true;
    },
  });

  gsap.to(imgContainerProps, 2, {
    height: 100,
    width: 100,
    scale: 1,
    delay: 2,
    ease: "power3.inOut",
    onUpdate: () => {
      imgContainer.style.height = `${imgContainerProps.height}vh`;
      imgContainer.style.width = `${imgContainerProps.width}%`;
      img.style.transform = `scale(${imgContainerProps.scale})`;
      needsRender = true;
    },
    onComplete: () => {
      needsRender = true;
    },
  });

  slideUp(".name > span", 0.5, 4, 0.2);
  slideUp("nav > div > a > span", 0.5, 4.2, 0.2);
  slideUp(".location > div > span", 0.5, 4.6, 0.2);
  slideUp(".occupation > div > span", 0.5, 5, 0.2);
}

function slideUp(query = "", duration = 1, startDelay = 1, delayGap = 0.1) {
  const elementArr: any = document.querySelectorAll(query);

  const elementArrPositions: any = [];
  for (var i = 0; i < elementArr.length; i++) {
    elementArrPositions.push({ y: 110 });
  }
  for (var i = 0; i < elementArr.length; i++) {
    const j = i;
    gsap.to(elementArrPositions[j], duration, {
      y: 0,
      delay: startDelay + delayGap * j,
      onUpdate: () => {
        elementArr[
          j
        ].style.transform = `translateY(${elementArrPositions[j].y}%)`;
      },
    });
  }
}
