import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../../utils/Api"; // Adjust this path as needed
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";

function ResortCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();
  const { token } = useSelector((state) => state.auth);

  const headers = { Authorization: `Bearer ${token}` };

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get("api/admin-resorts-categories/", {
        headers,
      });
      setCategories(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch categories.");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await axios.delete(`api/admin-resorts-categories/${categoryToDelete}/`, {
        headers,
      });
      setCategories((prev) =>
        prev.filter((category) => category.id !== categoryToDelete)
      );
      onDeleteModalClose();
      setCategoryToDelete(null);
      toast.success("Category deleted successfully.");
    } catch (err) {
      toast.error("Failed to delete category.");
      setError("Failed to delete category.");
    }
  };

  const handleSave = async () => {
    if (!selectedCategory.name || !selectedCategory.description) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      if (selectedCategory.id) {
        // Update
        const response = await axios.patch(
          `api/admin-resorts-categories/${selectedCategory.id}/`,
          selectedCategory,
          { headers }
        );
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === selectedCategory.id ? response.data : cat
          )
        );
        toast.success("Category updated successfully.");
      } else {
        // Create
        const response = await axios.post(
          "api/admin-resorts-categories/",
          selectedCategory,
          {
            headers,
          }
        );
        setCategories((prev) => [...prev, response.data]);
        toast.success("Category created successfully.");
      }

      onModalClose();
      setSelectedCategory(null);
    } catch (err) {
      toast.error("Failed to save category.");
      setError("Failed to save category.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="bg-[#F6F6F6] rounded-lg shadow-lg p-6">
      {/* Header with Search and Add New Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-[#023246]">Categories</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-[#D4D4CE] p-2 rounded-lg text-[#023246] focus:outline-none focus:ring-2 focus:ring-[#287094]"
            aria-label="Search categories"
          />
          <Button
            onPress={() => {
              setTimeout(() => {
                setSelectedCategory({ name: "", description: "" });
                onModalOpen();
              }, 300);
            }}
            className="bg-[#287094] text-white px-4 py-2 rounded-lg hover:bg-[#023246]"
          >
            Add New
          </Button>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center text-[#287094]">Loading categories...</div>
      )}

      {!loading && categories.length > 0 && (
        <div>
          <div className="grid grid-cols-[25%,55%,15%] gap-2 text-[#023246] font-semibold border-b border-[#D4D4CE]">
            <div>Category Name</div>
            <div>Description</div>
            <div>Actions</div>
          </div>

          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="grid grid-cols-[25%,55%,15%] gap-2 items-center py-3 border-b border-[#D4D4CE] hover:bg-[#D4D4CE] transition-all"
            >
              <div>{category.name}</div>
              <div>{category.description}</div>
              <div className="flex gap-2">
                <Button
                  onPress={() => {
                    setTimeout(() => {
                      setSelectedCategory(category);
                      onModalOpen();
                    }, 300);
                  }}
                  className="bg-[#D4D4CE] text-[#023246] px-4 py-2 rounded-lg hover:bg-[#F6F6F6]"
                >
                  Edit
                </Button>
                <Button
                  onPress={() => {
                    setTimeout(() => {
                      setCategoryToDelete(category.id);
                      onDeleteModalOpen();
                    }, 300);
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add/Edit */}
      <Modal isOpen={isModalOpen} onClose={onModalClose} aria-labelledby="modal-title">
        <ModalContent>
          <ModalHeader>
            {selectedCategory?.id ? "Edit Category" : "Add Category"}
          </ModalHeader>
          <ModalBody>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4">
                <p>{error}</p>
              </div>
            )}
            <input
              type="text"
              placeholder="Category Name"
              value={selectedCategory?.name || ""}
              onChange={(e) =>
                setSelectedCategory({
                  ...selectedCategory,
                  name: e.target.value,
                })
              }
              className="border border-[#D4D4CE] p-2 rounded-lg w-full text-[#023246] focus:outline-none focus:ring-2 focus:ring-[#287094]"
            />
            <textarea
              placeholder="Description"
              value={selectedCategory?.description || ""}
              onChange={(e) =>
                setSelectedCategory({
                  ...selectedCategory,
                  description: e.target.value,
                })
              }
              className="border border-[#D4D4CE] p-2 rounded-lg w-full text-[#023246] focus:outline-none focus:ring-2 focus:ring-[#287094]"
            />
          </ModalBody>
          <ModalFooter>
            <Button
              onPress={() => {
                setTimeout(() => {
                  onModalClose();
                  setSelectedCategory(null);
                  setError(null);
                }, 300);
              }}
              className="bg-[#F6F6F6] text-[#023246] px-4 py-2 rounded-lg hover:bg-[#D4D4CE]"
            >
              Cancel
            </Button>
            <Button
              onPress={handleSave}
              className="bg-[#287094] text-white px-4 py-2 rounded-lg hover:bg-[#023246]"
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose} aria-labelledby="delete-modal-title">
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalBody>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4">
                <p>{error}</p>
              </div>
            )}
            <p className="text-gray-700">
              Are you sure you want to delete this category?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              onPress={() => {
                setTimeout(() => {
                  onDeleteModalClose();
                  setError(null);
                }, 300);
              }}
              className="bg-[#F6F6F6] text-[#023246] px-4 py-2 rounded-lg hover:bg-[#D4D4CE]"
            >
              Cancel
            </Button>
            <Button
              onPress={() => setTimeout(handleDelete, 300)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default ResortCategory;
