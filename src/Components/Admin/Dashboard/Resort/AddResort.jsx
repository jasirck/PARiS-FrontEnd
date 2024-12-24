

// import React, { useState, useEffect } from "react";
// import axios from "../../../../utils/Api";
// import { uploadToCloudinary } from "../../../../utils/cloudinaryUtils";
// import { useForm, Controller } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import { useSelector } from "react-redux";
// import {
//   Input,
//   Select,
//   SelectItem,
//   Button,
//   Checkbox,
//   Modal,
//   ModalContent,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
// } from "@nextui-org/react";
// import { toast } from "sonner";

// const schema = yup.object().shape({
//   name: yup.string().required("Resort name is required"),
//   location: yup.string().required("Location is required"),
//   base_price: yup
//     .number()
//     .typeError("Base price must be a number")
//     .positive("Base price must be positive")
//     .required("Base price is required"),
//   adult_price: yup
//     .number()
//     .typeError("Adult price must be a number")
//     .positive("Adult price must be positive")
//     .required("Adult price is required"),
//   child_price: yup
//     .number()
//     .typeError("Child price must be a number")
//     .positive("Child price must be positive")
//     .required("Child price is required"),
//   category: yup.string().required("Category is required"),
//   policy: yup.string(),
//   pool: yup.boolean(),
//   images: yup
//     .array()
//     .of(
//       yup
//         .mixed()
//         .test(
//           "fileType",
//           "Only JPEG images are allowed",
//           (value) => value && value.type === "image/jpeg"
//         )
//     )
//     .min(1, "At least one image is required")
//     .required("Images are required"),
// });

// const AddResortModal = ({ isOpen, onClose }) => {
//   const [categories, setCategories] = useState([]);
//   const [images, setImages] = useState([]);
//   const [imageFiles, setImageFiles] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const { token } = useSelector((state) => state.auth);

//   const {
//     register,
//     control,
//     handleSubmit,
//     formState: { errors },
//     reset,
//     setValue,
//   } = useForm({
//     resolver: yupResolver(schema),
//     defaultValues: {
//       name: "",
//       location: "",
//       base_price: "",
//       adult_price: "",
//       child_price: "",
//       category: "",
//       policy: "",
//       pool: false,
//       images: [],
//     },
//   });

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         setLoading(true);
//         const categoriesData = await axios.get("/api/resort-categories/");
//         setCategories(categoriesData.data || []);
//       } catch (error) {
//         toast.error("Failed to fetch categories");
//         console.error("Error fetching categories:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (isOpen) {
//       fetchCategories();
//     }
//   }, [isOpen]);

//   const handleImageUpload = (files) => {
//     const newFiles = Array.from(files);
//     const validFiles = newFiles.filter((file) => file.type === "image/jpeg");

//     if (validFiles.length !== newFiles.length) {
//       toast.error("Only JPEG files are allowed");
//     }

//     const newImageFiles = [...imageFiles, ...validFiles];
//     const newImagePreviews = newImageFiles.map((file) =>
//       URL.createObjectURL(file)
//     );

//     setImageFiles(newImageFiles);
//     setImages(newImagePreviews);
//     setValue("images", newImageFiles);
//   };

//   const handleRemoveImage = (index) => {
//     const updatedImageFiles = imageFiles.filter((_, idx) => idx !== index);
//     const updatedImagePreviews = images.filter((_, idx) => idx !== index);

//     setImageFiles(updatedImageFiles);
//     setImages(updatedImagePreviews);
//     setValue("images", updatedImageFiles);
//   };

//   const resetForm = () => {
//     reset();
//     setImages([]);
//     setImageFiles([]);
//   };

//   const onSubmit = async (data) => {
//     try {
//       setLoading(true);

//       const uploadedImages = await Promise.all(
//         imageFiles.map(async (file) => {
//           const uploadedImage = await uploadToCloudinary(file);
//           return uploadedImage.secure_url.match(/\/([^\/]+)\.jpg/)[1];
//         })
//       );

