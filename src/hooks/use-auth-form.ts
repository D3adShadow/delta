import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const useAuthForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitTimer, setRateLimitTimer] = useState<number | null>(null);

  const handleSignUp = async (
    email: string,
    password: string,
    name: string,
    acceptTerms: boolean
  ) => {
    if (!acceptTerms) {
      toast({
        title: "Error",
        description: "Please accept the Terms and Conditions",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log("Starting signup process...");

    try {
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (authError) {
        console.error("Auth error during signup:", authError);
        
        // Handle rate limit error specifically
        if (authError.status === 429) {
          const waitTime = 31; // Seconds to wait before retrying
          setRateLimitTimer(waitTime);
          
          // Start countdown
          const interval = setInterval(() => {
            setRateLimitTimer((prev) => {
              if (prev === null || prev <= 1) {
                clearInterval(interval);
                return null;
              }
              return prev - 1;
            });
          }, 1000);

          toast({
            title: "Too many attempts",
            description: `Please wait ${waitTime} seconds before trying again`,
            variant: "destructive",
          });
        } 
        // Handle user already exists error
        else if (authError.message.includes("User already registered")) {
          toast({
            title: "Account exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
        }
        else {
          toast({
            title: "Error",
            description: authError.message,
            variant: "destructive",
          });
        }
        setIsLoading(false);
        return;
      }

      if (authData.user) {
        console.log("Auth user created successfully:", authData.user.id);
        
        // Then create the public user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              full_name: name,
              points: 500, // Default starting points
            }
          ]);

        if (profileError) {
          console.error("Profile creation error:", profileError);
          toast({
            title: "Error",
            description: "There was a problem setting up your account. Please try again.",
            variant: "destructive",
          });
          return;
        }

        console.log("User profile created successfully");
        toast({
          title: "Welcome!",
          description: "Your account has been created successfully.",
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Unexpected signup error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    setIsLoading(true);
    console.log("Starting signin process...");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Signin error:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (data.user) {
        console.log("User signed in successfully:", data.user.id);
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Unexpected signin error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    rateLimitTimer,
    handleSignUp,
    handleSignIn,
  };
};