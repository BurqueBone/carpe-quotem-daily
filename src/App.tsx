import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import CarpeDiem from "./pages/CarpeDiem";
import LifeCompass from "./pages/LifeCompass";
import About from "./pages/About";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import AdminTemplates from "./pages/AdminTemplates";
import AdminTemplateVariables from "./pages/AdminTemplateVariables";
import AdminBlog from "./pages/AdminBlog";
import AdminBlogNew from "./pages/AdminBlogNew";
import AdminBlogEdit from "./pages/AdminBlogEdit";
import AdminCategories from "./pages/AdminCategories";
import AdminContact from "./pages/AdminContact";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/Contact";
import DebugAuth from "./pages/DebugAuth";
import AuthUrlHandler from "./components/AuthUrlHandler";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthUrlHandler />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
        <Route path="/carpe-diem" element={<CarpeDiem />} />
        <Route path="/life-compass" element={<LifeCompass />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/debug/auth" element={<DebugAuth />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/templates" element={<AdminTemplates />} />
            <Route path="/admin/template-variables" element={<AdminTemplateVariables />} />
            <Route path="/admin/blog" element={<AdminBlog />} />
            <Route path="/admin/blog/new" element={<AdminBlogNew />} />
            <Route path="/admin/blog/edit/:id" element={<AdminBlogEdit />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/contact" element={<AdminContact />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
