import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  FlatList,
  Image,
} from 'react-native';
import { HouseholdContext } from '../../HouseholdContext';
import FoodSearchInput, { lookupProductByBarcode } from '../components/FoodSearchInput';
import BarcodeScannerModal from '../components/BarcodeScannerModal';

export const ShoppingListScreen = () => {
  const {
    inventory,
    shoppingList,
    addToShoppingList,
    updateShoppingListItem,
    deleteShoppingListItem,
    reconcileShoppingList,
  } = useContext(HouseholdContext);

  const [showModal, setShowModal] = useState(false);
  const [itemName, setItemName] = useState('');
  const [neededQuantity, setNeededQuantity] = useState('');
  const [itemUnit, setItemUnit] = useState('Stück');
  const [dietaryPreference, setDietaryPreference] = useState('');
  const [itemBarcode, setItemBarcode] = useState('');
  const [itemImage, setItemImage] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  const findInventoryItem = (name) => {
    return Object.values(inventory).find(
      (item) => item.name.toLowerCase() === name.toLowerCase()
    );
  };

  const handleAddToShoppingList = async () => {
    if (!itemName.trim() || !neededQuantity.trim()) {
      Alert.alert('Fehler', 'Bitte füllen Sie alle Felder aus');
      return;
    }

    try {
      const duplicate = Object.values(shoppingList).find(
        (item) => item.name?.trim().toLowerCase() === itemName.trim().toLowerCase()
      );
      if (duplicate) {
        Alert.alert(
          'Artikel bereits vorhanden',
          `${itemName.trim()} ist bereits in der Einkaufsliste. Möchtest du ihn trotzdem hinzufügen?`,
          [
            { text: 'Nein', style: 'cancel' },
            {
              text: 'Trotzdem hinzufügen',
              onPress: () => addShoppingItem(),
            },
          ]
        );
        return;
      }

      await addShoppingItem();
    } catch (error) {
      Alert.alert('Fehler', error.message);
    }
  };

  const addShoppingItem = async () => {
    try {
      const inventoryItem = findInventoryItem(itemName);
      const inInventoryQuantity = inventoryItem ? inventoryItem.quantity : 0;
      const neededQty = parseFloat(neededQuantity);

      const toBuy = Math.max(0, neededQty - inInventoryQuantity);

      await addToShoppingList(
        itemName,
        neededQty,
        inInventoryQuantity,
        itemUnit,
        dietaryPreference,
        itemImage
      );

      setItemName('');
      setNeededQuantity('');
      setItemUnit('Stück');
      setDietaryPreference('');
      setItemBarcode('');
      setItemImage(null);
      setShowModal(false);

      Alert.alert(
        'Berechnung',
        `Benötigt: ${neededQty} ${itemUnit}\nIm Bestand: ${inInventoryQuantity} ${itemUnit}\nKaufen: ${toBuy} ${itemUnit}`
      );
    } catch (error) {
      Alert.alert('Fehler', error.message);
    }
  };

  const handleBarcode = async (barcode) => {
    setItemBarcode(barcode);
    try {
      const product = await lookupProductByBarcode(barcode);
      if (product.name) setItemName(product.name);
      if (product.imageUrl) setItemImage(product.imageUrl);
    } catch (error) {
      Alert.alert('Barcode', 'Kein Produkt zu diesem Barcode gefunden. Der Barcode wurde trotzdem übernommen.');
    }
  };

  const handleMarkAsPurchased = async (item) => {
    try {
      if (!item.purchased) {
        await reconcileShoppingList(item.id, item.quantity);
      } else {
        await updateShoppingListItem(item.id, { purchased: false });
      }
    } catch (error) {
      Alert.alert('Fehler', error.message);
    }
  };

  const handleMoveToNextList = async (item) => {
    try {
      await updateShoppingListItem(item.id, { nextShoppingList: true, purchased: false });
      Alert.alert('Vorgemerkt', 'Der Artikel ist für die nächste Einkaufsliste vorgemerkt.');
    } catch (error) {
      Alert.alert('Fehler', error.message);
    }
  };

  const shoppingListArray = Object.entries(shoppingList).map(([id, item]) => ({
    ...item,
    id,
  }));

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.itemImage} /> : null}
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.calculation}>
          Benötigt: {item.originalNeeded} | Im Bestand: {item.inInventory} | Kaufen: {item.quantity} {item.unit}
        </Text>
        <Text style={styles.status}>
          {item.purchased
            ? '✓ Gekauft'
            : item.nextShoppingList
              ? '↗ Für nächste Einkaufsliste vorgemerkt'
              : 'Nicht gekauft'}
        </Text>
      </View>

      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.checkButton}
          onPress={() => handleMarkAsPurchased(item)}
        >
          <Text style={styles.checkButtonText}>✓</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleMoveToNextList(item)}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Einkaufsliste</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.addButtonText}>+ Artikel</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={shoppingListArray}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Einkaufsliste ist leer</Text>
            <Text style={styles.emptySubtext}>Tippen Sie oben auf "+Artikel" um zu beginnen</Text>
          </View>
        }
      />

      <Modal
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Zur Einkaufsliste hinzufügen</Text>
            <TouchableOpacity onPress={() => setShowScanner(true)} style={styles.scanButton}>
              <Text style={styles.scanButtonText}>📷</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.label}>Artikelname</Text>
            <FoodSearchInput
              value={itemName}
              onChangeText={setItemName}
              onSelect={(product) => {
                setItemName(product.name);
                setItemBarcode(product.barcode || '');
                setItemImage(product.imageUrl || null);
              }}
            />

            <Text style={styles.label}>Benötigte Menge</Text>
            <TextInput
              style={styles.input}
              placeholder="z.B. 3"
              value={neededQuantity}
              onChangeText={setNeededQuantity}
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>Einheit</Text>
            <View style={styles.unitContainer}>
              {['Stück', 'L', 'ml', 'kg', 'g'].map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[
                    styles.unitButton,
                    itemUnit === unit && styles.unitButtonActive,
                  ]}
                  onPress={() => setItemUnit(unit)}
                >
                  <Text style={styles.unitButtonText}>{unit}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Ernährungsoption</Text>
            <View style={styles.preferenceContainer}>
              {['Wenig Kohlenhydrate', 'Wenig Zucker', 'Light (Wenig Fett)'].map((preference) => (
                <TouchableOpacity
                  key={preference}
                  style={[styles.preferenceButton, dietaryPreference === preference && styles.preferenceButtonActive]}
                  onPress={() => setDietaryPreference(dietaryPreference === preference ? '' : preference)}>
                  <Text style={styles.preferenceText}>{preference}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>So funktioniert die Berechnung:</Text>
              <Text style={styles.infoText}>
                Benötigte Menge - Im Bestand = Zu kaufen
              </Text>
              <Text style={styles.infoExample}>
                Beispiel: 3L - 1L = 2L kaufen
              </Text>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddToShoppingList}
            >
              <Text style={styles.submitButtonText}>Zur Liste hinzufügen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BarcodeScannerModal
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onBarcode={handleBarcode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ede8D0',
  },
  header: {
    backgroundColor: '#06837d',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#06837d',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  itemInfo: {
    flex: 1,
  },
  itemImage: { borderRadius: 6, height: 48, marginBottom: 8, width: 48 },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  calculation: {
    fontSize: 12,
    color: '#06837d',
    marginBottom: 4,
    fontWeight: '500',
  },
  status: {
    fontSize: 12,
    color: '#999',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  checkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonText: {
    fontSize: 20,
    color: '#06837d',
    fontWeight: 'bold',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 24,
    color: '#ff5252',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ede8D0',
  },
  modalHeader: {
    backgroundColor: '#06837d',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    fontSize: 28,
    color: '#fff',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  scanButton: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 6, height: 34, justifyContent: 'center', width: 42 },
  scanButtonText: { color: '#06837d', fontSize: 20 },
  modalContent: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 6,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
  },
  unitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  unitButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderColor: '#ddd',
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  unitButtonActive: {
    backgroundColor: '#06837d',
    borderColor: '#06837d',
  },
  unitButtonText: {
    fontSize: 12,
    color: '#333',
  },
  infoBox: {
    backgroundColor: '#fff3e0',
    borderRadius: 6,
    padding: 12,
    marginBottom: 20,
    borderLeftColor: '#06837d',
    borderLeftWidth: 4,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#06837d',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
  },
  infoExample: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#06837d',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  preferenceContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  preferenceButton: { backgroundColor: '#fff', borderColor: '#ddd', borderRadius: 6, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 },
  preferenceButtonActive: { backgroundColor: '#e1f2f0', borderColor: '#06837d' },
  preferenceText: { color: '#333', fontSize: 12 },
});