import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";

type StringMap = Record<string, string | undefined | null>;

const Utils = {
  async ApiRequestWithImage(route: string, data: StringMap, imageData: StringMap) {
    try {
      const formData = new FormData();

      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key) && data[key] != null) {
          formData.append(key, String(data[key]));
        }
      }

      for (const key in imageData) {
        if (Object.prototype.hasOwnProperty.call(imageData, key) && imageData[key]) {
          formData.append(key, {
            uri: imageData[key] as string,
            type: "image/png",
            name: "photo.png",
          } as unknown as Blob);
        }
      }

      return await axios.post(route, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          key: "8623a0c8244bcdd6dd7ab48c8cef6c8546a38367839f0d00183c298bbfbc89d6",
        },
      });
    } catch (error) {
      throw error;
    }
  },

  async GetImageUriFromPicker({ allowsEditing = true }: { allowsEditing?: boolean }) {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing,
      quality: 0.1,
    });

    if (!result.canceled) {
      return result.assets[0]?.uri;
    }
  },

  async SaveFileAuto(uri: string, filename: string, folderPath: string) {
    try {
      const targetFolder = `${FileSystem.documentDirectory}${folderPath}/`;
      await FileSystem.makeDirectoryAsync(targetFolder, { intermediates: true });

      const filePath = `${targetFolder}${filename}`;
      const base64Content = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await FileSystem.writeAsStringAsync(filePath, base64Content, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return filePath;
    } catch (error) {
      console.error("Error saving file:", error);
      return null;
    }
  },

  GenerateRandomString() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    const mmm = String(now.getMilliseconds()).padStart(3, "0");
    const timeStr = `${hh}${mm}${ss}${mmm}`;

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let randomPart = "";
    for (let i = 0; i < 6; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `${timeStr}${randomPart}`;
  },
};

export default Utils;
