export async function fetchHTML(url: string): Promise<Document> {
  const res = await fetch(url);
  const text = await res.text();
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
