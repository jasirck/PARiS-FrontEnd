import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../../utils/Api";
import { useSelector } from "react-redux";
import AddResortModal from "./AddResort";
import { Button } from "@nextui-org/react";
import ResortDetails from "./ResortDetails";
import ResortEdit from "./ResortEdit";
import { div } from "framer-motion/client";

function Resorts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [resorts, setResorts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedResortId, setSelectedResortId] = useState(null);
  const [selectedResortIdEdit, setSelectedResortIdEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state.auth);

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
      try {
        setLoading(true);
        const response = await axios.get("/api/admin-resorts/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Resorts Data:", response.data);

        setResorts(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching resorts:", err);
        setError("Failed to fetch resorts.");
        setLoading(false);
      }
    };

    fetchResorts();
  }, [token, showAddForm]);

  if (loading) {
    return <div>Loading resorts...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Resorts</h2>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg"
          />
          <Button
            color="primary"
            onClick={() => {
              setTimeout(() => {
                setShowAddForm(!showAddForm);
              }, 300);
            }}
            radius="sm"
          >
            {showAddForm ? "Cancel" : "Add New Resort"}
          </Button>
        </div>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 border border-gray-300 rounded-lg">
          <AddResortModal
            isOpen={showAddForm}
            onClose={() => setShowAddForm(false)}
          />
        </div>
      )}
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

      <div className="grid grid-cols-7 gap-2 text-gray-700 font-semibold border-b border-gray-300">
        <div>Resort Name</div>
        <div>Location</div>
        <div>Pool</div>
        <div>Base Price</div>
        <div>Adult Price</div>
        <div>Child Price</div>
        <div>Action</div>
      </div>

      <div>
        {filteredResorts.map((resort) => (
          <div
            key={resort.id}
            className="grid grid-cols-7 gap-2 items-center py-3 border-b border-gray-200 hover:bg-gray-50 transition-all"
          >
            <div className={` ${resort.valid ? "" : "text-red-600"}`}>{resort.name}</div>
            <div>{resort.location}</div>
            <div>{resort.pool ? "Yes" : "No"}</div>
            <div>{resort.base_price}</div>
            <div>{resort.adult_price}</div>
            <div>{resort.child_price}</div>
            <div className="gap-1 flex">
              <Button
                onClick={() => setSelectedResortId(resort.id)}
                className="bg-[#4a4a4a] text-white px-4 py-2 rounded-lg"
              >
                View
              </Button>
              <Button
                onClick={() => setSelectedResortIdEdit(resort.id)}
                className="bg-[#4a4a4a] text-white px-4 py-2 rounded-lg"
              >
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Resorts;
