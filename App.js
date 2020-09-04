import React from 'react';
import {useRef} from 'react';
import { Component, useState, useEffect } from 'react';
import { useFonts } from '@use-expo/font';
import { AppLoading } from 'expo';
import Constants from 'expo-constants';
import { FloatingMenu } from 'react-native-floating-action-menu';
import { Button, Menu, Divider, Provider, RadioButton } from 'react-native-paper';
import { StyleSheet, Text, View, Image, ImageBackground, Animated, Easing, StatusBar, FlatList, SafeAreaView, ScrollView, TouchableWithoutFeedback, TouchableOpacity, Dimensions } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
  listenOrientationChange as lor,
  removeOrientationListener as rol
} from 'react-native-responsive-screen';

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
  const [isSelectingSecondColor, setIsSelectingSecondColor] = React.useState(false);
  const [currentColor, setCurrentColor] = React.useState('#fca500');

  const [splashOffsetY, setSplashOffsetY] = React.useState(new Animated.Value(0));
  const [containerOffsetY, setContainerOffsetY] = React.useState(new Animated.Value(hp('-100%')));

  const SliderWidth = Dimensions.get('screen').width;
  const colorMenuItems = [
    { label: '', color: '#fca500', darkerColor: '#AF7300'},
    { label: '', color: '#0081d1', darkerColor: '#00578D'},
    { label: '', color: '#6fa229', darkerColor: '#47651D'},
    { label: '', color: '#939598', darkerColor: '#5C5D5F'},
    { label: '', color: '#d12b51', darkerColor: '#901F39'},
    { label: '', color: '#b15de6', darkerColor: '#901F39'},
  ];

  //Functions

  function elevationShadowStyle(elevation) {
    return {
      elevation,
      shadowColor: 'black',
      shadowOffset: { width: 0, height: 0.5 * elevation },
      shadowOpacity: 0.2,
      shadowRadius: 0.8 * elevation
    };
  }

  const handleMenuToggle = isMenuOpen =>
    setIsMenuOpen(isMenuOpen);

  const handleItemPress = (item, index) =>
    console.log('pressed item', item.color);

  const renderMenuIcon = (menuState) => {
    const { menuButtonDown } = menuState;

    return menuButtonDown
      ? <Image/> //button up
      : <Image/>; //button down
  }

  const endBackgroundColorAnimation = () => {
    Animated.timing(backgroundColor, {
      toValue: 0,
      duration: 10000,
      easing: Easing.easeOut,
      useNativeDriver: false
    }).start(() => {
      setBackgroundColor(new Animated.Value(0));
    });
  };

  const startBackgroundColorAnimation = () => {
    Animated.timing(backgroundColor, {
      toValue: 150,
      duration: 10000,
      easing: Easing.easeOut,
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

  useEffect(() => {
    const interval = setInterval(() => {

      Animated.parallel([
        Animated.spring(splashOffsetY, {
  				toValue: hp('60%'),
  				bounciness: 11,
  				useNativeDriver: false,
          speed: 1.2
  			}),
        Animated.spring(containerOffsetY, {
  				toValue: hp('-3%'),
  				bounciness: 11,
  				useNativeDriver: false,
          speed: 1.2
  			})
      ]).start();

  }, 0); //add this in
    return () => clearInterval(interval);
  }, []);

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
    padding: 24,
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  contentContainer:
  {
    flex: 1, justifyContent: 'center', transform: [{translateY: containerOffsetY }], width: wp('101%')
  },
  scrollContainer: {
    flex: 1,
    marginTop: hp('6%'),
  },
  topBar: {
    marginTop: hp('7%')
  },
  headerText: {
    fontFamily: 'CircularStd-Black',
    color: 'black',
    fontSize: hp('2.2%'),
    textAlign: 'center'
  },
  bodyText: {
    fontFamily: 'CircularStd-Book',
    color: 'black',
    fontSize: hp('2.2%')
  },
  splash: {
        ...StyleSheet.absoluteFillObject,
        resizeMode: "cover",
        height: hp('100%'),
        width: wp('100%'),
        zIndex: 4,
      },
  scrollView: {
      marginHorizontal: 20,
      paddingLeft: wp('10%'),
      paddingRight: wp('10%'),
      zIndex: 10,
      backgroundColor: 'blue'
    },
});

// <Animated.View style = {{width: 300, height: 300, backgroundColor: backgroundColor.interpolate({
//     inputRange: [0, 30, 60, 90, 120, 150],
//     outputRange: [
//       '#fca500',
//       '#0081d1',
//       '#6fa229',
//       '#939598',
//       '#d12b51',
//       '#b15de6',
//     ],
//   }),}}>
// </Animated.View>

// <Animated.View style={[styles.box, styles.centerContent, styles.shadow3]}>
//   <Text style = {styles.headerText}>Hello world</Text>
// </Animated.View>

//VIEW ELEMENTS ------------------------------------------------------
  return (
    <View style={[styles.container]}>
      <Animated.Image pointerEvents={"none"} style={[styles.splash, { transform: [{translateY: splashOffsetY }]} ]} source={require('./assets/splash2-txt.png')} />

      <Animated.View style={styles.contentContainer}>
          <View style={styles.topBar}>
            <Text style = {[styles.headerText, styles.shadow1]}>Hello world</Text>
          </View>

            <FloatingMenu
                items={colorMenuItems}
                isOpen={isMenuOpen}
                position={"top-right"}
                borderColor={'white'}
                primaryColor={'white'}
                buttonWidth={wp('10%')}
                borderWidth={0}
                onMenuToggle={handleMenuToggle}
                onItemPress={handleItemPress}
                dimmerStyle={{opacity: 0}}
              />
              <View style = {styles.scrollContainer}>
              <SafeAreaView style={{flex: 1}}>
                  <ScrollView
                  showsVerticalScrollIndicator= {false}
                  showsHorizontalScrollIndicator= {false}
                  style={styles.scrollView}>
                    <Text style={styles.bodyText}>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                      eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
                      minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                      aliquip ex ea commodo consequat. Duis aute irure dolor in
                      reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                      pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                      culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                      eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
                      minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                      aliquip ex ea commodo consequat. Duis aute irure dolor in {"\n"}{"\n"}
                      reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                      pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                      culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                      eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
                      minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                      aliquip ex ea commodo consequat. Duis aute irure dolor in
                      reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                      pariatur. Excepteur sint occaecat cupidatat non proident, sunt in {"\n"}{"\n"}
                      culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                      eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
                      minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                      aliquip ex ea commodo consequat. Duis aute irure dolor in
                      reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                      pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                      culpa qui officia deserunt mollit anim id est laborum.
                    </Text>
                  </ScrollView>
                </SafeAreaView>
              </View>
        </Animated.View>
      </View>
  );
  }
}
