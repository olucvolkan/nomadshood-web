import { Button } from '@/components/ui/button';
import { Coffee, Home, List, Waves, Youtube } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-orange-50/80 via-amber-50/80 to-yellow-50/80 backdrop-blur-lg border-b border-orange-200/20 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Waves className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent group-hover:from-orange-700 group-hover:via-amber-700 group-hover:to-yellow-700 transition-all duration-300">
                NomadsHood
              </h1>
              <p className="text-xs text-orange-600/70 -mt-1">Find Your Tribe</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/" className="group relative px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-orange-600 transition-all duration-200">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                <span>Home</span>
              </div>
              <div className="absolute inset-0 bg-white/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
            </Link>

            <Link href="/coliving" className="group relative px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-orange-600 transition-all duration-200">
              <div className="flex items-center gap-2">
                <List className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                <span>Colivings</span>
              </div>
              <div className="absolute inset-0 bg-white/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
            </Link>

            {/* CTA Buttons */}
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-orange-200/50">
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50/80" asChild>
                <Link href="https://www.youtube.com/@nomadshood" target="_blank" rel="noopener noreferrer">
                  <Youtube className="h-4 w-4 mr-1" />
                  <span className="hidden lg:inline">Videos</span>
                </Link>
              </Button>

              <Button variant="ghost" size="sm" className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50/80" asChild>
                <Link href="https://coff.ee/volkanoluc" target="_blank" rel="noopener noreferrer">
                  <Coffee className="h-4 w-4 mr-1" />
                  <span className="hidden lg:inline">Coffee</span>
                </Link>
              </Button>
            </div>
          </nav>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-red-600" asChild>
              <Link href="https://www.youtube.com/@nomadshood" target="_blank" rel="noopener noreferrer">
                <Youtube className="h-4 w-4" />
              </Link>
            </Button>

            <Button variant="ghost" size="sm" className="text-yellow-600" asChild>
              <Link href="https://coff.ee/volkanoluc" target="_blank" rel="noopener noreferrer">
                <Coffee className="h-4 w-4" />
              </Link>
            </Button>

            <div className="flex flex-col gap-1 pl-2 border-l border-orange-200/50">
              <Link href="/" className="flex items-center gap-1 text-xs text-gray-600 hover:text-orange-600">
                <Home className="h-3 w-3" />
                Home
              </Link>
              <Link href="/coliving" className="flex items-center gap-1 text-xs text-gray-600 hover:text-orange-600">
                <List className="h-3 w-3" />
                Spaces
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