//       const formData = new FormData();
//       formData.append("name", data.name);
//       formData.append("location", data.location);
//       formData.append("base_price", data.base_price);
//       formData.append("adult_price", data.adult_price);
//       formData.append("child_price", data.child_price);
//       formData.append("category", data.category);
//       formData.append("pool", data.pool || false);
//       formData.append("policy", data.policy || "");
//       formData.append("images", uploadedImages.join(","));

//       await axios.post("/api/admin-resorts/", formData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       toast.success("Resort added successfully!");
//       resetForm();
//       onClose();
//     } catch (error) {
//       const errorMessage =
//         error.response?.data?.message || "Failed to add resort";
//       toast.error(errorMessage);

//       console.error("Error submitting form", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
//       <ModalContent>
//         <>
//           <ModalHeader className="text-3xl font-extrabold text-[#287094]">
//             Add New Resort
//           </ModalHeader>
//           <ModalBody>
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//                   <Input
//                     label="Resort Name"
//                     isRequired
//                     {...register("name")}
//                     errorMessage={errors.name?.message}
//                     placeholder="Enter resort name"
//                   />
//                   <Input
//                     label="Location"
//                     isRequired
//                     {...register("location")}
//                     errorMessage={errors.location?.message}
//                     placeholder="Enter location"
//                   />
//                   <div className="flex space-x-6">
//                     <Input
//                       label="Base Price"
//                       isRequired
//                       type="number"
//                       {...register("base_price")}
//                       errorMessage={errors.base_price?.message}
//                       placeholder="Enter base price"
//                     />
//                     <Input
//                       label="Adult Price"
//                       isRequired
//                       type="number"
//                       {...register("adult_price")}
//                       errorMessage={errors.adult_price?.message}
//                       placeholder="Enter adult price"
//                     />
//                     <Input
//                       label="Child Price"
//                       isRequired
//                       type="number"
//                       {...register("child_price")}
//                       errorMessage={errors.child_price?.message}
//                       placeholder="Enter child price"
//                     />
//                   </div>
//                   <Controller
//                     name="category"
//                     control={control}
//                     render={({ field }) => (
//                       <Select
//                         label="Category"
//                         isRequired
//                         {...field}
//                         errorMessage={errors.category?.message}
//                       >
//                         {categories.map((category) => (
//                           <SelectItem key={category.id} value={category.id}>
//                             {category.name}
//                           </SelectItem>
//                         ))}
//                       </Select>
//                     )}
//                   />
//                   <Input
//                     label="Policy"
//                     {...register("policy")}
//                     placeholder="Enter any policy here"
//                   />
//                   <Controller
//                     name="pool"
//                     control={control}
//                     render={({ field: { value, onChange } }) => (
//                       <Checkbox isSelected={value} onValueChange={onChange}>
//                         Pool
//                       </Checkbox>
//                     )}
//                   />
//                   <div>
//                     <label className="block text-lg font-medium text-[#023246] mb-2">
//                       Resort Images (JPEG only):
//                     </label>
//                     <input
//                       type="file"
//                       accept="image/jpeg"
//                       multiple
//                       onChange={(e) => handleImageUpload(e.target.files)}
//                       className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg"
//                     />
//                     {errors.images && (
//                       <p className="text-red-500 text-sm mt-1">
//                         {errors.images.message}
//                       </p>
//                     )}
//                     <div
//                       className="mt-4 flex space-x-4 overflow-x-auto"
//                       style={{
//                         maxWidth: "calc(5 * 6rem)", // Adjust for 5 images (6rem width + margin)
//                         scrollbarWidth: "thin", // Thin scrollbar for supported browsers
//                       }}
//                     >
//                       {images.map((image, index) => (
//                         <div
//                           key={index}
//                           className="relative flex-shrink-0"
//                           style={{ width: "6rem" }} // Ensure fixed width for each image
//                         >
//                           <img
//                             src={image}
//                             alt={`preview-${index}`}
//                             className="h-24 w-24 object-cover rounded-lg shadow-md"
//                           />
//                           <Button
//                             type="button"
//                             onClick={() => handleRemoveImage(index)}
//                             className="absolute top-0 right-0 text-white bg-red-500 rounded-full w-6 h-6 flex items-center justify-center"
//                           >
//                             ×
//                           </Button>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </form>
//           </ModalBody>
//           <ModalFooter>
//             <Button color="danger" variant="light" onPress={onClose}>
//               Cancel
//             </Button>
//             <Button
//               onPress={handleSubmit(onSubmit)}
//               color="primary"
//               isDisabled={loading}
//             >
//               {loading ? "Submitting..." : "Submit"}
//             </Button>
//           </ModalFooter>
//         </>
//       </ModalContent>
//     </Modal>
//   );
// };

