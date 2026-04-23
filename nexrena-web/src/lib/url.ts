export function normalizeInternalHref(href?: string): string | undefined {
  if (!href) return href;

  // Skip absolute URLs and protocol-relative URLs.
  if (/^(?:[a-z]+:)?\/\//i.test(href)) return href;

  // Skip hash-only links, mailto/tel links, and non-root-relative paths.
  if (
    href.startsWith('#') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    !href.startsWith('/')
  ) {
    return href;
  }

  const [pathAndQuery, hash = ''] = href.split('#');
  const [pathname, query = ''] = pathAndQuery.split('?');

  // Keep root path and file-like paths unchanged.
  const normalizedPath =
    pathname === '/' || /\.[a-z0-9]+$/i.test(pathname)
      ? pathname
      : pathname.endsWith('/')
        ? pathname
        : `${pathname}/`;

  const querySuffix = query ? `?${query}` : '';
  const hashSuffix = hash ? `#${hash}` : '';

  return `${normalizedPath}${querySuffix}${hashSuffix}`;
}
