import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, CreditCard, Wallet, ChevronDown, ChevronUp } from "lucide-react";
import { Router } from "next/router";
import Link from "next/link";

interface Transaction {
  paymentDate: string;
  mode: "upi" | "cash";
  validUntil: string;
  amount: number;
  invoiceUrl: string;
}

const TransactionHistory: React.FC<{ allTransactions?: Transaction[] }> = ({ allTransactions = [] }) => {
  const [showAll, setShowAll] = useState(false);

  const displayedTransactions = showAll ? allTransactions : allTransactions?.slice(0, 3);

  const handleDownload = (transactionIndex: number) => {
    console.log(`Downloading invoice for transaction at index: ${transactionIndex}`);
  };

  return (
    <Card className="transform transition-all duration-300 hover:shadow-xl hover:shadow-purple-100">
      <CardHeader>
        <CardTitle className="text-gradient">Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedTransactions?.map((transaction, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 transition-all duration-300 hover:shadow-md group"
            >
              <div className="flex items-center gap-4">
                {transaction.mode === "upi" ? (
                  <CreditCard className="w-5 h-5 text-purple-600" />
                ) : (
                  <Wallet className="w-5 h-5 text-green-600" />
                )}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900">
                    Paid on {new Date(transaction.paymentDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-600">
                    Valid until {new Date(transaction.validUntil).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-600">₹{transaction.amount}</span>
                <Link href={transaction.invoiceUrl} target="_blank">
                <button
                  onClick={() => handleDownload(index)}
                  className="p-2 rounded-full hover:bg-white transition-colors duration-300 group-hover:text-blue-600"
                  title="Download Invoice"
                >
                  <Download className="w-4 h-4" />
                </button></Link>
              </div>
            </div>
          ))}

          {allTransactions?.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full py-2 px-4 mt-4 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-300 flex items-center justify-center gap-2"
            >
              {showAll ? (
                <>
                  Show Less <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  View All Transactions <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
