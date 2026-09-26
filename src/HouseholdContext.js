import React, { createContext, useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native';
import { database } from './SMART Vorrat/firebaseConfig';
import { ref, set, get, update, push, onValue, remove, child } from 'firebase/database';
import { AuthContext } from './SMART Vorrat/AuthContext';
import { localDateKey } from './utils/nutrition';

export const HouseholdContext = createContext();

export const HouseholdProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [currentHousehold, setCurrentHousehold] = useState(null);
  const [inventory, setInventory] = useState({});
  const [shoppingList, setShoppingList] = useState({});
  const [householdMembers, setHouseholdMembers] = useState({});
  const [chatMessages, setChatMessages] = useState({});
  const [recurringFoods, setRecurringFoods] = useState({});
  const [nutritionProfileState, setNutritionProfileState] = useState({ userId: null, value: null });
  const [nutritionLogsState, setNutritionLogsState] = useState({ key: null, value: {} });
  const [recipeFavoritesState, setRecipeFavoritesState] = useState({ userId: null, value: {} });
  const [nutritionDay, setNutritionDay] = useState(() => localDateKey());
  const [chatNotification, setChatNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const nutritionProfile = nutritionProfileState.userId === user?.uid ? nutritionProfileState.value : null;
  const nutritionLogKey = `${user?.uid || ''}:${nutritionDay}`;
  const nutritionLogs = nutritionLogsState.key === nutritionLogKey ? nutritionLogsState.value : {};
  const recipeFavorites = recipeFavoritesState.userId === user?.uid ? recipeFavoritesState.value : {};

  useEffect(() => {
    if (!user) {
      setCurrentHousehold(null);
      setInventory({});
      setShoppingList({});
      setChatMessages({});
      setLoading(false);
      return;
    }

    const userRef = ref(database, `users/${user.uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const householdId = userData.householdId;

        if (householdId) {
          setCurrentHousehold(householdId);

          const inventoryRef = ref(database, `households/${householdId}/inventory`);
          const inventoryUnsub = onValue(inventoryRef, (snap) => {
            setInventory(snap.val() || {});
          });

          const shoppingRef = ref(database, `households/${householdId}/shoppingList`);
          const shoppingUnsub = onValue(shoppingRef, (snap) => {
            setShoppingList(snap.val() || {});
          });

          const membersRef = ref(database, `households/${householdId}/members`);
          const membersUnsub = onValue(membersRef, (snap) => {
            setHouseholdMembers(snap.val() || {});
          });

          setLoading(false);

          return () => {
            inventoryUnsub();
            shoppingUnsub();
            membersUnsub();
          };
        } else {
          setCurrentHousehold(null);
          setInventory({});
          setShoppingList({});
          setLoading(false);
        }
      }
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!currentHousehold) {
      setChatMessages({});
      return undefined;
    }

    const chatRef = ref(database, `households/${currentHousehold}/chat`);
    let firstSnapshot = true;
    return onValue(chatRef, (snapshot) => {
      const nextMessages = snapshot.val() || {};
      setChatMessages(nextMessages);
      if (!firstSnapshot) {
        const latestMessage = Object.values(nextMessages).sort((first, second) => second.createdAt - first.createdAt)[0];
        if (latestMessage && latestMessage.userId !== user?.uid) {
          setChatNotification(latestMessage);
          if (Platform.OS === 'web' && typeof window !== 'undefined' && window.Notification?.permission === 'granted') {
            new window.Notification(`Neue Nachricht von ${latestMessage.userName}`, {
              body: latestMessage.text || 'Neues Food-Foto im Haushalt-Chat',
            });
          }
        }
      }
      firstSnapshot = false;
    });
  }, [currentHousehold, user?.uid]);

  useEffect(() => {
    const timer = setInterval(() => setNutritionDay(localDateKey()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user?.uid) return undefined;

    const profileUnsubscribe = onValue(
      ref(database, `users/${user.uid}/nutrition/profile`),
      (snapshot) => setNutritionProfileState({ userId: user.uid, value: snapshot.val() || null })
    );
    const logsUnsubscribe = onValue(
      ref(database, `users/${user.uid}/nutrition/logs/${nutritionDay}`),
      (snapshot) => setNutritionLogsState({ key: nutritionLogKey, value: snapshot.val() || {} })
    );

    return () => {
      profileUnsubscribe();
      logsUnsubscribe();
    };
  }, [user?.uid, nutritionDay, nutritionLogKey]);

  useEffect(() => {
    if (!user?.uid) return undefined;
    return onValue(ref(database, `users/${user.uid}/recipeFavorites`), (snapshot) => {
      setRecipeFavoritesState({ userId: user.uid, value: snapshot.val() || {} });
    });
  }, [user?.uid]);

  useEffect(() => {
    if (!currentHousehold) {
      setRecurringFoods({});
      return undefined;
    }
    const recurringRef = ref(database, `households/${currentHousehold}/recurringFoods`);
    return onValue(recurringRef, (snapshot) => setRecurringFoods(snapshot.val() || {}));
  }, [currentHousehold]);

  const addRecurringFood = async (food) => {
    if (!currentHousehold) throw new Error('No household selected');
    const foodId = push(child(ref(database), 'recurringFoods')).key;
    await set(ref(database, `households/${currentHousehold}/recurringFoods/${foodId}`), {
      id: foodId,
      name: food.name,
      quantity: Number(food.quantity) || 1,
      unit: food.unit || 'Stück',
      barcode: food.barcode || null,
      imageUrl: food.imageUrl || null,
      createdAt: new Date().toISOString(),
    });
  };

  const deleteRecurringFood = async (foodId) => {
    if (!currentHousehold) throw new Error('No household selected');
    await remove(ref(database, `households/${currentHousehold}/recurringFoods/${foodId}`));
  };

  const saveNutritionProfile = async (profile) => {
    if (!user?.uid) throw new Error('User not authenticated');
    await set(ref(database, `users/${user.uid}/nutrition/profile`), {
      ...profile,
      enabled: true,
      updatedAt: new Date().toISOString(),
    });
  };

  const disableNutrition = async () => {
    if (!user?.uid) throw new Error('User not authenticated');
    await update(ref(database, `users/${user.uid}/nutrition/profile`), {
      enabled: false,
      updatedAt: new Date().toISOString(),
    });
  };

  const addNutritionLog = async (entry) => {
    if (!user?.uid) throw new Error('User not authenticated');
    const logRef = push(ref(database, `users/${user.uid}/nutrition/logs/${nutritionDay}`));
    await set(logRef, {
      ...entry,
      id: logRef.key,
      date: nutritionDay,
      createdAt: new Date().toISOString(),
    });
  };

  const deleteNutritionLog = async (logId) => {
    if (!user?.uid) throw new Error('User not authenticated');
    await remove(ref(database, `users/${user.uid}/nutrition/logs/${nutritionDay}/${logId}`));
  };

  const toggleRecipeFavorite = async (recipeId) => {
    if (!user?.uid) throw new Error('User not authenticated');
    const favoriteRef = ref(database, `users/${user.uid}/recipeFavorites/${recipeId}`);
    if (recipeFavorites[recipeId]) await remove(favoriteRef);
    else await set(favoriteRef, true);
  };

  const enableChatNotifications = async () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.Notification) {
      await window.Notification.requestPermission();
    }
  };

  const sendChatMessage = async (text, imageUrl = null) => {
    if (!currentHousehold || !user) throw new Error('No household selected');
    const messageId = push(child(ref(database), 'messages')).key;
    await set(ref(database, `households/${currentHousehold}/chat/${messageId}`), {
      id: messageId,
      text: text || '',
      imageUrl: imageUrl || null,
      userId: user.uid,
      userName: user.displayName || user.email || 'Mitglied',
      createdAt: Date.now(),
    });
  };

  const createHousehold = async (householdName) => {
    if (!user) throw new Error('User not authenticated');

    const householdId = push(child(ref(database), 'households')).key;

    const householdData = {
      id: householdId,
      name: householdName,
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      members: {
        [user.uid]: {
          name: user.displayName,
          email: user.email,
          role: 'admin',
        },
      },
      inventory: {},
      shoppingList: {},
    };

    await set(ref(database, `households/${householdId}`), householdData);
    await update(ref(database, `users/${user.uid}`), { householdId });

    setCurrentHousehold(householdId);
    return householdId;
  };

  const joinHousehold = async (householdId) => {
    if (!user) throw new Error('User not authenticated');

    const householdRef = ref(database, `households/${householdId}`);
    const snapshot = await get(householdRef);

    if (!snapshot.exists()) {
      throw new Error('Haushalt nicht gefunden');
    }

    await set(
      ref(database, `households/${householdId}/members/${user.uid}`),
      {
        name: user.displayName,
        email: user.email,
        role: 'member',
      }
    );

    await update(ref(database, `users/${user.uid}`), { householdId });

    setCurrentHousehold(householdId);
    return householdId;
  };

  const addInventoryItem = async (item) => {
    if (!currentHousehold) throw new Error('No household selected');

    const itemId = push(child(ref(database), 'items')).key;

    const itemData = {
      id: itemId,
      name: item.name,
      quantity: parseFloat(item.quantity),
      unit: item.unit,
      category: item.category,
      barcode: item.barcode || null,
      brand: item.brand || null,
      imageUrl: item.imageUrl || null,
      nutrition: item.nutrition || null,
      createdAt: new Date().toISOString(),
      consumptionVelocity: item.consumptionVelocity || 0,
      daysSinceCreated: 0,
    };

    await set(
      ref(database, `households/${currentHousehold}/inventory/${itemId}`),
      itemData
    );

    return itemId;
  };

  const updateInventoryItem = async (itemId, updates) => {
    if (!currentHousehold) throw new Error('No household selected');

    await update(
      ref(database, `households/${currentHousehold}/inventory/${itemId}`),
      updates
    );
  };

  const deleteInventoryItem = async (itemId) => {
    if (!currentHousehold) throw new Error('No household selected');

    await remove(ref(database, `households/${currentHousehold}/inventory/${itemId}`));
  };

  const addToShoppingList = async (itemName, neededQuantity, inInventoryQuantity, unit, dietaryPreference = '', imageUrl = null) => {
    if (!currentHousehold) throw new Error('No household selected');

    const toBuy = Math.max(0, neededQuantity - inInventoryQuantity);

    const itemId = push(child(ref(database), 'shopping')).key;

    const shoppingItem = {
      id: itemId,
      name: itemName,
      quantity: toBuy,
      originalNeeded: neededQuantity,
      inInventory: inInventoryQuantity,
      unit,
      dietaryPreference,
      imageUrl,
      addedAt: new Date().toISOString(),
      purchased: false,
    };

    await set(
      ref(database, `households/${currentHousehold}/shoppingList/${itemId}`),
      shoppingItem
    );

    return itemId;
  };

  const updateShoppingListItem = async (itemId, updates) => {
    if (!currentHousehold) throw new Error('No household selected');

    await update(
      ref(database, `households/${currentHousehold}/shoppingList/${itemId}`),
      updates
    );
  };

  const deleteShoppingListItem = async (itemId) => {
    if (!currentHousehold) throw new Error('No household selected');

    await remove(ref(database, `households/${currentHousehold}/shoppingList/${itemId}`));
  };

  const reconcileShoppingList = async (itemId, newQuantity) => {
    if (!currentHousehold) throw new Error('No household selected');

    const shoppingItem = shoppingList[itemId];
    if (shoppingItem) {
      const existingItem = Object.values(inventory).find(
        (item) => item.name.toLowerCase() === shoppingItem.name.toLowerCase()
      );

      if (existingItem) {
        const newTotal = existingItem.quantity + newQuantity;
        await updateInventoryItem(existingItem.id, {
          quantity: newTotal,
          lastUpdated: new Date().toISOString(),
        });
      } else {
        await addInventoryItem({
          name: shoppingItem.name,
          quantity: newQuantity,
          unit: shoppingItem.unit,
          category: 'Sonstiges',
        });
      }

      await deleteShoppingListItem(itemId);
    }
  };

  return (
    <HouseholdContext.Provider
      value={{
        currentHousehold,
        inventory,
        shoppingList,
        householdMembers,
        chatMessages,
        recurringFoods,
        nutritionProfile,
        nutritionLogs,
        recipeFavorites,
        chatNotification,
        loading,
        createHousehold,
        joinHousehold,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addToShoppingList,
        updateShoppingListItem,
        deleteShoppingListItem,
        reconcileShoppingList,
        sendChatMessage,
        enableChatNotifications,
        dismissChatNotification: () => setChatNotification(null),
        addRecurringFood,
        deleteRecurringFood,
        saveNutritionProfile,
        disableNutrition,
        addNutritionLog,
        deleteNutritionLog,
        toggleRecipeFavorite,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
};