import gsap from "gsap";
import CustomEase from "gsap/CustomEase";

let btn = document.querySelector("button");
let main = document.querySelector("#content") as HTMLDivElement;
let content = document.getElementById("temporary");

if (btn) {
  btn.addEventListener("click", () => {
    loadPageOne();
  });
}

function loadPageOne() {
  var xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var responseHTML = this.responseText;
      var parser = new DOMParser();
      var doc = parser.parseFromString(responseHTML, "text/html");
      var mainContent = doc.querySelector("main")?.innerHTML;

      if (content) {
        content.innerHTML = mainContent as string;
      }

      transitionPage();
    }
  };

  xhttp.open("GET", "./one.html", true);
  xhttp.send();
}

function transitionPage() {
  var val = {
    mainX: 0,
    contentX: 0,
  };

  gsap.to(val, 3, {
    mainX: -100,
    contentX: -100,
    ease: CustomEase.create(
      "custom",
      "M0,0 C0.28,0.064 0.187,0.673 0.3,0.9 0.354,1.01 0.72,1 1,1"
    ),
    onUpdate: () => {
      if (main && content) {
        main.style.transform = `translateX(${val.mainX}%)`;
        content.style.transform = `translateX(${val.contentX}%)`;
      }
    },
  });
}
