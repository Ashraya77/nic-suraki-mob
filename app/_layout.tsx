import { colors } from "@/utils/colors";
import { Stack } from "expo-router";
import ErrorBoundary from "./ErrorBoundary";

const headerOptions = {
  headerShown: false,
  headerTitleStyle: {
    color: colors.white,
    fontFamily: "Medium",
  },
  headerTintColor: colors.white,
  headerStyle: {
    backgroundColor: colors.primary4,
  },
};

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary4,
          },
          headerTitleAlign: "center",
          headerTintColor: colors.white,
          headerTitleStyle: {
            fontWeight: "bold",
            fontFamily: "Bold",
            fontSize: 12,
          },
          headerShown: true,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ ...headerOptions, title: "Home" }}
        />
        <Stack.Screen
          name="camera"
          options={{ ...headerOptions, headerShown: true, title: "Camera" }}
        />
        <Stack.Screen
          name="videoCamera"
          options={{ ...headerOptions, headerShown: true, title: "Video" }}
        />
        <Stack.Screen
          name="audio"
          options={{
            ...headerOptions,
            title: "Record Audio",
            headerShown: true,
          }}
        />
      </Stack>
    </ErrorBoundary>
  );
}
