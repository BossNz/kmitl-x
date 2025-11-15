import type { TermSelectors } from "../types/term-selectors.types";
import { BaseScraper } from "./baseScraper";

export class TermSelectorsScraper extends BaseScraper {
  public async scrape(document: Document): Promise<TermSelectors> {
    const yearOptions = this.getOptionsById(document, "year");
    const semesterOptions = this.getOptionsById(document, "semester");
    return {
      yearOptions,
      semesterOptions,
    };
  }

  private getOptionsById(document: Document, id: string): string[] {
    const select = document.getElementById(id);
    if (!select) return [];

    const options = Array.from(
      select.querySelectorAll<HTMLOptionElement>("option")
    );
    return options.map((option) => option.value);
  }
}
