import React from "react";
import { ScrollView, StatusBar, TouchableOpacity, StyleSheet, Text, View, SafeAreaView} from "react-native";

import questionsMath from "../data/questionsMath";
import westernsQuestions from "../data/westerns";
import questions from "../data/questions";

import { RowItem } from "../components/RowItem";
import { white, bold } from "ansi-colors";

const QuizIndex = ({ navigation }) => {
  return(
    <>
      <ScrollView>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.container}>
          <View style={styles.containerItem}>
            <TouchableOpacity
              style={[styles.button, styles.buttonKnowledge]}
              onPress={() =>
                navigation.navigate("Quiz", {
                  title: "Conhecimentos gerais",
                  questions,
                  color: "#765D69"
                  })
                }>
              <Text style={styles.textButton}>Conhecimento Gerais</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonMath]}
              onPress={() =>
                navigation.navigate("Quiz", {
                  title: "Matématica",
                  questions: questionsMath,
                  color: "#F26627"
                })
              }>
              <Text style={styles.textButton}>Matemática</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.containerItem}>
            <TouchableOpacity
              style={[styles.button, styles.buttonRecognize]}
              onPress={() =>
                navigation.navigate("Recognize", {
                  title: "Reconhecimento de letras",
                  color: "#066"
                })
              }>
              <Text style={styles.textButton}>Reconhecimento de letras</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonConnection]}
              onPress={() =>
                navigation.navigate("Connection", {
                  title: "Conexão",
                  color: "#325D79"
                })
              }>
              <Text style={styles.textButton}>Conexão</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#EFEEEE",
    padding: 60,
    marginTop: 10,
    marginRight: 10,
    marginLeft: 10,
  },
  buttonMath: {
    backgroundColor: "#F26627",
  },
  buttonRecognize: {
    backgroundColor: "#066",
  },
  buttonConnection: {
    backgroundColor: "#325D79",
  },
  buttonKnowledge: {
    backgroundColor: "#765D69",
  },
  textButton: {
    color: '#fff',
    fontWeight: 'bold',
    flexWrap: 'wrap'
  },
  containerItem: {
    //flexDirection: 'row',
  }
});

export default QuizIndex;