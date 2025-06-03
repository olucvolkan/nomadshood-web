import Link from 'next/link';
import { Home, List, PlaneTakeoff, Waves } from 'lucide-react';

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
                Colivings
              </Link>
            </li>
            {/* Trip Planner link removed
            <li>
              <Link href="/recommender" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                <PlaneTakeoff className="h-5 w-5" />
                Trip Planner
              </Link>
            </li>
            */}
          </ul>
        </nav>
      </div>
    </header>
  );
}
