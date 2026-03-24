import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import CameraModal from "../components/custom/CameraModal";
import AppStyles from "../styles/AppStyles";
import { colors } from "../utils/colors";

const VideoCameraScreen = () => {
  const router = useRouter();
  const { videoUri } = useLocalSearchParams();

  const [cameraVisible, setCameraVisible] = useState(!videoUri);
  const [recordedVideo, setRecordedVideo] = useState(
    videoUri ? { uri: videoUri } : null,
  );
  const [status, setStatus] = useState({ isLoaded: false, isPlaying: false }); // ← safe default  
  const videoRef = useRef(null);

  const snackbarAnim = useRef(new Animated.Value(-100)).current;
  const [showSnackbar, setShowSnackbar] = useState(false);

  const showSuccessSnackbar = () => {
    setShowSnackbar(true);
    Animated.sequence([
      Animated.timing(snackbarAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2500),
      Animated.timing(snackbarAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setShowSnackbar(false));
  };

  const handleCapture = (media, type) => {
    setCameraVisible(false);
    if (type === "video") {
      setRecordedVideo(media);
    }
  };

  const handleClose = () => {
    setCameraVisible(false);
    if (!recordedVideo) router.back();
  };

  const uploadVideo = async () => {
    if (!recordedVideo) return;
    const formData = new FormData();
    formData.append("files", {
      uri: recordedVideo.uri,
      name: "video.mp4",
      type: "video/mp4",
    });
    try {
      const response = await axios.post(
        "https://fs.nicnepal.org/files/temp_fon/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            key: "8623a0c8244bcdd6dd7ab48c8cef6c8546a38367839f0d00183c298bbfbc89d6",
          },
        },
      );
      const videoUrl = response?.data?.url[0];
      await AsyncStorage.setItem("imageUrl", videoUrl);
      showSuccessSnackbar();
      setTimeout(() => {
        router.push({ pathname: "./(tabs)", params: { imageUrl: videoUrl } });
      }, 3000);
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Upload failed. Check console for details.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <View style={styles.container}>
        {!recordedVideo && (
          <TouchableOpacity
            style={AppStyles.button}
            onPress={() => setCameraVisible(true)}
          >
            <Text style={AppStyles.buttonText}>
              रेकर्ड सुरु गर्नुहोस (Start Recording)
            </Text>
          </TouchableOpacity>
        )}

        {recordedVideo && (
          <>
            <Text style={styles.previewText}>
              कैद गरिएको भिडियो (Captured Video)
            </Text>
            <Video
              ref={videoRef}
              style={styles.videoPlayer}
              source={{ uri: recordedVideo.uri }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping
              onPlaybackStatusUpdate={(s) => setStatus(s)}
            />

            <TouchableOpacity
              onPress={async () => {
                if (!videoRef.current) return; // ← guard against null ref
                if (status.isPlaying) {
                  await videoRef.current.pauseAsync();
                } else {
                  await videoRef.current.playAsync();
                }
              }}
              style={[
                AppStyles.button,
                {
                  backgroundColor: status.isPlaying
                    ? colors.redColor
                    : colors.primary3,
                },
              ]}
            >
              <Text style={AppStyles.buttonText}>
                {status.isPlaying ? "Pause" : "Play"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCameraVisible(true)}
              style={[AppStyles.button, { marginBottom: 8 }]}
            >
              <Text style={AppStyles.buttonText}>रिटेक (Re-record)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={uploadVideo}
              style={[AppStyles.button, { backgroundColor: colors.primary2 }]}
            >
              <Text style={AppStyles.buttonText}>
                भिडियो पठाउनुहोस (Upload Video)
              </Text>
            </TouchableOpacity>
          </>
        )}

        {showSnackbar && (
          <Animated.View
            style={[
              styles.snackbar,
              { transform: [{ translateY: snackbarAnim }] },
            ]}
          >
            <MaterialIcons name="check-circle" size={20} color={colors.white} />
            <Text style={styles.snackbarText}>
              भिडियो सफलतापूर्वक अपलोड भयो!
            </Text>
          </Animated.View>
        )}

        <CameraModal
          visible={cameraVisible}
          initialMode="video"
          onCapture={handleCapture}
          onClose={handleClose}
        />
      </View>
    </SafeAreaView>
  );
};

export default VideoCameraScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  previewText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary2,
    marginBottom: 8,
  },
  videoPlayer: {
    width: "90%",
    aspectRatio: 9 / 16, // ← matches portrait video aspect ratio, no stretching
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#aaa",
    overflow: "hidden",
    marginVertical: 10,
  },
  snackbar: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    backgroundColor: colors.primary3,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    elevation: 8,
    zIndex: 1000,
  },
  snackbarText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
});
