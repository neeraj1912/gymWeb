import cron from "node-cron";
import { sendNotification } from "./sendNotification"; // Update the path based on your project
import { createClient } from "../../utils/supabase/client";

export const scheduleNotifications = () => {
  let updatedData: any[] = [];
  const supabase = createClient(); // Initialize Supabase client

  const parsePlanMonths = (planString: string): number => {
    const matches = planString.match(/(\d+)/);
    return matches ? parseInt(matches[0]) : 1;
  };

  const calculateRemainingDays = (doj: string, planString: string) => {
    const joinDate = new Date(doj);
    const monthsToAdd = parsePlanMonths(planString);

    // Get the end date
    const membershipEndDate = new Date(joinDate);

    // Add months considering variable month lengths
    // If the current day is 31st and next month has 30 days, it will correctly adjust
    membershipEndDate.setMonth(membershipEndDate.getMonth() + monthsToAdd);

    // Handle edge case where joining on 31st and ending month has fewer days
    if (joinDate.getDate() !== membershipEndDate.getDate()) {
      // This means we've hit the edge case of e.g., Jan 31 -> Feb 28
      // Go back to the last day of the intended month
      membershipEndDate.setDate(2);
    }

    // Set the time to end of day to include the full last day
    membershipEndDate.setHours(23, 59, 59, 999);

    const currentDate = new Date();

    // Calculate remaining time in milliseconds
    const remainingTime = membershipEndDate.getTime() - currentDate.getTime();

    // Convert to days and round up to give benefit of partial days to user
    const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));

    return {
      remainingDays,
      endDate: membershipEndDate.toLocaleDateString(),
    };
  };

  const fetchData = async () => {
    try {
      const { data: rows, error } = await supabase
        .from("personList")
        .select("*");
      if (error) {
        console.error("Error fetching personList:", error);
        return;
      }

      updatedData = await Promise.all(
        rows.map(async (row) => {
          // Calculate remaining days and end date
          const { remainingDays, endDate } = calculateRemainingDays(
            row.doj,
            row.plan
          );

          // Add remainingDays and endDate to row data
          row.remainingDays = remainingDays;
          row.membershipEndDate = endDate;

          return row;
        })
      );
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };
  console.log("data fetched")

  fetchData();


  cron.schedule("*/15 * * * * *", async () => {
  
    if (updatedData) {
      updatedData?.forEach(async (el) => {
        if (el.remainingDays === 0) {
          try {
            await sendNotification(
              `Subscription of ${el.fullName} is ending today.`,
              "",
              "Subscription Reminder"
            );
            console.log(`Notification sent to ${el.fullName}`);
          } catch (err) {
            console.error(`Error sending notification to ${el.fullName}:`, err);
          }
        }
      });
    }
  });
};
