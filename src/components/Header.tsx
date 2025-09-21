import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import logo from '@/assets/sunday4k-logo.png';
import newLogo from '@/assets/new-logo.png';
const Header = () => {
  const {
    user,
    isAdmin,
    signOut
  } = useAuth();
  const handleSignOut = async () => {
    await signOut();
  };
  return <header className="border-b border-border/30 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          
          <h1 className="text-2xl font-bold bg-gradient-warm bg-clip-text text-transparent">
            Sunday4K
          </h1>
          
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/blog">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Blog
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Contact
            </Button>
          </Link>
          <Link to="/carpe-diem">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Carpe Diem
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              About
            </Button>
          </Link>
          {user && isAdmin && (
            <Link to="/admin">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                Admin
              </Button>
            </Link>
          )}
          {user ? <Link to="/profile">
              <Button variant="ghost" size="icon" className="rounded-full" title="Profile">
                <User className="h-5 w-5" />
              </Button>
            </Link> : <Link to="/auth">
              <Button variant="outline">Login</Button>
            </Link>}
        </div>
      </div>
    </header>;
};
export default Header;