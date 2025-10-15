import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import logo from '@/assets/sunday4k-logo.png';
import newLogo from '@/assets/new-logo.png';
const Header = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const {
    user,
    isAdmin,
    signOut
  } = useAuth();
  const handleSignOut = async () => {
    await signOut();
  };
  
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
    ? "text-black border-white/30 hover:bg-white/10"
    : "text-black border-border hover:bg-accent";

  return <header className={headerClasses}>
      <div className="w-full max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <h1 className={`text-2xl font-bold ${logoClasses}`}>
              Sunday4K
            </h1>
          </Link>

          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className={navTextClasses}>
                  Carpe Diem
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-1 p-2 w-48">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/carpe-diem"
                          className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Carpe Diem</div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/resource-collection"
                          className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Resource Collection</div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/life-compass-calibration"
                          className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
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
                        <Link
                          to="/about"
                          className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">About Us</div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/blog"
                          className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Blog</div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/contact"
                          className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          <div className="text-sm font-medium leading-none">Contact</div>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-4">
          {user && isAdmin && (
            <Link to="/admin">
              <Button variant="ghost" className={buttonClasses}>
                Admin
              </Button>
            </Link>
          )}
          {user ? <Link to="/profile">
              <Button variant="ghost" size="icon" className={`rounded-full ${buttonClasses}`} title="Profile">
                <User className="h-5 w-5" />
              </Button>
            </Link> : <Link to="/auth">
              <Button variant="outline" className={loginButtonClasses}>Login</Button>
            </Link>}
        </div>
      </div>
    </header>;
};
export default Header;