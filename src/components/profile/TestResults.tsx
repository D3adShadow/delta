import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const TestResults = () => {
  const { data: testResults, isLoading } = useQuery({
    queryKey: ["test-results"],
    queryFn: async () => {
      console.log("Fetching test results");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("test_results")
        .select(`
          *,
          courses (
            title
          )
        `)
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });

      if (error) {
        console.error("Error fetching test results:", error);
        throw error;
      }

      console.log("Fetched test results:", data);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!testResults || testResults.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">No test results yet</p>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Test Results</h2>
      <div className="space-y-3">
        {testResults.map((result) => (
          <Card key={result.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">
                  {result.courses?.title}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(result.completed_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary-600">
                  {result.score} / {result.max_score}
                </p>
                <p className="text-sm text-gray-500">
                  {Math.round((result.score / result.max_score) * 100)}%
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TestResults;