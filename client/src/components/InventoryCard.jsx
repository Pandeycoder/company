import React, { useState, useEffect } from "react";
import axios from "axios";
import { Edit, Trash } from "lucide-react";

export default function InventoryCard() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    item_name: "",
    price: "",
    description: "",
    type_name: "",
    stock_quantity: "",
    reorder_level: "",
    availability_status: "",
  });
  const [editId, setEditId] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch items from the backend API
  const fetchItems = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("http://localhost:4000/api/v1/item");
      if (response.data && Array.isArray(response.data.result)) {
        setItems(response.data.result.flat());
      } else {
        setError("Invalid data format received from API");
      }
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Handle input changes in the form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save or update an item
  const handleSave = async () => {
    // Basic validation for required fields
    if (
      !formData.item_name ||
      !formData.price ||
      !formData.stock_quantity ||
      !formData.type_name ||
      !formData.availability_status
    ) {
      alert("Please fill in all required fields (name, price, quantity, type, availability)");
      return;
    }

    try {
      const payload = {
        item_name: formData.item_name,
        price: formData.price,
        description: formData.description,
        type_name: formData.type_name,
        stock_quantity: parseInt(formData.stock_quantity),
        reorder_level: parseInt(formData.reorder_level) || 0,
        availability_status: formData.availability_status,
      };

      const payload1 = {
        item_name: formData.item_name,
        price: formData.price,
        description: formData.description,
        item_type_id: parseInt(formData.item_type_id),
        stock_quantity: parseInt(formData.stock_quantity),
        reorder_level: parseInt(formData.reorder_level) || 0,
        availability_status: formData.availability_status,
      };

      if (editId !== null) {
        // Update existing item
        await axios.put(`http://localhost:4000/api/v1/item/${editId}`, payload1);

      } else {
        // Add new item
        console.log("print ",payload)
        await axios.post(`http://localhost:4000/api/v1/item`, payload);
      }

      fetchItems();
      setEditId(null);
      setFormData({
        item_name: "",
        price: "",
        description: "",
        item_type_id: "", // ✅ add this
        type_name: "",
        stock_quantity: "",
        reorder_level: "",
        availability_status: "",
      });
      setFormVisible(false);
    } catch (err) {
      console.error("Error saving item:", err);
      alert("Failed to save item");
    }
  };

  // Edit an existing item
 const handleEdit = (item) => {
  setEditId(item.id);
  setFormData({
    item_name: item.item_name || "",
    price: item.price?.toString() || "",
    description: item.description || "",
    item_type_id: item.item_type_id?.toString() || "", // ✅ add this
    type_name: item.type_name || "", // ✅ keep this if needed for display
    stock_quantity: item.stock_quantity?.toString() || "",
    reorder_level: item.reorder_level?.toString() || "",
    availability_status: item.availability_status || "",
  });
  setFormVisible(true);
};


  // Delete an item
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(`http://localhost:4000/api/v1/item/${id}`);
        fetchItems();
      } catch (err) {
        console.error("Delete error:", err);
        alert("Failed to delete item");
      }
    }
  };

  // Cancel form
  const handleCancel = () => {
    setEditId(null);
    setFormData({
      item_name: "",
      price: "",
      description: "",
      type_name: "",
      stock_quantity: "",
      reorder_level: "",
      availability_status: "",
    });
    setFormVisible(false);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow-md">
      <h2 className="text-2xl font-bold mb-4">Inventory</h2>

      {!formVisible && (
        <button
          onClick={() => setFormVisible(true)}
          className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 mb-6"
        >
          Add New Item
        </button>
      )}

      {formVisible && (
        <>
          <h3 className="text-xl font-semibold mb-4">
            {editId !== null ? "Edit Item" : "Add New Item"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input
              type="text"
              name="item_name"
              value={formData.item_name}
              onChange={handleChange}
              placeholder="Item Name *"
              className="border rounded px-3 py-2"
            />
            <input
              type="number"
              name="price"
              step="0.01"
              value={formData.price.toString()}
              onChange={handleChange}
              placeholder="Price (e.g. 9.99) *"
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
              className="border rounded px-3 py-2 md:col-span-2"
            />
            <input
              type="text"
              name="type_name"
              value={formData.type_name}
              onChange={handleChange}
              placeholder="Type Name *"
              className="border rounded px-3 py-2"
            />
            <input
              type="number"
              name="stock_quantity"
              value={formData.stock_quantity}
              onChange={handleChange}
              placeholder="Quantity *"
              className="border rounded px-3 py-2"
            />
            <input
              type="number"
              name="reorder_level"
              value={formData.reorder_level}
              onChange={handleChange}
              placeholder="Reorder Level"
              className="border rounded px-3 py-2"
            />
            <select
              name="availability_status"
              value={formData.availability_status}
              onChange={handleChange}
              className="border rounded px-3 py-2"
            >
              <option value="">Select Availability Status *</option>
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Unavailable</option>
              <option value="Backordered">Backordered</option>
              <option value="Discontinued">Discontinued</option>
            </select>
          </div>

          <div className="flex space-x-3 mb-6">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
            >
              {editId !== null ? "Update Item" : "Add Item"}
            </button>

            <button
              onClick={handleCancel}
              className="bg-gray-500 text-white px-5 py-2 rounded hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {loading && <p>Loading items...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <h3 className="text-xl font-semibold mb-4">Inventory Items</h3>
      {items.length === 0 && !loading && <p>No items available.</p>}

      <ul>
        {items.map(
          ({
            id,
            item_name,
            price,
            description,
            type_name,
            stock_quantity,
            reorder_level,
            availability_status,
          }) => (
            <li
              key={id}
              className="border p-4 rounded mb-3 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-lg">{item_name}</p>
                <p className="text-sm text-gray-600">{description}</p>
                <p className="text-sm text-gray-800 mt-1">
                  Price: ₹{price} | Quantity: {stock_quantity} | Type: {type_name}
                </p>
                <p className="text-sm text-gray-700">
                  Reorder Level: {reorder_level} | Status: {availability_status}
                </p>
              </div>
              <div className="space-x-2 flex">
                <button
                  onClick={() =>
                    handleEdit({
                      id,
                      item_name,
                      price,
                      description,
                      type_name,
                      stock_quantity,
                      reorder_level,
                      availability_status,
                    })
                  }
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                   <Edit size={20} />
                </button>
                <button
                  onClick={() => handleDelete(id)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  <Trash size={20} />
                </button>
              </div>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
