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
    console.log("Addon started.");
    await this.restoreOptions();

    this.waitForElementById("contents").then((contentElement) => {
      // Observe new sections being added to the page.
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
    console.log("Hide sections.");
    const sectionNames = this.options.sectionNames
      ?.split(";")
      .map((name) => name.trim().toLowerCase());
    if (!sectionNames) {
      // No sections to hide.
      console.log("No sections to hide.");
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
          // Section is already hidden.
          console.log(`Section already hidden: ${sectionTitleText}`);
          continue;
        }

        console.log(`Hide section: ${sectionTitleText}`);
        section.style.display = "none";
      }
    }
  }

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
