import { useState, useEffect } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import Utils from "../utils/Utils";
import { axiosInstance } from "../utils/axiosInstance";
import { FormSchema } from "@/utils/validation";
import { getCoordinatesFromExif } from "@/utils/exif";

interface GPSLocation {
  latitude: number;
  longitude: number;
}

export const useHomeScreen = (imageUrl?: string, audioUrl?: string) => {
  const [description, setDescriptionState] = useState<string>("");
  const [incidentType, setIncidentType] = useState<string>("");
  const [gpsLocation, setGpsLocation] = useState<GPSLocation>({
    latitude: 0,
    longitude: 0,
  });
  const [loadingLocation, setLoadingLocation] = useState<boolean>(false);
  const [storedImageUrl, setStoredImageUrl] = useState<string | null>(null);
  const [storedAudio, setStoredAudio] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  useEffect(() => {
    storeUserString();
    getImageUrlFromStorage();
    getAudioFromStorage();
    getGPSLocation();
    loadDescription();
  }, []);

  const storeUserString = async (): Promise<void> => {
    if (!(await AsyncStorage.getItem("AnyUser"))) {
      await AsyncStorage.setItem("AnyUser", Utils.GenerateRandomString());
    }
  };

  const loadDescription = async (): Promise<void> => {
    try {
      const saved = await AsyncStorage.getItem("description");
      if (saved) setDescriptionState(saved);
    } catch (error) {
      console.error("Failed to load description:", error);
    }
  };

  const getGPSLocation = async (): Promise<void> => {
    setLoadingLocation(true);
    try {
      // Prefer EXIF location if set by CameraScreen
      const stored = await AsyncStorage.getItem("exifLocation");
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log("📍 Using EXIF location:", parsed); // ← add this
        setGpsLocation(parsed);
        await AsyncStorage.removeItem("exifLocation");
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Allow location access to proceed");
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setGpsLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to get location");
    } finally {
      setLoadingLocation(false);
    }
  };

  //for exif metadata
  const getLocationFromExifOrFallback = async (
    exif: Record<string, any> | null | undefined,
  ): Promise<void> => {
    const coordinates = getCoordinatesFromExif(exif);

    if (coordinates) {
      setGpsLocation(coordinates);
    } else {
      // No EXIF GPS data — fall back to the device's current location
      await getGPSLocation();
    }
  };

  const getImageUrlFromStorage = async (): Promise<void> => {
    try {
      const url = await AsyncStorage.getItem("imageUrl");
      if (url) setStoredImageUrl(url);
    } catch (error) {
      console.error("Failed to load image URL:", error);
    }
  };

  const getAudioFromStorage = async (): Promise<void> => {
    try {
      const audio = await AsyncStorage.getItem("audioUri");
      if (audio) setStoredAudio(audio);
    } catch (error) {
      console.error("Failed to load audio:", error);
    }
  };

  const setDescription = async (text: string): Promise<void> => {
    setDescriptionState(text);
    try {
      await AsyncStorage.setItem("description", text);
    } catch (error) {
      console.error("Failed to save description:", error);
    }
  };

  const resetForm = async (): Promise<void> => {
    setStoredImageUrl(null);
    setStoredAudio(null);
    setDescriptionState("");
    setIncidentType("");
    try {
      await AsyncStorage.multiRemove(["imageUrl", "audioUri"]);
    } catch (error) {
      console.error("Error clearing AsyncStorage:", error);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    setLoading(true);
    try {
      const anyUser = (await AsyncStorage.getItem("AnyUser")) || "random";
      const payload = {
        image_video: imageUrl || storedImageUrl || "",
        gps_location: `${gpsLocation.latitude}, ${gpsLocation.longitude}`,
        voice: storedAudio || audioUrl || "",
        description,
        incident_type: incidentType,
        any_user: anyUser,
      };

      const validationResult = FormSchema.safeParse(payload);
      if (!validationResult.success) {
        Alert.alert(
          "Validation Error",
          validationResult.error.issues[0].message,
        );
        return;
      }

      await axiosInstance.post("/field-reports/create/", payload);
      await resetForm();
      setShowSuccess(true);
    } catch (error) {
      Alert.alert("Error", "Failed to submit the report. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    description,
    incidentType,
    gpsLocation,
    loadingLocation,
    storedImageUrl,
    storedAudio,
    loading,
    showSuccess,
    setDescription,
    setIncidentType,
    resetForm,
    handleSubmit,
    setShowSuccess,
    setStoredAudio,
    getLocationFromExifOrFallback,
  };
};
