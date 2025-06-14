import React from "react";
import { useSelector } from "react-redux";
import { CategoryFilter } from "../components/CategoryFilter";
import Footer from "../components/Footer";

export const Profile = () => {
  const user = useSelector((state) => state.user);
  const subscribedCategories = useSelector(
    (state) => state.news.subscribedCategories
  );

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <p className="text-gray-600">
              Username: {user.username || "Not logged in"}
            </p>
            <p className="text-gray-600">
              Status:{" "}
              {user.isAuthenticated ? "Authenticated" : "Not authenticated"}
            </p>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Category Subscriptions</h3>
            <CategoryFilter />
            <p className="text-sm text-gray-500 mt-2">
              Currently subscribed to {subscribedCategories.length} categories
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};
