import React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, CreditCard, Wallet, ChevronDown, ChevronUp } from "lucide-react";

export const WeightProgress: React.FC<{ weightProgress?: any }> = ({
  weightProgress,
}) => {
    const [showAll, setShowAll] = useState(false);
    
    // Filter valid records
  const validRecords = weightProgress?.filter(
    (record: { date: string; weight: string | null | undefined }) =>
      record.weight !== null &&
      record.weight !== undefined &&
      record.weight !== ""
  );
  const displayedWeight = showAll ? validRecords : validRecords?.slice(0, 3);

  return (
    <CardContent>
      <div>
        <div className="space-y-2">
          {displayedWeight?.length === 0 ? (
            <div className="text-center text-gray-500">
              No weight progress available.
            </div>
          ) : (
            displayedWeight.map((record: { date: string; weight: string }) => (
              <div
                key={record.date}
                className="flex justify-between items-center p-2 rounded-lg transition-all duration-300 hover:bg-gray-50"
              >
                <span className="text-sm text-purple-600">{record.date}</span>
                <span className="font-medium text-blue-600">
                  {record.weight} kg
                </span>
              </div>
            ))
          )}
        </div>
        {validRecords?.length > 3 && (
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
                  View All weight <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          )}
      </div>
    </CardContent>
  );
};
