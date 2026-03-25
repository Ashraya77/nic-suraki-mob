import { colors } from "@/utils/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MediaUploadCard } from "@/components/home/MediaUploadCard";
import { IncidentDropdown } from "@/components/home/IncidentDropdown";
import { Disclaimer } from "@/components/home/Disclaimer";
import { useHomeScreen } from "@/hooks/useHomeScreen";
import AudioRecorder from "@/components/custom/AudioRecorderScreen";

export default function Index() {
  const { imageUrl, audioUrl } = useLocalSearchParams<{
    imageUrl: string;
    audioUrl: string;
  }>();
  const router = useRouter();

  const {
    description,
    incidentType,
    storedImageUrl,
    storedAudio,
    loading,
    setDescription,
    setIncidentType,
    resetForm,
    handleSubmit,
  } = useHomeScreen(imageUrl, audioUrl);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>घटना रिपोर्ट · Incident Report</Text>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        >
          <MediaUploadCard
            title="फोटो/भिडियो (Photo/Video)"
            subtitle="फोटो तथा भिडियो खिच्नुहोस (Upload photo/video)"
            icon={
              <MaterialIcons
                name="add-a-photo"
                size={28}
                color={colors.primary3}
              />
            }
            onPress={() => router.push("/camera")}
            isUploaded={storedImageUrl}
            uploadedText="Image uploaded successfully"
          />

          {/* <MediaUploadCard
          title="अडियो (Audio)"
          subtitle="अडियो रेकर्ड गर्नुहोस (Record Audio)"
          icon={
            <FontAwesome name="microphone" size={28} color={colors.primary3} />
          }
          onPress={() => router.push("/audio")}
          isUploaded={storedAudio}
          uploadedText="Audio recorded successfully"
        /> */}
          <AudioRecorder storedAudio={storedAudio} />

          <View style={styles.cardContainer}>
            <Text style={styles.cardLabel}>विवरण (Description)</Text>
            <View style={styles.inputCard}>
              <TextInput
                style={styles.descriptionInput}
                placeholder="छोटोमा घटनाको विवरण लेख्नुहोस (Write a short description....)"
                value={description}
                placeholderTextColor={colors.textColor + "80"}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          <IncidentDropdown value={incidentType} onChange={setIncidentType} />

          <Disclaimer />
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
          <Text style={styles.cancelButtonText}>रद्द गर्नुहोस्</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.white} />
              <Text style={styles.submitButtonText}>पठाउँदै...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>पठाउनुहोस्</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgColor },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgColor,
    shadowColor: colors.textColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary2,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textColor,
    textAlign: "center",
    marginTop: 2,
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  cardContainer: { marginBottom: 20 },
  cardLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary2,
    marginBottom: 8,
  },
  inputCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    shadowColor: colors.textColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  descriptionInput: {
    height: 120,
    padding: 16,
    fontSize: 16,
    color: colors.textColor,
    textAlignVertical: "top",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: colors.textColor,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.redColor,
    borderRadius: 12,
    paddingVertical: 11,
    marginRight: 8,
    alignItems: "center",
  },
  cancelButtonText: { fontSize: 13, fontWeight: "600", color: colors.white },
  submitButton: {
    flex: 1,
    backgroundColor: colors.primary2,
    borderRadius: 12,
    paddingVertical: 11,
    marginLeft: 30,
    alignItems: "center",
  },
  submitButtonDisabled: { backgroundColor: colors.textColor + "80" },
  submitButtonText: { fontSize: 13, fontWeight: "600", color: colors.white },
  loadingContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
});
