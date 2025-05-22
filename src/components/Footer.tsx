export function Footer() {
  return (
    <footer className="bg-card shadow-inner mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Nomad Coliving Hub. All rights reserved.</p>
        <p className="text-sm mt-1">Find your tribe, find your home.</p>
      </div>
    </footer>
  );
}
