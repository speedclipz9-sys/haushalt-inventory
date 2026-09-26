import React, { useContext, useRef, useState } from 'react';
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { HouseholdContext } from '../../HouseholdContext';

export default function HouseholdChatScreen() {
  const { chatMessages, sendChatMessage } = useContext(HouseholdContext);
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const fileInput = useRef(null);
  const messages = Object.values(chatMessages || {}).sort((first, second) => first.createdAt - second.createdAt);

  const chooseImage = () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Bild senden', 'Die Bildauswahl ist im Browser verfügbar.');
      return;
    }
    fileInput.current?.click();
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageUri(reader.result);
    reader.readAsDataURL(file);
  };

  const send = async () => {
    if (!text.trim() && !imageUri) return;
    try {
      await sendChatMessage(text.trim(), imageUri);
      setText('');
      setImageUri(null);
      if (fileInput.current) fileInput.current.value = '';
    } catch (error) {
      Alert.alert('Fehler', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Haushalt-Chat</Text>
        <Text style={styles.subtitle}>Nachrichten und Food-Fotos teilen</Text>
      </View>
      <ScrollView contentContainerStyle={styles.messages}>
        {messages.length === 0 && <Text style={styles.empty}>Noch keine Nachrichten.</Text>}
        {messages.map((message) => (
          <View key={message.id} style={styles.message}>
            <Text style={styles.author}>{message.userName}</Text>
            {message.imageUrl && <Image source={{ uri: message.imageUrl }} style={styles.messageImage} />}
            {message.text ? <Text style={styles.messageText}>{message.text}</Text> : null}
            <Text style={styles.time}>{new Date(message.createdAt).toLocaleString('de-DE')}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.composer}>
        {Platform.OS === 'web' && (
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            onChange={handleFile}
            style={{ display: 'none' }}
          />
        )}
        {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}
        <View style={styles.composerRow}>
          <TouchableOpacity style={styles.imageButton} onPress={chooseImage}>
            <Text style={styles.imageButtonText}>📷</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Nachricht schreiben..."
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={send}>
            <Text style={styles.sendText}>Senden</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#ede8D0', flex: 1 },
  header: { backgroundColor: '#06837d', padding: 18 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#e1f2f0', marginTop: 4 },
  messages: { gap: 10, padding: 16 },
  empty: { color: '#777', padding: 24, textAlign: 'center' },
  message: { alignSelf: 'flex-start', backgroundColor: '#fff', borderRadius: 10, maxWidth: '88%', padding: 12 },
  author: { color: '#06837d', fontWeight: '700', marginBottom: 5 },
  messageText: { color: '#263238', fontSize: 15 },
  messageImage: { borderRadius: 8, height: 180, marginBottom: 6, width: 220 },
  time: { color: '#999', fontSize: 10, marginTop: 6 },
  composer: { backgroundColor: '#fff', borderTopColor: '#ddd', borderTopWidth: 1, padding: 10 },
  composerRow: { alignItems: 'flex-end', flexDirection: 'row', gap: 8 },
  preview: { borderRadius: 6, height: 58, marginBottom: 8, width: 58 },
  imageButton: { alignItems: 'center', backgroundColor: '#e1f2f0', borderRadius: 8, height: 42, justifyContent: 'center', width: 42 },
  imageButtonText: { fontSize: 20 },
  input: { backgroundColor: '#f8f8f8', borderColor: '#ddd', borderRadius: 8, borderWidth: 1, flex: 1, maxHeight: 90, minHeight: 42, paddingHorizontal: 12, paddingVertical: 9 },
  sendButton: { backgroundColor: '#06837d', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12 },
  sendText: { color: '#fff', fontWeight: '700' },
});