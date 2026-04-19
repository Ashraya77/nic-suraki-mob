import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
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

  const snackbarAnim = useRef(new Animated.Value(-100)).current;
  const [showSnackbar, setShowSnackbar] = useState(false);

  const player = useVideoPlayer(recordedVideo?.uri ?? null, (p) => {
    p.loop = true;
  });

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
    <SafeAreaView style={styles.safeArea}>
      {/* Pre-recording screen */}
      {!recordedVideo && !cameraVisible && (
        <View style={styles.centeredContainer}>
          <MaterialIcons
            name="videocam"
            size={64}
            color={colors.primary2}
            style={{ marginBottom: 16, opacity: 0.8 }}
          />
          <Text style={styles.hintText}>
            भिडियो रेकर्ड गर्न तयार हुनुहोस्
          </Text>
          <Text style={styles.hintSubText}>Ready to record your video</Text>
          <TouchableOpacity
            style={[AppStyles.button, { marginTop: 24, width: 240 }]}
            onPress={() => setCameraVisible(true)}
          >
            <Text style={AppStyles.buttonText}>
              रेकर्ड सुरु गर्नुहोस (Start Recording)
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Post-recording screen */}
      {recordedVideo && (
        <View style={styles.postRecordContainer}>

          {/* Header */}
          <View style={styles.header}>
            <MaterialIcons name="videocam" size={20} color={colors.primary2} />
            <Text style={styles.previewText}>
              कैद गरिएको भिडियो (Captured Video)
            </Text>
          </View>

          {/* Video */}
          <View style={styles.videoWrapper}>
            <VideoView
              style={styles.videoPlayer}
              player={player}
              allowsFullscreen
              allowsPictureInPicture
              contentFit="contain"
            />
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => {
                if (player.playing) {
                  player.pause();
                } else {
                  player.play();
                }
              }}
              style={[
                styles.actionButton,
                {
                  backgroundColor: player.playing
                    ? colors.redColor
                    : colors.primary3,
                },
              ]}
            >
              <MaterialIcons
                name={player.playing ? "pause" : "play-arrow"}
                size={20}
                color="white"
              />
              <Text style={styles.actionButtonText}>
                {player.playing ? "Pause" : "Play"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCameraVisible(true)}
              style={[styles.actionButton, { backgroundColor: colors.primary3 }]}
            >
              <MaterialIcons name="replay" size={20} color="white" />
              <Text style={styles.actionButtonText}>रिटेक (Re-record)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={uploadVideo}
              style={[styles.actionButton, { backgroundColor: colors.primary2 }]}
            >
              <MaterialIcons name="cloud-upload" size={20} color="white" />
              <Text style={styles.actionButtonText}>
                भिडियो पठाउनुहोस (Upload)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Snackbar */}
      {showSnackbar && (
        <Animated.View
          style={[
            styles.snackbar,
            { transform: [{ translateY: snackbarAnim }] },
          ]}
        >
          <MaterialIcons name="check-circle" size={20} color="white" />
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
        onGalleryExif={() => {}}
      />
    </SafeAreaView>
  );
};

export default VideoCameraScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  hintText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary2,
    textAlign: "center",
  },
  hintSubText: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
    textAlign: "center",
  },
  postRecordContainer: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  previewText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary2,
  },
  videoWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000",
    // subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  videoPlayer: {
    flex: 1,
    width: "100%",
  },
  buttonContainer: {
    gap: 10,
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
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
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
});
