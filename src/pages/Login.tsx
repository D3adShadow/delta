import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      
      if (event === "SIGNED_IN") {
        if (session?.user) {
          // First check if user record exists
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', session.user.id)
            .single();

          if (!existingUser) {
            console.log("Creating new user record with metadata:", session.user.user_metadata);
            const { error } = await supabase
              .from('users')
              .insert([
                {
                  id: session.user.id,
                  full_name: session.user.user_metadata.name || session.user.user_metadata.full_name || 'Anonymous User',
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
          }
        }

        toast({
          title: "Welcome!",
          description: "You have successfully signed in.",
        });
        navigate("/courses");
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