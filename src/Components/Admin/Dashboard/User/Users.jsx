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
import {setUsers} from "../../../Toolkit/Slice/apiHomeSlice";


function Users() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setInUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null); // Track selected user for the modal
  const [modalVisible, setModalVisible] = useState(false); // Track modal visibility
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const redux_users = useSelector((state) => state.api.users);

  const filteredUsers = useMemo(() => {
    if (Array.isArray(users)) {
      return users.filter(
        (user) =>
          user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return [];
  }, [searchQuery, users]);

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
          toast.error("Failed to fetch users requests");
        });
      setLoading(false);
    } else {
      setInUsers(redux_users);
      setLoading(false);
    }
    };

    fetchUsers();
  }, [token]);

  const closeModal = () => {
    setModalVisible(false);
    setSelectedUser(null);
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Header with Search and Add New Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Users</h2>
        <div className="w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by username or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        {/* Desktop Table */}
        <div className="hidden sm:grid grid-cols-6 gap-2 text-gray-700 font-semibold border-b border-gray-300 py-2">
          <div>First Name</div>
          <div>Last Name</div>
          <div>Email</div>
          <div>Phone Number</div>
          <div>Join Date</div>
          <div>Action</div>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">First Name:</span>{" "}
                  {user.first_name}
                </p>
                <p>
                  <span className="font-semibold">Last Name:</span>{" "}
                  {user.last_name}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {user.email}
                </p>
                <p>
                  <span className="font-semibold">Phone Number:</span>{" "}
                  {user.phone_number}
                </p>
                <p>
                  <span className="font-semibold">Join Date:</span>{" "}
                  {user.first_join}
                </p>
                <Button
                  onClick={() => {
                    setSelectedUser(user);
                    setModalVisible(true);
                  }}
                  className="w-full bg-[#4a4a4a] text-white px-4 py-2 rounded-lg"
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table Rows */}
        <div className="hidden sm:block">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-6 gap-2 items-center py-3 border-b border-gray-200 hover:bg-gray-50 transition-all"
            >
              <div>{user.first_name}</div>
              <div>{user.last_name}</div>
              <div className=" overflow-x-scroll">{user.email}</div>
              <div>{user.phone_number}</div>
              <div>{user.first_join}</div>
              <div>
                <Button
                  onClick={() => {
                    setSelectedUser(user);
                    setModalVisible(true);
                  }}
                  className="bg-[#4a4a4a] text-white px-4 py-2 rounded-lg"
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Details Modal */}
      {modalVisible && selectedUser && (
        <Modal isOpen={modalVisible} onOpenChange={setModalVisible}>
          <ModalContent>
            <ModalHeader>
              <h3 className="text-xl font-semibold text-[#023246]">
                User Details
              </h3>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4 text-[#023246]">
                <p>
                  <span className="font-semibold text-[#287094]">
                    First Name:
                  </span>{" "}
                  {selectedUser.first_name}
                </p>
                <p>
                  <span className="font-semibold text-[#287094]">
                    Last Name:
                  </span>{" "}
                  {selectedUser.last_name}
                </p>
                <p>
                  <span className="font-semibold text-[#287094]">
                    Email:
                  </span>{" "}
                  {selectedUser.email}
                </p>

                <p>
                  <span className="font-semibold text-[#287094]">
                    Phone Number:
                  </span>{" "}
                  {selectedUser.phone_number}
                </p>
                <p>
                  <span className="font-semibold text-[#287094]">
                    Join Date:
                  </span>{" "}
                  {selectedUser.first_join}
                </p>
                <p>
                  <span className="font-semibold text-[#287094]">
                    Last Join:
                  </span>{" "}
                  {selectedUser.last_join}
                </p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                onClick={() => setTimeout(closeModal, 300)}
                className="bg-[#287094] text-white px-6 py-2 rounded-lg hover:bg-[#023246] transition-all"
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}

export default Users;
