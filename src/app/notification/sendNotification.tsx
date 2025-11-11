"use server";

import { createClient } from "../../utils/supabase/server";
import webpush from "web-push";

export const sendNotification = async (
  message: string,
  icon: string,
  name: string
) => {
  const vapidKeys = {
    publickey: "BDf-3G51UdegX8K9R5q_TPmyJSYRBiN3wczOAmDXkzX_I-zXM9Kymt5UEbVKWO1884lutCcNljUSXovmBvt-iIg",
    privatekey: "xwMOs06ZYpRcTPKmgsoq8YWsHhGj_JQLqLyNkOb6yZk",
  };

  // Set VAPID details
  webpush.setVapidDetails(
    "mailto:nharshit7024@gmail.com",
    vapidKeys.publickey,
    vapidKeys.privatekey
  );

  const supabase = await createClient();

  try {
    // Fetch all subscriptions from the notification table
    const { data, error } = await supabase.from("notification").select("*");

    if (error) {
      console.error("Error fetching subscriptions:", error.message);
      return JSON.stringify({ error: error.message });
    }

    if (!data || data.length === 0) {
      console.log("No subscriptions found.");
      return JSON.stringify({ message: "No subscriptions found." });
    }

    const results = [];
    for (const subscription of data) {
      try {
        // Send notification to each subscription
        await webpush.sendNotification(
          JSON.parse(subscription.notification_json),
          JSON.stringify({
            message: name,
            icon: icon || "", // Use default icon if not provided
            body: message,
          })
        );
        console.log(`Notification sent to user_id: ${subscription.id}`);
        results.push({ user_id: subscription.id, status: "success" });
      } catch (e:any) {
        console.error(`Failed to send notification to user_id: ${subscription.id}`, e);
        results.push({ user_id: subscription.id, status: "failure", error: e.message });
      }
    }

    return JSON.stringify({ results });
  } catch (e) {
    console.error("Unexpected error while sending notifications:", e);
    return JSON.stringify({ error: "Unexpected error occurred." });
  }
};
