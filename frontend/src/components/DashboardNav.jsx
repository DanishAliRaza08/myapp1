import React from 'react';
import { NavLink } from 'react-router-dom';

const DashboardNav = () => {
    const activeStyle = {
        backgroundColor: '#4a5568', // A darker gray for active link
        color: 'white',
    };

    return (
        <div className="w-64 bg-gray-800 text-white p-4">
            <h1 className="text-2xl font-bold mb-6">MyApp</h1>
            <nav>
                <NavLink to="/dashboard/chat"
                    style={({ isActive }) => isActive ? activeStyle : undefined}
                    className="block py-2 px-4 rounded hover:bg-gray-700"
                >
                    Chat
                </NavLink>
                <NavLink to="/dashboard/projects"
                    style={({ isActive }) => isActive ? activeStyle : undefined}
                    className="block py-2 px-4 rounded hover:bg-gray-700 mt-2"
                >
                    Projects
                </NavLink>
            </nav>
        </div>
    );
};

export default DashboardNav;