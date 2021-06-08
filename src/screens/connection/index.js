/**
 * Sample BLE React Native App
 *
 * @format
 * @flow strict-local
 */

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  NativeModules,
  NativeEventEmitter,
  Image,
  Platform,
  PermissionsAndroid,
  FlatList,
  TouchableHighlight,
  TouchableOpacity
} from 'react-native';
import Toast from 'react-native-tiny-toast'
import { Colors } from 'react-native/Libraries/NewAppScreen';

// import and setup react-native-ble-manager
import BleManager from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleEmitter = new NativeEventEmitter(BleManagerModule);

// import stringToBytes from convert-string package.
// this func is useful for making string-to-bytes conversion easier
import { stringToBytes } from 'convert-string';

// import Buffer function.
// this func is useful for making bytes-to-string conversion easier
const Buffer = require('buffer/').Buffer;

const Conexao = ({navigation}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [list, setList] = useState([]);
  const peripherals = new Map();
  const [testMode, setTestMode] = useState('notify');

  // start to scan peripherals
  const startScan = () => {
    //navigation.navigate('QuizIndex');
    // skip if scan process is currenly happening
    if (isScanning) {
      return;
    }

    // first, clear existing peripherals
    peripherals.clear();
    setList(Array.from(peripherals.values()));

    // then re-scan i
    BleManager.scan(['4fafc201-1fb5-459e-8fcc-c5c9c331914b'], 3, true)
      .then(() => {
        console.log('Scanning...');
        setIsScanning(true);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  // handle discovered peripheral
  const handleDiscoverPeripheral = (peripheral) => {
    console.log('Got ble peripheral', peripheral);

    if (!peripheral.name) {
      peripheral.name = 'NO NAME';
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
                    
        console.log(
        'Received data from: ' + data.peripheral,
        'Characteristic: ' + data.characteristic,
        'Data: ' + value,
        );
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

          console.log('peripheral id:', peripheral.id);
          console.log('service:', serviceUUID);
          console.log('characteristic:', charasteristicUUID);

          switch (testMode) {
            case 'write':
              // ===== test write data
              const payload = 'pizza';
              const payloadBytes = stringToBytes(payload);
              console.log('payload:', payload);

              BleManager.write(peripheral.id, serviceUUID, charasteristicUUID, payloadBytes)
                .then((res) => {
                  console.log('write response', res);
                  alert(`your "${payload}" is stored to the food bank. Thank you!`);
                })
                .catch((error) => {
                  console.log('write err', error);
                });
              break;

            case 'read':
              // ===== test read data
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
        
        navigation.navigate('QuizIndex');
      })
      .catch((error) => {
        console.log('Connection error', error);
      });
  };

  // mount and onmount event handler
  useEffect(() => {
    console.log('Mount');
    
    // initialize BLE modules
    BleManager.start({ showAlert: false });

    // add ble listeners on mount
    bleEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
    bleEmitter.addListener('BleManagerStopScan', handleStopScan);
    bleEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
    bleEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);

    // check location permission only for android device
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((r1) => {
        if (r1) {
          console.log('Permission is OK');
          return;
        }

        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((r2) => {
          if (r2) {
            console.log('User accept');
            return
          }

          console.log('User refuse');
        });
      });
    }

    // remove ble listeners on unmount
    return () => {
      console.log('Unmount');

      bleEmitter.removeListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
      bleEmitter.removeListener('BleManagerStopScan', handleStopScan);
      bleEmitter.removeListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
      bleEmitter.removeListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);

      // BleManager.disconnect("24:0A:C4:59:85:D2")
      // .then(() => {
      //   // Success code
      //   console.log("Disconnected");

      //   BleManager.removePeripheral("24:0A:C4:59:85:D2")
      //   .then(() => {
      //     // Success code
      //     console.log("removed");
      //   })
      //   .catch((error) => {
      //     // Failure code
      //     console.log(error);
      //   });
      // })
    };
  }, []);

  // render list of devices
  const renderItem = (item) => {
    return (
      <TouchableHighlight onPress={() => connectAndTestPeripheral(item)}>
        <View style={[styles.row, styles.buttonBlu]}>
          <Text
            style={{
              fontSize: 12,
              textAlign: 'center',
              color: '#fff',
              padding: 10,
              fontWeight: '900'
            }}>
            {getPeripheralName(item)}
          </Text>
          <Text
            style={{
              fontSize: 10,
              textAlign: 'center',
              color: '#fff',
              fontWeight: '900',
              padding: 2,
              paddingBottom: 20,
            }}>
            Intensidade do sinal: {item.rssi}
          </Text>
        </View>
      </TouchableHighlight>
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="rgb(25, 68, 104)"/>
      <SafeAreaView style={styles.safeAreaView}>
        {/* header */}
        <Image
          style={styles.logo}
          source={require('../../assets/logo2.png')}
        />
        <View>
          <View style={styles.body}>
            {list.length === 0 && (
              <View style={styles.noPeripherals}>
                <Text style={styles.noPeripheralsText}>Nenhum luva para conectar</Text>
              </View>
            )}
          </View>

          {/* ble devices */}
          <FlatList
            data={list}
            renderItem={({item}) => renderItem(item)}
            keyExtractor={(item) => item.id}
          />

          <View style={styles.scanButton}>
            <TouchableOpacity
              style={styles.buttonScan}
              title={'Buscar dispositivos'}
              onPress={() => startScan()}
            >
              <Text style={{color:'#fff', fontWeight: 'bold', justifyContent: 'center'}}>BUSCAR DISPOSITIVOS</Text>
            </TouchableOpacity>
          </View>
        </View> 
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'rgb(25, 68, 104)', 
  },
  body: {
    backgroundColor: 'rgb(25, 68, 104)',
  },
  scanButton: {
    margin: 80,
    padding: 5,
    backgroundColor: 'rgb(46, 127, 80)',
    borderRadius: 20,
  },
  buttonScan: {
    padding: 20,
    backgroundColor: '#325D79',
    alignItems: 'center',
    backgroundColor: 'rgb(46, 127, 80)',
    borderRadius: 20,
  },
  noPeripherals: {
    flex: 1,
    margin: 20,
  },
  noPeripheralsText: {
    textAlign: 'center',
    color: "#fff",
    opacity: .5
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  footerButton: {
    alignSelf: 'stretch',
    padding: 10,
    backgroundColor: 'grey',
  },
  logo: {
    maxWidth: 350,
    maxHeight: 350,
    alignSelf: "center",
    marginBottom: 50
  },
  buttonBlu: {
    backgroundColor: 'rgb(46, 127, 80)',
    marginRight: 40,
    marginLeft: 40,
    opacity: .8,
    borderRadius: 10
  }
});

export default Conexao;