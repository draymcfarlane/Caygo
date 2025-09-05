import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height: screenHeight } = Dimensions.get('window');

type BottomSheetState = 'collapsed' | 'middle' | 'expanded';

interface BottomSheetProps {
  state: BottomSheetState;
  onStateChange: (state: BottomSheetState) => void;
}

export default function BottomSheet({ state, onStateChange }: BottomSheetProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const isDragging = useRef(false);
  const morphProgress = useRef(new Animated.Value(0)).current; // 0 = drag bar, 1 = arrow

  // Define the heights for each state
  const COLLAPSED_HEIGHT = 100;
  const MIDDLE_HEIGHT = screenHeight * 0.4;
  const EXPANDED_HEIGHT = screenHeight * 0.7;

  // Get the target translateY for each state (positive values move down from expanded position)
  const getTranslateYForState = (targetState: BottomSheetState): number => {
    switch (targetState) {
      case 'expanded': return 0;
      case 'middle': return EXPANDED_HEIGHT - MIDDLE_HEIGHT;
      case 'collapsed': return EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
      default: return EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
    }
  };

  // Find the closest state based on current translateY value
  const getClosestState = (currentTranslateY: number): BottomSheetState => {
    const collapsedY = getTranslateYForState('collapsed');
    const middleY = getTranslateYForState('middle');
    const expandedY = getTranslateYForState('expanded');

    const distanceToCollapsed = Math.abs(currentTranslateY - collapsedY);
    const distanceToMiddle = Math.abs(currentTranslateY - middleY);
    const distanceToExpanded = Math.abs(currentTranslateY - expandedY);

    if (distanceToCollapsed <= distanceToMiddle && distanceToCollapsed <= distanceToExpanded) {
      return 'collapsed';
    } else if (distanceToMiddle <= distanceToExpanded) {
      return 'middle';
    } else {
      return 'expanded';
    }
  };

  // Animate to target state
  const animateToState = (targetState: BottomSheetState) => {
    const targetY = getTranslateYForState(targetState);
    Animated.spring(translateY, {
      toValue: targetY,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  // Animate handle transformation
  const animateHandle = (targetState: BottomSheetState) => {
    const targetValue = targetState === 'collapsed' ? 1 : 0;
    Animated.spring(morphProgress, {
      toValue: targetValue,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
  };

  // Update animation when state changes externally
  useEffect(() => {
    if (!isDragging.current) {
      animateToState(state);
    }
    animateHandle(state);
  }, [state]);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > 5;
    },
    onPanResponderGrant: () => {
      isDragging.current = true;
      translateY.setOffset((translateY as any)._value);
      translateY.setValue(0);
    },
    onPanResponderMove: (evt, gestureState) => {
      // Constrain the movement within bounds
      const currentOffset = (translateY as any)._offset || 0;
      const newValue = gestureState.dy;
      const totalTranslateY = currentOffset + newValue;

      // Set bounds: don't go above expanded (0) or below collapsed (max positive value)
      const minY = getTranslateYForState('expanded'); // 0
      const maxY = getTranslateYForState('collapsed'); // positive value

      if (totalTranslateY >= minY && totalTranslateY <= maxY) {
        translateY.setValue(newValue);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      isDragging.current = false;
      translateY.flattenOffset();

      const currentY = (translateY as any)._value;
      const closestState = getClosestState(currentY);
      
      let targetState = closestState;
      
      // Consider velocity for better UX
      if (Math.abs(gestureState.vy) > 0.5) {
        if (gestureState.vy > 0) {
          // Fast downward swipe - go to next lower state
          targetState = closestState === 'expanded' ? 'middle' : 
                       closestState === 'middle' ? 'collapsed' : 'collapsed';
        } else {
          // Fast upward swipe - go to next higher state
          targetState = closestState === 'collapsed' ? 'middle' : 
                       closestState === 'middle' ? 'expanded' : 'expanded';
        }
      }
      
      // Always animate to the target state immediately, don't wait for state change
      animateToState(targetState);
      
      // Also update the external state
      onStateChange(targetState);
    },
  });

  const getHeightForState = (targetState: BottomSheetState): number => {
    switch (targetState) {
      case 'collapsed': return COLLAPSED_HEIGHT;
      case 'middle': return MIDDLE_HEIGHT;
      case 'expanded': return EXPANDED_HEIGHT;
      default: return COLLAPSED_HEIGHT;
    }
  };

  const getNextState = (currentState: BottomSheetState, direction: 'up' | 'down'): BottomSheetState => {
    if (direction === 'up') {
      switch (currentState) {
        case 'collapsed': return 'middle';
        case 'middle': return 'expanded';
        case 'expanded': return 'expanded';
        default: return currentState;
      }
    } else {
      switch (currentState) {
        case 'expanded': return 'middle';
        case 'middle': return 'collapsed';
        case 'collapsed': return 'collapsed';
        default: return currentState;
      }
    }
  };

  const handleTap = () => {
    const nextState = getNextState(state, 'up');
    onStateChange(nextState);
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          height: getHeightForState('expanded'), // Use max height as base
          transform: [{ translateY }]
        }
      ]}
    >
      {/* Drag Handle */}
      <View style={styles.dragHandle} {...panResponder.panHandlers}>
        <TouchableOpacity onPress={handleTap} style={styles.dragHandleButton}>
          {/* Morphing Handle - Drag Bar */}
          <Animated.View 
            style={[
              styles.dragBar,
              {
                opacity: morphProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
                transform: [
                  {
                    scaleY: morphProgress.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 0.3, 0],
                    }),
                  },
                  {
                    scaleX: morphProgress.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [1, 1.2, 0.8],
                    }),
                  },
                ],
              },
            ]}
          />
          
          {/* Morphing Handle - Arrow */}
          <Animated.View 
            style={[
              styles.arrowContainer,
              {
                position: 'absolute',
                opacity: morphProgress.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.3, 1],
                }),
                transform: [
                  {
                    scale: morphProgress.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.3, 0.7, 1],
                    }),
                  },
                  {
                    rotateX: morphProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['90deg', '0deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons name="chevron-up" size={28} color="#8E8E93" />
          </Animated.View>
        </TouchableOpacity>
      </View>
      
      {/* Content Area - Only show when not collapsed */}
      {state !== 'collapsed' && (
        <View style={styles.content}>
          <Text style={styles.title}>Bottom Sheet Content</Text>
          <Text style={styles.subtitle}>This is where your content goes</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  collapsedHeight: {
    height: 200,
  },
  middleHeight: {
    height: screenHeight * 0.4,
  },
  expandedHeight: {
    height: screenHeight * 0.7,
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  dragHandleButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  dragBar: {
    width: 50,
    height: 5,
    backgroundColor: '#D1D5DB',
    borderRadius: 3,
  },
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
});
