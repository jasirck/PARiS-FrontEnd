import React, { useState, useEffect, useMemo } from 'react';
import axios from '../../../../Api';  // Ensure this is the correct path for your API instance
import { useSelector } from 'react-redux';

function Users() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state.auth);  // Get the token from Redux store

  const filteredUsers = useMemo(() => {
    if (Array.isArray(users)) {
      return users.filter(user =>
        user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.email.toLowerCase().includes(searchQuery.toLowerCase())  
      );
    }
    return [];  // Return an empty array if users is not an array
  }, [searchQuery, users]);

  // Fetch users data from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/admin/users/', {
          headers: { Authorization: `Bearer ${token}` }, 
        });
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch users.');
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);  // Run the effect when token changes

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Header with Search and Add New Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Users</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by username or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="grid grid-cols-6 gap-2 text-gray-700 font-semibold border-b border-gray-300">
        <div>First Name</div>
        <div>Last Name</div>
        <div>Email</div>
        <div>Phone Number</div>
        <div>Join Date</div>
        <div>Action</div>
      </div>

      <div>
        {filteredUsers.map(user => (
          <div key={user.id} className="grid grid-cols-6 gap-2 items-center py-3 border-b border-gray-200 hover:bg-gray-50 transition-all">
            <div>{user.first_name}</div>
            <div>{user.last_name}</div>
            <div className='-ml-8'>{user.email}</div>
            <div className='ml-8'>{user.phone_number}</div>
            <div>{user.first_join}</div>
            <div>
              <button className="bg-[#4a4a4a] text-white px-4 py-2 rounded-lg">View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Users;
