import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ marginBottom: 10 }}>An unexpected error occurred:</Text>
      <Text style={{ color: "gray", fontSize: 12 }}>{error?.message}</Text>
      <TouchableOpacity onPress={resetErrorBoundary}>
        <Text style={{ marginTop: 10, color: "blue" }}>Restart App</Text>
      </TouchableOpacity>
    </View>
  );
};

const ErrorBoundary = ({ children }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // reset state here if needed
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;