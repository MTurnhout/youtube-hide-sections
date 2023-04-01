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
    console.log("YHS - Starting");
    await this.restoreOptions();

    this.waitForElementById("contents").then((contentElement) => {
      this.observerHtmlStyle.observe(contentElement, {
        childList: true,
      });

      this.hideSections();
    });
    console.log("YHS - Started");
  }

  /**
   * Hide sections.
   */
  private hideSections() {
    console.log("YHS - Hiding sections");
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
          console.log(`YHS - Section already hidden: ${sectionTitleText}`);
          continue;
        }

        console.log(`YHS - Hiding section: ${sectionTitleText}`);
        section.style.display = "none";
      }
    }
  }

  /**
   * Wait for an element to be added to the DOM.
   * @param elementId Element id to wait for.
   * @param timeoutInSeconds Timeout in seconds.
   * @returns Promise that resolves when the element is added to the DOM or rejects if the timeout is reached.
   */
  private waitForElementById(
    elementId: string,
    timeoutInSeconds: number = 10
  ): Promise<HTMLElement> {
    return new Promise((resolve, reject) => {
      const element = document.getElementById(elementId);
      if (element) {
        console.log(`YHS - Element already exists: ${elementId}`);
        resolve(element);
        return;
      }

      const observer = new MutationObserver(callback);
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      const timeout = setTimeout(() => {
        console.log(`YHS - Timeout reached: ${elementId}`);
        observer.disconnect();
        reject(`Element not found: ${elementId}`);
      }, timeoutInSeconds * 1000);

      function callback() {
        const element = document.getElementById(elementId);
        if (element) {
          console.log(`YHS - Element found: ${elementId}`);
          clearTimeout(timeout);
          observer.disconnect();
          resolve(element);
        }
      }
    });
  }

  /**
   * Restore options from chrome.storage.
   */
  private async restoreOptions() {
    console.log("YHS - Restoring options");
    const data = await chrome.storage.sync.get({
      options: { sectionNames: null },
    });
    Object.assign(this.options, data.options);
    console.log(`YHS - Options restored: ${JSON.stringify(this.options)}`);

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "sync" && changes.options?.newValue) {
        console.log(`YHS - Options changed: ${JSON.stringify(changes)}`);
        Object.assign(this.options, changes.options.newValue);
        this.hideSections();
      }
    });
  }
}
