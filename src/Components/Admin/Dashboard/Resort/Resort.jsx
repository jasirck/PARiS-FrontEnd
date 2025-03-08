import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../../utils/Api";
import { useDispatch, useSelector } from "react-redux";
import AddResortModal from "./AddResort";
import { Button } from "@nextui-org/react";
import ResortDetails from "./ResortDetails";
import ResortEdit from "./ResortEdit";
import {setResort} from "../../../Toolkit/Slice/apiHomeSlice";


function Resorts({ resortId, setResortId }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [resorts, setResorts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedResortId, setSelectedResortId] = useState(null);
  const [selectedResortIdEdit, setSelectedResortIdEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const resort = useSelector((state) => state.api.resort);

  const filteredResorts = useMemo(() => {
    if (Array.isArray(resorts)) {
      return resorts.filter((resort) => {
        const name = resort.name || ""; // Fallback if resort_name is undefined
        return name.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    return [];
  }, [searchQuery, resorts]);

  useEffect(() => {
    const fetchResorts = async () => {



    setLoading(true);
    if (!resort) {
      axios
        .get("/api/admin-resorts/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          dispatch(setResort(response.data));
          setResorts(response.data);
        })
        .catch((error) => {
          console.error("Error fetching Resort:", error);
          setError("Failed to fetch Resort Requests.");
          toast.error("Failed to fetch Resort requests");
        });
      setLoading(false);
    } else {
      setResorts(resort);
      setLoading(false);
    }
    };

    fetchResorts();
  }, [token, showAddForm]);

  if (loading) {
    return <div className="p-4 text-center text-gray-600">Loading resorts...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Header with Search and Add New Button */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Resorts</h2>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#287094] focus:outline-none"
          />
          <Button
            color="primary"
            onClick={() => {
              setTimeout(() => {
                setShowAddForm(!showAddForm);
              }, 300);
            }}
            radius="sm"
            className="w-full md:w-auto"
          >
            {showAddForm ? "Cancel" : "Add New Resort"}
          </Button>
        </div>
      </div>

      {/* Add New Resort Form */}
      {showAddForm && (
        <div className="mb-4 p-4 border border-gray-300 rounded-lg">
          <AddResortModal
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Resorts Table */}
      <div className="overflow-x-auto">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-7 gap-2 text-gray-700 font-semibold border-b border-gray-300 p-2">
          <div>Resort Name</div>
          <div>Location</div>
          <div>Pool</div>
          <div>Base Price</div>
          <div>Adult Price</div>
          <div>Child Price</div>
          <div>Action</div>
        </div>

        {/* Resorts List */}
        <div>
          {filteredResorts.map((resort) => (
            <div
              key={resort.id}
              className="grid grid-cols-1 md:grid-cols-7 gap-2 items-center py-3 border-b border-gray-200 hover:bg-gray-50 transition-all p-2"
            >
              {/* Mobile View: Card Layout */}
              <div className="md:hidden space-y-2">
                <div className="font-semibold text-gray-800">{resort.name}</div>
                <div className="text-sm text-gray-600">Location: {resort.location}</div>
                <div className="text-sm text-gray-600">Pool: {resort.pool ? "Yes" : "No"}</div>
                <div className="text-sm text-gray-600">Base Price: {resort.base_price}</div>
                <div className="text-sm text-gray-600">Adult Price: {resort.adult_price}</div>
                <div className="text-sm text-gray-600">Child Price: {resort.child_price}</div>
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={() => setSelectedResortId(resort.id)}
                    className="bg-[#4a4a4a] text-white px-4 py-2 rounded-lg hover:bg-[#333333] transition-colors"
                  >
                    View
                  </Button>
                  <Button
                    onClick={() => setSelectedResortIdEdit(resort.id)}
                    className="bg-[#4a4a4a] text-white px-4 py-2 rounded-lg hover:bg-[#333333] transition-colors"
                  >
                    Edit
                  </Button>
                </div>
              </div>

              {/* Desktop View: Table Layout */}
              <div className={`hidden md:block ${resort.valid ? "" : "text-red-600"}`}>
                {resort.name}
              </div>
              <div className="hidden md:block">{resort.location}</div>
              <div className="hidden md:block">{resort.pool ? "Yes" : "No"}</div>
              <div className="hidden md:block">{resort.base_price}</div>
              <div className="hidden md:block">{resort.adult_price}</div>
              <div className="hidden md:block">{resort.child_price}</div>
              <div className="hidden md:flex gap-2">
                <Button
                  onClick={() => setSelectedResortId(resort.id)}
                  className="bg-[#4a4a4a] text-white px-4 py-2 rounded-lg hover:bg-[#333333] transition-colors"
                >
                  View
                </Button>
                <Button
                  onClick={() => setSelectedResortIdEdit(resort.id)}
                  className="bg-[#4a4a4a] text-white px-4 py-2 rounded-lg hover:bg-[#333333] transition-colors"
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {selectedResortId && (
        <ResortDetails
          resortId={selectedResortId}
          closeModal={() => setSelectedResortId(null)}
        />
      )}
      {selectedResortIdEdit && (
        <ResortEdit
          resortId={selectedResortIdEdit}
          closeModal={() => setSelectedResortIdEdit(null)}
        />
      )}
    </div>
  );
}

export default Resorts;