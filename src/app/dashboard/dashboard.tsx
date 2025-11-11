'use client'

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Users, DollarSign, CreditCard, Wallet } from 'lucide-react';
import { getDashboardData } from '@/lib/dashboardQueries';
import Loader from '@/components/ui/Loader';
import Link from 'next/link';

// We'll keep the mock data for the chart for now
// const earningsData = [
//   { month: 'Jan', upi: 4000, cash: 2400 },
//   { month: 'Feb', upi: 3000, cash: 1398 },
//   { month: 'Mar', upi: 2000, cash: 9800 },
//   { month: 'Apr', upi: 2780, cash: 3908 },
//   { month: 'May', upi: 1890, cash: 4800 },
//   { month: 'Jun', upi: 2390, cash: 3800 },
// ];


  interface Transaction {
    personName: string;
    amount: number;
    paymentDate: string;
    mode: string;
  }
  interface SummaryCardProps {
    title: string;
    value: string | number; 
    trend: number; 
    icon: React.ReactNode; 
  }
  interface StatProps {
    label: string; 
    value: string | number;
  }
  interface TransactionProps {
    name: string;    
    amount: number | string; 
    date: string;   
    type: string;   
  }
  interface QuickActionButtonProps {
    label: string; 
  }

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      const data = await getDashboardData();
      setDashboardData(data);
      setIsLoading(false);
    }
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div className='flex justify-center items-center h-screen'>
        <Loader/>
    </div>
  }

  if (!dashboardData) {
    return <div className="p-4 text-center">Error loading dashboard data. Please try again later.</div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-100 dark:bg-zinc-900 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Gym Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          title="Total Earnings"
          value={`₹${dashboardData.totalEarnings.toLocaleString()}`}
          trend={12} // You might want to calculate this based on previous month's data
          icon={<DollarSign className="h-6 w-6 text-purple-600" />}
        />
        <SummaryCard
          title="UPI Payments"
          value={`₹${dashboardData.upiEarnings.toLocaleString()}`}
          trend={8} // You might want to calculate this based on previous month's data
          icon={<CreditCard className="h-6 w-6 text-blue-600" />}
        />
        <SummaryCard
          title="Cash Payments"
          value={`₹${dashboardData.cashEarnings.toLocaleString()}`}
          trend={-3} // You might want to calculate this based on previous month's data
          icon={<Wallet className="h-6 w-6 text-green-600" />}
        />
        <SummaryCard
          title="Active Members"
          value={dashboardData.paidMembers.toString()}
          trend={5} // This represents the percentage change in active members from the previous month.
          icon={<Users className="h-6 w-6 text-indigo-600" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-black p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Monthly Earnings</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.earningsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="upi" fill="#8884d8" name="UPI" />
              <Bar dataKey="cash" fill="#82ca9d" name="Cash" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-black p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Member Statistics</h2>
          <div className="space-y-4">
            <Stat label="Total Members" value={dashboardData.totalMembers.toString()} />
            <Stat label="New Members This Month" value={dashboardData.newMembersThisMonth.toString()} /> {/* You might want to calculate this */}
            <Stat label="Paid Members" value={dashboardData.paidMembers.toString()} /> {/* This represents the number of currently paid members. */}
            <Stat label="Unpaid Members" value={dashboardData.unpaidMembers.toString()} />
          </div>
        </div>
      </div>

      {/* Recent Transactions and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <div className="bg-white dark:bg-black p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <div className="space-y-2">
            {dashboardData.recentTransactions.map((transaction: Transaction , index:number) => (
              <Transaction
                key={index}
                name={transaction.personName}
                amount={transaction.amount}
                date={transaction.paymentDate}
                type={transaction.mode}
              />
            )) }
          </div>
        </div>
        <div className="bg-white dark:bg-black p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/AddPerson"><QuickActionButton label="Add Member" /></Link>
            {/* <Link href="/AddPerson"><QuickActionButton label="Create Invoice" /></Link> */}
            <Link href="#"><QuickActionButton label="Notification" /></Link>
            {/* <QuickActionButton label="Manage Plans" /> */}
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard : React.FC<SummaryCardProps> = ({ title, value, trend, icon }) => (
  <div className="bg-white dark:bg-black p-4 rounded-lg shadow">
    <div className="flex items-center justify-between mb-2">
      <div className="text-sm font-medium text-gray-500 dark:text-white">{title}</div>
      {icon}
    </div>
    <div className="text-2xl font-bold text-gray-800 dark:text-white">{value}</div>
    <div className={`flex items-center text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
      {trend >= 0 ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
      <span>{Math.abs(trend)}% from last month</span>
    </div>
  </div>
);

const Stat: React.FC<StatProps> = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-600 dark:text-white">{label}</span>
    <span className="font-semibold text-gray-800 dark:text-white">{value}</span>
  </div>
);

const Transaction:React.FC<TransactionProps> = ({ name, amount, date, type }) => (
  <div className="flex justify-between items-center py-2 border-b last:border-b-0">
    <div>
      <div className="font-medium text-gray-800 dark:text-white">{name}</div>
      <div className="text-sm text-gray-500 dark:text-white">{date}</div>
    </div>
    <div className="text-right">
      <div className="font-medium text-gray-800 dark:text-white">{amount}</div>
      <div className={`text-sm ${type === 'UPI' ? 'text-purple-600' : 'text-green-600'}`}>{type}</div>
    </div>
  </div>
);

const QuickActionButton:React.FC<QuickActionButtonProps> = ({ label }) => (
  <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-blue-600 transition duration-300 w-full">
    {label}
  </button>
);

export default Dashboard;

