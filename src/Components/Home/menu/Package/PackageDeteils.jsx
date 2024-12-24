import React, { useEffect, useState } from "react";
import { MapPin, Calendar, Check, X, Phone } from "lucide-react";
import axios from "../../../../utils/Api";
import Booking from "./Booking";

const PackageDetails = ({ isOpen, onClose, packageId }) => {
  const [packageData, setPackageData] = useState(null);
  const [days, setDays] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPackageDetails = async () => {
      try {
        const response = await axios.get(
          `/api/packages-deteils/${packageId}/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        console.log(response.data);
        setPackageData(response.data.package);
        setDays(response.data.days);
      } catch (error) {
        console.error("Error fetching package details:", error);
      }
    };

    if (packageId) {
      fetchPackageDetails();
    }
  }, [packageId]);

  const handleBookingModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  if (!isOpen || !packageData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d383d] bg-opacity-60">
      <div className="relative bg-[#F6F6F6] w-[95%] md:w-[80%] max-w-[1200px] rounded-2xl shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh]">
        <button
          className="absolute top-4 right-4 text-[#023246] hover:text-red-600 transition duration-300 p-2 rounded-full hover:bg-gray-200"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <MapPin size={36} className="text-[#287094] mr-2" />
            <h1 className="text-4xl font-extrabold text-[#023246]">
              {packageData.name}
            </h1>
          </div>
          <p className="text-lg text-[#023246] max-w-3xl mx-auto">
            {packageData.note ||
              "Explore a mesmerizing destination with unforgettable experiences."}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          {days && days.length > 0 ? (
            days.map((day, index) => (
              <div
                key={index}
                className="mb-6 pb-6 border-b last:border-b-0 flex flex-col md:flex-row items-start md:items-center gap-6"
              >
                <img
                  src={
                    `https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${day.place_photo}` ||
                    "https://via.placeholder.com/400x300"
                  }
                  alt={`Day ${day.day}`}
                  className="w-full md:w-1/3 h-48 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[#287094] mb-2">
                    Day {day.day}: {day.place_name}
                  </h3>
                  <p className="text-[#023246] text-sm leading-relaxed">
                    {day.activity || "No activity specified for this day."}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-[#023246] text-sm text-center">
              No itinerary available for this package.
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#289441] bg-opacity-10 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-[#287094] mb-4 flex items-center">
              <Check size={24} className="mr-2 text-[#287094]" /> Package
              Includes
            </h3>
            <ul className="space-y-2 text-[#023246]">
              {(typeof packageData.package_included === "string"
                ? JSON.parse(packageData.package_included)
                : packageData.package_included || []
              ).map((item, index) => (
                <li key={index}>✓ {item.trim()}</li>
              ))}
            </ul>
          </div>

          <div className="bg-[#942828] bg-opacity-10 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center">
              <X size={24} className="mr-2 text-red-700" /> Package Excludes
            </h3>
            <ul className="space-y-2 text-[#023246]">
              {(typeof packageData.package_excluded === "string"
                ? JSON.parse(packageData.package_included)
                : packageData.package_included || []
              ).map((item, index) => (
                <li key={index}>✗ {item.trim()}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pricing and Validity */}
        <div className="bg-[#D4D4CE] p-6 rounded-xl text-center">
          <div className="flex justify-center items-center mb-4">
            <Calendar size={24} className="mr-2 text-[#287094]" />
            <h3 className="text-xl font-bold text-[#023246]">Trip Details</h3>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-[#023246] font-semibold">Duration</p>
              <p className="text-[#287094]">{packageData.days} Days</p>
            </div>
            <div>
              <p className="text-[#023246] font-semibold">Base  |  Adult | Child </p>
              <p className="text-[#287094] font-bold">
                ₹{packageData.base_price }  |  ₹  { packageData.adult_price }  |  ₹  {packageData.child_price}
              </p>
            </div>
          </div>
          <p className="text-[#023246] mb-6">
            Valid from {packageData.start} to {packageData.end}
          </p>

          <div className="flex justify-center space-x-4">
            <button
              className="px-8 py-3 bg-[#287094] text-white rounded-lg hover:bg-opacity-90 transition duration-300 flex items-center"
              onClick={handleBookingModal}
            >
              Book Now
            </button>
            <button className="px-8 py-3 bg-[#023246] text-white rounded-lg hover:bg-opacity-90 transition duration-300 flex items-center">
              <Phone size={20} className="mr-2" /> Request Callback
            </button>
          </div>
        </div>
      </div>
      <div>
        {isModalOpen && (
          <Booking
            handleBookingModal={handleBookingModal}
            isModalOpen={isModalOpen}
            data={{
              name : packageData.name,
              start: packageData.start,
              end: packageData.end,
              base_price: packageData.base_price,
              adult_price: packageData.adult_price,
              child_price: packageData.child_price,
              id:packageId
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PackageDetails;
