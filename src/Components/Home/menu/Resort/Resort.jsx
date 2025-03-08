import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../../utils/Api";
import ResortDetailModal from "./ResortDetails";
import { useDispatch, useSelector } from "react-redux";
import {setHomeResort} from "../../../Toolkit/Slice/apiHomeSlice"; 


function Resort({ setIsModal }) {
  const [resorts, setResorts] = useState([]);
  const [filteredResorts, setFilteredResorts] = useState([]);
  const [sortOrder, setSortOrder] = useState("default");
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedResort, setSelectedResort] = useState(null);
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const homeData = useSelector((state) => state.api.home);
  

  // Fetch Resorts and Categories
  useEffect(() => {
    const fetchResortsAndCategories = async () => {
      try {;
        
        if (!homeData.resort) {
          try {
            const response = await axios.get("/api/resorts/");
            setResorts(response.data);
            setFilteredResorts(response.data);
            dispatch(setHomeResort(response.data));
          } catch (error) {
            console.error("Error fetching Holidays:", error);
          }
        } else {
          setResorts(homeData.resort);
          setFilteredResorts(homeData.resort);
        }

        const categoryResponse = await axios.get("/api/resort-categories/");
        const fetchedCategories = categoryResponse.data.map((category) => ({
          id: category.id,
          label: category.name,
        }));

        const allCategories = [
          { id: "all", label: "All" },
          ...fetchedCategories,
        ];

        setCategories(allCategories);
        console.log(allCategories);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchResortsAndCategories();
  }, []);

  // Filter resorts based on selected category
  const filteredResortsMemo = useMemo(() => {
    return resorts.filter((resort) =>
      selectedCategory === "all" ? true : resort.category_id === selectedCategory
    );
  }, [resorts, selectedCategory]);

  // Resort Sorting Logic
  const sortedResorts = useMemo(() => {
    return [...filteredResortsMemo].sort((a, b) => {
      switch (sortOrder) {
        case "price-low":
          return a.base_price - b.base_price;
        case "price-high":
          return b.base_price - a.base_price;
        default:
          return 0;
      }
    });
  }, [filteredResortsMemo, sortOrder]);

  const handleSelectPackage = (id) => {
    if (!token) {
      setIsModal("login");
      return;
    }
    setSelectedResort(id);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Resort List and Categories */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div className="w-full overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  console.log(category.id, selectedCategory);
                }}
                className={`px-4 py-2 rounded-xl duration-300 ease-in-out whitespace-nowrap ${
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

        {/* Sorting Controls */}
        <div className="relative">{/* Your Sort Menu */}</div>
      </div>

      {/* Resort Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {sortedResorts.map((resort, index) => (
          <div
            key={index}
            className="group relative bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div
              onClick={() => handleSelectPackage(resort.id)}
              className="relative h-48 overflow-hidden"
            >
              <img
                src={`https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${resort.images?.[0]?.image}`}
                alt={resort.name}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              />
              <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                {resort.location}
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold">{resort.name}</h3>
              <p className="text-gray-500">
                Pool: {resort.pool ? "Yes" : "No"}
              </p>
              <p className="text-black font-bold">₹ {resort.base_price}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Resort Detail Modal */}
      {selectedResort && (
        <ResortDetailModal
          isOpen={true}
          onClose={() => setSelectedResort(null)}
          ResortId={selectedResort}
        />
      )}
    </div>
  );
}

export default Resort;