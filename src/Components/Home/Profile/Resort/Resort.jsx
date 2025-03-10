import React, { useState, useEffect } from "react";
import { Calendar, Users, IndianRupee } from "lucide-react";
import axios from "../../../../utils/Api";
import { useSelector } from "react-redux";
import { Button } from "@nextui-org/react";
import PaymentForm from "../../PaymentForm";
import ResortDetailModal from "./ResortDetails";
import { set } from "react-hook-form";

function Resort() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const token = useSelector((state) => state.auth.token);
  const [selectedResort, setSelectedResort] = useState(null);
  const [resort, setResort] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get("api/booked-resort/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Bookings:", response.data);
        setBookings(response.data);
      } catch (err) {
        setError("Failed to fetch bookings");
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#287094]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
        {error}
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
      />
    );
  }

  return (
    <div className="w-full space-y-6">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-[#D4D4CE] rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl"
        >
          <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
              {/* Left: Package Image */}
              <div className="w-full md:w-auto group">
                <div className="w-full md:w-60 h-32 md:h-36 rounded-xl relative overflow-hidden bg-[#287094] transform transition-transform duration-300 group-hover:scale-105">
                  <img
                    src={`https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${booking.image}`}
                    alt={booking.resort_name}
                    className="absolute inset-0 object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
                  <div className="absolute inset-0 p-4 flex flex-col justify-between">
                    <span className="text-xl md:text-2xl font-medium text-white drop-shadow-lg">
                      {booking.resort_name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle: Trip Details */}
              <div className="flex flex-col space-y-2 md:space-y-4 w-full md:w-auto">
                <div className="flex items-center space-x-3">
                  <IndianRupee className="w-4 h-4 md:w-5 md:h-5 text-[#023246]" />
                  <span className="text-sm text-[#023246]">Amount:</span>
                  <div className="flex flex-col">
                    <span className="text-base md:text-lg font-medium text-[#023246]">
                      Paid: ₹{booking.paid_amount}
                    </span>
                    <span className="text-sm text-[#023246]">
                      Total: ₹{booking.total_amount}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-[#023246]" />
                  <span className="text-sm text-[#023246]">Start Date:</span>
                  <span className="text-base md:text-lg font-medium text-[#023246]">
                    {new Date(booking.start_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-[#023246]" />
                  <span className="text-sm text-[#023246]">End Date:</span>
                  <span className="text-base md:text-lg font-medium text-[#023246]">
                    {new Date(booking.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-[#023246]" />
                  <span className="text-sm text-[#023246]">Guests:</span>
                  <span className="text-base md:text-lg font-medium text-[#023246]">
                    {booking.adult_count} Adults & {booking.child_count}{" "}
                    Children
                  </span>
                </div>
              </div>

              {/* Right: Status Button */}
              <div className="w-full md:w-auto">
                {booking.conformed === "Requested" ? (
                  <Button color="warning">Requested</Button>
                ) : booking.conformed === "Confirmed" ? (
                  <Button
                    color="success"
                    onClick={() => {
                      setSelectedResort(booking.resort);
                      setResort(booking.id);
                    }}
                  >
                    Details
                  </Button>
                ) : booking.conformed === "Declined" ? (
                  <Button color="danger">Rejected</Button>
                ) : booking.conformed === "Cancelled" ? (
                  <Button color="danger">Cancelled</Button>
                ) : (
                  <Button
                    color="primary"
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowPayment(true);
                    }}
                  >
                    Pay Now
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* <div className="h-1 bg-[#287094]" /> */}
        </div>
      ))}

      {bookings.length === 0 && (
        <div className="text-center text-[#023246] p-8 bg-[#D4D4CE] rounded-xl">
          No Packages bookings found.
        </div>
      )}
      {selectedResort && (
        <div>
          <ResortDetailModal
            isOpen={true}
            onClose={() => setSelectedResort(null)}
            ResortId={selectedResort}
            booked_id={resort}
          />
        </div>
      )}
    </div>
  );
}

export default Resort;
