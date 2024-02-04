import * as THREE from "three";
import gsap from "gsap";

import data from "./data.js";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";

import { CustomEase } from "gsap/all";

/* Set up */
const perspective = 800;
const canvas = document.getElementById("stage");
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true,
});

/* Misc */
let cover = document.getElementsByClassName("cover")[0];
let body = document.getElementsByTagName("body")[0];
gsap.registerPlugin(CustomEase);

/* Dimensions */
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

/* Camera */
const fov =
  (180 * (2 * Math.atan(window.innerHeight / 2 / perspective))) / Math.PI;
const camera = new THREE.PerspectiveCamera(
  fov,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.set(0, 0, perspective);

/* States */
let clickable = false;

/* Raycaster */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2(999, 999);

/* Variables */
let planes = [[], [], []];
let arr_planes: any[] = [];
let textures: any[] = [];
let materials = [[], [], []];

const planeGeometry = new THREE.PlaneGeometry(150, 200, 100, 100);
const width = 150;
const height = 200;
const widthMax = window.innerWidth * 0.322;
const heightMax = window.innerHeight * 0.86;
const gap = window.innerWidth / 100;
const gapY = 60;
const marginX = (window.innerWidth - (10 * width + 9 * gap)) / 2;
const marginY = (window.innerHeight - (3 * height + 2 * gapY)) / 2;

const manager = new THREE.LoadingManager();
const loader = new THREE.TextureLoader(manager);
manager.onStart = function () {};
manager.onError = function () {};
manager.onProgress = function () {};
manager.onLoad = function () {
  setTimeout(createPlanes, 100);
};

let imgIndex = 0;
function loadImage(i) {
  if (i < data.length) {
    loader.load(
      data[i].src,
      (el: any) => {
        textures.push(el);
        imgIndex++;
        loadImage(imgIndex);
      },
      undefined,
      function () {
        loadImage(imgIndex);
      }
    );
  }
}
loadImage(imgIndex);
loader.load();

function createPlanes() {
  for (let i = 0; i < data.length; i++) {
    const imageRatio = textures[i].image.width / textures[i].image.height;
    const planeRatio = width / height;
    const planeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        resolution: { value: new THREE.Vector2(1000, 500) },
        time: { value: performance.now() },
        mu: { value: [] },
        arr_length: { value: 0 },
        u_image: { type: "t", value: textures[i] },
        imageRatio: { value: imageRatio },
        planeRatio: { value: planeRatio },
        u_x: { value: 0 },
        u_y: { value: 0 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      defines: {
        PR: window.devicePixelRatio.toFixed(1),
      },
    });

    const row = data[i].row - 1;
    const pos = data[i].pos - 1;
    materials[row].push(planeMaterial);

    const plane = new THREE.Mesh(
      planeGeometry,
      materials[row][materials[row].length - 1]
    );
    planes[row].push(plane);
    arr_planes.push(plane);
    const lastElem = planes[row].length - 1;
    scene.add(planes[row][planes[row].length - 1]);

    // Update userData
    planes[row][lastElem].userData.row = row;
    console.log(row);
    planes[row][lastElem].userData.pos = pos;
    planes[row][lastElem].userData.idx = planes[row].length - 1;

    // Set positions
    // planes[row][lastElem].position.x += marginX + pos * (width + gap) + 75;
    // planes[row][lastElem].position.y -=
    //   marginY + row * (height + gapY) + height / 2;

    planes[row][lastElem].position.x = window.innerWidth / 2 + i * 10;
    planes[row][lastElem].position.y = -window.innerHeight / 2;
  }

  setup();
}

function transitionPlanes() {
  for (let i = 0; i < planes.length; i++) {
    for (let j = 0; j < planes[i].length; j++) {
      planes[i][j].position.x =
        marginX + planes[i][j].userData.pos * (width + gap) + width / 2;
      const from =
        marginY +
        planes[i][j].userData.row * (height + gapY) +
        height / 2 +
        1000 +
        planes[i][j].userData.pos * 200 +
        planes[i][j].userData.row * 200;
      const to =
        marginY + planes[i][j].userData.row * (height + gapY) + height / 2;

      let val = {
        y: from,
      };
      gsap.to(val, 2, {
        y: to,
        ease: CustomEase.create(
          "custom",
          "M0,0 C0.28,0.064 0.187,0.673 0.3,0.9 0.354,1.01 0.72,1 1,1"
        ),
        onUpdate: () => {
          planes[i][j].position.y = -val.y;
        },
        onComplete: () => {
          clickable = true;
        },
      });
    }
  }
}

