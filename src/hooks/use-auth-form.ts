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

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        // Handle rate limit error specifically
        if (error.status === 429) {
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
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              full_name: name,
              points: 500
            }
          ]);

        if (profileError) {
          toast({
            title: "Error",
            description: "There was a problem setting up your account. Please try again.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Welcome!",
          description: "Your account has been created successfully.",
        });
        navigate("/courses");
      }
    } catch (error) {
      console.error("Signup error:", error);
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

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        navigate("/courses");
      }
    } catch (error) {
      console.error("Signin error:", error);
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