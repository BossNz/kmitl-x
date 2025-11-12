import type { PortalScript, PortalContent, PortalFetcherOptions } from "../types";

export default class PortalFetcher {
  private readonly cache = new Map<string, Promise<PortalContent>>();
  private readonly executedScripts = new Set<string>();
  private lastRequest = 0;
  private readonly throttleMs: number;

  constructor(options: PortalFetcherOptions = {}) {
    this.throttleMs = options.throttleMs ?? 350;
  }

  public async load(url: string): Promise<PortalContent> {
    const absoluteUrl = this.toAbsolute(url);
    if (!this.cache.has(absoluteUrl)) {
      this.cache.set(absoluteUrl, this.fetchAndTransform(absoluteUrl));
    }
    return this.cache.get(absoluteUrl)!;
  }

  public markScriptExecuted(src: string) {
    this.executedScripts.add(src);
  }

  public hasExecutedScript(src: string): boolean {
    return this.executedScripts.has(src);
  }

  private async fetchAndTransform(url: string): Promise<PortalContent> {
    await this.applyThrottle();

    const response = await fetch(url, {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`ไม่สามารถโหลด ${url} (${response.status})`);
    }

    const buffer = await response.arrayBuffer();
    const preferred = this.extractCharset(response.headers.get("content-type"));
    const { text, encoding } = this.decodeBuffer(buffer, preferred);

    const parser = new DOMParser();
    const parsed = parser.parseFromString(text, "text/html");

    this.normalizeLinks(parsed, url);
    const scripts = this.extractScripts(parsed, url);

    const html = parsed.body?.innerHTML?.trim() ?? text;

    return {
      url,
      html,
      title: parsed.title ?? "",
      scripts,
      document: parsed,
      encoding,
      fetchedAt: Date.now(),
    };
  }

  private async applyThrottle() {
    const now = Date.now();
    const elapsed = now - this.lastRequest;
    if (elapsed < this.throttleMs) {
      await new Promise((resolve) => setTimeout(resolve, this.throttleMs - elapsed));
    }
    this.lastRequest = Date.now();
  }

  private extractCharset(contentType: string | null): string | null {
    if (!contentType) return null;
    const match = contentType.match(/charset=([^;]+)/i);
    return match ? match[1].toLowerCase() : null;
  }

  private decodeBuffer(buffer: ArrayBuffer, preferred: string | null) {
    const candidates = this.buildEncodingChain(preferred);
    for (const encoding of candidates) {
      try {
        const decoder = new TextDecoder(encoding as any, { fatal: false });
        const text = decoder.decode(buffer);
        if (text) {
          return { text, encoding };
        }
      } catch (error) {
        continue;
      }
    }
    const fallbackDecoder = new TextDecoder();
    return { text: fallbackDecoder.decode(buffer), encoding: "utf-8" };
  }

  private buildEncodingChain(preferred: string | null): string[] {
    const unique = new Set<string>();
    const push = (codec: string) => {
      if (!codec) return;
      unique.add(codec.toLowerCase());
    };

    push(preferred || "");
    push("utf-8");
    push("windows-874");
    push("tis-620");
    push("tis620");
    push("iso-8859-11");

    return Array.from(unique.values());
  }

  private normalizeLinks(doc: Document, baseUrl: string) {
    const attributeMap: Array<[string, string]> = [
      ["a", "href"],
      ["link", "href"],
      ["form", "action"],
      ["img", "src"],
      ["script", "src"],
      ["iframe", "src"],
    ];

    attributeMap.forEach(([selector, attr]) => {
      const elements = Array.from(doc.querySelectorAll<HTMLElement>(selector));
      elements.forEach((element) => {
        const value = element.getAttribute(attr);
        if (!value || value.startsWith("javascript")) return;
        const absolute = this.safeResolve(value, baseUrl);
        if (absolute) {
          element.setAttribute(attr, absolute);
        }
      });
    });

    // Remove background attributes that conflict with theming.
    Array.from(doc.querySelectorAll<HTMLElement>("[background]"))
      .concat(Array.from(doc.querySelectorAll<HTMLElement>("[bgcolor]")))
      .forEach((element) => {
        element.removeAttribute("background");
        element.removeAttribute("bgcolor");
      });

    // Remove legacy inline width/height for responsiveness.
    Array.from(doc.querySelectorAll<HTMLElement>("[width]"))
      .concat(Array.from(doc.querySelectorAll<HTMLElement>("[height]")))
      .forEach((element) => {
        element.removeAttribute("width");
        element.removeAttribute("height");
      });
  }

  private extractScripts(doc: Document, baseUrl: string): PortalScript[] {
    const scripts: PortalScript[] = [];
    const scriptNodes = Array.from(doc.querySelectorAll<HTMLScriptElement>("script"));

    scriptNodes.forEach((script) => {
      if (script.src) {
        const src = this.safeResolve(script.src, baseUrl);
        if (src) scripts.push({ src });
      } else if (script.textContent?.trim()) {
        scripts.push({ content: script.textContent });
      }
      script.remove();
    });

    // Remove legacy link styles that would override the new theme.
    const linkNodes = Array.from(
      doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
    );
    linkNodes.forEach((link) => link.remove());

    return scripts;
  }

  private toAbsolute(url: string): string {
    return new URL(url, window.location.href).toString();
  }

  private safeResolve(value: string, baseUrl: string): string | null {
    try {
      return new URL(value, baseUrl).toString();
    } catch (error) {
      return null;
    }
  }
}
