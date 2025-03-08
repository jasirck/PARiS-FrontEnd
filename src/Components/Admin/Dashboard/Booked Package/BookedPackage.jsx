import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../../utils/Api";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Button } from "@nextui-org/react";
import { setslicePackages } from "../../../Toolkit/Slice/apiHomeSlice";

function PackageBooking({ handletrackid }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [bookedPackages, setBookedPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const booked_packages = useSelector((state) => state.api.booked_packages);

  // Fixed filter function
  const filteredRequests = useMemo(() => {
    if (!Array.isArray(bookedPackages)) return [];

    return bookedPackages.filter((request) =>
      request.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, bookedPackages]);

  useEffect(() => {
    fetchBookedPackages();
  }, [token]);

  const fetchBookedPackages = async () => {
    setLoading(true);

    if (!booked_packages) {
      axios
        .get("/api/admin-booked-package/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          dispatch(setslicePackages(response.data));
          setBookedPackages(response.data);
        })
        .catch((error) => {
          console.error("Error fetching packages:", error);
          setError("Failed to fetch Holiday Requests.");
          toast.error("Failed to fetch holiday requests");
        });
      setLoading(false);
    } else {
      setBookedPackages(booked_packages);
      setLoading(false);
    }
  };

  const handleHolidayApproval = async (requestId) => {
    try {
      await axios.post(
        "/api/admin-booked-package/",
        { id: requestId, status: "Approved" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(setslicePackages(null));
      toast.success("Holiday request approved successfully");
      fetchBookedPackages();
    } catch (err) {
      console.error("Error approving holiday request:", err);
      toast.error("Failed to approve holiday request");
    }
  };

  const handleHolidayDecline = async (requestId) => {
    try {
      await axios.post(
        "/api/admin-booked-package/",
        { id: requestId, status: "Declined" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(setslicePackages(null));
      toast.success("Holiday request declined successfully");
      fetchBookedPackages();
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
          Holiday Requests
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
                <td className="overflow-x-auto whitespace-nowrap">
                  {booking.user_phone_number || booking.user_email}
                </td>
                <td
                  onClick={() =>
                    handletrackid(
                      "Packages",
                      "/admin/packages",
                      booking.package,
                      "package"
                    )
                  }
                  className="ml-8 cursor-pointer hover:text-blue-600"
                >
                  {booking.package}
                </td>
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
            No holiday requests found
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

                <div className="font-semibold">Holiday ID:</div>
                <div
                  className="text-blue-600 cursor-pointer"
                  onClick={() =>
                    handletrackid(
                      "Packages",
                      "/admin/packages",
                      booking.package,
                      "package"
                    )
                  }
                >
                  {booking.package}
                </div>

                <div className="font-semibold">Holiday Name:</div>
                <div>{booking.package_name}</div>

                <div className="font-semibold">Adults:</div>
                <div>{booking.adult_count}</div>

                <div className="font-semibold">Children:</div>
                <div>{booking.child_count}</div>

                <div className="font-semibold">Total Amount:</div>
                <div>{booking.total_amount}</div>

                <div className="font-semibold">Booking Date:</div>
                <div>{booking.date}</div>
              </div>

              <div className="mt-4">
                {booking.conformed === "Requested" ? (
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => handleHolidayApproval(booking.id)}
                      color="success"
                      variant="flat"
                      className="flex-1"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleHolidayDecline(booking.id)}
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

export default PackageBooking;
