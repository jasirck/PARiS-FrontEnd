import React, { useState, useEffect } from "react";
import axios from "../../../../utils/Api";
import VisaDetails from "./VisaDetails";
import { useSelector } from "react-redux";

function Visa({ setIsModal }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortedVisas, setSortedVisas] = useState([]);
  const [selectedVisa, setSelectedVisa] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchResortsAndCategories = async () => {
      try {
        const response = await axios.get("/api/admin-visas/");
        setSortedVisas(response.data);
        console.log("Visa", response.data);

        const categoryResponse = await axios.get("/api/visa-categories/");
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

  const handleSelectVisa = (visa) => {
    if (!token) {
      setIsModal("login");
      return;
    }
    setSelectedVisa(visa); // Pass the entire visa object
    setIsModalOpen(true); 
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  // Filter visas based on selected category
  const filteredVisas =
    selectedCategory === "all"
      ? sortedVisas
      : sortedVisas.filter((visa) => visa.category.id === selectedCategory);

  return (
    <div className="space-y-6 p-6">
      {/* Visa Categories */}
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
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
      </div>

      {/* Visa Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredVisas.map((visa, index) => (
          <div
            key={index}
            className="group relative bg-white rounded-2xl shadow-md overflow-hidden"
          >
            <div
              onClick={() => handleSelectVisa(visa)} // Pass the entire visa object here
              className="relative h-48 overflow-hidden cursor-pointer"
            >
              <img
              src={`https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${visa.place_photo}`}
                alt={visa.name}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              />
              <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                {visa.category.name}
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold">{visa.name}</h3>
              <p className="text-black font-bold">
                ₹{" "}
                {visa.visa_days.map((day) => (
                  <div key={day.id}>
                    <span>
                      {day.days} days - ₹ {day.price}
                    </span>
                  </div>
                ))}
              </p>

              {/* <div className="flex justify-between mt-4">
                <button className="bg-[#287094] text-white px-4 py-2 rounded-full shadow hover:bg-[#1e5674] transition duration-200">
                  Details
                </button>
                <button className="bg-green-500 text-white px-4 py-2 rounded-full shadow hover:bg-green-700 transition duration-200">
                  Apply
                </button>
              </div> */}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && selectedVisa && (
        <VisaDetails visa={selectedVisa} isOpen={isModalOpen} onClose={handleCloseModal} />
      )}
    </div>
  );
}

export default Visa;
