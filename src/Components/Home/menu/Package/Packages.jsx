import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../../utils/Api";
import PackageDeteils from "./PackageDeteils";
import { useSelector } from "react-redux";
import { div } from "framer-motion/client";

function Package({ setIsModal }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("default");
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false); // To manage loading state
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchPackages = async () => {
      setLoading(true);  // Set loading state to true
      try {
        const response = await axios.get("/api/packages/");
        setPackages(response.data);
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setLoading(false);  // Set loading state to false once the data is fetched
      }
    };

    fetchPackages();

    const fetchCategories = async () => {
      try {
        const response = await axios.get("api/package-categories/");
        const fetchedCategories = response.data.map((category) => ({
          id: category.id,
          label: category.name, // Adjust 'name' based on your serializer field
        }));

        const allCategories = [
          { id: "all", label: "All" },
          ...fetchedCategories,
        ];

        setCategories(allCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Filter packages based on selected category
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) =>
      selectedCategory === "all" ? true : pkg.category === selectedCategory
    );
  }, [packages, selectedCategory]);

  // Sort packages based on selected order
  const sortedPackages = useMemo(() => {
    return [...filteredPackages].sort((a, b) => {
      switch (sortOrder) {
        case "price-low":
          return a.base_price - b.base_price;
        case "price-high":
          return b.base_price - a.base_price;
        case "duration-low":
          return a.days - b.days;
        case "duration-high":
          return b.days - a.days;
        default:
          return 0;
      }
    });
  }, [filteredPackages, sortOrder]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSortMenuOpen && !event.target.closest(".sort-container")) {
        setIsSortMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isSortMenuOpen]);

  const handleSelectPackage = (id) => {
    if (!token) {
      setIsModal("login");
      return;
    }
    setSelectedPackage(id);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Category and Sort Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        {/* Category Buttons */}
        <div className="flex justify-center items-center w-full">
          <div className="flex space-x-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-xl duration-300 ease-in-out ${
                  selectedCategory === category.id
                    ? "bg-[#287094] text-white shadow-lg"
                    : "bg-transparent text-[#287094] hover:shadow-2xl"
                } focus:outline-none`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Button */}
        <div className="relative sort-container">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsSortMenuOpen(!isSortMenuOpen);
            }}
            className="px-6 py-2 bg-[#eaf1f4] rounded-full text-gray-600 hover:bg-gray-100 flex items-center space-x-2"
          >
            <span className="text-sm">Sort</span>
          </button>

          {/* Sort Dropdown Menu */}
          {isSortMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#eaf1f4] rounded-lg shadow-xl z-10 py-2">
              {[
                { id: "price-low", label: "Price: Low to High" },
                { id: "price-high", label: "Price: High to Low" },
                { id: "duration-low", label: "Duration: Short to Long" },
                { id: "duration-high", label: "Duration: Long to Short" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setSortOrder(option.id);
                    setIsSortMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-[#287094] hover:bg-[#287094] hover:text-white"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Package Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <p className="text-center text-gray-500">Loading packages...</p>
        ) : sortedPackages.length > 0 ? (
          sortedPackages.map((pkg, index) => (
            <div
              key={index}
              onClick={() => handleSelectPackage(pkg.id)}
              className="group relative bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl transform hover:-translate-y-2 cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={`https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${pkg.first_day_image}`}
                  alt={pkg.name}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
              </div>

              <div className="p-4 ">
                <h3 className="text-lg font-semibold">{pkg.name}</h3>
                <p className="text-gray-500">{pkg.days} Days</p>
                <p className="text-black font-bold">₹{pkg.base_price}</p>
                <p className="text-red-500 text-sm">
                  Valid from {pkg.start} to {pkg.end}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No packages found.</p>
        )}
      </div>

      {/* Modal for Package Details */}
      {selectedPackage && (
        <div><PackageDeteils
        isOpen={!!selectedPackage}
        onClose={() => setSelectedPackage(null)}
        packageId={selectedPackage}
      /></div>
      )}
    </div>
  );
}

export default Package;
  