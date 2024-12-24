import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../../utils/Api";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Button } from "@nextui-org/react";
import AddHolidayModal from "./AddHoliday";
import HolidayDetailsModal from "./HolidayDetails";
import HolidayEditModal from "./HolidayEdit";


function Holidays() {
  const [searchQuery, setSearchQuery] = useState("");
  const [Holidays, setHolidays] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state.auth);
  const [selectedHolidayId, setSelectedHolidayId] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

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
    console.log('Holidays',token);
    
    const fetchHolidays = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/holidays/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHolidays(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch Holidays.");
        setLoading(false);
      }
    };

    fetchHolidays();
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
    return <div>Loading Holidays...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Header with Search and Add New Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Holidays</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-[#D4D4CE] bg-[#F6F6F6] p-2 rounded-lg text-[#023246] placeholder-[#287094] focus:ring-2 focus:ring-[#287094] focus:outline-none shadow-sm transition duration-300"
          />
          <Button
            className="bg-[#1e546f] text-white px-4 py-2 rounded-lg"
            onClick={() => setTimeout(() => setShowAddForm(!showAddForm), 300)}

          >
            {showAddForm ? "Cancel" : "Add New Holiday"}
          </Button>
        </div>
      </div>

      {/* Add New Holiday Form */}
      {showAddForm && (
        <div className="mb-4 p-4 border border-gray-300 rounded-lg">
          <AddHolidayModal
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Holidays Table */}
      <div className="grid grid-cols-6 gap-2 text-gray-700 font-semibold border-b border-gray-300">
        <div>Holiday</div>
        <div>Code</div>
        <div>Base Price</div>
        <div>Days</div>
        <div>Date</div>
        <div>Action</div>
      </div>

      <div>
        {filteredHolidays.map((pkg) => (
          <div
            key={pkg.id}
            className="grid grid-cols-6 gap-2 items-center py-3 border-b border-gray-200 hover:bg-gray-50 transition-all"
          >
            <div>{pkg.name}</div>
            <div>{pkg.id}</div>
            <div>{pkg.base_price}</div>
            <div>{pkg.days}</div>
            <div>{pkg.end}</div>
            <div className="gap-1 flex">
              <Button

                onClick={() => setTimeout(() => openViewModal(pkg.id), 300)}
                className="bg-[#4a4a4a] text-white -ml-2 px-3 py-2 rounded-lg"
              >
                View
              </Button>
              <Button
                onClick={() => setTimeout(() => openEditModal(pkg.id), 300)}
                className="bg-[#4a4a4a] text-white px-3 py-2  rounded-lg pl-4"
              >
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>

      <HolidayDetailsModal
        HolidayId={selectedHolidayId}
        isOpen={viewModalOpen}
        closeModal={closeModals}
      />
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
