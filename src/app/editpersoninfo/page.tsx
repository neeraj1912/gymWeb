"use client";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Edit, Plus, Minus, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// import { Select } from "@/components/ui/select";
import { createClient } from "../../utils/supabase/client";
import Loader from "./../../components/ui/Loader";
import { useRouter } from "next/navigation";
import LandingPageHeader from "../LandingPage/header";
import BottomNavbar from "../LandingPage/bottom-navbar";
import { generateAndUploadInvoice } from "../../components/invoicegenerator";

interface InvoiceData {
  customerName: string;
  mobileNumber: string;
  amount: number;
  paymentMode: "cash" | "upi";
  planDuration: string;
  validFrom: string;
  validUntil: string;
  invoiceNumber: string;
}
// Interface for form data
interface FormData {
  fullName: string | null;
  mobileNumber: string | null;
  membershipPlan: number;
  wp: { weight: string; date: string }[];
  transaction?: {
    paymentDate: string;
    mode: "cash" | "upi";
    validUntil: string;
    amount: number;
    invoiceUrl: string;
  }[];
  serialNumber:number;
}

// Interface for edit states
interface EditStates {
  fullName: boolean;
  mobileNumber: boolean;
  wp: boolean;
  membershipPlan: boolean;
  serialNumber:boolean;
}

// Type for form field keys
type FormField = keyof FormData;

