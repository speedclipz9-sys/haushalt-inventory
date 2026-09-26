import React, { useContext, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { HouseholdContext } from '../../../HouseholdContext';

const COLORS = {
  background: '#ede8D0',
  petrol: '#06837d',
  petrolDark: '#056b67',
  text: '#162b2d',
  muted: '#7c7770',
  border: '#ded7ca',
  white: '#ffffff',
};

export const HouseholdSetupScreen = ({ initialHouseholdId = '' }) => {
  const { createHousehold, joinHousehold } = useContext(HouseholdContext);
  const [isCreating, setIsCreating] = useState(!initialHouseholdId);
  const [householdName, setHouseholdName] = useState('');
  const [householdSize, setHouseholdSize] = useState('2');
  const [householdId, setHouseholdId] = useState(initialHouseholdId);
  const [loading, setLoading] = useState(false);

  const handleCreateHousehold = async () => {
    if (!householdName.trim()) {
      Alert.alert('Fehler', 'Bitte gib einen Namen für den Haushalt ein.');
      return;
    }
    setLoading(true);
    try {
      await createHousehold(householdName);
    } catch (error) {
      Alert.alert('Fehler', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinHousehold = async () => {
    if (!householdId.trim()) {
      Alert.alert('Fehler', 'Bitte gib die Haushalt-ID ein.');
      return;
    }
    setLoading(true);
    try {
      await joinHousehold(householdId.trim());
    } catch (error) {
      Alert.alert('Fehler', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      <View style={styles.hero}>
        <Image
          source={require('../../../../assets/images/app-logo.png.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Haushalt Inventory Logo"
        />
        <Text style={styles.title}>Haushalt einrichten</Text>
        <Text style={styles.subtitle}>Erstelle einen Haushalt oder trete einem bestehenden bei.</Text>
      </View>

      <View style={styles.switcher}>
        <TouchableOpacity
          style={[styles.switchButton, isCreating && styles.switchButtonActive]}
          onPress={() => setIsCreating(true)}>
          <Text style={[styles.switchIcon, isCreating && styles.activeText]}>+</Text>
          <Text style={[styles.switchText, isCreating && styles.activeText]}>Erstellen</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switchButton, !isCreating && styles.switchButtonActive]}
          onPress={() => setIsCreating(false)}>
          <Text style={[styles.switchIcon, !isCreating && styles.activeText]}>↪</Text>
          <Text style={[styles.switchText, !isCreating && styles.activeText]}>Beitreten</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formCard}>
        {isCreating ? (
          <>
            <Text style={styles.label}>Name des Haushalts</Text>
            <TextInput
              style={styles.input}
              placeholder="z. B. Familie Müller"
              placeholderTextColor={COLORS.muted}
              value={householdName}
              onChangeText={setHouseholdName}
              editable={!loading}
            />
            <Text style={styles.label}>Haushaltsgröße</Text>
            <TextInput
              style={styles.input}
              value={householdSize}
              onChangeText={setHouseholdSize}
              keyboardType="number-pad"
              editable={!loading}
            />
            <Text style={styles.hint}>Hilft, den Verbrauch besser einzuschätzen.</Text>
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleCreateHousehold}
              disabled={loading}>
              {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.primaryButtonText}>Haushalt erstellen</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>Haushalt-ID</Text>
            <Text style={styles.hint}>Du kannst die ID aus einem Einladungslink übernehmen.</Text>
            <TextInput
              style={styles.input}
              placeholder="Haushalt-ID eingeben"
              placeholderTextColor={COLORS.muted}
              value={householdId}
              onChangeText={setHouseholdId}
              editable={!loading}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleJoinHousehold}
              disabled={loading}>
              {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.primaryButtonText}>Haushalt beitreten</Text>}
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  page: { backgroundColor: COLORS.background, flexGrow: 1, paddingBottom: 48, paddingHorizontal: 20, paddingTop: 34 },
  hero: { alignItems: 'center', marginBottom: 24 },
  logo: { borderRadius: 18, height: 58, marginBottom: 12, width: 58 },
  title: { color: COLORS.text, fontSize: 27, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: COLORS.muted, fontSize: 14, marginTop: 8, textAlign: 'center' },
  switcher: { backgroundColor: COLORS.petrol, borderRadius: 12, flexDirection: 'row', marginBottom: 26, padding: 3 },
  switchButton: { alignItems: 'center', borderRadius: 9, flex: 1, flexDirection: 'row', gap: 8, justifyContent: 'center', paddingVertical: 12 },
  switchButtonActive: { backgroundColor: COLORS.white, elevation: 2, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4 },
  switchIcon: { color: COLORS.white, fontSize: 21, lineHeight: 21 },
  switchText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  activeText: { color: COLORS.petrol },
  formCard: { backgroundColor: COLORS.white, borderColor: COLORS.border, borderRadius: 13, borderWidth: 1, elevation: 2, padding: 24, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 7 },
  label: { color: COLORS.text, fontSize: 14, fontWeight: '700', marginBottom: 8, marginTop: 2 },
  input: { backgroundColor: '#fff', borderColor: COLORS.border, borderRadius: 8, borderWidth: 1, color: COLORS.text, fontSize: 16, marginBottom: 16, paddingHorizontal: 13, paddingVertical: 11 },
  hint: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginBottom: 16, marginTop: -7 },
  primaryButton: { alignItems: 'center', backgroundColor: COLORS.petrol, borderRadius: 8, marginTop: 2, minHeight: 44, justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  primaryButtonText: { color: COLORS.white, fontSize: 15, fontWeight: '800' },
  disabledButton: { opacity: 0.55 },
});
