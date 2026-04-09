import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Container } from '@/components/ui/container';

export default function DealsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Container className="max-w-7xl pt-28 pb-16">
        <div className="text-center py-20">
          <h1 className="text-5xl font-bold text-foreground mb-4">Exclusive Deals</h1>
          <p className="text-lg text-muted-foreground">Coming soon - discover special offers from local businesses</p>
        </div>
      </Container>
      <Footer />
    </main>
  );
}
