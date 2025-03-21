import React, { useState, useEffect } from "react";
import { Calendar, Users, IndianRupee } from "lucide-react";
import axios from "../../../../utils/Api";
import { useSelector } from "react-redux";
import { Button } from "@nextui-org/react";
import PaymentForm from "../../PaymentForm";
import ResortDetailModal from "./ResortDetails";

function Resort() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedResort, setSelectedResort] = useState(null);
  const [selectedBookedId, setSelectedBookedId] = useState(null);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    fetchBookings();
  }, [token]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get("api/booked-resort/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setBookings(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to fetch bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (booking) => {
    setSelectedBooking(booking);
    setShowPayment(true);
  };

  const handleViewDetails = (resortId, bookedId) => {
    console.log("Opening modal with resortId:", resortId, "bookedId:", bookedId);
    setSelectedResort(resortId);
    setSelectedBookedId(bookedId);
  };

  const renderBookingStatus = (booking) => {
    switch (booking.conformed) {
      case "Requested":
        return <Button color="warning">Requested</Button>;
      case "Confirmed":
        return (
          <Button
            color="success"
            onClick={() => handleViewDetails(booking.resort, booking.id)}
          >
            Details
          </Button>
        );
      case "Declined":
        return <Button color="danger">Rejected</Button>;
      case "Cancelled":
        return <Button color="danger">Cancelled</Button>;
      default:
        return (
          <Button color="primary" onClick={() => handlePayNow(booking)}>
            Pay Now
          </Button>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#287094]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg flex flex-col items-center">
        <p className="mb-3">{error}</p>
        <Button color="primary" size="sm" onClick={fetchBookings}>
          Try Again
        </Button>
      </div>
    );
  }

  if (showPayment && selectedBooking) {
    return (
      <PaymentForm
        amount={selectedBooking.total_amount}
        name={selectedBooking.user_name}
        booked_id={selectedBooking.id}
        category={"resort"}
        onClose={() => setShowPayment(false)}
      />
    );
  }

  return (
    <div className="w-full space-y-6">
      {bookings.length > 0 ? (
        bookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-[#D4D4CE] rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
          >
            <div className="p-4 md:p-6" onClick={() => handleViewDetails(booking.resort, booking.id)}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                {/* Resort Image */}
                <div className="w-full md:w-auto group">
                  <div className="w-full md:w-60 h-32 md:h-36 rounded-xl relative overflow-hidden bg-[#287094] transform transition-transform duration-300 group-hover:scale-105">
                    <img
                      src={`https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${booking.image}`}
                      alt={booking.resort_name}
                      className="absolute inset-0 object-cover w-full h-full"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/240x150?text=Resort+Image";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
                    <div className="absolute inset-0 p-4 flex flex-col justify-between">
                      <span className="text-xl md:text-2xl font-medium text-white drop-shadow-lg">
                        {booking.resort_name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Resort Details */}
                <div className="flex flex-col space-y-2 md:space-y-4 w-full md:w-auto">
                  <div className="flex items-center space-x-3">
                    <IndianRupee className="w-4 h-4 md:w-5 md:h-5 text-[#023246]" />
                    <span className="text-sm text-[#023246]">Amount:</span>
                    <div className="flex flex-col">
                      <span className="text-base md:text-lg font-medium text-[#023246]">
                        Paid: ₹{booking.paid_amount.toLocaleString()}
                      </span>
                      <span className="text-sm text-[#023246]">
                        Total: ₹{booking.total_amount.toLocaleString()}
                      </span>
                      {booking.paid_amount < booking.total_amount && (
                        <span className="text-xs text-amber-700">
                          Balance: ₹{(booking.total_amount - booking.paid_amount).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 md:w-5 md:h-5 text-[#023246]" />
                    <span className="text-sm text-[#023246]">Stay Period:</span>
                    <span className="text-base md:text-lg font-medium text-[#023246]">
                      {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="w-4 h-4 md:w-5 md:h-5 text-[#023246]" />
                    <span className="text-sm text-[#023246]">Guests:</span>
                    <span className="text-base md:text-lg font-medium text-[#023246]">
                      {booking.adult_count} {booking.adult_count === 1 ? "Adult" : "Adults"} & {booking.child_count}{" "}
                      {booking.child_count === 1 ? "Child" : "Children"}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="w-full md:w-auto flex items-center justify-center mt-3 md:mt-0">
                  {renderBookingStatus(booking)}
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-[#023246] p-8 bg-[#D4D4CE] rounded-xl shadow">
          <p className="text-lg font-medium mb-3">No Resort Bookings Found</p>
          <p className="text-sm">Your resort bookings will appear here once you make a reservation.</p>
        </div>
      )}

      {selectedResort && (
        <ResortDetailModal
          isOpen={!!selectedResort}
          onClose={() => {
            setSelectedResort(null);
            setSelectedBookedId(null);
          }}
          ResortId={selectedResort}
          booked_id={selectedBookedId}
        />
      )}
    </div>
  );
}

export default Resort;