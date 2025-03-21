import React, { useState, useEffect } from "react";
import axios from "../../../../utils/Api";
import { motion } from "framer-motion";
import { MapPin, Calendar, Check, X, Phone } from "lucide-react";
import RefundSuccess from "../../PaymentResult";
import { toast } from "sonner";
import { useSelector } from "react-redux";

export default function ResortDetailModal({
  isOpen,
  onClose,
  ResortId,
  booked_id,
}) {
  const [resortData, setResortData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageOffset, setImageOffset] = useState(0);
  const [refundInfo, setRefundInfo] = useState(null);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState({
    src: "",
    alt: "",
  });
  const [activeThumbnailIndex, setActiveThumbnailIndex] = useState(0);
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

          // Set first image as selected
          if (response.data.images?.length > 0) {
            setSelectedImage({
              src: response.data.images[0].image,
              alt: response.data.name || "Resort Image",
            });
            setActiveThumbnailIndex(0);
          }
        } catch (error) {
          console.error("Error fetching resort details:", error);
          setResortData(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchResortDetails();
    }
  }, [isOpen, ResortId, token]);

  const handleCancelBooking = async () => {
    try {
      const response = await axios.post(
        `/api/refund-package/`,
        { booked_id: booked_id, category: "resort" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.error) {
        toast(response.data.error);
      } else {
        setRefundInfo(response.data);
        setRefundModalOpen(true); // Open the refund success modal
      }
    } catch (error) {
      console.error("Refund error:", error);
      toast("Refund request failed. Please try again.");
    }
  };
  
  // Image scrolling and selection logic
  const scrollUp = () => {
    setImageOffset((prev) => Math.max(0, prev - 1));
  };

  const scrollDown = () => {
    const images = resortData?.images || [];
    setImageOffset((prev) =>
      prev < Math.max(0, images.length - 3) ? prev + 1 : prev
    );
  };

  const handleImageClick = (image, index) => {
    if (image?.image) {
      setSelectedImage({
        src: image.image,
        alt: image.alt || resortData.name || "Resort Image",
      });
      setActiveThumbnailIndex(index + imageOffset);
    }
  };

  // Pricing calculation
  const calculatePricing = () => {
    const { base_price, adult_price, child_price } = resortData || {};
    return {
      basePrice: base_price || "N/A",
      adultPrice: adult_price || "N/A",
      childPrice: child_price || "N/A",
    };
  };

  // Render content when loading
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-60"
      >
        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-full">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
        </div>
      </motion.div>
    );
  }

  // Render nothing if modal is closed or no data
  if (!isOpen) return null;

  const { basePrice, adultPrice, childPrice } = calculatePricing();
  const cloudinaryBase = "https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-60 p-4 sm:p-6"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Refund Success Modal */}
        {refundModalOpen && (
          <RefundSuccess refundData={refundInfo} onClose={onClose} />
        )}
        
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm text-gray-700 hover:text-[#287094] p-2 rounded-full hover:bg-white transition-all shadow-md"
          onClick={onClose}
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        <div className="p-6 md:p-8">
          {/* Resort Name */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center mb-6"
          >
            <div className="w-2 h-10 bg-gradient-to-b from-[#1E546F] to-[#287094] rounded-full mr-3"></div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1E546F]">
              {resortData?.name || "Resort Details"}
            </h2>
          </motion.div>

          {/* Image Gallery */}
          {resortData && (
            <div className="mb-8">
              {/* Main Image */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="relative rounded-2xl overflow-hidden shadow-lg mb-4 h-[250px] sm:h-[300px] md:h-[400px] bg-gray-100"
              >
                {selectedImage.src ? (
                  <img
                    src={`${cloudinaryBase}${selectedImage.src}`}
                    alt={selectedImage.alt}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30"></div>
              </motion.div>

              {/* Mobile Thumbnails */}
              <div className="flex justify-center gap-2 md:hidden overflow-x-auto pb-2">
                {resortData.images?.slice(0, 5).map((image, index) => (
                  <div
                    key={`mobile-thumb-${image.id || index}`}
                    className={`cursor-pointer transition-all duration-200 ${
                      index === activeThumbnailIndex ? "ring-2 ring-[#1E546F] scale-105" : "opacity-70"
                    }`}
                    onClick={() => handleImageClick(image, index)}
                  >
                    <img
                      src={`${cloudinaryBase}${image.image}`}
                      alt={`Resort thumbnail ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>

              {/* Desktop Thumbnails */}
              <div className="hidden md:flex justify-center gap-4">
                <button
                  className={`p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors ${
                    imageOffset === 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={scrollUp}
                  disabled={imageOffset === 0}
                  aria-label="Previous images"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {resortData.images
                  ?.slice(imageOffset, imageOffset + 5)
                  .map((image, index) => (
                    <motion.div
                      key={`desktop-thumb-${image.id || index}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`cursor-pointer transition-all duration-200 ${
                        index + imageOffset === activeThumbnailIndex 
                          ? "ring-2 ring-[#1E546F] ring-offset-2" 
                          : "opacity-80 hover:opacity-100"
                      }`}
                      onClick={() => handleImageClick(image, index)}
                    >
                      <img
                        src={`${cloudinaryBase}${image.image}`}
                        alt={`Resort thumbnail ${index + imageOffset + 1}`}
                        className="w-20 h-20 object-cover rounded-lg shadow-md"
                      />
                    </motion.div>
                  ))}
                  
                <button
                  className={`p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors ${
                    !resortData.images || imageOffset >= resortData.images.length - 5 
                      ? "opacity-50 cursor-not-allowed" 
                      : ""
                  }`}
                  onClick={scrollDown}
                  disabled={!resortData.images || imageOffset >= resortData.images.length - 5}
                  aria-label="Next images"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Resort Details */}
          {resortData ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            >
              {/* Resort Attributes */}
              <div className="bg-gray-50 p-6 rounded-2xl shadow-sm">
                <h3 className="text-xl font-semibold text-[#1E546F] mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Resort Details
                </h3>
                
                <ul className="space-y-4 text-[#023246]">
                  <li className="flex items-center p-3 bg-white rounded-lg">
                    <div className="flex justify-center items-center w-10 h-10 bg-[#1E546F]/10 rounded-full text-[#1E546F] mr-3">
                      📍
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{resortData.location || "Not specified"}</p>
                    </div>
                  </li>
                  
                  <li className="flex items-center p-3 bg-white rounded-lg">
                    <div className="flex justify-center items-center w-10 h-10 bg-[#1E546F]/10 rounded-full text-[#1E546F] mr-3">
                      🏊
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Swimming Pool</p>
                      <p className="font-medium">{resortData.pool ? "Available" : "Not Available"}</p>
                    </div>
                  </li>
                </ul>
                
                <div className="mt-6 bg-white p-4 rounded-lg border-l-4 border-[#1E546F]">
                  <h4 className="font-medium text-[#1E546F] mb-2">Resort Policy</h4>
                  <p className="text-gray-700 text-sm">{resortData.policy || "No specific policies mentioned."}</p>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gradient-to-br from-[#1E546F]/10 to-[#1E546F]/5 p-6 rounded-2xl shadow-sm">
                <h3 className="text-xl font-semibold text-[#1E546F] mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  Pricing Details
                </h3>
                
                <div className="bg-white p-5 rounded-xl shadow-sm mb-4">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                    <span className="text-gray-600">Base Price</span>
                    <span className="font-bold text-[#1E546F] text-2xl">₹{basePrice}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Adult Price</span>
                      <span className="font-medium">+ ₹{adultPrice}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Child Price</span>
                      <span className="font-medium">+ ₹{childPrice}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#1E546F]/10 p-4 rounded-lg">
                  <p className="text-sm text-[#1E546F] mb-2 font-medium">Stay Period</p>
                  <div className="flex justify-between">
                    <div className="text-sm">
                      <p className="text-gray-500">Check-in</p>
                      <p className="font-medium">{resortData.start || "Contact for details"}</p>
                    </div>
                    <div className="text-sm text-right">
                      <p className="text-gray-500">Check-out</p>
                      <p className="font-medium">{resortData.end || "Contact for details"}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 italic mt-4">
                    Taxes and additional fees may apply
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded-xl">
              <p className="text-gray-600">No resort data available. Please try again later.</p>
            </div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-end items-center gap-3 border-t border-gray-100 pt-6"
          >
            <button
              className="w-full sm:w-auto bg-gray-100 text-[#1E546F] px-6 py-3 rounded-full hover:bg-gray-200 transition-colors font-medium order-2 sm:order-1"
              onClick={onClose}
            >
              Close
            </button>
            
            {/* {booked_id && (
              <button
                className="w-full sm:w-auto bg-[#942828] text-white px-6 py-3 rounded-full hover:opacity-90 transition-opacity font-medium flex items-center justify-center gap-2 order-1 sm:order-2"
                onClick={handleCancelBooking}
              >
                <X className="h-5 w-5" />
                Cancel Booking
              </button>
            )} */}
            
            {/* <button
              className="w-full sm:w-auto bg-gradient-to-r from-[#287094] to-[#1e5674] text-white px-6 py-3 rounded-full hover:opacity-90 transition-opacity font-medium flex items-center justify-center gap-2 shadow-md order-3"
              onClick={() => alert("Callback request to be implemented")}
            >
              <Phone className="h-5 w-5" />
              Request Callback
            </button> */}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}