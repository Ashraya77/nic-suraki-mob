import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  
  StyleSheet,
  Alert,
  Animated,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import CameraModal from "../components/custom/CameraModal";
import AppStyles from "../styles/AppStyles";
import { colors } from "../utils/colors";
import Utils from "../utils/Utils";

const CameraScreen = () => {
  const router = useRouter();
  const { image } = useLocalSearchParams();

  const [cameraVisible, setCameraVisible] = useState(!image);
  const [capturedPhoto, setCapturedPhoto] = useState(image ? { uri: image } : null);

  const snackbarAnim = useRef(new Animated.Value(-100)).current;
  const [showSnackbar, setShowSnackbar] = useState(false);

  const showSuccessSnackbar = () => {
    setShowSnackbar(true);
    Animated.sequence([
      Animated.timing(snackbarAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(snackbarAnim, { toValue: -100, duration: 300, useNativeDriver: true }),
    ]).start(() => setShowSnackbar(false));
  };

  const handleCapture = (media, type) => {
    setCameraVisible(false);
    if (type === "photo") {
      setCapturedPhoto(media);
    } else {
      // Video captured — hand off to video flow
      router.push({ pathname: "/videoCamera", params: { videoUri: media.uri } });
    }
  };

  const handleClose = () => {
    setCameraVisible(false);
    if (!capturedPhoto) router.back();
  };

  const sendPhoto = async () => {
    try {
      let anyUser = await AsyncStorage.getItem("AnyUser");
      let response = await Utils.ApiRequestWithImage(
        "https://fs.nicnepal.org/files/suraki/",
        { Remarks: "Test", any_user: anyUser },
        { files: capturedPhoto?.uri },
      );
      let imageUrl = response?.data?.url[0];
      await AsyncStorage.setItem("imageUrl", imageUrl);
      showSuccessSnackbar();
      setTimeout(() => {
        router.push({ pathname: "./(tabs)", params: { imageUrl } });
      }, 3000);
    } catch (error) {
      Alert.alert("Error", "Upload failed. Check console for details.");
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgColor }}>
      <View style={styles.container}>
        {!capturedPhoto && (
          <TouchableOpacity style={AppStyles.button} onPress={() => setCameraVisible(true)}>
            <Text style={AppStyles.buttonText}>फोटो खिच्नुहोस (Capture a Photo)</Text>
          </TouchableOpacity>
        )}

        {capturedPhoto && (
          <>
            <View style={styles.previewContainer}>
              <Text style={styles.previewText}>कैद गरिएको फोटो (Captured Photo)</Text>
              <View style={styles.photoPreviewContainer}>
                <ImageBackground
                  source={{ uri: capturedPhoto.uri }}
                  style={styles.photoPreview}
                  resizeMode="contain"
                />
              </View>
            </View>
            <TouchableOpacity onPress={() => setCameraVisible(true)} style={[AppStyles.button, { marginBottom: 8 }]}>
              <Text style={AppStyles.buttonText}>रिटेक (Retake)</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={sendPhoto} style={AppStyles.button}>
              <Text style={AppStyles.buttonText}>फोटो पठाउनुहोस (Send Photo)</Text>
            </TouchableOpacity>
          </>
        )}

        {showSnackbar && (
          <Animated.View style={[styles.snackbar, { transform: [{ translateY: snackbarAnim }] }]}>
            <MaterialIcons name="check-circle" size={20} color={colors.white} />
            <Text style={styles.snackbarText}>फोटो सफलतापूर्वक अपलोड भयो!</Text>
          </Animated.View>
        )}

        <CameraModal
          visible={cameraVisible}
          initialMode="photo"
          onCapture={handleCapture}
          onClose={handleClose}
        />
      </View>
    </SafeAreaView>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  previewContainer: { marginTop: 20, alignItems: "center" },
  previewText: { fontSize: 16, marginBottom: 10, fontWeight: "bold", color: colors.primary2 },
  photoPreviewContainer: {
    borderRadius: 30, borderWidth: 1, borderColor: "#aaa", overflow: "hidden", marginBottom: 10,
  },
  photoPreview: { width: 350, height: 500, alignItems: "center", justifyContent: "center" },
  snackbar: {
    position: "absolute", top: 0, left: 16, right: 16,
    backgroundColor: colors.primary3, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 16,
    flexDirection: "row", alignItems: "center", gap: 8,
    elevation: 8, zIndex: 1000,
  },
  snackbarText: { color: colors.white, fontSize: 14, fontWeight: "500", flex: 1 },
});