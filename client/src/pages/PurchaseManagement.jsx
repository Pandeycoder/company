import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, Trash } from "lucide-react";

function PurchaseManagement() {
  const [purchases, setPurchases] = useState([]);

useEffect(() => {
  axios
    .get("http://localhost:4000/api/v1/purchases")
    .then((response) => {
      if (Array.isArray(response.data)) {
        setPurchases(response.data);
      } else if (Array.isArray(response.data.data)) {
        setPurchases(response.data.data);
      } else if (Array.isArray(response.data.statusCode)) {
        setPurchases(response.data.statusCode);
      } else {
        console.error("Unexpected purchases data format", response.data);
      }
    })
    .catch((error) => {
      console.error("Error fetching purchases:", error);
    });
}, []);



  // Handle printing of the purchases
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Purchase Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
            th { background-color: #f5f5f5; }
            h2 { text-align: center; }
          </style>
        </head>
        <body>
          <h2>Purchase Report</h2>
          <table>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Item Name(s)</th>
                <th>Quantity</th>
                <th>Unit Price (₹)</th>
                <th>Subtotal (₹)</th>
                <th>Total (₹)</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${purchases
                .map((p) => {
                  return p.items
                    .map(
                      (item, idx) => `
                    <tr>
                      ${idx === 0 ? `<td rowspan="${p.items.length}">${p.customer_name}</td>` : ""}
                      <td>${item.item_name}</td>
                      <td>${item.quantity}</td>
                      <td>₹${parseFloat(item.unit_price).toFixed(2)}</td>
                      <td>₹${parseFloat(item.subtotal).toFixed(2)}</td>
                      ${idx === 0 ? `<td rowspan="${p.items.length}">₹${parseFloat(p.total_amount).toFixed(2)}</td>` : ""}
                      ${idx === 0 ? `<td rowspan="${p.items.length}">${p.status}</td>` : ""}
                      ${idx === 0 ? `<td rowspan="${p.items.length}">${new Date(p.purchase_date).toLocaleDateString()}</td>` : ""}
                      <td>edate delete</td>
                    </tr>
                  `
                    )
                    .join("");
                })
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow mt-10 mb-40">
      <h1 className="text-3xl font-bold mb-6">Purchase Management</h1>

      <button
        onClick={handlePrint}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded mb-6"
      >
        Print Purchase Report
      </button>

      {purchases.length > 0 ? (
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-center">
              <th className="border px-4 py-2">Customer</th>
              <th className="border px-4 py-2">Item(s)</th>
              <th className="border px-4 py-2">Quantity</th>
              <th className="border px-4 py-2">Unit Price</th>
              <th className="border px-4 py-2">Subtotal</th>
              <th className="border px-4 py-2">Total</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Action</th>
              
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) =>
              p.items.map((item, idx) => (
                <tr key={item.purchase_detail_id} className="text-center">
                  {idx === 0 && (
                    <td
                      rowSpan={p.items.length}
                      className="border px-4 py-2 font-medium"
                    >
                      {p.customer_name}
                    </td>
                  )}
                  <td className="border px-4 py-2">{item.item_name}</td>
                  <td className="border px-4 py-2">{item.quantity}</td>
                  <td className="border px-4 py-2">₹{parseFloat(item.unit_price).toFixed(2)}</td>
                  <td className="border px-4 py-2">₹{parseFloat(item.subtotal).toFixed(2)}</td>
                  {idx === 0 && (
                    <>
                      <td rowSpan={p.items.length} className="border px-4 py-2 font-semibold">
                        ₹{parseFloat(p.total_amount).toFixed(2)}
                      </td>
                      <td rowSpan={p.items.length} className="border px-4 py-2">
                        {p.status}
                      </td>
                      <td rowSpan={p.items.length} className="border px-4 py-2">
                        {new Date(p.purchase_date).toLocaleDateString()}
                      </td>
                 <td rowSpan={p.items.length} className="border px-4 py-2 space-x-3 text-center">
  <button
    onClick={() => handleEdit(p.purchase_id)}
    className="text-yellow-500 hover:text-yellow-600"
    aria-label="Edit Purchase"
  >
    <Edit size={20} />
  </button>
  <button
    onClick={() => handleDelete(p.purchase_id)}
    className="text-red-600 hover:text-red-700"
    aria-label="Delete Purchase"
  >
    <Trash size={20} />
  </button>
</td>


                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500">Loading purchases...</p>
      )}
    </div>
  );
}

export default PurchaseManagement;
