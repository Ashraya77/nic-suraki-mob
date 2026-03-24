import { colors } from "@/utils/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export const Disclaimer = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded((prev) => !prev)}
        activeOpacity={0.7}
      >
        <MaterialIcons name="info-outline" size={20} color={colors.primary4} />
        <Text style={styles.title}>अस्वीकरण (Disclaimer)</Text>
        <MaterialIcons
          name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={20}
          color={colors.primary4}
          style={styles.chevron}
        />
      </TouchableOpacity>

      {expanded && (
        <>
          <Text style={styles.text}>
            यस एपले कुनै पनि व्यक्तिगत रूपमा चिनिन सकिने जानकारी सङ्कलन वा साझा
            गर्दैन। सबै रिपोर्टहरू प्रयोगकर्ताको इनपुटमा आधारित हुन्छन् र
            तिनीहरूको सत्यता प्रमाणित गरिएको नहुन सक्छ।
          </Text>
          <Text style={styles.textEn}>
            This app does not collect or share any personally identifiable
            information. All reports are based solely on user input and may not be verified.
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    shadowColor: colors.textColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary2,
    marginLeft: 8,
    flex: 1,
  },
  chevron: {
    marginLeft: "auto",
  },
  text: {
    fontSize: 14,
    color: colors.textColor,
    lineHeight: 20,
    marginBottom: 8,
    marginTop: 8,
  },
  textEn: {
    fontSize: 13,
    color: colors.textColor + "CC",
    lineHeight: 18,
    fontStyle: "italic",
  },
});