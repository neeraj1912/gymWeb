import { scheduleNotifications } from "../../notification/scheduleNotifications";
import { sendNotification } from "../../notification/sendNotification";

export async function GET(req, res) {

  // scheduleNotifications();
  try {
    sendNotification()
  console.log("Cron job initialized");
  return new Response(JSON.stringify({ message: "sendnotifications runs sucessfully" }), {
    status: 200,
  });
  } catch (error) {
    console.error("Error in cron API:", error);
    return new Response(JSON.stringify({ message: "error" }), {
      status: 500,
    });
  }
 
}
