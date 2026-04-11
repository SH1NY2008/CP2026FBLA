import { redirect } from 'next/navigation';

/* Legacy URL — bookmarks live under the dashboard now so we don't maintain two UIs. */
export default function BookmarksPage() {
  redirect('/dashboard');
}
