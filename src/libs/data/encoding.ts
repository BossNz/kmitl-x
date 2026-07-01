// The registrar serves Thai pages in several legacy encodings. These helpers
// decode a response buffer into a string, trying the declared charset first
// and then the common Thai codecs.

export function extractCharset(contentType: string | null): string | null {
  if (!contentType) return null;
  const match = contentType.match(/charset=([^;]+)/i);
  return match ? match[1].toLowerCase() : null;
}

function buildEncodingChain(preferred: string | null): string[] {
  const unique = new Set<string>();
  const push = (codec: string) => {
    if (codec) unique.add(codec.toLowerCase());
  };

  push(preferred || "");
  push("utf-8");
  push("windows-874");
  push("tis-620");
  push("tis620");
  push("iso-8859-11");

  return Array.from(unique.values());
}

export function decodeThaiHtml(
  buffer: ArrayBuffer,
  preferredCharset: string | null
): string {
  for (const encoding of buildEncodingChain(preferredCharset)) {
    try {
      const decoder = new TextDecoder(encoding, { fatal: false });
      const text = decoder.decode(buffer);
      if (text) return text;
    } catch {
      continue;
    }
  }
  return new TextDecoder().decode(buffer);
}
