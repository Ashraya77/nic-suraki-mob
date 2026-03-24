import { colors } from "@/utils/colors";
import DropDownPicker from "react-native-dropdown-picker";
import { useState } from "react";
import { Text, StyleSheet, View } from "react-native";

interface IncidentDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export const IncidentDropdown = ({ value, onChange }: IncidentDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: "Trade", value: "trade" },
    { label: "Rescue", value: "rescue" },
    { label: "Other", value: "other" },
  ]);

  return (
    <View style={{ zIndex: 1000 }}>
      <Text style={styles.cardLabel}>घटनाको प्रकार (Incident type)</Text>
      <DropDownPicker
        open={open}
        setOpen={setOpen}
        value={value}
        items={items}
        setItems={setItems}
        setValue={(callback) => {
          const newValue = typeof callback === "function" ? callback(value) : callback;
          onChange(newValue);
        }}
        containerStyle={{ height: 50 }}
        style={styles.dropdown}
        labelStyle={styles.dropdownLabel}
        dropDownContainerStyle={styles.dropdownContainer}
        placeholder="Select Incident Type"
        listMode="SCROLLVIEW"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardLabel: { fontSize: 16, fontWeight: "600", color: colors.primary2, marginBottom: 8 },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderColor: "#fff",
    borderWidth: 0,
    shadowColor: colors.textColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  dropdownLabel: {
    fontFamily: "Medium",
    color: "#9A9A9A",
  },
  dropdownContainer: {
    backgroundColor: "#fff",
    borderColor: "#f0f0f0",
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: colors.textColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
});