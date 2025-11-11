"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "../../utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => (
  <span
    className={`px-3 py-1 rounded-full text-xs font-semibold 
    ${status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
  >
    {status ? "Paid" : "Unpaid"}
  </span>
);

const Table = () => {
  const supabase = createClient();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [redirecting, setRedirecting] = useState<boolean>(false);

  const handleRedirect = () => {
    setRedirecting(true);
  };

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

  const updateMembershipStatus = async (
    userId: string,
    remainingDays: number
  ) => {
    if (remainingDays <= 0) {
      try {
        const { error } = await supabase
          .from("personList")
          .update({ feesstatus: false })
          .eq("id", userId);

        if (error) {
          console.error("Error updating membership status:", error);
        }
      } catch (err) {
        console.error("Error in updateMembershipStatus:", err);
      }
    }
    // else if (remainingDays > 0) {
    //   try {
    //     const { error } = await supabase
    //       .from("personList")
    //       .update({ feesstatus: true })
    //       .eq("id", userId);

    //     if (error) {
    //       console.error("Error updating membership status:", error);
    //     }
    //   } catch (err) {
    //     console.error("Error in updateMembershipStatus:", err);
    //   }
    // }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
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

            // Update status if membership expired
            await updateMembershipStatus(row.id, remainingDays);

            // Add remainingDays and endDate to row data
            row.remainingDays = remainingDays;
            row.membershipEndDate = endDate;

            // Handle image processing
            try {
              if (row.imagePath) {
                const { data: imageData, error: imageError } =
                  await supabase.storage.from("gymweb").download(row.imagePath);

                if (imageError) {
                  console.error(
                    `Error fetching image for ${row.id}:`,
                    imageError
                  );
                  row.imageUrl = "";
                } else {
                  const imageUrl = URL.createObjectURL(imageData);
                  row.imageUrl = imageUrl;
                }
              } else {
                row.imageUrl = "";
              }
            } catch (innerError) {
              console.error(`Error processing row ${row.id}:`, innerError);
              row.imageUrl = "";
            }

            return row;
          })
        );

        const sortedData = updatedData.sort((a, b) => {
          if (a.feesstatus === b.feesstatus) {
            // If status is the same, sort by name
            return a.fullName.localeCompare(b.fullName);
          }
          // Put unpaid (false) before paid (true)
          return a.feesstatus ? 1 : -1;
        });
        console.log("data", updatedData);
        setData(updatedData);
        setFilteredData(sortedData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);

    const filtered = data.filter((row) =>
      row.fullName.toLowerCase().includes(searchValue)
    );
    setFilteredData(filtered);
  };

  if (loading || redirecting) {
    return (
      <div className="h-[60vh] flex justify-center items-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black shadow-lg rounded-lg overflow-hidden">
      <div className="p-4 bg-gray-50 dark:bg-zinc-900">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-400 dark:text-gray-300" />
          </div>
          <input
            type="search"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search Members"
            className="w-full pl-10 pr-4 py-2 rounded-lg 
            border border-gray-300 dark:border-zinc-700 
            bg-white dark:bg-black 
            text-gray-900 dark:text-white 
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
            transition-colors duration-300"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-zinc-900">
            <tr>
              {[
                "Sr No.",
                "Image",
                "Name",
                "Date of Join",
                "Fees",
                "Plan",
                "Status",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className={`${header=="Sr No."?"":"text-left px-4"} py-3  text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredData.length > 0 ? (
                filteredData.map((row, index) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <td className="px-2 py-4 text-center text-gray-500 dark:text-gray-300">
                      {row.serialNumber?row.serialNumber:"00"}
                    </td>
                    <td className="px-4 py-4">
                      {row.imageUrl ? (
                        <img
                          src={row.imageUrl}
                          alt={row.fullName}
                          className={cn(
                            "w-10 h-10 rounded-full object-cover border-2",
                            row.feesstatus
                              ? "border-green-600"
                              : "border-red-600"
                          )}
                        />
                      ) : (
                        <div
                          className={cn(
                            "w-10 h-10 bg-gray-200 dark:bg-zinc-800 rounded-full border-2",
                            row.feesstatus
                              ? "border-green-600"
                              : "border-red-600"
                          )}
                        ></div>
                      )}
                    </td>

                    <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">
                      <Link
                        href={`/aboutPerson?${new URLSearchParams({
                          ...row,
                          wp: JSON.stringify(row.wp),
                          transaction: JSON.stringify(row.transaction),
                        }).toString()}`}
                      >
                        <span onClick={handleRedirect}>{row.fullName}</span>
                      </Link>
                    </td>

                    <td className="px-4 py-4 text-gray-500 dark:text-gray-300">
                      {new Date(row.doj).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-4 font-semibold text-gray-700 dark:text-gray-200">
                      {row.totalfees}
                    </td>
                    <td className="px-4 py-4 text-gray-500 dark:text-gray-300">
                      {row.plan}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={row.feesstatus} />
                    </td>

                    <td className="px-4 py-4">
                      <Link
                        href={`/editpersoninfo?${new URLSearchParams({
                          ...row,
                          wp: JSON.stringify(row.wp),
                          transaction: JSON.stringify(row.transaction),
                        }).toString()}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600 transition-colors"
                      >
                        <span onClick={handleRedirect}>Edit</span>
                      </Link>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                  >
                    No members found
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
