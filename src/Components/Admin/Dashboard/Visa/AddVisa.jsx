import React, { useState, useEffect } from "react";
import axios from "../../../../utils/Api";
import { uploadToCloudinary } from "../../../../utils/cloudinaryUtils";
import { toast } from "sonner";
import { Form, Input, Select, SelectItem, Button } from "@nextui-org/react";
import { useDispatch, useSelector } from "react-redux";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import {setVisa,setsliceVisa} from "../../../Toolkit/Slice/apiHomeSlice";

const AddVisaModal = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const [imageFile, setImageFile] = useState(null);
  
  const defaultVisaDays = [{ day: 1, days: "", price: "" }];
  const [visaDays, setVisaDays] = useState(defaultVisaDays);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    note: "",
    place_photo: "",
    visa_days: defaultVisaDays,
  });
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get("api/visa-categories/");
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories. Please try again.");
      }
    };
    fetchCategories();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    // Basic field validation
    if (!formData.name.trim()) {
      newErrors.name = "Visa name is required";
    }
    
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    
    if (!imageFile && !formData.place_photo) {
      newErrors.place_photo = "Visa photo is required";
    }
    
    // Visa days validation
    visaDays.forEach((day, index) => {
      if (!day.days || day.days <= 0) {
        newErrors[`visa_days_${index}_days`] = "Days must be greater than 0";
      }
      if (!day.price || isNaN(day.price) || day.price < 0) {
        newErrors[`visa_days_${index}_price`] = "Price must be a positive number";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDayChange = (index, field, value) => {
    const updatedVisaDays = visaDays.map((day, i) =>
      i === index ? { ...day, [field]: value } : day
    );
    setVisaDays(updatedVisaDays);
    handleInputChange("visa_days", updatedVisaDays);
    
    // Clear error when field is modified
    if (errors[`visa_days_${index}_${field}`]) {
      setErrors(prev => ({ ...prev, [`visa_days_${index}_${field}`]: undefined }));
    }
  };

  const handleAddDay = () => {
    const newDay = { day: visaDays.length + 1, days: "", price: "" };
    setVisaDays(prev => [...prev, newDay]);
    handleInputChange("visa_days", [...visaDays, newDay]);
  };

  const handleImageChange = (file) => {
    setImageFile(file);
    if (errors.place_photo) {
      setErrors(prev => ({ ...prev, place_photo: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setUploading(true);

    try {
      // Handle image upload first if there's a new image
      let imageId = formData.place_photo;
      if (imageFile) {
        const uploadedImage = await uploadToCloudinary(imageFile);
        const imageUrl = uploadedImage.secure_url;
        imageId = imageUrl.match(/\/([^\/]+)\.jpg/)[1];
      }

      const payload = {
        name: formData.name,
        category: formData.category,
        note: formData.note || "",
        place_photo: imageId,
        visa_days: visaDays.map(day => ({
          day: day.day,
          days: day.days,
          price: day.price,
        })),
      };

      await axios.post("api/admin-visas/", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(setVisa(null));
      dispatch(setsliceVisa(null));
      toast.success("Visa package created successfully!");
      onClose();
    } catch (error) {
      console.error("Error adding visa:", error.response?.data || error.message);
      toast.error("Failed to create visa package. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          <h2 className="text-3xl font-bold text-center text-[#287094]">
            Add New Visa Package
          </h2>
        </ModalHeader>
        <Form onSubmit={handleSubmit} className="space-y-6">
          <ModalBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                isRequired
                name="name"
                label="Visa Name"
                placeholder="Enter visa name"
                value={formData.name}
                isInvalid={!!errors.name}
                errorMessage={errors.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
              <select
                required
                name="category"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className={`p-2 border rounded ${
                  errors.category ? "border-red-500" : ""
                }`}
              >
                <option value="" disabled>
                  Select category
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <input
                type="file"
                onChange={(e) => handleImageChange(e.target.files[0])}
                className={`p-3 border-2 rounded-lg ${
                  errors.place_photo ? "border-red-500" : ""
                }`}
              />
              {errors.place_photo && (
                <p className="text-red-500 text-sm mt-1">{errors.place_photo}</p>
              )}
            </div>

            <div>
              {visaDays.map((visaDay, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4"
                >
                  <Input
                    isRequired
                    name={`visa_days_${index}_days`}
                    label="Days"
                    type="number"
                    value={visaDay.days}
                    placeholder="Enter days"
                    isInvalid={!!errors[`visa_days_${index}_days`]}
                    errorMessage={errors[`visa_days_${index}_days`]}
                    onChange={(e) =>
                      handleDayChange(index, "days", e.target.value)
                    }
                  />
                  <Input
                    isRequired
                    name={`visa_days_${index}_price`}
                    label="Price"
                    type="number"
                    value={visaDay.price}
                    placeholder="Enter price"
                    isInvalid={!!errors[`visa_days_${index}_price`]}
                    errorMessage={errors[`visa_days_${index}_price`]}
                    onChange={(e) =>
                      handleDayChange(index, "price", e.target.value)
                    }
                  />
                </div>
              ))}
              <Button onClick={handleAddDay} color="primary" variant="ghost">
                Add Day
              </Button>
            </div>

            <Input
              label="Notes"
              placeholder="Enter additional notes"
              value={formData.note}
              onChange={(e) => handleInputChange("note", e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="default" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="ml-0"
              type="submit"
              color="primary"
              isDisabled={uploading}
            >
              {uploading ? "Uploading..." : "Save Visa Package"}
            </Button>
          </ModalFooter>
        </Form>
      </ModalContent>
    </Modal>
  );
};

export default AddVisaModal;