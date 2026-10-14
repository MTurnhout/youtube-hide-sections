class YoutubeHideSections {
  static #sectionSelector = "ytd-rich-section-renderer";
  static #sectionTitleSelector = "#title";
  static #hiddenAttribute = "data-yhs-hidden";
  static #optionHiddenSections = "option-hidden-sections";

  static #hiddenSections = [];

  /** @type {MutationObserver} */
  static #mutationObserver;

  /**
   * Load the settings, then start observing the document for sections to hide.
   */
  static init() {
    if (this.#mutationObserver) return;
    this.#mutationObserver = new MutationObserver(
      this.#handleMutations.bind(this)
    );

    this.#restoreSettings().then(() => {
      // Observe text changes too: YouTube fills in or replaces a section's
      // title after the section element is added, and reuses sections.
      this.#mutationObserver.observe(document, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      // Sections rendered before the settings were loaded.
      this.#refreshSections();
    });
  }

  /**
   * Handle mutations to find and process the sections they touch.
   * @param {MutationRecord[]} mutationList
   */
  static #handleMutations(mutationList) {
    const sections = new Set();

    for (const mutation of mutationList) {
      // A change inside a section, such as its title being set or replaced.
      const target =
        mutation.target instanceof Element
          ? mutation.target
          : mutation.target.parentElement;
      const parentSection = target?.closest(this.#sectionSelector);
      if (parentSection) sections.add(parentSection);

      // Sections added as or within the added nodes.
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;

        if (node.matches(this.#sectionSelector)) {
          sections.add(node);
        } else {
          node
            .querySelectorAll(this.#sectionSelector)
            .forEach((section) => sections.add(section));
        }
      }
    }

    sections.forEach((section) => this.#handleSection(section));
  }

  /**
   * Hide or show a section based on its current title, and add a hide button.
   * @param {Element} section
   */
  static #handleSection(section) {
    const sectionTitle = section.querySelector(this.#sectionTitleSelector);
    if (!sectionTitle) return;

    const titleText = this.#getTitleText(sectionTitle);
    if (!titleText) return;

    if (this.#hiddenSections.includes(titleText)) {
      section.setAttribute(this.#hiddenAttribute, "");
    } else {
      section.removeAttribute(this.#hiddenAttribute);
      if (sectionTitle.parentElement.querySelector(".yhs-hide-button")) return;

      const hideElement = document.createElement("span");
      hideElement.textContent = "(Hide)";
      hideElement.className = "yhs-hide-button";
      hideElement.title = "Hide this section";
      hideElement.addEventListener("click", () => {
        // Read the title on click: YouTube may have reused this section since.
        const currentTitleText = this.#getTitleText(sectionTitle);
        if (
          !currentTitleText ||
          this.#hiddenSections.includes(currentTitleText)
        ) {
          return;
        }
        this.#hiddenSections.push(currentTitleText);
        this.#saveSettings();
      });
      sectionTitle.parentElement.appendChild(hideElement);
    }
  }

  /**
   * Get the trimmed text of a section title.
   * @param {Element} sectionTitle
   * @returns {string | undefined}
   */
  static #getTitleText(sectionTitle) {
    return sectionTitle.textContent?.trim();
  }

  /**
   * Refresh all sections to apply current hidden settings.
   */
  static #refreshSections() {
    document
      .querySelectorAll(this.#sectionSelector)
      .forEach((section) => this.#handleSection(section));
  }

  /**
   * Restore settings from storage and listen for changes.
   * @returns {Promise<void>} Resolves once the settings are loaded.
   */
  static #restoreSettings() {
    browser.storage.onChanged.addListener((changes, area) => {
      if (area === "sync" && changes[this.#optionHiddenSections]) {
        this.#hiddenSections =
          changes[this.#optionHiddenSections].newValue || [];

        this.#refreshSections();
      }
    });

    return browser.storage.sync
      .get(this.#optionHiddenSections)
      .then((result) => {
        this.#hiddenSections = result[this.#optionHiddenSections] || [];
      })
      .catch((error) => {
        console.error("Youtube Hide Sections: failed to load settings", error);
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
