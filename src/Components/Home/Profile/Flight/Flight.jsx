import React, { useState, useEffect } from "react";
import axios from "../../../../utils/Api";
import { Plane, User, Mail, CreditCard, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import TicketModal from "./TicketModal";
import moment from "moment";
import { setProfileFlight } from "../../../Toolkit/Slice/apiHomeSlice";
import { useDispatch, useSelector } from "react-redux";

const BookedFlightDetails = () => {
  const [bookedFlights, setBookedFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const profile_flight = useSelector((state) => state.api.profile_flight);

  useEffect(() => {
    const fetchBookedFlights = async () => {
      if (!profile_flight) {
        setLoading(true);
      
        axios
          .get("/api/booked/flights/", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            console.log("Booked Flights:", response.data);
            
            dispatch(setProfileFlight(response.data));
            setBookedFlights(response.data);
            setLoading(false); 
          })
          .catch((error) => {
            console.error("Error fetching Holiday:", error);
            toast.error("Failed to fetch Holiday requests");
            setLoading(false); 
          });
      } else {
        setBookedFlights(profile_flight);
        setLoading(false);
      }
    };

    fetchBookedFlights();
  }, [dispatch, profile_flight, token]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":        
        return "bg-[#F6F6F6] text-[#023246]";
      case "Confirmed":
        return "bg-green-600 text-white";
      default:
        return "bg-red-500 text-white";
    }
  };

  const handleOpenModal = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  const handleDownloadTicket = () => {
    if (selectedTicket) {
      navigate(`/download-ticket/${selectedTicket.id}`);
    }
  };

  const handleCancelBooking = async (ticketId) => {
    try {
      await axios.post(`/api/booked/flights/cancel/${ticketId}/`);
      toast.success("Booking cancelled successfully");
      setBookedFlights((prev) => prev.filter((flight) => flight.id !== ticketId));
      dispatch(setProfileFlight(bookedFlights.filter((flight) => flight.id !== ticketId)));
    } catch (error) {
      toast.error("Failed to cancel booking");
      console.error("Error cancelling booking:", error);
    } finally {
      setIsModalOpen(false);
    }
  };

  const isCancelAllowed = (flightDate) => {
    const currentDate = moment();
    const flightMoment = moment(flightDate);
    return flightMoment.diff(currentDate, "days") > 1;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#287094]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-4xl">
      <div className="space-y-6">
        {bookedFlights.length === 0 ? (
          <div className="bg-gradient-to-br from-[#D4D4CE] to-[#E5E5E1] rounded-xl shadow-2xl p-6 md:p-8 text-center">
            <div className="bg-[#F6F6F6] rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Plane className="w-12 h-12 mx-auto text-[#287094]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#023246] mb-3">
              No Bookings Found
            </h3>
            <p className="text-sm sm:text-base text-[#023246] mb-6 max-w-md mx-auto">
              You haven't made any flight bookings yet. Start planning your journey today!
            </p>
            <button
              onClick={() => navigate("/search-flights")}
              className="bg-[#287094] text-white text-sm sm:text-base px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-[#1a5c7a] transition-colors shadow-md transform hover:scale-105 duration-200"
            >
              Book Your First Flight
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {bookedFlights.map((booking) => (
              <div
                key={booking.id}
                className="bg-gradient-to-br from-[#D4D4CE] to-[#E5E5E1] rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl transform hover:translate-y-[-2px]"
              >
                <div className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#287094] rounded-full p-2 flex items-center justify-center">
                        <Plane className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#023246]">
                        Booking #{booking.id}
                      </h3>
                    </div>
                    <span
                      className={`text-xs sm:text-sm px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-medium ${getStatusColor(
                        booking.conformed
                      )}`}
                    >
                      {booking.conformed}
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3 bg-white bg-opacity-50 p-3 sm:p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Plane className="w-4 sm:w-5 h-4 sm:h-5 text-[#287094] mt-1 flex-shrink-0" />
                        <div>
                          <span className="text-[#023246] text-xs sm:text-sm font-medium block">Flight:</span>
                          <span className="text-[#023246] text-sm sm:text-base md:text-lg">{booking.flight.flight_number}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <User className="w-4 sm:w-5 h-4 sm:h-5 text-[#287094] mt-1 flex-shrink-0" />
                        <div>
                          <span className="text-[#023246] text-xs sm:text-sm font-medium block">Passenger:</span>
                          <span className="text-[#023246] text-sm sm:text-base">
                            {booking.first_name} {booking.last_name}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Mail className="w-4 sm:w-5 h-4 sm:h-5 text-[#287094] mt-1 flex-shrink-0" />
                        <div>
                          <span className="text-[#023246] text-xs sm:text-sm font-medium block">Email:</span>
                          <span className="text-[#023246] text-sm sm:text-base break-words">{booking.email}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <CreditCard className="w-4 sm:w-5 h-4 sm:h-5 text-[#287094] mt-1 flex-shrink-0" />
                        <div>
                          <span className="text-[#023246] text-xs sm:text-sm font-medium block">Price:</span>
                          <span className="text-[#023246] text-sm sm:text-base md:text-lg font-bold">
                            ₹{booking.flight_price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-white bg-opacity-50 p-3 sm:p-4 rounded-lg">
                        <div className="mb-1 sm:mb-2">
                          <span className="text-[#023246] text-xs sm:text-sm font-medium">Flight Date:</span>
                        </div>
                        <div className="text-[#023246] text-sm sm:text-base md:text-lg font-bold">
                          {moment(booking.flight.departure_time).format("MMM Do YYYY")}
                        </div>
                        <div className="text-[#287094] text-sm sm:text-base">
                          {moment(booking.flight.departure_time).format("h:mm A")}
                        </div>
                      </div>
                      
                      {booking.conformed === "Confirmed" && (
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                          <button
                            className="flex items-center justify-center gap-2 bg-[#287094] text-white text-xs sm:text-sm px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-[#1a5c7a] transition-colors w-full sm:flex-1"
                            onClick={() => handleOpenModal(booking)}
                          >
                            <Download className="w-4 sm:w-5 h-4 sm:h-5" />
                            View Ticket
                          </button>
                          {isCancelAllowed(booking.flight.departure_time) && (
                            <button
                              className="flex items-center justify-center gap-2 bg-red-500 text-white text-xs sm:text-sm px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-red-600 transition-colors w-full sm:flex-1"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <TicketModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        ticketDetails={selectedTicket}
        onDownload={handleDownloadTicket}
      />
    </div>
  );
};

export default BookedFlightDetails;