import React, { useRef } from "react";
import { Download, X, Plane, Barcode, QrCode, Camera } from "lucide-react";
import html2canvas from "html2canvas";

const TicketModal = ({ isOpen, onClose, ticketDetails = {}, onDownload }) => {
  if (!isOpen) return null;
  
  const ticketRef = useRef(null);

  const {
    id = "N/A",
    first_name = "John",
    last_name = "Doe",
    flight = {},
    flight_price = 0,
  } = ticketDetails;

  // Extract flight details
  const {
    flight_number = "N/A",
    departure_city = "N/A",
    arrival_city = "N/A",
    departure_date,
    arrival_date,
  } = flight || {};

  // Format departure and arrival times
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) + ', ' + date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const departure_time = formatDateTime(departure_date);
  const arrival_time = formatDateTime(arrival_date);

  // Get airport codes from city names
  const getDepartureCode = (city) => {
    if (city.includes("Heathrow")) return "LHR";
    // Add more mappings as needed
    return city.substring(0, 3).toUpperCase();
  };

  const getArrivalCode = (city) => {
    if (city.includes("Indira Gandhi")) return "DEL";
    // Add more mappings as needed
    return city.substring(0, 3).toUpperCase();
  };

  const departureCode = getDepartureCode(departure_city);
  const arrivalCode = getArrivalCode(arrival_city);

  // Format price
  const formattedPrice = typeof flight_price === 'string' 
    ? parseFloat(flight_price).toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
      })
    : flight_price.toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
      });

  // Generate a random seat number if not provided
  const seat_number = "24A";
  
  // Handle download functionality
  const handleDownload = () => {
    if (ticketRef.current) {
      html2canvas(ticketRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: "#ffffff"
      }).then(canvas => {
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `boarding-pass-${id}.png`;
        link.href = image;
        link.click();
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl sm:max-w-2xl rounded-lg shadow-2xl overflow-hidden relative">
        {/* Close button - positioned absolutely in top right corner */}
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-[#023246] to-[#0f5175] text-white">
          <div className="flex items-center gap-2 sm:gap-3">
            <Plane className="w-5 h-5 sm:w-6 sm:h-6" />
            <h3 className="text-lg sm:text-xl font-semibold">Boarding Pass</h3>
          </div>
        </div>

        {/* Ticket Content */}
        <div ref={ticketRef} className="p-4 sm:p-6 bg-white">
          {/* Airline Header */}
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#023246] to-[#287094] flex items-center justify-center text-white">
                <Plane className="w-5 h-5 sm:w-6 sm:h-6 transform rotate-45" />
              </div>
              <div>
                <h4 className="text-base sm:text-xl font-bold text-[#023246]">PARIS AIR</h4>
                <p className="text-xs sm:text-sm text-gray-600">Your Trusted Travel Partner</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm text-gray-600">Booking Reference</p>
              <p className="text-sm sm:text-lg font-mono font-bold text-[#023246]">#{id}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#F6F6F6] to-[#F0F0F0] rounded-lg p-3 sm:p-6 mb-4 sm:mb-6 shadow-sm border border-gray-100">
            {/* Demo image of a plane in the sky */}
            <div className="w-full h-24 sm:h-32 mb-3 sm:mb-4 overflow-hidden rounded-lg relative">
              <img
                src="/api/placeholder/800/320"
                alt="Flight"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(2,50,70,0.7)] flex items-end p-2 sm:p-4">
                <p className="text-white font-semibold text-xs sm:text-sm">
                  {departure_city} to {arrival_city}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">From</p>
                <p className="text-base sm:text-xl font-bold text-[#023246]">{departureCode}</p>
                <p className="text-xs sm:text-sm text-[#023246] break-words max-w-[100px] sm:max-w-none">{departure_time}</p>
              </div>
              <div className="flex-1 flex items-center justify-center px-2 sm:px-4">
                <div className="w-full flex items-center">
                  <div className="h-[2px] flex-1 bg-[#023246] relative">
                    <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-[#023246]"></div>
                  </div>
                  <Plane className="w-5 h-5 sm:w-6 sm:h-6 mx-1 sm:mx-2 text-[#023246] transform rotate-90" />
                  <div className="h-[2px] flex-1 bg-[#023246] relative">
                    <div className="absolute -top-1 left-0 w-2 h-2 rounded-full bg-[#023246]"></div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm text-gray-600">To</p>
                <p className="text-base sm:text-xl font-bold text-[#023246]">{arrivalCode}</p>
                <p className="text-xs sm:text-sm text-[#023246] break-words max-w-[100px] sm:max-w-none">{arrival_time}</p>
              </div>
            </div>

            {/* Passenger Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
              <div className="space-y-2 sm:space-y-3">
                <div className="bg-white p-2 sm:p-3 rounded-md shadow-sm">
                  <p className="text-xs sm:text-sm text-gray-600">Passenger</p>
                  <p className="text-sm sm:text-lg font-semibold text-[#023246] truncate">
                    {first_name} {last_name}
                  </p>
                </div>
                <div className="bg-white p-2 sm:p-3 rounded-md shadow-sm">
                  <p className="text-xs sm:text-sm text-gray-600">Flight</p>
                  <p className="text-sm sm:text-lg font-semibold text-[#023246]">{flight_number}</p>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="bg-white p-2 sm:p-3 rounded-md shadow-sm">
                  <p className="text-xs sm:text-sm text-gray-600">Seat</p>
                  <p className="text-sm sm:text-lg font-semibold text-[#023246]">{seat_number}</p>
                </div>
                <div className="bg-white p-2 sm:p-3 rounded-md shadow-sm">
                  <p className="text-xs sm:text-sm text-gray-600">Gate</p>
                  <p className="text-sm sm:text-lg font-semibold text-[#023246]">A12</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
            <div className="flex gap-2 sm:gap-4 order-2 sm:order-1">
              <div className="p-1 sm:p-2 bg-gray-50 rounded-md">
                <Barcode className="w-24 h-12 sm:w-32 sm:h-16 text-[#023246]" />
              </div>
              <div className="p-1 sm:p-2 bg-gray-50 rounded-md">
                <QrCode className="w-12 h-12 sm:w-16 sm:h-16 text-[#023246]" />
              </div>
            </div>
            <div className="text-right bg-[#f8f8f8] p-2 sm:p-3 rounded-lg border-l-4 border-[#023246] w-full sm:w-auto order-1 sm:order-2">
              <p className="text-xs sm:text-sm text-gray-600">Total Paid</p>
              <p className="text-xl sm:text-2xl font-bold text-[#023246]">
                ₹{formattedPrice}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t flex justify-between sm:justify-end">
          <button 
            onClick={onClose}
            className="flex items-center justify-center gap-1 sm:gap-2 bg-gray-200 text-gray-700 px-3 sm:px-5 py-2 sm:py-3 rounded-lg hover:bg-gray-300 transition-colors sm:hidden"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
            Close
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-[#023246] to-[#287094] text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg hover:opacity-90 transition-opacity shadow-md"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Download Pass</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;