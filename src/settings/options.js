const optionHiddenSectionsName = "option-hidden-sections";

const hiddenSectionsContainer = document.getElementById("hidden-sections-list");
const newSectionInput = document.getElementById("new-section-input");
const addSectionButton = document.getElementById("add-section-button");

const getHiddenSections = () => {
  return browser.storage.sync.get(optionHiddenSectionsName).then((result) => {
    return result[optionHiddenSectionsName] || [];
  });
};

const storeHiddenSections = (sections) => {
  return browser.storage.sync.set({
    [optionHiddenSectionsName]: sections,
  });
};

const addSection = (section) => {
  return getHiddenSections().then((hiddenSections) => {
    if (!hiddenSections.includes(section)) {
      hiddenSections.push(section);
      return storeHiddenSections(hiddenSections);
    }
  });
};

const removeSection = (section) => {
  return getHiddenSections().then((hiddenSections) => {
    const index = hiddenSections.indexOf(section);
    if (index !== -1) {
      hiddenSections.splice(index, 1);
      return storeHiddenSections(hiddenSections);
    }
  });
};

const renderHiddenSectionsList = () => {
  getHiddenSections().then((hiddenSections) => {
    hiddenSectionsContainer.innerHTML = "";

    if (hiddenSections.length === 0) {
      const noSectionsElement = document.createElement("span");
      noSectionsElement.textContent = "- None -";
      hiddenSectionsContainer.appendChild(noSectionsElement);
    } else {
      hiddenSections.forEach((section) => {
        const sectionElement = document.createElement("li");

        const sectionNameElement = document.createElement("span");
        sectionNameElement.textContent = section;

        const sectionRemoveElement = document.createElement("span");
        sectionRemoveElement.className = "remove-section";
        sectionRemoveElement.textContent = "(Remove)";
        sectionRemoveElement.title = "Remove this section from hidden list";
        sectionRemoveElement.addEventListener("click", () => {
          removeSection(section);
        });

        sectionElement.appendChild(sectionNameElement);
        sectionElement.appendChild(sectionRemoveElement);
        hiddenSectionsContainer.appendChild(sectionElement);
      });
    }
  });
};

document.addEventListener("DOMContentLoaded", () => {
  renderHiddenSectionsList();
});

browser.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes[optionHiddenSectionsName]) {
    renderHiddenSectionsList();
  }
});

addSectionButton.addEventListener("click", () => {
  const newSection = newSectionInput.value.trim();
  if (newSection) {
    addSection(newSection).then(() => {
      newSectionInput.value = "";
    });
  }
});
