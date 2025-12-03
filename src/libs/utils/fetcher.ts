export async function fetchHTML(url: string): Promise<Document> {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const preferred = extractCharset(res.headers.get("content-type"));

  const { text, encoding } = decodeBuffer(buffer, preferred);
  return parseHTML(text);
}

export async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  return res.text();
}

export async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return res.json();
}

export function parseHTML(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

function extractCharset(contentType: string | null): string | null {
  if (!contentType) return null;
  const match = contentType.match(/charset=([^;]+)/i);
  return match ? match[1].toLowerCase() : null;
}

function decodeBuffer(buffer: ArrayBuffer, preferred: string | null) {
  const candidates = buildEncodingChain(preferred);
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

function buildEncodingChain(preferred: string | null): string[] {
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
