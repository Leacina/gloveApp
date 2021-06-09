import React, { useState, useEffect } from 'react';
import {View, 
        StyleSheet, 
        StatusBar, 
        Text, 
        PermissionsAndroid,  
        NativeModules,
        Platform,
        NativeEventEmitter} from "react-native";
// import and setup react-native-ble-manager
import BleManager from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleEmitter = new NativeEventEmitter(BleManagerModule);

// import stringToBytes from convert-string package.
// this func is useful for making string-to-bytes conversion easier
import { stringToBytes } from 'convert-string';
const Buffer = require('buffer/').Buffer;

const RecognizeLetters = ({navigation}) => {
   
    const [isScanning, setIsScanning] = useState(false);
    const [list, setList] = useState([]);
    const peripherals = new Map();
    const [testMode, setTestMode] = useState('notify');
    const [letter, setLetter] = useState('');

    let isSendCommand = false;
    let isConnect = false;

    let recognize = navigation.state.params.recognize;
    // start to scan peripherals
    const startScan = () => {
        // skip if scan process is currenly happening
        if (isScanning) {
            return;
        }

        // first, clear existing peripherals
        peripherals.clear();
        setList(Array.from(peripherals.values()));

        // then re-scan it
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
                    
        console.log(
            'Received data from: ' + data.peripheral,
            'Characteristic: ' + data.characteristic,
            'service: ' + data.service,
            'Data: ' + value,
        );

        //Se for número e for pra reconhecer numero
        if(!isNaN(String(value[0])) && recognize == "recognizeNumber"){
            setLetter(String(value[0]));
        }else if(isNaN(String(value[0])) && recognize == "recognizeLetter"){
            setLetter(String(value[0]));
        }
    
        if(!isSendCommand){
            const payload = recognize;
            const payloadBytes = stringToBytes(payload);
    
            BleManager.write(data.peripheral, data.service, data.characteristic, payloadBytes)
                .then((res) => {
                    console.log('Solicitado reconhecimento de letras');
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

            console.log('peripheral id:', peripheral.id);
            console.log('service:', serviceUUID);
            console.log('characteristic:', charasteristicUUID);

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

    // mount and onmount event handler
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

    return (
        <>
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={navigation.getParam("color")}/>
                <Text style={styles.letter}>{letter}</Text>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        display: "flex",
        alignContent: "center",
        justifyContent: "center",
        alignItems: "center",
        flex: 1
    },
    letter: {
        fontSize: 250
    }
});

export default RecognizeLetters;
