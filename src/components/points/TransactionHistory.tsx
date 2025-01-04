import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

interface Transaction {
  id: string;
  points_spent: number;
  purchased_at: string;
  courses: {
    title: string;
  };
}

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("course_purchases")
        .select(`
          id,
          points_spent,
          purchased_at,
          courses (
            title
          )
        `)
        .eq("user_id", user.id)
        .order("purchased_at", { ascending: false });

      if (error) {
        console.error("Error fetching transactions:", error);
        return;
      }

      setTransactions(data);
    };

    fetchTransactions();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <Card key={transaction.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">{transaction.courses.title}</p>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.purchased_at).toLocaleDateString()}
                </p>
              </div>
              <p className="font-semibold text-red-600">-{transaction.points_spent} points</p>
            </div>
          </Card>
        ))}
        {transactions.length === 0 && (
          <p className="text-gray-500 text-center py-4">No transactions yet</p>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;