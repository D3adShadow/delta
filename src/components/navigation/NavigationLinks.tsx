import { Link } from "react-router-dom";

interface NavigationItem {
  name: string;
  path: string;
}

interface NavigationLinksProps {
  items: NavigationItem[];
  onItemClick?: () => void;
}

const NavigationLinks = ({ items, onItemClick }: NavigationLinksProps) => {
  return (
    <>
      {items.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className="text-gray-600 hover:text-primary-500 hover:bg-gray-50 px-4 py-2 rounded-md transition-all duration-200 font-medium mx-2"
          onClick={onItemClick}
        >
          {item.name}
        </Link>
      ))}
    </>
  );
};

export default NavigationLinks;