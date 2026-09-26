import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function BarcodeScannerModal({ visible, onClose, onBarcode }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (visible) {
      setLocked(false);
      if (!permission?.granted) requestPermission();
    }
  }, [visible, permission?.granted, requestPermission]);

  const handleScan = ({ data }) => {
    if (locked || !data) return;
    setLocked(true);
    onBarcode(data);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Barcode scannen</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>Schließen</Text>
          </TouchableOpacity>
        </View>
        {!permission ? (
          <ActivityIndicator style={styles.center} size="large" color="#06837d" />
        ) : !permission.granted ? (
          <View style={styles.center}>
            <Text style={styles.message}>Kamerazugriff wird benötigt, um einen Barcode zu scannen.</Text>
            <TouchableOpacity style={styles.button} onPress={requestPermission}>
              <Text style={styles.buttonText}>Kamera erlauben</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={locked ? undefined : handleScan}
            barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'qr'] }}
          >
            <View style={styles.frame} />
            <Text style={styles.hint}>Barcode in den Rahmen halten</Text>
          </CameraView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#000', flex: 1 },
  header: { alignItems: 'center', backgroundColor: '#06837d', flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  close: { color: '#fff', fontWeight: '600' },
  camera: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  frame: { borderColor: '#fff', borderRadius: 10, borderWidth: 2, height: 130, width: '78%' },
  hint: { color: '#fff', marginTop: 24, backgroundColor: 'rgba(0,0,0,0.55)', padding: 10 },
  center: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 24 },
  message: { color: '#fff', fontSize: 16, marginBottom: 18, textAlign: 'center' },
  button: { backgroundColor: '#06837d', borderRadius: 7, paddingHorizontal: 18, paddingVertical: 12 },
  buttonText: { color: '#fff', fontWeight: '700' },
});
