import React from "react";
import { Text, type TextProps, StyleSheet } from "react-native";

type ThemedTextType = "default" | "title" | "link";

type ThemedTextProps = TextProps & {
  type?: ThemedTextType;
};

export function ThemedText({ type = "default", style, ...rest }: ThemedTextProps) {
  return <Text style={[styles[type], style]} {...rest} />;
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    color: "#11181C",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#11181C",
  },
  link: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0A7EA4",
  },
});
