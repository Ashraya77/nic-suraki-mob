import {axiosInstance} from "../utils/axiosInstance";

const buildFormData = (fields = {}, fileMap = {}) => {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  const mimeTypes = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
  };

  Object.entries(fileMap).forEach(([fieldName, uri]) => {
    if (!uri) return;
    const filename = uri.split("/").pop();
    const ext = filename?.split(".").pop()?.toLowerCase();

    formData.append(fieldName, {
      uri,
      name: filename ?? `upload.${ext}`,
      type: mimeTypes[ext] ?? "image/jpeg",
    });
  });

  return formData;
};

// Upload a photo with metadata fields
export const uploadPhoto = (endpoint, fields = {}, fileMap = {}) => {
  const formData = buildFormData(fields, fileMap);

  return axiosInstance.post(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};