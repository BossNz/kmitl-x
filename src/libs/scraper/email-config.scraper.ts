import type {
  EmailConfigData,
  EmailConfigOption,
} from "../types/email-config.types";
import { BaseScraper } from "./baseScraper";

export class EmailConfigScraper extends BaseScraper {
  public async scrape(document: Document): Promise<EmailConfigData> {
    const radios = Array.from(
      document.querySelectorAll<HTMLInputElement>('input[name="group0"]')
    );

    const options: EmailConfigOption[] = radios.map((radio) => {
      const label = (
        radio.closest("label")?.textContent ||
        radio.parentElement?.textContent ||
        ""
      )
        .replace(/\s+/g, " ")
        .trim();
      return { value: radio.value, label };
    });

    const selected =
      radios.find((r) => r.checked)?.value || options[0]?.value || "";

    const ssid =
      document.querySelector<HTMLInputElement>('#ssid, input[name="ssid"]')
        ?.value || "";

    const question = (
      radios[0]?.closest("tr")?.querySelector("td")?.textContent || ""
    )
      .replace(/\s+/g, " ")
      .trim();

    return { question, options, selected, ssid };
  }
}
