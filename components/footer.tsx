import Link from "next/link";
import { Heart, Home, Heart as HeartIcon, Compass, BookOpen, User, Settings, LogIn } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-brand-peach/30 bg-gradient-to-b from-brand-off-white to-brand-cream/30">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 fill-brand-purple text-brand-purple" />
              <span className="text-lg font-bold text-gray-800">Sunday4K</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Your Life in Weeks. Your Weeks in Focus.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-800">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/" className="inline-flex items-center gap-2 hover:text-brand-purple">
                  <Home className="h-3.5 w-3.5" />
                  Home
                </Link>
              </li>
              <li>
                <Link href="/carpe-diem" className="inline-flex items-center gap-2 hover:text-brand-purple">
                  <HeartIcon className="h-3.5 w-3.5" />
                  Carpe Diem
                </Link>
              </li>
              <li>
                <Link href="/resource-collection" className="inline-flex items-center gap-2 hover:text-brand-purple">
                  <HeartIcon className="h-3.5 w-3.5" />
                  Resource Collection
                </Link>
              </li>
              <li>
                <Link href="/life-compass-calibration" className="inline-flex items-center gap-2 hover:text-brand-purple">
                  <Compass className="h-3.5 w-3.5" />
                  Life Compass
                </Link>
              </li>
              <li>
                <Link href="/blog" className="inline-flex items-center gap-2 hover:text-brand-purple">
                  <BookOpen className="h-3.5 w-3.5" />
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-800">
              Account
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/auth/login" className="inline-flex items-center gap-2 hover:text-brand-purple">
                  <LogIn className="h-3.5 w-3.5" />
                  Sign In / Sign Up
                </Link>
              </li>
              <li>
                <Link href="/profile" className="inline-flex items-center gap-2 hover:text-brand-purple">
                  <User className="h-3.5 w-3.5" />
                  Profile
                </Link>
              </li>
              <li>
                <Link href="/settings" className="inline-flex items-center gap-2 hover:text-brand-purple">
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/privacy" className="hover:text-brand-purple">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-brand-purple">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-brand-peach/20 pt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Sunday4K. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
