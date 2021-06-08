import React from "react";
import { ScrollView, StatusBar, TouchableOpacity, StyleSheet, Text, View, SafeAreaView} from "react-native";

import questionsMath from "../data/questionsMath";
import questions from "../data/questions";

import { RowItem } from "../components/RowItem";
import { white, bold } from "ansi-colors";

import {ProductImageShort, DescriptionShort, TitleShort} from './styles';

const QuizIndex = ({ navigation }) => {
  return(
    <>
      <ScrollView style={{backgroundColor: 'rgb(25, 68, 104)'}}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.container}>
   
          <View style={styles.containerItem}>
            <TouchableOpacity
              style={[styles.button, styles.buttonKnowledge]}
              onPress={() =>
                navigation.navigate("Quiz", {
                  title: "Conhecimentos gerais",
                  questions,
                  color: "#765D69",
                  recognize: "recognizeLetter",
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
                  recognize: "recognizeNumber",
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
                  recognize: "recognizeLetter",
                  color: "#066"
                })
              }>
              <Text style={styles.textButton}>Reconhecimento de letras</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonRecognize]}
              onPress={() =>
                navigation.navigate("Recognize", {
                  title: "Reconhecimento de números",
                  recognize: "recognizeNumber",
                  color: "#066"
                })
              }>
              <Text style={styles.textButton}>Reconhecimento de números</Text>
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
    backgroundColor: 'rgb(25, 68, 104)'
  },
  button: {
    alignItems: "center",
    backgroundColor: "#EFEEEE",
    padding: 60,
    marginTop: 20,
    marginRight: 10,
    marginLeft: 10,
  },
  buttonMath: {
    backgroundColor: "#F26627",
    marginTop: 5,
  },
  buttonRecognize: {
    backgroundColor: "#066",
    marginTop: 5,
  },
  buttonConnection: {
    backgroundColor: "#325D79",
    marginTop: 5,
  },
  buttonKnowledge: {
    backgroundColor: "#765D69",
    marginTop: 30,
  },
  textButton: {
    color: '#fff',
    fontWeight: 'bold',
    flexWrap: 'wrap',
  },
  containerItem: {
    //flexDirection: 'row',
  }
});

export default QuizIndex;