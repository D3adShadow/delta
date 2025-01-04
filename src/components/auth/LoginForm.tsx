import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthForm } from "@/hooks/use-auth-form";
import { AuthFormFields } from "./AuthFormFields";

export const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const { isLoading, rateLimitTimer, handleSignUp, handleSignIn } = useAuthForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      await handleSignIn(email, password);
    } else {
      await handleSignUp(email, password, name, acceptTerms);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AuthFormFields
        isLogin={isLogin}
        name={name}
        email={email}
        password={password}
        acceptTerms={acceptTerms}
        onNameChange={setName}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onTermsChange={setAcceptTerms}
      />

      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary-600" 
        disabled={isLoading || rateLimitTimer !== null}
      >
        {isLoading 
          ? (isLogin ? "Signing in..." : "Creating account...") 
          : rateLimitTimer 
            ? `Please wait ${rateLimitTimer}s...`
            : (isLogin ? "Sign In" : "Create Free Account")}
      </Button>

      <div className="text-center text-sm text-gray-500">
        {isLogin ? (
          <>
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className="text-primary hover:underline"
            >
              Sign up here
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className="text-primary hover:underline"
            >
              Sign in here
            </button>
          </>
        )}
      </div>
    </form>
  );
};