import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface AuthFormFieldsProps {
  isLogin: boolean;
  name: string;
  email: string;
  password: string;
  acceptTerms: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTermsChange: (checked: boolean) => void;
}

export const AuthFormFields = ({
  isLogin,
  name,
  email,
  password,
  acceptTerms,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onTermsChange,
}: AuthFormFieldsProps) => {
  return (
    <div className="space-y-4">
      {!isLogin && (
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <Input
            id="name"
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            required={!isLogin}
          />
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <Input
          id="email"
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
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
          onChange={(e) => onPasswordChange(e.target.value)}
          required
        />
      </div>

      {!isLogin && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={acceptTerms}
            onCheckedChange={(checked) => onTermsChange(checked as boolean)}
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
      )}
    </div>
  );
};