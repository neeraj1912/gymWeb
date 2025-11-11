"use client";

import React from "react";
import Image from "next/image";
import { Dumbbell, Bell, UserCircle } from "lucide-react";
import { motion } from "framer-motion";
import logo from "../../../public/asseet/landingpage/gymcirclelogo.png";
import Link from "next/link";
import { ModeToggle } from "@/components/themetoggle";

const LandingPageHeader = () => {
  return (
    <div className="bg-white dark:bg-black shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo and Name */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center space-x-3"
        >
          <div className="h-10 w-10">
            <Image className="h-full w-full" src={logo} alt="SR Fitness logo" />
          </div>
          <div className="pl-5">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              SR Fitness
            </h1>
          </div>
        </motion.div>

        {/* Action Icons */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          {/* <ModeToggle /> */}
          <Link
          href={"/notification"}
          >
            <button className="relative hover:bg-gray-100 dark:hover:bg-zinc-900 p-2 rounded-full transition-colors">
              <Bell className="w-6 h-6 text-gray-600 dark:text-white" />
              <span className="absolute top-0 right-0 block h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
          </Link>
          <Link
            href="/dashboard"
            className="hover:bg-gray-100 dark:hover:bg-zinc-900 p-2 rounded-full transition-colors"
          >
            <UserCircle className="w-7 h-7 text-gray-600 dark:text-white" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPageHeader;
