import { isV2 } from './legacy';
import type { PortfolioJson } from './schema';

const DATA_URL = '/data/portfolio.json';

/** Fetches portfolio.json once. The file is the truth: no local fallback. */
export async function loadPortfolioJson(signal?: AbortSignal): Promise<PortfolioJson> {
  const res = await fetch(DATA_URL, { signal, cache: 'no-cache' });
  if (!res.ok) throw new Error(`Could not load portfolio data (HTTP ${res.status}).`);
  const json: unknown = await res.json();
  if (!isV2(json)) throw new Error('portfolio.json is not in the version 2 format.');
  return json;
}
