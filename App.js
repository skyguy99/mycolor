import React from 'react';
import {useRef} from 'react';
import { Component, useState, useEffect } from 'react';
import AsyncStorage from "@react-native-community/async-storage"
import { useFonts } from '@use-expo/font';
import { AppLoading } from 'expo';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { FloatingMenu } from 'react-native-floating-action-menu';
import { Jiro } from 'react-native-textinput-effects';
import MaskedView from '@react-native-community/masked-view';
import * as Progress from 'expo-progress';
import LottieView from "lottie-react-native";
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

  //persistent vars
  const [username, setUsername] = useState('');
  const [dateOfQuiz, setDateOfQuiz] = useState('no date');
  const [userColor, setUserColor] = useState('no color');

  //quiz vars
  const [progress, setProgress] = useState(new Animated.Value(0));
  const [selectedAnswer, setSelectedAnswer] = React.useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [showResult, setShowResult] = React.useState(false);
  const [userAnswers, setUserAnswers] = React.useState({});
  const [resultColor, setResultColor] = React.useState(''); //persistent
  const [resultAttributes, setResultAttributes] = React.useState('');

  const [backgroundColor, setBackgroundColor] = React.useState(new Animated.Value(0));
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = React.useState(false);
  const [isQuizOpen, setIsQuizOpen] = React.useState(false);
  const [isSelectingSecondColor, setIsSelectingSecondColor] = React.useState(false);
  const [currentColor, setCurrentColor] = React.useState('#fca500');

  const [splashOffsetY, setSplashOffsetY] = React.useState(new Animated.Value(0));
  const [creditsOffsetX, setCreditsOffsetX] = React.useState(new Animated.Value(wp('100%')));
  const [containerOffsetY, setContainerOffsetY] = React.useState(new Animated.Value(hp('-200%')));
  const [containerOffsetX, setContainerOffsetX] = React.useState(new Animated.Value(hp('0%')));
  const [quizOffsetX, setQuizOffsetX] = React.useState(new Animated.Value(-wp('100%')));
  const [scrollOffsetX, setScrollOffsetX] = React.useState(new Animated.Value(0));

  const [bodyText, setBodyText] = React.useState('');
  const [currentKey, setCurrentKey] = React.useState('');

  const LottieRef = React.useRef(null);
  const [lottieProgress, setLottieProgress] = React.useState(new Animated.Value(0.5));

  const SliderWidth = Dimensions.get('screen').width;
  const colorMenuItems = [
    { label: '', header: 'orange', color: '#fca500', darkerColor: '#AF7300'},
    { label: '', header: 'blue', color: '#0081d1', darkerColor: '#00578D'},
    { label: '', header: 'green', color: '#6fa229', darkerColor: '#47651D'},
    { label: '', header: 'gray', color: '#939598', darkerColor: '#5C5D5F'},
    { label: '', header: 'crimson', color: '#d12b51', darkerColor: '#901F39'},
    { label: '', header: 'purple', color: '#b15de6', darkerColor: '#901F39'},
  ];

  const bodyTexts = {
    'myCOLOR': {body: 'mycolor body text', topBold: '', buttonLink: '', buttonTitle: 'Learn more'},

    'yourCOLOR': {body: 'yourcolor body text', topBold: (username != '') ? `Hi ${username}.\nYour color is ${userColor} as of ${dateOfQuiz}. Cheers! \n` : `\n`, buttonLink: '', buttonTitle: 'Share'},

    'Quiz': {body: '', topBold: '', buttonLink: '', buttonTitle: ''},

    'Teams':{body: 'teams bod', topBold: '', buttonLink: '', buttonTitle: 'Learn more'},

    'Connect': {body: '', topBold: '', buttonLink: 'instagram://user?username=mycolorpersonality', buttonTitle: ''},

    'Credits': {body: '', topBold: '', buttonLink: '', buttonTitle: ''},


    'Blue': {body: 'Dependability is a key feature that characterizes people, like you, whose personality color is blue. Blues tend to be rule-following, dependable, long-enduring, and tenacious. You make sacrifices in order to rise up the ranks in the world. You put in the extra hours in the office. You always fill out your taxes and pay your bills on time. You have a plan that you stick to. You never stand people up and are always timely. Most importantly, you’re there for your loved ones when they need you most. You lend an ear, do favors, and don’t disappoint. You don’t cheat and try to be 100% honest in all aspects of life. You value honesty above all. You might miss out on fun once and a while, due to your discipline. But in your mind, it’s worth it in the long-run. One night of partying isn’t worth not being at your best for work in the morning. You like routines and outlines, things that maintain structure. Organization is key to the way you operate; it’s what makes you staunch, loyal, and trustworthy.', topBold: 'Dependable, Practical, Directive', buttonLink: '', buttonTitle: 'Share'},

    'Blue/Crimson':{body: '', topBold: '', buttonLink: '', buttonTitle: 'Share'},

    'Orange': {body: 'Optimism and friendliness characterize people, like you, whose personality color is Orange. You are friendly and nurturing, but may need to take care that your good nature doesn’t lead others to unload all their frustrations on you without any reciprocation. People whose personality color is Orange aren’t typically big party people. You prefer smaller gatherings where you can engage with everyone else. You’re whimsical and value zaniness in others. You’re also bubbly, in an infectious, happy, joyful way. You see the best in people, despite what others may say about them. And you’re a forgiver—to a fault. As a hopeless romantic, breaking connections is difficult for you. When you open your heart, it’s all or nothing. This means you love deeper, but also that heartbreak hurts more. You may never stop loving former flames, with hopes of one day rekindling. But you are never opposed to new opportunities for love and connection.', topBold: 'Optimistic, Friendly, Perceptive', buttonLink: '', buttonTitle: 'Share'},
  }; //title : body text

  //Functions

  // ****Init
  useEffect(() => {
  //StatusBar.setHidden(true, 'none');

  setCurrentKey('yourCOLOR');
  setUsername('Skylar');

  AsyncStorage.getItem('username')
    .then((item) => {
         if (item) {
           // do the damage
           setUsername(item);
           console.log('We remember you! '+username);
         }
    });
});

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

  const handleItemPress = (item, index) => {
    console.log('pressed item', item.color);
    setCurrentColor(item.color);
  }

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

  const saveName = (name) => {
    AsyncStorage.setItem('username', name);
    setUsername(name);
  };

  const saveDate = (date) => {
    AsyncStorage.setItem('quizDate', date);
    setDateOfQuiz(date);
  };

  const toggleQuiz = () => {

    setIsQuizOpen(!isQuizOpen);

    Animated.parallel([
        Animated.spring(quizOffsetX, {
          toValue: isQuizOpen ? -wp('100%') : wp('0%'),
          bounciness: 2,
          useNativeDriver: false,
          speed: 1
        }),
        Animated.spring(scrollOffsetX, {
          toValue: isQuizOpen ? wp('0%') : wp('100%'),
          bounciness: 2,
          useNativeDriver: false,
          speed: 1
        })
        ]).start();
  }

  const toggleCredits = () => {
    console.log('credits');
    setIsCreditsOpen(!isCreditsOpen);

    Animated.parallel([
        Animated.spring(creditsOffsetX, {
          toValue: isCreditsOpen ? wp('100%') : 0,
          bounciness: 2,
          useNativeDriver: false,
          speed: 1
        }),
        Animated.spring(containerOffsetX, {
          toValue: isCreditsOpen ? wp('0%') : -wp('100%'),
          bounciness: 2,
          useNativeDriver: false,
          speed: 1
        }),
        Animated.timing(lottieProgress, {
            toValue: isCreditsOpen ? 0.5 : 0,
            duration: 400,
            useNativeDriver: true
          })
        ]).start();
      }

  const openLink = (link) => {
    if(link == '')
    {
      console.log('EMPTY LINK');
    } else {
      Linking.openURL(link);
    }
  }

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
  				bounciness: 5,
  				useNativeDriver: false,
          speed: 1.2
  			})
      ]).start();

  }, 0); //add this in
    return () => clearInterval(interval);
  }, []);

    //Quiz functions
    React.useEffect(() => {
      if (resultColor) {
        colors.forEach((color) => {
          if (color.name === resultColor) {
            setResultAttributes(color.attributes);
          }
        });
      }
    }, [resultColor]);

    const mergeObjects = (obj1, obj2) => {
      var objs = [obj1, obj2];
      var result = objs.reduce(function (r, o) {
        Object.keys(o).forEach(function (k) {
          r[k] = o[k];
        });
        return r;
      }, {});
      return result;
    };

    const handleBackPress = (index) => {
      console.log('back quiz');
      setTimeout(() => {
        if (index > 0) {
          setCurrentQuestionIndex(index - 1);
        }
      }, 200);
    }

    const handleOptionPress = (id, index) => {
      setSelectedAnswer(id);
      const answer = convertIndexToAnswer(currentQuestionIndex + 1, index + 1);
      const userAnswersCombined = mergeObjects(userAnswers, {
        [currentQuestionIndex + 1]: answer,
      });

      setUserAnswers(userAnswersCombined);

      const tiedIndexes =
        currentQuestionIndex > 19 ? checkForTie(userAnswers) : [];

      const colorResult =
        currentQuestionIndex > 19
          ? tiedIndexes.length > 1
            ? convertIndexToColorName(tiedIndexes[0])
            : calculateResultIndex(userAnswers)
          : '';
      setResultColor(colorResult);


      setTimeout(() => {
        if (quizQuestions.length > currentQuestionIndex + 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          setShowResult(true);
        }
      }, 200);
    };

    const handleRetakePress = () => {
      console.log('Retake');

      setSelectedAnswer('');
      setCurrentQuestionIndex(0);
      setShowResult(false);
      setUserAnswers({});
      setResultColor('');
      setResultAttributes('');
    };

