import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import VisaBookingModal from './Booking'; 

const VisaDetails = ({ isOpen, onClose, visa }) => {
  const [isBookingModalOpen, setBookingModalOpen] = useState(false);

  const openBookingModal = () => {
    setBookingModalOpen(true);  // Open the booking modal without closing the details modal
  };

  const closeBookingModal = () => {
    setBookingModalOpen(false); // Close the booking modal
  };

  const visaDays = visa?.visa_days || [];
  const category = visa?.category;

  // Format price with commas
  const formatPrice = (price) => {
    return Number(price).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });
  };
  if (isBookingModalOpen)
    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center">
      <VisaBookingModal
        isModalOpen={isBookingModalOpen}
        handleVisaModalClose={closeBookingModal}
        visa={visa}
      />
    </div>
    )
    // {isBookingModalOpen && ()}

  return (
    <>
    
      <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            {visa?.name} Visa
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left Section - Image & Location */}
              <div className="md:w-1/2">
                <div className="relative">
                  <img
                  src={`https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${visa?.place_photo}`}
                    alt={visa?.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  {category && (
                    <span className="absolute top-2 left-2 bg-blue-500 text-white text-sm px-2 py-1 rounded-full">
                      {category?.name}
                    </span>
                  )}
                </div>
                <div className="text-center mt-4">
                  <p className="text-lg font-semibold text-gray-700">
                    {visa?.location || visa?.name}
                  </p>
                </div>
              </div>

              {/* Right Section - Visa Details */}
              <div className="md:w-1/2">
                <p className="text-gray-600 mb-4">{visa?.note}</p>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Available Visa Options</h3>

                  {visaDays.length > 0 ? (
                    <div className="space-y-3">
                      {visaDays.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                        >
                          <span className="font-medium">{option.days} Days</span>
                          <span className="font-semibold">{formatPrice(option.price)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No visa options available</p>
                  )}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Close
            </Button>
            <Button color="primary" onPress={openBookingModal}>
              Apply Now
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      
    </>
  );
};

export default VisaDetails;
