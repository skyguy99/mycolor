import React from 'react';
import {useRef} from 'react';
import { Component, useState, useEffect } from 'react';
import * as firebase from 'firebase';
import 'firebase/firestore';
import AsyncStorage from "@react-native-community/async-storage"
import { useFonts } from '@use-expo/font';
import { AppLoading } from 'expo';
import Constants from 'expo-constants';
import MaskedView from '@react-native-masked-view/masked-view';
import * as Linking from 'expo-linking';
import FloatingMenu from './FloatingMenu/components/FloatingMenu';
import * as Progress from 'expo-progress';
import LottieView from "lottie-react-native";
import Svg, { G, Path } from "react-native-svg";
import { LinearGradient } from 'expo-linear-gradient';
import { Kohana } from 'react-native-textinput-effects';
import { Video } from 'expo-av';
import MaterialsIcon from 'react-native-vector-icons/MaterialIcons';
import { s, vs, ms, mvs, scale, verticalScale, moderateScale, ScaledSheet } from 'react-native-size-matters';
import * as Device from 'expo-device';
import { Button, Menu, Divider, Provider, RadioButton } from 'react-native-paper';
import { StyleSheet, Text, View, Image, ImageBackground, BackgroundContainer, Share, Animated, Easing, StatusBar, FlatList, SafeAreaView, ScrollView, TouchableWithoutFeedback, TouchableOpacity, Dimensions, PixelRatio } from 'react-native';
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

global.lastColor = 'transparent';

