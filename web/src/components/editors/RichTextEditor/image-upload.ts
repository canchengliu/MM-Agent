/**
 * Image upload handler for the RichTextEditor.
 */

import { createImageUpload } from "novel";
import { toast } from "sonner";
import { resolveServiceURL } from "~/core/api/resolve-service-url";

// Define the maximum allowed file size (e.g., 10MB)
const MAX_FILE_SIZE_MB = 10;

// Define the upload logic
const onUpload = (file: File) => {
  // In a real application, this should point to the actual upload endpoint.
  const uploadUrl = resolveServiceURL("/api/files/upload");

  const formData = new FormData();
  formData.append("file", file);

  // Start the fetch request
  const promise = fetch(uploadUrl, {
    method: "POST",
    body: formData,
    // Authentication headers are typically handled by a global fetch configuration.
  });

  return new Promise((resolve, reject) => {
    // Use toast notifications to provide feedback
    toast.promise(
      promise.then(async (res) => {
        if (res.ok) {
          // Assuming the response contains the URL of the uploaded image
          const data = await res.json();
          const url = data.url;

          if (!url) {
             throw new Error("Upload successful, but no URL returned from API.");
          }

          // Preload the image before resolving
          const image = new Image();
          image.src = url;
          image.onload = () => {
            resolve(url);
          };
          image.onerror = () => {
            reject(new Error("Failed to load uploaded image."));
          }

        } else if (res.status === 404) {
            // Fallback for development: If the upload API is not implemented yet, use Data URL locally.
            console.warn("Upload API not found (404). Reading image locally instead (Data URL).");
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = () => reject(new Error("Failed to read file locally."));
            reader.readAsDataURL(file);
            // Throw an error so the toast shows the warning, but we still resolve the promise.
            throw new Error("Upload API not implemented. Using local image data.");
        }
        else {
          const errorText = await res.text().catch(() => "Unknown error");
          throw new Error(`Error uploading image: ${res.status} ${errorText}`);
        }
      }).catch(err => {
          // Ensure rejection happens if promise chain fails
          if (!err.message.includes("Using local image data")) {
             reject(err);
          }
          throw err;
      }),
      {
        loading: "Uploading image...",
        success: "Image uploaded successfully.",
        // Display the error message from the catch block
        error: (e) => e.message,
      },
    );
  });
};

// Create the upload function configuration
export const uploadFn = createImageUpload({
  onUpload,
  // Validation function for file type and size
  validateFn: (file) => {
    if (!file.type.includes("image/")) {
      toast.error("File type not supported. Please upload an image.");
      return false;
    }
    if (file.size / 1024 / 1024 > MAX_FILE_SIZE_MB) {
      toast.error(`File size too big (max ${MAX_FILE_SIZE_MB}MB).`);
      return false;
    }
    return true;
  },
});

