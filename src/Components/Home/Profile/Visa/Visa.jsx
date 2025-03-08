import React, { useState, useEffect } from "react";
import { Calendar, Users, Image } from "lucide-react";
import axios from "../../../../utils/Api";
import { Button } from "@nextui-org/react";
import PaymentForm from "../../PaymentForm";
// import VisaDetailModal from "./VisaDetails";
import { setProfileVisa } from "../../../Toolkit/Slice/apiHomeSlice";
import { useDispatch, useSelector } from "react-redux";

function Visa() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const profile_visa = useSelector((state) => state.api.profile_visa);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {






      if (!profile_visa) {
        setLoading(true); // Start loading before the API call
      
        axios
          .get("api/booked-visa/", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            dispatch(setProfileVisa(response.data));
            setBookings(response.data);
      
            // const initialCountdowns = {};
            // response.data.forEach((booking) => {
            //   if (booking.conformed === "Confirmed") {
            //     const targetTime = new Date(booking.date).getTime();
            //     const now = new Date().getTime();
            //     const timeLeft = Math.max(0, targetTime - now); 
            //     initialCountdowns[booking.id] = timeLeft;
            //   }
            // });
      
            // setCountdowns(initialCountdowns);
            setLoading(false); 
          })
          .catch((error) => {
            console.error("Error fetching visa:", error);
            setError("Failed to fetch visa Requests.");
            toast.error("Failed to fetch visa requests");
            setLoading(false); 
          });
      } else {
        setBookings(profile_visa);
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

    if (showPayment ) {
      return (
        <PaymentForm
          amount={selectedBooking.price}
          name={selectedBooking.booked_visa_name}
          booked_id={selectedBooking.id}
          category={"visa"}
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
              {/* Left: Passport and Personal Photos */}
              <div className="w-full md:w-auto group">
                <div className="w-full md:w-60 h-32 md:h-36 rounded-xl relative overflow-hidden bg-[#287094] transform transition-transform duration-300 group-hover:scale-105">
                  <img
                    src={`https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${booking.booked_visa_place_photo}`}
                    alt="Passport Photo"
                    className="absolute inset-0 object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
                </div>
                
              </div>

              {/* Middle: Visa Details */}
              <div className="flex flex-col space-y-2 md:space-y-4 w-full md:w-auto">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-[#023246]">Visa Name:</span>
                  <span className="text-base md:text-lg font-medium text-[#023246]">
                    {booking.booked_visa_name}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-[#023246]" />
                  <span className="text-sm text-[#023246]">Booking Date:</span>
                  <span className="text-base md:text-lg font-medium text-[#023246]">
                    {new Date(booking.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-[#023246]">Days:</span>
                  <span className="text-base md:text-lg font-medium text-[#023246]">
                    {booking.day}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-[#023246]">Price:</span>
                  <span className="text-base md:text-lg font-medium text-[#023246]">
                    {booking.price}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-4 h-4 md:w-5 md:h-5 text-[#023246]" />
                  <span className="text-sm text-[#023246]">Booked By:</span>
                  <span className="text-base md:text-lg font-medium text-[#023246]">
                    {booking.user_name}
                  </span>
                </div>
              </div>

              {/* Right: Status Button */}
              <div className="w-full md:w-auto">
                {booking.conformed === "Requested" ? (
                  <Button onClick={() => {
                    setSelectedBooking(booking);
                    setShowPayment(true);
                  }}
                  color="primary">Pay Now</Button>
                ) : booking.conformed === "Confirmed" ? (
                  <Button
                    color="warning"
                    onClick={() => setShowDetails(true)}
                  >
                    Confirmed
                  </Button>
                ) : booking.conformed === "Declined" ? (
                  <Button color="danger">Declined</Button>
                ) 
                : (
                  <Button color="success">Aproved</Button>
                )
                }
              </div>
            </div>
          </div>
        </div>
      ))}

      {bookings.length === 0 && (
        <div className="text-center text-[#023246] p-8 bg-[#D4D4CE] rounded-xl">
          No Visa bookings found.
        </div>
      )}
      {/* {showDetails && selectedBooking && (
        <VisaDetailModal
          isOpen={true}
          onClose={() => setShowDetails(false)}
          booking={selectedBooking}
        />
      )} */}
    </div>
  );
}

export default Visa;
