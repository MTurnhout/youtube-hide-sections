/**
 * Youtube hide sections add-on options.
 */
export class YoutubeHideSectionsAddonOptions {
  /**
   * Restore options from chrome.storage.
   */
  public async restoreOptions() {
    const sectionNamesInputElement = document.getElementById(
      "sectionNamesInput"
    ) as HTMLInputElement;
    if (!sectionNamesInputElement) {
      throw new Error("Section names input element not found.");
    }

    const data = await chrome.storage.sync.get({
      options: { sectionNames: null },
    });

    sectionNamesInputElement.value = data.options.sectionNames;
  }

  /**
   * Saves options to chrome.storage.
   */
  async saveOptions() {
    const sectionNamesInputElement = document.getElementById(
      "sectionNamesInput"
    ) as HTMLInputElement;
    if (!sectionNamesInputElement) {
      throw new Error("Section names input element not found.");
    }

    const sectionNames = sectionNamesInputElement.value?.trim();
    if (!sectionNames) {
      const validationMessage = chrome.i18n.getMessage(
        "options_validation_input_mandatory"
      );
      this.showValidation(validationMessage);
      return;
    }

    await chrome.storage.sync.set({
      options: { sectionNames },
    });
    const saveMessage = chrome.i18n.getMessage("options_save_success");
    this.showValidation(saveMessage, true);
  }

  /**
   * Set localized content in options page.
   */
  public setLocalizedText() {
    document.title = chrome.i18n.getMessage("options_page_title");
    this.setLocalizedElementText("pageHeader", "options_page_header");
    this.setLocalizedElementText(
      "sectionNamesLabel",
      "options_page_input_section_names_label"
    );
    this.setLocalizedElementText(
      "sectionNamesInfo",
      "options_page_input_section_names_info"
    );
    this.setLocalizedElementText("saveButton", "options_page_save_button_text");
  }

  /**
   * Set localized content in element.
   */
  private setLocalizedElementText(elementId: string, messageName: string) {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element not found: ${elementId}`);
    }

    element.textContent = chrome.i18n.getMessage(messageName);
  }

  /**
   * Shows validation message.
   */
  private showValidation(text: string, isValid = false) {
    const status = document.getElementById("status");
    if (!status) {
      throw new Error("Status element not found.");
    }

    status.className = isValid ? "valid-feedback" : "invalid-feedback";
    status.textContent = text;

    setTimeout(function () {
      status.textContent = "";
    }, 750);
  }
}
