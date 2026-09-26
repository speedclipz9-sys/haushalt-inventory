import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { AuthContext } from '../AuthContext';

export const AuthScreen = () => {
  const { signUpWithEmail, signInWithEmail } = useContext(AuthContext);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Fehler', 'Bitte füllen Sie alle Felder aus');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        if (!displayName) {
          Alert.alert('Fehler', 'Bitte geben Sie Ihren Namen ein');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, displayName, rememberMe);
        Alert.alert('Erfolg', 'Konto erstellt!');
      } else {
        await signInWithEmail(email, password, rememberMe);
      }
    } catch (error) {
      Alert.alert('Fehler', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Haushalt Inventory</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? 'Konto erstellen' : 'Anmelden'}
        </Text>
      </View>

      <View style={styles.formContainer}>
        {isSignUp && (
          <TextInput
            style={styles.input}
            placeholder="Vollständiger Name"
            value={displayName}
            onChangeText={setDisplayName}
            editable={!loading}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="E-Mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          editable={!loading}
        />

        {!isSignUp && (
          <TouchableOpacity style={styles.rememberRow} onPress={() => setRememberMe(!rememberMe)} disabled={loading}>
            <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
              {rememberMe && <Text style={styles.checkboxMark}>✓</Text>}
            </View>
            <Text style={styles.rememberText}>Angemeldet bleiben</Text>
          </TouchableOpacity>
        )}

        <TextInput
          style={styles.input}
          placeholder="Passwort"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isSignUp ? 'Konto erstellen' : 'Anmelden'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setIsSignUp(!isSignUp);
            setDisplayName('');
            setEmail('');
            setPassword('');
          }}
          disabled={loading}
        >
          <Text style={styles.toggleText}>
            {isSignUp
              ? 'Sie haben bereits ein Konto? Anmelden'
              : 'Kein Konto? Erstellen Sie eines'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.socialContainer}>
        <Text style={styles.socialText}>Oder mit folgendem anmelden:</Text>
        
        <TouchableOpacity style={styles.socialButton} disabled={loading}>
          <Text style={styles.socialButtonText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} disabled={loading}>
          <Text style={styles.socialButtonText}>Apple</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ede8D0',
  },
  headerContainer: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    backgroundColor: '#06837d',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
  },
  formContainer: {
    padding: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#06837d',
    borderRadius: 8,
    paddingVertical: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleText: {
    textAlign: 'center',
    color: '#06837d',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  socialContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  socialText: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  socialButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 12,
    borderColor: '#06837d',
    borderWidth: 1,
    alignItems: 'center',
  },
  socialButtonText: {
    color: '#06837d',
    fontWeight: '600',
  },
  rememberRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: '#06837d',
    borderRadius: 4,
    borderWidth: 1,
    height: 20,
    justifyContent: 'center',
    marginRight: 8,
    width: 20,
  },
  checkboxActive: {
    backgroundColor: '#06837d',
  },
  checkboxMark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  rememberText: {
    color: '#333',
    fontSize: 14,
  },
});