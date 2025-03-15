import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../../utils/Api";
import { Button, Chip, Pagination, Tooltip, Input, Spinner } from "@nextui-org/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { useDispatch, useSelector } from "react-redux";
import { setAdmins } from "../../../Toolkit/Slice/apiHomeSlice";
import { toast } from "sonner";
import { IoMdAdd, IoMdTrash, IoMdCreate } from "react-icons/io";
import { FaEye, FaSearch, FaSortAmountDown, FaSortAmountUpAlt } from "react-icons/fa";

function Admins() {
  const [searchQuery, setSearchQuery] = useState("");
  const [admins, setInAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState("username");
  const [sortDirection, setSortDirection] = useState("asc");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    phone_number: "",
    password: "",
    confirm_password: "",
  });
  
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const redux_Admins = useSelector((state) => state.api.Admins);

  // Form validation
  const [errors, setErrors] = useState({});
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name) newErrors.first_name = "First name is required";
    if (!formData.last_name) newErrors.last_name = "Last name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.phone_number) {
      newErrors.phone_number = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Phone number must be 10 digits";
    }
    
    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      
      if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = "Passwords do not match";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Filtered and sorted admins
  const processedAdmins = useMemo(() => {
    if (!Array.isArray(admins)) return [];
    
    // Filter
    let result = admins.filter(
      (user) =>
        user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Sort
    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (a[sortField] > b[sortField]) {
        comparison = 1;
      } else if (a[sortField] < b[sortField]) {
        comparison = -1;
      }
      return sortDirection === "desc" ? comparison * -1 : comparison;
    });
    
    return result;
  }, [searchQuery, admins, sortField, sortDirection]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedAdmins.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(processedAdmins.length / itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [token]);

  const fetchAdmins = async () => {
    setLoading(true);
    if (!redux_Admins || redux_Admins.length === 0) {
      try {
        const response = await axios.get("/api/admin/admins/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        dispatch(setAdmins(response.data));
        setInAdmins(response.data);
      } catch (error) {
        console.error("Error fetching Admins:", error);
        setError("Failed to fetch Admins Requests.");
        toast.error("Failed to fetch admin users");
      }
    } else {
      setInAdmins(redux_Admins);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      username: "",
      phone_number: "",
      password: "",
      confirm_password: "",
    });
    setFormModalVisible(true);
  };

  const openEditModal = (user) => {
    setIsEditing(true);
    setFormData({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      username: user.username,
      phone_number: user.phone_number,
      password: "",
      confirm_password: "",
    });
    setFormModalVisible(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setDeleteModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (isEditing) {
        // Update existing admin
        const updateData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          username: formData.username,
          phone_number: formData.phone_number,
        };
        
        // Only include password if it was changed
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        await axios.put(`/api/admin/admins/${formData.id}/`, updateData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        toast.success("Admin updated successfully");
      } else {
        // Create new admin
        await axios.post("/api/admin/admins/", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        toast.success("Admin created successfully");
      }
      
      // Refresh admin list
      fetchAdmins();
      setFormModalVisible(false);
    } catch (error) {
      console.error("Error saving admin:", error);
      toast.error(error.response?.data?.message || "Failed to save admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    
    try {
      await axios.delete(`/api/admin/admins/${selectedUser.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success("Admin deleted successfully");
      
      // Refresh admin list
      fetchAdmins();
      setDeleteModalVisible(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast.error(error.response?.data?.message || "Failed to delete admin");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" color="primary" />
        <span className="ml-2">Loading Admins...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Header with Search and Add New Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">Admin Users</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Input
              type="text"
              placeholder="Search admins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              startContent={<FaSearch className="text-gray-400" />}
              clearable
            />
          </div>
          
          <Button 
            color="primary"
            className="bg-[#287094] text-white"
            startContent={<IoMdAdd />}
            onClick={openAddModal}
          >
            Add Admin
          </Button>
        </div>
      </div>

      {/* Admin count and filters */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Total: <span className="font-semibold">{processedAdmins.length}</span> admin users
        </div>
      </div>

      {/* Admins Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        {/* Desktop Table */}
        <table className="hidden sm:table w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer" onClick={() => handleSort("username")}>
                <div className="flex items-center">
                  Username
                  {sortField === "username" && (
                    sortDirection === "asc" ? <FaSortAmountUpAlt className="ml-1" /> : <FaSortAmountDown className="ml-1" />
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer" onClick={() => handleSort("first_name")}>
                <div className="flex items-center">
                  First Name
                  {sortField === "first_name" && (
                    sortDirection === "asc" ? <FaSortAmountUpAlt className="ml-1" /> : <FaSortAmountDown className="ml-1" />
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer" onClick={() => handleSort("last_name")}>
                <div className="flex items-center">
                  Last Name
                  {sortField === "last_name" && (
                    sortDirection === "asc" ? <FaSortAmountUpAlt className="ml-1" /> : <FaSortAmountDown className="ml-1" />
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer" onClick={() => handleSort("email")}>
                <div className="flex items-center">
                  Email
                  {sortField === "email" && (
                    sortDirection === "asc" ? <FaSortAmountUpAlt className="ml-1" /> : <FaSortAmountDown className="ml-1" />
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Phone Number</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer" onClick={() => handleSort("first_join")}>
                <div className="flex items-center">
                  Join Date
                  {sortField === "first_join" && (
                    sortDirection === "asc" ? <FaSortAmountUpAlt className="ml-1" /> : <FaSortAmountDown className="ml-1" />
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentItems.length > 0 ? (
              currentItems.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-all">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.username}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{user.first_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{user.last_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{user.phone_number}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(user.first_join).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-center">
                    <div className="flex justify-center space-x-2">
                      <Tooltip content="View Details">
                        <Button 
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="text-[#287094]"
                          onClick={() => {
                            setSelectedUser(user);
                            setModalVisible(true);
                          }}
                        >
                          <FaEye />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Edit">
                        <Button 
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="text-amber-500"
                          onClick={() => openEditModal(user)}
                        >
                          <IoMdCreate />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Delete">
                        <Button 
                          isIconOnly
                          size="sm"
                          variant="light"
                          className="text-red-500"
                          onClick={() => openDeleteModal(user)}
                        >
                          <IoMdTrash />
                        </Button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  No admin users found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-4">
          {currentItems.length > 0 ? (
            currentItems.map((user) => (
              <div key={user.id} className="bg-white p-4 rounded-lg shadow border">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg text-gray-900">{user.username}</h3>
                  <Chip size="sm" color="primary" variant="flat">
                    Admin
                  </Chip>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-sm">
                    <span className="font-semibold text-gray-700">Name:</span>{" "}
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-gray-700">Email:</span>{" "}
                    <span className="break-all">{user.email}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-gray-700">Phone:</span>{" "}
                    {user.phone_number}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-gray-700">Joined:</span>{" "}
                    {new Date(user.first_join).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    className="flex-1"
                    onClick={() => {
                      setSelectedUser(user);
                      setModalVisible(true);
                    }}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    color="warning"
                    className="flex-1"
                    onClick={() => openEditModal(user)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    className="flex-1"
                    onClick={() => openDeleteModal(user)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No admin users found
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {processedAdmins.length > itemsPerPage && (
        <div className="flex justify-center mt-6">
          <Pagination
            total={totalPages}
            initialPage={1}
            page={currentPage}
            onChange={setCurrentPage}
          />
        </div>
      )}

      {/* View User Details Modal */}
      {modalVisible && selectedUser && (
        <Modal isOpen={modalVisible} onOpenChange={setModalVisible} size="md">
          <ModalContent>
            <ModalHeader>
              <h3 className="text-xl font-semibold text-[#023246]">
                Admin User Details
              </h3>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4 text-[#023246]">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold text-[#287094] block">Username</span>
                    <span className="block">{selectedUser.username}</span>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-[#287094] block">Status</span>
                    <Chip color="success" variant="flat">Active</Chip>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-[#287094] block">First Name</span>
                    <span className="block">{selectedUser.first_name}</span>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-[#287094] block">Last Name</span>
                    <span className="block">{selectedUser.last_name}</span>
                  </div>
                  
                  <div className="md:col-span-2">
                    <span className="font-semibold text-[#287094] block">Email</span>
                    <span className="block break-all">{selectedUser.email}</span>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-[#287094] block">Phone Number</span>
                    <span className="block">{selectedUser.phone_number}</span>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-[#287094] block">Join Date</span>
                    <span className="block">{new Date(selectedUser.first_join).toLocaleDateString()}</span>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-[#287094] block">Last Joined</span>
                    <span className="block">{new Date(selectedUser.last_join).toLocaleDateString()}</span>
                  </div>
                  
                  <div>
                    <span className="font-semibold text-[#287094] block">Last Login</span>
                    <span className="block">{selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : 'Never'}</span>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                onClick={() => openEditModal(selectedUser)}
                className="bg-amber-500 text-white"
              >
                Edit
              </Button>
              <Button
                color="danger"
                onClick={closeModal}
                className="bg-[#287094] text-white"
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Create/Edit Admin Form Modal */}
      <Modal isOpen={formModalVisible} onOpenChange={setFormModalVisible} size="lg">
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-semibold text-[#023246]">
              {isEditing ? "Edit Admin User" : "Add New Admin User"}
            </h3>
          </ModalHeader>
          <ModalBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    isRequired
                    isInvalid={!!errors.first_name}
                    errorMessage={errors.first_name}
                  />
                </div>
                
                <div>
                  <Input
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    isRequired
                    isInvalid={!!errors.last_name}
                    errorMessage={errors.last_name}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    isRequired
                    isInvalid={!!errors.email}
                    errorMessage={errors.email}
                  />
                </div>
                
                <div>
                  <Input
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    isRequired
                    isInvalid={!!errors.username}
                    errorMessage={errors.username}
                  />
                </div>
                
                <div>
                  <Input
                    label="Phone Number"
                    name="phone_number"
                    type="tel"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    isRequired
                    isInvalid={!!errors.phone_number}
                    errorMessage={errors.phone_number}
                  />
                </div>
                
                <div>
                  <Input
                    label={isEditing ? "New Password (leave blank to keep current)" : "Password"}
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    isRequired={!isEditing}
                    isInvalid={!!errors.password}
                    errorMessage={errors.password}
                  />
                </div>
                
                <div>
                  <Input
                    label="Confirm Password"
                    name="confirm_password"
                    type="password"
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    isRequired={!isEditing}
                    isInvalid={!!errors.confirm_password}
                    errorMessage={errors.confirm_password}
                  />
                </div>
              </div>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              onClick={() => setFormModalVisible(false)}
              className="bg-gray-400 text-white"
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={handleSubmit}
              className="bg-[#287094] text-white"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isEditing ? "Update" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalVisible} onOpenChange={setDeleteModalVisible} size="sm">
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-semibold text-[#023246]">
              Confirm Delete
            </h3>
          </ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete the admin user <span className="font-bold">{selectedUser?.username}</span>?
            </p>
            <p className="text-gray-500 text-sm mt-2">
              This action cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              onClick={() => setDeleteModalVisible(false)}
              className="bg-gray-400 text-white"
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onClick={handleDelete}
              className="bg-red-500 text-white"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default Admins;