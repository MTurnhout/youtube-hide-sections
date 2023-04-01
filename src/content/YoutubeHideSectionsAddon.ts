/**
 * Youtube hide sections add-on functionality.
 */
class YoutubeHideSectionsAddon {
  private readonly observerHtmlStyle: MutationObserver = new MutationObserver(
    this.hideSections.bind(this)
  );

  private options: { sectionNames?: string } = {};

  /**
   * Start hiding sections.
   */
  public async start(): Promise<void> {
    await this.restoreOptions();

    this.waitForElementById("contents").then((contentElement) => {
      this.observerHtmlStyle.observe(contentElement, {
        childList: true,
      });

      this.hideSections();
    });
  }

  /**
   * Hide sections.
   */
  private hideSections() {
    const sectionNames = this.options.sectionNames
      ?.split(";")
      .map((name) => name.trim().toLowerCase());
    if (!sectionNames) {
      return;
    }

    for (const sectionTitle of document.querySelectorAll<HTMLElement>(
      "ytd-rich-section-renderer #title"
    )) {
      const sectionTitleText = sectionTitle.innerText.trim().toLowerCase();
      if (sectionNames.includes(sectionTitleText)) {
        const section = sectionTitle.closest<HTMLElement>(
          "ytd-rich-section-renderer"
        );
        if (!section) {
          throw new Error(`Section not found: ${sectionTitleText}`);
        }

        if (section.style.display === "none") {
          continue;
        }

        section.style.display = "none";
      }
    }
  }

  /**
   * Wait for an element to be added to the DOM.
   * @param elementId Element id to wait for.
   * @returns Promise that resolves when the element is found.
   */
  private waitForElementById(elementId: string): Promise<HTMLElement> {
    return new Promise((resolve) => {
      const element = document.getElementById(elementId);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.getElementById(elementId);
        if (element) {
          resolve(element);
          return;
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }

  /**
   * Restore options from chrome.storage.
   */
  private async restoreOptions() {
    const data = await chrome.storage.sync.get({
      options: { sectionNames: null },
    });
    Object.assign(this.options, data.options);
    this.hideSections();

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "sync" && changes.options?.newValue) {
        Object.assign(this.options, changes.options.newValue);
        this.hideSections();
      }
    });
  }
}
