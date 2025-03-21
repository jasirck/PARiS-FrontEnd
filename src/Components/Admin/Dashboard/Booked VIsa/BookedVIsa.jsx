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
  const [activeTab, setActiveTab] = useState("all"); // New state for tab filtering
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const booked_visa = useSelector((state) => state.api.booked_visa);

  // Enhanced filtering with status tabs
  const filteredRequests = useMemo(() => {
    if (!Array.isArray(bookedVisas)) return [];
    
    let filtered = bookedVisas.filter((request) =>
      request.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Filter by status tab
    if (activeTab !== "all") {
      filtered = filtered.filter(visa => visa.conformed === activeTab);
    }
    
    return filtered;
  }, [searchQuery, bookedVisas, activeTab]);

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
      Approved: "bg-green-100 text-green-800",
      Confirmed: "bg-yellow-100 text-yellow-800",
      Declined: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status]}`}
      >
        {status}
      </span>
    );
  };

  // Helper function to count visas by status
  const countVisasByStatus = (status) => {
    if (!Array.isArray(bookedVisas)) return 0;
    return bookedVisas.filter(visa => visa.conformed === status).length;
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-lg text-gray-600 animate-pulse">
          <div className="flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
            Loading Visa Bookings...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-lg text-red-500 bg-red-50 p-6 rounded-lg shadow-md max-w-lg w-full text-center">
          <div className="text-3xl mb-2">⚠️</div>
          {error}
          <Button
            color="primary"
            className="mt-4 w-full"
            onClick={fetchBookedVisas}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 transition-all duration-300 hover:shadow-xl">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center">
          <span className="mr-2">🛂</span> Visa Bookings
          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-sm rounded-full">
            {Array.isArray(bookedVisas) ? bookedVisas.length : 0}
          </span>
        </h2>
        <div className="w-full md:w-auto relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by user name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 border border-gray-300 bg-gray-50 p-2 md:p-3 pl-10 rounded-lg text-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none shadow-sm transition duration-300"
          />
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "all"
              ? "bg-gray-800 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All ({Array.isArray(bookedVisas) ? bookedVisas.length : 0})
        </button>
        <button
          onClick={() => setActiveTab("Requested")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "Requested"
              ? "bg-blue-600 text-white"
              : "bg-blue-100 text-blue-800 hover:bg-blue-200"
          }`}
        >
          Requested ({countVisasByStatus("Requested")})
        </button>
        <button
          onClick={() => setActiveTab("Approved")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "Approved"
              ? "bg-green-600 text-white"
              : "bg-green-100 text-green-800 hover:bg-green-200"
          }`}
        >
          Approved ({countVisasByStatus("Approved")})
        </button>
        <button
          onClick={() => setActiveTab("Confirmed")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "Confirmed"
              ? "bg-yellow-600 text-white"
              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
          }`}
        >
          Confirmed ({countVisasByStatus("Confirmed")})
        </button>
        <button
          onClick={() => setActiveTab("Declined")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeTab === "Declined"
              ? "bg-red-600 text-white"
              : "bg-red-100 text-red-800 hover:bg-red-200"
          }`}
        >
          Declined ({countVisasByStatus("Declined")})
        </button>
      </div>

      {/* Image viewer modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 rounded-lg max-w-4xl w-full mx-4 relative shadow-2xl">
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                color="primary"
                onClick={handleZoomIn}
                className="text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
                Zoom In
              </Button>
              <Button
                color="primary"
                onClick={handleZoomOut}
                className="text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
                Zoom Out
              </Button>
              <Button
                color="danger"
                onClick={handleCloseModal}
                className="text-sm flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close
              </Button>
            </div>
            <div
              ref={containerRef}
              className="mt-12 overflow-hidden max-h-[80vh] h-[60vh] relative bg-gray-100 rounded-lg"
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
            <div className="mt-2 text-center text-sm text-gray-500 flex items-center justify-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Use mouse wheel to zoom in/out specific areas. Click and drag to pan.
            </div>
          </div>
        </div>
      )}

      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-500 mb-2">No visa bookings found</p>
          <p className="text-gray-400 text-sm">
            {searchQuery ? "Try adjusting your search criteria" : "Bookings will appear here once available"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 border-b">
                  User
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-sm font-semibold text-gray-600 border-b">
                  Contact
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-sm font-semibold text-gray-600 border-b">
                  Visa Type
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-sm font-semibold text-gray-600 border-b">
                  Visa ID
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 border-b">
                  Documents
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 border-b">
                  Status
                </th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600 border-b">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((visa, index) => (
                <tr
                  key={visa.id}
                  className={`border-b border-gray-200 hover:bg-blue-50 transition-all ${
                    index % 2 === 0 ? "bg-gray-50/50" : ""
                  }`}
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
                    <div className="text-gray-800 font-medium">{visa.booked_visa_name}</div>
                  </td>
                  <td className="hidden md:table-cell px-4 py-4">
                    <div
                      onClick={() =>
                        handletrackid("Visa", "/admin/visa", visa.booked_visa, "visa")
                      }
                      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors font-medium"
                    >
                      {visa.booked_visa}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <div className="relative group">
                        <img
                          src={`https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${visa.passport}`}
                          alt="Passport"
                          onClick={() =>
                            handleImageClick(
                              `https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${visa.passport}`
                            )
                          }
                          className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-all hover:shadow-md transform hover:scale-105"
                        />
                        <span className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs py-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-center rounded-b-lg">
                          Passport
                        </span>
                      </div>
                      <div className="relative group">
                        <img
                          src={`https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${visa.photo}`}
                          alt="Personal Photo"
                          onClick={() =>
                            handleImageClick(
                              `https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${visa.photo}`
                            )
                          }
                          className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-all hover:shadow-md transform hover:scale-105"
                        />
                        <span className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs py-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-center rounded-b-lg">
                          Photo
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {getStatusBadge(visa.conformed)}
                  </td>
                  <td className="px-4 py-4">
                    {visa.conformed === "Requested" ||
                    visa.conformed === "Confirmed" ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          onClick={() => handleVisaApproval(visa.id)}
                          color="success"
                          size="sm"
                          className="text-sm font-medium"
                        >
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                          </span>
                        </Button>
                        <Button
                          onClick={() => handleVisaDecline(visa.id)}
                          color="danger"
                          size="sm"
                          className="text-sm font-medium"
                        >
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Decline
                          </span>
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
                        size="sm"
                        className="text-sm font-medium"
                      >
                        {visa.conformed === "Approved" ? (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {visa.conformed}
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {visa.conformed}
                          </span>
                        )}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Status summary cards - mobile only */}
      <div className="md:hidden mt-6 grid grid-cols-2 gap-3">
        <div className="bg-blue-50 p-3 rounded-lg shadow-sm">
          <div className="text-sm text-blue-800 font-medium">Requested</div>
          <div className="text-2xl font-bold text-blue-900">{countVisasByStatus("Requested")}</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg shadow-sm">
          <div className="text-sm text-green-800 font-medium">Approved</div>
          <div className="text-2xl font-bold text-green-900">{countVisasByStatus("Approved")}</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg shadow-sm">
          <div className="text-sm text-yellow-800 font-medium">Confirmed</div>
          <div className="text-2xl font-bold text-yellow-900">{countVisasByStatus("Confirmed")}</div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg shadow-sm">
          <div className="text-sm text-red-800 font-medium">Declined</div>
          <div className="text-2xl font-bold text-red-900">{countVisasByStatus("Declined")}</div>
        </div>
      </div>
    </div>
  );
}

export default BookedVisa;