import React, { useState } from "react";
import axios from "../../../../utils/Api";
import { uploadToCloudinary } from "../../../../utils/cloudinaryUtils";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { useSelector } from "react-redux";

export default function VisaBookingModal({
  isModalOpen,
  handleVisaModalClose,
  visa,
}) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();
  const [selectedDays, setSelectedDays] = useState(0);
  const [selectedPrice, setSelectedPrice] = useState(0);
  const { token } = useSelector((state) => state.auth);

  const validateImageFile = (file) => {
    if (!file) {
      return "Please upload a file";
    }

    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return "Please upload a valid image file (JPG, PNG, JPEG)";
    }

    return true;
  };

  const handleDaysChange = (event) => {
    const selectedValue = event.target.value; // It is a days ID
    console.log("Selected value:", selectedValue);
  
    setSelectedDays(selectedValue);
  
    // Convert selectedValue to number to match the id type
    const selectedVisaDay = visa?.visa_days?.find(
      (visaDay) => visaDay.id === Number(selectedValue) // Convert to number for comparison
    );
    console.log("Selected Visa Day:", selectedVisaDay);
  
    if (selectedVisaDay) {
      setSelectedPrice(selectedVisaDay.price);
    } else {
      setSelectedPrice("");
    }
  };
  

  const onSubmit = async (data) => {
    try {
      // Handle case when no files are selected
      if (!data.passportPhoto?.[0] || !data.personalPhoto?.[0]) {
        if (!data.passportPhoto?.[0]) {
          setError("passportPhoto", {
            message: "Please upload your passport photo.",
          });
        }
        if (!data.personalPhoto?.[0]) {
          setError("personalPhoto", {
            message: "Please upload your personal photo.",
          });
        }
        return;
      }

      // Validate images
      const passportPhotoValidation = validateImageFile(data.passportPhoto[0]);
      const personalPhotoValidation = validateImageFile(data.personalPhoto[0]);

      if (passportPhotoValidation !== true) {
        setError("passportPhoto", { message: passportPhotoValidation });
        return;
      }

      if (personalPhotoValidation !== true) {
        setError("personalPhoto", { message: personalPhotoValidation });
        return;
      }

      // Validate days selection
      if (!selectedDays) {
        setError("days", { message: "Please select number of days" });
        return;
      }

      // Upload images to Cloudinary
      const [passportUpload, personalUpload] = await Promise.all([
        uploadToCloudinary(data.passportPhoto[0]),
        uploadToCloudinary(data.personalPhoto[0]),
      ]);

      // Extract URLs and Image IDs from the uploads
      const passportImageUrl = passportUpload.secure_url;
      const passportImageId = passportImageUrl.match(/\/([^\/]+)\.jpg/)[1];

      const personalImageUrl = personalUpload.secure_url;
      const personalImageId = personalImageUrl.match(/\/([^\/]+)\.jpg/)[1];

      // Prepare data for the backend
      const formData = new FormData();
      formData.append("days", selectedDays);
      formData.append("passport", passportImageId); // Use Cloudinary URL
      formData.append("photo", personalImageId); // Use Cloudinary URL
      formData.append("booked_visa", visa.id);
      formData.append("price", selectedPrice);

      if (!token) {
        toast.error("Authentication required");
        return;
      }

      // Send data to backend
      await axios.post("/api/booked-visa/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Visa booking successful!");
      handleVisaModalClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Booking failed. Please try again."
      );
      console.error("Booking error:", error);
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-60 overflow-y-auto">
      <div className="w-[80%] md:w-[70%] lg:w-[50%] bg-white p-6 md:p-12 lg:p-20 rounded-3xl shadow-lg relative my-8 max-h-[90vh] overflow-y-auto">
        <div className="top-0 bg-white z-10">
          <button
            onClick={handleVisaModalClose}
            className="w-[30%] lg:w-[15%] h-[15%] bg-[#4a4a48] text-[#fff] rounded-[19px] border-none flex justify-center items-center text-sm md:text-base"
          >
            Cancel
          </button>
          <h1 className="text-4xl font-extrabold flex justify-center items-center pb-4 text-[#4a4a48]">
            Visa Booking - {visa?.name}
          </h1>
        </div>

        <div className="bg-[#fcfcfc] rounded-[15px] shadow-[0_0_09px_0_#000000] p-4 md:p-8">
          <div className="mb-4 p-2 md:p-5">
            <label className="block text-sm md:text-[13.5px] font-medium text-[#787878] mb-1">
              Days Selected
            </label>
            <select
              value={selectedDays}
              onChange={handleDaysChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select a number of days</option>
              {visa?.visa_days?.map((visaDay) => (
                <option key={visaDay.id} value={visaDay.id}>
                  {visaDay.days} Days -{" "}
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(visaDay.price)}
                </option>
              ))}
            </select>
            {errors.days && (
              <span className="text-red-500 text-sm">
                {errors.days?.message}
              </span>
            )}
          </div>

          <div className="mb-4 p-2 md:p-5">
            <label className="block text-sm md:text-[13.5px] font-medium text-[#787878] mb-1">
              Passport Photo
            </label>
            <Controller
              name="passportPhoto"
              control={control}
              defaultValue=""
              rules={{ required: "Please upload your passport photo." }}
              render={({ field: { onChange, value, ...field } }) => (
                <input
                  type="file"
                  onChange={(e) => onChange(e.target.files)}
                  {...field}
                  className="w-full p-2 border rounded-md"
                  accept="image/jpeg,image/png,image/jpg"
                />
              )}
            />
            {errors.passportPhoto && (
              <span className="text-red-500 text-sm">
                {errors.passportPhoto?.message}
              </span>
            )}
          </div>

          <div className="mb-4 p-2 md:p-5">
            <label className="block text-sm md:text-[13.5px] font-medium text-[#787878] mb-1">
              Personal Photo
            </label>
            <Controller
              name="personalPhoto"
              control={control}
              defaultValue=""
              rules={{ required: "Please upload your personal photo." }}
              render={({ field: { onChange, value, ...field } }) => (
                <input
                  type="file"
                  onChange={(e) => onChange(e.target.files)}
                  {...field}
                  className="w-full p-2 border rounded-md"
                  accept="image/jpeg,image/png,image/jpg"
                />
              )}
            />
            {errors.personalPhoto && (
              <span className="text-red-500 text-sm">
                {errors.personalPhoto?.message}
              </span>
            )}
          </div>

          <div className="mt-6 flex justify-center items-center">
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={!selectedDays || !selectedPrice}
              className="w-full max-w-[70%] md:max-w-[40%] h-8 bg-[#4a4a48] text-[#e2e2e2] rounded-[19px] border-none text-sm md:text-base disabled:opacity-50"
            >
              Conform Apply
              {/* Pay{" "}
              {selectedPrice
                ? new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(selectedPrice)
                : ""} */}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
