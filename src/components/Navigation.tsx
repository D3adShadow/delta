import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DesktopMenu from "./navigation/DesktopMenu";
import MobileMenu from "./navigation/MobileMenu";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const navItems = [
    { name: "Courses", path: "/courses" },
    { name: "Points", path: "/points" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-500">Delta</span>
            </Link>
          </div>

          <DesktopMenu 
            session={session}
            navItems={navItems}
            onSignOut={handleSignOut}
          />

          {/* Mobile Navigation Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-primary-500 transition-colors duration-200"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <MobileMenu 
        isOpen={isOpen}
        session={session}
        navItems={navItems}
        onSignOut={handleSignOut}
        onClose={() => setIsOpen(false)}
      />
    </nav>
  );
};

export default Navigation;