import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Audio } from "expo-av";
import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "@/utils/colors";

interface Props {
  onAudioUploaded?: (url: string) => void;
  storedAudio: string | null;
}

type State = "idle" | "recording" | "recorded" | "uploading" | "uploaded";

export default function AudioRecorder({ onAudioUploaded, storedAudio }: Props) {
  const [state, setState] = useState<State>("idle");
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const formatDuration = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") return;
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      await rec.startAsync();
      recordingRef.current = rec;
      setRecordingDuration(0);
      setState("recording");
      timerRef.current = setInterval(
        () => setRecordingDuration((d) => d + 1),
        1000,
      );
    } catch (err) {
      console.error(err);
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;
    try {
      clearInterval(timerRef.current!);
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setAudioUri(uri);
      setState("recorded");
    } catch (err) {
      console.error(err);
    }
  };

  const playAudio = async () => {
    if (!audioUri) return;
    try {
      if (sound) await sound.unloadAsync();
      const { sound: s } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true },
      );
      setSound(s);
      setIsPlaying(true);
      s.setOnPlaybackStatusUpdate((status) => {
        if (!status.isPlaying) setIsPlaying(false);
      });
    } catch (err) {
      console.error(err);
    }
  };

  const uploadAudio = async () => {
    if (!audioUri) return;
    try {
      setState("uploading");
      const fileName = audioUri.split("/").pop();
      const formData = new FormData();
      formData.append("files", {
        uri: audioUri,
        name: fileName,
        type: "audio/m4a",
      } as any);
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
      const audioUrl = response?.data?.url[0];
      await AsyncStorage.setItem("audioUri", audioUrl);
      onAudioUploaded?.(audioUrl);
      setState("uploaded");
    } catch (err) {
      console.error(err);
      setState("recorded");
    }
  };

  const reset = () => {
    setAudioUri(null);
    setIsPlaying(false);
    setRecordingDuration(0);
    setState("idle");
  };

useEffect(() => {
    if (!storedAudio) {
      setAudioUri(null);
      setIsPlaying(false);
      setRecordingDuration(0);
      setState("idle");
    } else {
      setState("uploaded"); // already uploaded, show success state
    }
  }, [storedAudio]);
  
  useEffect(() => () => clearInterval(timerRef.current!), []);

  const renderContent = () => {
    switch (state) {
      case "idle":
        return (
          <TouchableOpacity style={styles.mediaCard} onPress={startRecording}>
            <View style={styles.mediaCardContent}>
              <View style={styles.iconContainer}>
                <FontAwesome
                  name="microphone"
                  size={28}
                  color={colors.primary3}
                />
              </View>
              <View style={styles.mediaTextContainer}>
                <Text style={styles.mediaTitle}>अडियो रेकर्ड गर्नुहोस्</Text>
                <Text style={styles.mediaSubtitle}>Record Audio</Text>
              </View>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={colors.primary4}
            />
          </TouchableOpacity>
        );

      case "recording":
        return (
          <TouchableOpacity
            style={[styles.mediaCard]}
            onPress={stopRecording}
          >
            <View style={styles.mediaCardContent}>
              <View style={[styles.iconContainer, styles.recordingIcon]}>
                <MaterialIcons name="stop" size={28} color={colors.redColor} />
              </View>
              <View style={styles.mediaTextContainer}>
                <Text style={[styles.mediaTitle, { color: colors.redColor }]}>
                  रेकर्डिङ...
                </Text>
                <Text style={styles.mediaSubtitle}>
                  {formatDuration(recordingDuration)} · Tap to stop
                </Text>
              </View>
            </View>
            <View style={styles.liveDot} />
          </TouchableOpacity>
        );

      case "recorded":
        return (
          <View style={styles.mediaCard}>
            <View style={styles.mediaCardContent}>
              <View style={styles.iconContainer}>
                <FontAwesome
                  name="microphone"
                  size={28}
                  color={colors.primary3}
                />
              </View>
              <View style={styles.mediaTextContainer}>
                <Text style={styles.mediaTitle}>
                  {formatDuration(recordingDuration)} recorded
                </Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.chip}
                    onPress={playAudio}
                    disabled={isPlaying}
                  >
                    <MaterialIcons
                      name={isPlaying ? "pause" : "play-arrow"}
                      size={14}
                      color={colors.primary2}
                    />
                    <Text style={styles.chipText}>
                      {isPlaying ? "Playing" : "Play"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.chip} onPress={startRecording}>
                    <MaterialIcons
                      name="refresh"
                      size={14}
                      color={colors.primary2}
                    />
                    <Text style={styles.chipText}>Re-record</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.uploadChip} onPress={uploadAudio}>
              <MaterialIcons
                name="cloud-upload"
                size={16}
                color={colors.white}
              />
              <Text
                style={{
                  fontSize: 14,
                  color: colors.white,
                  fontWeight: "600",
                  marginLeft: 10,
                }}
              >
                Upload
              </Text>
            </TouchableOpacity>
          </View>
        );

      case "uploading":
        return (
          <View style={styles.mediaCard}>
            <View style={styles.mediaCardContent}>
              <View style={styles.iconContainer}>
                <MaterialIcons
                  name="hourglass-top"
                  size={28}
                  color={colors.primary3}
                />
              </View>
              <View style={styles.mediaTextContainer}>
                <Text style={styles.mediaTitle}>अपलोड हुँदैछ...</Text>
                <Text style={styles.mediaSubtitle}>Uploading audio</Text>
              </View>
            </View>
          </View>
        );

      case "uploaded":
        return (
          <View style={styles.mediaCard}>
            <View style={styles.mediaCardContent}>
              <View style={styles.iconContainer}>
                <FontAwesome
                  name="microphone"
                  size={28}
                  color={colors.primary3}
                />
              </View>
              <View style={styles.mediaTextContainer}>
                <Text style={styles.mediaTitle}>अडियो रेकर्ड गर्नुहोस्</Text>
                <View style={styles.successContainer}>
                  <MaterialIcons
                    name="check-circle"
                    size={16}
                    color={colors.primary3}
                  />
                  <Text style={styles.successText}>
                    Audio uploaded successfully
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={reset}>
              <MaterialIcons name="refresh" size={20} color={colors.primary4} />
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.cardLabel}>अडियो (Audio)</Text>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: { marginBottom: 20 },
  cardLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary2,
    marginBottom: 8,
  },
  mediaCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: colors.textColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  // recordingCard: {
  //   borderWidth: 1.5,
  //   borderColor: colors.redColor + "40",
  //   backgroundColor: colors.redColor + "10",
  // },
  mediaCardContent: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary3 + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  recordingIcon: { backgroundColor: colors.redColor + "15" },
  mediaTextContainer: { flex: 1 },
  mediaTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.primary2,
    marginBottom: 4,
  },
  mediaSubtitle: { fontSize: 12, color: colors.textColor + "80" },
  successContainer: { flexDirection: "row", alignItems: "center" },
  successText: {
    fontSize: 12,
    color: colors.primary3,
    marginLeft: 4,
    fontWeight: "500",
  },
  actionButtons: { flexDirection: "row", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.primary2 + "15",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  chipText: { fontSize: 11, fontWeight: "600", color: colors.primary2 },
  uploadChip: {
  backgroundColor: colors.primary2,
  borderRadius: 20,
  paddingHorizontal: 12,
  paddingVertical: 8,
  flexDirection: "row",
  alignItems: "center",
},
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.redColor,
  },
});
