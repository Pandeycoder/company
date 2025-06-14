import React, { useEffect, useState } from "react";
import axios from "axios";
import { ItemCard } from "../components/ItemsCard";

export const Home = () => {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  
  // Address state
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: ""
  });
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/v1/item");
        const itemData = Array.isArray(response.data.result)
          ? response.data.result.flat()
          : [];
        setItems(itemData);
      } catch (err) {
        console.error("Error fetching items:", err);
        setError("Failed to fetch items");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleAddToCart = (itemWithQty) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.item_id === itemWithQty.id);
      if (existing) {
        return prevCart.map((i) =>
          i.item_id === itemWithQty.id
            ? {
                ...i,
                quantity: Math.min(
                  i.quantity + itemWithQty.quantity,
                  itemWithQty.stock_quantity ?? Infinity
                ),
              }
            : i
        );
      } else {
        return [
          ...prevCart,
          {
            item_id: itemWithQty.id,
            quantity: Math.min(itemWithQty.quantity, itemWithQty.stock_quantity ?? Infinity),
            unit_price: parseFloat(itemWithQty.price) || 0,
          },
        ];
      }
    });
  };

  const handleAddressChange = (field, value) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatAddress = (address) => {
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country
    ].filter(part => part.trim() !== "");
    
    return parts.join(", ");
  };

  const isAddressComplete = () => {
    return shippingAddress.street && 
           shippingAddress.city && 
           shippingAddress.state && 
           shippingAddress.zipCode;
  };

  const handlePurchase = async () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    if (!isAddressComplete()) {
      alert("Please complete the shipping address!");
      setShowAddressForm(true);
      return;
    }

    setPurchaseLoading(true);
    try {
      const itemsWithSubtotal = cart.map((item) => ({
        item_id: item.item_id,
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price.toFixed(2)),
        subtotal: parseFloat((item.unit_price * item.quantity).toFixed(2)),
      }));

      const totalAmount = itemsWithSubtotal.reduce(
        (sum, item) => sum + item.subtotal,
        0
      );

      const purchasePayload = {
        purchase: {
          customer_id: 2,
          purchase_date: new Date().toISOString().split("T")[0],
          total_amount: parseFloat(totalAmount.toFixed(2)),
          status: "pending",
          shipping_address: formatAddress(shippingAddress),
        },
        items: itemsWithSubtotal,
      };

      // Step 1: Create the purchase
      const purchaseResponse = await axios.post("http://localhost:4000/api/v1/purchases", purchasePayload);
      console.log("purchase ",purchaseResponse);
      // Extract purchase ID from response
      const purchaseId = purchaseResponse.data?.result.purchaseId || purchaseResponse.data?.purchase?.id || purchaseResponse.data?.result?.id;
     console.log("purchase id", purchaseResponse.data?.result.purchaseId);
      if (purchaseId) {
        // Step 2: Create shipping record automatically
        const today = new Date();

// Define the allowed day gaps
const deliveryDayOptions = [3, 5, 6, 7, 8];

// Pick a random number of days from the list
const randomDays =
  deliveryDayOptions[Math.floor(Math.random() * deliveryDayOptions.length)];

// Calculate delivery date
const deliveryDate = new Date();
deliveryDate.setDate(today.getDate() + randomDays);

// Format both dates as YYYY-MM-DD
const shipped_date = today.toISOString().split("T")[0];
const delivery_date = deliveryDate.toISOString().split("T")[0];

console.log("Shipped Date:", shipped_date);
console.log("Delivery Date:", delivery_date);

        const shippingPayload = {
          purchase_id: purchaseId,
          shipping_status: "pending",
          tracking_number: `TRK${Date.now()}${Math.floor(Math.random() * 1000)}`, // Generate tracking number
          shipped_date: shipped_date,
          delivery_date: delivery_date
        };

        try {
          await axios.post("http://localhost:4000/api/v1/shipping", shippingPayload);
          console.log("✅ Shipping record created successfully");
        } catch (shippingErr) {
          console.warn("⚠️ Purchase successful but shipping record creation failed:", shippingErr);
          // Don't fail the entire purchase if shipping creation fails
        }
      }

      alert(`Purchase successful! Total: ₹${totalAmount.toFixed(2)}${purchaseId ? `\nPurchase ID: ${purchaseId}` : ""}`);
      setCart([]);
      setShippingAddress({
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: ""
      });
      setShowAddressForm(false);
    } catch (err) {
      console.error("❌ Purchase failed:", err);
      alert("Purchase failed. Check console for details.");
    } finally {
      setPurchaseLoading(false);
    }
  };

  if (loading) return <p className="text-center">Loading items...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.length > 0 ? (
          items.map((item) => (
            <ItemCard key={item.id} item={item} onAddToCart={handleAddToCart} />
          ))
        ) : (
          <p className="col-span-full text-center">No items available</p>
        )}
      </div>

      {cart.length > 0 && (
        <div className="mt-6 p-4 border rounded bg-gray-100">
          <h2 className="text-xl font-bold mb-2">Cart</h2>
          <ul>
            {cart.map((cartItem) => {
              const itemDetails = items.find((i) => i.id === cartItem.item_id);
              return (
                <li key={cartItem.item_id}>
                  {itemDetails?.item_name || `Item ID: ${cartItem.item_id}`}, Qty: {cartItem.quantity}, Unit Price: ₹
                  {cartItem.unit_price.toFixed(2)}, Subtotal: ₹
                  {(cartItem.unit_price * cartItem.quantity).toFixed(2)}
                </li>
              );
            })}
          </ul>
          <p className="mt-2 font-semibold">
            Total: ₹
            {cart
              .reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
              .toFixed(2)}
          </p>

          {/* Address Section */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Shipping Address</h3>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {showAddressForm ? "Hide Form" : "Add/Edit Address"}
              </button>
            </div>

            {isAddressComplete() && (
              <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-800">
                  <strong>Current Address:</strong> {formatAddress(shippingAddress)}
                </p>
              </div>
            )}

            {showAddressForm && (
              <div className="space-y-3 mb-4 p-3 bg-white border rounded">
                <div>
                  <label className="block text-sm font-medium mb-1">Street Address *</label>
                  <input
                    type="text"
                    value={shippingAddress.street}
                    onChange={(e) => handleAddressChange("street", e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter street address"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">City *</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => handleAddressChange("city", e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="City"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">State *</label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => handleAddressChange("state", e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="State"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">ZIP Code *</label>
                    <input
                      type="text"
                      value={shippingAddress.zipCode}
                      onChange={(e) => handleAddressChange("zipCode", e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ZIP Code"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <input
                      type="text"
                      value={shippingAddress.country}
                      onChange={(e) => handleAddressChange("country", e.target.value)}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Country (optional)"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handlePurchase}
            disabled={purchaseLoading || !isAddressComplete()}
            className={`mt-4 w-full px-4 py-2 rounded text-white ${
              purchaseLoading || !isAddressComplete()
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {purchaseLoading 
              ? "Processing Purchase..." 
              : !isAddressComplete() 
                ? "Complete Address to Purchase"
                : "Purchase"
            }
          </button>
        </div>
      )}
    </div>
  );
};