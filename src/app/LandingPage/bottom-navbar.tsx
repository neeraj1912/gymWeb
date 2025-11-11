"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Home, Users, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { usePathname, useRouter } from "next/navigation";

const BottomNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<null | any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    checkUser();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error logging out:", error.message);
        return;
      }
      
      // Clear user state and redirect to login
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error("Unexpected error during logout:", err);
    }
  };

  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: Home,
      onClick: undefined
    },
    {
      name: "NotPaid",
      link: "/notpaid",
      icon: Users,
      onClick: undefined,
    },
    {
      name: "Logout",
      link: "#",
      icon: LogOut,
      onClick: handleLogout
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full z-50">
      <div className="w-full max-w-md mx-auto">
        <div className="px-7 bg-white dark:bg-black shadow-lg rounded-t-2xl">
          <div className="flex">
            {navItems.map((item) => (
              <div key={item.link} className="flex-1 group">
                {item.onClick ? (
                  <button
                    onClick={item.onClick}
                    className={`w-full flex items-end justify-center text-center mx-auto px-4 pt-2 
                    text-gray-400 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 focus:outline-none`}
                  >
                    <span className="block px-1 pt-1 pb-2">
                      <item.icon className="text-2xl pt-1 mb-1 block mx-auto" />
                      <span className="block text-xs pb-1">{item.name}</span>
                    </span>
                  </button>
                ) : (
                  <Link
                    href={item.link}
                    className={`flex items-end justify-center text-center mx-auto px-4 pt-2 w-full
                    ${
                      pathname === item.link
                        ? "text-indigo-500 dark:text-indigo-400 border-b-2 border-indigo-500 dark:border-indigo-400"
                        : "text-gray-400 dark:text-gray-300 border-b-2 border-transparent"
                    }
                    group-hover:text-indigo-500 dark:group-hover:text-indigo-400 
                    group-hover:border-indigo-500 dark:group-hover:border-indigo-400`}
                  >
                    <span className="block px-1 pt-1 pb-2">
                      <item.icon className="text-2xl pt-1 mb-1 block mx-auto" />
                      <span className="block text-xs pb-1">{item.name}</span>
                    </span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomNavbar;
