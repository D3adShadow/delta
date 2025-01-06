import { Link } from "react-router-dom";
import { X } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  session: any;
  navItems: { name: string; path: string; }[];
  onSignOut: () => void;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, session, navItems, onSignOut, onClose }: MobileMenuProps) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full bg-[#1d1d1f] shadow-lg z-50">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-4 border-b border-gray-800">
            <Link to="/" className="text-2xl font-bold text-white tracking-tight" onClick={onClose}>
              Delta
            </Link>
            <button
              onClick={onClose}
              className="p-2 text-white hover:text-gray-300 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Menu Content */}
          <div className="flex-1 overflow-y-auto py-8 px-8">
            <nav className="grid gap-y-6">
              {session && navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-2xl font-medium text-white hover:text-gray-300 transition-colors"
                  onClick={onClose}
                >
                  {item.name}
                </Link>
              ))}
              {session ? (
                <button
                  onClick={() => {
                    onSignOut();
                    onClose();
                  }}
                  className="text-2xl text-left font-medium text-white hover:text-gray-300 transition-colors"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="text-2xl font-medium text-white hover:text-gray-300 transition-colors"
                  onClick={onClose}
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;