export default function App() {

  let [fontsLoaded] = useFonts({
        'CircularStd-Book' : require('./assets/CircularStd-Book.ttf'),
        'CircularStd-Black' : require('./assets/CircularStd-Black.ttf'),
        'CircularStd-BookItalic' : require('./assets/CircularStd-BookItalic.ttf'),
        'CircularStd-BlackItalic' : require('./assets/CircularStd-BlackItalic.ttf'),
  });

  //persistent vars
  const [username, setUsername] = useState('');
  const [industry, setIndustry] = useState('');
  const [role, setRole] = useState('');
  const [didSetUsername, setDidSetUsername] = React.useState(false);
  const [userColor, setUserColor] = useState('');

  const [ready, setReady] = React.useState(false);

  //quiz vars
  const [progress, setProgress] = useState(new Animated.Value(0));
  const [resultProgress, setResultProgress] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = React.useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [showResult, setShowResult] = React.useState(false);
  const [userAnswers, setUserAnswers] = React.useState({});
  const [resultColor, setResultColor] = React.useState('');
  const [resultAttributes, setResultAttributes] = React.useState('');

  const [backgroundColor, setBackgroundColor] = React.useState(new Animated.Value(0));
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = React.useState(false);
  const [isQuizOpen, setIsQuizOpen] = React.useState(false);
  const [error1Opacity, setError1Opacity] = React.useState(0);
  const [error2Opacity, setError2Opacity] = React.useState(0);
  const [error3Opacity, setError3Opacity] = React.useState(0);
  const [errorXPos, setErrorXPos] = React.useState(new Animated.Value(0));

  const [isSelectingSecondColor, setIsSelectingSecondColor] = React.useState(false);
  const [currentColor, setCurrentColor] = React.useState('#fca500');
  const [secondColor, setSecondColor] = React.useState('');

  const [splashOpacity, setSplashOpacity] = React.useState(new Animated.Value(1));
  const [splashScale, setSplashScale] = React.useState(new Animated.Value(0));
  const [creditsOffsetX, setCreditsOffsetX] = React.useState(new Animated.Value(wp('100%')));
  const [containerOffsetY, setContainerOffsetY] = React.useState(new Animated.Value(hp('200%')));
  const [main3dOffsetY, setmain3dOffsetY] = React.useState(new Animated.Value(hp('11%')));
  const [main3dScale, setmain3dScale] = React.useState(new Animated.Value(1.15));

  const [containerOffsetX, setContainerOffsetX] = React.useState(new Animated.Value(hp('0%')));
  const [quizOffsetX, setQuizOffsetX] = React.useState(new Animated.Value(-wp('100%')));
  const [scrollOffsetX, setScrollOffsetX] = React.useState(new Animated.Value(0));

  const [scaleInAnimated, setScaleInAnimated] = React.useState(new Animated.Value(0));
  const [scaleOutAnimated, setScaleOutAnimated] = React.useState(new Animated.Value(0));
  const [currentWheelWord, setCurrentWheelWord] = React.useState('Extraversion');

  const [bodyText, setBodyText] = React.useState('');
  const [currentKey, setCurrentKey] = React.useState('myCOLOR');
  const [currentTextKey, setCurrentTextKey] = React.useState('myCOLOR');
  const [currentColorCombo, setCurrentColorCombo] = React.useState(null);

  const [headerMenu, setHeaderMenu] = React.useState(new Animated.Value(90));
  const [
    headerMenuOptionsVisible,
    setHeaderMenuOptionsVisible,
  ] = React.useState(false);
  const [optionsVisible, setoptionsVisible] = React.useState(false);
  const [optionsHeaderVisible, setoptionsHeaderVisible] = React.useState(true);
  const [spinValue, setSpinValue] = React.useState(new Animated.Value(0));

  const LottieRef = React.useRef(null);
  const [lottieProgress, setLottieProgress] = React.useState(new Animated.Value(0.5));

  const SliderWidth = Dimensions.get('screen').width;

  const colorMenuItems = [
    { label: '', header: 'orange', color: '#f3ac07', darkerColor: '#AF7300', shareLink: '', attributes: 'Optimistic, Friendly, Perceptive', extraversion: 0.9, openness: 0.95, agreeableness: 0.9, integrity: 0.85, stability: 0.2, conscientiousness: 0.75, title: 'The Enthusiast', bodyBlurb: 'You are friendly and nurturing, but may need to take care that your good nature doesn’t lead others to unload all their frustrations on you without any reciprocation. People whose personality color is Orange aren’t typically big party people. You prefer smaller gatherings where you can engage with everyone else.', pullQuote: 'You’re whimsical and value zaniness in others.', bodyBlurb2: 'As a hopeless romantic, breaking connections is difficult for you. When you open your heart, it’s all or nothing. This means you love deeper, but also that heartbreak hurts more. You may never stop loving former flames, with hopes of one day rekindling. But you are never opposed to new opportunities for love and connection.', image: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/-yellow.mp4'},

    { label: '', header: 'blue', color: '#0b89cc', darkerColor: '#00578D', shareLink: '', attributes: 'Dependable, Practical, Directive', extraversion: 0.3, openness: 0.3, agreeableness: 0.5, integrity: 1.0, stability: 0.8, conscientiousness: 0.9, title: 'The Director', bodyBlurb: 'You have a plan that you stick to. You never stand people up and are always timely. Most importantly, you’re there for your loved ones when they need you most. You lend an ear, do favors, and don’t disappoint. You don’t cheat and try to be 100% honest in all aspects of life. You value honesty above all.', pullQuote: 'Blues tend to be rule-following, dependable, long-enduring, and tenacious.', bodyBlurb2: 'You might miss out on fun once and a while, due to your discipline. But in your mind, it’s worth it in the long-run. One night of partying isn’t worth not being at your best for work in the morning. You like routines and outlines, things that maintain structure. Organization is key to the way you operate; it’s what makes you staunch, loyal, and trustworthy.', image: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/-blue.mp4'},

    { label: '', header: 'green', color: '#71af2d', darkerColor: '#47651D', shareLink: '', attributes: 'Peaceful, Serene, Accommodating', extraversion: 0.75, openness: 0.7, agreeableness: 0.95, integrity: 0.4, stability: 0.95, conscientiousness: 0.5, title: 'The Peacemaker', bodyBlurb: 'As a Green, you are known for your chill vibes, and your body is rarely consumed with anxiety. Chores, work, and even exercise is easier when you are well rested and relaxed. Your life is centered around achieving maximum comfort, whether it’s investing in luxuries like massage chairs and water beds or meditating and productively removing stress from your body.', pullQuote: 'You prefer when issues resolve themselves or require minimal input and stress on your part.', bodyBlurb2: 'Accommodation is where you thrive—allowing others to achieve their peace without interrupting yours. Your chillness and cool, calm, collected way of composing yourself is attractive to a lot of people, but also means that you don’t take some things seriously that deserve uninterrupted attention.', image: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/-green.mp4'},

    { label: '', header: 'grey', color: '#939598', darkerColor: '#5C5D5F', shareLink: '', attributes: 'Powerful, Mysterious, Provocative', extraversion: 0.1, openness: 0.1, agreeableness: 0.1, integrity: 0.9, stability: 0.8, conscientiousness: 0.45, title: 'The Brooder', bodyBlurb: 'As a Grey, you know no fear—and no limits. You like to keep people guessing. People crave mystery and uncertainty—they want to find out more about you. But you won’t let them; you never let anyone get too close, to fully discover who you are. You have an air of aloofness; you play coy and hard to get. Never the one to initiate, you attract all sorts of invitations to various events from those around you.', pullQuote: 'You value solitude, reflection, and privacy.', bodyBlurb2: 'Cavalier and brash, but collected, is how you live your life. You don’t care about the judgement of others and make decisions for yourself and yourself alone. This may mean that you have trouble with intimacy, but it doesn’t mean you don’t have romantic interests. Perhaps they just don’t last very long, or maybe your loved one is the only person you aren’t a mystery to.', image: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/-grey.mp4'},

    { label: '', header: 'crimson', color: '#d21a58', darkerColor: '#901F39', shareLink: '', attributes: 'Adventurous, Bold, Direct', extraversion: 0.95, openness: 0.75, agreeableness: 0.1, integrity: 0.9, stability: 0.5, conscientiousness: 0.3, title: 'The Achiever', bodyBlurb: 'Bold, assertive, domineering, craving excitement—it’s how you live your life. You aren’t afraid to tell people exactly what you think, and you certainly don’t hold back in any aspect of your life. Passion and brashness can get you into trouble, but that’s par for the course.', pullQuote: 'You are achievement-focused and work hard towards achieving what you desire.', bodyBlurb2: 'Extraverted is an understatement; you love getting to know people and discussing cool new opportunities with them. Popularity is key; your place in society and how people regard you is extremely important to your identity. Everything needs to be efficient, clean, and, most importantly, sleek. You’re the life of the party and the face that brightens up the room.', image: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/-red.mp4'},

    { label: '', header: 'purple', color: '#b055e3', darkerColor: '#874AAD', shareLink: '', attributes: 'Creative, Expressive, Emotive', extraversion: 0.8, openness: 0.7, agreeableness: 0.9, integrity: 0.5, stability: 0.1, conscientiousness: 0.85, title: 'The Explorer', bodyBlurb: 'As a Purple, you are a creative thinker: thoughtful, reflective, maybe even a little quirky. Convention does not influence you. You are a problem solver, but take the road less traveled. You value art and other creative ventures.Life is whimsical; you leave your options open. Philosophy is important to you, as is existential thinking and maybe even a bit of nihilism.', pullQuote: 'You’re very expressive verbally, physically, and in the work that you do.', bodyBlurb2: 'You take great pride in the culturally diverse life you live, and the knowledge and respect that you have for all things in the realm of eclectic art. You have a wellspring of creative energy that you channel into productive artistic activity, including travel.Some people may criticize your fringy lifestyle, but you are unapologetic.', image: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/-purple.mp4'},

  ];

  var colorComboMenuItems = [
    {image: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/bluegrey.mp4', header1: 'blue', header2: 'grey', shareLink: '', bodyBlurb: 'Although honesty is important to both of you, how you understand it is very different. Blues relate honesty closely to work ethic and clarity, where Greys see clearly the hypocrisies and contradictions in life, and feel the only honest response is to point them out. Blues want to get things done, and do the best with what they’ve got. Greys see a lot of gray. Greys, remember that Blues love organization and control: bolster them, congratulate them on their successes. Blues, remember that Greys may see ambiguity where you see clarity. Explain yourself conversationally, and be humble. A little bit of acknowledgement will go a long way toward getting a Grey on board.', pullQuote: 'Explain yourself conversationally, and be humble.', bodyBlurb2: ''},
    {image: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/blueyellow.mp4', header1: 'blue', header2: 'orange', shareLink: '', bodyBlurb: 'Blues and Oranges are both givers, although in different ways. Blues give themselves wholeheartedly to work; you can count on them to stay late and to care about doing the smallest things right. Oranges give themselves to people, anticipating their needs, saying just the right thing to put people at ease. Although you are both givers, you may not recognize this about each other because of the different ways that you express it. Learn how to give and receive gifts in the other person’s style. You may not always notice that you are being given a gift when it’s not on your wavelength.', pullQuote: '', bodyBlurb2: ''},
    {image: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/bluepurple.mp4', header1: 'blue', header2: 'purple', shareLink: '', bodyBlurb: 'Chances are that Purples and Blues find beauty and meaning in distinctly divergent ways. With your strengths combined, Purples and Blues may create functional beauty. A Blue may bring the detailed, orderly perfectionism needed to launch something fantastic. A Purple may bring an unexpected work-around to a tough problem, or a seemingly odd idea that with a Blue’s rational perspective may lead to a workable solution. Pause to solicit ideas from each other, and affirm each others strengths. Often the natural human instinct is to feel frustration when confronted with difference seek to cultivate joy in the diversity between you.', pullQuote: '', bodyBlurb2: ''},
    {image: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/bluered.mp4', header1: 'blue', header2: 'crimson', shareLink: '', bodyBlurb: 'You’re both committed and hard-working which makes you the most boring color combination of all time; laughing at yourselves will help with this. Incidentally, you are also probably the most productive color combination of all time. While you’re wonderfully efficient, your duo probably isn’t the source of crazy, new ideas. To a Crimson, Blue may seem bogged down by precision and rules. On the other hand, a Crimson may seem reckless and imprudent to a Blue. Although this might be frustrating, you certainly complement each other. Chances are that together you’ll be far more fruitful than you would be with any other color.', pullQuote: '', bodyBlurb2: ''},
    {image: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/bluegreen.mp4', header1: 'blue', header2: 'green', shareLink: '', bodyBlurb: 'Green and Blue may just be the lowest stress color combination of them all: a low-key Green attitude that doesn’t make a mountain out of a molehill and with detail-oriented Blue thinking that keeps on top of things. However, there is potential for seriously conflicting priorities. Blues may sometimes see Greens as not pulling their weight; Greens may see Blues as stressing out over every little thing. Both of you communicate nonverbally, and will be tempted to respond to the other’s behavior by intensifying your own; Greens becoming ever more flagrantly chill, and Blues ever more aggressively diligent. So communicate! Allow your differences to complement each other instead of exacerbate the problem.', pullQuote: '', bodyBlurb2: ''},

    {image: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/yellowgreen.mp4', header1: 'green', header2: 'orange', shareLink: '', bodyBlurb: 'Green and Orange are not the best duo to move a project forward aggressively. You are both perfectly happy dwelling in the comfort zone. If you start to feel stuck, you may try bringing other personality types into the mix. As a team, you both help with team cohesion and harmony. Oranges, you see the positive side to any personality. By sharing this with the team, you may help change negative attitudes. You are also unafraid of disagreement; you see it as a natural expression of personality difference. While you don’t enjoy unhealthy or overly aggressive conflict, you find healthy conflict to be positive and growth-oriented.', pullQuote: '', bodyBlurb2: ''},
    {image: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/greenpurple.mp4', header1: 'green', header2: 'purple', shareLink: '', bodyBlurb: 'Purples and Greens most likely get along perfectly well. If you can accept each other’s attitudes as genuine, Purple and Green make for a relaxed, conflict-free team. It may be hard to solicit ideas from a Green, particularly when there is a difference of opinion in the room. Chances are the Green would foremost like to see resolution, even if it comes at the expense of the product...and there may even be times that preservation of work relationships is the most important thing. Purples, with their non-threatening quirkiness, may be able to help Greens engage in contentious work, and see that creative tension can come with enormous benefits.', pullQuote: '', bodyBlurb2: ''},
    {image: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/greenred.mp4', header1: 'green', header2: 'crimson', shareLink: '', bodyBlurb: 'The brash go-getter and the stress-free chillaxer may not have a lot in common aesthetically and can find themselves taken aback and irked by each other at times. That’s okay, and may even be positive if you’re committed to making it work! Greens, try not to sacrifice honesty for the sake of cohesion; positive conflict equals growth. Lean into a healthy disagreement. Try allowing yourself to be swept up by Crimson’s ambition and vision. Crimsons, be aware when you are amping up your energy levels to compensate for the Greens around you. Be aware that Greens avoid conflict, and may reflexively voice agreement without true commitment, simply to keep the peace.', pullQuote: '', bodyBlurb2: ''},
    {image: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/greengrey.mp4', header1: 'green', header2: 'grey', shareLink: '', bodyBlurb: 'Greens see strength in stability. Greys see strength in pushing through facade to a more “real” relationship. If you can understand where the other is coming from, you can get into a solid friendship. Greys may need to try less talk, more walk in terms of being the good they want to see. Greens should realize a well-placed critique can break the ice, with humor and without anxiety. Greys may be able to bring a Green into a new situation by showing them that risk can be mysterious, even beautiful. Greens, you may be able to help a Grey open up, by modeling peaceful honesty.', pullQuote: 'If you can understand where the other is coming from, you can get into a solid friendship.', bodyBlurb2: ''},

    {image: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/greengreen.mp4', header1: 'green', header2: 'green', shareLink: '', bodyBlurb: 'The chances that you two, as Greens, will erupt into conflict hovers somewhere between zero and minus zero. But that doesn’t mean you will be the most productive pair, either. The first issue that may harm your productivity is the fact you both prefer stability, so change (even productive change) can upset the status quo. A little-known fact about Greens is that under their very calm exteriors are some very strong opinions. And just because you are both Greens does not mean you have the same opinions on everything. While eruptions rarely occur, conflicts do not automatically resolve themselves. So don’t assume things are always great with each other. Keep checking in and keep support levels high.', pullQuote: '', bodyBlurb2: ''},
    {image: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/blueblue.mp4', header1: 'blue', header2: 'blue', bodyBlurb: 'Theoretically, two Blues working together should be an ideal pair. How could two dependable and organized folks not work together to improve the outcomes of both? Well, a part of being Blue is also having a distinct preference for calling the shots and we all know what happens when we have more than one chef in the kitchen. Sometimes you may find that it is best to agree to have different areas where you can each explore your own ideas. But that is certainly not the typical outcome, and with some compromises and cooperation you can both apply your incredible abilities to work together for everyone’s advantage.', pullQuote: '', bodyBlurb2: ''},
    {image: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/greygrey.mp4', header1: 'grey', header2: 'grey', shareLink: '', bodyBlurb: 'Who hates each other more: two punks who love different bands, or a blue-haired social justice warrior stuck in a room with an internet troll? When you buck the establishment, its hard to get along with other anti-establishment types unless their interests align exactly with your own. Fortunately, the antidote is also your strong suit: self-deprecating humor and snarky comments. Admit the flaws in your own crusade, and hopefully theyll admit the flaws in theirs too and you can have a good laugh about the hopelessness of it all. Then move on and get some freakin work done. Shoulder to shoulder you will quickly find that the other person brings sharp clarity and new perspectives that can really push the project forward and expand your own understanding.', pullQuote: '', bodyBlurb2: ''},
    {image: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/redred.mp4', header1: 'crimson', header2: 'crimson', shareLink: '', bodyBlurb: 'This same-color pair often enjoys a spectacular outcome when working together. The energy, passion and adventurousness of two Crimsons combine to produce results above and beyond what either could have done alone. But there are also times when aspects of Crimsons may clash. The desire to lead, to be in the spotlight, to be recognized as unique, and other Crimson traits can make it difficult to work together toward a common goal. The sooner Crimsons recognize their common traits, the easier it is to build workarounds to make sure your similarities do not clash. Create separate areas where you can both shine, find ways to share the spotlight, or take turns being out in front. It will take considerable effort, but always strive to mesh your incredible drives and passions and find ways to pull together.', pullQuote: '', bodyBlurb2: ''},
    {image: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/purplepurple.mp4', header1: 'purple', header2: 'purple', shareLink: '', bodyBlurb: 'If days were only longer, Purples could find ways to work so much more effectively together. There never seems to be enough time to describe all the ideas that fill every Purple’s mind. Even when working in close proximity, a Purple often prefers to have more time focusing on the task at hand without the presence of another. The key is to find the areas where you both The key is to find the areas where you both excel and give each other recognition and support for your individual strengths. It may also take some volitional effort by both of you to make sure productivity doesn’t lose out to the desire to brainstorm. However, when you provide mutual support and both help each other stay focused on productivity, chances are you will be an exceptional pair of colleagues.', pullQuote: '', bodyBlurb2: ''},
    {image: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/yellowyellow.mp4', header1: 'orange', header2: 'orange', shareLink: '', bodyBlurb: 'When a Orange joins forces with another Orange, an enjoyable association is bound to result. Oranges bring joy and optimism to everyone and know exactly when to help and when to step back. The only real problem for two Oranges is that neither of you may be comfortable taking the lead because you both enjoy being helpful. Of course, one of you may know the work environment so well that you may enjoy taking the lead even if it is not your natural style. Regardless, given your mutual desire to make the world a better place every day, you are sure to find ways mesh together to get the job done.', pullQuote: '', bodyBlurb2: ''},

    {image: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/greyred.mp4', header1: 'grey', header2: 'crimson', shareLink: '', bodyBlurb: 'You both approach social interactions with a bold courage, although the emotional impulse which drives your courage is quite different. With this in mind, Crimsons, be aware that not all social behavior is to be taken literally. Although it doesn’t feel efficient, try engaging a Grey in a short caper before getting down to business; tell a story, say something intentionally mysterious just for fun. This will help you build rapport with a Grey. Greys, examine the motivations behind your behavior and ask yourself if there are better ways to accomplish your goals. Mystery is certainly an awesome hat to have in your closet, but hopefully you’re not using it just to annoy.', pullQuote: '', bodyBlurb2: ''},
    {image: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/yellowgrey.mp4', header1: 'grey', header2: 'orange', shareLink: '', bodyBlurb: 'Greys and Oranges both want to improve relationships. Oranges may put themselves out there in risky and vulnerable ways, and may get hurt by a Grey, especially if a Grey uses the opportunity to crack a joke. Oranges, realize that a snarky joke is sometimes intended to be friendly when it is used to start rapport. A Grey will likely be overjoyed if you snark back. In reality, emotional closeness and cutting through the nonsense are both necessary for building close relationships. With this in mind, you may start to enjoy each other’s company.', pullQuote: '', bodyBlurb2: ''},
    {image: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/greypurple.mp4', header1: 'grey', header2: 'purple', shareLink: '', bodyBlurb: 'Greys and Purples are likely to share personality traits and maybe even interests and may even be amused and inspired by each other. However, although Greys and Purples tend to appreciate one another, there is always potential for conflict or misunderstanding. Greys may intentionally say something obtuse, and Purples have been known to wax poetic, especially when they have just discovered a new artist or author. Greys, remember that it takes a lot of courage to put yourself out there. Until you have risked as much as the Purple has, don’t dare speak to them in a way that’s going to make them hold back. Ease up on the brutal side of your brutal honesty.', pullQuote: '', bodyBlurb2: ''},

    {image: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/yellowred.mp4', header1: 'crimson', header2: 'orange', shareLink: '', bodyBlurb: 'Crimson and Orange may be at different ends of the introvert-extrovert spectrum. It can be a lot of fun to hang out, as long as you know this about each other. Orange, if you need an advocate or ally, try reaching out to a Crimson. Crimson will gladly take the spotlight at a meeting, while Orange may feel more comfortable talking one-on-one afterwards. Crimson, be aware of the Oranges in the room, and ask them to speak up, or pause before speaking to give others a chance. And Orange, if you have a great idea, try blurting it out before you can second guess yourself.', pullQuote: '', bodyBlurb2: ''},
    {image: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/yellowpurple.mp4', header1: 'orange', header2: 'purple', shareLink: '', bodyBlurb: 'Purples and Oranges will tend to communicate well with each other; Oranges try to be great listeners, and Purples are expressive; well, at least when they have something original to share. Purples may enjoy hanging out with someone who laughs at their odd remarks (it takes creative energy to come up with new things to say!), and lobs a joke of their own back. Purples and Oranges might not be the best duo to get things accomplished quickly and efficiently. Oranges promote team cohesion and morale, and Purples generate new ideas and solve problems. So you may find it helpful to bring a Blue or Crimson on the team to manage and drive outcomes.', pullQuote: '', bodyBlurb2: ''},
    {image: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/redpurple.mp4', header1: 'crimson', header2: 'purple', shareLink: '', bodyBlurb: 'There’s potential for fantastic collaboration between a Crimson and Purple. Purple brings the creative, outside-of-the-box inspiration; Crimson brings the ambitious, enterprising charge toward the finish line. Together this may be a recipe for innovation. Purple on its own may never get past thinking and designing, but Crimson loves a new idea, takes it, and leads the charge. A word of caution: a team of only Crimson and Purple may do wise to bring on a pragmatist. You may benefit from a voice of practicality--someone to research, test, and plan.', pullQuote: '', bodyBlurb2: ''},
  ];

  var bodyTexts = {
    'myCOLOR': {body: 'We’ve updated the myCOLOR personality quiz to be more accurate and effective. With the addition of twelve new questions, the quiz results can better determine your personality type and how you can improve your work and social interactions with others. By encouraging your friends and colleagues to take the myCOLOR personality quiz, you’ll be able to leverage your personality’s specific color traits and theirs to strengthen your relationships through better communication and understanding.\n\nUsing our Soulmates.AI technology, our chief scientific advisor, Dr. J. Galen Buckwalter, created a fun quiz that lets you discover the color of your personality, which we call myCOLOR. Learning about your color will give you insights into yourself as well as how you can interact more effectively with others, from family and friends to co-workers and other teammates.\n\nPeople are often surprised to find the color revealed by the quiz is different than the one they assume defines their personality. See if the color you receive reveals new information about your personality by taking the quiz below.\n\n', topBold: '', buttonLink: 'https://thecolorofmypersonality.com/', buttonTitle: 'Take the Quiz'},

    'Results': {body: '', topBold: !didSetUsername ? `Hi ${username}.\nYour color is ${userColor}. Cheers! \n` : `Hello.\n You don't have a color yet!`, buttonLink: '', buttonTitle: !didSetUsername ? 'Take the Quiz' : 'Share'},

    'Quiz': {body: '', topBold: '', buttonLink: '', buttonTitle: ''},

    'Teams':{body: 'We each have a personality type, wired into us in a way that can’t be denied. It’s who we are. But when we build teams, we have the opportunity to create a dynamic based on the right mix of different types. \n\nThat’s what makes myCOLOR for Teams so powerful. By understanding how people with different personality colors work best together, you can gain insights into crafting the right team for any situation, from work to sports to social events.\n\nFrom the optimism of Oranges to the creativity of Purples to the dependability of Blues, aligning our strengths (and balancing our weaknesses) can result in teams that perform to their maximum potential.\n\n', topBold: '', buttonLink: 'https://thecolorofmypersonality.com/', buttonTitle: 'Learn more'},

    'Connect': {body: '', topBold: '', buttonLink: 'instagram://user?username=mycolorpersonality', buttonTitle: ''}
  }; //title : body text

  //Functions

  // ****Init
  useEffect(() => {

  AsyncStorage.getItem('username')
    .then((item) => {
         if (item) {
           setUsername(item);
           setDidSetUsername(false); //means has taken quiz at least once
         }
    });

    AsyncStorage.getItem('industry')
      .then((item) => {
           if (item) {
             setIndustry(item);
           }
      });
    AsyncStorage.getItem('role')
      .then((item) => {
           if (item) {
             setRole(item)
           }
      });
    AsyncStorage.getItem('userColor')
      .then((item) => {
           if (item) {
             //This is called every time page reloads
             //console.log('COLOR WAS SAVED: '+item);
             if(userColor == '')
             {
               setUserColor(item);
             }
           }
      });

});

useEffect(()=>{
     if (fontsLoaded) setTimeout(()=>{setReady(true);},2000);
   },[fontsLoaded]);

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBkzGLgvzrvTIa6a6zOx-IIIZJetUwNllE",
    authDomain: "mycolor-8176b.firebaseapp.com",
    databaseURL: "https://mycolor-8176b.firebaseio.com",
    projectId: "mycolor-8176b",
    storageBucket: "mycolor-8176b.appspot.com",
    messagingSenderId: "9703964298",
    appId: "1:9703964298:web:d5974b8e51fecaff5d7773",
    measurementId: "G-442K5YZLS7"
  };

if(!firebase.apps.length)
{
  firebase.initializeApp(firebaseConfig);
  //console.log('Initialized Firebase successfully');
}

function storeUserInfo(username, industry, role, color) {

  let push = firebase.database().ref('users').push();
  push.set({
    name: username,
    industry: industry,
    role: role,
    color: color,
    date: new Date().toUTCString()
  });

  console.log("Pushed to Firebase!");

}

const KeyIsAColor = (key) => {
  return (colorMenuItems.filter((item) => item.header.toLowerCase() === key.toLowerCase()).length > 0) || key == 'combo';
}

function splitBlurbAtSentences(str)
{
  var arr = str.split('.');
  var splitDex = Math.floor(arr.length/2);

  //First half: arr.slice(0, splitDex-1).join('.')+'.'

  //Second half: arr.slice(splitDex+1, arr.length).join('.')

  // Pull quote in middle: arr[splitDex]

  return {firstHalf: arr.slice(0, splitDex-1).join('.')+'.', pullQuote: arr[splitDex].substring(1)+'.', secondHalf: arr.slice(splitDex+1, arr.length).join('.').substring(1)};
}

  function elevationShadowStyle(elevation) {
    return {
      elevation,
      shadowColor: 'black',
      shadowOffset: { width: 0, height: 0.5 * elevation },
      shadowOpacity: 0.2,
      shadowRadius: 0.8 * elevation
    };
  }

  const toggleHeaderMenu = (value) => {

    if (!value) {
      setTimeout(() => {
        setHeaderMenuOptionsVisible(value);
        setoptionsHeaderVisible(true);
        setoptionsVisible(value);
      }, 400); //was 500
    }
  };

  const toggleHeader = () => {
    if (headerMenu._value > moderateScale(120)) {
      Animated.spring(headerMenu, {
        toValue: moderateScale(75),
        bounciness: 0.5,
        useNativeDriver: false,
        speed: 0.2
      }).start(toggleHeaderMenu(false));
      Animated.timing(spinValue, {
        toValue: 0,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    } else {
      setoptionsHeaderVisible(false);
      setHeaderMenuOptionsVisible(true);
      setoptionsVisible(true);
      Animated.spring(headerMenu, {
        toValue: KeyIsAColor(currentKey.toLowerCase()) ? (isTablet() ?  moderateScale(220) : moderateScale(243)) : (isTablet() ? moderateScale(190) : moderateScale(203)),
        bounciness: 0.5,
        useNativeDriver: false,
        speed: 0.2
      }).start(toggleHeaderMenu(true));
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    }
  };

  const closeHeader = () => {
    Animated.spring(headerMenu, {
      toValue: moderateScale(75),
      bounciness: 0.5,
      useNativeDriver: false,
      speed: 0.2
    }).start(toggleHeaderMenu(false));
    Animated.timing(spinValue, {
      toValue: 0,
      duration: 100,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }


//SELECT DROPDOWN
  const handleValueSelect = (value) => {

    //console.log('Selecting '+value);

    if(value != 'Connect')
    {
        setCurrentKey(value);
    }
    global.lastColor = "transparent";

    if(value == 'Results' || value == 'myCOLOR' || value == 'Teams')
    {
        setCurrentTextKey(value);
        wiggleAnimation(500); //for Results error
    }

    if(value == 'Quiz')
    {
      toggleQuiz(true);

    } else if (value == 'Connect')
    {
      openLink('instagram://user?username=mycolorpersonality');
    } else {
      toggleQuiz(false);
    }

    Animated.spring(headerMenu, {
      toValue: 60,
      bounciness: 0.5,
      useNativeDriver: false,
      speed: 0.2
    }).start(toggleHeaderMenu(false));
    Animated.timing(spinValue, {
      toValue: 0,
      duration: 100,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

//Get combo item if any
  function getColorComboItemArray(color1, color2)
  {
    return ((colorComboMenuItems.filter((item) => (item.header1 === color1 && item.header2 === color2) || (item.header1 === color2 && item.header2 === color1))));
  }

  const handleMenuToggle = isMenuOpen =>
  {
    setIsMenuOpen(isMenuOpen);

    if(global.isinLongPress && KeyIsAColor(currentKey.toLowerCase()))
    {
        if(!isMenuOpen && KeyIsAColor(currentKey))
        {
          console.log('SAME COLOR COMBO SELECTED! Current: ', currentKey.toLowerCase(), 'Secondary: ', currentKey.toLowerCase());
          if(getColorComboItemArray(currentKey.toLowerCase(), currentKey.toLowerCase()).length > 0)
          {
            setCurrentKey('Combo');
            setCurrentColorCombo(getColorComboItemArray(currentKey.toLowerCase(), currentKey.toLowerCase())[0]);
            console.log(getColorComboItemArray(currentKey.toLowerCase(), currentKey.toLowerCase())[0]);

          }
        }
    }
  }

  const Capitalize = (str) => {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    const handleItemPress = (item, index) => {
      setIsMenuOpen(false);
      toggleQuiz(false);

      global.lastColor = "transparent";

      if(global.isinLongPress && KeyIsAColor(currentKey.toLowerCase()))
      {
            console.log('COLOR COMBO PRESS');
            setCurrentKey('Combo');
            const primaryColor = KeyIsAColor(currentKey.toLowerCase()) ? currentColor : ((currentKey == 'Results' && userColor != '') ? getResultColorItem(userColor)[0].color : ((currentKey == 'Quiz' && showResult) ? getResultColorItem(resultColor)[0].color : '#ffffff'))
            const colorName = colorMenuItems.find(items => items.color === primaryColor).header;
            console.log('Current: ', colorName, 'Secondary: ', item.header);
            if(getColorComboItemArray(currentKey.toLowerCase() !== "combo" ? currentKey.toLowerCase() : colorName, item.header).length > 0)
            {
              setCurrentColorCombo(getColorComboItemArray(colorName, item.header)[0]);
              console.log("--=-=-==--=d-wdwdw",getColorComboItemArray(currentKey.toLowerCase() !== "combo" ? currentKey.toLowerCase() : colorName, item.header)[0]);
              global.lastColor = getResultColorItem(item.header)[0].color;

            }
      } else {
        setCurrentColor(item.color);
        setCurrentKey(Capitalize(item.header));
        setCurrentTextKey(item.header);
      }

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
      duration: 1200,
      easing: Easing.easeOut,
      useNativeDriver: false
    }).start(() => {
      //setBackgroundColor(new Animated.Value(0));
    });
  };

  const startBackgroundColorAnimation = () => {

    Animated.timing(backgroundColor, {
      toValue: 180,
      duration: 1200,
      easing: Easing.easeOut,
      useNativeDriver: false
    }).start(() => {
      //endBackgroundColorAnimation();
    });
  };

  const saveName = (name) => {
    AsyncStorage.setItem('username', name);
    setUsername(name);
  };

  const toggleQuiz = (open) => {

    setError1Opacity(0);
    setError2Opacity(0);
    setError3Opacity(0);

    setIsQuizOpen(open);

    Animated.parallel([
        Animated.spring(quizOffsetX, {
          toValue: open ? wp('0%') : -wp('100%'),
          bounciness: 2,
          useNativeDriver: false,
          speed: 1
        }),
        Animated.spring(scrollOffsetX, {
          toValue: open ? wp('100%') : wp('0%'),
          bounciness: 2,
          useNativeDriver: false,
          speed: 1
        })
        ]).start();
  }

  const toggleCredits = () => {
    console.log('credits');
    setIsCreditsOpen(!isCreditsOpen);

    if(currentKey == 'Quiz')
    {
      toggleQuiz(isCreditsOpen);
    }

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

    const buttonPress = (link, isShare, string) => {

      if(isShare) {
            onShare(link, string);
      } else {
            openLink(link);
      }
    }

  const onShare = async (btnLink, string) => {
        try {
          const result = await Share.share({
            message:
              string +" "+ btnLink
          });
          if (result.action === Share.sharedAction) {
            if (result.activityType) {
              // shared with activity type of result.activityType
            } else {
              // shared
            }
          } else if (result.action === Share.dismissedAction) {
            // dismissed
          }
        } catch (error) {
          console.log(error.message);
        }
  };

  const openLink = (link) => {
    if(link != '')
    {
      Linking.openURL(link);
    }
  }


//ANIMATIONS IN
  useEffect(() => {

    Animated.sequence([
    	Animated.delay(1000),
      Animated.spring(splashScale, {
        toValue: 1,
        bounciness: 4,
        useNativeDriver: false,
        speed: 2
      })
    ]).start()

    const interval = setInterval(() => {

      Animated.sequence([

          Animated.parallel([
            Animated.spring(splashScale, {
              toValue: 0,
              bounciness: 4,
              useNativeDriver: false,
              speed: 2
            }),
            Animated.spring(splashOpacity, {
              toValue: 0,
              bounciness: 2,
              useNativeDriver: false,
              speed: 3
            }),
            Animated.spring(main3dOffsetY, {
              toValue: hp('-2%'),
              bounciness: 5,
              useNativeDriver: false,
              speed: 1.2
            }),
              Animated.spring(main3dScale, {
                toValue: 1,
                bounciness: 5,
                useNativeDriver: false,
                speed: 1.2
              }),
              Animated.spring(containerOffsetY, {
                toValue: hp('-3%'),
                bounciness: 5,
                useNativeDriver: false,
                speed: 1.2
              })
        ]),
      ]).start();

  }, 4400); //WAS 4400
    return () => clearInterval(interval);
  }, []);

//Device checks
  const isOldPhone = () => {

    return (Device.modelName.includes('iPhone 8') || Device.modelName.includes('iPhone 7'));
  }

  const isTablet = () => {
    return (Device.modelName.includes('iPad') || Device.modelName.includes('Tab') || Device.modelName.includes('Pad') || Device.modelName.includes('Fire'));
  }

  const isTabletAsync = async () => {

      const deviceType = await Device.getDeviceTypeAsync();
      return (deviceType === Device.DeviceType.TABLET);

    };

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
      }, 100);
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
      setUserColor(colorResult);

      if(colorResult != '')
      {
          storeUserInfo(username, industry, role, colorResult); //Firebase
      }

      AsyncStorage.setItem('userColor', colorResult);

      setTimeout(() => {
        if (quizQuestions.length > currentQuestionIndex + 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          setShowResult(true);
        }
      }, 100);
    };

    function wiggleAnimation(delay) {
      //Wiggle!
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(errorXPos, {
              toValue: wp('2%'),
              duration: 70,
              easing: Easing.linear,
              useNativeDriver: false,
            }),
            Animated.timing(errorXPos, {
              toValue: wp('-2%'),
              duration: 90,
              easing: Easing.linear,
              useNativeDriver: false,
            }),
            Animated.timing(errorXPos, {
                toValue: wp('2%'),
                duration: 70,
                easing: Easing.linear,
                useNativeDriver: false,
              }),
              Animated.timing(errorXPos, {
                toValue: wp('-2%'),
                duration: 90,
                easing: Easing.linear,
                useNativeDriver: false,
              }),
            Animated.spring(errorXPos, {
              toValue: 0,
              bounciness: 2,
              useNativeDriver: false,
              speed: 1
            }),
        ]).start();
    }

    //From intro form to actual quiz
    const handleNextPress = () => {

      if(username != "" && role != "" && industry != "")
      {
        setDidSetUsername(true);
      } else {

        setError1Opacity(username == "" ? 1 : 0);
        setError2Opacity(industry == "" ? 1 : 0);
        setError3Opacity(role == "" ? 1 : 0);

      }
      wiggleAnimation(0);
    }

    const handleRetakePress = () => {
      console.log('Retake');

      setSelectedAnswer('');
      setCurrentQuestionIndex(0);
      setShowResult(false);
      setUserAnswers({});
      setResultColor('');
      setResultAttributes('');

      setTimeout(() => {
          setResultProgress(1);
      }, 100);
    };

    function getResultColorItem(color) {
        //console.log('**RESULT: '+color);
        //console.log(colorMenuItems.filter((item) => item.header === color));
        return colorMenuItems.filter((item) => item.header === color);
    }

//------------------------------------------------------------------->
  if (!fontsLoaded) {
    return <AppLoading />;
  } else {

const styles = ScaledSheet.create({
  shadow1: elevationShadowStyle(5),
  shadow2: elevationShadowStyle(10),
  shadow3: elevationShadowStyle(20),

  button: {
    borderRadius: '10@ms',
    backgroundColor: 'white',
    padding: 20,
    marginBottom: isTablet() ? '40@ms' : '0@ms' //always need to have @ if one does
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
    flex: 1, justifyContent: 'center', width: wp('101%'), overflow: 'visible', marginTop: isOldPhone() ? '-39@mvs' : '-24@mvs0.2'
  },
  scrollContainer: {
    flex: 1,
    marginTop: hp('14%'),
  },
  topBar: {
    marginTop: hp('7%'),
  },
  headerText: {
    fontFamily: 'CircularStd-Black',
    color: 'black',
    fontSize: '20@ms',
    textAlign: 'center'
  },
  bodyText: {
    fontFamily: 'CircularStd-Book',
    color: 'black',
    fontSize: '18@ms',
  },
  topBold: {
    fontFamily: 'CircularStd-Black',
    color: 'black',
    fontSize: '18@ms',
  },
  splash: {
        ...StyleSheet.absoluteFillObject,
        resizeMode: "cover",
        height: hp('100%'),
        width: wp('100%'),
        zIndex: 10,
      },
  splashTxt: {
        ...StyleSheet.absoluteFillObject,
        resizeMode: "cover",
        height: hp('100%'),
        width: wp('100%'),
        zIndex: 11,
      },
  scrollView: {
      paddingLeft: (currentKey == 'Results' || (currentKey == 'Quiz') || currentKey == 'Combo' || KeyIsAColor(currentKey)) ? 0 : wp('15%'),
      paddingRight: (currentKey == 'Results' || (currentKey == 'Quiz') || currentKey == 'Combo' || KeyIsAColor(currentKey)) ? 0 : wp('15%'),
      overflow: (currentKey == 'Results' || (currentKey == 'Quiz') || currentKey == 'Combo' || KeyIsAColor(currentKey)) ? 'visible' : 'hidden'
    },
    creditsBtn: {
      width: '70@ms',
      height: '70@ms',
      flex: 1,
      justifyContent: 'flex-start',
      transform: [{translateX: wp('8%')}, {translateY: hp('4.5%')}],
      position: 'absolute',
      zIndex: 5,
      marginTop: '-23@ms'
    },
    quizParagraph: {
      fontFamily: 'CircularStd-Book',
      color: 'black',
      fontSize: '18@ms',
      },
      question: {
        fontFamily: 'CircularStd-Black',
        color: 'black',
        fontSize: '18@ms',
        marginBottom: hp('7%'),
        marginTop: -hp('7%')
      },
      colorAttributesText: {
        fontFamily: 'CircularStd-Black',
        color: 'black',
        fontSize: '18@ms',
        textTransform: 'capitalize',
        marginTop: hp('2%')
      },
      answer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingTop: hp('4.2%'),
      },
      resultText: {
        fontFamily: 'CircularStd-Book',
        color: 'black',
        fontSize: '18@ms',
        textAlign: 'center',
        marginTop: -hp('7%')
      },
      resultTextBig: {
        fontFamily: 'CircularStd-Black',
        color: 'black',
        fontSize: hp('5%'),
        textAlign: 'center',
        textTransform: 'capitalize',
        marginBottom: hp('7%')
      },
      mainResultImage: {
        width: wp('100%'),
        height: '280@ms0.6',
        position: 'absolute',
        marginTop: isOldPhone() ? '430@mvs' : isTablet() ? '540@mvs' : '490@mvs',
        alignSelf: 'center'

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
        backgroundColor: 'transparent',
         marginTop: -hp('2%')
      },
      creditsTxt: {
        fontFamily: 'CircularStd-Book',
        color: 'black',
        fontSize: '18@ms',
        marginTop: verticalScale(55),
        padding: wp('14%')
      },
      errorPill: {
        backgroundColor: 'white',
        borderRadius: moderateScale(30),
        textAlign: 'center',
        justifyContent: 'center',
        padding: moderateScale(14),
        paddingHorizontal: moderateScale(20),

      },
      quizContainer: {
        flex: 1,
        position: 'absolute',
        ...StyleSheet.absoluteFillObject,
        overflow: 'visible',

      },
      quizContent: {
        justifyContent: 'center',
        overflow: 'visible',
        marginTop: '30@ms'
      },
      topCoverBar: {
        width: wp('100%'),
        height: hp('15%'),
        backgroundColor: 'white',
        position: 'absolute',
        zIndex: 1,
        opacity: 0
      },
      dropDown: {
        position: 'absolute',
        zIndex: 5,
        alignSelf: "center",
        marginTop: hp('5.5%'),
        overflow: 'visible',
      },
      elevatedMenuContainer: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 5,
        },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        borderRadius: moderateScale(10),
        elevation: 9,
        marginHorizontal: 10,
        backgroundColor: "white",
        alignItems: "center",
        flex: 1,
        width: wp('47%'),
        alignItems: "center",
        overflow: 'visible'
      },
      arrow: {
        position: 'absolute',
        zIndex: 6,
        transform: [{translateX: isOldPhone() ? '59@ms' : '69@ms0.6' }, {translateY: isOldPhone() ? '54@mvs' : '55@mvs'}]
      },
      pullQuote: {
        fontFamily: 'CircularStd-BlackItalic',
        color: 'black',
        fontSize: '25@ms',
        textAlign: 'left',
        letterSpacing: -0.5,
      },
      colorWheel:
      {
        height: hp('40%'),
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        overflow: 'visible',
        marginBottom: hp('4%'),
        marginTop: hp('-2%'),
      },
      inlineRightArrow:
      {
        width: '20@ms0.5',
        height: '20@ms0.5'
      },
      colorChar1:
      {
        position: 'absolute',
        marginTop: moderateScale(40),
        zIndex: -2,
        marginLeft: moderateScale(-80)
      },
      colorChar2:
      {
        position: 'absolute',
        marginTop: isTablet() ? moderateScale(200) : moderateScale(295),
        marginLeft: isTablet() ? moderateScale(267) : moderateScale(157),
        zIndex: -2
      },
      colorChar3:
      {
        position: 'absolute',
        marginTop: isTablet() ? moderateScale(456) : moderateScale(580),
        zIndex: -2,
        marginLeft: isTablet() ? moderateScale(213) : moderateScale(180)
      },
      colorChar4:
      {
        position: 'absolute',
        marginTop: isTablet() ? moderateScale(-15) : moderateScale(40),
        zIndex: -2,
        marginLeft: isTablet() ? moderateScale(215) : moderateScale(125)
      },
});

function getColorComboTextFormatted(colorItem)
{
  if(colorItem != null)
  {
    return ([
      <View key = {0} pointerEvents='none' style = {{display: 'flex', backgroundColor: getResultColorItem(colorItem.header2)[0].color, position: 'absolute', height: hp('100%'), width: wp('101%'), padding: 20, zIndex: 0, marginTop: -hp('75%'), overflow: 'hidden', transform: [{ translateX: wp('0%')}]}} >

      <MaskedView
          style={{ width: wp('100%'), height: hp('50%'), alignSelf: 'center', marginTop: hp('55%')}}
          maskElement={
            <View
              style={{
                // Transparent background because mask is based off alpha channel.
                backgroundColor: 'transparent',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
            <LinearGradient
                // Background Linear Gradient
                colors={['transparent', 'black']}
                start={[0.5, 0.25]}
                end={[0.5, .4]}
                style={{width: wp('100%'), height: hp('57%')}}
              />
            </View>
          }
        >
          {/* Shows behind the mask, you can put anything here, such as an image */}
          <Video
            source={{ uri: colorItem.image }}
            rate={1.0}
            isMuted={true}
            resizeMode="contain"
            shouldPlay
            isLooping
            style={{ width: wp('100%'), height: hp('57%')}}
          />
        </MaskedView>

      </View>,
      <View style = {{paddingLeft: wp('12%'), paddingRight: wp('12%'), marginTop: hp('4%')}}>
          <Text key = {1} style={[styles.pullQuote, {marginTop: hp('25%')}]}><InlineImage style = {styles.inlineRightArrow} source={require('./assets/arrowright.png')} /> {Capitalize(colorItem.header1)} and {Capitalize(colorItem.header2)}</Text>
          <Text key = {2} style ={[styles.bodyText, {marginBottom: hp('3%'), marginTop: moderateScale(4)}]}> {getResultColorItem(colorItem.header1)[0].title} and {getResultColorItem(colorItem.header2)[0].title}</Text>
          <Text key = {25} style = {styles.bodyText}>{splitBlurbAtSentences(colorItem.bodyBlurb).firstHalf} {'\n'}</Text>
          <Text key = {25} style = {styles.pullQuote}>{splitBlurbAtSentences(colorItem.bodyBlurb).pullQuote} {'\n'}</Text>
          <Text key = {25} style = {styles.bodyText}>{splitBlurbAtSentences(colorItem.bodyBlurb).secondHalf} {'\n'}</Text>
          <Text key = {22} >{'\n'}</Text>
      </View>
    ]);
  }
}

function getResultColorFormatted(color)
{

  if(color == 'combo')
  {

  }
  else if(KeyIsAColor(color))
  {
    return ([

      <View key = {0} pointerEvents='none' style = {{display: (currentKey == 'Results' || (currentKey == 'Quiz' && showResult) || KeyIsAColor(currentKey)) ? 'flex' : 'none', backgroundColor: (getResultColorItem(color).length > 0) ? getResultColorItem(color)[0].color : 'transparent', position: 'absolute', height: hp('100%'), width: wp('100.4%'), padding: 20, zIndex: 0, marginTop: -hp('75%'), overflow: 'hidden'}} >
          <MaskedView
              style={{ width: wp('100%'), height: hp('50%'), alignSelf: 'center', marginTop: hp('55%')}}
              maskElement={
                <View
                  style={{
                    // Transparent background because mask is based off alpha channel.
                    backgroundColor: 'transparent',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                <LinearGradient
                    // Background Linear Gradient
                    colors={['transparent', 'black']}
                    start={[0.5, 0.25]}
                    end={[0.5, .4]}
                    style={{width: wp('100%'), height: hp('57%')}}
                  />
                </View>
              }
            >
              {/* Shows behind the mask, you can put anything here, such as an image */}
              <Video
                source={{ uri: getResultColorItem(color)[0].image }}
                rate={1.0}
                isMuted={true}
                resizeMode="contain"
                shouldPlay
                isLooping
                style={{ width: wp('100%'), height: hp('57%')}}
              />
            </MaskedView>
      </View>,
      <View style = {{paddingLeft: wp('12%'), paddingRight: wp('12%'), marginTop: hp('4%')}}>

      <TouchableOpacity style= {{marginTop: hp('25%')}} onPress = {() => handleRetakePress()}>
          <View style = {{flexDirection:'row', flexWrap:'wrap'}}>
            <Image style = {{width: wp('8%'), height: wp('8%'), marginTop: -5, marginLeft: -12}} source={require('./assets/arrowLeft.png')} />
            <Text style = {[styles.quizParagraph, styles.shadow1, {fontFamily: 'CircularStd-Black', alignSelf: 'flex-start'}]}>Take Again</Text>
          </View>
      </TouchableOpacity>

          <Text key = {1} style={[styles.pullQuote, {marginTop: hp('2%')}]}><InlineImage style = {styles.inlineRightArrow} source={require('./assets/arrowright.png')} />{getResultColorItem(color)[0].title}</Text>
          <Text key = {2} style ={[styles.bodyText, {marginBottom: hp('3%')}]}>{getResultColorItem(color)[0].attributes}</Text>
          <Text key = {3} style = {[styles.bodyText, {marginBottom: hp('1%')}]}><Text style = {{fontFamily: 'CircularStd-Black'}}> Extraversion </Text> {'//'} {getResultColorItem(color)[0].extraversion*100}% </Text>
          <Progress.Bar key = {10} isAnimated duration={700} progress={getResultColorItem(color)[0].extraversion} color={getResultColorItem(color)[0].color} trackColor={"#F0F0F0"} height={hp('0.35%')} style = {[styles.shadow1, {shadowOpacity: 1}]} />
          <Text key = {4} style = {[styles.bodyText, {marginBottom: hp('1%'), marginTop: hp('3.5%')}]}><Text style = {{fontFamily: 'CircularStd-Black'}}> Openness </Text> {'//'} {getResultColorItem(color)[0].openness*100}% </Text>
          <Progress.Bar key = {11} isAnimated duration={700} progress={getResultColorItem(color)[0].openness} color={getResultColorItem(color)[0].color} trackColor={"#F0F0F0"} height={hp('0.35%')} style = {[styles.shadow1, {shadowOpacity: 1}]} />
          <Text key = {5} style = {[styles.bodyText, {marginBottom: hp('1%'), marginTop: hp('3.5%')}]}><Text style = {{fontFamily: 'CircularStd-Black'}}> Agreeableness </Text> {'//'} {getResultColorItem(color)[0].agreeableness*100}%</Text>
          <Progress.Bar key = {12} isAnimated duration={700} progress={getResultColorItem(color)[0].agreeableness} color={getResultColorItem(color)[0].color} trackColor={"#F0F0F0"} height={hp('0.35%')} style = {[styles.shadow1, {shadowOpacity: 1}]} />
          <Text key = {6} style = {[styles.bodyText, {marginBottom: hp('1%'), marginTop: hp('3.5%')}]}><Text style = {{fontFamily: 'CircularStd-Black'}}> Integrity </Text> {'//'} {getResultColorItem(color)[0].integrity*100}% </Text>
          <Progress.Bar key = {13} isAnimated duration={700} progress={getResultColorItem(color)[0].integrity} color={getResultColorItem(color)[0].color} trackColor={"#F0F0F0"} height={hp('0.35%')} style = {[styles.shadow1, {shadowOpacity: 1}]} />
          <Text key = {7} style = {[styles.bodyText, {marginBottom: hp('1%'), marginTop: hp('3.5%')}]}><Text style = {{fontFamily: 'CircularStd-Black'}}> Emotional Stability </Text> {'//'} {getResultColorItem(color)[0].stability*100}% </Text>
          <Progress.Bar key = {14} isAnimated duration={700} progress={getResultColorItem(color)[0].stability} color={getResultColorItem(color)[0].color} trackColor={"#F0F0F0"} height={hp('0.35%')} style = {[styles.shadow1, {shadowOpacity: 1}]} />
          <Text key = {8} style = {[styles.bodyText, {marginBottom: hp('1%'), marginTop: hp('3.5%')}]}><Text style = {{fontFamily: 'CircularStd-Black'}}> Conscientiousness </Text> {'//'} {getResultColorItem(color)[0].conscientiousness*100}% </Text>
          <Progress.Bar key = {15} isAnimated duration={700} progress={getResultColorItem(color)[0].conscientiousness} color={getResultColorItem(color)[0].color} trackColor={"#F0F0F0"} height={hp('0.35%')} style = {[styles.shadow1, {shadowOpacity: 1}]} />
          <Text key = {9} >{'\n'}{'\n'}</Text>
          <Text key = {20} style = {styles.bodyText}> {getResultColorItem(color)[0].bodyBlurb} {'\n'}{'\n'}</Text>
          <Text key = {21} style = {styles.pullQuote}><InlineImage style = {styles.inlineRightArrow} source={require('./assets/arrowright.png')} /> {getResultColorItem(color)[0].pullQuote} {'\n'} </Text>
          <Text key = {25} style = {styles.bodyText}> {getResultColorItem(color)[0].bodyBlurb2} </Text>
          <Text key = {22} >{'\n'}</Text>
      </View>
    ]);
  }
}

//Console calls

console.disableYellowBox = true;
console.warn = () => {};

function noColorYet()
{
  return ([

    <View style = {{paddingLeft: wp('12%'), paddingRight: wp('12%')}}>
        <Animated.View style = {[styles.errorPill, styles.errorPill1, styles.shadow2, {zIndex: 4, marginBottom: hp('29%'), shadowOpacity: 0.1, opacity: 1, transform: [{translateX: errorXPos}] ,}]}>
          <Text style = {[styles.bodyText, {textAlign: 'center'}]}>You don't have a color yet!</Text>
        </Animated.View>
        <Video
          source={{ uri: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/-404loop.mp4' }}
          rate={1.0}
          isMuted={true}
          resizeMode="contain"
          shouldPlay
          isLooping
          style={{ width: wp('67%'), height: hp('40%'), marginTop: hp('1%'), alignSelf: 'center', zIndex: -1, position: 'absolute'}}
        />
    </View>
  ]);
}

function getColorTextFormatted(color) //SHOWN FOR Results
{

  if (color == 'combo')
  {

  }
  else if(KeyIsAColor(color))
  {
    return ([

      <View key = {0} pointerEvents='none' style = {{display: (currentKey == 'Results' || (currentKey == 'Quiz' && showResult) || KeyIsAColor(currentKey)) ? 'flex' : 'none', backgroundColor: (getResultColorItem(color).length > 0) ? getResultColorItem(color)[0].color : 'transparent', position: 'absolute', height: hp('100%'), width: wp('100.4%'), padding: 20, zIndex: 0, marginTop: -hp('75%'), overflow: 'hidden'}} >

        <MaskedView
            style={{ width: wp('100%'), height: hp('50%'), alignSelf: 'center', marginTop: hp('55%')}}
            maskElement={
              <View
                style={{
                  // Transparent background because mask is based off alpha channel.
                  backgroundColor: 'transparent',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
              <LinearGradient
                  // Background Linear Gradient
                  colors={['transparent', 'black']}
                  start={[0.5, 0.25]}
                  end={[0.5, .4]}
                  style={{width: wp('100%'), height: hp('57%')}}
                />
              </View>
            }
          >
            {/* Shows behind the mask, you can put anything here, such as an image */}
            <Video
              source={{ uri: getResultColorItem(color)[0].image }}
              rate={1.0}
              isMuted={true}
              resizeMode="contain"
              shouldPlay
              isLooping
              style={{ width: wp('100%'), height: hp('57%')}}
            />
          </MaskedView>

      </View>,
      <View style = {{paddingLeft: wp('12%'), paddingRight: wp('12%'), marginTop: hp('4%')}}>
          <Text key = {1} style={[styles.pullQuote, {marginTop: hp('25%')}]}><InlineImage style = {styles.inlineRightArrow} source={require('./assets/arrowright.png')} /> {getResultColorItem(color)[0].title}</Text>
          <Text key = {2} style ={[styles.bodyText, {marginBottom: hp('3%')}]}>{getResultColorItem(color)[0].attributes}</Text>
          <Text key = {3} style = {[styles.bodyText, {marginBottom: hp('1%')}]}><Text style = {{fontFamily: 'CircularStd-Black'}}> Extraversion </Text> {'//'} {getResultColorItem(color)[0].extraversion*100}% </Text>
          <Progress.Bar key = {10} isAnimated duration={700} progress={getResultColorItem(color)[0].extraversion} color={getResultColorItem(color)[0].color} trackColor={"#F0F0F0"} height={hp('0.35%')} style = {[styles.shadow1, {shadowOpacity: 1}]} />
          <Text key = {4} style = {[styles.bodyText, {marginBottom: hp('1%'), marginTop: hp('3.5%')}]}><Text style = {{fontFamily: 'CircularStd-Black'}}> Openness </Text> {'//'} {getResultColorItem(color)[0].openness*100}% </Text>
          <Progress.Bar key = {11} isAnimated duration={700} progress={getResultColorItem(color)[0].openness} color={getResultColorItem(color)[0].color} trackColor={"#F0F0F0"} height={hp('0.35%')} style = {[styles.shadow1, {shadowOpacity: 1}]} />
          <Text key = {5} style = {[styles.bodyText, {marginBottom: hp('1%'), marginTop: hp('3.5%')}]}><Text style = {{fontFamily: 'CircularStd-Black'}}> Agreeableness </Text> {'//'} {getResultColorItem(color)[0].agreeableness*100}%</Text>
          <Progress.Bar key = {12} isAnimated duration={700} progress={getResultColorItem(color)[0].agreeableness} color={getResultColorItem(color)[0].color} trackColor={"#F0F0F0"} height={hp('0.35%')} style = {[styles.shadow1, {shadowOpacity: 1}]} />
          <Text key = {6} style = {[styles.bodyText, {marginBottom: hp('1%'), marginTop: hp('3.5%')}]}><Text style = {{fontFamily: 'CircularStd-Black'}}> Integrity </Text> {'//'} {getResultColorItem(color)[0].integrity*100}% </Text>
          <Progress.Bar key = {13} isAnimated duration={700} progress={getResultColorItem(color)[0].integrity} color={getResultColorItem(color)[0].color} trackColor={"#F0F0F0"} height={hp('0.35%')} style = {[styles.shadow1, {shadowOpacity: 1}]} />
          <Text key = {7} style = {[styles.bodyText, {marginBottom: hp('1%'), marginTop: hp('3.5%')}]}><Text style = {{fontFamily: 'CircularStd-Black'}}> Emotional Stability </Text> {'//'} {getResultColorItem(color)[0].stability*100}% </Text>
          <Progress.Bar key = {14} isAnimated duration={700} progress={getResultColorItem(color)[0].stability} color={getResultColorItem(color)[0].color} trackColor={"#F0F0F0"} height={hp('0.35%')} style = {[styles.shadow1, {shadowOpacity: 1}]} />
          <Text key = {8} style = {[styles.bodyText, {marginBottom: hp('1%'), marginTop: hp('3.5%')}]}><Text style = {{fontFamily: 'CircularStd-Black'}}> Conscientiousness </Text> {'//'} {getResultColorItem(color)[0].conscientiousness*100}% </Text>
          <Progress.Bar key = {15} isAnimated duration={700} progress={getResultColorItem(color)[0].conscientiousness} color={getResultColorItem(color)[0].color} trackColor={"#F0F0F0"} height={hp('0.35%')} style = {[styles.shadow1, {shadowOpacity: 1}]} />
          <Text key = {9} >{'\n'}{'\n'}</Text>
          <Text key = {20} style = {styles.bodyText}> {getResultColorItem(color)[0].bodyBlurb} {'\n'}{'\n'}</Text>
          <Text key = {21} style = {styles.pullQuote}><InlineImage style = {styles.inlineRightArrow} source={require('./assets/arrowright.png')} /> {getResultColorItem(color)[0].pullQuote} {'\n'}</Text>
          <Text key = {25} style = {styles.bodyText}> {getResultColorItem(color)[0].bodyBlurb2} </Text>
          <Text key = {22} >{'\n'}</Text>
      </View>
    ]);
  }
}

const SCALE = {
  // this defines the terms of our scaling animation.
  getScaleTransformationStyle(animated: Animated.Value, startSize: number = 1, endSize: number = 0.99) {
    const interpolation = animated.interpolate({
      inputRange: [0, 1],
      outputRange: [startSize, endSize],
    });
    return {
      transform: [
        { scale: interpolation },
      ],
    };
  },
  // This defines animation behavior we expext onPressIn
 pressInAnimation(animated: Animated.Value, duration: number = 150) {
    animated.setValue(0);
    Animated.timing(animated, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  },
  // This defines animatiom behavior we expect onPressOut
  pressOutAnimation(animated: Animated.Value, duration: number = 150) {
    animated.setValue(1);
    Animated.timing(animated, {
      toValue: 0,
      duration,
      useNativeDriver: true,
    }).start();
  },

};

//CONVERT SVG: https://react-svgr.com/playground/

const InlineImage = (props) => {
  let style = props.style;
  if (style && Platform.OS !== 'ios') {
    // Multiply width and height by pixel ratio to fix React Native bug
    style = Object.assign({}, StyleSheet.flatten(props.style));
    ['width', 'height'].forEach((propName) => {
      if (style[propName]) {
        style[propName] *= PixelRatio.get();
      }
    });
  }

  return (
    <Image
      {...props}
      style={style}
    />
  );
};

// "Inherit" prop types from Image
InlineImage.propTypes = Image.propTypes;

//VIEW ELEMENTS ------------------------------------------------------
  return (
    <View style={[styles.container]}>

    <Animated.Image pointerEvents={"none"} style={[styles.splash, { opacity: splashOpacity }]} source={require('./assets/splashnew.png')} />
    <Animated.Image pointerEvents={"none"} style={[styles.splashTxt, { opacity: splashOpacity, transform: [{scaleY: splashScale }, {scaleX: splashScale }]} ]} source={require('./assets/splash.png')} />

      <StatusBar barStyle="dark-content" />
      <View pointerEvents='none' style={styles.topCoverBar}></View>
    <View style={[styles.dropDown, {display: isCreditsOpen ? 'none' : 'flex'}]}>
    <Animated.View
      style={
        (styles.topBar,
        [
          {
            height: headerMenu,
            overflow: "hidden",
            paddingVertical: 5,
          },
        ])
      }
    >
      <View
        style={
          headerMenuOptionsVisible
            ? [styles.elevatedMenuContainer, styles.shadow1]
            : null
        }
      >
        <TouchableOpacity
          onPress={toggleHeader}
          style={{ flexDirection: "row", alignItems: "flex-start" }}
        >
        {optionsHeaderVisible && (
            <View style={{ width: moderateScale(120) }}>
            <Text
            textBreakStrategy="highQuality"
              style={[
                styles.headerText,
                styles.shadow1,
                { marginTop: 15 },
              ]}
            >
              {(currentKey != 'Combo') ? currentKey : Capitalize(currentColorCombo.header1)+'/'+Capitalize(currentColorCombo.header2)}
            </Text>
            </View>
          )}
          {!optionsVisible && !optionsHeaderVisible && (
            <View style={{ width: moderateScale(160) }} />
          )}
          {optionsVisible && (
            <View style={{ width: moderateScale(160) }}>
              <Text
              textBreakStrategy="highQuality"
                style={[
                  styles.headerText,
                  styles.shadow1,
                  { marginBottom: 10, marginTop: 15 },
                ]}
              >
                {(currentKey != 'Combo') ? currentKey : Capitalize(currentColorCombo.header1)+'/'+Capitalize(currentColorCombo.header2)}
              </Text>
              {Object.keys(bodyTexts).map((val, k) => {
                if (val !== currentKey) {
                  return (
                    <TouchableOpacity
                      key={k}
                      onPress={() => handleValueSelect(val)}
                    >
                      <Text
                        style={[
                          styles.headerText,
                          styles.shadow1,
                          { marginBottom: 10 },
                        ]}
                      >
                        {val}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              })}
            </View>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
    </View>

    <TouchableOpacity onPress={toggleHeader} pointerEvents='none' style={[styles.arrow]}>
    <Animated.Image
      style={{
        width: wp("8%"),
        height: wp("8%"),
        transform: [{ rotate: spin }],
        display: isCreditsOpen ? "none" : "flex",
      }}
      source={require("./assets/arrow.png")}
    />
    </TouchableOpacity>

      <Animated.View>
                  <Animated.View style={[styles.creditsContainer, { transform: [{translateX: creditsOffsetX }]}]}>

                  <ScrollView
                  showsVerticalScrollIndicator= {false}
                  showsHorizontalScrollIndicator= {false}
                  style={{overflow: 'visible'}}>

                    <Text style = {styles.creditsTxt}><Text style={{ fontFamily: 'CircularStd-Black' }}>myCOLOR</Text> was developed by scientific advisor Dr. J. Galen Buckwalter and redesigned as a mobile experience by Skylar Thomas at <Text style={{ fontFamily: 'CircularStd-Black' }}>Ayzenberg Group,</Text> an award winning creative agency based in Pasadena, CA. {'\n'}{'\n'}At Ayzenberg, we continually build bridges not only between our clients and their audiences, but also among disciplines, providing our teams with powerful tools, inspiring work spaces, and a philosophy and methodology based on the virtuous cycle of <Text style={{ fontFamily: 'CircularStd-Black' }}>Listen, Create, and Share. </Text></Text>
                    <TouchableOpacity onPress={() => {openLink('https://www.ayzenberg.com/')}}><Text style = {[styles.creditsTxt, {fontFamily: 'CircularStd-Black', marginTop: (isOldPhone() || isTablet()) ? moderateScale(-50) : moderateScale(60)}]}>© a.network</Text></TouchableOpacity>
                  </ScrollView>

                  </Animated.View>
                  <TouchableOpacity style = {styles.creditsBtn} onPress={toggleCredits}>
                      <LottieView
                            ref={LottieRef}
                            style={[styles.shadow1]}
                            source={require('./assets/hamburger.json')}
                            loop={false}
                            progress={lottieProgress}
                          />
                  </TouchableOpacity>
                  <Animated.View style={[styles.contentContainer, { transform: [{translateX: containerOffsetX }]} ]}>

                        <FloatingMenu
                            items={colorMenuItems}
                            isOpen={isMenuOpen}
                            position={"top-right"}
                            borderColor={'white'}
                            primaryColor={KeyIsAColor(currentKey.toLowerCase()) ? currentColor : ((currentKey == 'Results' && userColor != '') ? getResultColorItem(userColor)[0].color : ((currentKey == 'Quiz' && showResult) ? getResultColorItem(resultColor)[0].color : '#ffffff'))}
                            buttonWidth={wp('10%')}
                            borderWidth={0}
                            onMenuToggle={handleMenuToggle}
                            onItemPress={handleItemPress}
                            dimmerStyle={{opacity: 0}}
                          />

                          <Animated.View style={[styles.quizContainer, { transform: [{translateX: quizOffsetX }], overflow: 'visible',} ]}>

                      <SafeAreaView style={{flex: 1, overflow: 'visible'}}>

                          <ScrollView
                          showsVerticalScrollIndicator= {false}
                          showsHorizontalScrollIndicator= {false}
                          style={{zIndex: -3, overflow: 'visible', marginTop: moderateScale(130)}}>

                          <View style = {[styles.quizContent, {paddingHorizontal: showResult ? 0 : wp('14%'), marginTop: hp('-5%'), display: !didSetUsername ? 'flex' : 'none'}]}>
                          <Text style = {styles.pullQuote}>Hello.{'\n'}What’s your name?</Text>
                                  <Kohana
                                    onChangeText={(text) => { setUsername(text)
                                    }}
                                    style={{ backgroundColor: '#ffffff', marginLeft: -20, fontSize: 40}}
                                    label={'My name'}
                                    iconClass={MaterialsIcon}
                                    iconName={''}
                                    iconColor={'#f4d29a'}
                                    inputPadding={0}
                                    labelStyle={{ color: '#EAEAEA' }}
                                    inputStyle={{ color: 'black'}}
                                    labelContainerStyle={{ padding: 20 }}
                                    iconContainerStyle={{ padding: 20 }}
                                    useNativeDriver
                                  />
                                <Animated.View style = {[styles.errorPill, styles.errorPill1, styles.shadow2, {marginBottom: hp('7%'), shadowOpacity: 0.1, opacity: error1Opacity, transform: [{translateX: errorXPos}] ,}]}>
                                  <Text style = {[styles.bodyText, {textAlign: 'center'}]}>You didn't enter your name.</Text>
                                </Animated.View>

                                <Text style = {styles.pullQuote}>What's your industry?</Text>
                                  <Kohana
                                    onChangeText={(text) => { setIndustry(text)
                                    }}
                                    style={{ backgroundColor: '#ffffff', marginLeft: -20}}
                                    label={'My industry'}
                                    iconClass={MaterialsIcon}
                                    iconName={''}
                                    iconColor={'#f4d29a'}
                                    inputPadding={0}
                                    labelStyle={{ color: '#EAEAEA' }}
                                    inputStyle={{ color: 'black'}}
                                    labelContainerStyle={{ padding: 20 }}
                                    iconContainerStyle={{ padding: 20 }}
                                    useNativeDriver
                                  />
                                <Animated.View style = {[styles.errorPill, styles.errorPill2, styles.shadow2, {shadowOpacity: 0.1, opacity: error2Opacity, transform: [{translateX: errorXPos}], marginBottom: hp('7%')}]}>
                                  <Text style = {[styles.bodyText, {textAlign: 'center'}]}>You didn't enter an industry.</Text>
                                </Animated.View>

                                <Text style = {styles.pullQuote}>What do you do?</Text>
                                  <Kohana
                                    onChangeText={(text) => { setRole(text)
                                    }}
                                    style={{ backgroundColor: '#ffffff', marginLeft: -20 }}
                                    label={'My role'}
                                    iconClass={MaterialsIcon}
                                    iconName={''}
                                    iconColor={'#f4d29a'}
                                    inputPadding={0}
                                    labelStyle={{ color: '#EAEAEA' }}
                                    inputStyle={{ color: 'black'}}
                                    labelContainerStyle={{ padding: 20 }}
                                    iconContainerStyle={{ padding: 20 }}
                                    useNativeDriver
                                  />
                                <Animated.View style = {[styles.errorPill, styles.errorPill3, styles.shadow2, {marginBottom: hp('7%'), opacity: error3Opacity, transform: [{translateX: errorXPos}], shadowOpacity: 0.1}]}>
                                  <Text style = {[styles.bodyText, {textAlign: 'center'}]}>You didn't enter a role.</Text>
                                </Animated.View>

                            <TouchableOpacity style= {{marginTop: hp('1.5%')}} onPress = {() => handleNextPress()}>
                                <View style = {{flexDirection:'row', flexWrap:'wrap'}}>
                                  <Text style = {[styles.quizParagraph, styles.shadow1, {fontFamily: 'CircularStd-Black', alignSelf: 'flex-start'}]}>Start Quiz</Text>
                                  <Image style = {{width: wp('8%'), height: wp('8%'), marginTop: -1, transform: [{ rotate: '180deg'}]}} source={require('./assets/arrowLeft.png')} />
                                </View>
                            </TouchableOpacity>
                            <View style = {{height: hp('40%')}}></View>
                          </View>
                          <View style = {[styles.quizContent, {paddingHorizontal: showResult ? 0 : wp('14%'), display: didSetUsername ? 'flex' : 'none' }]}>
                                    <Text style={[styles.pullQuote, {display: showResult ? 'none' : 'flex', marginBottom: hp('7%'), marginTop: -hp('7%')}]}>
                                      {showResult ? '' : quizQuestions[currentQuestionIndex].question}
                                    </Text>
                                      <Progress.Bar isAnimated duration={showResult ? 500 : 200} progress={showResult ? 0 : (parseInt(currentQuestionIndex + 1) / 21)} color={"#333333"} trackColor={showResult ? 'transparent' : "#F0F0F0"} height={hp('0.35%')} style = {[styles.shadow1, {shadowOpacity: 1}]} />
                                      <View style = {{flexDirection:'row', flexWrap:'wrap'}}>
                                                <TouchableOpacity style= {{marginTop: hp('1.5%'), marginLeft: -wp('3%')}} onPress = {() => showResult ? handleRetakePress() : handleBackPress(currentQuestionIndex)}>
                                                    <View style = {{flexDirection:'row', flexWrap:'wrap'}}>
                                                      <Image style = {{width: wp('8%'), height: wp('8%'), marginTop: isTablet() ? -hp('1.3%') : -hp('0.5%')}} source={require('./assets/arrowLeft.png')} />
                                                      <Text style = {[styles.quizParagraph, styles.shadow1, {fontFamily: 'CircularStd-Black', alignSelf: 'flex-start'}]}>{showResult ? 'Take Again' : 'Back'}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                            <Text style={[styles.quizParagraph, {alignSelf: 'flex-start', marginTop: hp('1.5%'), marginLeft: wp('2%')}]}>{showResult ? '' : 'Q' + parseInt(currentQuestionIndex + 1)+"/21"}</Text>
                                      </View>
                                  {showResult ? (
                                    <View style = {{marginTop: -hp('15%')}}>
                                        { getResultColorFormatted(userColor)
                                        }
                                        <TouchableOpacity onPress = {() => {
                                              buttonPress('https://thecolorofmypersonality.com/', true, `The color of my personality is ${userColor}`);
                                            }} style={[styles.button, styles.shadow3, {display: showResult ? 'flex' : 'none', width: wp('80%'), alignSelf: 'center'}]}>
                                          <Text style ={[styles.pullQuote, {textAlign: 'center'}]}>Share</Text>
                                        </TouchableOpacity>
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
                                                      <Text style = {[styles.bodyText, {letterSpacing: -0.3, lineHeight: verticalScale(17)}]}>{answer.value}</Text>
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


                              <View style = {{display: (currentKey == 'Results') ? 'flex' : 'none'}}>
                              {userColor != '' ? getColorTextFormatted(userColor) : noColorYet()}
                              </View>

                              <View style = {{display: KeyIsAColor(currentKey) && currentKey != 'Combo' ? 'flex' : 'none'}}>
                                {getColorTextFormatted(currentKey.toLowerCase())}
                              </View>

                              <View style = {{display: currentKey == 'Combo' ? 'flex' : 'none'}}>
                              {getColorComboTextFormatted(currentColorCombo)}
                              </View>

                              <View style = {{display: (currentKey == 'myCOLOR') ? 'flex' : 'none'}}>
                              <Animated.View style = {[styles.colorWheel, { transform: [{translateY: main3dOffsetY }, {scaleX: main3dScale}, {scaleY: main3dScale} ]}]}>
                                <Video
                                  source={{ uri: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/myCOLOR+videos+optimized/colorviz3.mp4' }}
                                  rate={1.0}
                                  isMuted={true}
                                  resizeMode="cover"
                                  shouldPlay
                                  isLooping
                                  style={{ width: moderateScale(350), height: moderateScale(350), marginTop: moderateScale(40) }}
                                />
                              </Animated.View>

                              <Animated.View style={{ transform: [{translateY: containerOffsetY }]}}>

                              <View style={styles.colorChar2} >
                                  <Video
                                    source={{ uri: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/blue-char.mp4' }}
                                    rate={1.0}
                                    isMuted={true}
                                    resizeMode="contain"
                                    shouldPlay
                                    isLooping
                                    style={{ width: moderateScale(120), height: moderateScale(120)}}
                                  />
                              </View>
                                  <Text style = {styles.pullQuote}><InlineImage style = {styles.inlineRightArrow} source={require('./assets/arrowright.png')} /> What's the color of your personality? What's your vibe?{'\n'}</Text>
                                  <Text style = {styles.bodyText}>Take our myCOLOR quiz and discover the essence of your personality - who are you and how do you function alongside others? Leverage your personality’s specific color traits and share the quiz with friends to strengthen your relationships through better communication and understanding. {'\n'}</Text>


                              </Animated.View>

                              </View>


                                <View style = {{display: (currentKey == 'Teams') ? 'flex' : 'none', marginBottom: hp('5%')}}>

                                    <View style={styles.colorChar3} >
                                        <Video
                                          source={{ uri: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/yellow-char.mp4' }}
                                          rate={1.0}
                                          isMuted={true}
                                          resizeMode="contain"
                                          shouldPlay
                                          isLooping
                                          style={{ width: moderateScale(120), height: moderateScale(120)}}
                                        />
                                    </View>
                                    <View style={styles.colorChar4} >
                                        <Video
                                          source={{ uri: 'https://skylar-mycolor.s3-us-west-1.amazonaws.com/red-char.mp4' }}
                                          rate={1.0}
                                          isMuted={true}
                                          resizeMode="contain"
                                          shouldPlay
                                          isLooping
                                          style={{ width: moderateScale(230), height: moderateScale(230)}}
                                        />
                                    </View>

                                    <Text style={[styles.bodyText, {fontFamily: 'CircularStd-BookItalic', marginBottom: moderateScale(10) }]}>
                                        “Building teams inclusive of all personalities find themselves creating transformative experiences  - that is the power behind myCOLOR.”
                                        </Text>

                                    <TouchableOpacity onPress = {() => { openLink('https://www.ayzenberg.com/our-team/chris-younger/')}}><Text style = {[styles.bodyText, styles.shadow3, {fontFamily: 'CircularStd-Black'}]}><InlineImage style = {[{width: wp('9%'), height: wp('9%'), borderRadius: 100, transform: [{translateX: wp('0%')}, {translateY: moderateScale(8)}],}, styles.shadow2]} source={require('./assets/chris.png')} />  Chris Younger</Text></TouchableOpacity>

                                    <Text style={[styles.bodyText, {fontFamily: 'CircularStd-BookItalic', marginBottom: moderateScale(10), marginTop: moderateScale(35)}]}>
                                        {"\n"}"The optimal team for any communications project is the smallest adequate team for the challenge you face. Smallness empowers identity, ownership, agency, nimbleness, speed and efficiency and much more. The challenge in determining your team size is the subjectivity of “adequate to the challenge.”
                                        </Text>
                                    <TouchableOpacity onPress = {() => { openLink('https://www.ayzenberg.com/our-team/matt-bretz/')}}><Text style = {[styles.bodyText, styles.shadow3, {fontFamily: 'CircularStd-Black'}]}> <InlineImage style = {[{width: wp('9%'), height: wp('9%'), borderRadius: 100, transform: [{translateX: wp('0%')}, {translateY: moderateScale(8)}],}, styles.shadow2]} source={require('./assets/matt.png')} />   Matt Bretz</Text></TouchableOpacity>

                                    <Text style={[styles.bodyText, {fontFamily: 'CircularStd-BookItalic', marginBottom: moderateScale(10), marginTop: moderateScale(35)}]}> {"\n"} Together we are stronger. 1+1 = 4. Our strengths and weaknesses compliment one another. Impenetrable force together. ”
                                        </Text>
                                    <TouchableOpacity onPress = {() => { openLink('https://www.ayzenberg.com/our-team/gary-goodman/')}}><Text style = {[styles.bodyText, styles.shadow3, {fontFamily: 'CircularStd-Black'}]}><InlineImage style = {[{width: wp('9%'), height: wp('9%'), borderRadius: 100, transform: [{translateX: wp('0%')}, {translateY: moderateScale(8)}],}, styles.shadow2]} source={require('./assets/gary.png')} />  Gary Goodman{"\n"}</Text></TouchableOpacity>
                                </View>

                                <TouchableOpacity onPress = {() => {
                                      if(currentKey == 'myCOLOR' || (!didSetUsername && currentKey == 'Results'))
                                      {
                                        toggleQuiz(true);
                                        setCurrentKey('Quiz');
                                        //buttonPress(bodyTexts[currentKey]?.buttonLink, false, '');
                                      } else if(currentKey == 'Teams')
                                      {
                                        openLink('https://thecolorofmypersonality.com/');
                                      } else if (currentKey == 'Combo')
                                      {
                                        buttonPress('https://thecolorofmypersonality.com/', true, `This is what happens when you put a ${currentColorCombo.header1} with a ${currentColorCombo.header2}`);
                                      }
                                      else if(colorMenuItems.filter((item) => item.header === currentTextKey).length > 0) //1 color (not me)
                                      {
                                        buttonPress('https://thecolorofmypersonality.com/', true, `This is you if the color of your personality is ${currentTextKey}`);
                                      } else if (currentKey == 'Results') //my color (last time taken under my name)
                                      {
                                        buttonPress('https://thecolorofmypersonality.com/', true, `The color of my personality is ${userColor}`);
                                      }
                                    }} style={[styles.button, styles.shadow3, {width: wp('79%'), alignSelf: 'center'}]} >
                                  <Text style = {[styles.pullQuote, {textAlign: 'center'}]}>{colorMenuItems.filter((item) => item.header === currentTextKey).length > 0 ? 'Share' : bodyTexts[currentTextKey]?.buttonTitle} </Text>
                                </TouchableOpacity>
                                <Text>{"\n"}{"\n"}{"\n"}</Text>
                              </ScrollView>
                            </SafeAreaView>
                          </Animated.View>

                    </Animated.View>
            </Animated.View>
      </View>
  );
  }
}
