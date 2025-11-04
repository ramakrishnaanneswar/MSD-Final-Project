import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Package, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { toast } from "sonner";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth");
      } else {
        setUserEmail(session.user.email || "");
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserEmail(session.user.email || "");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/products", label: "Products", icon: Package },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-lg">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg hidden sm:inline-block">Inventory System</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link key={link.to} to={link.to}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span>{userEmail}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="hidden md:flex"
            >
              <LogOut className="h-5 w-5" />
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-card">
            <nav className="container px-4 py-4 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className="w-full justify-start gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Button>
                  </Link>
                );
              })}
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8">{children}</main>
    </div>
  );
};

export default Layout;
