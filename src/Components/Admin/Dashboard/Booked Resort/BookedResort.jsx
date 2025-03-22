import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../../utils/Api";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Button } from "@nextui-org/react";
import { setsliceResorts } from "../../../Toolkit/Slice/apiHomeSlice";

function BookedResort({ handletrackid }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [bookedResort, setBookedResort] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const booked_resorts = useSelector((state) => state.api.booked_resorts);

  // Filtered requests using useMemo for optimization
  const filteredRequests = useMemo(() => {
    if (!Array.isArray(bookedResort)) return [];
    return bookedResort.filter((request) =>
      request.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, bookedResort]);

  useEffect(() => {
    fetchBookedResort();
  }, [token]);

  const fetchBookedResort = async () => {
    setLoading(true);

    if (!booked_resorts) {
      axios
        .get("/api/admin-booked-resort/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          dispatch(setsliceResorts(response.data));
          setBookedResort(response.data);
        })
        .catch((error) => {
          console.error("Error fetching Resort:", error);
          setError("Failed to fetch Resort Requests.");
          toast.error("Failed to fetch Resort requests");
        });
      setLoading(false);
    } else {
      setBookedResort(booked_resorts);
      setLoading(false);
    }
  };

  const handleHolidayApproval = async (requestId) => {
    try {
      await axios.post(
        "/api/admin-booked-resort/",
        { id: requestId, status: "Approved" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(setsliceResorts(null));
      toast.success("Holiday request approved successfully");
      fetchBookedResort();
    } catch (err) {
      console.error("Error approving holiday request:", err);
      toast.error("Failed to approve holiday request");
    }
  };

  const handleHolidayDecline = async (requestId) => {
    try {
      await axios.post(
        "/api/admin-booked-resort/", // Fixed endpoint to match resort API
        { id: requestId, status: "Declined" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(setsliceResorts(null));
      toast.success("Holiday request declined successfully");
      fetchBookedResort();
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Resort Booking Requests
        </h2>
        <div className="w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by user name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-[#D4D4CE] bg-[#F6F6F6] p-2 rounded-lg text-[#023246] placeholder-[#287094] focus:ring-2 focus:ring-[#287094] focus:outline-none shadow-sm transition duration-300"
          />
        </div>
      </div>

      {/* Desktop view: Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="grid grid-cols-11 gap-2 text-gray-700 font-semibold border-b border-gray-300 py-2">
              <th className="text-left">User</th>
              <th className="text-left">Contact</th>
              <th className="text-left">Resort Id</th>
              <th className="text-left">Resort Name</th>
              <th className="text-left">Adult Count</th>
              <th className="text-left">Child Count</th>
              <th className="text-left">Total Amount</th>
              <th className="text-left">Booking Date</th>
              <th className="text-left">Days</th>
              <th className="text-left col-span-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((booking) => (
              <tr
                key={booking.id}
                className="grid grid-cols-11 gap-2 items-center py-3 border-b border-gray-200 hover:bg-gray-50 transition-all"
              >
                <td>{booking.user_name}</td>
                <td className="overflow-x-auto whitespace-nowrap">
                  {booking.user_phone_number || booking.user_email}
                </td>
                <td
                  onClick={() =>
                    handletrackid(
                      "Resort", 
                      "/admin/resort", 
                      booking.resort, 
                      "resort"
                    )
                  }
                  className="ml-8 cursor-pointer hover:text-blue-600"
                >
                  {booking.resort}
                </td>
                <td>{booking.resort_name}</td>
                <td>{booking.adults}</td>
                <td>{booking.children}</td>
                <td>{booking.total_amount}</td>
                <td>{booking.start_date}</td>
                <td>{booking.days}</td>
                <td className="col-span-2">
                  {booking.conformed === "Requested" ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleHolidayApproval(booking.id)}
                        color="success"
                        variant="flat"
                        size="sm"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleHolidayDecline(booking.id)}
                        color="danger"
                        variant="flat"
                        size="sm"
                      >
                        Decline
                      </Button>
                    </div>
                  ) : booking.conformed === "Approved" ? (
                    <Button color="warning" variant="flat" size="sm">
                      Pending
                    </Button>
                  ) : booking.conformed === "Confirmed" ? (
                    <Button color="success" variant="flat" size="sm">
                      Confirmed
                    </Button>
                  ) : (
                    <Button color="danger" variant="flat" size="sm">
                      Declined
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view: Cards */}
      <div className="md:hidden">
        {filteredRequests.length === 0 ? (
          <p className="text-center py-4 text-gray-500">
            No resort booking requests found
          </p>
        ) : (
          filteredRequests.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg shadow p-4 mb-4 border border-gray-200"
            >
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="font-semibold">User:</div>
                <div>{booking.user_name}</div>

                <div className="font-semibold">Contact:</div>
                <div className="truncate">
                  {booking.user_phone_number || booking.user_email}
                </div>

                <div className="font-semibold">Resort ID:</div>
                <div
                  className="text-blue-600 cursor-pointer"
                  onClick={() =>
                    handletrackid(
                      "Resort", 
                      "/admin/resort", 
                      booking.resort, 
                      "resort"
                    )
                  }
                >
                  {booking.resort}
                </div>

                <div className="font-semibold">Resort Name:</div>
                <div>{booking.resort_name}</div>

                <div className="font-semibold">Adults:</div>
                <div>{booking.adults}</div>

                <div className="font-semibold">Children:</div>
                <div>{booking.children}</div>

                <div className="font-semibold">Total Amount:</div>
                <div>{booking.total_amount}</div>

                <div className="font-semibold">Booking Date:</div>
                <div>{booking.start_date}</div>

                <div className="font-semibold">Days:</div>
                <div>{booking.days}</div>
              </div>

              <div className="mt-4">
                {booking.conformed === "Requested" ? (
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => { handleHolidayApproval(booking.id); booking.conformed = "Approved"; }}
                      color="success"
                      variant="flat"
                      className="flex-1"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => { handleHolidayDecline(booking.id); booking.conformed = "Declined"; }}
                      color="danger"
                      variant="flat"
                      className="flex-1"
                    >
                      Decline
                    </Button>
                  </div>
                ) : booking.conformed === "Approved" ? (
                  <Button color="warning" variant="flat" className="w-full">
                    Pending
                  </Button>
                ) : booking.conformed === "Confirmed" ? (
                  <Button color="success" variant="flat" className="w-full">
                    Confirmed
                  </Button>
                ) : (
                  <Button color="danger" variant="flat" className="w-full">
                    Declined
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BookedResort;