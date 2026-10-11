/** Accept only the workshop reader route and its owned selection parameters. */
export function workshopReturn(value: string | null): string | null {
  if (!value || !value.startsWith('/workshops/overview')) return null;
  try {
    const url = new URL(value, 'https://workshop.invalid');
    if (url.origin !== 'https://workshop.invalid' || url.pathname !== '/workshops/overview' || url.hash) return null;
    const query = new URLSearchParams();
    for (const key of ['workshop', 'page']) {
      const id = url.searchParams.get(key);
      if (id) query.set(key, id);
    }
    return url.pathname + (query.size ? '?' + query.toString() : '');
  } catch { return null; }
}
