import React, { useEffect, useMemo, useRef, useState } from 'react';
import MapView, { PROVIDER_GOOGLE, LatLng } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';
import BottomSheet from '../../components/BottomSheet';
import FloatingNavBar from '../../components/FloatingNavBar';

// Set boundary (any 4 points)
const SQUARE: LatLng[] = [
  { latitude: 19.4150, longitude: -81.4000 }, // NW
  { latitude: 19.4150, longitude: -81.1000 }, // NE
  { latitude: 19.2400, longitude: -81.1000 }, // SE
  { latitude: 19.2400, longitude: -81.4000 }, // SW
];

// Extend MapView type to include the (platform-specific) method
type MapViewWithBoundaries = MapView & {
  setMapBoundaries?: (ne: LatLng, sw: LatLng) => void;
};

export default function BGMap() {
  const mapRef = useRef<MapViewWithBoundaries | null>(null);
  const [bottomSheetState, setBottomSheetState] = useState<'collapsed' | 'middle' | 'expanded'>('collapsed');
  const [activeTab, setActiveTab] = useState('taxi');

  const { NE, SW } = useMemo(() => {
    const lats = SQUARE.map(p => p.latitude);
    const lngs = SQUARE.map(p => p.longitude);
    return {
      NE: { latitude: Math.max(...lats), longitude: Math.max(...lngs) },
      SW: { latitude: Math.min(...lats), longitude: Math.min(...lngs) },
    };
  }, []);

  useEffect(() => {
    // Run after the map lays out (or use onMapReady)
    const t = setTimeout(() => {
      mapRef.current?.setMapBoundaries?.(NE, SW); // note the optional call
    }, 0);
    return () => clearTimeout(t);
  }, [NE, SW]);

  const handleBottomSheetStateChange = (newState: 'collapsed' | 'middle' | 'expanded') => {
    setBottomSheetState(newState);
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE} // required for setMapBoundaries on iOS
        initialRegion={{
          latitude: 19.3056,
          longitude: -81.2408,
          latitudeDelta: 0.05,
          longitudeDelta: 0.047,
        }}
        // also clamp zoom with deprecated props (still work):
        minZoomLevel={10.5}
        maxZoomLevel={19}
      />
      <BottomSheet 
        state={bottomSheetState}
        onStateChange={handleBottomSheetStateChange}
      />
      <FloatingNavBar 
        activeTab={activeTab}
        onTabPress={handleTabPress}
        bottomSheetState={bottomSheetState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
});
