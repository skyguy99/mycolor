import React from 'react';
import {useRef} from 'react';
import { Component, useState, useEffect } from 'react';
import { useFonts } from '@use-expo/font';
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
  return (
    <View style={[styles.container, styles.centerContent]}>
        {/* First shadow variant */}
        <View style={[styles.box, styles.centerContent, styles.shadow1]}>
          <View style={styles.ball} />
        </View>

        {/* Second shadow variant */}
        <View style={[styles.box, styles.centerContent, styles.shadow2]}>
          <View style={styles.ball} />
        </View>

        {/* Third shadow variant */}
        <View style={[styles.box, styles.centerContent, styles.shadow3]}>
          <View style={styles.ball} />
        </View>
      </View>
  );
}

function elevationShadowStyle(elevation) {
  return {
    elevation,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0.5 * elevation },
    shadowOpacity: 0.1,
    shadowRadius: 0.8 * elevation
  };
}

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
    backgroundColor: '#ecf0f1',
    padding: 24
  },
  centerContent: {
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  ball: {
    borderRadius: 128,
    width: 128,
    height: 128,
    backgroundColor: 'lightblue'
  }
});
