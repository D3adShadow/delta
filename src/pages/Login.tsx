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
          console.log("Creating user record with metadata:", session.user.user_metadata);
          const { error } = await supabase
            .from('users')
            .insert([
              {
                id: session.user.id,
                full_name: session.user.user_metadata.full_name || 'Anonymous User',
              }
            ]);

          if (error) {
            console.error("Error creating user record:", error);
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
            Sign in to start learning and earning points
          </p>
          <p className="mt-1 text-center text-sm text-gray-500">
            Password must be at least 6 characters long
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
            providers={[]}
            redirectTo={`${window.location.origin}/courses`}
            localization={{
              variables: {
                sign_up: {
                  email_label: "Email address",
                  password_label: "Password (min. 6 characters)",
                  email_input_placeholder: "Your email address",
                  password_input_placeholder: "Your password",
                  button_label: "Sign up",
                  loading_button_label: "Signing up ...",
                  social_provider_text: "Sign in with {{provider}}",
                  link_text: "Don't have an account? Sign up",
                  confirmation_text: "Check your email for the confirmation link",
                }
              }
            }}
            showLinks={true}
            view="sign_up"
            additionalData={{
              full_name: {
                required: true,
                label: "Username",
                placeholder: "Choose a username"
              },
              password_confirm: {
                required: true,
                type: "password",
                label: "Confirm Password",
                placeholder: "Confirm your password"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;