//------------------------------------------------------------------->
  if (!fontsLoaded) {
    return <AppLoading />;
  } else {

const styles = StyleSheet.create({
  shadow1: elevationShadowStyle(5),
  shadow2: elevationShadowStyle(10),
  shadow3: elevationShadowStyle(20),

  button: {
    borderRadius: 8,
    backgroundColor: 'white',
    padding: 24,
    marginTop: hp('2%')
  },
  container: {
    flex: 1,
    paddingTop: 30,
    backgroundColor: '#fff',
    justifyContent: 'space-around',
    alignItems: 'center',
    overflow: "visible"
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
  topBold: {
    fontFamily: 'CircularStd-Black',
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
    },
    creditsBtn: {
      width: wp('20%'),
      height: wp('17%'),
      flex: 1,
      justifyContent: 'flex-start',
      transform: [{translateX: -wp('32%')}, {translateY: hp('8%')}],
      position: 'absolute',
      zIndex: 4
    },
    quizParagraph: {
      fontFamily: 'CircularStd-Book',
      color: 'black',
      fontSize: hp('2.2%'),
      },
      question: {
        fontFamily: 'CircularStd-Black',
        color: 'black',
        fontSize: hp('2.2%'),
        marginBottom: hp('2%')
      },
      colorAttributesText: {
        fontFamily: 'CircularStd-Black',
        color: 'black',
        fontSize: hp('2.2%'),
        textTransform: 'capitalize',
        marginTop: hp('2%')
      },
      answer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingTop: hp('3%'),
      },
      resultText: {
        fontFamily: 'CircularStd-Book',
        color: 'black',
        fontSize: hp('2.2%'),
        textAlign: 'center'
      },
      resultTextBig: {
        fontFamily: 'CircularStd-Black',
        color: 'black',
        fontSize: hp('4%'),
        textAlign: 'center',
        textTransform: 'capitalize',
        marginBottom: hp('4%')
      },
      retake: {
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderColor: 'white',
        backgroundColor: 'black',
        borderRadius: 5,
        width: 200,
        alignSelf: 'center',
      },
      creditsContainer: {
        ...StyleSheet.absoluteFillObject,
        resizeMode: "cover",
        height: hp('100%'),
        width: wp('100%'),
        zIndex: 4,
        backgroundColor: 'transparent'
      },
      creditsTxt: {
        fontFamily: 'CircularStd-Book',
        color: 'black',
        fontSize: hp('2.2%'),
        marginTop: hp('10%'),
        padding: wp('14%')
      },
      quizContainer: {
        flex: 1,
        position: 'absolute',
        ...StyleSheet.absoluteFillObject,
      },
      quizContent: {
        justifyContent: 'center',
        padding: wp('14%'),
        marginTop: hp('10%')
      }
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


//VIEW ELEMENTS ------------------------------------------------------
  return (
    <View style={[styles.container]}>
      <Animated.Image pointerEvents={"none"} style={[styles.splash, { transform: [{translateY: splashOffsetY }]} ]} source={require('./assets/splash2-txt.png')} />
      <Animated.View pointerEvents={"none"} style={[styles.creditsContainer, { transform: [{translateX: creditsOffsetX }]}]}>
        <Text style = {styles.creditsTxt}><Text style={{ fontFamily: 'CircularStd-Black' }}>myCOLOR</Text> take care that your good nature doesn’t lead others to unload all their frustrations on you without any reciprocation. People whose personality color is. </Text>
        <Text style = {[styles.creditsTxt, {fontFamily: 'CircularStd-Black', marginTop: hp('45%')}]}>© a.network.</Text>
      </Animated.View>
      <TouchableOpacity style = {styles.creditsBtn} onPress={toggleQuiz}>
          <LottieView
                ref={LottieRef}
                style={styles.shadow1}
                source={require('./assets/hamburger.json')}
                loop={false}
                progress={lottieProgress}
              />
      </TouchableOpacity>
      <Animated.View style={[styles.contentContainer, { transform: [{translateX: containerOffsetX }]} ]}>
          <View style={styles.topBar}>
            <Text style = {[styles.headerText, styles.shadow1]}>{currentKey}</Text>
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

              <Animated.View style={[styles.quizContainer, { transform: [{translateX: quizOffsetX }]} ]}>

          <SafeAreaView style={{flex: 1}}>
              <ScrollView
              showsVerticalScrollIndicator= {false}
              showsHorizontalScrollIndicator= {false}
              style={{zIndex: 10}}>

              <View style = {styles.quizContent}>
                        <Text style={[styles.question, {display: showResult ? 'none' : 'flex'}]}>
                          {showResult ? '' : quizQuestions[currentQuestionIndex].question}
                        </Text>
                        <Text style={styles.resultText}>{showResult ? 'You are...' : ''}</Text>
                        <Text style={styles.resultTextBig}>{showResult ? resultColor : ''}</Text>
                          <Progress.Bar isAnimated duration={200} progress={parseInt(currentQuestionIndex + 1) / 21} color={showResult ? resultColor : "#333333"} trackColor={"#F0F0F0"} height={hp('0.35%')} style = {[styles.shadow1, {shadowOpacity: 1}]} />
                          <View style = {{flexDirection:'row', flexWrap:'wrap'}}>
                                    <TouchableOpacity style= {{marginTop: hp('1.5%'), marginLeft: -wp('3%')}} onPress = {() => showResult ? handleRetakePress() : handleBackPress(currentQuestionIndex)}>
                                        <View style = {{flexDirection:'row', flexWrap:'wrap'}}>
                                          <Image style = {{width: wp('8%'), height: wp('8%'), marginTop: -4}} source={require('./assets/arrowLeft.png')} />
                                          <Text style = {[styles.quizParagraph, styles.shadow1, {fontFamily: 'CircularStd-Black', alignSelf: 'flex-start'}]}>{showResult ? 'Take Again' : 'Back'}</Text>
                                        </View>
                                    </TouchableOpacity>
                                <Text style={[styles.quizParagraph, {alignSelf: 'flex-start', marginTop: hp('1.5%'), marginLeft: wp('2%')}]}>{showResult ? '' : 'Q' + parseInt(currentQuestionIndex + 1)+"/20"}</Text>
                          </View>
                      {showResult ? (
                        <View style={{ flex: 1 }}>
                            <Text style={styles.colorAttributesText}>{resultAttributes.toString()}</Text>
                            <Text style={styles.bodyText}></Text>
                        </View>

                      ) : (
                          <>
                            {quizQuestions[currentQuestionIndex].answers.map((answer, index) => {
                              return (
                                <TouchableOpacity
                                  style={[styles.answer, {flexDirection:'row'}]}
                                  key={index}
                                  onPress={() => handleOptionPress(answer.id, index)}>
                                  <View style={{flexDirection:"row",alignItems:'center'}}>
                                      <View style={{flex:9}}>
                                          <Text style = {styles.bodyText}>{answer.value}</Text>
                                      </View>
                                      <View style={{flex:1, paddingLeft: wp('2%')}}>
                                          <RadioButton.Android
                                            uncheckedColor={"#F0F0F0"}
                                            color={'black'}
                                            value="first"
                                            status={
                                              answer.id === selectedAnswer ? 'checked' : 'unchecked'
                                            }
                                            onPress={() => handleOptionPress(answer.id, index)}
                                          />
                                      </View>
                                  </View>
                                </TouchableOpacity>
                              );
                            })}
                          </>
                        )}
                </View>
                </ScrollView>
                </SafeAreaView>
              </Animated.View>

              <Animated.View style = {[styles.scrollContainer, { transform: [{translateX: scrollOffsetX }]}]}>
              <SafeAreaView style={{flex: 1, marginBottom: -hp('5%')}}>
                  <ScrollView
                  showsVerticalScrollIndicator= {false}
                  showsHorizontalScrollIndicator= {false}
                  style={styles.scrollView}>

                    <Text style = {styles.topBold}>{bodyTexts[currentKey].topBold}</Text>
                    <Text style={styles.bodyText}>
                      {bodyTexts[currentKey].body}
                    </Text>

                    <TouchableOpacity onPress = {() => {
                          openLink(bodyTexts[currentKey].buttonLink);
                        }} style={[styles.button, styles.shadow3]}>
                      <Text style = {[styles.bodyText, {textAlign: 'center'}]}>Share</Text>
                    </TouchableOpacity>
                    <Text>{"\n"}{"\n"}{"\n"}{"\n"}</Text>
                  </ScrollView>
                </SafeAreaView>
              </Animated.View>

        </Animated.View>
      </View>
  );
  }
}
