class YoutubeHideSections {
  static #sectionSelector = "ytd-rich-section-renderer";
  static #sectionTitleSelector = this.#sectionSelector + " #title";
  static #optionHiddenSections = "option-hidden-sections";

  static #hiddenSections = [];

  /** @type {MutationObserver} */
  static #mutationObserver;

  /**
   * Start observing the document body for sections to hide.
   */
  static init() {
    if (this.#mutationObserver) return;
    this.#mutationObserver = new MutationObserver(
      this.#handleMutations.bind(this)
    );

    this.#restoreSettings();

    this.#mutationObserver.observe(document, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Handle mutations to find and process the sections.
   * @param {MutationRecord[]} mutationsList
   */
  static #handleMutations(mutationList) {
    for (const mutation of mutationList) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;

        if (node.matches(this.#sectionTitleSelector)) {
          this.#handleSection(node);
        } else {
          const sectionTitle = node.querySelector(this.#sectionTitleSelector);
          if (sectionTitle) {
            this.#handleSection(sectionTitle);
          }
        }
      }
    }
  }

  /**
   * Process a section title to potentially hide its section and add a hide button.
   * @param {HTMLElement} sectionTitle
   */
  static #handleSection(sectionTitle) {
    const section = sectionTitle.closest(this.#sectionSelector);
    if (!section) return;

    const titleText = sectionTitle.textContent?.trim();
    if (!titleText) return;

    if (this.#hiddenSections.includes(titleText)) {
      section.hidden = true;
    } else {
      if (section.hidden) {
        section.hidden = false;
      }
      if (sectionTitle.parentElement.querySelector(".yhs-hide-button")) return;

      const hideElement = document.createElement("span");
      hideElement.textContent = "(Hide)";
      hideElement.className = "yhs-hide-button";
      hideElement.style.cursor = "pointer";
      hideElement.style.lineHeight = "2.8rem";
      hideElement.style.fontSize = "2rem";
      hideElement.style.marginLeft = "8px";
      hideElement.style.color = "darkred";
      hideElement.title = "Hide this section";
      hideElement.addEventListener("click", () => {
        this.#hiddenSections.push(titleText);
        this.#saveSettings();
      });
      sectionTitle.parentElement.appendChild(hideElement);
    }
  }

  /**
   * Refresh all sections to apply current hidden settings.
   */
  static #refreshSections() {
    const sections = document.querySelectorAll(this.#sectionSelector);
    sections.forEach((section) => {
      const title = section.querySelector(this.#sectionTitleSelector);
      if (title) {
        this.#handleSection(title);
      }
    });
  }

  /**
   * Restore settings from storage and listen for changes.
   */
  static #restoreSettings() {
    browser.storage.sync.get(this.#optionHiddenSections).then((result) => {
      this.#hiddenSections = result[this.#optionHiddenSections] || [];
    });

    browser.storage.onChanged.addListener((changes, area) => {
      if (area === "sync" && changes[this.#optionHiddenSections]) {
        this.#hiddenSections = changes[this.#optionHiddenSections].newValue;

        this.#refreshSections();
      }
    });
  }

  /**
   * Save the current hidden sections to storage.
   */
  static #saveSettings() {
    browser.storage.sync.set({
      [this.#optionHiddenSections]: this.#hiddenSections,
    });
  }
}

YoutubeHideSections.init();
