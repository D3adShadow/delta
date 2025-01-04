import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const LoginForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) {
      toast({
        title: "Error",
        description: "Please accept the Terms and Conditions",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
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

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <Input
            id="name"
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={acceptTerms}
            onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
          />
          <label
            htmlFor="terms"
            className="text-sm text-gray-600"
          >
            Accept our{" "}
            <a href="/terms" className="text-primary hover:underline">
              Terms and Conditions
            </a>
          </label>
        </div>
      </div>

      <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create Free Account"}
      </Button>

      <div className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <a href="/login" className="text-primary hover:underline">
          Log in here
        </a>
      </div>
    </form>
  );
};