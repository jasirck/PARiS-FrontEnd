import React, { useState, useEffect } from "react";
import axios from "../../../../utils/Api";
import { motion } from "framer-motion";
import { start } from "@cloudinary/url-gen/qualifiers/textAlignment";
import { div } from "framer-motion/client";
import { useSelector } from "react-redux";

export default function ResortDetailModal({ isOpen, onClose, ResortId }) {
  const [resortData, setResortData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageOffset, setImageOffset] = useState(0);
  const [selectedImage, setSelectedImage] = useState({
    src: "",
    alt: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { token } = useSelector((state) => state.auth);

  // Fetch resort details from API
  useEffect(() => {
    if (isOpen && ResortId) {
      const fetchResortDetails = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(`/api/resorts/${ResortId}/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setResortData(response.data);
          console.log(response.data);
          

          // Set first image as selected
          if (response.data.images?.length > 0) {
            setSelectedImage({
              src: response.data.images[0].image,
              alt: response.data.name || "Resort Image",
            });
          }
        } catch (error) {
          console.error("Error fetching resort details:", error);
          setResortData(null);
          setPackageData(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchResortDetails();
    }
  }, [isOpen, ResortId]);

  // Image scrolling and selection logic
  const scrollUp = () => {
    setImageOffset(prev => Math.max(0, prev - 1));
  };

  const scrollDown = () => {
    const images = resortData?.images || [];
    setImageOffset(prev => 
      prev < Math.max(0, images.length - 3) ? prev + 1 : prev
    );
  };

  const handleImageClick = (image) => {
    if (image?.image) {
      setSelectedImage({
        src: image.image,
        alt: image.alt || resortData.name || "Resort Image",
      });
    }
  };


  // Pricing calculation
  const calculatePricing = () => {
    const { base_price, adult_price, child_price } = resortData;
    return {
      basePrice: base_price || 'N/A',
      adultPrice: adult_price || 'N/A',
      childPrice: child_price || 'N/A',
    };
  };

  // Render content when loading
  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50"
      >
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-white"></div>
      </motion.div>
    );
  }

  // Render nothing if modal is closed or no data
  if (!isOpen || !resortData) return null;

  const { basePrice, adultPrice, childPrice } = calculatePricing();
  const cloudinaryBase = "https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/";

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50"
    >
      <div className="relative bg-white w-11/12 md:w-10/12 lg:w-8/12 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-4 right-4 text-gray-700 hover:text-[#287094] p-2 rounded-full hover:bg-gray-100 transition"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </motion.button>

        <div className="p-6 md:p-8">
          {/* Resort Name */}
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold text-[#1E546F] mb-6 pb-4 border-b border-gray-200"
          >
            {resortData.name}
          </motion.h2>

          {/* Image Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Thumbnail Column */}
            <div className="relative space-y-4 hidden md:block">
              {imageOffset > 0 && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10 bg-white/70 rounded-full p-1 shadow-md hover:bg-white/90"
                  onClick={scrollUp}
                  aria-label="Scroll up images"
                >
                  ▲
                </motion.button>
              )}

              {resortData.images?.slice(imageOffset, imageOffset + 3).map((image, index) => (
                <motion.div
                  key={image.id}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer group"
                  onClick={() => handleImageClick(image)}
                >
                  <img
                    src={`${cloudinaryBase}${image.image}`}
                    alt={`Resort image ${index + 1}`}
                    className="w-full h-[120px] object-cover rounded-lg shadow-md"
                  />
                </motion.div>
              ))}

              {resortData.images?.length > 3 && imageOffset < resortData.images.length - 3 && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 z-10 bg-white/70 rounded-full p-1 shadow-md hover:bg-white/90"
                  onClick={scrollDown}
                  aria-label="Scroll down images"
                >
                  ▼
                </motion.button>
              )}
            </div>

            {/* Main Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="md:col-span-2"
            >
              <img
                src={`${cloudinaryBase}${selectedImage.src}`}
                alt={selectedImage.alt}
                className="w-full h-[400px] object-cover rounded-2xl shadow-lg"
              />
            </motion.div>
          </div>

          {/* Resort Details */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-6 bg-gray-50 rounded-3xl p-6"
          >
            {/* Resort Attributes */}
            <div>
              <h3 className="text-lg font-semibold text-[#1E546F] mb-3 pb-2 border-b border-gray-200">
                Resort Details
              </h3>
              <ul className="space-y-2 text-[#023246]">
                <li className="flex items-center">
                  <span className="mr-2">📍</span> 
                  Location: {resortData.location || 'Not specified'}
                </li>
                <li className="flex items-center">
                  <span className="mr-2">🏊</span>
                  Pool: {resortData.pool ? 'Available' : 'Not Available'}
                </li>
              </ul>
              <br />
              <h3>{resortData.policy}</h3>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-lg font-semibold text-[#1E546F] mb-3 pb-2 border-b border-gray-200">
                Pricing Details
              </h3>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-gray-700 mb-2">
                  <span className="font-bold text-[#1E546F] text-xl">
                    ₹{basePrice}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">Base Price</span>
                </p>
                <div className="text-sm text-gray-600">
                  <p>Adult Price: + ₹{adultPrice}</p>
                  <p>Child Price: + ₹{childPrice}</p>
                </div>
                <p className="text-xs text-gray-500 italic mt-2">
                  Taxes and additional fees may apply
                </p>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end items-center mt-6 space-x-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gray-200 text-[#1E546F] px-6 py-2 rounded-full hover:bg-gray-300 transition"
              onClick={onClose}
            >
              Close
            </motion.button>
            
            
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}