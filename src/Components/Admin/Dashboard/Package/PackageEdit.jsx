import React, { useState, useEffect } from "react";
import axios from "../../../../utils/Api";
import { uploadToCloudinary } from "../../../../utils/cloudinaryUtils";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@nextui-org/react";
import {setPackage,setslicePackages} from "../../../Toolkit/Slice/apiHomeSlice";



const PackageEditModal = ({ isOpen, onClose, packageId }) => {
  const [resorts, setResorts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dayPlans, setDayPlans] = useState([]);
  const [packageIncluded, setPackageIncluded] = useState([]);
  const [packageExcluded, setPackageExcluded] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [imagePreviews, setImagePreviews] = useState({});
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const schema = yup.object().shape({
    name: yup.string().required("Package name is required."),
    start: yup
      .date()
      .required("Start date is required.")
      .typeError("Invalid date format."),
    end: yup
      .date()
      .required("End date is required.")
      .typeError("Invalid date format.")
      .min(yup.ref("start"), "End date must be after start date."),
    base_price: yup.number().min(0, "Cannot be negative").required("Required"),
    adult_price: yup.number().min(0, "Cannot be negative").required("Required"),
    child_price: yup.number().min(0, "Cannot be negative").required("Required"),
    category: yup.string().required("Category is required."),
    note: yup.string(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      start: "",
      end: "",
      base_price: "",
      adult_price: "",
      child_price: "",
      category: "",
      valid: true,
      resort: "",
      note: "",
      full_refund : 0,
      half_refund : 0,
    },
  });

  useEffect(() => {
    if (!isOpen || !packageId) return;

    const fetchcategories = async () => {
      try {
        const [resortsData, categoriesData] = await Promise.all([
          axios.get("/api/resorts/"),
          axios.get("/api/package-categories/"),
        ]);
        setResorts(resortsData.data || []);
        setCategories(categoriesData.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage(
          "Failed to fetch resorts or categories. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchcategories();

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `/api/admin/admin-packages/${packageId}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const packageData = response.data;
        const daysPackage = packageData.days || []; // Ensure it's an array
        console.log(packageData.package);
        console.log(daysPackage);

        setDayPlans(daysPackage);
        setPackageIncluded(
          JSON.parse(packageData.package.package_included || "[]")
        ); // Parse the JSON string
        setPackageExcluded(
          JSON.parse(packageData.package.package_excluded || "[]")
        ); // Parse the JSON string

        // Set form values
        setValue("name", packageData.package.name);
        setValue(
          "start",
          packageData.package.start
            ? new Date(packageData.package.start).toISOString().split("T")[0]
            : ""
        );
        setValue(
          "end",
          packageData.package.end
            ? new Date(packageData.package.end).toISOString().split("T")[0]
            : ""
        );
        setValue("base_price", packageData.package.base_price);
        setValue("adult_price", packageData.package.adult_price);
        setValue("child_price", packageData.package.child_price);
        setValue("category", packageData.package.category);
        setValue("resort", packageData.package.resort || ""); // Handle empty resort
        setValue("note", packageData.package.note || "");
        setValue("full_refund", packageData.package.full_refund);
        setValue("half_refund", packageData.package.half_refund);

        // Initialize image previews only if days_package is an array
        const initialPreviews = {};
        daysPackage.forEach((dayPlan, index) => {
          initialPreviews[index] = dayPlan.place_photo_url || "";
        });
        setImagePreviews(initialPreviews);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage("Failed to fetch package details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, packageId, token, setValue]);

  const handleAddDay = () => {
    setDayPlans([
      ...dayPlans,
      {
        day: dayPlans.length + 1,
        place_name: "",
        activity: "",
        place_photo: "",
        resort: "",
      },
    ]);
  };

  const handleDayChange = (index, e) => {
    const { name, value } = e.target;
    const updatedDays = [...dayPlans];
    updatedDays[index][name] = value;
    setDayPlans(updatedDays);
  };

  const handleAddToIncluded = () => {
    setPackageIncluded([...packageIncluded, ""]); // Add empty string as a placeholder
  };

  const handleAddToExcluded = () => {
    setPackageExcluded([...packageExcluded, ""]); // Add empty string as a placeholder
  };

  const handleImageUpload = (index, files) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const updatedDays = [...dayPlans];
    updatedDays[index].place_photo = file;
    setDayPlans(updatedDays);

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviews((prev) => ({
        ...prev,
        [index]: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleIncludedChange = (index, e) => {
    const updatedIncluded = [...packageIncluded];
    updatedIncluded[index] = e.target.value;
    setPackageIncluded(updatedIncluded);
  };

  const handleExcludedChange = (index, e) => {
    const updatedExcluded = [...packageExcluded];
    updatedExcluded[index] = e.target.value;
    setPackageExcluded(updatedExcluded);
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("start", new Date(data.start).toISOString().split("T")[0]);
    formData.append("end", new Date(data.end).toISOString().split("T")[0]);
    formData.append("days", dayPlans.length);
    formData.append("base_price", data.base_price);
    formData.append("adult_price", data.adult_price);
    formData.append("child_price", data.child_price);
    formData.append("valid", data.valid);
    formData.append("category", data.category);
    formData.append("resort", data.resort);
    formData.append("note", data.note || "");
    formData.append("full_refund", data.full_refund);
    formData.append("half_refund", data.half_refund);
    formData.append(
      "package_included",
      JSON.stringify(packageIncluded.filter((item) => item.trim() !== ""))
    );
    formData.append(
      "package_excluded",
      JSON.stringify(packageExcluded.filter((item) => item.trim() !== ""))
    );

    const updatedDays = await Promise.all(
      dayPlans.map(async (dayPlan, index) => {
        if (dayPlan.place_photo instanceof File) {
          try {
            // Handle image upload logic
            const uploadedImage = await uploadToCloudinary(dayPlan.place_photo);
            const imageUrl = uploadedImage.secure_url;
            const imageId = imageUrl.match(/\/([^\/]+)\.jpg/)[1]; // Extract image ID
            dayPlan.place_photo = imageId;
          } catch (error) {
            console.error("Error uploading image:", error.message);
            alert(`Failed to upload image for Day ${dayPlan.day}.`);
          }
        }
        return dayPlan;
      })
    );

    formData.append("days_package", JSON.stringify(updatedDays));

    try {
      setLoading(true);
      await axios.put(`/api/admin/admin-packages/${packageId}/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Package updated successfully!");
      dispatch(setPackage(null));
      dispatch(setslicePackages(null));
      onClose();
    } catch (error) {
      console.error(
        "Error updating package:",
        error.response ? error.response.data : error.message
      );
      alert("Failed to update package. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    reset();
    setDayPlans([]);
    setPackageIncluded([]);
    setPackageExcluded([]);
    setImagePreviews({});
    setErrorMessage("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#1f2e358e] bg-opacity-75 z-50">
      <div className="bg-[#F6F6F6] rounded-lg shadow-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold text-center text-[#287094] mb-6">
          Edit Package
        </h2>
        {loading ? (
          <div>Loading package details...</div>
        ) : errorMessage ? (
          <div className="text-red-500">{errorMessage}</div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-lg font-medium text-[#023246]">
                  Package Name:
                </label>
                <input
                  type="text"
                  {...register("name")}
                  //   value={packageData}
                  className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
                  placeholder="Enter package name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
              </div>

              <div className="flex space-x-6">
                <div className="w-1/3">
                  <label className="block text-lg font-medium text-[#023246]">
                    Base Price:
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register("base_price")}
                    className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
                    placeholder="Enter base price"
                  />
                  {errors.base_price && (
                    <p className="text-red-500 text-sm">
                      {errors.base_price.message}
                    </p>
                  )}
                </div>

                <div className="w-1/3">
                  <label className="block text-lg font-medium text-[#023246]">
                    Adult Price:
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register("adult_price")}
                    className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
                    placeholder="Enter adult price"
                  />
                  {errors.adult_price && (
                    <p className="text-red-500 text-sm">
                      {errors.adult_price.message}
                    </p>
                  )}
                </div>

                <div className="w-1/3">
                  <label className="block text-lg font-medium text-[#023246]">
                    Child Price:
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register("child_price")}
                    className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
                    placeholder="Enter child price"
                  />
                  {errors.child_price && (
                    <p className="text-red-500 text-sm">
                      {errors.child_price.message}
                    </p>
                  )}
                </div>
                
              </div>


              <div className="flex space-x-6">
                <div className="w-1/3">
                  <label className="block text-lg font-medium text-[#023246]">
                    Full Refund:
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register("full_refund")}
                    className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
                    placeholder="Enter base price"
                  />
                  {errors.full_refund && (
                    <p className="text-red-500 text-sm">
                      {errors.full_refund.message}
                    </p>
                  )}
                </div>

                <div className="w-1/3">
                  <label className="block text-lg font-medium text-[#023246]">
                    Half Refund:
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register("half_refund")}
                    className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
                    placeholder="Enter adult price"
                  />
                  {errors.half_refund && (
                    <p className="text-red-500 text-sm">
                      {errors.half_refund.message}
                    </p>
                  )}
                </div>

              </div>

              <div className="flex space-x-6">
                <div className="w-1/2">
                  <label className="block text-lg font-medium text-[#023246]">
                    Start Date:
                  </label>
                  <input
                    type="date"
                    {...register("start")}
                    className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
                  />
                  {errors.start && (
                    <p className="text-red-500 text-sm">
                      {errors.start.message}
                    </p>
                  )}
                </div>

                <div className="w-1/2">
                  <label className="block text-lg font-medium text-[#023246]">
                    End Date:
                  </label>
                  <input
                    type="date"
                    {...register("end")}
                    className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
                  />
                  {errors.end && (
                    <p className="text-red-500 text-sm">{errors.end.message}</p>
                  )}
                </div>
              </div>
              <div className="w-1/2">
                  <label className=" text-lg font-medium text-[#023246]">
                    Valid:
                  </label>
                  <input
                    type="checkbox"
                    {...register("valid")}
                    className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
                  />
                  {errors.end && (
                    <p className="text-red-500 text-sm">{errors.end.message}</p>
                  )}
                </div>

              <div>
                <label className="block text-lg font-medium text-[#023246]">
                  Category:
                </label>
                <select
                  {...register("category")}
                  className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-sm">
                    {errors.category.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-lg font-medium text-[#023246]">
                Package Included:
              </label>
              <div className="space-y-2">
                {packageIncluded.map((item, index) => (
                  <input
                    key={index}
                    type="text"
                    value={item}
                    onChange={(e) => handleIncludedChange(index, e)}
                    className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
                    placeholder={`Include point ${index + 1}`}
                  />
                ))}
              </div>
              <Button
                type="Button"
                onClick={() => setTimeout(handleAddToIncluded, 300)}
                className="mt-2 w-[20%] bg-[#287094] text-white p-3 rounded-lg hover:bg-[#023246]"
              >
                Add Another Point
              </Button>
            </div>

            <div>
              <label className="block text-lg font-medium text-[#023246]">
                Package Excluded:
              </label>
              <div className="space-y-2">
                {packageExcluded.map((item, index) => (
                  <input
                    key={index}
                    type="text"
                    value={item}
                    onChange={(e) => handleExcludedChange(index, e)}
                    className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
                    placeholder={`Exclude point ${index + 1}`}
                  />
                ))}
              </div>
              <Button
                type="Button"
                onClick={() => setTimeout(handleAddToExcluded, 300)}
                className="mt-2 w-[20%] bg-[#287094] text-white p-3 rounded-lg hover:bg-[#023246]"
              >
                Add Another Point
              </Button>
            </div>

            <div>
              <label className="block text-lg font-medium text-[#023246]">
                Additional Notes:
              </label>
              <textarea
                {...register("note")}
                className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094] h-40"
                placeholder="Enter any additional notes here"
              />
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-[#023246] mb-4">
                Day Plans
              </h3>
              {dayPlans.map((dayPlan, index) => (
                <div key={index} className="space-y-4 mb-6">
                  <div>
                    <label className="block text-lg font-medium text-[#023246]">
                      Day {dayPlan.day} - Place Name:
                    </label>
                    <input
                      type="text"
                      name="place_name"
                      value={dayPlan.place_name}
                      onChange={(e) => handleDayChange(index, e)}
                      className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
                      placeholder="Enter place name"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-[#023246]">
                      Activity:
                    </label>
                    <input
                      type="text"
                      name="activity"
                      value={dayPlan.activity}
                      onChange={(e) => handleDayChange(index, e)}
                      className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
                      placeholder="Enter activity"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <div className="w-1/2">
                      <label className="block text-lg font-medium text-[#023246]">
                        Resort:
                      </label>
                      {loading ? (
                        <p>Loading resorts...</p>
                      ) : (
                        <select
                          name="resort"
                          value={dayPlan.resort}
                          onChange={(e) => handleDayChange(index, e)}
                          className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
                        >
                          <option value="">Select Resort</option>
                          {resorts.map((resort) => (
                            <option key={resort.id} value={resort.id}>
                              {resort.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="w-1/2">
                      <label className="block text-lg font-medium text-[#023246]">
                        Place Photo:
                      </label>

                      {!imagePreviews[index] && (
                        <img
                          src={`https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${dayPlan.place_photo}`}
                          alt={`Day ${dayPlan.day} Photo`}
                          className="mt-2 w-38 h-32 object-cover rounded-lg"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageUpload(index, e.target.files)
                        }
                      />
                      {imagePreviews[index] && (
                        <img
                          // src={`https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${dayPlan.place_photo}`}
                          src={imagePreviews[index]}
                          alt={`Day ${dayPlan.day} Photo`}
                          className="mt-2 w-32 h-32 object-cover rounded-lg"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="Button"
                onClick={() => setTimeout(handleAddDay, 300)}
                className="mt-4 w-[20%] bg-[#287094] text-white p-3 rounded-lg hover:bg-[#023246]"
              >
                Add Day Plan
              </Button>
            </div>

            <div className="flex justify-between">
              <Button
                type="Button"
                onClick={() => setTimeout(handleClose, 300)}
                className="w-full sm:w-auto bg-[#023246] text-white p-3 rounded-lg mt-6 sm:mr-4 hover:bg-[#287094]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto bg-[#287094] text-white p-3 rounded-lg mt-6 sm:ml-4 hover:bg-[#023246]"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PackageEditModal;
