const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a file to Cloudinary
 * @param {string} filePath - Absolute or relative path to the local file
 * @param {string} folder - Target folder in Cloudinary
 * @returns {Promise<object>} Cloudinary upload result
 */
const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: "auto" // Automatically detect file type (image, pdf, etc.)
    });
    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

/**
 * Deletes a file from Cloudinary given its secure URL or public ID
 * @param {string} url - Secure URL of the asset
 * @param {string} resourceType - Cloudinary resource type ('image', 'raw', etc.)
 * @returns {Promise<object>} Cloudinary delete result
 */
const deleteFromCloudinary = async (url, resourceType) => {
  if (!url) return null;
  try {
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;

    // Detect resource type from URL if not explicitly provided
    const detectedResourceType = resourceType || parts[uploadIndex - 1] || "image";

    // Get everything after the version segment (vNNNNNNN)
    const afterUpload = parts.slice(uploadIndex + 2); // skips version
    const pathWithExtension = afterUpload.join("/");
    
    // Remove the file extension if resource type is not raw
    let publicId = pathWithExtension;
    if (detectedResourceType !== "raw") {
      const lastDotIndex = pathWithExtension.lastIndexOf(".");
      if (lastDotIndex !== -1) {
        publicId = pathWithExtension.substring(0, lastDotIndex);
      }
    }

    let result = await cloudinary.uploader.destroy(publicId, {
      resource_type: detectedResourceType
    });

    // Fallback: If not found as image, try raw (since PDFs can be raw or image)
    if (result.result !== "ok" && detectedResourceType === "image") {
      result = await cloudinary.uploader.destroy(pathWithExtension, {
        resource_type: "raw"
      });
    }

    return result;
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    return null; // Don't throw, just log
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary
};
