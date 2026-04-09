import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto px-4 pt-32 pb-16">
        <h1 className="text-4xl font-bold text-foreground mb-4">Contact Us</h1>
        <p className="text-muted-foreground mb-8">Get in touch with the Byte-Sized Business Boost team.</p>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Contact form coming soon.</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
