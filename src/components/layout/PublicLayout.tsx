import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";

interface PublicLayoutProps {
  children: ReactNode;
}

// Parent-focused navigation (item #25: Assessor Login moved to footer)
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
];

export function PublicLayout({ children }: PublicLayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg hero-gradient">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-semibold text-lg">ReadingScreener</span>
          </Link>

          {/* Desktop Navigation - Parent funnel first */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Primary CTA only - Assessor login moved to footer */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/intake">
              <Button size="sm" className="hero-gradient border-0 text-primary-foreground hover:opacity-90">
                Book Free Screener
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="container py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.href
                      ? "bg-secondary text-primary"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t mt-2 flex flex-col gap-2">
                <Link to="/intake" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full hero-gradient border-0 text-primary-foreground">
                    Book Free Screener
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg hero-gradient">
                  <BookOpen className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-heading font-semibold text-lg">ReadingScreener</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-sm">
                Free virtual reading screenings to identify skill patterns and risk early. 
                Supporting parents and educators in understanding children's reading development.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link to="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
                <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
                <li><Link to="/intake" className="hover:text-primary transition-colors">Book a Screener</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link to="/disclaimer" className="hover:text-primary transition-colors">Screening Disclaimer</Link></li>
                <li><Link to="/login" className="hover:text-primary transition-colors">Staff Login</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} ReadingScreener. Educational screening support service.</p>
            <p className="mt-1 text-xs">This is a screening service to identify skill patterns and risk. It does not diagnose a disability.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
