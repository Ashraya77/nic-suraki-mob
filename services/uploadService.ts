import axios from "axios";

type UploadFields = Record<string, string | number | boolean | null | undefined>;
type UploadFileMap = Record<string, string | null | undefined>;

const FILE_UPLOAD_BASE_URL =
  process.env.EXPO_PUBLIC_FILE_UPLOAD_URL ?? "https://fs.nicnepal.org";
const FILE_UPLOAD_API_KEY =
  process.env.EXPO_PUBLIC_FILE_UPLOAD_KEY ??
  "8623a0c8244bcdd6dd7ab48c8cef6c8546a38367839f0d00183c298bbfbc89d6";

const mimeTypes: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  heic: "image/heic",
  mp4: "video/mp4",
  mov: "video/quicktime",
  m4v: "video/x-m4v",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
  webm: "video/webm",
};

const buildFormData = (fields: UploadFields = {}, fileMap: UploadFileMap = {}) => {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  Object.entries(fileMap).forEach(([fieldName, uri]) => {
    if (!uri) return;
    const sanitizedUri = uri.split("?")[0];
    const filename = sanitizedUri.split("/").pop();
    const ext = filename?.split(".").pop()?.toLowerCase();
    const fallbackType = ext?.match(/^(mp4|mov|m4v|avi|mkv|webm)$/)
      ? "video/mp4"
      : "image/jpeg";

    formData.append(fieldName, {
      uri,
      name: filename ?? `upload.${ext}`,
      type: (ext ? mimeTypes[ext] : undefined) ?? fallbackType,
    } as any);
  });

  return formData;
};

// Upload a photo with metadata fields
export const uploadFile = (
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

export const uploadPhoto = uploadFile;
