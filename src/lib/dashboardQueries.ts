import { createClient } from "@/utils/supabase/client";

export interface Transaction {
  paymentDate: string;
  amount: number;
  mode: "upi" | "cash";
  personName: string;
}

interface Person {
  fullName: string;
  transaction: Transaction | Transaction[];
}

interface MonthlyEarning {
  month: string;
  upi: number;
  cash: number;
}

export async function getDashboardData() {
  const supabase = createClient();
  const currentDate = new Date();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  try {
    // Get all transactions for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // Get last 6 months including current

    const { data: transactionData, error: transactionError } = await supabase
      .from("personList")
      .select("fullName, transaction");

    if (transactionError) {
      console.error("Error fetching transaction data:", transactionError);
      throw transactionError;
    }

    // Query for total members
    const { count: totalMembers, error: totalMembersError } = await supabase
      .from("personList")
      .select("*", { count: "exact" });

    if (totalMembersError) {
      console.error("Error fetching total members:", totalMembersError);
      throw totalMembersError;
    }

    // Query for paid members
    const { count: paidMembers, error: paidMembersError } = await supabase
      .from("personList")
      .select("*", { count: "exact" })
      .eq("feesstatus", true);

    if (paidMembersError) {
      console.error("Error fetching paid members:", paidMembersError);
      throw paidMembersError;
    }

    const { count: newMembersThisMonth, error: newMembersError } = await supabase
      .from('personList')
      .select('*', { count: 'exact' })
      .gte('created_at', firstDayOfMonth.toISOString())
      .lte('created_at', lastDayOfMonth.toISOString());

    if (newMembersError) {
      console.error('Error fetching new members:', newMembersError);
      throw newMembersError;
    }


    // Initialize monthly earnings data
    const monthlyEarnings = new Map();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Initialize last 6 months with zero values
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(currentDate.getMonth() - i);
      const monthKey = months[monthDate.getMonth()];
      monthlyEarnings.set(monthKey, { month: monthKey, upi: 0, cash: 0 });
    }

    // Calculate current month totals and monthly earnings
    let totalEarnings = 0;
    let upiEarnings = 0;
    let cashEarnings = 0;
    let recentTransactions: Transaction[] = [];

    transactionData?.forEach((person) => {
      if (!person.transaction) return;

      const transactions = Array.isArray(person.transaction)
        ? person.transaction
        : [person.transaction];

      transactions.forEach((transaction) => {
        if (!transaction || !transaction.paymentDate || !transaction.amount)
          return;

        const transactionDate = new Date(transaction.paymentDate);
        const amount = Number(transaction.amount);

        if (isNaN(amount)) return;

        // Check if transaction is within last 6 months
        if (transactionDate >= sixMonthsAgo) {
          const monthKey = months[transactionDate.getMonth()];
          const monthData = monthlyEarnings.get(monthKey);

          if (monthData) {
            if (transaction.mode === "upi") {
              monthData.upi += amount;
            } else if (transaction.mode === "cash") {
              monthData.cash += amount;
            }
          }

          // Add to recent transactions
          recentTransactions.push({
            ...transaction,
            personName: person.fullName,
          });
        }

        // Calculate current month totals
        if (
          transactionDate >= firstDayOfMonth &&
          transactionDate <= lastDayOfMonth
        ) {
          totalEarnings += amount;
          if (transaction.mode === "upi") {
            upiEarnings += amount;
          } else if (transaction.mode === "cash") {
            cashEarnings += amount;
          }
        }
      });
    });

    // Convert monthly earnings map to array for the chart
    const earningsData = Array.from(monthlyEarnings.values());

    // Sort recent transactions by date (most recent first) and limit to 5
    recentTransactions.sort(
      (a, b) =>
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
    );
    recentTransactions = recentTransactions.slice(0, 5);

    return {
      totalEarnings,
      upiEarnings,
      cashEarnings,
      totalMembers: totalMembers ?? 0,
      paidMembers: paidMembers ?? 0,
      unpaidMembers: (totalMembers ?? 0) - (paidMembers ?? 0),
      newMembersThisMonth: newMembersThisMonth ?? 0,
      earningsData,
      recentTransactions,
    };
  } catch (error) {
    console.error("Error in getDashboardData:", error);
    return {
      totalEarnings: 0,
      upiEarnings: 0,
      cashEarnings: 0,
      totalMembers: 0,
      paidMembers: 0,
      unpaidMembers: 0,
      newMembersThisMonth: 0,
      earningsData: [],
      recentTransactions: [],
    };
  }
}
