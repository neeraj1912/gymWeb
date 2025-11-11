"use client";
import React, { useEffect, useState } from "react";
import {
  Calendar,
  Phone,
  Clock,
  Trophy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client";
import { Trash2, Loader } from "lucide-react";
import BottomNavbar from "../LandingPage/bottom-navbar";
import LandingPageHeader from "../LandingPage/header";
import TransactionHistory from "./Transactionhistory";
import { WeightProgress } from "./WeightProgress";

// Types and Interfaces
type Gender = "male" | "female" | "other";

interface WeightRecord {
  date: string;
  weight: number;
}

interface PaymentRecord {
  dueDate: string;
  status: "paid" | "unpaid";
}

interface WeightData {
  current: number;
  goal: number;
  history: WeightRecord[];
}

interface MembershipData {
  type: string;
  payments: PaymentRecord[];
}

interface UserData {
  name: string;
  image: string;
  email: string;
  phone: string;
  address: string;
  joinDate: string;
  gender: Gender;
  weight: WeightData;
  membership: MembershipData;
}

interface PaymentHistoryItem {
  dueDate: Date;
  status: "paid" | "unpaid";
}

const aboutPerson: React.FC = () => {
  // Sample user data with proper typing
  const [param, setParam] = useState<URLSearchParams | null>(null);
  const router = useRouter();
  const user: UserData = {
    name: "John Smith",
    image: "",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Fitness Street, Gym City",
    joinDate: "2024-01-15",
    gender: "female", // New gender field
    weight: {
      current: 75,
      goal: 70,
      history: [
        { date: "2024-01-15", weight: 80 },
        { date: "2024-02-15", weight: 78 },
        { date: "2024-03-15", weight: 75 },
      ],
    },
    membership: {
      type: "Premium",
      payments: [
        { dueDate: "2024-01-15", status: "paid" },
        { dueDate: "2024-02-15", status: "paid" },
        { dueDate: "2024-03-15", status: "unpaid" },
      ],
    },
  };
  const supabase = createClient();

  // Function to get gender-specific gradient
  const getGenderGradient = (gender: Gender): string => {
    switch (gender) {
      case "male":
        return "from-blue-600 to-blue-400";
      case "female":
        return "from-pink-600 to-pink-400";
      default:
        return "from-purple-600 to-purple-400";
    }
  };

  const generatePaymentHistory = (joinDate: string): PaymentHistoryItem[] => {
    const startDate = new Date(joinDate);
    const currentDate = new Date();
    const payments: PaymentHistoryItem[] = [];
    let currentMonth = new Date(startDate);

    while (currentMonth <= currentDate) {
      const paymentRecord = user.membership.payments.find(
        (payment) =>
          new Date(payment.dueDate).getMonth() === currentMonth.getMonth() &&
          new Date(payment.dueDate).getFullYear() === currentMonth.getFullYear()
      );

      payments.push({
        dueDate: new Date(currentMonth),
        status: paymentRecord ? paymentRecord.status : "unpaid",
      });

      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    return payments;
  };

  const paymentHistory = generatePaymentHistory(user.joinDate);

  // Type or contact items
  interface ContactItem {
    icon: React.ReactNode;
    value: string | null;
  }

  // Contact items array with proper typing
  const contactItems: ContactItem[] = [
    {
      icon: <Phone className="w-4 h-4" />,
      value: param?.get("mobileNumber") ?? "",
    },
  ];
  const [loading, setLoading] = useState(false); // Loading state

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("personList")
        .delete()
        .eq("id", param?.get("id"));

      if (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user. Please try again.");
      } else {
        console.log("User deleted successfully.");
        router.push("/");
      }
    } catch (err) {
      console.error("Error in handleDelete:", err);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const url = window.location.href;
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    setParam(params);
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 transition-colors duration-300 pb-24">
     
      <LandingPageHeader />
      <BottomNavbar />
      <div className="max-w-4xl mx-auto p-6 space-y-6 mt-5">
        {/* Header Profile Section */}
        <div className="flex flex-col md:flex-row gap-6 items-start animate-fadeIn">
          <div className="w-full md:w-1/3">
            <Card className="overflow-hidden transition-transform duration-300 hover:scale-105">
              <CardContent className="pt-6">
                <div
                  className={`aspect-square rounded-full overflow-hidden mb-4 border-4 transform hover:rotate-6 transition-transform duration-300 border-${
                    user.gender === "male" ? "blue" : "pink"
                  }-500`}
                >
                  <img
                    src={
                      param?.get("imageUrl") ??
                      "https://imgs.search.brave.com/K7oZwf4IcDRWgZfuev8d5FGoPmysINSmEAvpHtBL3Eo/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMudW5zcGxhc2gu/Y29tL3Bob3RvLTE1/ODI3Mzg0MTE3MDYt/YmZjOGU2OTFkMWMy/P2ZtPWpwZyZxPTYw/Jnc9MzAwMCZpeGxp/Yj1yYi00LjAuMyZp/eGlkPU0zd3hNakEz/ZkRCOE1IeGxlSEJz/YjNKbExXWmxaV1I4/TVRoOGZIeGxibnd3/Zkh4OGZIdz0.jpeg"
                    }
                    alt={
                      param?.get("imageUrl") ??
                      "https://imgs.search.brave.com/K7oZwf4IcDRWgZfuev8d5FGoPmysINSmEAvpHtBL3Eo/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMudW5zcGxhc2gu/Y29tL3Bob3RvLTE1/ODI3Mzg0MTE3MDYt/YmZjOGU2OTFkMWMy/P2ZtPWpwZyZxPTYw/Jnc9MzAwMCZpeGxp/Yj1yYi00LjAuMyZp/eGlkPU0zd3hNakEz/ZkRCOE1IeGxlSEJz/YjNKbExXWmxaV1I4/TVRoOGZIeGxibnd3/Zkh4OGZIdz0.jpeg"
                    }
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h2
                  className={`text-2xl font-bold text-center mb-2 bg-blue-700 ${getGenderGradient(
                    user.gender
                  )} bg-clip-text text-transparent`}
                >
                  {param?.get("fullName") ?? "anonymous"}
                </h2>
                <div className="flex justify-center gap-2 text-sm">
                  <Trophy
                    className={`w-4 h-4 ${
                      user.gender === "male" ? "text-blue-700" : "text-blue-700"
                    } animate-pulse`}
                  />
                  <span
                    className={`${
                      user.gender === "male" ? "text-blue-700" : "text-blue-700"
                    } font-medium`}
                  >
                    {param?.get("plan")} Member
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="w-full md:w-2/3 space-y-6">
            {/* Contact Information */}
            <Card className="transform transition-all duration-300 hover:shadow-xl hover:shadow-purple-100">
              <CardHeader>
                <CardTitle className="text-blue-700">
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactItems.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r ${
                      index === 0
                        ? user.gender === "male"
                          ? "hover:from-blue-50 hover:to-blue-100"
                          : "hover:from-pink-50 hover:to-pink-100"
                        : "hover:from-purple-50 hover:to-blue-50"
                    } group`}
                  >
                    <span
                      className={`transition-colors duration-300 ${
                        index === 0
                          ? user.gender === "male"
                            ? "text-blue-500 group-hover:text-blue-600"
                            : "text-pink-500 group-hover:text-pink-600"
                          : "text-purple-500 group-hover:text-purple-600"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="group-hover:text-purple-700 transition-colors duration-300">
                      {item.value}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="transform transition-all duration-300 hover:shadow-xl hover:shadow-purple-100">
              <CardHeader>
                <CardTitle className="text-gradient">Weight Progress</CardTitle>
              </CardHeader>
                <WeightProgress weightProgress={JSON.parse(param?.get("wp") ?? "[]") }></WeightProgress>
            </Card>
          </div>
        </div>

        <Card className="transform transition-all duration-300 hover:shadow-xl hover:shadow-purple-100">
          <CardHeader>
            <CardTitle className="text-gradient">Remaining Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* remaining date */}
              <div
                className={`p-4 rounded-lg border transition-all duration-300 transform hover:scale-105 hover:shadow-lg
                ${
                  Number(param?.get("remainingDays")) >= 0
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:shadow-green-100"
                    : "bg-gradient-to-r from-red-50 to-red-50 border-red-200 hover:shadow-red-100"
                }  `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div
                      className={`text-sm ${
                        Number(param?.get("remainingDays")) >= 0
                          ? "text-gray-600"
                          : "text-red-900"
                      }`}
                    >
                      {param?.get("remainingDays")}
                    </div>
                    <div
                      className={`font-medium ${
                        Number(param?.get("remainingDays")) >= 0
                          ? "text-emerald-600"
                          : "text-red-800"
                      }`}
                    >
                      days remain
                    </div>
                  </div>
                  <Calendar
                    className={`w-5 h-5 transition-transform duration-300 hover:scale-110 ${
                      Number(param?.get("remainingDays")) >= 0
                        ? "text-emerald-500"
                        : "text-red-800"
                    }`}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div>
          <TransactionHistory
            allTransactions={JSON.parse(param?.get("transaction") ?? "[]") }
          />
        </div>
        {/* Join Date */}
        <div className="flex items-center justify-center gap-2 p-4 rounded-full bg-gradient-to-r from-purple-50 to-blue-50 transform transition-all duration-300 hover:shadow-lg hover:scale-105">
          <Clock className="w-4 h-4 text-purple-500" />
          <span className="text-purple-700 font-medium">
            Member since{" "}
            {new Date(
              param?.get("doj") ?? "no information found"
            ).toLocaleDateString("en-GB")}
          </span>
        </div>
        <div className="flex items-center justify-center gap-2 p-4 rounded-full bg-gradient-to-r from-purple-50 to-blue-50 transform transition-all duration-300 hover:shadow-lg hover:scale-105">
          <Clock className="w-4 h-4 text-red-500" />
          <span className="text-red-700 font-medium">
            Membership End{" "}
            {param?.get("membershipEndDate") ?? "no information found"}
          </span>
        </div>
        <style jsx global>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fadeIn {
            animation: fadeIn 0.8s ease-out;
          }

          .text-gradient {
            background: linear-gradient(to right, #8b5cf6, #3b82f6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        `}</style>
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  disabled={loading}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the member's account and remove their data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default aboutPerson;
