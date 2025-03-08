import React, { useState, useEffect } from "react";
import axios from "../../../../utils/Api";
import { uploadToCloudinary } from "../../../../utils/cloudinaryUtils";
import { toast } from "sonner";
import { Form, Input, Button } from "@nextui-org/react";
import { useDispatch, useSelector } from "react-redux";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import {setVisa,setsliceVisa} from "../../../Toolkit/Slice/apiHomeSlice";


const EditVisaModal = ({ isOpen, onClose, visaId }) => {
    const [categories, setCategories] = useState([]);
    const [visaDays, setVisaDays] = useState([{ day: 1, days: "", price: "" }]);
    const [uploading, setUploading] = useState(false);
    const { token } = useSelector((state) => state.auth);
  
    const [formErrors, setFormErrors] = useState({});
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
      name: "",
      category: "",
      note: "",
      place_photo: "",
      visa_days: visaDays,
    });
  
    const [imagePreview, setImagePreview] = useState(null); // To show the image preview
  
    // Fetch categories and visa data on load
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
  
      const fetchVisaData = async () => {
        if (visaId) {
          try {
            const { data } = await axios.get(`api/visas/${visaId}/`);
            setFormData({
              name: data.name,
              category: data.category.id,
              note: data.note,
              place_photo: data.place_photo,
              visa_days: data.visa_days,
            });
            setVisaDays(data.visa_days);
            setImagePreview(data.place_photo); // Set the image preview
          } catch (error) {
            console.error("Error fetching visa data:", error);
            toast.error("Failed to load visa data. Please try again.");
          }
        }
      };
  
      fetchCategories();
      fetchVisaData();
    }, [visaId]);
  
    // Handle changes to form data
    const handleInputChange = (name, value) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
    };
  
    // Handle visa days
    const handleDayChange = (index, field, value) => {
      const updatedVisaDays = visaDays.map((day, i) =>
        i === index ? { ...day, [field]: value } : day
      );
      setVisaDays(updatedVisaDays);
      handleInputChange("visa_days", updatedVisaDays);
    };
  
    const handleAddDay = () => {
      const newDay = { day: visaDays.length + 1, days: "", price: "" };
      setVisaDays((prev) => [...prev, newDay]);
      handleInputChange("visa_days", [...visaDays, newDay]);
    };
  
    // Handle image upload
    const handleImageUpload = async (file) => {
      if (!file) return;
      setUploading(true);
      try {
        const uploadedImage = await uploadToCloudinary(file);
        handleInputChange("place_photo", uploadedImage.secure_url);
        setImagePreview(uploadedImage.secure_url); // Update image preview after upload
        toast.success("Image uploaded successfully!");
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Image upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    };
  
    // Validate form
    const validateForm = () => {
      const errors = {};
      if (!formData.name.trim()) errors.name = "Visa name is required.";
      if (!formData.category) errors.category = "Category is required.";
      if (!formData.place_photo) errors.place_photo = "Visa photo is required.";
  
      visaDays.forEach((day, index) => {
        if (!day.days || day.days <= 0) {
          errors[`visa_days_${index}_days`] = "Days must be at least 1.";
        }
        if (!day.price || day.price < 0) {
          errors[`visa_days_${index}_price`] = "Price cannot be negative.";
        }
      });
  
      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    };
  
    // Handle form submission
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      // Validate form
      if (!validateForm()) return;
  
      // Prepare payload with only serializable data
      const payload = {
        name: formData.name,
        category: formData.category,
        note: formData.note || "",
        place_photo: formData.place_photo,
        visa_days: visaDays.map((day) => ({
          day: day.day,
          days: day.days,
          price: day.price,
        })),
      };
  
      try {
        const response = await axios.put(`api/visas/${visaId}/`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Visa package updated successfully!");
        dispatch(setVisa(null));
        dispatch(setsliceVisa(null));
        onClose(); // Close the modal after successful submission
      } catch (error) {
        console.error("Error updating visa:", error.response?.data || error.message);
        toast.error("Failed to update visa package. Please try again.");
      }
    };
  
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            <h2 className="text-3xl font-bold text-center text-[#287094]">
              Edit Visa Package
            </h2>
          </ModalHeader>
          <Form onSubmit={handleSubmit} className="space-y-6">
            <ModalBody>
              {/* Visa Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  isRequired
                  name="name"
                  label="Visa Name"
                  placeholder="Enter visa name"
                  errorMessage={formErrors.name}
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
                <select
                  required
                  name="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  className="p-2 border rounded"
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
              </div>
  
              {/* Image Upload with Preview */}
              <div>
                <input
                  type="file"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                  className="p-3 border-2 rounded-lg"
                />
                {imagePreview && <img src={imagePreview} alt="Visa" width="100" />}
                {formErrors.place_photo && (
                  <p className="text-red-500 text-sm">{formErrors.place_photo}</p>
                )}
              </div>
  
              {/* Visa Days */}
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
                      errorMessage={formErrors[`visa_days_${index}_days`]}
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
                      errorMessage={formErrors[`visa_days_${index}_price`]}
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
  
              {/* Notes */}
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
  
  export default EditVisaModal;
  