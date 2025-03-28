import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../../utils/Api"; // Adjust this path as needed
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";

function PackageCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const { isOpen: modalVisible, onOpen: onModalOpen, onOpenChange: onModalClose } = useDisclosure();
  const { isOpen: deleteModalVisible, onOpen: onDeleteModalOpen, onOpenChange: onDeleteModalClose } = useDisclosure();
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
      const response = await axios.get("api/admin-package-categories/", {
        headers,
      });
      setCategories(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch categories.");
      setLoading(false);
    }
  };

  const handleDelete = async (event) => {
    event.stopPropagation();
    if (!categoryToDelete) return;
    try {
      await axios.delete(`api/admin-package-categories/${categoryToDelete}/`, {
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
        const response = await axios.patch(
          `api/admin-package-categories/${selectedCategory.id}/`,
          selectedCategory,
          { headers }
        );
        setCategories((prev) =>
          prev.map((cat) => (cat.id === selectedCategory.id ? response.data : cat))
        );
        toast.success("Category updated successfully.");
      } else {
        const response = await axios.post(
          "api/admin-package-categories/",
          selectedCategory,
          { headers }
        );
        setCategories((prev) => [...prev, response.data]);
        toast.success("Category saved successfully.");
      }

      onModalClose();
      setSelectedCategory(null);
    } catch (err) {
      setError(err.response.data.name[0]);
      toast.error("Failed to save category.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="bg-[#F6F6F6] rounded-lg shadow-lg p-4 sm:p-6">
      {/* Header with Search and Add New Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-2xl font-bold text-[#023246]">Categories</h2>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-[#D4D4CE] bg-[#F6F6F6] p-2 rounded-lg text-[#023246] placeholder-[#287094] focus:ring-2 focus:ring-[#287094] focus:outline-none shadow-sm transition duration-300"
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
      {!loading && categories.length === 0 && (
        <div className="text-center text-[#023246] py-6">
          No categories found. Create a new category to get started.
        </div>
      )}

      {!loading && categories.length > 0 && (
        <div>
          {/* Desktop Table */}
          <div className="hidden sm:grid grid-cols-[25%,55%,15%] gap-2 text-[#023246] font-semibold border-b border-[#D4D4CE]">
            <div>Category Name</div>
            <div>Description</div>
            <div>Actions</div>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-4">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="bg-white p-4 rounded-lg shadow-sm"
              >
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">Category Name:</span> {category.name}
                  </p>
                  <p>
                    <span className="font-semibold">Description:</span> {category.description}
                  </p>
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
              </div>
            ))}
          </div>

          {/* Desktop Table Rows */}
          <div className="hidden sm:block">
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
        </div>
      )}

      {/* Modal for Add/Edit */}
      <Modal isOpen={modalVisible} onOpenChange={onModalClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
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
                  onChange={(e) => {
                    setSelectedCategory({
                      ...selectedCategory,
                      name: e.target.value,
                    });
                    setError(null);
                  }}
                  className="border border-[#D4D4CE] p-2 rounded-lg w-full text-[#023246] focus:outline-none focus:ring-2 focus:ring-[#287094]"
                />
                <textarea
                  placeholder="Description"
                  value={selectedCategory?.description || ""}
                  onChange={(e) => {
                    setSelectedCategory({
                      ...selectedCategory,
                      description: e.target.value,
                    });
                    setError(null);
                  }}
                  className="border border-[#D4D4CE] p-2 rounded-lg w-full text-[#023246] focus:outline-none focus:ring-2 focus:ring-[#287094]"
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    setTimeout(() => {
                      onModalClose();
                      setSelectedCategory(null);
                      setError(null);
                    }, 300);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => {
                    setTimeout(handleSave, 300);
                  }}
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalVisible} onOpenChange={onDeleteModalClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Confirm Deletion</ModalHeader>
              <ModalBody>
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4">
                    <p>{error}</p>
                  </div>
                )}
                <p>Are you sure you want to delete this category?</p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => {
                    setTimeout(() => {
                      onDeleteModalClose();
                      setError(null);
                    }, 300);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => setTimeout(handleDelete, 300)}
                >
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default PackageCategory;