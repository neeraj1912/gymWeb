"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "../../utils/supabase/client";
import { sendNotification } from "./sendNotification";
import { motion, AnimatePresence } from "framer-motion";

const Page = () => {
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);
  const [permit , setPermit] = useState("")
  const supabase = createClient();
  const [ dbdata, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(false)
// grand permission 

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
};

const generateSubscribeEndPoint = async (registration: ServiceWorkerRegistration) => {
  const publicKey =
    "BDf-3G51UdegX8K9R5q_TPmyJSYRBiN3wczOAmDXkzX_I-zXM9Kymt5UEbVKWO1884lutCcNljUSXovmBvt-iIg";
  const options = {
    applicationServerKey: urlBase64ToUint8Array(publicKey),
    userVisibleOnly: true,
  };
  try {
    const subscription = await registration.pushManager.subscribe(options);
    
    const { error } = await supabase
      .from("notification")
      .insert({ notification_json: JSON.stringify(subscription) });
    if (error) {
      console.error("Error inserting subscription:", error.message);
    } else {
      console.log("User subscribed successfully!");
    }
  } catch (err: any) {
    console.error("Failed to subscribe:", err.message);
  }
};

const subscribeUser = async () => {
  if ("serviceWorker" in navigator) {
    try {
      let registration = await navigator.serviceWorker.getRegistration();

      // Register service worker if not already registered
      if (!registration) {
        registration = await navigator.serviceWorker.register("/sw.js");
      } else if (registration.waiting) {
        // Handle waiting service worker
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }

      // Check if already subscribed to push notifications
      const isSubscribed = await registration.pushManager.getSubscription();
      if (isSubscribed) {
        console.log("Already subscribed to push notifications.");
        return;
      }

      // Wait for service worker to activate if it's installing or waiting
      if (registration.installing || registration.waiting) {
        await new Promise<void>((resolve) => {
          const stateChangeListener = () => {
            if (registration.active) {
              resolve();
            }
          };

          if (registration.installing) {
            registration.installing.addEventListener("statechange", stateChangeListener);
          } else if (registration.waiting) {
            registration.waiting.addEventListener("statechange", stateChangeListener);
          }
        });
      }

      // Proceed with subscription
      await generateSubscribeEndPoint(registration);
    } catch (error) {
      console.error("Error in service worker registration or subscription:", error);
    }
  } else {
    console.error("Service workers are not supported in this browser.");
  }
};

const showNotification = async () => {
  if ("Notification" in window) {
    try {
      const permission = await Notification.requestPermission();
      console.log("permission", permission)
      setNotificationStatus(permission);
      setPermit(permission)

      if (permission === "granted") {
        subscribeUser();
      } else {
        alert("Please enable notifications in your browser settings.");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  } else {
    console.log("Your browser does not support notifications.");
  }
};
// grant premission ends 


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

  const handleNotificationEnable = () => {
    console.log("handleNotificationEnable runs")
    showNotification();
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const permi = Notification.permission;
        setPermit(permi);
        console.log("permi", permi)
        const { data: rows, error } = await supabase
          .from("personList")
          .select("*");
        if (error) {
          console.error("Error fetching personList:", error);
          return;
        }

        const updatedData = await Promise.all(
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
        console.log("data updated", updatedData);
        setData(updatedData);
        
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    console.log("after fetch data")
    handleNotificationEnable()
  }, []);



  const handleSendNotification = async () => {
    setLoading(true)
    try {
      // Check if service workers are supported
      if (!("serviceWorker" in navigator)) {
        console.error("Service workers are not supported in this browser.");
        return;
      }
  
      // Check if a service worker is registered
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        console.error("No service worker is registered. Please register one first.");
        alert("Service worker is not registered. Subscribe for notifications first!");
        return;
      }
  
     // Proceed with sending the notification
      dbdata.map(async(el)=>{
        if(el.remainingDays == 0){
          const data = await sendNotification(
            `subscription end of ${el.fullName}`,
            "",
            "message"
          );
          console.log("Notification sent successfully:", data);
        }
      })
    } catch (error) {
      console.error("Error in sending notification:", error);
    }
    finally{
      setLoading(false)
    }
  };
  


  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 pb-24">
      <div className="container mx-auto px-4 py-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Notifications</h2>
            <div>
              {permit == "granted" ? (
                <button
                  onClick={()=>{
                    alert(
                      "To disable notifications, please go to your browser's settings and revoke notification permissions for this website."
                    );
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                >
                  Disable Notifications
                </button>
              ) : (
                <button
                   onClick={handleNotificationEnable}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                  Enable Notifications
                </button>
              )}
            </div>
          </div>

          {permit == "granted" && (
            <AnimatePresence>
              {dbdata.filter((user) => user.remainingDays === 0).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4"
                >
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                    Users with Subscription Ending Soon
                  </h3>
                  <ul className="space-y-2">
                    {dbdata
                      .filter((user) => user.remainingDays === 0)
                      .map((user) => (
                        <li
                          key={user.id}
                          className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-4"
                        >
                          <div>
                            <h4 className="text-lg font-medium text-gray-800 dark:text-white">
                              {user.fullName}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400">
                              Subscription ends on {user.membershipEndDate}
                            </p>
                          </div>
                         
                        </li>
                      ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
        <button
        onClick={()=>{
          handleSendNotification()
        }}
        >send notification</button>
      </div>
    </div>
  );
};

export default Page;
