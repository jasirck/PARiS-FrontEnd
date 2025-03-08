
import React, { useState, useEffect } from "react";
import axios from "../../../../utils/Api";
import { uploadToCloudinary } from "../../../../utils/cloudinaryUtils";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import {
  Input,
  Select,
  SelectItem,
  Button,
  Checkbox,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { toast } from "sonner";
import {setHoliday,setsliceHolidays} from "../../../Toolkit/Slice/apiHomeSlice";


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

const AddHolidayModal = ({ isOpen, onClose }) => {
  const [resorts, setResorts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dayPlans, setDayPlans] = useState([
    { day: 1, place_name: "", activity: "", place_photo: "", resort: "" },
  ]);
  const [packageIncluded, setPackageIncluded] = useState([]);
  const [packageExcluded, setPackageExcluded] = useState([]);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch(); 

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
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
      note: "",
      full_refund: 14,
      half_refund: 7,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resortsData, categoriesData] = await Promise.all([
          axios.get("/api/resorts/"),
          axios.get("/api/package-categories/"),
        ]);
        setResorts(resortsData.data || []);
        setCategories(categoriesData.data || []);
      } catch (error) {
        toast.error("Failed to fetch data");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

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
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("start", data.start.toISOString().split("T")[0]);
      formData.append("end", data.end.toISOString().split("T")[0]);
      formData.append("days", dayPlans.length);
      formData.append("base_price", data.base_price);
      formData.append("adult_price", data.adult_price);
      formData.append("child_price", data.child_price);
      formData.append("category", data.category);
      formData.append("is_holiday", true);
      formData.append("valid", true);
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
        dayPlans.map(async (dayPlan) => {
          if (dayPlan.place_photo instanceof File) {
            const uploadedImage = await uploadToCloudinary(dayPlan.place_photo);
            const imageUrl = uploadedImage.secure_url;
            const imageId = imageUrl.match(/\/([^\/]+)\.jpg/)[1];
            dayPlan.place_photo = imageId;
          }
          return dayPlan;
        })
      );

      formData.append("days_holiday", JSON.stringify(updatedDays));

      await axios.post("/api/admin-holidays/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(formData,'form data');
      
      dispatch(setHoliday(null));
      dispatch(setsliceHolidays(null));
      toast.success("Holiday added successfully!");
      reset();
      onClose();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to add package";
      toast.error(errorMessage);
      console.error("Error submitting form", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent>
        <div className="mt-96 pt-40">
          <ModalHeader className="text-3xl font-extrabold text-[#287094]">
            Add New Package
          </ModalHeader>
          <ModalBody>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Package Name"
                isRequired
                {...register("name")}
                errorMessage={errors.name?.message}
                placeholder="Enter package name"
              />
              <div className="flex space-x-6">
                <Input
                  label="Base Price"
                  isRequired
                  type="number"
                  {...register("base_price")}
                  errorMessage={errors.base_price?.message}
                  placeholder="Enter base price"
                />
                <Input
                  label="Adult Price"
                  isRequired
                  type="number"
                  {...register("adult_price")}
                  errorMessage={errors.adult_price?.message}
                  placeholder="Enter adult price"
                />
                <Input
                  label="Child Price"
                  isRequired
                  type="number"
                  {...register("child_price")}
                  errorMessage={errors.child_price?.message}
                  placeholder="Enter child price"
                />
              </div>
              <div className="flex space-x-6">
                <Input
                  label="Full Refund (Days)"
                  isRequired
                  type="number"
                  {...register("full_refund")}
                  errorMessage={errors.full_refund?.message}
                  placeholder="Enter full refund days"
                />
                <Input
                  label="Half Refund (Days)"
                  isRequired
                  type="number"
                  {...register("half_refund")}
                  errorMessage={errors.half_refund?.message}
                  placeholder="Enter half refund days"
                />
              </div>
              <div className="flex space-x-6">
                <Input
                  label="Start Date"
                  isRequired
                  type="date"
                  {...register("start")}
                  errorMessage={errors.start?.message}
                />
                <Input
                  label="End Date"
                  isRequired
                  type="date"
                  {...register("end")}
                  errorMessage={errors.end?.message}
                />
              </div>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Category"
                    isRequired
                    {...field}
                    errorMessage={errors.category?.message}
                  >
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
              <Input
                label="Additional Notes"
                {...register("note")}
                placeholder="Enter any additional notes"
              />
              <div>
                <label className="block text-lg font-medium text-[#023246] mb-2">
                  Package Included:
                </label>
                {packageIncluded.map((item, index) => (
                  <Input
                    key={index}
                    value={item}
                    onChange={(e) => handleIncludedChange(index, e)}
                    placeholder={`Include point ${index + 1}`}
                    className="mb-2"
                  />
                ))}
                <Button
                  type="button"
                  onClick={handleAddToIncluded}
                  className="mt-2"
                >
                  Add Another Point
                </Button>
              </div>
              <div>
                <label className="block text-lg font-medium text-[#023246] mb-2">
                  Package Excluded:
                </label>
                {packageExcluded.map((item, index) => (
                  <Input
                    key={index}
                    value={item}
                    onChange={(e) => handleExcludedChange(index, e)}
                    placeholder={`Exclude point ${index + 1}`}
                    className="mb-2"
                  />
                ))}
                <Button
                  type="button"
                  onClick={handleAddToExcluded}
                  className="mt-2"
                >
                  Add Another Point
                </Button>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-[#023246] mb-4">
                  Day Plans
                </h3>
                {dayPlans.map((dayPlan, index) => (
                  <div key={index} className="space-y-4 mb-6">
                    <Input
                      label={`Day ${dayPlan.day} - Place Name`}
                      value={dayPlan.place_name}
                      onChange={(e) => handleDayChange(index, e)}
                      name="place_name"
                      placeholder="Enter place name"
                    />
                    <Input
                      label="Activity"
                      value={dayPlan.activity}
                      onChange={(e) => handleDayChange(index, e)}
                      name="activity"
                      placeholder="Enter activity"
                    />
                    <Select
                      label="Resort"
                      value={dayPlan.resort}
                      onChange={(e) => handleDayChange(index, e)}
                      name="resort"
                    >
                      {resorts.map((resort) => (
                        <SelectItem key={resort.id} value={resort.id}>
                          {resort.name}
                        </SelectItem>
                      ))}
                    </Select>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(index, e.target.files)}
                      label="Place Photo"
                    />
                  </div>
                ))}
                <Button type="button" onClick={handleAddDay} className="mt-4">
                  Add Day Plan
                </Button>
              </div>
              <ModalFooter>
                <Button type="button" onClick={onClose} color="danger">
                  Cancel
                </Button>
                <Button type="submit" color="primary">
                  {loading ? "Saving..." : "Save Package"}
                </Button>
              </ModalFooter>
            </form>
          </ModalBody>
          </div>
      </ModalContent>
    </Modal>
  );
};

export default AddHolidayModal;