import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Divider, Chip } from "@nextui-org/react";
import { IoAirplane, IoTime, IoCalendarClear, IoInformation, IoCheckmarkCircle, IoWarning } from "react-icons/io5";

const FlightDetailsModal = ({ isOpen, onClose, flight, onBookNow }) => {
  // Early return if no flight data
  if (!flight) return null;

  // Formatting utility functions (reusing from parent component)
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return {
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      date: date.toLocaleDateString("en-US", {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      full: date.toLocaleString("en-US", {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    };
  };

  const formatDuration = (departureTime, arrivalTime) => {
    const departureDate = new Date(departureTime);
    const arrivalDate = new Date(arrivalTime);
    const durationMinutes = Math.floor((arrivalDate - departureDate) / 60000);
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return { hours, minutes };
  };

  // Calculate price based on duration
  const duration = formatDuration(flight.departure.scheduled, flight.arrival.scheduled);
  const price = (duration.hours * 60 + duration.minutes) * 27 * 1.05;

  // Format departure and arrival times
  const departure = formatDateTime(flight.departure.scheduled);
  const arrival = formatDateTime(flight.arrival.scheduled);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent className="max-h-[90vh]">
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-[#023246]">Flight Details</h2>
              <p className="text-sm text-[#287094]">
                {flight.departure.iata} to {flight.arrival.iata} • {departure.date}
              </p>
            </ModalHeader>
            
            <ModalBody>
              {/* Airline Information */}
              <div className="bg-[#F6F6F6] p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-[#023246]">
                    {flight.airline.name}
                  </h3>
                  <Chip color="primary" variant="flat" size="sm">
                    Flight {flight.flight.number}
                  </Chip>
                </div>
                <p className="text-sm text-[#287094]">
                  Aircraft: {flight.aircraft?.model || 'Standard Aircraft'}
                </p>
              </div>

              {/* Flight Timeline */}
              <div className="mt-6 relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#D4D4CE]"></div>
                
                {/* Departure */}
                <div className="flex mb-8 relative">
                  <div className="h-8 w-8 rounded-full bg-[#287094] text-white flex items-center justify-center z-10 mr-4">
                    <IoAirplane className="-rotate-45" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#023246]">Departure</h4>
                    <p className="text-xl font-bold text-[#287094]">{departure.time}</p>
                    <p className="text-sm text-gray-600">{departure.full}</p>
                    
                    <div className="mt-2">
                      <p className="font-medium text-[#023246]">{flight.departure.airport}</p>
                      <p className="text-sm text-gray-600">Terminal: {flight.departure.terminal || 'TBD'}</p>
                      <p className="text-sm text-gray-600">Gate: {flight.departure.gate || 'TBD'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Flight Duration */}
                <div className="flex mb-8 relative">
                  <div className="h-8 w-8 rounded-full bg-[#D4D4CE] flex items-center justify-center z-10 mr-4">
                    <IoTime className="text-[#287094]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#023246]">Duration</h4>
                    <p className="text-lg text-[#287094]">
                      {duration.hours}h {duration.minutes}m • Non-stop
                    </p>
                    <p className="text-sm text-gray-600">Distance: ~{Math.floor(duration.hours * 800 + duration.minutes * 13)} km</p>
                  </div>
                </div>
                
                {/* Arrival */}
                <div className="flex relative">
                  <div className="h-8 w-8 rounded-full bg-[#287094] text-white flex items-center justify-center z-10 mr-4">
                    <IoAirplane className="rotate-45" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#023246]">Arrival</h4>
                    <p className="text-xl font-bold text-[#287094]">{arrival.time}</p>
                    <p className="text-sm text-gray-600">{arrival.full}</p>
                    
                    <div className="mt-2">
                      <p className="font-medium text-[#023246]">{flight.arrival.airport}</p>
                      <p className="text-sm text-gray-600">Terminal: {flight.arrival.terminal || 'TBD'}</p>
                      <p className="text-sm text-gray-600">Baggage Claim: {flight.arrival.baggage || 'TBD'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Divider className="my-6" />
              
              {/* Price Details */}
              <div>
                <h3 className="text-lg font-semibold text-[#023246] mb-4">Price Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#287094]">Base Fare</span>
                    <span>₹{Math.floor(price * 0.85).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#287094]">Taxes & Fees</span>
                    <span>₹{Math.floor(price * 0.15).toLocaleString('en-IN')}</span>
                  </div>
                  <Divider className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span className="text-[#023246]">Total Amount</span>
                    <span className="text-[#287094]">₹{price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <p className="text-xs text-gray-500 text-right">per person</p>
                </div>
              </div>
              
              {/* Baggage Information */}
              <div className="mt-6 bg-[#F6F6F6] p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <IoInformation className="text-[#287094]" />
                  <h3 className="text-md font-semibold text-[#023246]">Baggage Information</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#287094]">Cabin Baggage</span>
                    <span>7 kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#287094]">Check-in Baggage</span>
                    <span>15 kg</span>
                  </div>
                </div>
              </div>
              
              {/* Important Notes */}
              <div className="mt-4">
                <h3 className="text-md font-semibold text-[#023246] mb-2">Important Notes</h3>
                <ul className="space-y-1 text-sm text-[#287094]">
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span>Check-in counters close 60 minutes before departure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <IoCheckmarkCircle className="text-green-500 mt-1 flex-shrink-0" />
                    <span>Web check-in available 48 hours to 60 minutes before departure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <IoWarning className="text-amber-500 mt-1 flex-shrink-0" />
                    <span>Schedule and terminal information subject to change</span>
                  </li>
                </ul>
              </div>
            </ModalBody>
            
            <ModalFooter>
              <Button 
                color="danger" 
                variant="light" 
                onPress={onClose}
              >
                Close
              </Button>
              <Button 
                size="lg"
                className="bg-[#287094] text-white hover:bg-[#023246] transition-all duration-300"
                onPress={() => {
                  onBookNow(flight);
                  onClose();
                }}
              >
                Book Now
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default FlightDetailsModal;