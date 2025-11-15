export async function fetchHTML(url: string): Promise<Document> {
  const res = await fetchText(url);
  return parseHTML(res);
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
