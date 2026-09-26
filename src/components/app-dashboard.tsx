import { useContext, useState, type Context } from 'react';
import { Alert, Image, Platform, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import NutritionScreen from './nutrition-screen';
import NutritionSummary from './nutrition-summary';
import RecipeScreen from './recipe-screen';

const { InventoryScreen } = require('../SMART Vorrat/screens/InventoryScreen');
const { ShoppingListScreen } = require('../SMART Vorrat/screens/ShoppingListScreen');
const { AuthContext } = require('../SMART Vorrat/AuthContext');
const { HouseholdContext } = require('../HouseholdContext');
const HouseholdChatScreen = require('../SMART Vorrat/screens/HouseholdChatScreen').default;
const FoodSearchInput = require('../SMART Vorrat/components/FoodSearchInput').default;

type DashboardView = 'inventory' | 'shopping' | 'overview' | 'household' | 'chat' | 'nutrition' | 'recipes' | 'settings' | 'impressum';

export default function AppDashboard() {
  const { user, userProfile, logOut } = useContext(AuthContext as Context<any>);
  const { currentHousehold, inventory, shoppingList, householdMembers, recurringFoods, nutritionProfile, nutritionLogs, recipeFavorites, toggleRecipeFavorite, saveNutritionProfile, disableNutrition, addNutritionLog, deleteNutritionLog, addRecurringFood, deleteRecurringFood, addToShoppingList, chatNotification, dismissChatNotification, enableChatNotifications } = useContext(
    HouseholdContext as Context<any>
  );
  const [activeView, setActiveView] = useState<DashboardView>(() => {
    if (typeof window !== 'undefined') {
      const savedView = window.sessionStorage.getItem('haushalt-dashboard-view');
      if (savedView) return savedView as DashboardView;
    }
    return 'overview';
  });

  const navigate = (view: DashboardView) => {
    setActiveView(view);
    if (typeof window !== 'undefined') window.sessionStorage.setItem('haushalt-dashboard-view', view);
  };

  const navigation: [DashboardView, string, string][] = [
    ['overview', 'Übersicht', '⌂'],
    ['shopping', 'Einkaufsliste', '✓'],
    ['inventory', 'Vorrat', '▣'],
    ['recipes', 'Rezepte', '♨'],
    ['settings', 'Einstellungen', '⚙'],
  ];
  if (nutritionProfile?.enabled) navigation.splice(3, 0, ['nutrition', 'Ernährung', '◉']);

  const handleDisableNutrition = async () => {
    await disableNutrition();
    navigate('overview');
  };

  return (
    <View style={styles.appContainer}>
      <View style={styles.screenContainer}>
        {activeView === 'inventory' && <InventoryScreen onOpenNutrition={() => navigate('nutrition')} />}
        {activeView === 'shopping' && <ShoppingListScreen />}
        {activeView === 'recipes' && (
          <RecipeScreen
            favoriteIds={recipeFavorites}
            nutritionEnabled={Boolean(nutritionProfile?.enabled)}
            inventory={inventory}
            addToShoppingList={addToShoppingList}
            toggleFavorite={toggleRecipeFavorite}
            logNutrition={addNutritionLog}
          />
        )}
        {activeView === 'overview' && (
          <OverviewScreen
            inventory={inventory}
            shoppingList={shoppingList}
            nutritionProfile={nutritionProfile}
            nutritionLogs={nutritionLogs}
            onOpenNutrition={() => navigate('nutrition')}
          />
        )}
        {activeView === 'nutrition' && (
          <NutritionScreen
            profile={nutritionProfile}
            logs={nutritionLogs}
            inventory={inventory}
            onSaveProfile={saveNutritionProfile}
            onDisable={handleDisableNutrition}
            onAddLog={addNutritionLog}
            onDeleteLog={deleteNutritionLog}
          />
        )}
        {activeView === 'household' && (
          <HouseholdScreen householdId={currentHousehold} members={householdMembers} onOpenChat={() => navigate('chat')} onEnableNotifications={enableChatNotifications} />
        )}
        {activeView === 'chat' && <HouseholdChatScreen />}
        {activeView === 'impressum' && <ImpressumScreen />}
        {activeView === 'settings' && (
          <SettingsScreen
            user={user}
            userProfile={userProfile}
            onLogOut={logOut}
            onOpenHousehold={() => navigate('household')}
                      recurringFoods={recurringFoods}
                      addRecurringFood={addRecurringFood}
                      deleteRecurringFood={deleteRecurringFood}
                      addToShoppingList={addToShoppingList}
                      shoppingList={shoppingList}
                      onOpenImpressum={() => navigate('impressum')}
          />
        )}
      </View>
      {chatNotification && (
        <View style={styles.chatToast}>
          <View style={styles.chatToastText}>
            <Text style={styles.chatToastTitle}>Neue Chat-Nachricht</Text>
            <Text numberOfLines={1} style={styles.chatToastMessage}>{chatNotification.userName}: {chatNotification.text || 'Food-Foto'}</Text>
          </View>
          <TouchableOpacity onPress={dismissChatNotification}>
            <Text style={styles.chatToastClose}>×</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.tabBar}>
        {navigation.map(([view, label, icon]) => (
          <TouchableOpacity
            key={view}
            style={[styles.tabItem, activeView === view && styles.activeTab]}
            onPress={() => navigate(view)}>
            <Text style={[styles.tabIcon, activeView === view && styles.activeTabText]}>{icon}</Text>
            <Text style={[styles.tabLabel, activeView === view && styles.activeTabText]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function OverviewScreen({ inventory, shoppingList, nutritionProfile, nutritionLogs, onOpenNutrition }: { inventory: any; shoppingList: any; nutritionProfile: any; nutritionLogs: any; onOpenNutrition: () => void }) {
  const inventoryItems = Object.values(inventory || {}) as any[];
  const shoppingItems = Object.values(shoppingList || {}) as any[];
  const totalQuantity = inventoryItems.reduce((total, item) => total + Number(item.quantity || 0), 0);
  const lowStock = inventoryItems.filter((item) => Number(item.quantity || 0) <= 1).length;
  const categories = new Set(inventoryItems.map((item) => item.category).filter(Boolean)).size;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Image
        source={require('../../assets/images/app-logo.png.png')}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Haushalt Inventory Logo"
      />
      <Text style={styles.pageTitle}>Übersicht</Text>
      <View style={styles.statsGrid}>
        <StatCard label="Artikel" value={inventoryItems.length} />
        <StatCard label="Gesamtmenge" value={totalQuantity} />
        <StatCard label="Kategorien" value={categories} />
        <StatCard label="Einkaufsliste" value={shoppingItems.length} />
      </View>
      {nutritionProfile?.enabled ? (
        <NutritionSummary profile={nutritionProfile} logs={nutritionLogs} onPress={onOpenNutrition} />
      ) : (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Ernährung</Text>
          <Text style={styles.mutedText}>Lege persönliche Tagesziele fest und protokolliere Lebensmittel aus deinem Vorrat.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={onOpenNutrition}>
            <Text style={styles.primaryButtonText}>Ernährung aktivieren</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Niedriger Bestand</Text>
        <Text style={styles.infoValue}>{lowStock} Artikel mit höchstens 1 Einheit</Text>
      </View>
    </ScrollView>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function HouseholdScreen({ householdId, members, onOpenChat, onEnableNotifications }: { householdId: string; members: any; onOpenChat: () => void; onEnableNotifications: () => void }) {
  const memberEntries = Object.entries(members || {}) as [string, any][];
  const baseUrl = Platform.OS === 'web' && typeof window !== 'undefined'
    ? window.location.origin
    : 'haushaltinventory://join';
  const inviteLink = `${baseUrl}/?householdId=${encodeURIComponent(householdId || '')}`;

  const shareInvite = async () => {
    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({ title: 'Haushalt beitreten', text: 'Tritt unserem Haushalt bei.', url: inviteLink });
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(inviteLink);
          Alert.alert('Einladungslink kopiert', 'Der Link liegt jetzt in der Zwischenablage.');
        } else {
          Alert.alert('Einladungslink', inviteLink);
        }
        return;
      }
      await Share.share({ message: `Tritt unserem Haushalt bei: ${inviteLink}` });
    } catch (error: any) {
      if (error?.name !== 'AbortError') Alert.alert('Fehler', 'Der Einladungslink konnte nicht geteilt werden.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Haushalt</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Haushalt-ID</Text>
        <Text selectable style={styles.householdId}>{householdId || 'Nicht verfügbar'}</Text>
        <Text style={styles.mutedText}>Teile diese ID, damit andere Mitglieder beitreten können.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={shareInvite}>
          <Text style={styles.primaryButtonText}>Einladungslink teilen</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>Mitglieder ({memberEntries.length})</Text>
      <TouchableOpacity style={styles.primaryButton} onPress={onOpenChat}>
        <Text style={styles.primaryButtonText}>Haushalt-Chat öffnen</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={onEnableNotifications}>
        <Text style={styles.secondaryButtonText}>Chat-Benachrichtigungen aktivieren</Text>
      </TouchableOpacity>
      {memberEntries.map(([id, member]) => (
        <View key={id} style={styles.memberRow}>
          <View>
            <Text style={styles.memberName}>{member.name || 'Unbekannt'}</Text>
            <Text style={styles.mutedText}>{member.email || ''}</Text>
          </View>
          <Text style={styles.roleText}>{member.role || 'Mitglied'}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function SettingsScreen({ user, userProfile, onLogOut, onOpenHousehold, onOpenImpressum, recurringFoods, addRecurringFood, deleteRecurringFood, addToShoppingList, shoppingList }: { user: any; userProfile: any; onLogOut: () => void; onOpenHousehold: () => void; onOpenImpressum: () => void; recurringFoods: any; addRecurringFood: (food: any) => Promise<void>; deleteRecurringFood: (id: string) => Promise<void>; addToShoppingList: (...args: any[]) => Promise<void>; shoppingList: any }) {
  const [weeklyName, setWeeklyName] = useState('');
  const [weeklyQuantity, setWeeklyQuantity] = useState('1');
  const [weeklyUnit, setWeeklyUnit] = useState('Stück');
  const [weeklyImage, setWeeklyImage] = useState(null);
  const recurringEntries = Object.values(recurringFoods || {}) as any[];

  const saveWeeklyFood = async () => {
    if (!weeklyName.trim()) return;
    await addRecurringFood({ name: weeklyName.trim(), quantity: weeklyQuantity, unit: weeklyUnit, imageUrl: weeklyImage });
    setWeeklyName('');
    setWeeklyQuantity('1');
    setWeeklyUnit('Stück');
    setWeeklyImage(null);
  };

  const addWeeklyFoodsToList = async () => {
    const existingNames = new Set(Object.values(shoppingList || {}).map((item: any) => item.name?.trim().toLowerCase()));
    for (const food of recurringEntries) {
      if (!existingNames.has(food.name.trim().toLowerCase())) {
        await addToShoppingList(food.name, food.quantity, 0, food.unit, '', food.imageUrl || null);
        existingNames.add(food.name.trim().toLowerCase());
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Einstellungen</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Profil</Text>
        <Text style={styles.profileName}>{userProfile?.displayName || user?.displayName || 'Benutzer'}</Text>
        <Text style={styles.mutedText}>{user?.email || 'Keine E-Mail-Adresse'}</Text>
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={onOpenHousehold}>
        <Text style={styles.primaryButtonText}>Haushalt verwalten</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={onOpenImpressum}>
        <Text style={styles.secondaryButtonText}>Impressum</Text>
      </TouchableOpacity>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Wöchentlicher Bedarf</Text>
        <Text style={styles.mutedText}>Diese Lebensmittel brauchst du regelmäßig.</Text>
        <FoodSearchInput
          value={weeklyName}
          onChangeText={setWeeklyName}
          onSelect={(product: any) => {
            setWeeklyName(product.name);
            setWeeklyImage(product.imageUrl || null);
          }}
        />
        <View style={styles.weeklyRow}>
          <TextInput style={styles.weeklyQuantity} value={weeklyQuantity} onChangeText={setWeeklyQuantity} keyboardType="decimal-pad" placeholder="Menge" />
          <View style={styles.weeklyUnits}>
            {['Stück', 'kg', 'L'].map((unit) => (
              <TouchableOpacity key={unit} style={[styles.weeklyUnit, weeklyUnit === unit && styles.weeklyUnitActive]} onPress={() => setWeeklyUnit(unit)}>
                <Text style={styles.weeklyUnitText}>{unit}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={saveWeeklyFood}>
          <Text style={styles.primaryButtonText}>Wöchentlichen Artikel speichern</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={addWeeklyFoodsToList}>
          <Text style={styles.secondaryButtonText}>Alle Wochenartikel zur Einkaufsliste</Text>
        </TouchableOpacity>
        {recurringEntries.map((food) => (
          <View key={food.id} style={styles.weeklyFoodRow}>
            {food.imageUrl ? <Image source={{ uri: food.imageUrl }} style={styles.weeklyImage} /> : null}
            <Text style={styles.weeklyFoodName}>{food.name} · {food.quantity} {food.unit}</Text>
            <TouchableOpacity onPress={() => addToShoppingList(food.name, food.quantity, 0, food.unit, '', food.imageUrl)}>
              <Text style={styles.weeklyAdd}>+ Liste</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteRecurringFood(food.id)}>
              <Text style={styles.weeklyDelete}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.dangerButton} onPress={onLogOut}>
        <Text style={styles.dangerButtonText}>Abmelden</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function ImpressumScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Impressum</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Angaben gemäß § 5 TMG</Text>
        <Text style={styles.legalText}>Sebastian Schöffel</Text>
        <Text style={styles.legalText}>82064 München, Bayern</Text>
        <Text style={styles.legalText}>Deutschland</Text>
        <Text style={styles.infoTitle}>Kontakt</Text>
        <Text style={styles.legalText}>E-Mail: sebastianschoeffel@gmx.net</Text>
        <Text style={styles.infoTitle}>Verantwortlich für den Inhalt</Text>
        <Text style={styles.legalText}>Sebastian Schöffel</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  appContainer: { flex: 1 },
  screenContainer: { flex: 1 },
  logo: { alignSelf: 'center', borderRadius: 18, height: 96, marginBottom: 16, width: 96 },
  tabBar: { backgroundColor: '#fff', borderTopColor: '#ddd', borderTopWidth: 1, flexDirection: 'row', paddingBottom: 6, paddingTop: 6 },
  tabItem: { alignItems: 'center', flex: 1, gap: 2, paddingVertical: 4 },
  activeTab: { backgroundColor: '#E8F5E9', borderRadius: 8, marginHorizontal: 4 },
  tabIcon: { color: '#657176', fontSize: 18, lineHeight: 20 },
  tabLabel: { color: '#657176', fontSize: 11, fontWeight: '600' },
  activeTabText: { color: '#2E7D32' },
  content: { backgroundColor: '#ede8D0', flexGrow: 1, padding: 20 },
  pageTitle: { color: '#263238', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { backgroundColor: '#fff', borderRadius: 8, minWidth: 140, padding: 18, flexGrow: 1 },
  statValue: { color: '#06837d', fontSize: 28, fontWeight: 'bold' },
  statLabel: { color: '#666', marginTop: 6 },
  infoCard: { backgroundColor: '#fff', borderRadius: 8, marginTop: 16, padding: 18 },
  infoTitle: { color: '#263238', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  infoValue: { color: '#555', fontSize: 16 },
  householdId: { color: '#06837d', fontSize: 17, fontWeight: '600', marginBottom: 8 },
  mutedText: { color: '#777', marginTop: 4 },
  sectionTitle: { color: '#263238', fontSize: 20, fontWeight: 'bold', marginTop: 24, marginBottom: 10 },
  memberRow: { backgroundColor: '#fff', borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, padding: 16 },
  memberName: { color: '#333', fontSize: 16, fontWeight: '600' },
  roleText: { color: '#06837d', fontWeight: '600' },
  profileName: { color: '#333', fontSize: 20, fontWeight: '600' },
  primaryButton: { alignItems: 'center', backgroundColor: '#06837d', borderRadius: 8, marginTop: 16, padding: 14 },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  dangerButton: { alignItems: 'center', backgroundColor: '#8D2F2F', borderRadius: 8, marginTop: 20, padding: 14 },
  dangerButtonText: { color: '#fff', fontWeight: '600' },
  legalText: { color: '#333', fontSize: 15, lineHeight: 23, marginBottom: 4 },
  legalHint: { color: '#8D2F2F', fontSize: 13, lineHeight: 19, marginTop: 16 },
  secondaryButton: { alignItems: 'center', borderColor: '#06837d', borderRadius: 8, borderWidth: 1, marginTop: 10, padding: 14 },
  secondaryButtonText: { color: '#06837d', fontWeight: '700' },
  chatToast: { alignItems: 'center', backgroundColor: '#fff', borderColor: '#06837d', borderRadius: 10, borderWidth: 1, bottom: 76, elevation: 8, flexDirection: 'row', left: 16, maxWidth: 420, padding: 12, position: 'absolute', right: 16, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 8, zIndex: 50 },
  chatToastText: { flex: 1 },
  chatToastTitle: { color: '#06837d', fontWeight: '800' },
  chatToastMessage: { color: '#444', marginTop: 3 },
  chatToastClose: { color: '#777', fontSize: 22, marginLeft: 10 },
  weeklyRow: { gap: 8, marginTop: 12 },
  weeklyQuantity: { backgroundColor: '#fff', borderColor: '#ddd', borderRadius: 7, borderWidth: 1, padding: 10 },
  weeklyUnits: { flexDirection: 'row', gap: 6 },
  weeklyUnit: { borderColor: '#ddd', borderRadius: 6, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  weeklyUnitActive: { backgroundColor: '#e1f2f0', borderColor: '#06837d' },
  weeklyUnitText: { color: '#333', fontSize: 12 },
  weeklyFoodRow: { alignItems: 'center', borderBottomColor: '#eee', borderBottomWidth: 1, flexDirection: 'row', gap: 8, paddingVertical: 10 },
  weeklyImage: { borderRadius: 5, height: 36, width: 36 },
  weeklyFoodName: { color: '#333', flex: 1, fontWeight: '600' },
  weeklyAdd: { color: '#06837d', fontWeight: '700' },
  weeklyDelete: { color: '#c62828', fontSize: 20 },
});
