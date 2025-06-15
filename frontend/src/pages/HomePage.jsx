import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedPage from '../components/AnimatedPage'; // Import the wrapper

const HomePage = () => {
    return (
        <AnimatedPage>
            <div className="text-center mt-10">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Welcome to MyApp</h1>
                <p className="mt-4 text-xl text-gray-600">Your all-in-one team collaboration and productivity platform.</p>
                <div className="mt-8">
                    <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg">
                        Get Started
                    </Link>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default HomePage;