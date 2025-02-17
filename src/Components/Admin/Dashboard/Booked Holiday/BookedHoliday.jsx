import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../../utils/Api";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Button } from "@nextui-org/react";

function HolidayBooking({handletrackid}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [bookedHolidays, setBookedHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state.auth);

  // Fixed filter function
  const filteredRequests = useMemo(() => {
    if (!Array.isArray(bookedHolidays)) return [];

    return bookedHolidays.filter((request) =>
      request.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, bookedHolidays]);

  useEffect(() => {
    fetchBookedHolidays();
  }, [token]);

  const fetchBookedHolidays = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin-booked-holidays/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookedHolidays(response.data);
    } catch (err) {
      setError("Failed to fetch Holiday Requests.");
      toast.error("Failed to fetch holiday requests");
    } finally {
      setLoading(false);
    }
  };
  const handleHolidayApproval = async (requestId) => {
    try {
      await axios.post(
        "/api/admin-booked-holidays/",
        { id: requestId , status: "Approved"},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Holiday request approved successfully");
      fetchBookedHolidays();
    } catch (err) {
      console.error("Error approving holiday request:", err);
      toast.error("Failed to approve holiday request");
    }
  };

  const handleHolidayDecline = async (requestId) => {
    try {
      await axios.post(
        "/api/admin-booked-holidays/",
        { id: requestId , status: "Declined"},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Holiday request declined successfully");
      fetchBookedHolidays();
    } catch (err) {
      toast.error("Failed to decline holiday request");
    }
  };

  if (loading) {
    return <div className="p-4">Loading Holiday Requests...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Holiday Requests
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by user name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-[#D4D4CE] bg-[#F6F6F6] p-2 rounded-lg text-[#023246] placeholder-[#287094] focus:ring-2 focus:ring-[#287094] focus:outline-none shadow-sm transition duration-300"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="grid grid-cols-10 gap-2 text-gray-700 font-semibold border-b border-gray-300 py-2">
              <th className="text-left">User</th>
              <th className="text-left">Contact</th>
              <th className="text-left">Holiday Id</th>
              <th className="text-left">Holiday Name</th>
              <th className="text-left">Adult Count</th>
              <th className="text-left">Child Count</th>
              <th className="text-left">Total Amount</th>
              <th className="text-left">Booking Date</th>
              <th className="text-left col-span-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((booking) => (
              <tr
                key={booking.id}
                className="grid grid-cols-10 gap-2 items-center py-3 border-b border-gray-200 hover:bg-gray-50 transition-all"
              >
                <td>{booking.user_name}</td>
                <td className=" overflow-x-auto whitespace-nowrap">
                  {booking.user_phone_number || booking.user_email}
                </td>
                <td onClick={() => handletrackid('Holiday','/admin/holiday',booking.package,'holiday')} className="ml-8">{booking.package}</td>
                <td>{booking.package_name}</td>
                <td>{booking.adult_count}</td>
                <td>{booking.child_count}</td>
                <td>{booking.total_amount}</td>
                <td>{booking.date}</td>
                <td className="col-span-2">
                  {booking.conformed === "Requested" ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleHolidayApproval(booking.id)}
                        color="success"
                        variant="flat"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleHolidayDecline(booking.id)}
                        color="danger"
                        variant="flat"
                      >
                        Decline
                      </Button>
                    </div>
                  ) : booking.conformed === "Approved" ? (
                    <Button color="warning" variant="flat">
                      Pending
                    </Button>
                  ) : booking.conformed === "Confirmed" ? (
                    <Button color="success" variant="flat">
                      Confirmed
                    </Button>
                  ) : (
                    <Button color="danger" variant="flat">
                      Declined
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HolidayBooking;
