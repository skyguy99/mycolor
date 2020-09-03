import React from 'react';
import {useRef} from 'react';
import { Component, useState, useEffect } from 'react';
import { useFonts } from '@use-expo/font';
import { AppLoading } from 'expo';
import Constants from 'expo-constants';
import { FloatingMenu } from 'react-native-floating-action-menu';
import { StyleSheet, Text, View, Image, ImageBackground, Animated, Easing, StatusBar, FlatList, SafeAreaView, ScrollView, TouchableWithoutFeedback, TouchableOpacity, Dimensions } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
  listenOrientationChange as lor,
  removeOrientationListener as rol
} from 'react-native-responsive-screen';
import { RadioButton } from 'react-native-paper';

import AssetExample from './AssetExample';
import { quizQuestions } from './quizData';
import { colors } from './colors';
import {
  convertIndexToAnswer,
  checkForTie,
  calculateResultIndex,
  convertIndexToColorName,
} from './answerFunctions';

export default function App() {

  let [fontsLoaded] = useFonts({
        'CircularStd-Book' : require('./assets/CircularStd-Book.ttf'),
        'CircularStd-Black' : require('./assets/CircularStd-Black.ttf'),
  });

  const [backgroundColor, setBackgroundColor] = React.useState(new Animated.Value(0));
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const SliderWidth = Dimensions.get('screen').width;
  const colorMenuItems = [
    { label: 'Do a little dance' },
    { label: 'Make a lil love' },
    { label: 'Get down tonight' },
  ];

  //Functions

  function elevationShadowStyle(elevation) {
    return {
      elevation,
      shadowColor: 'black',
      shadowOffset: { width: 0, height: 0.5 * elevation },
      shadowOpacity: 0.1,
      shadowRadius: 0.8 * elevation
    };
  }

  const handleMenuToggle = isMenuOpen =>
    setIsMenuOpen(isMenuOpen);

  const handleItemPress = (item, index) =>
    console.log('pressed item', item);

  const endBackgroundColorAnimation = () => {
    Animated.timing(backgroundColor, {
      toValue: 0,
      duration: 10000,
      useNativeDriver: false
    }).start(() => {
      setBackgroundColor(new Animated.Value(0));
    });
  };

  const startBackgroundColorAnimation = () => {
    Animated.timing(backgroundColor, {
      toValue: 150,
      duration: 10000,
      useNativeDriver: false
    }).start(() => {
      endBackgroundColorAnimation();
    });
  };

  React.useEffect(() => {
    if (backgroundColor._value === 0) {
      startBackgroundColorAnimation();
    }
  }, [backgroundColor, startBackgroundColorAnimation]);

//------------------------------------------------------------------->
  if (!fontsLoaded) {
    return <AppLoading />;
  } else {

const styles = StyleSheet.create({
  shadow1: elevationShadowStyle(5),
  shadow2: elevationShadowStyle(10),
  shadow3: elevationShadowStyle(20),
  box: {
    borderRadius: 8,
    backgroundColor: 'white',
    padding: 24
  },

  // supporting styles
  container: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: '#fff',
    padding: 24
  },
  centerContent: {
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  headerText: {

  },
  bodyText: {

  },
  colorChanging: {
    backgroundColor: '#ecf0f1',
  }
});

//VIEW ELEMENTS ------------------------------------------------------
  return (
    <View style={[styles.container, styles.centerContent]}>
        {/* Third shadow variant */}
        <Animated.View style={[styles.box, styles.centerContent, styles.shadow3]}>
          <Text style = {{fontFamily: 'CircularStd-Book', color: 'black'}}>Hello world</Text>
        </Animated.View>
        <Animated.View style = {{width: 300, height: 300, backgroundColor: backgroundColor.interpolate({
            inputRange: [0, 30, 60, 90, 120, 150],
            outputRange: [
              '#fca500',
              '#0081d1',
              '#6fa229',
              '#939598',
              '#d12b51',
              '#b15de6',
            ],
          }),}}>
        </Animated.View>

        <FloatingMenu
            items={colorMenuItems}
            isOpen={isMenuOpen}
            onMenuToggle={handleMenuToggle}
            onItemPress={handleItemPress}
          />
      </View>
  );
  }
}
