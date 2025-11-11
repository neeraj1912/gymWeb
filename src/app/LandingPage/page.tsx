"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusIcon } from 'lucide-react';
import BottomNavbar from "./bottom-navbar";
import LandingPageHeader from "./header";
import Table from "./table";
import { motion } from 'framer-motion';
import { createClient } from "../../utils/supabase/client";


const LandingPage = () => {
  const [redirecting, setRedirecting] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);
  const supabase = createClient();


  // const urlBase64ToUint8Array = (base64String: string) => {
  //   const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  //   const base64 = (base64String + padding)
  //     .replace(/-/g, "+")
  //     .replace(/_/g, "/");
  //   const rawData = window.atob(base64);
  //   return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
  // };


  // const generateSubscribeEndPoint = async (registration: ServiceWorkerRegistration) => {
  //   const publicKey =
  //     "BDf-3G51UdegX8K9R5q_TPmyJSYRBiN3wczOAmDXkzX_I-zXM9Kymt5UEbVKWO1884lutCcNljUSXovmBvt-iIg";
  //   const options = {
  //     applicationServerKey: urlBase64ToUint8Array(publicKey),
  //     userVisibleOnly: true,
  //   };
  //   try {
  //     const subscription = await registration.pushManager.subscribe(options);
      
  //     const { error } = await supabase
  //       .from("notification")
  //       .insert({ notification_json: JSON.stringify(subscription) });
  //     if (error) {
  //       console.error("Error inserting subscription:", error.message);
  //     } else {
  //       console.log("User subscribed successfully!");
  //     }
  //   } catch (err: any) {
  //     console.error("Failed to subscribe:", err.message);
  //   }
  // };





  // const subscribeUser = async () => {
  //   if ("serviceWorker" in navigator) {
  //     try {
  //       let registration = await navigator.serviceWorker.getRegistration();

  //       // Register service worker if not already registered
  //       if (!registration) {
  //         registration = await navigator.serviceWorker.register("/sw.js");
  //       } else if (registration.waiting) {
  //         // Handle waiting service worker
  //         registration.waiting.postMessage({ type: "SKIP_WAITING" });
  //       }

  //       // Check if already subscribed to push notifications
  //       const isSubscribed = await registration.pushManager.getSubscription();
  //       if (isSubscribed) {
  //         console.log("Already subscribed to push notifications.");
  //         return;
  //       }

  //       // Wait for service worker to activate if it's installing or waiting
  //       if (registration.installing || registration.waiting) {
  //         await new Promise<void>((resolve) => {
  //           const stateChangeListener = () => {
  //             if (registration.active) {
  //               resolve();
  //             }
  //           };

  //           if (registration.installing) {
  //             registration.installing.addEventListener("statechange", stateChangeListener);
  //           } else if (registration.waiting) {
  //             registration.waiting.addEventListener("statechange", stateChangeListener);
  //           }
  //         });
  //       }

  //       // Proceed with subscription
  //       await generateSubscribeEndPoint(registration);
  //     } catch (error) {
  //       console.error("Error in service worker registration or subscription:", error);
  //     }
  //   } else {
  //     console.error("Service workers are not supported in this browser.");
  //   }
  // };



  // const showNotification = async () => {
  //   if ("Notification" in window) {
  //     try {
  //       const permission = await Notification.requestPermission();
  //       console.log("permission", permission)
  //       setNotificationStatus(permission);

  //       if (permission === "granted") {
  //         subscribeUser();
  //       } else {
  //         alert("Please enable notifications in your browser settings.");
  //       }
  //     } catch (error) {
  //       console.error("Error requesting notification permission:", error);
  //     }
  //   } else {
  //     console.log("Your browser does not support notifications.");
  //   }
  // };

  // useEffect(()=>{
  //   console.log("shownotification")
  //   showNotification()
  //   console.log("show end")
  // },[])

  const handleRedirect = () => {
    setRedirecting(true);
  };

  if (redirecting) {
    return (
      <div className="h-[60vh] flex justify-center items-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300 pb-24">
      <LandingPageHeader />
      {/* bootom nav bar */}
      <BottomNavbar />
      
      <div className="container mx-auto px-4 py-2">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-24 right-8 z-40"
        >
          {/* add person */}
          <Link href="/AddPerson">
            <button 
              onClick={handleRedirect}
              className="group relative overflow-hidden 
              rounded-full p-4 bg-blue-600 text-white 
              shadow-xl hover:shadow-2xl transition-all duration-300 
              transform hover:scale-105 focus:outline-none 
              focus:ring-4 focus:ring-blue-300"
            >
              <PlusIcon className="w-6 h-6" />
              <span className="sr-only">Add New Person</span>
            </button>
          </Link>
        </motion.div>


{/* table  */}
        <Table />
      </div>
    </div>
  );
};

export default LandingPage;