import type { TermSelectors } from "../types/term-selectors.types";
import { BaseScraper } from "./baseScraper";

export class TermSelectorsScraper extends BaseScraper {
  public async scrape(document: Document): Promise<TermSelectors> {
    return {
      yearOptions: this.getOptions(document, "year"),
      semesterOptions: this.getOptions(document, "semester"),
    };
  }

  private getOptions(document: Document, query: string): string[] {
    const select = this.getOptionsById(document, query);
    if (select.length > 0) return select;
    return this.getOptionsByName(document, query);
  }

  private getOptionsById(document: Document, id: string): string[] {
    const select = document.getElementById(id);
    if (!select) return [];

    const options = Array.from(
      select.querySelectorAll<HTMLOptionElement>("option")
    );
    return options.map((option) => option.value);
  }

  private getOptionsByName(document: Document, name: string): string[] {
    const select = document.getElementsByName(name)[0];
    if (!select) return [];

    const options = Array.from(
      select.querySelectorAll<HTMLOptionElement>("option")
    );
    return options.map((option) => option.value);
  }
}
