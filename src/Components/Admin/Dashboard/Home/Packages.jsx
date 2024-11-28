import React, { useState, useEffect, useMemo } from 'react';
import axios from '../../../../Api';
import AddPackageModal from './AddPackeges';
import { useSelector } from 'react-redux';


function Packages() {
  const [searchQuery, setSearchQuery] = useState('');
  const [packages, setPackages] = useState([]);
  const [newPackage, setNewPackage] = useState({ name: '', code: '', basePrice: '', days: '', date: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state.auth);


  const filteredPackages = useMemo(() => {
    if (Array.isArray(packages)) {
      return packages.filter(pkg =>
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return []; // Return an empty array if packages is not an array
  }, [searchQuery, packages]);
  

  // Fetch packages data from the backend
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/packages/', {
          headers: { Authorization: `Bearer ${token}` }, 
        });  
        setPackages(response.data);
        console.log(response.data);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch packages.');
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleAddNewPackage = async (packageData) => {
    try {
      const response = await axios.post('/api/packages/',{Authorization: `Bearer ${token}`} ,packageData);  // Updated to match the backend route
      setPackages([...packages, response.data]);
      setShowAddForm(false);
    } catch (err) {
      setError('Failed to add package.');
    }
  };

  if (loading) {
    return <div>Loading packages...</div>;
  }

//   if (error) {
//     return <div className="text-red-500">{error}</div>;
//   }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Header with Search and Add New Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Packages</h2>
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
            {showAddForm ? 'Cancel' : 'Add New Package'}
          </button>
        </div>
      </div>

      {/* Add New Package Form */}
      {showAddForm && (
        <div className="mb-4 p-4 border border-gray-300 rounded-lg">
          <AddPackageModal
            isOpen={showAddForm}  // To control visibility
            onClose={() => setShowAddForm(false)}  // To close the modal
            onSave={handleAddNewPackage}  // To save new package
          />
        </div>
      )}

      {/* Packages Table */}
      <div className="grid grid-cols-6 gap-2 text-gray-700 font-semibold border-b border-gray-300">
        <div>Package</div>
        <div>Code</div>
        <div>Base Price</div>
        <div>Days</div>
        <div>Date</div>
        <div>Action</div>
      </div>

      <div>
        {filteredPackages.map(pkg => (
          <div key={pkg.id} className="grid grid-cols-6 gap-2 items-center py-3 border-b border-gray-200 hover:bg-gray-50 transition-all">
            <div>{pkg.name}</div>
            <div>{pkg.id}</div>
            <div>{pkg.base_price}</div>
            <div>{pkg.days}</div>
            <div>{pkg.end}</div>
            <div>
              <button className="bg-[#4a4a4a] text-white px-4 py-2 rounded-lg">View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Packages;
