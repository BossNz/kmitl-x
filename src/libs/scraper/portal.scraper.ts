import { registry } from "../registry/scraperRegistry";
import type { PortalScraperResult } from "../types/portal.types";
import { parseHTML } from "../utils/fetcher";
import { BaseScraper } from "./baseScraper";
export class PortalScraper extends BaseScraper {
  public async scrape(document: Document): Promise<PortalScraperResult> {
    return { 
      meta: this.extractMeta(document),
      sections: this.extractSections(document),
    };
  }

  private extractMeta(document: Document): PortalScraperResult["meta"] {
    return{
      title: "this is a placeholder of title",
      initialServerTime: new Date().toISOString(),
      homeUrl: document.location.origin,
    } as PortalScraperResult["meta"];
  }

  private extractSections(document: Document): PortalScraperResult["sections"] {
    return [{id: "section1", title: "Section 1", description: "This is section 1", icon: "icon1", items: []}];
  }
}
