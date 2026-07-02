import { decodeThaiHtml, extractCharset } from "./encoding";

// The native registrar site is treated as the backend API. This module is the
// only place that performs network requests. Every request is credentialed and
// must target the KMITL domain, so session cookies are never sent elsewhere.

const TRUSTED_HOST_SUFFIX = ".kmitl.ac.th";
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RETRIES = 1;

export interface RequestOptions {
  method?: "GET" | "POST";
  body?: BodyInit | null;
  headers?: Record<string, string>;
  timeoutMs?: number;
  retries?: number;
  signal?: AbortSignal;
}

export function parseHtml(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

// Resolve a URL and refuse to send credentials anywhere but the KMITL domain.
function resolveTrusted(url: string): URL {
  const resolved = new URL(url, location.href);
  const host = resolved.hostname;
  const trusted =
    host === location.hostname || host.endsWith(TRUSTED_HOST_SUFFIX);
  if (!trusted) {
    throw new Error(`Refusing to send a credentialed request to ${host}`);
  }
  return resolved;
}

async function request(url: string, opts: RequestOptions = {}): Promise<Response> {
  const target = resolveTrusted(url);
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = opts.retries ?? DEFAULT_RETRIES;

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const onExternalAbort = () => controller.abort();
    if (opts.signal) {
      if (opts.signal.aborted) controller.abort();
      else opts.signal.addEventListener("abort", onExternalAbort);
    }
    try {
      return await fetch(target.toString(), {
        method: opts.method ?? "GET",
        body: opts.body ?? null,
        headers: opts.headers,
        credentials: "include",
        signal: controller.signal,
      });
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timer);
      opts.signal?.removeEventListener("abort", onExternalAbort);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Request failed");
}

export const apiClient = {
  request,

  async fetchHtml(url: string, opts?: RequestOptions): Promise<Document> {
    const res = await request(url, opts);
    const buffer = await res.arrayBuffer();
    const charset = extractCharset(res.headers.get("content-type"));
    return parseHtml(decodeThaiHtml(buffer, charset));
  },

  async fetchText(url: string, opts?: RequestOptions): Promise<string> {
    const res = await request(url, opts);
    return res.text();
  },

  async fetchJson<T>(url: string, opts?: RequestOptions): Promise<T> {
    const res = await request(url, {
      ...opts,
      headers: { Accept: "application/json", ...(opts?.headers ?? {}) },
    });
    return (await res.json()) as T;
  },

  async postForm(
    url: string,
    fields: Record<string, string>,
    opts?: RequestOptions
  ): Promise<Response> {
    return request(url, {
      ...opts,
      method: "POST",
      body: new URLSearchParams(fields),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...(opts?.headers ?? {}),
      },
    });
  },
};
