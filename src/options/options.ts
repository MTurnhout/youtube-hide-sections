import { YoutubeHideSectionsAddonOptions } from "./YoutubeHideSectionsAddonOptions.js";

const saveButtonElement = document.getElementById("saveButton");
if (!saveButtonElement) {
  throw new Error("Save button element not found.");
}
const sectionNamesInputElement = document.getElementById("sectionNamesInput");
if (!sectionNamesInputElement) {
  throw new Error("Section names input element not found.");
}

const options = new YoutubeHideSectionsAddonOptions();
await options.restoreOptions();
options.setLocalizedText();

saveButtonElement.addEventListener("click", async () => {
  await options.saveOptions();
});

sectionNamesInputElement.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") {
    await options.saveOptions();
  }
});
