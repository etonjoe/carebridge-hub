
import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar 
} from 'react-native';
import { HeartPulse, Stethoscope, UserCheck, ShieldCheck, ChevronRight } from 'lucide-react-native';

const COLORS = {
  primary: '#2563eb',
  background: '#f8fafc',
  white: '#ffffff',
  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  success: '#10b981'
};

export default function App() {
  const [view, setView] = useState('landing');

  const LandingScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <HeartPulse color={COLORS.white} size={32} />
        </View>
        <Text style={styles.title}>CareBridge Hub</Text>
        <Text style={styles.subtitle}>Mobile Workforce Management</Text>
      </View>

      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.roleCard} onPress={() => setView('login')}>
          <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
            <Stethoscope color={COLORS.primary} size={24} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Health Professional</Text>
            <Text style={styles.cardDesc}>Log visits and view care plans</Text>
          </View>
          <ChevronRight color={COLORS.textSecondary} size={20} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.roleCard} onPress={() => setView('login')}>
          <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
            <UserCheck color={COLORS.success} size={24} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Patient / Family</Text>
            <Text style={styles.cardDesc}>Track care and manage payments</Text>
          </View>
          <ChevronRight color={COLORS.textSecondary} size={20} />
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>MDCN & NMCN COMPLIANCE READY</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <LandingScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },
  cardContainer: {
    width: '100%',
    gap: 16,
  },
  roleCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconBox: {
    padding: 12,
    borderRadius: 16,
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cardDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  footerText: {
    marginTop: 'auto',
    fontSize: 10,
    fontWeight: '900',
    color: '#cbd5e1',
    letterSpacing: 2,
  }
});
