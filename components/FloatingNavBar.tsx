import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FloatingNavBarProps {
  activeTab?: string;
  onTabPress?: (tab: string) => void;
  bottomSheetState?: 'collapsed' | 'middle' | 'expanded';
}

export default function FloatingNavBar({ activeTab = 'taxi', onTabPress, bottomSheetState = 'collapsed' }: FloatingNavBarProps) {
  const animatedValue = useRef(new Animated.Value(1)).current;

  const navItems = [
    { id: 'bus', icon: 'bus-outline', label: 'Bus' },
    { id: 'home', icon: 'home-outline', label: 'Home' },
    { id: 'taxi', icon: 'car-outline', label: 'Taxi' },
  ];

  useEffect(() => {
    // Show nav bar when bottom sheet is in middle or expanded state
    // Hide nav bar when bottom sheet is collapsed
    const shouldShow = bottomSheetState === 'middle' || bottomSheetState === 'expanded';
    
    Animated.timing(animatedValue, {
      toValue: shouldShow ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [bottomSheetState, animatedValue]);

  return (
    <Animated.View style={[
      styles.container,
      {
        opacity: animatedValue,
        transform: [
          {
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [100, 0],
            }),
          },
          {
            scale: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }),
          },
        ],
      },
    ]}>
      <View style={styles.navigationBar}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.navItem,
              activeTab === item.id && styles.activeNavItem
            ]}
            onPress={() => onTabPress?.(item.id)}
          >
            <Ionicons
              name={item.icon as any}
              size={24}
              color={activeTab === item.id ? '#007AFF' : '#8E8E93'}
            />
            <Text style={[
              styles.navLabel,
              activeTab === item.id && styles.activeNavLabel
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  navigationBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    minWidth: 50,
  },
  activeNavItem: {
    backgroundColor: '#F0F8FF',
  },
  navLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeNavLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
