import React, { useState, useEffect } from "react";
import axios from "../../../../utils/Api";
import { uploadToCloudinary } from "../../../../utils/cloudinaryUtils";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSelector } from "react-redux";
import {  toast } from 'sonner'
import { Button } from "@nextui-org/react";
import { tr } from "framer-motion/client";
  
const AddHolidayModal = ({ isOpen, onClose }) => {
  const [resorts, setResorts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dayPlans, setDayPlans] = useState([
    { day: 1, place_name: "", activity: "", place_photo: "", resort: "" },
  ]);
  const [uploading, setUploading] = useState(false);
  const [packageIncluded, setPackageIncluded] = useState([]);
  const [packageExcluded, setPackageExcluded] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const { token } = useSelector((state) => state.auth);

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
    full_refund: yup.number().min(0, "Cannot be negative").required("Required"),
    half_refund: yup.number().min(0, "Cannot be negative").required("Required"),
    note: yup.string(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      start: "",
      end: "",
      is_holiday: true,
      base_price: "",
      adult_price: "",
      child_price: "",
      category: "",
      valid: true,
      resort: "",
      note: "",
      full_refund: 14,
      half_refund: 7,
    },
  });

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
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
    fetchData();
  }, []);

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

  const handleImageUpload = (index, files) => {
    if (!files || files.length === 0) return;
  
    const file = files[0];
    const updatedDays = [...dayPlans];
    updatedDays[index].place_photo = file; 
    setDayPlans(updatedDays);
  };
  
  

  const handleAddToIncluded = () => {
    setPackageIncluded([...packageIncluded, ""]);
  };

  const handleIncludedChange = (index, e) => {
    const updatedIncluded = [...packageIncluded];
    updatedIncluded[index] = e.target.value;
    setPackageIncluded(updatedIncluded);
  };

  const handleAddToExcluded = () => {
    setPackageExcluded([...packageExcluded, ""]);
  };

  const handleExcludedChange = (index, e) => {
    const updatedExcluded = [...packageExcluded];
    updatedExcluded[index] = e.target.value;
    setPackageExcluded(updatedExcluded);
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("start", data.start.toISOString().split('T')[0]);
    formData.append("end", data.end.toISOString().split('T')[0]);
    formData.append("days", dayPlans.length); 
    formData.append("base_price", data.base_price);
    formData.append("adult_price", data.adult_price);
    formData.append("child_price", data.child_price);
    formData.append("category", data.category);
    formData.append("is_holiday", true);
    formData.append("valid", true);
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
  
    // Handle image upload for each dayPlan during form submission
    const updatedDays = await Promise.all(
      dayPlans.map(async (dayPlan) => {
        if (dayPlan.place_photo instanceof File) {
          try {
            // Upload the image only when form is submitted
            const uploadedImage = await uploadToCloudinary(dayPlan.place_photo);
            const imageUrl = uploadedImage.secure_url;
            const imageId = imageUrl.match(/\/([^\/]+)\.jpg/)[1]; // Extract image ID
            dayPlan.place_photo = imageId; // Update with the image ID
          } catch (error) {
            console.error("Error uploading image:", error.message);
          }
        }
        return dayPlan;
      })
    );
  
    formData.append("days_package", JSON.stringify(updatedDays));
  
    console.log("Form Submitted: ", Object.fromEntries(formData.entries()));
  
    try {
      setLoading(true);
      await axios.post("/api/admin-holidays/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Package added successfully!");
      toast.success('Package added successfully!')
      onClose();
    } catch (error) {
      console.error(
        "Error adding package:",
        error.response ? error.response.data : error.message
      );
      toast.error('Event has not been created')
      alert("Failed to save package. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  


  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#1f2e358e] bg-opacity-75 z-50">
      <div className="bg-[#F6F6F6] rounded-lg shadow-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold text-center text-[#287094] mb-6">
          Add New Package
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-lg font-medium text-[#023246]">
                Package Name:
              </label>
              <input
                type="text"
                {...register("name")}
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
              <div className="w-1/2">
                <label className="block text-lg font-medium text-[#023246]">
                  Full Refund (Days):
                </label>
                <input
                  type="number"
                  min="0"
                  {...register("full_refund")}
                  className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
                  placeholder="Enter days for full refund"
                />
                {errors.full_refund && (
                  <p className="text-red-500 text-sm">
                    {errors.full_refund.message}
                  </p>
                )}
              </div>

              <div className="w-1/2">
                <label className="block text-lg font-medium text-[#023246]">
                  Half Refund (Days):
                </label>
                <input
                  type="number"
                  min="0"
                  {...register("half_refund")}
                  className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
                  placeholder="Enter days for half refund"
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
                  <p className="text-red-500 text-sm">{errors.start.message}</p>
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

                <div>
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

                <div>
                  <label className="block text-lg font-medium text-[#023246]">
                    Place Photo:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(index, e.target.files)}
                  />
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
              onClick={() => setTimeout(onClose, 300)}
              className="w-full sm:w-auto bg-[#023246] text-white p-3 rounded-lg mt-6 sm:mr-4 hover:bg-[#287094]">
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-[#287094] text-white p-3 rounded-lg mt-6 sm:ml-4 hover:bg-[#023246]">
              {loading ? "Saving..." : "Save Package"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddHolidayModal;


// import React, { useState, useEffect } from "react";
// import { Form, Input, Button, Select, SelectItem, Textarea } from "@nextui-org/react";
// import axios from "../../../../utils/Api";
// import { uploadToCloudinary } from "../../../../utils/cloudinaryUtils";
// import { useSelector } from "react-redux";
// import { toast } from 'sonner';

// const AddHolidayModal = ({ isOpen, onClose }) => {
//   const [resorts, setResorts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [dayPlans, setDayPlans] = useState([
//     { day: 1, place_name: "", activity: "", place_photo: "", resort: "" },
//   ]);
//   const [packageIncluded, setPackageIncluded] = useState([""]);
//   const [packageExcluded, setPackageExcluded] = useState([""]);
//   const [errorMessage, setErrorMessage] = useState("");
//   const { token } = useSelector((state) => state.auth);

//   useEffect(() => {
//     setLoading(true);
//     const fetchData = async () => {
//       try {
//         const [resortsData, categoriesData] = await Promise.all([
//           axios.get("/api/resorts/"),
//           axios.get("/api/package-categories/"),
//         ]);
//         setResorts(resortsData.data || []);
//         setCategories(categoriesData.data || []);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         setErrorMessage("Failed to fetch resorts or categories. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const handleAddDay = () => {
//     setDayPlans([
//       ...dayPlans,
//       {
//         day: dayPlans.length + 1,
//         place_name: "",
//         activity: "",
//         place_photo: "",
//         resort: "",
//       },
//     ]);
//   };

//   const handleDayChange = (index, field, value) => {
//     const updatedDays = [...dayPlans];
//     updatedDays[index][field] = value;
//     setDayPlans(updatedDays);
//   };

//   const handleImageUpload = (index, files) => {
//     if (!files || files.length === 0) return;
//     const file = files[0];
//     const updatedDays = [...dayPlans];
//     updatedDays[index].place_photo = file;
//     setDayPlans(updatedDays);
//   };

//   const handleIncludedChange = (index, value) => {
//     const updatedIncluded = [...packageIncluded];
//     updatedIncluded[index] = value;
//     setPackageIncluded(updatedIncluded);
//   };

//   const handleExcludedChange = (index, value) => {
//     const updatedExcluded = [...packageExcluded];
//     updatedExcluded[index] = value;
//     setPackageExcluded(updatedExcluded);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const formData = new FormData(e.currentTarget);
//     setLoading(true);

//     try {
//       const updatedDays = await Promise.all(
//         dayPlans.map(async (dayPlan) => {
//           if (dayPlan.place_photo instanceof File) {
//             const uploadedImage = await uploadToCloudinary(dayPlan.place_photo);
//             return {
//               ...dayPlan,
//               place_photo: uploadedImage.secure_url.match(/\/([^\/]+)\.jpg/)[1]
//             };
//           }
//           return dayPlan;
//         })
//       );

//       const packageData = {
//         name: formData.get("name"),
//         start: formData.get("start"),
//         end: formData.get("end"),
//         days: dayPlans.length,
//         base_price: formData.get("base_price"),
//         adult_price: formData.get("adult_price"),
//         child_price: formData.get("child_price"),
//         category: formData.get("category"),
//         is_holiday: true,
//         valid: true,
//         resort: formData.get("resort"),
//         note: formData.get("note") || "",
//         package_included: packageIncluded.filter(item => item.trim() !== "").join(", "),
//         package_excluded: packageExcluded.filter(item => item.trim() !== "").join(", "),
//         days_package: updatedDays
//     };
    


//       await axios.post("/api/admin-holiday/", packageData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       toast.success('Package added successfully!');
//       onClose();
//     } catch (error) {
//       console.error("Error adding package:", error);
//       toast.error('Failed to create package');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-[#1f2e358e] bg-opacity-75 z-50">
//       <div className="bg-[#F6F6F6] rounded-lg shadow-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//         <h2 className="text-3xl font-bold text-center text-[#287094] mb-6">
//           Add New Package
//         </h2>
        
//         <Form className="space-y-6" onSubmit={handleSubmit}>
//           <Input
//             isRequired
//             label="Package Name"
//             name="name"
//             placeholder="Enter package name"
//             labelPlacement="outside"
//           />

//           <div className="flex gap-4">
//             <Input
//               isRequired
//               type="number"
//               label="Base Price"
//               name="base_price"
//               placeholder="Enter base price"
//               labelPlacement="outside"
//               min={0}
//             />
//             <Input
//               isRequired
//               type="number"
//               label="Adult Price"
//               name="adult_price"
//               placeholder="Enter adult price"
//               labelPlacement="outside"
//               min={0}
//             />
//             <Input
//               isRequired
//               type="number"
//               label="Child Price"
//               name="child_price"
//               placeholder="Enter child price"
//               labelPlacement="outside"
//               min={0}
//             />
//           </div>

//           <div className="flex gap-4">
//             <Input
//               isRequired
//               type="date"
//               label="Start Date"
//               name="start"
//               labelPlacement="outside"
//             />
//             <Input
//               isRequired
//               type="date"
//               label="End Date"
//               name="end"
//               labelPlacement="outside"
//             />
//           </div>

//           <Select
//             isRequired
//             label="Category"
//             name="category"
//             labelPlacement="outside"
//           >
//             {categories.map((category) => (
//               <SelectItem key={category.id} value={category.id}>
//                 {category.name}
//               </SelectItem>
//             ))}
//           </Select>

//           {/* Package Included Section */}
//           <div className="space-y-4">
//             <label className="block text-lg font-medium">Package Included:</label>
//             {packageIncluded.map((item, index) => (
//               <Input
//                 key={index}
//                 value={item}
//                 onChange={(e) => handleIncludedChange(index, e.target.value)}
//                 placeholder={`Include point ${index + 1}`}
//               />
//             ))}
//             <Button
//               color="primary"
//               onClick={() => setPackageIncluded([...packageIncluded, ""])}
//             >
//               Add Another Point
//             </Button>
//           </div>

//           {/* Package Excluded Section */}
//           <div className="space-y-4">
//             <label className="block text-lg font-medium">Package Excluded:</label>
//             {packageExcluded.map((item, index) => (
//               <Input
//                 key={index}
//                 value={item}
//                 onChange={(e) => handleExcludedChange(index, e.target.value)}
//                 placeholder={`Exclude point ${index + 1}`}
//               />
//             ))}
//             <Button
//               color="primary"
//               onClick={() => setPackageExcluded([...packageExcluded, ""])}
//             >
//               Add Another Point
//             </Button>
//           </div>

//           <Textarea
//             label="Additional Notes"
//             name="note"
//             placeholder="Enter any additional notes here"
//             labelPlacement="outside"
//           />

//           {/* Day Plans Section */}
//           <div className="space-y-6">
//             <h3 className="text-2xl font-semibold">Day Plans</h3>
//             {dayPlans.map((dayPlan, index) => (
//               <div key={index} className="space-y-4 p-4 border rounded-lg">
//                 <Input
//                   label={`Day ${dayPlan.day} - Place Name`}
//                   value={dayPlan.place_name}
//                   onChange={(e) => handleDayChange(index, "place_name", e.target.value)}
//                   placeholder="Enter place name"
//                   labelPlacement="outside"
//                 />
                
//                 <Input
//                   label="Activity"
//                   value={dayPlan.activity}
//                   onChange={(e) => handleDayChange(index, "activity", e.target.value)}
//                   placeholder="Enter activity"
//                   labelPlacement="outside"
//                 />

//                 <Select
//                   label="Resort"
//                   value={dayPlan.resort}
//                   onChange={(e) => handleDayChange(index, "resort", e.target.value)}
//                   labelPlacement="outside"
//                 >
//                   {resorts.map((resort) => (
//                     <SelectItem key={resort.id} value={resort.id}>
//                       {resort.name}
//                     </SelectItem>
//                   ))}
//                 </Select>

//                 <Input
//                   type="file"
//                   label="Place Photo"
//                   onChange={(e) => handleImageUpload(index, e.target.files)}
//                   accept="image/*"
//                   labelPlacement="outside"
//                 />
//               </div>
//             ))}
//             <Button color="primary" onClick={handleAddDay}>
//               Add Day Plan
//             </Button>
//           </div>
 
//           <div className="w-full flex justify-between gap-4">
//             <Button color="danger" className="w-[15%]" onClick={() => setTimeout(onClose, 300)} fullWidth>
//               Cancel
//             </Button>
//             <Button color="primary" className="w-[15%] text-end" type="submit" fullWidth disabled={loading}>
//               {loading ? "Saving..." : "Save Package"}
//             </Button>
//           </div>
//         </Form>
//       </div>
//     </div>
//   );
// };

// export default AddHolidayModal;    