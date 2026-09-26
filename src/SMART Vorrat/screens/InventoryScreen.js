import React, { useState, useContext, useEffect, useRef } from 'react';
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

export const InventoryScreen = ({ navigation }) => {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, addToShoppingList } = useContext(HouseholdContext);
  const [showModal, setShowModal] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [itemUnit, setItemUnit] = useState('Stück');
  const [itemBarcode, setItemBarcode] = useState('');
  const [itemImage, setItemImage] = useState(null);
  const [dietaryPreference, setDietaryPreference] = useState('');
  const [itemToRemove, setItemToRemove] = useState(null);
  const [replacementQuantity, setReplacementQuantity] = useState('1');
  const [replacementUnit, setReplacementUnit] = useState('Stück');
  const [showScanner, setShowScanner] = useState(false);
  const promptedItems = useRef(new Set());

  const categories = {
    'Milchprodukte': ['milch', 'käse', 'joghurt', 'butter', 'quark', 'sahne', 'frischkäse', 'skyr'],
    'Getränke': ['wasser', 'saft', 'kaffee', 'tee', 'cola', 'limonade', 'drink', 'getränk', 'bier', 'wein'],
    'Backwaren': ['brot', 'brötchen', 'toast', 'backware', 'croissant', 'kuchen', 'keks', 'knäck'],
    'Tiefkühl': ['tiefkühl', 'gefroren', 'gefriergut', 'eis', 'pizza', 'frost'],
    'Obst & Gemüse': ['apfel', 'banane', 'orange', 'birne', 'beere', 'obst', 'gemüse', 'gurke', 'tomate', 'kartoffel', 'salat', 'karotte', 'möhre', 'zwiebel'],
    'Sonstiges': [],
  };

  const getCategory = (name) => {
    const normalizedName = name.toLowerCase();
    for (const [category, items] of Object.entries(categories)) {
      if (items.some(item => normalizedName.includes(item))) {
        return category;
      }
    }
    return 'Sonstiges';
  };

  const handleAddItem = async () => {
    if (!itemName.trim() || !itemQuantity.trim()) {
      Alert.alert('Fehler', 'Bitte füllen Sie alle Felder aus');
      return;
    }

    try {
      await addInventoryItem({
        name: itemName,
        quantity: parseFloat(itemQuantity),
        unit: itemUnit,
        category: getCategory(itemName),
        barcode: itemBarcode.trim() || null,
        imageUrl: itemImage,
        dietaryPreference,
      });

      setItemName('');
      setItemQuantity('');
      setItemUnit('Stück');
      setItemBarcode('');
      setItemImage(null);
      setDietaryPreference('');
      setShowModal(false);
      Alert.alert('Erfolg', 'Artikel hinzugefügt');
    } catch (error) {
      Alert.alert('Fehler', error.message);
    }
  };

  const openRemoveDialog = (item) => {
    setItemToRemove(item);
    setReplacementQuantity(String(item.quantity || 1));
    setReplacementUnit(item.unit || 'Stück');
  };

  const closeRemoveDialog = () => setItemToRemove(null);

  const removeItem = async (addToList) => {
    if (!itemToRemove) return;
    const quantity = Number.parseFloat(replacementQuantity);
    if (addToList && (!replacementQuantity.trim() || !Number.isFinite(quantity) || quantity <= 0)) {
      Alert.alert('Fehler', 'Bitte gib eine gültige Menge ein.');
      return;
    }

    try {
      if (addToList) {
        await addToShoppingList(itemToRemove.name, quantity, 0, replacementUnit, itemToRemove.dietaryPreference || '', itemToRemove.imageUrl || null);
      }
      await deleteInventoryItem(itemToRemove.id);
      closeRemoveDialog();
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

  const categoryOrder = ['Milchprodukte', 'Getränke', 'Backwaren', 'Tiefkühl', 'Obst & Gemüse', 'Sonstiges'];
  const inventoryArray = Object.entries(inventory).map(([id, item]) => ({
    ...item,
    category: categoryOrder.includes(item.category) ? item.category : getCategory(item.name),
    id,
  })).sort((first, second) => categoryOrder.indexOf(first.category) - categoryOrder.indexOf(second.category));

  useEffect(() => {
    const lowStockItem = inventoryArray.find(
      (item) => Number(item.quantity || 0) <= 1 && !promptedItems.current.has(item.id)
    );
    if (!lowStockItem) return;
    promptedItems.current.add(lowStockItem.id);
    Alert.alert(
      'Bestand fast leer',
      `${lowStockItem.name} hat nur noch ${lowStockItem.quantity} ${lowStockItem.unit}. Soll es auf die Einkaufsliste?`,
      [
        { text: 'Später', style: 'cancel' },
        {
          text: 'Nachfüllen',
          onPress: async () => {
            try {
              await addToShoppingList(lowStockItem.name, 1, lowStockItem.quantity, lowStockItem.unit, lowStockItem.dietaryPreference || '', lowStockItem.imageUrl || null);
            } catch (error) {
              Alert.alert('Fehler', error.message);
            }
          },
        },
      ]
    );
  }, [inventoryArray, addToShoppingList]);

  const renderItem = ({ item, index }) => {
    const showCategory = index === 0 || inventoryArray[index - 1].category !== item.category;
    return (
      <View>
        {showCategory && <Text style={styles.categoryHeader}>{item.category || 'Sonstiges'}</Text>}
        <View style={styles.itemCard}>
          <View style={styles.itemInfo}>
            {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.itemImage} /> : null}
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQuantity}>
              {item.quantity} {item.unit}
            </Text>
            <Text style={styles.itemCategory}>{item.category}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => openRemoveDialog(item)}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vorratskammer</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.addButtonText}>+ Artikel</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={inventoryArray}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Keine Artikel in der Vorratskammer</Text>
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
            <Text style={styles.modalTitle}>Artikel hinzufügen</Text>
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

            <Text style={styles.label}>Menge</Text>
            <TextInput
              style={styles.input}
              placeholder="z.B. 2"
              value={itemQuantity}
              onChangeText={setItemQuantity}
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

            <Text style={styles.label}>Barcode (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Barcode eingeben"
              value={itemBarcode}
              onChangeText={setItemBarcode}
              keyboardType="number-pad"
            />

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

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddItem}
            >
              <Text style={styles.submitButtonText}>Hinzufügen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BarcodeScannerModal
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onBarcode={handleBarcode}
      />

      <Modal
        visible={Boolean(itemToRemove)}
        transparent
        animationType="fade"
        onRequestClose={closeRemoveDialog}
      >
        <View style={styles.confirmBackdrop}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Produkt entfernen?</Text>
            <Text style={styles.confirmText}>
              Willst du {itemToRemove?.name || 'dieses Produkt'} in die Einkaufsliste legen?
            </Text>

            <Text style={styles.label}>Menge für die Einkaufsliste</Text>
            <TextInput
              style={styles.input}
              value={replacementQuantity}
              onChangeText={setReplacementQuantity}
              keyboardType="decimal-pad"
              placeholder="z.B. 2"
            />
            <View style={styles.unitContainer}>
              {['Stück', 'kg', 'g', 'L', 'ml'].map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[styles.unitButton, replacementUnit === unit && styles.unitButtonActive]}
                  onPress={() => setReplacementUnit(unit)}>
                  <Text style={styles.unitButtonText}>{unit}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.confirmActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeRemoveDialog}>
                <Text style={styles.cancelButtonText}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteOnlyButton} onPress={() => removeItem(false)}>
                <Text style={styles.deleteOnlyText}>Nur löschen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addToListButton} onPress={() => removeItem(true)}>
                <Text style={styles.addToListText}>Zur Einkaufsliste</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#999',
  },
  categoryHeader: {
    color: '#06837d',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 14,
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
  confirmBackdrop: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.45)', flex: 1, justifyContent: 'center', padding: 20 },
  confirmCard: { backgroundColor: '#fff', borderRadius: 10, maxWidth: 520, padding: 20, width: '100%' },
  confirmTitle: { color: '#263238', fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  confirmText: { color: '#555', fontSize: 15, marginBottom: 18 },
  confirmActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end', marginTop: 4 },
  cancelButton: { borderColor: '#ddd', borderRadius: 6, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  cancelButtonText: { color: '#555', fontWeight: '600' },
  deleteOnlyButton: { backgroundColor: '#ffebee', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10 },
  deleteOnlyText: { color: '#c62828', fontWeight: '600' },
  addToListButton: { backgroundColor: '#06837d', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10 },
  addToListText: { color: '#fff', fontWeight: '600' },
});