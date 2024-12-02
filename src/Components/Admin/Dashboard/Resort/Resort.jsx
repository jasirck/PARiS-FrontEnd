import React, { useState, useEffect, useMemo } from 'react';
import axios from '../../../../Api';
import { useSelector } from 'react-redux';

function Resorts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [resorts, setResorts] = useState([]);
  const [newResort, setNewResort] = useState({
    resort_name: '', 
    resort_location: '', 
    base_price: '', 
    adult_price: '', 
    child_price: '', 
    pool: false, 
    package_inclusions: '', 
    policy: '', 
    valid: true
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state.auth);

  const filteredResorts = useMemo(() => {
    if (Array.isArray(resorts)) {
      return resorts.filter(resort =>
        resort.resort_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return []; // Return an empty array if resorts is not an array
  }, [searchQuery, resorts]);

  // Fetch resorts data from the backend
  useEffect(() => {
    const fetchResorts = async () => {
      try {
        setLoading(true);
        
        // const response = await axios.get('/api/resorts/', {
        //   headers: { Authorization: `Bearer ${token}` },
        // });
        setResorts([
            {
              "id": 1,
              "resort_name": "Beachside Resort",
              "resort_location": "California, USA",
              "pool": true,
              "base_price": 250,
              "adult_price": 200,
              "child_price": 150,
              "package_inclusions": "Pool access, Breakfast",
              "policy": "No pets allowed",
              "valid": true
            },
            {
              "id": 2,
              "resort_name": "Mountain View Resort",
              "resort_location": "Alps, Switzerland",
              "pool": false,
              "base_price": 300,
              "adult_price": 250,
              "child_price": 180,
              "package_inclusions": "Mountain view, Breakfast",
              "policy": "Pets allowed",
              "valid": true
            }
          ]
          );
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch resorts.');
        setLoading(false);
      }
    };

    fetchResorts();
  }, [token]);

  const handleAddNewResort = async (resortData) => {
    try {
      const response = await axios.post('/api/resorts/', resortData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResorts([...resorts, response.data]);
      setShowAddForm(false);
    } catch (err) {
      setError('Failed to add resort.');
    }
  };

  if (loading) {
    return <div>Loading resorts...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Header with Search and Add New Button */}
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
          <button
            className="bg-[#1e546f] text-white px-4 py-2 rounded-lg"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : 'Add New Resort'}
          </button>
        </div>
      </div>

      {/* Add New Resort Form
      {showAddForm && (
        <div className="mb-4 p-4 border border-gray-300 rounded-lg">
          <AddResortModal
            isOpen={showAddForm}  // To control visibility
            onClose={() => setShowAddForm(false)}  // To close the modal
            onSave={handleAddNewResort}  // To save new resort
          />
        </div>
      )} */}

      {/* Resorts Table */}
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
          <div key={resort.id} className="grid grid-cols-7 gap-2 items-center py-3 border-b border-gray-200 hover:bg-gray-50 transition-all">
            <div>{resort.resort_name}</div>
            <div>{resort.resort_location}</div>
            <div>{resort.pool ? 'Yes' : 'No'}</div>
            <div>{resort.base_price}</div>
            <div>{resort.adult_price}</div>
            <div>{resort.child_price}</div>
            <div>
              <button className="bg-[#4a4a4a] text-white px-4 py-2 rounded-lg">View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Resorts;
