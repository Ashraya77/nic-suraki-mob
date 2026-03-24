import { colors } from "@/utils/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";

interface MediaUploadCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onPress: () => void;
  isUploaded: string | null;
  uploadedText: string;
}

export const MediaUploadCard = ({
  title,
  subtitle,
  icon,
  onPress,
  isUploaded,
  uploadedText,
}: MediaUploadCardProps) => (
  <View style={styles.cardContainer}>
    <Text style={styles.cardLabel}>{title}</Text>
    <TouchableOpacity onPress={onPress} style={styles.mediaCard}>
      <View style={styles.mediaCardContent}>
        <View style={styles.iconContainer}>{icon}</View>
        <View style={styles.mediaTextContainer}>
          <Text style={styles.mediaTitle}>{subtitle}</Text>
          {isUploaded && (
            <View style={styles.successContainer}>
              <MaterialIcons name="check-circle" size={16} color={colors.primary3} />
              <Text style={styles.successText}>{uploadedText}</Text>
            </View>
          )}
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={colors.primary4} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  cardContainer: { marginBottom: 20 },
  cardLabel: { fontSize: 16, fontWeight: "600", color: colors.primary2, marginBottom: 8 },
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
  mediaTextContainer: { flex: 1 },
  mediaTitle: { fontSize: 16, fontWeight: "500", color: colors.primary2, marginBottom: 4 },
  successContainer: { flexDirection: "row", alignItems: "center" },
  successText: { fontSize: 12, color: colors.primary3, marginLeft: 4, fontWeight: "500" },
});