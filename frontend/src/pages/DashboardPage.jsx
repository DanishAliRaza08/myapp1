import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardNav from '../components/DashboardNav';
import AnimatedPage from '../components/AnimatedPage'; // Import the wrapper

const DashboardPage = () => {
  return (
    <AnimatedPage>
        <div className="flex h-screen bg-gray-100">
        <DashboardNav />
        <main className="flex-1 overflow-y-auto">
            <Outlet />
        </main>
        </div>
    </AnimatedPage>
  );
};

export default DashboardPage;