import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const [username, setUsername] = useState("");
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state changed:", event, currentSession);
      
      if (event === "SIGNED_IN") {
        if (currentSession?.user) {
          setSession(currentSession);
          // Check if user already exists
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', currentSession.user.id)
            .single();

          if (!existingUser) {
            setShowUsernameInput(true);
          } else {
            // User exists, proceed to courses
            toast({
              title: "Welcome back!",
              description: "You have successfully signed in.",
            });
            navigate("/courses");
          }
        }
      } else if (event === "SIGNED_OUT") {
        toast({
          title: "Signed out",
          description: "You have been signed out.",
        });
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('users')
      .insert([
        {
          id: session.user.id,
          full_name: username,
          points: 500
        }
      ]);

    if (error) {
      console.error("Error creating user record:", error);
      toast({
        title: "Error",
        description: "There was a problem setting up your account. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Welcome!",
      description: "Your account has been set up successfully.",
    });
    navigate("/courses");
  };

  if (showUsernameInput) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Choose your username
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please enter a username to complete your registration
            </p>
          </div>
          <form onSubmit={handleUsernameSubmit} className="mt-8 space-y-6">
            <div>
              <Input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Welcome to Delta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in with Google to start learning
          </p>
        </div>
        <div className="mt-8">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#2563eb',
                    brandAccent: '#1d4ed8',
                  },
                },
              },
            }}
            theme="light"
            providers={["google"]}
            redirectTo={`${window.location.origin}/courses`}
            view="sign_in"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;