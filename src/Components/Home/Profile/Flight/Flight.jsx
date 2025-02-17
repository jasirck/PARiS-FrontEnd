import React, { useState, useEffect } from "react";
import axios from "../../../../utils/Api";
import { Plane, User, Mail, CreditCard, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import TicketModal from "./TicketModal";
import moment from "moment";

const BookedFlightDetails = () => {
  const [bookedFlights, setBookedFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookedFlights = async () => {
      try {
        const response = await axios.get("/api/booked/flights/");
        console.log("Booked Flights:", response.data);
        setBookedFlights(response.data);
      } catch (error) {
        toast.error("Failed to load flight bookings");
        console.error("Error fetching booked flights:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookedFlights();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-[#F6F6F6] text-[#023246]";
      case "confirmed":
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
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#287094]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="space-y-6">
        {bookedFlights.length === 0 ? (
          <div className="bg-[#D4D4CE] rounded-xl shadow-2xl p-8 text-center">
            <Plane className="w-16 h-16 mx-auto mb-4 text-[#023246]" />
            <h3 className="text-xl font-semibold text-[#023246] mb-2">
              No Bookings Found
            </h3>
            <p className="text-[#023246] mb-6">
              You haven't made any flight bookings yet.
            </p>
            <button
              onClick={() => navigate("/search-flights")}
              className="bg-[#287094] text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors shadow-md"
            >
              Book Your First Flight
            </button>
          </div>
        ) : (
          bookedFlights.map((booking) => (
            <div
              key={booking.id}
              className="bg-[#D4D4CE] rounded-xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-[#023246]">
                    Booking #{booking.id}
                  </h3>
                  <span
                    className={`px-4 py-2 rounded-full ${getStatusColor(
                      booking.conformed
                    )}`}
                  >
                    {booking.conformed}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Plane className="w-10 h-10 text-[#287094]" />
                      <span className="text-[#023246] font-medium">Flight:</span>
                      <span className="text-[#023246]">
                        {booking.flight.flight_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-[#287094]" />
                      <span className="text-[#023246] font-medium">Passenger:</span>
                      <span className="text-[#023246]">
                        {booking.first_name} {booking.last_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-[#287094]" />
                      <span className="text-[#023246] font-medium">Email:</span>
                      <span className="text-[#023246]">{booking.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-[#287094]" />
                      <span className="text-[#023246] font-medium">Price:</span>
                      <span className="text-[#023246]">
                        ₹{booking.flight_price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[#023246] font-medium">Flight Date:</span>
                      <span className="text-[#023246]">
                        {moment(booking.flight.departure_time).format(
                          "MMMM Do YYYY, h:mm A"
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center gap-4 md:items-end">
                    {booking.conformed === "Confirmed" && (
                      <>
                        <button
                          className="flex items-center justify-center gap-2 bg-[#287094] text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors w-full md:w-auto"
                          onClick={() => handleOpenModal(booking)}
                        >
                          <Download className="w-5 h-5" />
                          View Ticket
                        </button>
                        {isCancelAllowed(booking.flight.departure_time) && (
                          <button
                            className="flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors w-full md:w-auto"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            Cancel Booking
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
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
