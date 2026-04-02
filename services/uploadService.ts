import axios from "axios";

type UploadFields = Record<string, string | number | boolean | null | undefined>;
type UploadFileMap = Record<string, string | null | undefined>;

const FILE_UPLOAD_BASE_URL =
  process.env.EXPO_PUBLIC_FILE_UPLOAD_URL ?? "https://fs.nicnepal.org";
const FILE_UPLOAD_API_KEY =
  process.env.EXPO_PUBLIC_FILE_UPLOAD_KEY ??
  "8623a0c8244bcdd6dd7ab48c8cef6c8546a38367839f0d00183c298bbfbc89d6";

const buildFormData = (fields: UploadFields = {}, fileMap: UploadFileMap = {}) => {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  const mimeTypes: Record<string, string> = {
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
      type: (ext ? mimeTypes[ext] : undefined) ?? "image/jpeg",
    } as any);
  });

  return formData;
};

// Upload a photo with metadata fields
export const uploadPhoto = (
  endpoint: string,
  fields: UploadFields = {},
  fileMap: UploadFileMap = {},
) => {
  const formData = buildFormData(fields, fileMap);
  const normalizedEndpoint = endpoint.startsWith("http")
    ? endpoint
    : `${FILE_UPLOAD_BASE_URL}${endpoint}`;

  return axios.post(normalizedEndpoint, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      key: FILE_UPLOAD_API_KEY,
    },
  });
};
