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
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-lg z-50">
        <div className="flex flex-col h-full bg-white">
          <div className="pt-8 pb-6 px-6 space-y-8">
            <div className="flex items-center justify-between">
              <Link to="/" className="text-2xl font-bold text-black" onClick={onClose}>
                Delta
              </Link>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <span className="text-xl text-black">×</span>
              </button>
            </div>
            <div className="mt-12">
              <nav className="grid gap-y-8">
                {session && navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="text-xl font-medium text-black hover:text-primary-500 transition-colors px-2 py-1"
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
                    className="text-xl text-left font-medium text-black hover:text-primary-500 transition-colors px-2 py-1"
                  >
                    Sign Out
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="text-xl font-medium text-black hover:text-primary-500 transition-colors px-2 py-1"
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