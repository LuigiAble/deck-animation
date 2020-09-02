import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, View } from "react-native";
import Deck from "./components/Deck";

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Deck />
    </View>
  );
}

console.disableYellowBox = true;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 50,
  },
});
