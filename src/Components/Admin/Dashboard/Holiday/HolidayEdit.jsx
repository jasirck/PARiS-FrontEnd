import React, { useState, useEffect } from "react";
import axios from "../../../../utils/Api";
import { uploadToCloudinary } from "../../../../utils/cloudinaryUtils";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSelector } from "react-redux";
import { Button } from "@nextui-org/react";


const HolidayEditModalx = ({ isOpen, onClose, HolidayId }) => {
  const [resorts, setResorts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dayPlans, setDayPlans] = useState([]);
  const [HolidayIncluded, setHolidayIncluded] = useState([]);
  const [HolidayExcluded, setHolidayExcluded] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [imagePreviews, setImagePreviews] = useState({});
  const { token } = useSelector((state) => state.auth);

  const schema = yup.object().shape({
    name: yup.string().required("Holiday name is required."),
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
    },
  });

  useEffect(() => {
    if (!isOpen || !HolidayId) return;

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
          `/api/admin/admin-holidays/${HolidayId}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const HolidayData = response.data;
        const daysHoliday = HolidayData.days || []; 
        console.log(HolidayData.holiday);
        console.log(daysHoliday);

        setDayPlans(daysHoliday);
        setHolidayIncluded(
          JSON.parse(HolidayData.holiday.package_included || "[]")
        ); // Parse the JSON string
        setHolidayExcluded(
          JSON.parse(HolidayData.holiday.package_excluded || "[]")
        ); // Parse the JSON string

        // Set form values
        setValue("name", HolidayData.holiday.name);
        setValue(
          "start",
          HolidayData.holiday.start
            ? new Date(HolidayData.holiday.start).toISOString().split("T")[0]
            : ""
        );
        setValue(
          "end",
          HolidayData.holiday.end
            ? new Date(HolidayData.holiday.end).toISOString().split("T")[0]
            : ""
        );
        setValue("base_price", HolidayData.holiday.base_price);
        setValue("adult_price", HolidayData.holiday.adult_price);
        setValue("child_price", HolidayData.holiday.child_price);
        setValue("category", HolidayData.holiday.category);
        setValue("resort", HolidayData.holiday.resort || ""); // Handle empty resort
        setValue("note", HolidayData.holiday.note || "");

        // Initialize image previews only if days_Holiday is an array
        const initialPreviews = {};
        daysHoliday.forEach((dayPlan, index) => {
          initialPreviews[index] = dayPlan.place_photo_url || "";
        });
        setImagePreviews(initialPreviews);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage("Failed to fetch Holiday details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, HolidayId, token, setValue]);

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
    setHolidayIncluded([...HolidayIncluded, ""]); // Add empty string as a placeholder
  };

  const handleAddToExcluded = () => {
    setHolidayExcluded([...HolidayExcluded, ""]); // Add empty string as a placeholder
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
    const updatedIncluded = [...HolidayIncluded];
    updatedIncluded[index] = e.target.value;
    setHolidayIncluded(updatedIncluded);
  };

  const handleExcludedChange = (index, e) => {
    const updatedExcluded = [...HolidayExcluded];
    updatedExcluded[index] = e.target.value;
    setHolidayExcluded(updatedExcluded);
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
    formData.append("category", data.category);
    formData.append("resort", data.resort);
    formData.append("note", data.note || "");
    formData.append(
      "package_included",
      JSON.stringify(HolidayIncluded.filter((item) => item.trim() !== ""))
    );
    formData.append(
      "package_excluded",
      JSON.stringify(HolidayExcluded.filter((item) => item.trim() !== ""))
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

    formData.append("days_Holiday", JSON.stringify(updatedDays));

    try {
      setLoading(true);
      await axios.put(`/api/admin/admin-holidays/${HolidayId}/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Holiday updated successfully!");
      onClose();
    } catch (error) {
      console.error(
        "Error updating Holiday:",
        error.response ? error.response.data : error.message
      );
      alert("Failed to update Holiday. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    reset();
    setDayPlans([]);
    setHolidayIncluded([]);
    setHolidayExcluded([]);
    setImagePreviews({});
    setErrorMessage("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#1f2e358e] bg-opacity-75 z-50">
      <div className="bg-[#F6F6F6] rounded-lg shadow-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold text-center text-[#287094] mb-6">
          Edit Holiday
        </h2>
        {loading ? (
          <div>Loading Holiday details...</div>
        ) : errorMessage ? (
          <div className="text-red-500">{errorMessage}</div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-lg font-medium text-[#023246]">
                  Holiday Name:
                </label>
                <input
                  type="text"
                  {...register("name")}
                  //   value={HolidayData}
                  className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
                  placeholder="Enter Holiday name"
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
                Holiday Included:
              </label>
              <div className="space-y-2">
                {HolidayIncluded.map((item, index) => (
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
                Holiday Excluded:
              </label>
              <div className="space-y-2">
                {HolidayExcluded.map((item, index) => (
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

export default HolidayEditModalx;














// import React, { useState, useEffect } from "react";
// import axios from "../../../../utils/Api";
// import { uploadToCloudinary } from "../../../../utils/cloudinaryUtils";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import { useSelector } from "react-redux";
// import { Button } from "@nextui-org/react";


// const HolidayEditModal = ({ isOpen, onClose, HolidayId }) => {
//   const [resorts, setResorts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [dayPlans, setDayPlans] = useState([]);
//   const [HolidayIncluded, setHolidayIncluded] = useState([]);
//   const [HolidayExcluded, setHolidayExcluded] = useState([]);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [imagePreviews, setImagePreviews] = useState({});
//   const { token } = useSelector((state) => state.auth);

//   const schema = yup.object().shape({
//     name: yup.string().required("Holiday name is required."),
//     start: yup
//       .date()
//       .required("Start date is required.")
//       .typeError("Invalid date format."),
//     end: yup
//       .date()
//       .required("End date is required.")
//       .typeError("Invalid date format.")
//       .min(yup.ref("start"), "End date must be after start date."),
//     base_price: yup.number().min(0, "Cannot be negative").required("Required"),
//     adult_price: yup.number().min(0, "Cannot be negative").required("Required"),
//     child_price: yup.number().min(0, "Cannot be negative").required("Required"),
//     category: yup.string().required("Category is required."),
//     note: yup.string(),
//   });

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     setValue,
//     reset,
//   } = useForm({
//     resolver: yupResolver(schema),
//     defaultValues: {
//       name: "",
//       start: "",
//       end: "",
//       base_price: "",
//       adult_price: "",
//       child_price: "",
//       category: "",
//       valid: true,
//       resort: "",
//       note: "",
//     },
//   });

//   useEffect(() => {
//     if (!isOpen || !HolidayId) return;

//     const fetchcategories = async () => {
//       try {
//         const [resortsData, categoriesData] = await Promise.all([
//           axios.get("/api/resorts/"),
//           axios.get("/api/Holiday-categories/"),
//         ]);
//         setResorts(resortsData.data || []);
//         setCategories(categoriesData.data || []);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         setErrorMessage(
//           "Failed to fetch resorts or categories. Please try again."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchcategories();

//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get(
//           `/api/admin/admin-holidays/${HolidayId}/`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//         const HolidayData = response.data;
//         const daysHoliday = HolidayData.days || []; // Ensure it's an array
//         console.log(HolidayData.Holiday);
//         console.log(daysHoliday);

//         setDayPlans(daysHoliday);
//         setHolidayIncluded(
//           JSON.parse(HolidayData.Holiday.Holiday_included || "[]")
//         ); // Parse the JSON string
//         setHolidayExcluded(
//           JSON.parse(HolidayData.Holiday.Holiday_excluded || "[]")
//         ); // Parse the JSON string

//         // Set form values
//         setValue("name", HolidayData.Holiday.name);
//         setValue(
//           "start",
//           HolidayData.Holiday.start
//             ? new Date(HolidayData.Holiday.start).toISOString().split("T")[0]
//             : ""
//         );
//         setValue(
//           "end",
//           HolidayData.Holiday.end
//             ? new Date(HolidayData.Holiday.end).toISOString().split("T")[0]
//             : ""
//         );
//         setValue("base_price", HolidayData.Holiday.base_price);
//         setValue("adult_price", HolidayData.Holiday.adult_price);
//         setValue("child_price", HolidayData.Holiday.child_price);
//         setValue("category", HolidayData.Holiday.category);
//         setValue("resort", HolidayData.Holiday.resort || ""); // Handle empty resort
//         setValue("note", HolidayData.Holiday.note || "");

//         // Initialize image previews only if days_Holiday is an array
//         const initialPreviews = {};
//         daysHoliday.forEach((dayPlan, index) => {
//           initialPreviews[index] = dayPlan.place_photo_url || "";
//         });
//         setImagePreviews(initialPreviews);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         setErrorMessage("Failed to fetch Holiday details. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [isOpen, HolidayId, token, setValue]);

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

//   const handleDayChange = (index, e) => {
//     const { name, value } = e.target;
//     const updatedDays = [...dayPlans];
//     updatedDays[index][name] = value;
//     setDayPlans(updatedDays);
//   };

//   const handleAddToIncluded = () => {
//     setHolidayIncluded([...HolidayIncluded, ""]); // Add empty string as a placeholder
//   };

//   const handleAddToExcluded = () => {
//     setHolidayExcluded([...HolidayExcluded, ""]); // Add empty string as a placeholder
//   };

//   const handleImageUpload = (index, files) => {
//     if (!files || files.length === 0) return;

//     const file = files[0];
//     const updatedDays = [...dayPlans];
//     updatedDays[index].place_photo = file;
//     setDayPlans(updatedDays);

//     // Generate preview
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setImagePreviews((prev) => ({
//         ...prev,
//         [index]: reader.result,
//       }));
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleIncludedChange = (index, e) => {
//     const updatedIncluded = [...HolidayIncluded];
//     updatedIncluded[index] = e.target.value;
//     setHolidayIncluded(updatedIncluded);
//   };

//   const handleExcludedChange = (index, e) => {
//     const updatedExcluded = [...HolidayExcluded];
//     updatedExcluded[index] = e.target.value;
//     setHolidayExcluded(updatedExcluded);
//   };

//   const onSubmit = async (data) => {
//     const formData = new FormData();
//     formData.append("name", data.name);
//     formData.append("start", new Date(data.start).toISOString().split("T")[0]);
//     formData.append("end", new Date(data.end).toISOString().split("T")[0]);
//     formData.append("days", dayPlans.length);
//     formData.append("base_price", data.base_price);
//     formData.append("adult_price", data.adult_price);
//     formData.append("child_price", data.child_price);
//     formData.append("category", data.category);
//     formData.append("resort", data.resort);
//     formData.append("note", data.note || "");
//     formData.append(
//       "Holiday_included",
//       JSON.stringify(HolidayIncluded.filter((item) => item.trim() !== ""))
//     );
//     formData.append(
//       "Holiday_excluded",
//       JSON.stringify(HolidayExcluded.filter((item) => item.trim() !== ""))
//     );

//     const updatedDays = await Promise.all(
//       dayPlans.map(async (dayPlan, index) => {
//         if (dayPlan.place_photo instanceof File) {
//           try {
//             // Handle image upload logic
//             const uploadedImage = await uploadToCloudinary(dayPlan.place_photo);
//             const imageUrl = uploadedImage.secure_url;
//             const imageId = imageUrl.match(/\/([^\/]+)\.jpg/)[1]; // Extract image ID
//             dayPlan.place_photo = imageId;
//           } catch (error) {
//             console.error("Error uploading image:", error.message);
//             alert(`Failed to upload image for Day ${dayPlan.day}.`);
//           }
//         }
//         return dayPlan;
//       })
//     );

//     formData.append("days_Holiday", JSON.stringify(updatedDays));

//     try {
//       setLoading(true);
//       await axios.put(`/api/admin/admin-holiday/${HolidayId}/`, formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });
//       console.log("Holiday updated successfully!");
//       onClose();
//     } catch (error) {
//       console.error(
//         "Error updating Holiday:",
//         error.response ? error.response.data : error.message
//       );
//       alert("Failed to update Holiday. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleClose = () => {
//     onClose();
//     reset();
//     setDayPlans([]);
//     setHolidayIncluded([]);
//     setHolidayExcluded([]);
//     setImagePreviews({});
//     setErrorMessage("");
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-[#1f2e358e] bg-opacity-75 z-50">
//       <div className="bg-[#F6F6F6] rounded-lg shadow-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//         <h2 className="text-3xl font-bold text-center text-[#287094] mb-6">
//           Edit Holiday
//         </h2>
//         {loading ? (
//           <div>Loading Holiday details...</div>
//         ) : errorMessage ? (
//           <div className="text-red-500">{errorMessage}</div>
//         ) : (
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-lg font-medium text-[#023246]">
//                   Holiday Name:
//                 </label>
//                 <input
//                   type="text"
//                   {...register("name")}
//                   //   value={HolidayData}
//                   className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
//                   placeholder="Enter Holiday name"
//                 />
//                 {errors.name && (
//                   <p className="text-red-500 text-sm">{errors.name.message}</p>
//                 )}
//               </div>

//               <div className="flex space-x-6">
//                 <div className="w-1/3">
//                   <label className="block text-lg font-medium text-[#023246]">
//                     Base Price:
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     {...register("base_price")}
//                     className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
//                     placeholder="Enter base price"
//                   />
//                   {errors.base_price && (
//                     <p className="text-red-500 text-sm">
//                       {errors.base_price.message}
//                     </p>
//                   )}
//                 </div>

//                 <div className="w-1/3">
//                   <label className="block text-lg font-medium text-[#023246]">
//                     Adult Price:
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     {...register("adult_price")}
//                     className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
//                     placeholder="Enter adult price"
//                   />
//                   {errors.adult_price && (
//                     <p className="text-red-500 text-sm">
//                       {errors.adult_price.message}
//                     </p>
//                   )}
//                 </div>

//                 <div className="w-1/3">
//                   <label className="block text-lg font-medium text-[#023246]">
//                     Child Price:
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     {...register("child_price")}
//                     className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
//                     placeholder="Enter child price"
//                   />
//                   {errors.child_price && (
//                     <p className="text-red-500 text-sm">
//                       {errors.child_price.message}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <div className="flex space-x-6">
//                 <div className="w-1/2">
//                   <label className="block text-lg font-medium text-[#023246]">
//                     Start Date:
//                   </label>
//                   <input
//                     type="date"
//                     {...register("start")}
//                     className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
//                   />
//                   {errors.start && (
//                     <p className="text-red-500 text-sm">
//                       {errors.start.message}
//                     </p>
//                   )}
//                 </div>

//                 <div className="w-1/2">
//                   <label className="block text-lg font-medium text-[#023246]">
//                     End Date:
//                   </label>
//                   <input
//                     type="date"
//                     {...register("end")}
//                     className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
//                   />
//                   {errors.end && (
//                     <p className="text-red-500 text-sm">{errors.end.message}</p>
//                   )}
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-lg font-medium text-[#023246]">
//                   Category:
//                 </label>
//                 <select
//                   {...register("category")}
//                   className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
//                 >
//                   <option value="">Select Category</option>
//                   {categories.map((category) => (
//                     <option key={category.id} value={category.id}>
//                       {category.name}
//                     </option>
//                   ))}
//                 </select>
//                 {errors.category && (
//                   <p className="text-red-500 text-sm">
//                     {errors.category.message}
//                   </p>
//                 )}
//               </div>
//             </div>

//             <div>
//               <label className="block text-lg font-medium text-[#023246]">
//                 Holiday Included:
//               </label>
//               <div className="space-y-2">
//                 {HolidayIncluded.map((item, index) => (
//                   <input
//                     key={index}
//                     type="text"
//                     value={item}
//                     onChange={(e) => handleIncludedChange(index, e)}
//                     className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
//                     placeholder={`Include point ${index + 1}`}
//                   />
//                 ))}
//               </div>
//               <Button
//                 type="Button"
//                 onClick={() => setTimeout(handleAddToIncluded, 300)}
//                 className="mt-2 w-[20%] bg-[#287094] text-white p-3 rounded-lg hover:bg-[#023246]"
//               >
//                 Add Another Point
//               </Button>
//             </div>

//             <div>
//               <label className="block text-lg font-medium text-[#023246]">
//                 Holiday Excluded:
//               </label>
//               <div className="space-y-2">
//                 {HolidayExcluded.map((item, index) => (
//                   <input
//                     key={index}
//                     type="text"
//                     value={item}
//                     onChange={(e) => handleExcludedChange(index, e)}
//                     className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
//                     placeholder={`Exclude point ${index + 1}`}
//                   />
//                 ))}
//               </div>
//               <Button
//                 type="Button"
//                 onClick={() => setTimeout(handleAddToExcluded, 300)}
//                 className="mt-2 w-[20%] bg-[#287094] text-white p-3 rounded-lg hover:bg-[#023246]"
//               >
//                 Add Another Point
//               </Button>
//             </div>

//             <div>
//               <label className="block text-lg font-medium text-[#023246]">
//                 Additional Notes:
//               </label>
//               <textarea
//                 {...register("note")}
//                 className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094] h-40"
//                 placeholder="Enter any additional notes here"
//               />
//             </div>

//             <div>
//               <h3 className="text-2xl font-semibold text-[#023246] mb-4">
//                 Day Plans
//               </h3>
//               {dayPlans.map((dayPlan, index) => (
//                 <div key={index} className="space-y-4 mb-6">
//                   <div>
//                     <label className="block text-lg font-medium text-[#023246]">
//                       Day {dayPlan.day} - Place Name:
//                     </label>
//                     <input
//                       type="text"
//                       name="place_name"
//                       value={dayPlan.place_name}
//                       onChange={(e) => handleDayChange(index, e)}
//                       className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
//                       placeholder="Enter place name"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-lg font-medium text-[#023246]">
//                       Activity:
//                     </label>
//                     <input
//                       type="text"
//                       name="activity"
//                       value={dayPlan.activity}
//                       onChange={(e) => handleDayChange(index, e)}
//                       className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
//                       placeholder="Enter activity"
//                     />
//                   </div>

//                   <div className="flex space-x-4">
//                     <div className="w-1/2">
//                       <label className="block text-lg font-medium text-[#023246]">
//                         Resort:
//                       </label>
//                       {loading ? (
//                         <p>Loading resorts...</p>
//                       ) : (
//                         <select
//                           name="resort"
//                           value={dayPlan.resort}
//                           onChange={(e) => handleDayChange(index, e)}
//                           className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
//                         >
//                           <option value="">Select Resort</option>
//                           {resorts.map((resort) => (
//                             <option key={resort.id} value={resort.id}>
//                               {resort.name}
//                             </option>
//                           ))}
//                         </select>
//                       )}
//                     </div>

//                     <div className="w-1/2">
//                       <label className="block text-lg font-medium text-[#023246]">
//                         Place Photo:
//                       </label>

//                       {!imagePreviews[index] && (
//                         <img
//                           src={`https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${dayPlan.place_photo}`}
//                           alt={`Day ${dayPlan.day} Photo`}
//                           className="mt-2 w-38 h-32 object-cover rounded-lg"
//                         />
//                       )}
//                       <input
//                         type="file"
//                         accept="image/*"
//                         onChange={(e) =>
//                           handleImageUpload(index, e.target.files)
//                         }
//                       />
//                       {imagePreviews[index] && (
//                         <img
//                           // src={`https://res.cloudinary.com/dkqfxe7qy/image/upload/v1733819010/${dayPlan.place_photo}`}
//                           src={imagePreviews[index]}
//                           alt={`Day ${dayPlan.day} Photo`}
//                           className="mt-2 w-32 h-32 object-cover rounded-lg"
//                         />
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//               <Button
//                 type="Button"
//                 onClick={() => setTimeout(handleAddDay, 300)}
//                 className="mt-4 w-[20%] bg-[#287094] text-white p-3 rounded-lg hover:bg-[#023246]"
//               >
//                 Add Day Plan
//               </Button>
//             </div>

//             <div className="flex justify-between">
//               <Button
//                 type="Button"
//                 onClick={() => setTimeout(handleClose, 300)}
//                 className="w-full sm:w-auto bg-[#023246] text-white p-3 rounded-lg mt-6 sm:mr-4 hover:bg-[#287094]"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="submit"
//                 className="w-full sm:w-auto bg-[#287094] text-white p-3 rounded-lg mt-6 sm:ml-4 hover:bg-[#023246]"
//                 disabled={loading}
//               >
//                 {loading ? "Saving..." : "Save Changes"}
//               </Button>
//             </div>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// };

// export default HolidayEditModal;
