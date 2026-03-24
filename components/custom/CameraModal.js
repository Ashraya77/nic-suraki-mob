import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  Animated,
  
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import Ionicons from "@expo/vector-icons/Ionicons";
import Utils from "../../utils/Utils";

// mode: "photo" | "video"
const CameraModal = ({
  visible,
  initialMode = "photo",
  onCapture,
  onClose,
}) => {
  const cameraRef = useRef(null);
  const [mode, setMode] = useState(initialMode);
  const [isRecording, setIsRecording] = useState(false);
  const [facing, setFacing] = useState("back");

  // Animated value for the mode toggle indicator
  const toggleAnim = useRef(
    new Animated.Value(initialMode === "photo" ? 0 : 1),
  ).current;
  // Animated value for record button pulse
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef(null);
  // Black flash overlay on mode switch
  const flashAnim = useRef(new Animated.Value(0)).current;

  // Request permissions once when modal becomes visible
  useEffect(() => {
    if (!visible) return;
    (async () => {
      const cam = await Camera.requestCameraPermissionsAsync();
      const mic = await Camera.requestMicrophonePermissionsAsync();
      if (cam.status !== "granted" || mic.status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Camera and microphone access is required.",
        );
        onClose?.();
      }
    })();
  }, [visible]);

  // Sync toggle animation when mode changes
  const switchMode = (next) => {
    if (next === mode || isRecording) return;
    Animated.spring(toggleAnim, {
      toValue: next === "photo" ? 0 : 1,
      useNativeDriver: true,
      tension: 180,
      friction: 20,
    }).start();
    // Flash black for 180ms to cover the CameraView mode-switch flicker
    flashAnim.setValue(1);
    setMode(next);
    Animated.timing(flashAnim, {
      toValue: 0,
      duration: 180,
      delay: 80,
      useNativeDriver: true,
    }).start();
  };

  // Pulse animation while recording
  const startPulse = () => {
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.current.start();
  };

  const stopPulse = () => {
    pulseLoop.current?.stop();
    pulseAnim.setValue(1);
  };

  const handleClose = () => {
    if (isRecording) stopRecording();
    onClose?.();
  };

  // ─── Photo ────────────────────────────────────────────────────────────────
  const takePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
      });
      onCapture?.(photo, "photo");
    } catch (e) {
      Alert.alert("Error", "Failed to take photo.");
    }
  };

  const pickFromGallery = async () => {
    try {
      const uri = await Utils.GetImageUriFromPicker({ allowsEditing: true });
      if (!uri) return;
      const path = await Utils.SaveFileAuto(uri, "image.png", "nicapp");
      onCapture?.({ uri: path }, "photo");
    } catch (e) {
      Alert.alert("Error", "Failed to pick from gallery.");
    }
  };

  // ─── Video ────────────────────────────────────────────────────────────────
  const startRecording = async () => {
    if (!cameraRef.current || isRecording) return;
    try {
      setIsRecording(true);
      startPulse();
      const video = await cameraRef.current.recordAsync();
      // recordAsync resolves when stopRecording() is called
      setIsRecording(false);
      stopPulse();
      if (video) onCapture?.(video, "video");
    } catch (e) {
      Alert.alert("Error", "Failed to record video.");
      setIsRecording(false);
      stopPulse();
    }
  };

  const stopRecording = () => {
    cameraRef.current?.stopRecording();
  };

  // Toggle pill x-translation
  const pillTranslate = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 88], // moves pill from Photo to Video position
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1, backgroundColor: "black" }}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          ratio="16:9"
          facing={facing}
          mode={mode === "video" ? "video" : "picture"}
        >
          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handleClose}
              hitSlop={12}
            >
              <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() =>
                setFacing((f) => (f === "back" ? "front" : "back"))
              }
              hitSlop={12}
            >
              <Ionicons name="camera-reverse-outline" size={22} color="white" />
            </TouchableOpacity>
          </View>

          {/* Recording indicator */}
          {isRecording && (
            <View style={styles.recBadge}>
              <View style={styles.recDot} />
              <Text style={styles.recText}>REC</Text>
            </View>
          )}

          {/* Bottom controls */}
          <View style={styles.bottomBar}>
            {/* Gallery button (photo only) */}
            <TouchableOpacity
              style={[styles.sideBtn, mode === "video" && styles.sideBtnHidden]}
              onPress={pickFromGallery}
              disabled={mode === "video"}
            >
              <Ionicons name="images-outline" size={28} color="white" />
            </TouchableOpacity>

            {/* Center: toggle + shutter */}
            <View style={styles.centerControls}>
              {/* Mode toggle pill */}
              <View style={styles.toggleTrack}>
                {/* Animated sliding background */}
                <Animated.View
                  style={[
                    styles.togglePill,
                    { transform: [{ translateX: pillTranslate }] },
                  ]}
                />
                <TouchableOpacity
                  style={styles.toggleOption}
                  onPress={() => switchMode("photo")}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="camera-outline"
                    size={16}
                    color={mode === "photo" ? "#000" : "rgba(255,255,255,0.75)"}
                  />
                  <Text
                    style={
                      mode === "photo"
                        ? styles.toggleTextActive
                        : styles.toggleText
                    }
                  >
                    Photo
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.toggleOption}
                  onPress={() => switchMode("video")}
                  activeOpacity={0.8}
                  disabled={isRecording}
                >
                  <Ionicons
                    name="videocam-outline"
                    size={16}
                    color={mode === "video" ? "#000" : "rgba(255,255,255,0.75)"}
                  />
                  <Text
                    style={
                      mode === "video"
                        ? styles.toggleTextActive
                        : styles.toggleText
                    }
                  >
                    Video
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Shutter / Record button */}
              {mode === "photo" ? (
                <TouchableOpacity
                  style={styles.shutterRing}
                  onPress={takePhoto}
                  activeOpacity={0.8}
                >
                  <View style={styles.shutterInner} />
                </TouchableOpacity>
              ) : (
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <TouchableOpacity
                    style={[
                      styles.recordRing,
                      isRecording && styles.recordRingActive,
                    ]}
                    onPress={isRecording ? stopRecording : startRecording}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.recordInner,
                        isRecording && styles.recordInnerActive,
                      ]}
                    />
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>

            {/* Spacer to mirror gallery button */}
            <View style={styles.sideBtn} />
          </View>

          {/* Black flash overlay — covers mode-switch flicker */}
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "black", opacity: flashAnim },
            ]}
          />
        </CameraView>
      </View>
    </Modal>
  );
};

export default CameraModal;

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  recBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ff3b30",
  },
  recText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingBottom: 48,
  },
  sideBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  sideBtnHidden: {
    opacity: 0,
  },
  centerControls: {
    alignItems: "center",
    gap: 18,
    flex: 1,
  },

  // Mode toggle
  toggleTrack: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 22,
    padding: 3,
    position: "relative",
    width: 184,
  },
  togglePill: {
    position: "absolute",
    top: 3,
    left: 3,
    width: 88,
    height: "100%",
    backgroundColor: "white",
    borderRadius: 19,
  },
  toggleOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    width: 88,
    justifyContent: "center",
    paddingVertical: 8,
    zIndex: 1,
  },
  toggleText: {
    color: "rgba(255,255,255,0.75)",
    fontWeight: "600",
    fontSize: 14,
  },
  toggleTextActive: {
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
  },

  // Photo shutter
  shutterRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
  },

  // Video record
  recordRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  recordRingActive: {
    borderColor: "#ff3b30",
  },
  recordInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ff3b30",
  },
  camera: {
    flex: 1,
  },
  recordInnerActive: {
    width: 32,
    height: 32,
    borderRadius: 6,
  },
});
