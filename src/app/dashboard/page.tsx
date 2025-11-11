import Dashboard from "./dashboard";
import BottomNavbar from "../LandingPage/bottom-navbar";
import LandingPageHeader from "../LandingPage/header";
import { Suspense } from 'react';

export default function Home() {
  return (
    <main>
      <LandingPageHeader />
      <BottomNavbar />
      <Suspense fallback={<div>Loading...</div>}>
        <Dashboard />
      </Suspense>
    </main>
  );
}
