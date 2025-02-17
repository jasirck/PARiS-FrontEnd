import React from "react";
import { Download, X, Plane, Barcode, QrCode } from "lucide-react";

const TicketModal = ({ isOpen, onClose, ticketDetails = {}, onDownload }) => {
  if (!isOpen) return null;

  const {
    id = "N/A",
    departure_time = "N/A",
    arrival_time = "N/A",
    first_name = "John",
    last_name = "Doe",
    flight = "N/A",
    seat_number = "N/A",
    flight_price = 0,
  } = ticketDetails;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-[#023246] text-white">
          <div className="flex items-center gap-3">
            <Plane className="w-6 h-6" />
            <h3 className="text-xl font-semibold">Boarding Pass</h3>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Ticket Content */}
        <div className="p-6">
          {/* Airline Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <img
                src="/api/placeholder/48/48"
                alt="Airline Logo"
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h4 className="text-xl font-bold text-[#023246]">PARIS AIR</h4>
                <p className="text-sm text-gray-600">Your Trusted Travel Partner</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Booking Reference</p>
              <p className="text-lg font-mono font-bold text-[#023246]">#{id}</p>
            </div>
          </div>

          <div className="bg-[#F6F6F6] rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-sm text-gray-600">From</p>
                <p className="text-xl font-bold text-[#023246]">DEL</p>
                <p className="text-sm text-[#023246]">{departure_time}</p>
              </div>
              <div className="flex-1 flex items-center justify-center px-4">
                <div className="w-full flex items-center">
                  <div className="h-[2px] flex-1 bg-[#023246]"></div>
                  <Plane className="w-6 h-6 mx-2 text-[#023246] transform rotate-90" />
                  <div className="h-[2px] flex-1 bg-[#023246]"></div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">To</p>
                <p className="text-xl font-bold text-[#023246]">BOM</p>
                <p className="text-sm text-[#023246]">{arrival_time}</p>
              </div>
            </div>

            {/* Passenger Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Passenger</p>
                  <p className="text-lg font-semibold text-[#023246]">
                    {first_name} {last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Flight</p>
                  <p className="text-lg font-semibold text-[#023246]">{flight}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Seat</p>
                  <p className="text-lg font-semibold text-[#023246]">{seat_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gate</p>
                  <p className="text-lg font-semibold text-[#023246]">A12</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <Barcode className="w-32 h-16 text-[#023246]" />
              <QrCode className="w-16 h-16 text-[#023246]" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-[#023246]">
                ₹{flight_price.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
          <button
            onClick={onDownload}
            className="flex items-center justify-center gap-2 bg-[#287094] text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            <Download className="w-5 h-5" />
            Download Boarding Pass
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
