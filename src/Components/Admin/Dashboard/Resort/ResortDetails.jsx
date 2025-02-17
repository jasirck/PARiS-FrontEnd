import React, { useState, useEffect } from "react";
import axios from "../../../../utils/Api";
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
} from "@nextui-org/react";
import { toast } from "sonner";
import { useSelector } from "react-redux";

const ResortDetails = ({ resortId, closeModal }) => {
  const [resort, setResort] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState(null);
  const [visibleImageStartIndex, setVisibleImageStartIndex] = useState(0);
  const {  token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchResortDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/admin-resorts/${resortId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.data) {
          throw new Error("No resort data found");
        }

        setResort(response.data);
        console.log(response.data);

        // Check if resort.images exists and set the selected image
        if (response.data.images && response.data.images.length > 0) {
          setSelectedImage(response.data.images[0]?.image || null);
        } else {
          setSelectedImage(null);
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Failed to fetch resort details";
        toast.error(errorMessage);
        setError(errorMessage);
        console.error("Error fetching resort details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (resortId) {
      fetchResortDetails();
    }
  }, [resortId]);

  // Cloudinary image URL helper
  const getCloudinaryImageUrl = (imageId) => {
    if (!imageId) return null;
    return `https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${imageId}`;
  };

  // Handle image scrolling with smoother animation
  const handleScrollUp = () => {
    setVisibleImageStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleScrollDown = () => {
    setVisibleImageStartIndex((prev) => {
      const maxIndex = Math.max(0, (resort.images?.length || 0) - 3);
      return Math.min(maxIndex, prev + 1);
    });
  };

  // Render loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Render error state
  if (error || !resort) {
    toast.error(error || "Failed to fetch resort details");
    return <div>Error loading resort details</div>;
  }

  // Visible images slice
  const visibleImages =
    resort.images?.slice(visibleImageStartIndex, visibleImageStartIndex + 3) ||
    [];

  return (
    <Modal isOpen={resortId?true:false} onOpenChange={(open) => !open && closeModal}>
      <ModalContent>
        <div className="fixed inset-0 flex items-center justify-center bg-[#01080b] bg-opacity-50 z-50">
          <div className="bg-[#F6F6F6] rounded-2xl overflow-y-auto  shadow-2xl w-11/12 max-w-6xl h-[90%] flex flex-col animate-fade-in">
            <div className=" flex border-b-2 border-[#D4D4CE]">
              <div className="w-[30%] flex flex-col items-center justify-center border-r-2 border-[#D4D4CE] relative">
                {visibleImageStartIndex > 0 && (
                  <button
                    onClick={handleScrollUp}
                    className="absolute top-2 z-10 p-2 bg-[#287094] text-white rounded-full hover:bg-[#023246] transition-all duration-300 ease-in-out transform hover:scale-110 shadow-md"
                  >
                    ▲
                  </button>
                )}

                {/* Image Thumbnails */}
                <div className="flex flex-col space-y-3 max-h-full overflow-hidden">
                  {visibleImages.map((img) => (
                    <div
                      key={img.id}
                      className="transition-all duration-300 ease-in-out transform hover:scale-105"
                    >
                      <img
                        src={getCloudinaryImageUrl(img.image)}
                        alt={`${resort.name} thumbnail`}
                        className={`w-full h-20 object-cover cursor-pointer rounded-lg border-2 transition-all duration-300 ${
                          selectedImage === img.image
                            ? "border-[#287094] opacity-100 shadow-lg"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                        onClick={() => setSelectedImage(img.image)}
                      />
                    </div>
                  ))}
                </div>

                {/* Scroll Down Button */}
                {visibleImageStartIndex + 3 < (resort.images?.length || 0) && (
                  <button
                    onClick={handleScrollDown}
                    className="absolute bottom-2 z-10 p-2 bg-[#287094] text-white rounded-full hover:bg-[#023246] transition-all duration-300 ease-in-out transform hover:scale-110 shadow-md"
                  >
                    ▼
                  </button>
                )}
              </div>

              {/* Selected Image */}
              <div className="w-[70%] flex justify-center items-center bg-[#D4D4CE] p-4">
                {selectedImage ? (
                  <img
                    src={getCloudinaryImageUrl(selectedImage)}
                    alt={`${resort.name} selected view`}
                    className="max-w-full max-h-full object-contain transition-all duration-500 ease-in-out transform hover:scale-105"
                  />
                ) : (
                  <div className="text-[#023246] text-xl">
                    No Image Available
                  </div>
                )}
              </div>
            </div>

            {/* Remaining 60% - Details and Button */}
            <div className="h-[60%] p-6 flex flex-col">
              <h2 className="text-3xl font-bold text-[#023246] mb-4 animate-slide-in-right">
                {resort.name}
              </h2>

              <div className="grid grid-cols-2 gap-4 text-[#287094] mb-4 animate-slide-in-right">
                {[
                  { label: "Location", value: resort.location },
                  { label: "Base Price", value: `₹${resort.base_price}` },
                  { label: "Adult Price", value: `₹${resort.adult_price}` },
                  { label: "Child Price", value: `₹${resort.child_price}` },
                  { label: "Full Refund", value: `${resort.full_refund} Days` },
                  { label: "Half Refund", value: `${resort.half_refund} Days` },
                ].map((item, index) => (
                  <div
                    key={item.label}
                    className="bg-[#F6F6F6] p-3 rounded-lg shadow-sm transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <p className="font-semibold text-[#023246] mb-1">
                      {item.label}
                    </p>
                    <p>{item.value}</p>
                  </div>
                ))}
                <div
                  className="bg-[#F6F6F6] p-3 rounded-lg shadow-sm transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
                  style={{ animationDelay: `${5 * 100}ms` }}
                >
                  <p className="font-semibold text-[#023246] mb-1">Pool</p>
                  <p className="text-[#cd2f2f]">
                    {resort.pool ? "Yes,Have Pool" : "Not Have Pool"}
                  </p>
                </div>
                <div
                  className="bg-[#F6F6F6] p-3 rounded-lg shadow-sm transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
                  style={{ animationDelay: `${5 * 100}ms` }}
                >
                  <p className="font-semibold text-[#023246] mb-1">Valid</p>
                  <p className="text-[#cd2f2f]">
                    {resort.valid ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <div
                className="mb-4 animate-slide-in-right"
                style={{ animationDelay: "400ms" }}
              >
                <p className="text-[#023246] font-semibold mb-2">Policy</p>
                <p className="text-[#287094] bg-[#F6F6F6] p-3 rounded-lg shadow-sm">
                  {resort.policy || "No specific policy"}
                </p>
              </div>
              <ModalFooter>
                <div
                  className="mt-auto animate-slide-in-right"
                  style={{ animationDelay: "500ms" }}
                >
                  <Button
                    onClick={() => setTimeout(closeModal, 300)}
                    className="w-full sm:w-auto bg-[#287094] text-white p-3 mb-6 rounded-lg mt-6 sm:ml-4 hover:bg-[#023246] transition-colors"
                    size="lg"
                  >
                    Close
                  </Button>
                </div>
              </ModalFooter>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default ResortDetails;
