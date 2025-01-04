import { Link } from "react-router-dom";
import NavigationLinks from "./NavigationLinks";

interface DesktopMenuProps {
  session: any;
  navItems: { name: string; path: string; }[];
  onSignOut: () => void;
}

const DesktopMenu = ({ session, navItems, onSignOut }: DesktopMenuProps) => {
  return (
    <div className="hidden md:flex items-center gap-6">
      {session && <NavigationLinks items={navItems} />}
      {session ? (
        <button
          onClick={onSignOut}
          className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors duration-200"
        >
          Sign Out
        </button>
      ) : (
        <Link
          to="/login"
          className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors duration-200"
        >
          Sign In
        </Link>
      )}
    </div>
  );
};

export default DesktopMenu;