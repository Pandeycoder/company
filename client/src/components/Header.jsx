import React, { useState } from "react";
import {
  PackageCheck,
  Warehouse,
  ShoppingBag,
  Truck,
  LogOut,
  Store,
  Menu,
  X,
  Search,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const Header = ({ onSearch }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const isActive = (path) => {
    return location.pathname === path
      ? "text-blue-600 font-semibold"
      : "text-gray-600 hover:text-blue-600";
  };

  const toggleMenu = () => setMenuOpen((open) => !open);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value); // pass search term up to parent or handler
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <Store className="h-8 w-8 text-blue-600" />
          <h1 className="ml-2 text-2xl font-bold text-gray-900">Store Manager</h1>
        </Link>

        {/* Search input (Desktop only) */}
        <div className="hidden md:flex items-center border border-gray-300 rounded-md px-3 py-1 max-w-xs w-full ml-6">
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search items..."
            className="w-full outline-none text-gray-700 bg-transparent"
          />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/items" className={`flex items-center ${isActive("/items")}`}>
            <PackageCheck className="h-5 w-5 mr-1" />
            <span>Items</span>
          </Link>
          <Link
            to="/inventory"
            className={`flex items-center ${isActive("/inventory")}`}
          >
            <Warehouse className="h-5 w-5 mr-1" />
            <span>Inventory</span>
          </Link>
          <Link
            to="/purchase"
            className={`flex items-center ${isActive("/purchase")}`}
          >
            <ShoppingBag className="h-5 w-5 mr-1" />
            <span>Purchase</span>
          </Link>
          <Link
            to="/shipping"
            className={`flex items-center ${isActive("/shipping")}`}
          >
            <Truck className="h-5 w-5 mr-1" />
            <span>Shipping</span>
          </Link>
          <Link
            to="/logout"
            className="flex items-center text-red-500 hover:text-red-600"
          >
            <LogOut className="h-5 w-5 mr-1" />
            <span>Logout</span>
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-700 hover:text-blue-600 focus:outline-none"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <nav className="md:hidden bg-white border-t border-gray-200 shadow-inner">
          <ul className="flex flex-col space-y-2 p-4">
            {/* Mobile search bar */}
            <li>
              <div className="flex items-center border border-gray-300 rounded-md px-3 py-1 mb-3">
                <Search className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search items..."
                  className="w-full outline-none text-gray-700 bg-transparent"
                />
              </div>
            </li>
            <li>
              <Link
                to="/items"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center ${isActive("/items")}`}
              >
                <PackageCheck className="h-5 w-5 mr-2" />
                Items
              </Link>
            </li>
            <li>
              <Link
                to="/inventory"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center ${isActive("/inventory")}`}
              >
                <Warehouse className="h-5 w-5 mr-2" />
                Inventory
              </Link>
            </li>
            <li>
              <Link
                to="/purchase"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center ${isActive("/purchase")}`}
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                Purchase
              </Link>
            </li>
            <li>
              <Link
                to="/shipping"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center ${isActive("/shipping")}`}
              >
                <Truck className="h-5 w-5 mr-2" />
                Shipping
              </Link>
            </li>
            <li>
              <Link
                to="/logout"
                onClick={() => setMenuOpen(false)}
                className="flex items-center text-red-500 hover:text-red-600"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};
