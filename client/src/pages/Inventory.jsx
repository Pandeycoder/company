import React from "react";
import InventoryCard from "../components/InventoryCard"; // Adjust the path if needed

export default function Inventory() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-10 text-center">Inventory Management</h1>
      <InventoryCard />
    </div>
  );
}
