import { useEffect } from 'react';
import { SITE_META } from '../content/site';

// Tab / history title only. Link previews (Slack, LinkedIn) read the static
// meta tags in index.html, since the app is rendered client-side.
export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE_META.title}` : SITE_META.title;
  }, [title]);
}
