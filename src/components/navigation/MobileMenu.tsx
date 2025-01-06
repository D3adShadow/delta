import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";

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
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-lg z-50">
        <div className="flex flex-col h-full bg-white">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-primary-500" />
              <span className="ml-2 text-lg font-semibold">Header</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 -mr-2"
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Menu Content */}
          <div className="flex-1 overflow-y-auto py-6 px-4">
            <nav className="grid gap-y-6">
              {session && navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-lg font-medium text-gray-900 hover:text-primary-500 transition-colors"
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
                  className="text-lg text-left font-medium text-gray-900 hover:text-primary-500 transition-colors"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="text-lg font-medium text-gray-900 hover:text-primary-500 transition-colors"
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