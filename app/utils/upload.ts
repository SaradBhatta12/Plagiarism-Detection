import cloudinary from "./cloudinary";
import { UploadApiResponse } from "cloudinary";



export async function uploadFile(file: File): Promise<UploadApiResponse> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "plagiarism-detection",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return reject(error);
          }
          if (!result) {
            return reject(new Error("Upload failed: No result returned from Cloudinary"));
          }
          resolve(result);
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error("Error in uploadFile:", error);
    throw error;
  }
}