let description = document.querySelector(".description");
let descriptionText = document.querySelector(".description-text");
let descriptionButton = document.querySelector(".description-button");

descriptionButton.addEventListener("click", () => {
  if (description.classList.contains("visible")) {
    description.classList.remove("visible");
  } else {
    description.classList.add("visible");
  }
});
