import React, { useState } from "react";

const inventoryCategories = [
  "Electronics",
  "Furniture",
  "Apparel",
  "Food",
  "Accessories",
];

export const CategoryFilter= ({ onChange }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);

  const toggleCategory = (category) => {
    let updatedCategories;
    if (selectedCategories.includes(category)) {
      updatedCategories = selectedCategories.filter((c) => c !== category);
    } else {
      updatedCategories = [...selectedCategories, category];
    }
    setSelectedCategories(updatedCategories);
    if (onChange) {
      onChange(updatedCategories);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {inventoryCategories.map((category) => (
        <button
          key={category}
          onClick={() => toggleCategory(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${
              selectedCategories.includes(category)
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};
