import React, { useState, useEffect } from "react";
import axios from "../../../../utils/Api";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose, IoImageOutline } from "react-icons/io5";
import { Tooltip } from "@nextui-org/react";

function VisaDetailsModal({ visaId, isOpen, closeModal }) {
  const [visaDetails, setVisaDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (visaId && isOpen) {
      const fetchVisaDetails = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`/api/visas/${visaId}/`);
          setVisaDetails(response.data);
          setError(null);
        } catch (err) {
          console.error("Error fetching visa details:", err);
          setError("Failed to fetch visa details. Please try again later.");
        } finally {
          setLoading(false);
        }
      };
      fetchVisaDetails();
    }
  }, [visaId, isOpen]);

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImageView = () => {
    setSelectedImage(null);
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <span className="ml-3 text-gray-600">Loading visa details...</span>
    </div>
  );

  const ErrorDisplay = ({ message }) => (
    <div className="text-center p-6">
      <div className="text-red-500 text-lg mb-4">{message}</div>
      <button
        onClick={closeModal}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
      >
        Try Again
      </button>
    </div>
  );

  const ImageViewer = ({ url }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
      onClick={closeImageView}
    >
      <div className="relative max-w-4xl max-h-[90vh]">
        <img
          src={`https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${url}`}
          // src={url}
          alt="Visa Place"
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
        />
        <button
          onClick={closeImageView}
          className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-all duration-200"
        >
          <IoClose size={24} />
        </button>
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorDisplay message={error} />
            ) : (
              <div className="flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {visaDetails?.name}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
                  >
                    <IoClose size={24} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                  {/* Main Image */}
                  {visaDetails?.place_photo && (
                    <div className="mb-6">
                      <div 
                        className="relative cursor-pointer group"
                        onClick={() => handleImageClick(visaDetails.place_photo)}
                      >
                        <img
                        src={`https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${visaDetails.place_photo}`}
                          // src={visaDetails.place_photo}
                          alt={visaDetails.name}
                          className="w-full h-64 object-cover rounded-lg shadow-md"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <IoImageOutline className="text-white opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-200" size={32} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-700 mb-2">Category</h3>
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {visaDetails?.category?.name}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{visaDetails?.category?.description}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-700 mb-2">Note</h3>
                        <p className="text-gray-600">{visaDetails?.note || "No note available"}</p>
                      </div>
                    </div>

                    {/* Visa Days and Pricing */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-700 mb-4">Available Durations & Prices</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {visaDetails?.visa_days?.map((day) => (
                          <Tooltip key={day.id} content="Click to select" placement="top">
                            <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100">
                              <div className="text-lg font-semibold text-blue-600">{day.days} Days</div>
                              <div className="text-gray-600">₹{parseFloat(day.price).toLocaleString('en-IN')} INR</div>
                            </div>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200">
                  <button
                    onClick={closeModal}
                    className="w-full bg-[#4a4a4a] hover:bg-[#333333] text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Full Screen Image Viewer */}
          {selectedImage && <ImageViewer url={selectedImage} />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default VisaDetailsModal;


