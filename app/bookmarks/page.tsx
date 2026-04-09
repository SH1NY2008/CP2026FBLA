import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function BookmarksPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto px-4 pt-32 pb-16">
        <h1 className="text-4xl font-bold text-foreground mb-4">Your Bookmarks</h1>
        <p className="text-muted-foreground mb-8">Save your favorite local businesses and come back to them anytime.</p>
        <div className="text-center py-16">
          <p className="text-muted-foreground">No bookmarks yet. Start exploring businesses to save your favorites!</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
