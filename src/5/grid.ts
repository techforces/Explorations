import { data } from "./data";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

export function InitGrid() {
  let imageContainers: any;
  let imageFlags: number[];
  let visibleImagesCount = 0;

  window.addEventListener("load", () => {
    // Position containers and images
    const container = document.querySelector(".main");

    let sum = 0;
    for (var i = 0; i < data.length; i++) {
      if (data[i].type === "img") {
        const div = document.createElement("div");
        div.classList.add("img-container");
        div.style.width = `${data[i].w}px`;
        div.style.height = `${data[i].h}px`;

        div.style.left = `${data[i].x}px`;
        sum += data[i].gapY;
        div.style.top = `${sum}px`;

        const img = document.createElement("img");
        img.src = data[i].src;

        const cover = document.createElement("div");
        cover.classList.add("img-cover");

        // gsap.to(cover, {
        //   scrollTrigger: { trigger: cover, start: "top top" }, // start animation when ".box" enters the viewport
        //   duration: 2,
        //   opacity: 0,
        // });

        div.appendChild(img);
        div.appendChild(cover);

        container?.appendChild(div);
      } else if (data[i].type === "text") {
        const div = document.createElement("div");
        div.classList.add("text-tuple");
        const span = document.createElement("span");
        span.innerHTML = data[i].num;
        const h1 = document.createElement("h1");
        h1.innerHTML = data[i].headline;
        const p = document.createElement("p");
        p.innerHTML = data[i].description;

        div.appendChild(span);
        div.appendChild(h1);
        div.appendChild(p);

        div.style.position = "absolute";
        sum += data[i].gapY;
        div.style.top = `${sum}px`;

        container?.appendChild(div);
      }
    }

    imageContainers = document.querySelectorAll(".img-container");
    imageFlags = Array(imageContainers.length).fill(1);
  });

  // window.addEventListener("wheel", (e) => {
  //   if (visibleImagesCount < imageContainers.length) {
  //     for (let i = 0; i < imageContainers.length; i++) {
  //       const formula =
  //         imageContainers[i].getBoundingClientRect().y -
  //         e.deltaY -
  //         window.innerHeight;

  //       if (imageFlags[i] == 1 && formula < 0) {
  //         imageFlags[i] = 0;
  //         visibleImagesCount++;
  //         const cover = imageContainers[i].querySelector(".img-cover");
  //         const opacity = {
  //           val: 1,
  //         };
  //         gsap.to(opacity, {
  //           val: 0,
  //           duration: 0.6,
  //           delay: 0.6,
  //           overwrite: true,
  //           onUpdate: () => {
  //             cover.style.opacity = opacity.val;
  //           },
  //         });
  //       }
  //     }
  //   }

  //   console.log("now", imageContainers[0].getBoundingClientRect().y);
  //   console.log(
  //     "projection",
  //     imageContainers[0].getBoundingClientRect().y - e.deltaY
  //   );

  //   console.log("-----");
  // });
}
