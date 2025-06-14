import { X } from "lucide-react";

export const ItemOptionsModal = ({ item, onClose }) => {
  if (!item) return null;

  const options = [
    { label: "View Item Details", action: () => alert(`View details for ${item.type_name}`) },
    { label: "Add Inventory", action: () => alert(`Add inventory for ${item.type_name}`) },
    { label: "Record Purchase", action: () => alert(`Record purchase for ${item.type_name}`) },
    { label: "Manage Shipping", action: () => alert(`Manage shipping for ${item.type_name}`) },
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-96"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">{item.type_name} - Actions</h2>
        <ul className="space-y-3">
          {options.map(({ label, action }) => (
            <li
              key={label}
              onClick={() => {
                action();
                onClose();
              }}
              className="cursor-pointer px-4 py-2 rounded border border-gray-300 hover:bg-blue-100 hover:text-blue-700 font-semibold"
            >
              {label}
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="mt-6 flex items-center justify-center gap-2 w-full bg-red-600 text-white py-2 rounded-full shadow-md hover:bg-red-700 transition-colors duration-200"
        >
          <X className="h-5 w-5" />
          Close
        </button>
      </div>
    </div>
  );
};
