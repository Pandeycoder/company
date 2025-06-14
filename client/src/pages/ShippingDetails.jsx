import React, { useState, useEffect } from "react";
import axios from "axios";

function ShippingDetails() {
  const [formData, setFormData] = useState({
    purchase_id: "",
    shipping_status: "pending",
    tracking_number: "",
    shipped_date: "",
    delivery_date: "",
  });

  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [statusColors] = useState({
    pending: "bg-yellow-100 text-yellow-800",
    shipped: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  });

  // Fetch all shipments on component mount
  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:4000/api/v1/shipping");
      console.log("Fetched shipments:", response.data);
      
      // Handle the response structure based on your API
      const shipmentsData = response.data.result || response.data || [];
      setShipments(Array.isArray(shipmentsData) ? shipmentsData : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching shipments:", err);
      setError("Failed to fetch shipments");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare the payload according to your API structure
      const payload = {
        purchase_id: parseInt(formData.purchase_id),
        shipping_status: formData.shipping_status,
        tracking_number: formData.tracking_number,
        shipped_date: formData.shipped_date || new Date().toISOString().split('T')[0],
        delivery_date: formData.delivery_date,
      };

      console.log("Submitting payload:", payload);

      const response = await axios.post("http://localhost:4000/api/v1/shipping", payload);
      console.log("Shipping created:", response.data);

      // Refresh the shipments list
      await fetchShipments();

      // Reset form
      setFormData({
        purchase_id: "",
        shipping_status: "pending",
        tracking_number: "",
        shipped_date: "",
        delivery_date: "",
      });

      setError(null);
      alert("Shipping record created successfully!");
    } catch (error) {
      console.error("Error creating shipment:", error);
      setError(error.response?.data?.message || "Failed to create shipping record");
    } finally {
      setLoading(false);
    }
  };

  const updateShippingStatus = async (shipmentId, newStatus) => {
    try {
      // You might need to implement a PUT/PATCH endpoint for status updates
      // For now, this updates the local state
      setShipments((prev) =>
        prev.map((shipment) =>
          shipment.id === shipmentId 
            ? { ...shipment, shipping_status: newStatus } 
            : shipment
        )
      );
      
      // If you have an update endpoint, uncomment and modify this:
      // await axios.put(`http://localhost:4000/api/v1/shipping/${shipmentId}`, {
      //   shipping_status: newStatus
      // });
      
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Failed to update shipping status");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Shipping Management</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Create New Shipping Record Form */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Shipping Record</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Purchase ID *</label>
              <input
                type="number"
                name="purchase_id"
                value={formData.purchase_id}
                onChange={handleChange}
                placeholder="Enter Purchase ID"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Shipping Status</label>
              <select
                name="shipping_status"
                value={formData.shipping_status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tracking Number</label>
              <input
                type="text"
                name="tracking_number"
                value={formData.tracking_number}
                onChange={handleChange}
                placeholder="Enter tracking number"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Shipped Date</label>
              <input
                type="date"
                name="shipped_date"
                value={formData.shipped_date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Expected Delivery Date</label>
              <input
                type="date"
                name="delivery_date"
                value={formData.delivery_date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded font-medium transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loading ? "Creating..." : "Create Shipping Record"}
          </button>
        </form>
      </div>

      {/* Shipments List */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">All Shipments</h2>
          <button
            onClick={fetchShipments}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {loading && <p className="text-center py-4">Loading shipments...</p>}
        
        {!loading && shipments.length === 0 && (
          <p className="text-center py-8 text-gray-500">No shipments found.</p>
        )}

        <div className="space-y-4">
          {shipments.map((shipment) => (
            <div
              key={shipment.id}
              className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition"
            >
              <div className="grid md:grid-cols-3 gap-6">
                {/* Basic Info */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Shipment #{shipment.id}</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Purchase ID:</strong> {shipment.purchase_id}</p>
                    <p><strong>Customer ID:</strong> {shipment.customer_id}</p>
                    <p><strong>Customer:</strong> {shipment.customer_name}</p>
                    <p><strong>Email:</strong> {shipment.email}</p>
                    <p><strong>Phone:</strong> {shipment.phone}</p>
                  </div>
                </div>

                {/* Shipping Details */}
                <div>
                  <h4 className="font-medium mb-2">Shipping Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Tracking:</strong> {shipment.tracking_number || "Not assigned"}</p>
                    <p><strong>Shipped:</strong> {formatDate(shipment.shipped_date)}</p>
                    <p><strong>Delivery:</strong> {formatDate(shipment.delivery_date)}</p>
                    <p><strong>Created:</strong> {formatDate(shipment.created_at)}</p>
                    <p><strong>Total Amount:</strong> ₹{shipment.total_amount}</p>
                  </div>
                </div>

                {/* Address & Status */}
                <div>
                  <h4 className="font-medium mb-2">Address & Status</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Address:</strong></p>
                    <p className="text-gray-600 bg-gray-50 p-2 rounded">
                      {shipment.address || "Address not provided"}
                    </p>
                    
                    <div className="pt-2">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          statusColors[shipment.shipping_status?.toLowerCase()] || 
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {shipment.shipping_status?.toUpperCase() || "UNKNOWN"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                <span className="text-sm font-medium mr-2">Update Status:</span>
                {["pending", "shipped", "delivered", "failed"].map((status) => (
                  <button
                    key={status}
                    onClick={() => updateShippingStatus(shipment.id, status)}
                    className={`px-3 py-1 rounded text-xs font-medium transition ${
                      shipment.shipping_status === status
                        ? "bg-gray-400 cursor-not-allowed"
                        : status === "pending"
                        ? "bg-yellow-200 hover:bg-yellow-300 text-yellow-800"
                        : status === "shipped"
                        ? "bg-blue-200 hover:bg-blue-300 text-blue-800"
                        : status === "delivered"
                        ? "bg-green-200 hover:bg-green-300 text-green-800"
                        : "bg-red-200 hover:bg-red-300 text-red-800"
                    }`}
                    disabled={shipment.shipping_status === status}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ShippingDetails;