import { Link } from "react-router-dom";
import NavigationLinks from "./NavigationLinks";

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
      <div className="fixed inset-0 bg-black opacity-100 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-black shadow-lg z-50 animate-in slide-in-from-right">
        <div className="flex flex-col h-full bg-black">
          <div className="pt-5 pb-6 px-4 space-y-6">
            <div className="flex items-center justify-between">
              <Link to="/" className="text-2xl font-bold text-white" onClick={onClose}>
                Delta
              </Link>
            </div>
            <div className="mt-6">
              <nav className="grid gap-y-4">
                {session && navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="text-base font-medium text-white hover:text-primary-500 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-900"
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
                    className="w-full text-left px-3 py-2 text-base font-medium text-white hover:text-primary-500 transition-colors duration-200 rounded-md hover:bg-gray-900"
                  >
                    Sign Out
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="text-base font-medium text-white hover:text-primary-500 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-gray-900"
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
    </div>
  );
};

export default MobileMenu;