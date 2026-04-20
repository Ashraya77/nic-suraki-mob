import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Audio } from "expo-av";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../utils/colors";

const ApiRequestWithImage = async (route, data, imageData) => {
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
};

export default function AudioRecorderScreen() {
  const router = useRouter();
  const [recording, setRecording] = useState(null);
  const [audioUri, setAudioUri] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);

  // Animation refs
  const snackbarAnim = useRef(new Animated.Value(-100)).current;

  // Snackbar component
  const showSuccessSnackbar = (message) => {
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
    ]).start(() => {
      setShowSnackbar(false);
    });
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Please allow audio recording permissions.",
        );
        return;
      }

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      await recording.startAsync();
      setRecording(recording);
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setAudioUri(uri);
    } catch (err) {
      console.error("Failed to stop recording:", err);
    }
  };

  const playAudio = async () => {
    if (!audioUri) {
      Alert.alert("No audio", "Please record an audio first.");
      return;
    }

    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      const { sound: playbackSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true },
      );

      setSound(playbackSound);
      setIsPlaying(true);

      playbackSound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isPlaying) {
          setIsPlaying(false);
        }
      });
    } catch (err) {
      console.error("Failed to play audio:", err);
    }
  };

  const uploadAudio = async () => {
    if (!audioUri) {
      Alert.alert("No audio", "Please record an audio first.");
      return;
    }

    try {
      const fileUri = audioUri;
      const fileName = fileUri.split("/").pop();
      const fileType = "audio/m4a";

      const formData = new FormData();
      formData.append("files", {
        uri: fileUri,
        name: fileName,
        type: fileType,
      });

      // return

      const response = await axios.post(
        "https://fs.nicnepal.org/files/suraki/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            key: "8623a0c8244bcdd6dd7ab48c8cef6c8546a38367839f0d00183c298bbfbc89d6",
          },
        },
      );

      let audioUrl = response?.data?.url[0];
      await storeAudioUrl(audioUri);
      setAudioUri(audioUrl);
      // Show success snackbar
      showSuccessSnackbar(
        "अडियो सफलतापूर्वक अपलोड भयो! (Audio upload successfully)",
      );
      setTimeout(() => {
        router.push({
          pathname: "./(tabs)",
          params: { audioUrl: audioUrl },
        });
      }, 3000);
      // Alert.alert("Response", "Audio uploaded successfully.");

      // if (response?.data?.url[0]) {
      //   let data = qs.stringify({
      //     image_video: searchParams.imageUrl,
      //     gps_location: "string",
      //     any_user: "string",
      //     voice: response?.data?.url[0],
      //     incident_type: "animal",
      //     location: "Achham",
      //     is_acknowledged: true,
      //   });
      //   var finalResponse = await (await request())
      //     .post(Api.SendReport, data)
      //     .catch(function (error) {
      //       Alert.alert("Error Ocurred Contact Support");
      //     });
      //   if (finalResponse.data?.Code == 200) {
      //     Alert.alert(finalResponse?.data?.Message);
      //   } else {
      //     Alert.alert(finalResponse.data?.Message);
      //   }
      //   // Navigate to the 'reportTab' and pass audio URL as a parameter
      //   router.push({
      //     pathname: "./(tabs)", // Change this to the correct tab path
      //     params: { audioUrl: fileUri },
      //   });
      //   r;
      // } else {
      //   Alert.alert("Error Ocurred Contact Support");
      // }
    } catch (err) {
      console.error("Failed to upload audio:", err);
    }
  };

  // Fetch the stored audio URI from AsyncStorage when the screen loads
  const storeAudioUrl = async () => {
    try {
      await AsyncStorage.setItem("audioUri", audioUri);
    } catch (error) {
      console.error("Error saving audio URL to local storage:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <MaterialIcons name="mic" size={24} color={colors.primary2} />
          <Text style={styles.headerTitle}>अडियो रेकर्डर (Audio Recorder)</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.actionsContainer}>
          {recording ? (
            <TouchableOpacity
              style={styles.recordButton}
              onPress={stopRecording}
            >
              <MaterialIcons name="stop" size={32} color={colors.white} />
              <Text style={styles.recordButtonText}>रेकर्ड रोक्नुहोस</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.recordActionButton]}
                onPress={startRecording}
                disabled={isPlaying}
              >
                <MaterialIcons name="mic" size={24} color={colors.white} />
                <Text style={styles.actionButtonText}>रेकर्ड गर्नुहोस</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.playActionButton,
                  !audioUri && styles.disabledButton,
                ]}
                onPress={playAudio}
                disabled={!audioUri}
              >
                <MaterialIcons
                  name={isPlaying ? "pause" : "play-arrow"}
                  size={24}
                  color={colors.white}
                />
                <Text style={styles.actionButtonText}>
                  {isPlaying ? "रोक्नुहोस" : "बजाउनुहोस"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Upload button */}
        {audioUri && !recording && (
          <TouchableOpacity
            style={[
              styles.uploadButton,
              uploading && styles.uploadingButton,
              uploadSuccess && styles.uploadSuccessButton,
            ]}
            onPress={uploadAudio}
            disabled={uploading || uploadSuccess}
          >
            {uploading ? (
              <Text style={styles.uploadButtonText}>
                <MaterialIcons
                  name="hourglass-top"
                  size={18}
                  color={colors.white}
                />{" "}
                अपलोड हुँदैछ... (Uploading...)
              </Text>
            ) : uploadSuccess ? (
              <Text style={styles.uploadButtonText}>
                <MaterialIcons
                  name="check-circle"
                  size={18}
                  color={colors.white}
                />{" "}
                अपलोड सफल भयो (Upload Success)
              </Text>
            ) : (
              <Text style={styles.uploadButtonText}>
                <MaterialIcons
                  name="cloud-upload"
                  size={18}
                  color={colors.white}
                />{" "}
                अडियो पठाउनुहोस (Upload Audio)
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Success Snackbar */}
        {showSnackbar && (
          <Animated.View
            style={[
              styles.snackbar,
              {
                transform: [{ translateY: snackbarAnim }],
              },
            ]}
          >
            <MaterialIcons name="check-circle" size={20} color={colors.white} />
            <Text style={styles.snackbarText}>
              अडियो सफलतापूर्वक अपलोड भयो!
            </Text>
          </Animated.View>
        )}
        {/* <Text style={styles.previewText}>Audio Recorder</Text> */}

        {/* <View style={styles.buttonsContainer}>
          {recording ? (
            <TouchableOpacity
              style={[styles.button, styles.stopButton]} // Apply custom styles
              onPress={stopRecording}
            >
              <Text style={styles.buttonText}>
                रेकर्ड रोक्नुहोस (Stop Recording)
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.startButton]} // Apply custom styles
              onPress={startRecording}
            >
              <Text style={styles.buttonText}>
                रेकर्ड सुरु गर्नुहोस (Start Recording)
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {audioUri && <Text>रेकर्ड गरिएको (Recorded Audio) {audioUri}</Text>} */}

        {/* <View style={styles.buttonsContainer}>
        <Button
          title={isPlaying ? "Playing..." : "Play Audio"}
          onPress={playAudio}
          disabled={isPlaying || !audioUri}
        />
      </View> */}
        {/* <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              audioUri
                ? isPlaying
                  ? styles.startButton
                  : styles.stopButton
                : styles.disableButton,
              //  isPlaying ? styles.stopButton : styles.startButton,
            ]}
            onPress={playAudio}
            disabled={!audioUri}
          >
            <Text style={styles.buttonText}>
              {isPlaying ? "Playing..." : "अडियो बजाउनुहोस (Play Audio)"}
            </Text>
          </TouchableOpacity>
        </View> */}

        {/* <View style={styles.buttonsContainer}>
        <Button
          title="Upload Audio"
          onPress={uploadAudio}
          disabled={!audioUri}
        />
      </View> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.bgColor,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.textColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary2,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.bgColor,
    marginBottom: 20,
  },
  actionsContainer: {
    marginBottom: 16,
  },
  recordButton: {
    backgroundColor: colors.redColor,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  recordButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  recordActionButton: {
    backgroundColor: colors.primary2,
  },
  playActionButton: {
    backgroundColor: colors.primary3,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: colors.textColor + "40",
  },
  uploadButton: {
    backgroundColor: colors.yellowColor,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  uploadingButton: {
    backgroundColor: colors.textColor,
  },
  uploadSuccessButton: {
    backgroundColor: colors.primary3,
  },
  uploadButtonText: {
    color: colors.white,
    fontSize: 16,
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
    shadowColor: colors.textColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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

// const sssstyles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f0f0f0",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//   },
//   buttonsContainer: {
//     marginVertical: 10,
//     width: "100%",
//     borderRadius: 8,
//     fontSize: "bold",
//   },
//   button: {
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   startButton: {
//     backgroundColor: colors.primary3,
//   },
//   stopButton: {
//     backgroundColor: colors.redColor,
//   },
//   previewText: {
//     fontSize: 16,
//     marginBottom: 10,
//     fontWeight: "bold",
//     color: colors.primary2,
//   },
//   stopButton: {
//     backgroundColor: colors.redColor,
//     color: colors.white,
//   },
//   disableButton: {
//     backgroundColor: colors.textColor,
//     color: colors.white,
//   },
// });