let arr = [];
function restart(row, idx) {
  let val = {
    mu: -1000,
    i: arr.length,
    m: arr.length + 1,
  };
  gsap.to(val, 4.35, {
    mu: 8000,
    ease: "power1.inOut",
    onStart: () => {
      arr.push(val.mu);
    },
    onUpdate: () => {
      if (val.m < arr.length) {
        val.m = arr.length;
      } else if (val.m != arr.length) {
        val.m = arr.length;
        val.i--;
      }

      arr[val.i] = val.mu;
      materials[row][idx].uniforms.mu.value = arr;
      materials[row][idx].uniforms.arr_length.value = arr.length;
      materials[row][idx].uniforms.time.value = -performance.now() * 0.5;
    },
    onComplete: () => {
      arr.shift();
      materials[row][idx].uniforms.mu.value = arr;
      materials[row][idx].uniforms.arr_length.value = arr.length;
    },
  });
}

document.addEventListener("click", () => {
  const intersects = updateRaycaster();
  if (intersects.length > 0 && clickable) {
    const row = intersects[0].object.userData.row;
    const idx = intersects[0].object.userData.idx;

    console.log(row, idx);

    let val = {
      w: width,
      h: height,
      x: planes[row][idx].position.x,
      y: planes[row][idx].position.y,
    };

    restart(row, idx);
    clickable = false;
    gsap.to(val, 5, {
      // delay: 1,
      w: widthMax,
      h: heightMax,
      x: marginX + widthMax / 2,
      y: -window.innerHeight / 2,
      ease: CustomEase.create(
        "custom",
        "M0,0 C0.28,0.064 0.187,0.673 0.3,0.9 0.354,1.01 0.72,1 1,1"
      ),
      // onStart: () => {
      // },
      onUpdate: () => {
        planes[row][idx].geometry.dispose();
        planes[row][idx].geometry = new THREE.PlaneGeometry(
          val.w,
          val.h,
          100,
          100
        );
        planes[row][idx].position.set(val.x, val.y);

        // materials[row][idx].uniforms.u_x.value = val.x;
        // materials[row][idx].uniforms.u_y.value = val.y;
      },
    });

    for (let i = 0; i < planes.length; i++) {
      for (let j = 0; j < planes[i].length; j++) {
        if (i != row || j != idx) {
          let v = {
            h: height,
            y: planes[i][j].position.y,
          };

          gsap.to(v, 0.5, {
            delay: i * 0.2 + j * 0.1,
            h: 0.01,
            y: planes[i][j].position.y + height / 2,
            ease: "power1.inOut",
            onUpdate: () => {
              planes[i][j].geometry.dispose();
              planes[i][j].geometry = new THREE.PlaneGeometry(width, v.h, 1, 1);
              planes[i][j].position.y = v.y;

              materials[i][j].uniforms.planeRatio.value = width / v.h;
            },
          });
        }
      }
    }
  }

  // planes[intersects[0].object.userData.row][intersects[0].object.userData.pos];
});

document.addEventListener("mousemove", () => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // updateRaycaster();
});

function updateRaycaster() {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(arr_planes);

  if (intersects.length > 0 && clickable) {
    body.style.cursor = "pointer";
    // console.log(intersects[0].object.userData);
  } else {
    body.style.cursor = "default";
  }

  return intersects;
}

camera.position.x += window.innerWidth / 2;
camera.position.y -= window.innerHeight / 2;

/* Rendering */
function setup() {
  renderer.render(scene, camera);
  setTimeout(() => requestAnimationFrame(transition), 100);
}

function transition() {
  transitionPlanes();
  renderer.render(scene, camera);
  requestAnimationFrame(update);
}

function update() {
  cover.style.display = "none";

  updateRaycaster();

  renderer.render(scene, camera);
  // updateRaycaster();
  requestAnimationFrame(update);
}