const EditProfilePage: React.FC = () => {
  const [isloading, setIsLoading] = useState(false);
  const [weightProgress, setWeightProgress] = useState("");
  const [totalFees, setTotalFees] = useState("");
  const [paymentMode, setPaymentMode] = useState<"cash" | "upi">("cash");
  const supabase = createClient();
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    mobileNumber: "",
    membershipPlan: 0,
    wp: [],
    transaction: [],
    serialNumber:0
  });

  const [editStates, setEditStates] = useState<EditStates>({
    fullName: false,
    mobileNumber: false,
    wp: false,
    membershipPlan: true,
    serialNumber:false
  });
  
  type FormField = keyof EditStates;

  const handleToggle = (field: FormField): void => {
    setEditStates((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const updateWeight = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setWeightProgress(value);
  };
  const handleChange = (field: FormField, value: string | number): void => {
    setFormData((prev) => {
      const updatedFormData = { ...prev, [field]: value };
      return updatedFormData;
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const dojString = param?.get("doj");
      const doj = dojString ? new Date(dojString) : new Date();

      // Calculate plan expiry date
      const expiryDate = new Date(doj);
      expiryDate.setMonth(expiryDate.getMonth() + formData.membershipPlan);

      // Check if plan is increased

      const isPlanIncreased = formData.membershipPlan > plan;

      // Create new transaction if plan is increased
      let newTransaction;
      if (isPlanIncreased && totalFees) {
        const validFromTemp = new Date(doj);
        validFromTemp.setMonth(validFromTemp.getMonth() + plan)
        const invoiceData: InvoiceData = {
          customerName: formData.fullName?.toString() ?? "",
          mobileNumber: (formData.mobileNumber)?.toString() ?? "",
          amount: Number(totalFees),
          paymentMode,
          planDuration: (formData.membershipPlan - plan).toString(),
          validFrom: validFromTemp.toISOString().split("T")[0],
          validUntil: expiryDate.toISOString().split("T")[0],
          invoiceNumber: `INV-${Date.now()}-${Math.floor(
            Math.random() * 1000
          )}`,
        };
        console.log(invoiceData, "this is data");

        const invoiceUrl = await generateAndUploadInvoice(invoiceData);
        newTransaction = {
          paymentDate: new Date().toISOString().split("T")[0],
          mode: paymentMode,
          validUntil: expiryDate.toISOString().split("T")[0],
          amount: Number(totalFees),
          invoiceUrl,
        };
      }

      // Prepare update object
      const updateData: any = {
        serialNumber: formData.serialNumber,
        fullName: formData.fullName,
        mobileNumber: formData.mobileNumber,
        wp:
          formData.wp.length < 7
            ? // Check if weightProgress is the same as the last weight, only update if different
              [
                ...formData.wp,
                ...(formData.wp.length === 0 || formData.wp[formData.wp.length - 1].weight !== weightProgress
                  ? [
                      {
                        weight: weightProgress,
                        date: new Date().toLocaleDateString("en-CA"),
                      },
                    ]
                  : []),
              ]
            : [
                ...formData.wp.slice(1),
                ...(formData.wp[formData.wp.length - 1].weight !== weightProgress
                  ? [
                      {
                        weight: weightProgress,
                        date: new Date().toLocaleDateString("en-CA"),
                      },
                    ]
                  : []),
              ],
        plan: `${formData.membershipPlan} Month`,

      };
      

      // Add new transaction if plan is increased
      if (newTransaction) {
        updateData.transaction = [
          ...(formData.transaction || []),
          newTransaction,
        ];
      }
      const isPlanModified = formData.membershipPlan !== plan;
      const isActivePlan = expiryDate > new Date();
      if (isPlanModified && isActivePlan) {
        updateData.feesstatus = true;
      }

      const { data, error } = await supabase
        .from("personList")
        .update(updateData)
        .eq("id", param?.get("id"));

      if (error) {
        console.error("Error updating data:", error.message);
      } else {
        router.push("/");
      }
    } catch (err) {
      if (err instanceof Error) console.log(err.message);
      else console.log("An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: FormField
  ): void => {
    const value = e.target.value;
    handleChange(field, value);
  };

  const [param, setParam] = useState<URLSearchParams | null>(null);
  const [plan, setPlan] = useState(0);

  useEffect(() => {
    const url = window.location.href;
    const urlObj = new URL(url);
    const param = new URLSearchParams(urlObj.search);
    setParam(param);
    setFormData((prev) => ({
      ...prev,
      fullName: param.get("fullName"),
      mobileNumber: param.get("mobileNumber"),
      wp: JSON.parse(param.get("wp") ?? "[]"),
      membershipPlan: Number(param.get("plan")?.split(" ")[0]) ?? 0,
      transaction: JSON.parse(param.get("transaction") ?? "[]"),
      serialNumber:param.get("serialNumber")=="null"?0:Number(param.get("serialNumber"))
    }));
    let parsingData = JSON.parse(param.get("wp") ?? "[]");
    if (parsingData.length == 0) {
      setWeightProgress("");
    } else {
      setWeightProgress(parsingData[parsingData.length - 1].weight);
    }
    setPlan(Number(param.get("plan")?.split(" ")[0]));
  }, []);

  return isloading ? (
    <div className="w-full flex justify-center h-screen items-center">
      <Loader />
    </div>
  ) : (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pb-24">
      <LandingPageHeader />
      <BottomNavbar />
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 p-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Edit Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* serial number */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Serial Number</label>
                  <div className="flex items-center gap-2">
                    <Edit className="w-4 h-4 text-gray-500" />
                    <Switch
                      checked={editStates.serialNumber}
                      onCheckedChange={() => handleToggle("serialNumber")}
                    />
                  </div>
                </div>
                <Input
                  type="number"
                  value={formData.serialNumber ?? 0}
                  onChange={(e) => handleInputChange(e, "serialNumber")}
                  disabled={!editStates.serialNumber}
                  className="transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Full name feild */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Full Name</label>
                  <div className="flex items-center gap-2">
                    <Edit className="w-4 h-4 text-gray-500" />
                    <Switch
                      checked={editStates.fullName}
                      onCheckedChange={() => handleToggle("fullName")}
                    />
                  </div>
                </div>
                <Input
                  type="text"
                  value={formData.fullName ?? ""}
                  onChange={(e) => handleInputChange(e, "fullName")}
                  disabled={!editStates.fullName}
                  className="transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Mobile Number Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Mobile Number</label>
                  <div className="flex items-center gap-2">
                    <Edit className="w-4 h-4 text-gray-500" />
                    <Switch
                      checked={editStates.mobileNumber}
                      onCheckedChange={() => handleToggle("mobileNumber")}
                    />
                  </div>
                </div>
                <Input
                  type="tel"
                  value={formData.mobileNumber ?? ""}
                  onChange={(e) => handleInputChange(e, "mobileNumber")}
                  disabled={!editStates.mobileNumber}
                  className="transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Weight Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Weight (kg)</label>
                  <div className="flex items-center gap-2">
                    <Edit className="w-4 h-4 text-gray-500" />
                    <Switch
                      checked={editStates.wp}
                      onCheckedChange={() => handleToggle("wp")}
                    />
                  </div>
                </div>
                <Input
                  type="string"
                  value={weightProgress}
                  onChange={(e) => updateWeight(e)}
                  disabled={!editStates.wp}
                  className="transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Membership Plan Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Membership Plan</label>
                  <div className="flex items-center gap-2">
                    <Edit className="w-4 h-4 text-gray-500" />
                    <Switch
                      checked={editStates.membershipPlan}
                      onCheckedChange={() => handleToggle("membershipPlan")}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={
                      formData.membershipPlan <= plan ||
                      !editStates.membershipPlan
                    }
                    onClick={() =>
                      handleChange(
                        "membershipPlan",
                        Math.max(1, formData.membershipPlan - 1)
                      )
                    }
                    className={`transition-transform hover:scale-105`}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={formData.membershipPlan ?? ""}
                    readOnly
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={!editStates.membershipPlan}
                    onClick={() =>
                      handleChange(
                        "membershipPlan",
                        formData.membershipPlan + 1
                      )
                    }
                    className="transition-transform hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Show payment fields only when plan is increased */}
              {formData.membershipPlan > plan && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total Fees</label>
                    <Input
                      type="number"
                      value={totalFees}
                      onChange={(e) => setTotalFees(e.target.value)}
                      className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 dark:text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Payment Mode</label>
                    <select
                      value={paymentMode}
                      onChange={(e) =>
                        setPaymentMode(e.target.value as "cash" | "upi")
                      }
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    >
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                    </select>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full transition-transform hover:scale-105 bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfilePage;
