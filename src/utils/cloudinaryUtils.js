// utils/Cloudinaryutils.js

export const uploadToCloudinary = async (file) => {  
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ParisResort"); // Replace with your Cloudinary upload preset

  try {
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dkqfxe7qy/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Cloudinary upload error:", errorData);
      throw new Error(`Upload failed: ${errorData.error?.message}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error.message);
    throw error;
  }
};



export const deleteFromCloudinary = async (imageId) => {
  try {
    const response = await fetch("https://54.234.139.197/api/delete-image/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ public_id: imageId }),
    });   

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Backend delete error:", errorData);
      throw new Error(`Delete failed: ${errorData.error}`);
    }

    return await response.json(); // Successful deletion
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error.message);
    throw error;
  }
};
