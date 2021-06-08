import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, StatusBar, Text, SafeAreaView,PermissionsAndroid,  
         NativeModules,
         Platform,
         NativeEventEmitter } from "react-native";

import { Button, ButtonContainer } from "../components/Button";
import { Alert } from "../components/Alert";

// import and setup react-native-ble-manager
import BleManager from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleEmitter = new NativeEventEmitter(BleManagerModule);

// import stringToBytes from convert-string package.
// this func is useful for making string-to-bytes conversion easier
import { stringToBytes } from 'convert-string';
const Buffer = require('buffer/').Buffer;

const Quiz = ({navigation}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [list, setList] = useState([]);
  const peripherals = new Map();
  const [testMode, setTestMode] = useState('notify');
  const [letter, setLetter] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [answerCorrect, setAnswerCorrect] = useState(false);
  const [controlNextQuestions, setcontrolNextQuestions] = useState(false);
  const [totalCount, setTotalCount] = useState(navigation.state.params.questions.length);
  const [numberRecognize, setNumber] = useState("");

  let isFirst = true;
  let isSendCommand = false;
  let isConnect = false;

  let recognize = "recognizeLetter";
  let numberRecognizeOffState = "";
  let count = 0;

  // handle discovered peripheral
  const handleDiscoverPeripheral = (peripheral) => {
      console.log('Got ble peripheral', peripheral);

      if (!peripheral.name) {
        peripheral.name = 'NO NAME';
      }
  
      if(!isConnect){
          connectAndTestPeripheral(peripheral);
          isConnect = true;
      }

      peripherals.set(peripheral.id, peripheral);
      setList(Array.from(peripherals.values()));
  };

  // handle stop scan event
  const handleStopScan = (err) => {
      console.log('Scan is stopped');

      setIsScanning(false);
  };

  // handle disconnected peripheral
  const handleDisconnectedPeripheral = (data) => {
      let peripheral = peripherals.get(data.peripheral);
      if (peripheral) {
        peripheral.connected = false;
        peripherals.set(peripheral.id, peripheral);
        setList(Array.from(peripherals.values()));
      }
  };

  // handle update value for characteristic
  const handleUpdateValueForCharacteristic = (data) => {
      const buffer = Buffer.from(data.value);
      const value = buffer.toString();
       
      setLetter(String(value));
      
      if(recognize === "recognizeLetter"){
        console.log(questions[count])
        if(String(value)[0] == 'A'){
          answer(questions[count].answers[0].correct);
        } 
  
        if(String(value)[0] == 'B'){
          answer(questions[count].answers[1].correct);
        } 
  
        if(String(value)[0] == 'C'){
          answer(questions[count].answers[2].correct);
        } 
  
        if(String(value)[0] == 'D'){
          answer(questions[count].answers[3].correct);
        } 
      }else{
        setNumber(number => {
          numberRecognizeOffState = number + String(value)[0];
          return numberRecognizeOffState;
        });
        
        if(Number(numberRecognizeOffState) == Number(questions[count].answers[0].text)){
          answer(true);
        }else if(Number(numberRecognizeOffState) > Number(questions[count].answers[0].text)){
          answer(false);
        }
      }

      if(!isSendCommand){
      
          const payload = recognize;
          const payloadBytes = stringToBytes(payload);
          
          BleManager.write(data.peripheral, data.service, data.characteristic, payloadBytes)
              .then((res) => {
                  console.log('Solicitado reconhecimento');
              })
              .catch((error) => {
                  console.log('Error:', error);
          });

          isSendCommand = true;
      }
      
  };

  // retrieve connected peripherals.
  // not currenly used
  const retrieveConnectedPeripheral = () => {
      BleManager.getConnectedPeripherals([]).then((results) => {
      peripherals.clear();
      setList(Array.from(peripherals.values()));

      if (results.length === 0) {
          console.log('No connected peripherals');
      }

      for (var i = 0; i < results.length; i++) {
          var peripheral = results[i];
          peripheral.connected = true;
          peripherals.set(peripheral.id, peripheral);
          setList(Array.from(peripherals.values()));
      }
      });
  };

  // update stored peripherals
  const updatePeripheral = (peripheral, callback) => {
      let p = peripherals.get(peripheral.id);
      if (!p) {
      return;
      }

      p = callback(p);
      peripherals.set(peripheral.id, p);
      setList(Array.from(peripherals.values()));
  };

  // get advertised peripheral local name (if exists). default to peripheral name
  const getPeripheralName = (item) => {
      if (item.advertising) {
      if (item.advertising.localName) {
          return item.advertising.localName;
      }
      }

      return item.name;
  };

  // connect to peripheral then test the communication
  const connectAndTestPeripheral = (peripheral) => {
      console.log(peripheral)
      if (!peripheral) {
      return;
      }

      if (peripheral.connected) {
      BleManager.disconnect(peripheral.id);
      return;
      }

      // connect to selected peripheral
      BleManager.connect(peripheral.id)
      .then(() => {
          console.log('Connected to ' + peripheral.id, peripheral);

          // update connected attribute
          updatePeripheral(peripheral, (p) => {
          p.connected = true;
          return p;
          });

          // retrieve peripheral services info
          BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
          console.log('Retrieved peripheral services', peripheralInfo);

          // test read current peripheral RSSI value
          BleManager.readRSSI(peripheral.id).then((rssi) => {
              console.log('Retrieved actual RSSI value', rssi);

              // update rssi value
              updatePeripheral(peripheral, (p) => {
              p.rssi = rssi;
              return p;
              });
          });

          // test read and write data to peripheral
          const serviceUUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
          const charasteristicUUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

          switch (testMode) {
              case 'write':
                  const payload = 'recognizeLetter';
                  const payloadBytes = stringToBytes(payload);

                  BleManager.write(peripheral.id, serviceUUID, charasteristicUUID, payloadBytes)
                      .then((res) => {
                          console.log('Solicitado reconhecimento de letras');
                      })
                      .catch((error) => {
                          console.log('Error:', error);
                      });
              break;
              //LEITURA DAS LETRAS
              case 'read':
              BleManager.read(peripheral.id, serviceUUID, charasteristicUUID)
                  .then((res) => {
                  console.log('read response', res);
                  if (res) {
                      const buffer = Buffer.from(res);
                      const data = buffer.toString();
                      console.log('data', data);
                      alert(`you have stored food "${data}"`);
                  }
                  })
                  .catch((error) => {
                  console.log('read err', error);
                  alert(error);
                  });
              break;

              case 'notify':
                  // ===== test subscribe notification
                  BleManager.startNotification(peripheral.id, serviceUUID, charasteristicUUID)
                      .then((res) => {
                      console.log('start notification response', res);
                      })
                      .catch((err) => {
                      console.log(err);
                  });
              break;

              default:
              break;
          }
          });
      })
      .catch((error) => {
          console.log('Connection error', error);
      });
  };

  useEffect(() => {        
    // initialize BLE modules
    BleManager.start({ showAlert: false });
    recognize = navigation.state.params.recognize;
  
    // add ble listeners on mount
    bleEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
    bleEmitter.addListener('BleManagerStopScan', handleStopScan);
    bleEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
    bleEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);

    // check location permission only for android device
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((r1) => {
          if (r1) {
          console.log('Permissão OK');
          return;
          }

          PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((r2) => {
          if (r2) {
              console.log('User aceiro');
              return
          }

          console.log('User não aceito');
          });
      });
    }
      
    // remove ble listeners on unmount
    return () => {
        bleEmitter.removeListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
        bleEmitter.removeListener('BleManagerStopScan', handleStopScan);
        bleEmitter.removeListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
        bleEmitter.removeListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);
        //clearInterval(letterInterval);
    };
  }, []);

  useEffect(() => {
    if(controlNextQuestions){
      setTimeout(() => {
        nextQuestion();   
      }, 785);
    }
  }, [answerCorrect, controlNextQuestions]); 

  const answer = correct => {
    setNumber(number => {
      numberRecognizeOffState = "";
      return numberRecognizeOffState;
    });

    setAnswered(true);
    
    if(correct){
      setCorrectCount(count => count + 1);
      count += 1;
      setAnswerCorrect(true);
      setcontrolNextQuestions(true);
    }else{
      setInterval(() => {
        setAnswerCorrect(false);
        setAnswered(false);
      }, 755);
      
    }
  };

  const nextQuestion = () => {
    const nextIndex = activeQuestionIndex + 1;
    console.log(nextIndex);
    if (nextIndex >= totalCount) {
      return navigation.navigate('QuizIndex');
    }

    setActiveQuestionIndex(nextIndex);
    setAnswered(false); 
    setcontrolNextQuestions(false);
    // this.setState(state => {
    //   const nextIndex = state.activeQuestionIndex + 1;

    //   if (nextIndex >= state.totalCount) {
    //     return this.props.navigation.popToTop();
    //   }

    //   return {
    //     activeQuestionIndex: nextIndex,
    //     answered: false
    //   };
    // });
  };
  
  const questions =  navigation.state.params.questions;
  const question = questions[activeQuestionIndex];

  let textInfo;
  if (recognize = "recognizeLetter") {
    textInfo = <Text style={styles.info}>Resolva a equação realizando os gestos através da luva: </Text>;
  } else {
    textInfo = <Text style={styles.info}>Responda as questões realizando os gestos referente a letra correta: </Text>;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: navigation.getParam("color") }
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor={navigation.getParam("color")}/>
      {textInfo}
      <SafeAreaView style={styles.safearea}>
        <View>
          <Text style={styles.text}>{question.question}</Text>
          {
              question.answers.map(answerItem => (
                !question.visible &&
                <Text style={styles.textMath}>
                  {numberRecognize}
                </Text>
            ))}
          <ButtonContainer>
            {
              question.answers.map(answerItem => (
                question.visible &&
                <Button
                  key={answerItem.id}
                  text={answerItem.text}
                  onPress={() => {answer(answerItem.correct)}}
                  testID={answerItem.id}
                  visible={false}
                />
            ))}
            
          </ButtonContainer>
          <Text style={{
            marginTop: 80,
            textAlign: 'center',
            fontSize: 80,
            color: '#fff',
            fontWeight: 'bold'
          }}></Text>
        </View>
        
        <Text style={styles.text}>
          {`${correctCount}/${totalCount}`}
        </Text>
      </SafeAreaView>
      <Alert
        correct={answerCorrect}
        visible={answered}
      />
    </View>
  );
}

export default Quiz;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#36B1F0",
    flex: 1,
    paddingHorizontal: 20,
  },
  text: {
    color: "#fff",
    fontSize: 25,
    textAlign: "center",
    letterSpacing: -0.02,
    fontWeight: "bold"
  },
  textMath: {
    color: "#fff",
    marginTop: 80,
    fontSize: 40,
    textAlign: "center",
    letterSpacing: -0.02,
    fontWeight: "bold"
  },
  safearea: {
    flex: 1,
    marginTop: 100,
    justifyContent: "space-between"
  },
  info: {
    fontWeight: '100',
    opacity: .8,
    color: '#fff',
    margin: 20,
    textAlign: 'center',
    fontSize: 15,
    marginTop: 20
  }
});