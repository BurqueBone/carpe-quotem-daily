import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, Menu } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const Header = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { user, isAdmin, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const headerClasses = isHomePage
    ? "absolute top-0 left-0 right-0 z-50 bg-background/10 backdrop-blur-sm"
    : "border-b border-border/30 bg-background/80 backdrop-blur-sm sticky top-0 z-50";

  const logoClasses = isHomePage
    ? "text-white"
    : "bg-gradient-warm bg-clip-text text-transparent";

  const navTextClasses = isHomePage
    ? "text-white hover:text-white/80 bg-transparent hover:bg-white/10"
    : "text-foreground hover:text-primary bg-transparent hover:bg-accent/50";

  const buttonClasses = isHomePage
    ? "text-white hover:text-white/80 hover:bg-white/10"
    : "text-foreground hover:text-primary";

  const loginButtonClasses = isHomePage
    ? "text-white border-white/30 hover:bg-white/10"
    : "text-foreground border-border hover:bg-accent";

  const hamburgerClasses = isHomePage
    ? "text-white hover:bg-white/10"
    : "text-[#2D2D2D] hover:bg-accent/50";

  const mobileNavLinks = [
    { to: "/", label: "Home" },
    { to: "/blog", label: "Blog" },
    { to: "/carpe-diem", label: "Carpe Diem" },
    { to: "/life-compass-calibration", label: "Life Compass" },
    { to: "/resource-collection", label: "Resource Collection" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <header className={headerClasses}>
      <div className="w-full max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <h1 className={`text-2xl font-bold ${logoClasses}`}>Sunday4K</h1>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    to="/blog"
                    className={`inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${navTextClasses}`}
                  >
                    Blog
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className={navTextClasses}>
                  Carpe Diem
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-1 p-2 w-48">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link to="/carpe-diem" className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Carpe Diem</div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link to="/resource-collection" className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Resource Collection</div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link to="/life-compass-calibration" className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Life Compass</div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className={navTextClasses}>
                  About
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-1 p-2 w-48">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link to="/about" className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">About Us</div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link to="/contact" className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                          <div className="text-sm font-medium leading-none">Contact</div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {user && isAdmin && (
            <Link to="/admin">
              <Button variant="ghost" className={buttonClasses}>Admin</Button>
            </Link>
          )}
          {user ? (
            <Link to="/profile">
              <Button variant="ghost" size="icon" className={`rounded-full ${buttonClasses}`} title="Profile">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button variant="outline" className={loginButtonClasses}>Login</Button>
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className={`md:hidden ${hamburgerClasses}`} aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-[#F8F7FF] p-0">
            <SheetHeader className="p-6 pb-2">
              <SheetTitle className="text-left text-foreground">Sunday4K</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col px-4 pt-2 pb-6">
              {mobileNavLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center rounded-md px-4 min-h-[44px] text-sm font-medium text-foreground hover:bg-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border my-3" />
              {user && isAdmin && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center rounded-md px-4 min-h-[44px] text-sm font-medium text-foreground hover:bg-accent">
                  Admin
                </Link>
              )}
              {user ? (
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center rounded-md px-4 min-h-[44px] text-sm font-medium text-foreground hover:bg-accent">
                  Profile
                </Link>
              ) : (
                <div className="mt-2 px-4">
                  <Link to="/auth" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;