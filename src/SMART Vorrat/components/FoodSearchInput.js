import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
const { normalizeNutrition } = require('../../utils/nutrition');

const isLocalWeb = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const SEARCH_PROXY_URL = process.env.EXPO_PUBLIC_API_BASE_URL || (isLocalWeb ? 'http://localhost:8787/search' : '/api/openfoodfacts?mode=search&q=');
const BARCODE_PROXY_URL = process.env.EXPO_PUBLIC_API_BASE_URL || (isLocalWeb ? 'http://localhost:8787/barcode' : '/api/openfoodfacts?mode=barcode&code=');

export async function lookupProductByBarcode(barcode) {
  const response = await fetch(`${BARCODE_PROXY_URL}${isLocalWeb ? `?q=${encodeURIComponent(barcode)}` : encodeURIComponent(barcode)}`);
  if (!response.ok) throw new Error('Produkt konnte nicht gefunden werden');
  const data = await response.json();
  const product = data.product || data;
  return {
    name: product.product_name_de || product.product_name || product.generic_name_de || product.generic_name || '',
    brand: product.brands,
    quantity: product.quantity,
    barcode: product.code || barcode,
    imageUrl: product.image_front_small_url || product.image_front_thumb_url || null,
    nutrition: normalizeNutrition(product),
  };
}

export default function FoodSearchInput({ value, onChangeText, onSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = value.trim();
    if (query.length < 2) {
      setSuggestions([]);
      return undefined;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`${SEARCH_PROXY_URL}${isLocalWeb || process.env.EXPO_PUBLIC_API_BASE_URL ? `?q=${encodeURIComponent(query)}` : encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Open Food Facts request failed');
        const data = await response.json();
        const products = (data.products || [])
          .map((product) => ({
            name: product.product_name_de || product.product_name || product.generic_name_de || product.generic_name,
            brand: product.brands,
            quantity: product.quantity,
            barcode: product.code,
            imageUrl: product.image_front_small_url || product.image_front_thumb_url || null,
            nutrition: normalizeNutrition(product),
          }))
          .filter((product) => product.name)
          .filter((product, index, all) => all.findIndex((item) => item.name === product.name) === index);
        setSuggestions(products);
      } catch (error) {
        if (error.name !== 'AbortError') setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [value]);

  return (
    <View style={styles.wrapper}>
      <TextInput
        style={styles.input}
        placeholder="z.B. Brot"
        value={value}
        onChangeText={onChangeText}
      />
      {loading && <ActivityIndicator style={styles.loader} size="small" color="#4CAF50" />}
      {suggestions.length > 0 && (
        <ScrollView style={styles.dropdown} nestedScrollEnabled keyboardShouldPersistTaps="handled">
          {suggestions.map((product) => (
            <TouchableOpacity
              key={`${product.barcode || product.name}-${product.name}`}
              style={styles.suggestion}
              onPress={() => {
                onSelect(product);
                setSuggestions([]);
              }}>
              {product.imageUrl ? <Image source={{ uri: product.imageUrl }} style={styles.thumbnail} /> : <View style={styles.thumbnailPlaceholder} />}
              <View style={styles.suggestionText}>
                <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
              <Text style={styles.details} numberOfLines={1}>
                {[product.brand, product.quantity].filter(Boolean).join(' · ') || 'Open Food Facts'}
              </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative', zIndex: 10 },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  loader: { position: 'absolute', right: 12, top: 12 },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderRadius: 6,
    borderWidth: 1,
    elevation: 5,
    marginTop: -4,
    maxHeight: 220,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    zIndex: 20,
  },
  suggestion: { alignItems: 'center', borderBottomColor: '#eee', borderBottomWidth: 1, flexDirection: 'row', padding: 10 },
  thumbnail: { borderRadius: 5, height: 42, marginRight: 10, width: 42 },
  thumbnailPlaceholder: { backgroundColor: '#ede8D0', borderRadius: 5, height: 42, marginRight: 10, width: 42 },
  suggestionText: { flex: 1 },
  name: { color: '#333', fontWeight: '600' },
  details: { color: '#777', fontSize: 12, marginTop: 3 },
});