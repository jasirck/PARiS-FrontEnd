import React, { useState, useEffect } from "react";
import axios from "../../../../utils/Api";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../../../../utils/cloudinaryUtils";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSelector } from "react-redux";
import {
  Form,
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

const ResortEdit = ({ resortId, closeModal }) => {
  const [resortData, setResortData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]); // Image previews
  const [imageFiles, setImageFiles] = useState([]); // New files for upload
  const [deletedImageIds, setDeletedImageIds] = useState([]); // Old images to delete
  const [loading, setLoading] = useState(false);
  const { token } = useSelector((state) => state.auth);

  const schema = yup.object().shape({
    name: yup.string().required("Resort name is required"),
    location: yup.string().required("Location is required"),
    base_price: yup
      .number()
      .typeError("Base price must be a number")
      .positive("Base price must be positive")
      .required("Base price is required"),
    adult_price: yup
      .number()
      .typeError("Adult price must be a number")
      .positive("Adult price must be positive")
      .required("Adult price is required"),
    child_price: yup
      .number()
      .typeError("Child price must be a number")
      .positive("Child price must be positive")
      .required("Child price is required"),
    category: yup.string().required("Category is required"),
    policy: yup.string(),
    images: yup.array().min(1, "At least one image is required"),
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      location: "",
      base_price: "",
      adult_price: "",
      child_price: "",
      category: "",
      policy: "",
      images: [],
    },
  });

  // Fetch Resort and Categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resortResponse, categoriesResponse] = await Promise.all([
          axios.get(`/api/admin-resorts/${resortId}/`),
          axios.get("/api/resort-categories/"),
        ]);

        setResortData(resortResponse.data);
        setCategories(categoriesResponse.data);
        console.log(resortResponse.data, categoriesResponse.data);

        setImages(resortResponse.data.images.map((img) => img.image));
        reset({
          ...resortResponse.data,
          category: resortResponse.data.category.toString(),
        });
      } catch (error) {
        toast.error("Failed to load resort data.");
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resortId, reset]);

  const handleImageUpload = (files) => {
    const newFiles = Array.from(files);
    const validFiles = newFiles.filter((file) => file.type === "image/jpeg");

    if (validFiles.length !== newFiles.length) {
      toast.error("Only JPEG files are allowed");
    }

    const newImageFiles = [...imageFiles, ...validFiles];
    const newImagePreviews = newImageFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setImageFiles(newImageFiles);
    setImages((prev) => [...prev, ...newImagePreviews]);
    setValue("images", [...images, ...newImagePreviews]);
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...images];
    const deletedImageId = resortData.images[index]?.id;

    updatedImages.splice(index, 1);
    setImages(updatedImages);

    if (deletedImageId) {
      setDeletedImageIds((prev) => [...prev, deletedImageId]);
    }

    setValue("images", updatedImages);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Delete old images from Cloudinary
      for (const id of deletedImageIds) {
        await deleteFromCloudinary(id);
      }

      // Upload new images to Cloudinary
      const uploadedImages = await Promise.all(
        imageFiles.map(async (file) => {
          const uploadedImage = await uploadToCloudinary(file);
          return uploadedImage.secure_url.match(/\/([^\/]+)\.jpg/)[1];
        })
      );

      // Prepare payload
      const updatedImages = [
        ...resortData.images
          .filter((img, idx) => !deletedImageIds.includes(img.id))
          .map((img) => img.image),
        ...uploadedImages,
      ];

      const payload = {
        ...data,
        images: updatedImages.join(","),
      };

      // Submit update to backend
      await axios.put(`/api/admin-resorts/${resortId}/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Resort updated successfully!");
      closeModal();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update resort";
      toast.error(errorMessage);
      console.error("Error updating resort:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!resortData) return <p>Loading...</p>;

  return (
    <Modal
      isOpen={resortId}
      size="3xl"
      onOpenChange={(open) => !open && closeModal}
    >
      <ModalContent>
        <>
          <ModalHeader className="text-3xl font-extrabold text-[#287094]">
            Edit Resort
          </ModalHeader>
          {/* <div className="fixed inset-0 flex items-center justify-center bg-[#1f2e358e] bg-opacity-75 z-50">
       <div className="bg-[#F6F6F6] rounded-lg shadow-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-extrabold text-center text-[#287094] mb-6">
          Edit Resort
        </h2> */}
          <ModalBody>
            <Form
              className="w-full flex flex-col space-y-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              <Input
                label="Resort Name"
                isRequired
                {...register("name")}
                errorMessage={errors.name?.message}
                placeholder="Enter resort name"
              />
              <Input
                label="Location"
                isRequired
                {...register("location")}
                errorMessage={errors.location?.message}
                placeholder="Enter location"
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

              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Category"
                    isRequired
                    {...field}
                    errorMessage={errors.category?.message}
                    value={field.value || ""} // Ensure the default category is selected
                  >
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />

              <Input
                label="Policy"
                {...register("policy")}
                placeholder="Enter any policy here"
              />
              <Controller
                name="pool"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Checkbox isSelected={value} onValueChange={onChange}>
                    Pool
                  </Checkbox>
                )}
              />
              <Controller
                name="valid"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Checkbox isSelected={value} onValueChange={onChange}>
                    Valid
                  </Checkbox>
                )}
              />

              <div>
                <label className="block text-lg font-medium text-[#023246] mb-2">
                  Resort Images (JPEG only):
                </label>
                <input
                  type="file"
                  accept="image/jpeg"
                  multiple
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg focus:ring-2 focus:ring-[#287094]"
                />
                {errors.images && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.images.message}
                  </p>
                )}
                <div
                  className="mt-4 flex space-x-4 overflow-x-auto"
                  style={{
                    maxWidth: "calc(5 * 5rem)", // Adjust for 5 images (6rem width + margin)
                    scrollbarWidth: "thin", // Thin scrollbar for supported browsers
                  }}
                >
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className="relative flex-shrink-0"
                      style={{ width: "6rem" }} // Ensure fixed width for each image
                    >
                      <img
                        src={
                          image.endsWith(".jpg")
                            ? image
                            : `https://res.cloudinary.com/dkqfxe7qy/image/upload/v1/${image}`
                        }
                        alt={`preview-${image}`}
                        className="h-24 w-24 object-cover rounded-lg shadow-md"
                      />
                      <Button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-0 right-0 text-white bg-red-500 rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className=" w-full flex justify-between mt-6">
                <Button
                  type="button"
                  color="danger"
                  variant="shadow"
                  onClick={() => setTimeout(closeModal, 300)}
                  className="w-full sm:w-auto p-3 rounded-lg sm:mr-4 transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="success"
                  variant="shadow"
                  isDisabled={loading}
                  className="w-full sm:w-auto text-left p-3 rounded-lg sm:ml-4 transition-colors"
                >
                  {loading ? "Saving..." : "Save"}
                </Button>
              </div>
            </Form>
          </ModalBody>
          {/* </div>
    </div> */}
        </>
      </ModalContent>
    </Modal>
  );
};

export default ResortEdit;
