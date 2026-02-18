import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-brand-light-purple/30 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <Link href="/" className="text-lg font-bold text-brand-purple">
              Sunday4K
            </Link>
            <p className="mt-2 text-sm text-gray-500">
              Your life in weeks. Your weeks in focus.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-800">
              Explore
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/blog" className="hover:text-brand-purple">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/carpe-diem" className="hover:text-brand-purple">
                  Carpe Diem
                </Link>
              </li>
              <li>
                <Link
                  href="/life-compass-calibration"
                  className="hover:text-brand-purple"
                >
                  Life Compass
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-800">
              Company
            </h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/about" className="hover:text-brand-purple">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-purple">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Sunday4K. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
