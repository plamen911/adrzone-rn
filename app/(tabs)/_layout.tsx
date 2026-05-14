import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/useTheme';
import { bg } from '../../src/i18n/bg';

export default function TabsLayout() {
  const t = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: t.accent,
        tabBarInactiveTintColor: t.textMuted,
        tabBarStyle: {
          backgroundColor: t.surface,
          borderTopColor: t.border,
        },
        headerStyle: { backgroundColor: t.surface },
        headerTitleStyle: { color: t.text, fontWeight: '700' },
        headerTintColor: t.accent,
        sceneStyle: { backgroundColor: t.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: bg.tabs.search,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: bg.tabs.browse,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: bg.tabs.about,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="information-circle" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