// export default AddResortModal;





import React, { useState, useEffect } from "react";
import axios from "../../../../utils/Api";
import { uploadToCloudinary } from "../../../../utils/cloudinaryUtils";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSelector } from "react-redux";
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
import { tr } from "framer-motion/client";

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
  pool: yup.boolean(),
  images: yup
    .array()
    .of(
      yup
        .mixed()
        .test(
          "fileType",
          "Only JPEG images are allowed",
          (value) => value && value.type === "image/jpeg"
        )
    )
    .min(1, "At least one image is required")
    .required("Images are required"),
});

const AddResortModal = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useSelector((state) => state.auth);

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(undefined, options);
  };

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
      is_holiday: true,
      category: "",
      policy: "",
      pool: false,
      images: [],
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await axios.get("/api/resort-categories/");
        setCategories(categoriesData.data || []);
      } catch (error) {
        toast.error("Failed to fetch categories");
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

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
    setImages(newImagePreviews);
    setValue("images", newImageFiles);
  };

  const handleRemoveImage = (index) => {
    const updatedImageFiles = imageFiles.filter((_, idx) => idx !== index);
    const updatedImagePreviews = images.filter((_, idx) => idx !== index);

    setImageFiles(updatedImageFiles);
    setImages(updatedImagePreviews);
    setValue("images", updatedImageFiles);
  };

  const resetForm = () => {
    reset();
    setImages([]);
    setImageFiles([]);
  };
  
  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const uploadedImages = await Promise.all(
        imageFiles.map(async (file) => {
          const uploadedImage = await uploadToCloudinary(file);
          return uploadedImage.secure_url.match(/\/([^\/]+)\.jpg/)[1];
        })
      );

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("location", data.location);
      formData.append("base_price", data.base_price);
      formData.append("adult_price", data.adult_price);
      formData.append("child_price", data.child_price);
      formData.append("category", data.category);
      formData.append("pool", data.pool || false);
      formData.append("is_holiday", true);
      formData.append("policy", data.policy || "");
      formData.append("images", uploadedImages.join(","));

      await axios.post("/api/admin-resorts/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Resort added successfully!");
      resetForm();
      onClose();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to add resort";
      toast.error(errorMessage);

      console.error("Error submitting form", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent>
        <>
          <ModalHeader className="text-3xl font-extrabold text-[#287094]">
            Add New Resort
          </ModalHeader>
          <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  <div>
                    <label className="block text-lg font-medium text-[#023246] mb-2">
                      Resort Images (JPEG only):
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg"
                      multiple
                      onChange={(e) => handleImageUpload(e.target.files)}
                      className="w-full p-3 border-2 border-[#D4D4CE] rounded-lg"
                    />
                    {errors.images && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.images.message}
                      </p>
                    )}
                    <div
                      className="mt-4 flex space-x-4 overflow-x-auto"
                      style={{
                        maxWidth: "calc(5 * 6rem)", // Adjust for 5 images (6rem width + margin)
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
                            src={image}
                            alt={`preview-${index}`}
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
                </form>
          </ModalBody>
        </>
      </ModalContent>
    </Modal>
  );
};

export default AddResortModal;
