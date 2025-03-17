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
      toast.error("Please fill in all fields.");
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
    <div className="bg-[#F6F6F6] rounded-lg shadow-lg p-4 sm:p-6">
      {/* Header with Search and Add New Button - Responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#023246] w-full sm:w-auto">Categories</h2>
        <div className="flex flex-col md:flex-row gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-[#D4D4CE] p-2 rounded-lg text-[#023246] focus:outline-none focus:ring-2 focus:ring-[#287094] w-full"
            aria-label="Search categories"
          />
          <Button
            onPress={() => {
              setTimeout(() => {
                setSelectedCategory({ name: "", description: "" });
                onModalOpen();
              }, 300);
            }}
            className="bg-[#287094] text-white px-4 py-2 rounded-lg hover:bg-[#023246] w-full md:w-auto"
          >
            Add New
          </Button>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="text-center text-[#287094]">Loading categories...</div>
      )}

      {!loading && categories.length === 0 && (
        <div className="text-center text-[#023246] py-6">
          No categories found. Create a new category to get started.
        </div>
      )}

      {!loading && categories.length > 0 && (
        <>
          {/* Desktop View */}
          <div className="hidden md:block">
            <div className="grid grid-cols-[25%,55%,20%] gap-2 text-[#023246] font-semibold border-b border-[#D4D4CE] pb-2">
              <div>Category Name</div>
              <div>Description</div>
              <div>Actions</div>
            </div>

            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="grid grid-cols-[25%,55%,20%] gap-2 items-center py-3 border-b border-[#D4D4CE] hover:bg-[#D4D4CE] transition-all"
              >
                <div className="truncate">{category.name}</div>
                <div className="truncate">{category.description}</div>
                <div className="flex gap-2">
                  <Button
                    onPress={() => {
                      setTimeout(() => {
                        setSelectedCategory(category);
                        onModalOpen();
                      }, 300);
                    }}
                    className="bg-[#D4D4CE] text-[#023246] px-3 py-1 rounded-lg hover:bg-[#F6F6F6] text-sm"
                    size="sm"
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
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 text-sm"
                    size="sm"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile View - Card Layout */}
          <div className="md:hidden">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-lg shadow mb-4 p-4"
              >
                <div className="mb-2">
                  <h3 className="font-bold text-[#023246]">{category.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    onPress={() => {
                      setTimeout(() => {
                        setSelectedCategory(category);
                        onModalOpen();
                      }, 300);
                    }}
                    className="bg-[#D4D4CE] text-[#023246] px-4 py-2 rounded-lg hover:bg-[#F6F6F6] flex-1"
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
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex-1"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal for Add/Edit - Responsive adjustments */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={onModalClose}
        size="sm"
        aria-labelledby="modal-title"
        className="mx-4"
      >
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
            <div className="space-y-4">
              <div>
                <label htmlFor="categoryName" className="block text-sm font-medium text-[#023246] mb-1">
                  Category Name
                </label>
                <input
                  id="categoryName"
                  type="text"
                  placeholder="Enter category name"
                  value={selectedCategory?.name || ""}
                  onChange={(e) =>
                    setSelectedCategory({
                      ...selectedCategory,
                      name: e.target.value,
                    })
                  }
                  className="border border-[#D4D4CE] p-2 rounded-lg w-full text-[#023246] focus:outline-none focus:ring-2 focus:ring-[#287094]"
                />
              </div>
              <div>
                <label htmlFor="categoryDescription" className="block text-sm font-medium text-[#023246] mb-1">
                  Description
                </label>
                <textarea
                  id="categoryDescription"
                  placeholder="Enter description"
                  value={selectedCategory?.description || ""}
                  onChange={(e) =>
                    setSelectedCategory({
                      ...selectedCategory,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  className="border border-[#D4D4CE] p-2 rounded-lg w-full text-[#023246] focus:outline-none focus:ring-2 focus:ring-[#287094]"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button
                onPress={() => {
                  setTimeout(() => {
                    onModalClose();
                    setSelectedCategory(null);
                    setError(null);
                  }, 300);
                }}
                className="bg-[#F6F6F6] text-[#023246] px-4 py-2 rounded-lg hover:bg-[#D4D4CE] w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onPress={handleSave}
                className="bg-[#287094] text-white px-4 py-2 rounded-lg hover:bg-[#023246] w-full sm:w-auto"
              >
                Save
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal - Responsive adjustments */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={onDeleteModalClose}
        size="sm"
        aria-labelledby="delete-modal-title"
        className="mx-4"
      >
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
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button
                onPress={() => {
                  setTimeout(() => {
                    onDeleteModalClose();
                    setError(null);
                  }, 300);
                }}
                className="bg-[#F6F6F6] text-[#023246] px-4 py-2 rounded-lg hover:bg-[#D4D4CE] w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onPress={() => setTimeout(handleDelete, 300)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 w-full sm:w-auto"
              >
                Delete
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default ResortCategory;