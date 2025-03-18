import { useState } from "react";
import { User } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, X, Check } from "lucide-react";

interface UserHeaderProps {
  userData: User | null;
}

const UserHeader = ({ userData }: UserHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(userData?.full_name || "");
  const { toast } = useToast();

  const handleUpdateName = async () => {
    if (!userData?.id || !newName.trim()) return;

    console.log("Updating user name:", { userId: userData.id, newName });
    
    const { error } = await supabase
      .from("users")
      .update({ full_name: newName.trim() })
      .eq("id", userData.id);

    if (error) {
      console.error("Error updating name:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update name. Please try again.",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Your name has been updated.",
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="space-y-2">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="text-2xl font-bold"
              placeholder="Enter your name"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleUpdateName}
              className="text-green-600 hover:text-green-700"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                setNewName(userData?.full_name || "");
              }}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {userData?.full_name}
            </h1>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="text-gray-600 hover:text-gray-700"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        )}
        <p className="text-lg text-gray-600">
          Available Points:{" "}
          <span className="font-semibold text-primary-600">
            {userData?.points || 0}
          </span>
        </p>
      </div>
    </div>
  );
};

export default UserHeader;