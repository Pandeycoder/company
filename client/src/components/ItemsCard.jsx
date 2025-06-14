import React, { useState } from "react";

export const ItemCard = ({ item, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const price = parseFloat(item.price) || 0;
  const maxStock = item.stock_quantity ?? 0;

  const formatRupees = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  const increaseQuantity = () => {
    setQuantity((prev) => (prev < maxStock ? prev + 1 : prev));
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const totalPrice = quantity * price;

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">{item.item_name}</h3>
        <p className="text-gray-600 text-sm mb-2">{item.description}</p>
        <p className="text-sm text-blue-600 font-semibold">
          Price per unit: {formatRupees(price)}
        </p>
        <p className="text-sm text-gray-700">In Stock: {maxStock}</p>

        <div className="flex items-center gap-2 mt-3">
          <label className="text-sm font-medium">Quantity:</label>
          <div className="flex items-center border border-gray-300 rounded overflow-hidden">
            <button
              onClick={decreaseQuantity}
              disabled={quantity === 1}
              className={`px-3 py-1 text-lg font-bold ${
                quantity === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
              aria-label="Decrease quantity"
            >
              –
            </button>
            <input
              type="text"
              readOnly
              value={quantity}
              className="w-12 text-center border-l border-r border-gray-300"
            />
            <button
              onClick={increaseQuantity}
              disabled={quantity === maxStock}
              className={`px-3 py-1 text-lg font-bold ${
                quantity === maxStock
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {quantity > maxStock && (
          <p className="text-red-600 text-sm mt-1">
            ❌ Quantity exceeds available stock!
          </p>
        )}

        <p className="text-sm font-medium mt-2 text-green-700">
          Total: <span className="font-semibold">{formatRupees(totalPrice)}</span>
        </p>

        <button
          onClick={() => {
            if (quantity <= maxStock) {
              onAddToCart?.({ ...item, quantity });
            }
          }}
          disabled={quantity > maxStock || maxStock === 0}
          className={`mt-4 w-full px-4 py-2 rounded transition-colors duration-200
            ${
              quantity > maxStock || maxStock === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
        >
          {maxStock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};
