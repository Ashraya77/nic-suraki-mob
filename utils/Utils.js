import axios from "axios";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";

const Utils = {
  ApiRequestWithImage: async function (route, data, imageData) {
    try {
      const formData = new FormData();
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          formData.append(key, data[key]);
        }
      }
      for (const key in imageData) {
        if (imageData.hasOwnProperty(key)) {
          formData.append(key, {
            uri: imageData[key],
            type: "image/png",
            name: "photo.png",
          });
        }
      }
      const response = await axios.post(route, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          key: "8623a0c8244bcdd6dd7ab48c8cef6c8546a38367839f0d00183c298bbfbc89d6",
        },
      });

      return response;
    } catch (error) {
      throw error;
    }
  },
  GetImageUriFromPicker: async function GetImageUriFromPicker({
    allowsEditing = true,
  }) {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: allowsEditing ? true : false,
      quality: 0.1,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
  },
  SaveFileAuto: async (uri, filename, folderPath) => {
    try {
      // Use app's document directory to create file path
      folderPath = FileSystem.documentDirectory + folderPath + "/";

      // Ensure the folder exists, create it if it doesn't
      await FileSystem.makeDirectoryAsync(folderPath, { intermediates: true });

      // Target file path
      const filePath = folderPath + filename;

      // Read the original file as base64
      const base64Content = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Write to a new file in documentDirectory
      await FileSystem.writeAsStringAsync(filePath, base64Content, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return filePath;
    } catch (error) {
      console.error("Error saving file:", error);
      return null;
    }
  },
  GenerateRandomString: () => {
    const now = new Date();

    // Format hhmmssmmm
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    const mmm = String(now.getMilliseconds()).padStart(3, "0");

    const timeStr = hh + mm + ss + mmm; // e.g., "134512123"

    // Generate 6 random alphabetic characters (A–Z, a–z)
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let randomPart = "";
    for (let i = 0; i < 6; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return timeStr + randomPart;
  },
};

export default Utils;
