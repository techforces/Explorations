import { data } from "./data";

const container = document.querySelector(".main");

let sum = 0;
for (var i = 0; i < data.length; i++) {
  if (data[i].type === "img") {
    const img = document.createElement("img");
    img.style.position = "absolute";
    img.style.width = `${data[i].w}px`;
    img.style.height = `${data[i].h}px`;

    img.style.left = `${data[i].x}px`;
    sum += data[i].gapY;
    img.style.top = `${sum}px`;

    img.src = data[i].src;

    container?.appendChild(img);
  } else if (data[i].type === "text") {
    const div = document.createElement("div");
    div.classList.add("text-tuple");
    const h1 = document.createElement("h1");
    h1.innerHTML = data[i].headline;
    const p = document.createElement("p");
    p.innerHTML = data[i].description;
    div.appendChild(h1);
    div.appendChild(p);

    div.style.position = "absolute";
    sum += data[i].gapY;
    div.style.top = `${sum}px`;

    container?.appendChild(div);
  }
}
