import { Link } from "react-router-dom";
import { Home, User, Settings, Heart, Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-warm flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-foreground">Sunday4K</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your Life in Weeks. Your Weeks in Focus.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Navigation</h3>
            <nav className="space-y-2">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-smooth text-sm"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link 
                to="/carpe-diem" 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-smooth text-sm"
              >
                <Heart className="w-4 h-4" />
                Carpe Diem Resources
              </Link>
            </nav>
            <Link 
                to="/life-compass" 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-smooth text-sm"
              >
                <Heart className="w-4 h-4" />
                Life Compass
              </Link>
            </nav>
          </div>

          {/* Account Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Account</h3>
            <nav className="space-y-2">
              <Link 
                to="/auth" 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-smooth text-sm"
              >
                <Shield className="w-4 h-4" />
                Sign In / Sign Up
              </Link>
              <Link 
                to="/profile" 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-smooth text-sm"
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              <Link 
                to="/settings" 
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-smooth text-sm"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </nav>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Legal</h3>
            <nav className="space-y-2">
              <a 
                href="/privacy" 
                className="block text-muted-foreground hover:text-primary transition-smooth text-sm"
              >
                Privacy Policy
              </a>
              <a 
                href="/terms" 
                className="block text-muted-foreground hover:text-primary transition-smooth text-sm"
              >
                Terms of Service
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Sunday4K. All rights reserved. Your Life in Weeks. Your Weeks in Focus.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;