import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../../utils/Api";
import AddVisaModal from "./AddVisa";
import VisaDetailsModal from "./VisaDetails";
import VisaEditModal from "./VisaEdit";
import { useSelector } from "react-redux";
import { Button } from "@nextui-org/react";
import { toast } from "sonner";

function Visa({visaId,setVisaId}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [visas, setVisas] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token } = useSelector((state) => state.auth);
  const [selectedVisaId, setSelectedVisaId] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

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
      try {
        setLoading(true);
        const response = await axios.get("/api/admin-visas/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Visas Data:", response.data); 

        if (response.data) {
          setVisas(response.data);
        } else {
          setError("No visas found.");
        }
        setLoading(false);
        if(visaId){
          visaId
          openViewModal(visaId)
          setVisaId(null)
        }
      } catch (err) {
        setError("Failed to fetch visas.");
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
    return <div>Loading visas...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Header with Search and Add New Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Visas</h2>
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
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? "Cancel" : "Add New Visa"}
          </Button>
        </div>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 border border-gray-300 rounded-lg">
          <AddVisaModal
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Visas Table */}
      <div className="grid grid-cols-5 gap-4 text-gray-700 font-semibold border-b border-gray-300">
        <div className="ml-8 -mr-4">Id</div>
        <div>Visa</div>
        <div>Visa Days&Price</div>
        <div>Category</div>
        <div>Action</div>
      </div>

      <div>
        {filteredVisas.length === 0 ? (
          <div>No visas found</div>
        ) : (
          filteredVisas.map((visa) => (
            <div
              key={visa.id}
              className="grid -mx-4 grid-cols-5 gap-2 items-center py-3 border-b border-gray-200 hover:bg-gray-50 transition-all"
            > <div className="ml-14 -mr-8">{visa.id}</div>
              <div className="mx-4">{visa.name}</div>
              <div>
                {visa.visa_days && visa.visa_days.length > 0
                  ? visa.visa_days.map((day, index) => (
                      <div key={index}>
                        {day.days} {day.price}{" "}
                      </div>
                    ))
                  : "N/A"}
              </div>
              <div>{visa.category.name || "N/A"}</div>
              <div className="gap-1 flex">
                <Button
                  onClick={() => openViewModal(visa.id)}
                  className="bg-[#4a4a4a] text-white -ml-2 px-3 py-2 rounded-lg"
                >
                  View
                </Button>
                <Button
                  onClick={() => openEditModal(visa.id)}
                  className="bg-[#4a4a4a] text-white px-3 py-2 rounded-lg pl-4"
                >
                  Edit
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

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
