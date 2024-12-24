import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../../utils/Api";
import { Button } from "@nextui-org/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal";
import { useSelector } from "react-redux";

function Users() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null); // Track selected user for the modal
  const [modalVisible, setModalVisible] = useState(false); // Track modal visibility
  const { token } = useSelector((state) => state.auth);

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
      try {
        setLoading(true);
        const response = await axios.get("/api/admin/users/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch users.");
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
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="grid grid-cols-6 gap-2 items-center py-3 border-b border-gray-200 hover:bg-gray-50 transition-all"
          >
            <div>{user.first_name}</div>
            <div>{user.last_name}</div>
            <div className="-ml-8">{user.email}</div>
            <div className="ml-8">{user.phone_number}</div>
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

      {/* User Details Modal */}
      {modalVisible && selectedUser && (
        <Modal isOpen={modalVisible} onOpenChange={setModalVisible}>
          <ModalContent>
            <ModalBody>
              {/* <div className="bg-[#F6F6F6] p-8 rounded-lg shadow-lg w-full max-w-md space-y-6"> */}
                <h3 className="text-xl font-semibold text-[#023246] p-4 mb-6">
                  User Details
                </h3>

                <div className="space-y-4 text-[#023246] p-4">
                  <p>
                    <span className="font-semibold text-[#287094]">
                      First Name:
                    </span>{" "}
                    {selectedUser.first_name}
                  </p>
                  <p>
                    <span className="font-semibold text-[#287094]">Last Name:</span>{" "}
                    {selectedUser.last_name}
                  </p>
                  <p>
                    <span className="font-semibold text-[#287094]">Email:</span>{" "}
                    {selectedUser.email}
                  </p>
                  <p>
                    <span className="font-semibold text-[#287094]">
                      Phone Number:
                    </span>{" "}
                    {selectedUser.phone_number}
                  </p>
                  <p>
                    <span className="font-semibold text-[#287094]">Join Date:</span>{" "}
                    {selectedUser.first_join}
                  </p>
                  <p>
                    <span className="font-semibold text-[#287094]">Last Join:</span>{" "}
                    {selectedUser.last_join}
                  </p>
                </div>
              {/* </div> */}
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
