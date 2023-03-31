/**
 * Youtube hide sections add-on functionality.
 */
class YoutubeHideSectionsAddon {
  private readonly observerHtmlStyle: MutationObserver = new MutationObserver(
    this.hideSections
  );

  private options: { sectionNames?: string } = {};

  /**
   * Start hiding sections.
   */
  public async start(): Promise<void> {
    console.log("Addon started.");
    await this.restoreOptions();

    const contentElement = document.getElementById("contents");
    if (!contentElement) {
      console.log("Content element not found.");
      throw new Error("Content element not found.");
    }

    // Observe new sections being added to the page.
    this.observerHtmlStyle.observe(contentElement, {
      childList: true,
    });

    this.hideSections();
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

  /**
   * Restore options from chrome.storage.
   */
  private async restoreOptions() {
    const options = await chrome.storage.sync.get({
      options: { sectionNames: null },
    });
    Object.assign(this.options, options);
    this.hideSections();

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "sync" && changes.options?.newValue) {
        Object.assign(this.options, changes.options.newValue);
        this.hideSections();
      }
    });
  }
}
