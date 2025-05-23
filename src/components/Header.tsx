import Link from 'next/link';
import { Home, List, Lightbulb, Waves } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-card shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:text-primary/90 transition-colors">
          <Waves className="h-8 w-8" />
          <span>NomadsHood</span>
        </Link>
        <nav>
          <ul className="flex space-x-6 items-center">
            <li>
              <Link href="/" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                <Home className="h-5 w-5" />
                Home
              </Link>
            </li>
            <li>
              <Link href="/coliving" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                <List className="h-5 w-5" />
                Directory
              </Link>
            </li>
            <li>
              <Link href="/recommender" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                <Lightbulb className="h-5 w-5" />
                AI Recommender
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
