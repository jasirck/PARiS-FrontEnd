import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "../../../../utils/Api";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Button } from "@nextui-org/react";
import { setsliceVisa } from "../../../Toolkit/Slice/apiHomeSlice";


function BookedVisa({ handletrackid }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [bookedVisas, setBookedVisas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const booked_visa = useSelector((state) => state.api.booked_visa);

  const filteredRequests = useMemo(() => {
    if (!Array.isArray(bookedVisas)) return [];
    return bookedVisas.filter((request) =>
      request.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, bookedVisas]);

  useEffect(() => {
    fetchBookedVisas();
  }, [token]);

  useEffect(() => {
    if (imageRef.current && containerRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      const image = imageRef.current.getBoundingClientRect();
      setPosition({
        x: (container.width - image.width) / 2,
        y: (container.height - image.height) / 2,
      });
    }
  }, [zoomLevel]);

  const fetchBookedVisas = async () => {
    setLoading(true);

    if (!booked_visa) {
      axios
        .get("/api/admin-visa-booking/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          dispatch(setsliceVisa(response.data));
          setBookedVisas(response.data);
        })
        .catch((error) => {
          console.error("Error fetching Visas:", error);
          setError("Failed to fetch Visas Requests.");
          toast.error("Failed to fetch Visas requests");
        });
      setLoading(false);
    } else {
      setBookedVisas(booked_visa);
      setLoading(false);
    }
  };

  const handleVisaApproval = async (requestId) => {
    try {
      await axios.post(
        "/api/admin-visa-booking/",
        { id: requestId, status: "Approved" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(setsliceVisa(null));
      toast.success("Visa request approved successfully");
      fetchBookedVisas();
    } catch (err) {
      toast.error("Failed to approve visa request");
    }
  };

  const handleVisaDecline = async (requestId) => {
    try {
      await axios.post(
        "/api/admin-visa-booking/",
        { id: requestId, status: "Declined" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(setsliceVisa(null));
      toast.success("Visa request declined successfully");
      fetchBookedVisas();
    } catch (err) {
      toast.error("Failed to decline visa request");
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 0.5));
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging && imageRef.current && containerRef.current) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      const container = containerRef.current.getBoundingClientRect();
      const image = imageRef.current.getBoundingClientRect();

      const maxX = container.width - image.width;
      const maxY = container.height - image.height;

      setPosition({
        x: Math.max(Math.min(newX, 0), maxX),
        y: Math.max(Math.min(newY, 0), maxY),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const delta = -Math.sign(e.deltaY);
    const scale = 0.1;
    const newZoomLevel = Math.max(1, Math.min(5, zoomLevel + delta * scale));

    if (newZoomLevel !== zoomLevel) {
      setZoomLevel(newZoomLevel);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      Requested: "bg-blue-100 text-blue-800",
      Approved: "bg-yellow-100 text-yellow-800",
      Confirmed: "bg-green-100 text-green-800",
      Declined: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm ${statusStyles[status]}`}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading Visa Bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-lg text-red-500 bg-red-50 p-4 rounded-lg">
          {error}
          <Button
            color="primary"
            variant="flat"
            className="mt-4"
            onClick={fetchBookedVisas}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          Visa Bookings
        </h2>
        <div className="w-full md:w-auto">
          <input
            type="text"
            placeholder="🔍 Search by user name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 border border-gray-300 bg-gray-50 p-2 md:p-3 rounded-lg text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm transition duration-300"
          />
        </div>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-4xl w-full mx-4 relative">
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                color="primary"
                variant="flat"
                onClick={handleZoomIn}
                className="text-sm"
              >
                Zoom In
              </Button>
              <Button
                color="primary"
                variant="flat"
                onClick={handleZoomOut}
                className="text-sm"
              >
                Zoom Out
              </Button>
              <Button
                color="danger"
                variant="flat"
                onClick={handleCloseModal}
                className="text-sm"
              >
                Close
              </Button>
            </div>
            <div
              ref={containerRef}
              className="mt-12 overflow-hidden max-h-[80vh] relative bg-gray-100 rounded-lg"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <div
                className="relative cursor-move"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px)`,
                  transition: isDragging ? "none" : "transform 0.3s ease",
                }}
              >
                <img
                  ref={imageRef}
                  src={selectedImage}
                  alt="Document Preview"
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: "0 0",
                    transition: isDragging ? "none" : "transform 0.3s ease",
                  }}
                  className="max-w-full object-contain"
                  draggable="false"
                />
              </div>
            </div>
            <div className="mt-2 text-center text-sm text-gray-500">
              Use mouse wheel to zoom in/out specific areas. Click and drag to
              pan.
            </div>
          </div>
        </div>
      )}

      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No visa bookings found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  User
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Contact
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Visa Type
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Visa Id
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Documents
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((visa) => (
                <tr
                  key={visa.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-all"
                >
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-800">
                      {visa.user_name}
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-4 py-4">
                    <div className="text-gray-600">
                      {visa.number || visa.email}
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-4 py-4">
                    <div className="text-gray-800">{visa.booked_visa_name}</div>
                  </td>
                  <td className="hidden md:table-cell px-4 py-4">
                    <div
                      onClick={() =>
                        handletrackid("Visa", "/admin/visa", visa.booked_visa, "visa")
                      }
                      className="text-gray-800"
                    >
                      {visa.booked_visa}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <img
                        src={`https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${visa.passport}`}
                        alt="Passport"
                        onClick={() =>
                          handleImageClick(
                            `https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${visa.passport}`
                          )
                        }
                        className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      />
                      <img
                        src={`https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${visa.photo}`}
                        alt="Personal Photo"
                        onClick={() =>
                          handleImageClick(
                            `https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${visa.photo}`
                          )
                        }
                        className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {getStatusBadge(visa.conformed)}
                  </td>
                  <td className="px-4 py-4">
                    {visa.conformed === "Requested" ||
                    visa.conformed === "Confirmed" ? (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleVisaApproval(visa.id)}
                          color="success"
                          variant="flat"
                          className="text-sm"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleVisaDecline(visa.id)}
                          color="danger"
                          variant="flat"
                          className="text-sm"
                        >
                          Decline
                        </Button>
                      </div>
                    ) : (
                      <Button
                        color={
                          visa.conformed === "Approved"
                            ? "success"
                            : "danger"
                        }
                        variant="flat"
                        className="text-sm"
                      >
                        {visa.conformed}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BookedVisa;