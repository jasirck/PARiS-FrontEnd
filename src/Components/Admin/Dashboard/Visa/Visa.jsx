import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../../utils/Api";
import AddVisaModal from "./AddVisa";
import VisaDetailsModal from "./VisaDetails";
import VisaEditModal from "./VisaEdit";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@nextui-org/react";
import { toast } from "sonner";
import {setVisa} from "../../../Toolkit/Slice/apiHomeSlice";


function Visa({ visaId, setVisaId }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [visas, setVisas] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token } = useSelector((state) => state.auth);
  const [selectedVisaId, setSelectedVisaId] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const dispatch = useDispatch();
  const visa = useSelector((state) => state.api.visa);

  const filteredVisas = useMemo(() => {
    if (Array.isArray(visas)) {
      return visas.filter((visa) =>
        visa.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return [];
  }, [searchQuery, visas]);

  useEffect(() => {
    const fetchVisas = async () => {




    setLoading(true);
    if (!visa) {
      axios
        .get("/api/admin-visas/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          dispatch(setVisa(response.data));
          setVisas(response.data);
        })
        .catch((error) => {
          console.error("Error fetching visa:", error);
          setError("Failed to fetch visa Requests.");
          toast.error("Failed to fetch visa requests");
        });
      setLoading(false);
    } else {
      setVisas(visa);
      setLoading(false);
    }
    };

    fetchVisas();
  }, [showAddForm]);

  const openViewModal = (visaId) => {
    setSelectedVisaId(visaId);
    setViewModalOpen(true);
  };

  const openEditModal = (visaId) => {
    setSelectedVisaId(visaId);
    setEditModalOpen(true);
  };

  const closeModals = () => {
    setViewModalOpen(false);
    setEditModalOpen(false);
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-600">Loading visas...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Header with Search and Add New Button */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Visas</h2>
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
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? "Cancel" : "Add New Visa"}
          </Button>
        </div>
      </div>

      {/* Add New Visa Form */}
      {showAddForm && (
        <div className="mb-4 p-4 border border-gray-300 rounded-lg">
          <AddVisaModal
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Visas Table */}
      <div className="overflow-x-auto">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-5 gap-4 text-gray-700 font-semibold border-b border-gray-300 p-2">
          <div className="ml-8 -mr-4">Id</div>
          <div>Visa</div>
          <div>Visa Days & Price</div>
          <div>Category</div>
          <div>Action</div>
        </div>

        {/* Visas List */}
        <div>
          {filteredVisas.length === 0 ? (
            <div className="p-4 text-center text-gray-600">No visas found</div>
          ) : (
            filteredVisas.map((visa) => (
              <div
                key={visa.id}
                className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center py-3 border-b border-gray-200 hover:bg-gray-50 transition-all p-2"
              >
                {/* Mobile View: Card Layout */}
                <div className="md:hidden space-y-2">
                  <div className="font-semibold text-gray-800">ID: {visa.id}</div>
                  <div className="text-sm text-gray-600">Visa: {visa.name}</div>
                  <div className="text-sm text-gray-600">
                    Days & Price:{" "}
                    {visa.visa_days && visa.visa_days.length > 0
                      ? visa.visa_days.map((day, index) => (
                          <div key={index}>
                            {day.days} {day.price}{" "}
                          </div>
                        ))
                      : "N/A"}
                  </div>
                  <div className="text-sm text-gray-600">
                    Category: {visa.category.name || "N/A"}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={() => openViewModal(visa.id)}
                      className="bg-[#4a4a4a] text-white px-3 py-2 rounded-lg hover:bg-[#333333] transition-colors"
                    >
                      View
                    </Button>
                    <Button
                      onClick={() => openEditModal(visa.id)}
                      className="bg-[#4a4a4a] text-white px-3 py-2 rounded-lg hover:bg-[#333333] transition-colors"
                    >
                      Edit
                    </Button>
                  </div>
                </div>

                {/* Desktop View: Table Layout */}
                <div className="hidden md:block ml-8 -mr-4">{visa.id}</div>
                <div className="hidden md:block">{visa.name}</div>
                <div className="hidden md:block">
                  {visa.visa_days && visa.visa_days.length > 0
                    ? visa.visa_days.map((day, index) => (
                        <div key={index}>
                          {day.days} {day.price}{" "}
                        </div>
                      ))
                    : "N/A"}
                </div>
                <div className="hidden md:block">
                  {visa.category.name || "N/A"}
                </div>
                <div className="hidden md:flex gap-2">
                  <Button
                    onClick={() => openViewModal(visa.id)}
                    className="bg-[#4a4a4a] text-white px-3 py-2 rounded-lg hover:bg-[#333333] transition-colors"
                  >
                    View
                  </Button>
                  <Button
                    onClick={() => openEditModal(visa.id)}
                    className="bg-[#4a4a4a] text-white px-3 py-2 rounded-lg hover:bg-[#333333] transition-colors"
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <VisaDetailsModal
        visaId={selectedVisaId}
        isOpen={viewModalOpen}
        closeModal={closeModals}
      />

      <VisaEditModal
        visaId={selectedVisaId}
        isOpen={editModalOpen}
        onClose={closeModals}
      />
    </div>
  );
}

export default Visa;