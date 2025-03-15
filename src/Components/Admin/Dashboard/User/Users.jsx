import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../../utils/Api";
import { Button } from "@nextui-org/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { useDispatch, useSelector } from "react-redux";
import { setUsers } from "../../../Toolkit/Slice/apiHomeSlice";

function Users() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setInUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sortField, setSortField] = useState("first_name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [viewTab, setViewTab] = useState("profile"); // "profile", "activity", "stats"
  
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const redux_users = useSelector((state) => state.api.users);

  // Filtered and sorted users
  const processedUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    
    // First filter
    const filtered = users.filter(
      (user) =>
        user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Then sort
    return [...filtered].sort((a, b) => {
      const valueA = a[sortField] || "";
      const valueB = b[sortField] || "";
      
      if (sortDirection === "asc") {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    });
  }, [searchQuery, users, sortField, sortDirection]);

  // Handle sort change
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get time since registration
  const getTimeSince = (dateString) => {
    const joinDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - joinDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      if (!redux_users) {
        axios
          .get("/api/admin/users/", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            dispatch(setUsers(response.data));
            setInUsers(response.data);
          })
          .catch((error) => {
            console.error("Error fetching users:", error);
            setError("Failed to fetch users Requests.");
          });
        setLoading(false);
      } else {
        setInUsers(redux_users);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, redux_users, dispatch]);

  // Open detail modal
  const openDetailModal = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
    setViewTab("profile");
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedUser(null);
  };

  // Get user initials for avatar placeholder
  const getUserInitials = (user) => {
    if (!user) return "U";
    return `${user.first_name?.charAt(0) || ""}${user.last_name?.charAt(0) || ""}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-lg font-medium text-gray-700">Loading users data...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">User Directory</h2>
          <p className="text-gray-600 mt-1">Browse and view detailed user information</p>
        </div>
        <div className="w-full sm:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 border border-gray-300 p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute left-3 top-3.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* User counts stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="text-[#023246] text-lg font-semibold">Total Users</div>
          <div className="text-2xl font-bold text-[#023246]">{users.length}</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <div className="text-purple-800 text-lg font-semibold">Active Today</div>
          <div className="text-2xl font-bold text-purple-900">
            {users.filter(user => new Date(user.last_join).toDateString() === new Date().toDateString()).length}
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <div className="text-green-800 text-lg font-semibold">New This Month</div>
          <div className="text-2xl font-bold text-green-900">
            {users.filter(user => {
              const today = new Date();
              const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
              return new Date(user.first_join) >= firstDay;
            }).length}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto bg-gray-50 rounded-lg border border-gray-200">
        <div className="hidden sm:grid grid-cols-6 gap-2 text-gray-700 font-semibold bg-gray-100 px-4 py-3 rounded-t-lg">
          <div 
            onClick={() => handleSort("first_name")}
            className="cursor-pointer hover:text-[#023246] flex items-center"
          >
            First Name {sortField === "first_name" && (sortDirection === "asc" ? "↑" : "↓")}
          </div>
          <div 
            onClick={() => handleSort("last_name")}
            className="cursor-pointer hover:text-[#023246] flex items-center"
          >
            Last Name {sortField === "last_name" && (sortDirection === "asc" ? "↑" : "↓")}
          </div>
          <div 
            onClick={() => handleSort("username")}
            className="cursor-pointer hover:text-[#023246] flex items-center"
          >
            Username {sortField === "username" && (sortDirection === "asc" ? "↑" : "↓")}
          </div>
          <div 
            onClick={() => handleSort("email")}
            className="cursor-pointer hover:text-[#023246] flex items-center"
          >
            Email {sortField === "email" && (sortDirection === "asc" ? "↑" : "↓")}
          </div>
          <div 
            onClick={() => handleSort("first_join")}
            className="cursor-pointer hover:text-[#023246] flex items-center"
          >
            Join Date {sortField === "first_join" && (sortDirection === "asc" ? "↑" : "↓")}
          </div>
          <div>Actions</div>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-4 p-4">
          {processedUsers.map((user) => (
            <div key={user.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex items-center mb-3">
                <div className="flex-shrink-0">
                  {user.user_image ? (
                    <img 
                      src={user.user_image} 
                      alt={`${user.first_name} ${user.last_name}`}
                      className="w-12 h-12 rounded-full object-cover" 
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-lg">
                      {getUserInitials(user)}
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold">{user.first_name} {user.last_name}</h3>
                  <p className="text-gray-600">@{user.username}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between">
                  <span className="font-semibold text-gray-700">Email:</span>
                  <span className="text-gray-800">{user.email}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-semibold text-gray-700">Phone:</span>
                  <span className="text-gray-800">{user.phone_number || "Not provided"}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-semibold text-gray-700">Joined:</span>
                  <span className="text-gray-800">{user.first_join}</span>
                </p>
              </div>
              <Button
                onClick={() => openDetailModal(user)}
                className="w-full mt-4 bg-[#023246] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Details
              </Button>
            </div>
          ))}
        </div>

        {/* Desktop Table Rows */}
        <div className="hidden sm:block">
          {processedUsers.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-6 gap-2 items-center px-4 py-3 border-t border-gray-200 hover:bg-blue-50 transition-all"
            >
              <div className="flex items-center">
                {user.user_image ? (
                  <img 
                    src={user.user_image} 
                    alt={`${user.first_name}`}
                    className="w-8 h-8 rounded-full mr-2 object-cover" 
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-sm mr-2">
                    {getUserInitials(user)}
                  </div>
                )}
                <span>{user.first_name}</span>
              </div>
              <div>{user.last_name}</div>
              <div>@{user.username}</div>
              <div className="overflow-x-auto truncate">{user.email}</div>
              <div>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {user.first_join}
                </span>
              </div>
              <div>
                <Button
                  onClick={() => openDetailModal(user)}
                  className="bg-[#023246] hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Details Modal */}
      {modalVisible && selectedUser && (
        <Modal 
          isOpen={modalVisible} 
          onOpenChange={setModalVisible}
          size="2xl"
        >
          <ModalContent>
            <ModalHeader className="border-b border-gray-200 pb-4">
              <div className="flex items-center">
                {selectedUser.user_image ? (
                  <img 
                    src={selectedUser.user_image} 
                    alt={`${selectedUser.first_name} ${selectedUser.last_name}`}
                    className="w-12 h-12 rounded-full mr-4 object-cover" 
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xl mr-4">
                    {getUserInitials(selectedUser)}
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold text-[#023246]">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h3>
                  <p className="text-gray-600">@{selectedUser.username}</p>
                </div>
              </div>
            </ModalHeader>
            
            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setViewTab("profile")}
                className={`px-4 py-3 font-medium text-sm ${
                  viewTab === "profile"
                    ? "border-b-2 border-[#023246] text-[#023246]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setViewTab("activity")}
                className={`px-4 py-3 font-medium text-sm ${
                  viewTab === "activity"
                    ? "border-b-2 border-[#023246] text-[#023246]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Activity
              </button>
              <button
                onClick={() => setViewTab("stats")}
                className={`px-4 py-3 font-medium text-sm ${
                  viewTab === "stats"
                    ? "border-b-2 border-[#023246] text-[#023246]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Statistics
              </button>
            </div>
            
            <ModalBody className="py-6">
              {/* Profile Tab */}
              {viewTab === "profile" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="text-lg font-semibold text-[#287094] mb-3">Contact Information</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Email Address</div>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            <a href={`mailto:${selectedUser.email}`} className="text-[#023246] hover:underline">
                              {selectedUser.email}
                            </a>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Phone Number</div>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            <a href={`tel:${selectedUser.phone_number}`} className="text-[#023246] hover:underline">
                              {selectedUser.phone_number || "Not provided"}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="text-lg font-semibold text-[#287094] mb-3">Account Information</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Username</div>
                          <div className="font-medium">@{selectedUser.username}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Member Since</div>
                          <div className="font-medium flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            {selectedUser.first_join} 
                            <span className="ml-1 text-sm text-gray-500">
                              ({getTimeSince(selectedUser.first_join)} ago)
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Last Active</div>
                          <div className="font-medium flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {selectedUser.last_join}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Profile Details */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-semibold text-[#287094] mb-3">Profile Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between pb-2 border-b border-gray-200">
                        <span className="text-gray-600">Full Name</span>
                        <span className="font-medium">{selectedUser.first_name} {selectedUser.last_name}</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b border-gray-200">
                        <span className="text-gray-600">User ID</span>
                        <span className="font-medium">{selectedUser.id}</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b border-gray-200">
                        <span className="text-gray-600">Account Age</span>
                        <span className="font-medium">{getTimeSince(selectedUser.first_join)}</span>
                      </div>
                      <div className="flex justify-between pb-2 border-b border-gray-200">
                        <span className="text-gray-600">Status</span>
                        <span className="font-medium">
                          {new Date(selectedUser.last_join) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? (
                            <span className="text-green-600 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Active
                            </span>
                          ) : (
                            <span className="text-gray-600 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              Inactive
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Tab */}
              {viewTab === "activity" && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#023246] mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <h4 className="text-blue-800 font-medium">User Activity Information</h4>
                    </div>
                    <p className="text-blue-700 text-sm">
                      This tab would normally display user activity logs, login history, and interaction data, but is shown as a placeholder since we don't have that data in the current model.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-[#287094] mb-3">Last Login Activity</h4>
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-2 rounded-full mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Last logged in</div>
                          <div className="text-sm text-gray-500">Web application</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{selectedUser.last_join}</div>
                      </div>
                    </div>
                    
                    <h4 className="font-semibold text-[#287094] mt-4 mb-3">Registration Information</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#023246]" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">Account created</div>
                          <div className="text-sm text-gray-500">Registration source</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{selectedUser.first_join}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Tab */}
              {viewTab === "stats" && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#023246] mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <h4 className="text-blue-800 font-medium">User Statistics Information</h4>
                    </div>
                    <p className="text-blue-700 text-sm">
                      This tab would display user statistics and analytics data, but is shown as a placeholder since we don't have that data in the current model.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-[#287094] mb-3">Account Overview</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between pb-2 border-b border-gray-200">
                          <span className="text-gray-600">Account Age</span>
                          <span className="font-medium">{getTimeSince(selectedUser.first_join)}</span>
                        </div>
                        <div className="flex justify-between pb-2 border-b border-gray-200">
                          <span className="text-gray-600">Logins</span>
                          <span className="font-medium">--</span>
                        </div>
                        <div className="flex justify-between pb-2 border-b border-gray-200">
                          <span className="text-gray-600">Last Activity</span>
                          <span className="font-medium">{selectedUser.last_join}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-[#287094] mb-3">Usage Statistics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between pb-2 border-b border-gray-200">
                          <span className="text-gray-600">Total Sessions</span>
                          <span className="font-medium">--</span>
                        </div>
                        <div className="flex justify-between pb-2 border-b border-gray-200">
                          <span className="text-gray-600">Average Session</span>
                          <span className="font-medium">--</span>
                        </div>
                        <div className="flex justify-between pb-2 border-b border-gray-200">
                          <span className="text-gray-600">Engagement Score</span>
                          <span className="font-medium">--</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </ModalBody>
            
            <ModalFooter>
              <Button
                onClick={closeModal}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
      
      {/* Show message if no users found */}
      {processedUsers.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">No users found matching your search criteria.</div>
          <Button
            onClick={() => setSearchQuery("")}
            className="bg-[#023246] hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Clear Search
          </Button>
        </div>
      )}
    </div>
  );
}

export default Users;