import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../../utils/Api";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Button } from "@nextui-org/react";
import AddHolidayModal from "./AddHoliday";
import HolidayDetailsModal from "./HolidayDetails";
import HolidayEditModal from "./HolidayEdit";
import {setHoliday} from "../../../Toolkit/Slice/apiHomeSlice";


function Holidays({ holidayId, setHolidayId }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [Holidays, setHolidays] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state.auth);
  const [selectedHolidayId, setSelectedHolidayId] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const dispatch = useDispatch();
  const holiday = useSelector((state) => state.api.holiday);

  const filteredHolidays = useMemo(() => {
    if (Array.isArray(Holidays)) {
      return Holidays.filter((pkg) =>
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return []; // Return an empty array if Holidays is not an array
  }, [searchQuery, Holidays]);

  // Fetch Holidays data from the backend
  useEffect(() => {
    console.log("Holidays", token);

    const fetchHolidays = async () => {
      setLoading(true);

    if (!holiday) {
      axios
        .get("/api/holidays/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          dispatch(setHoliday(response.data));
          setHolidays(response.data);
        })
        .catch((error) => {
          console.error("Error fetching Holiday:", error);
          setError("Failed to fetch Holiday Requests.");
          toast.error("Failed to fetch Holiday requests");
        });
      setLoading(false);
    } else {
      setHolidays(holiday);
      setLoading(false);
    }
    };

    fetchHolidays();
    if (holidayId) {
      openViewModal(holidayId);
      setHolidayId(null);
    }
  }, [showAddForm]);

  const openViewModal = (HolidayId) => {
    setSelectedHolidayId(HolidayId);
    setViewModalOpen(true);
  };

  const openEditModal = (HolidayId) => {
    setSelectedHolidayId(HolidayId);
    setEditModalOpen(true);
  };

  const closeModals = () => {
    setViewModalOpen(false);
    setEditModalOpen(false);
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-600">Loading Holidays...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Header with Search and Add New Button */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Holidays</h2>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 border border-[#D4D4CE] bg-[#F6F6F6] p-2 rounded-lg text-[#023246] placeholder-[#287094] focus:ring-2 focus:ring-[#287094] focus:outline-none shadow-sm transition duration-300"
          />
          <Button
            className="w-full md:w-auto bg-[#1e546f] text-white px-4 py-2 rounded-lg hover:bg-[#023246] transition-colors"
            onClick={() => setTimeout(() => setShowAddForm(!showAddForm), 300)}
          >
            {showAddForm ? "Cancel" : "Add New Holiday"}
          </Button>
        </div>
      </div>

      {/* Add New Holiday Form */}
      {showAddForm && (
        <div >
          <AddHolidayModal
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Holidays Table */}
      <div className="overflow-x-auto">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-6 gap-2 text-gray-700 font-semibold border-b border-gray-300 p-2">
          <div>Holiday</div>
          <div>Code</div>
          <div>Base Price</div>
          <div>Days</div>
          <div>Date</div>
          <div>Action</div>
        </div>

        {/* Holidays List */}
        <div>
          {filteredHolidays.map((pkg) => (
            <div
              key={pkg.id}
              className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center py-3 border-b border-gray-200 hover:bg-gray-50 transition-all p-2"
            >
              {/* Mobile View: Card Layout */}
              <div className="md:hidden space-y-2">
                <div className="font-semibold text-gray-800">{pkg.name}</div>
                <div className="text-sm text-gray-600">Code: {pkg.id}</div>
                <div className="text-sm text-gray-600">Base Price: {pkg.base_price}</div>
                <div className="text-sm text-gray-600">Days: {pkg.days}</div>
                <div className="text-sm text-gray-600">Date: {pkg.end}</div>
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={() => setTimeout(() => openViewModal(pkg.id), 300)}
                    className="bg-[#4a4a4a] text-white px-3 py-2 rounded-lg hover:bg-[#333333] transition-colors"
                  >
                    View
                  </Button>
                  <Button
                    onClick={() => setTimeout(() => openEditModal(pkg.id), 300)}
                    className="bg-[#4a4a4a] text-white px-3 py-2 rounded-lg hover:bg-[#333333] transition-colors"
                  >
                    Edit
                  </Button>
                </div>
              </div>

              {/* Desktop View: Table Layout */}
              <div className="hidden md:block">{pkg.name}</div>
              <div className="hidden md:block">{pkg.id}</div>
              <div className="hidden md:block">{pkg.base_price}</div>
              <div className="hidden md:block">{pkg.days}</div>
              <div className="hidden md:block">{pkg.end}</div>
              <div className="hidden md:flex gap-2">
                <Button
                  onClick={() => setTimeout(() => openViewModal(pkg.id), 300)}
                  className="bg-[#4a4a4a] text-white px-3 py-2 rounded-lg hover:bg-[#333333] transition-colors"
                >
                  View
                </Button>
                <Button
                  onClick={() => setTimeout(() => openEditModal(pkg.id), 300)}
                  className="bg-[#4a4a4a] text-white px-3 py-2 rounded-lg hover:bg-[#333333] transition-colors"
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <div>
      <HolidayDetailsModal
        HolidayId={selectedHolidayId}
        isOpen={viewModalOpen}
        closeModal={closeModals}
      />
      </div>
      <div>
      <HolidayEditModal
        HolidayId={selectedHolidayId}
        isOpen={editModalOpen}
        onClose={closeModals}
      />
      </div>
    </div>
  );
}

export default Holidays;