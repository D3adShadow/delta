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
    <div className="md:hidden animate-fade-in">
      <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-b border-gray-100">
        {session && (
          <div className="space-y-1">
            <NavigationLinks items={navItems} onItemClick={onClose} />
          </div>
        )}
        {session ? (
          <button
            onClick={() => {
              onSignOut();
              onClose();
            }}
            className="block w-full text-left px-3 py-2 text-primary-500 font-medium hover:text-primary-600 transition-colors duration-200"
          >
            Sign Out
          </button>
        ) : (
          <Link
            to="/login"
            className="block px-3 py-2 text-primary-500 font-medium hover:text-primary-600 transition-colors duration-200"
            onClick={onClose}
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;