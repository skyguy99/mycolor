import React from 'react';
import {useRef} from 'react';
import { Component, useState, useEffect } from 'react';
import AsyncStorage from "@react-native-community/async-storage"
import { useFonts } from '@use-expo/font';
import { AppLoading } from 'expo';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import FloatingMenu from './FloatingMenu/components/FloatingMenu';
import * as Progress from 'expo-progress';
import LottieView from "lottie-react-native";
import Svg, { G, Path } from "react-native-svg";
import { Button, Menu, Divider, Provider, RadioButton } from 'react-native-paper';
import { StyleSheet, Text, View, Image, ImageBackground, Share, Animated, Easing, StatusBar, FlatList, SafeAreaView, ScrollView, TouchableWithoutFeedback, TouchableOpacity, Dimensions } from 'react-native';
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
        'CircularStd-BookItalic' : require('./assets/CircularStd-BookItalic.ttf'),
        'CircularStd-BlackItalic' : require('./assets/CircularStd-BlackItalic.ttf'),
  });

  //persistent vars
  const [username, setUsername] = useState('');
  const [userColor, setUserColor] = useState('');

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

  const [isSelectingSecondColor, setIsSelectingSecondColor] = React.useState(false);
  const [currentColor, setCurrentColor] = React.useState('#fca500');
  const [secondColor, setSecondColor] = React.useState('');

  const [splashOffsetY, setSplashOffsetY] = React.useState(new Animated.Value(0));
  const [creditsOffsetX, setCreditsOffsetX] = React.useState(new Animated.Value(wp('100%')));
  const [containerOffsetY, setContainerOffsetY] = React.useState(new Animated.Value(hp('-200%')));
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
  const colorWheelArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const colorMenuItems = [
    { label: '', header: 'orange', color: '#fca500', darkerColor: '#AF7300', shareLink: '', attributes: 'Optimistic, Friendly, Perceptive', extraversion: 0.9, openness: 0.95, agreeableness: 0.9, integrity: 0.85, stability: 0.2, conscientiousness: 0.75, title: 'The Enthusiast', bodyBlurb: 'You are friendly and nurturing, but may need to take care that your good nature doesn’t lead others to unload all their frustrations on you without any reciprocation. People whose personality color is Orange aren’t typically big party people. You prefer smaller gatherings where you can engage with everyone else.', pullQuote: 'You’re whimsical and value zaniness in others.', bodyBlurb2: 'As a hopeless romantic, breaking connections is difficult for you. When you open your heart, it’s all or nothing. This means you love deeper, but also that heartbreak hurts more. You may never stop loving former flames, with hopes of one day rekindling. But you are never opposed to new opportunities for love and connection.', image: require('./assets/orangechar.png')},

    { label: '', header: 'blue', color: '#0081d1', darkerColor: '#00578D', shareLink: '', attributes: 'Dependable, Practical, Directive', extraversion: 0.3, openness: 0.3, agreeableness: 0.5, integrity: 1.0, stability: 0.8, conscientiousness: 0.9, title: 'The Director', bodyBlurb: 'You have a plan that you stick to. You never stand people up and are always timely. Most importantly, you’re there for your loved ones when they need you most. You lend an ear, do favors, and don’t disappoint. You don’t cheat and try to be 100% honest in all aspects of life. You value honesty above all.', pullQuote: 'Blues tend to be rule-following, dependable, long-enduring, and tenacious.', bodyBlurb2: 'You might miss out on fun once and a while, due to your discipline. But in your mind, it’s worth it in the long-run. One night of partying isn’t worth not being at your best for work in the morning. You like routines and outlines, things that maintain structure. Organization is key to the way you operate; it’s what makes you staunch, loyal, and trustworthy.', image: require('./assets/bluechar.png')},

    { label: '', header: 'green', color: '#6fa229', darkerColor: '#47651D', shareLink: '', attributes: 'Peaceful, Serene, Accommodating', extraversion: 0.75, openness: 0.7, agreeableness: 0.95, integrity: 0.4, stability: 0.95, conscientiousness: 0.5, title: 'The Peacemaker', bodyBlurb: 'As a Green, you are known for your chill vibes, and your body is rarely consumed with anxiety. Chores, work, and even exercise is easier when you are well rested and relaxed. Your life is centered around achieving maximum comfort, whether it’s investing in luxuries like massage chairs and water beds or meditating and productively removing stress from your body.', pullQuote: 'You prefer when issues resolve themselves or require minimal input and stress on your part.', bodyBlurb2: 'Accommodation is where you thrive—allowing others to achieve their peace without interrupting yours. Your chillness and cool, calm, collected way of composing yourself is attractive to a lot of people, but also means that you don’t take some things seriously that deserve uninterrupted attention.', image: require('./assets/greenchar.png')},

    { label: '', header: 'grey', color: '#939598', darkerColor: '#5C5D5F', shareLink: '', attributes: 'Powerful, Mysterious, Provocative', extraversion: 0.1, openness: 0.1, agreeableness: 0.1, integrity: 0.9, stability: 0.8, conscientiousness: 0.45, title: 'The Brooder', bodyBlurb: 'As a Grey, you know no fear—and no limits. You like to keep people guessing. People crave mystery and uncertainty—they want to find out more about you. But you won’t let them; you never let anyone get too close, to fully discover who you are. You have an air of aloofness; you play coy and hard to get. Never the one to initiate, you attract all sorts of invitations to various events from those around you.', pullQuote: 'You value solitude, reflection, and privacy.', bodyBlurb2: 'Cavalier and brash, but collected, is how you live your life. You don’t care about the judgement of others and make decisions for yourself and yourself alone. This may mean that you have trouble with intimacy, but it doesn’t mean you don’t have romantic interests. Perhaps they just don’t last very long, or maybe your loved one is the only person you aren’t a mystery to.', image: require('./assets/greychar.png')},

    { label: '', header: 'crimson', color: '#d12b51', darkerColor: '#901F39', shareLink: '', attributes: 'Adventurous, Bold, Direct', extraversion: 0.95, openness: 0.75, agreeableness: 0.1, integrity: 0.9, stability: 0.5, conscientiousness: 0.3, title: 'The Achiever', bodyBlurb: 'Bold, assertive, domineering, craving excitement—it’s how you live your life. You aren’t afraid to tell people exactly what you think, and you certainly don’t hold back in any aspect of your life. Passion and brashness can get you into trouble, but that’s par for the course.', pullQuote: 'You are achievement-focused and work hard towards achieving what you desire.', bodyBlurb2: 'Extraverted is an understatement; you love getting to know people and discussing cool new opportunities with them. Popularity is key; your place in society and how people regard you is extremely important to your identity. Everything needs to be efficient, clean, and, most importantly, sleek. You’re the life of the party and the face that brightens up the room.', image: require('./assets/crimsonchar.png')},

    { label: '', header: 'purple', color: '#b15de6', darkerColor: '#874AAD', shareLink: '', attributes: 'Creative, Expressive, Emotive', extraversion: 0.8, openness: 0.7, agreeableness: 0.9, integrity: 0.5, stability: 0.1, conscientiousness: 0.85, title: 'The Explorer', bodyBlurb: 'As a Purple, you are a creative thinker: thoughtful, reflective, maybe even a little quirky. Convention does not influence you. You are a problem solver, but take the road less traveled. You value art and other creative ventures.Life is whimsical; you leave your options open. Philosophy is important to you, as is existential thinking and maybe even a bit of nihilism.', pullQuote: 'You’re very expressive verbally, physically, and in the work that you do.', bodyBlurb2: 'You take great pride in the culturally diverse life you live, and the knowledge and respect that you have for all things in the realm of eclectic art. You have a wellspring of creative energy that you channel into productive artistic activity, including travel.Some people may criticize your fringy lifestyle, but you are unapologetic.', image: require('./assets/purplechar.png')},

  ];

  var colorComboMenuItems = [
    {header1: 'blue', header2: 'grey', shareLink: '', bodyBlurb: 'Although honesty is important to both of you, how you understand it is very different. Blues relate honesty closely to work ethic and clarity, where Greys see clearly the hypocrisies and contradictions in life, and feel the only honest response is to point them out. Blues want to get things done, and do the best with what they’ve got. Greys see a lot of gray. Greys, remember that Blues love organization and control: bolster them, congratulate them on their successes. Blues, remember that Greys may see ambiguity where you see clarity. Explain yourself conversationally, and be humble. A little bit of acknowledgement will go a long way toward getting a Grey on board.', pullQuote: '', bodyBlurb2: ''},
    {header1: 'blue', header2: 'orange', shareLink: '', bodyBlurb: 'Blues and Oranges are both givers, although in different ways. Blues give themselves wholeheartedly to work; you can count on them to stay late and to care about doing the smallest things right. Oranges give themselves to people, anticipating their needs, saying just the right thing to put people at ease. Although you are both givers, you may not recognize this about each other because of the different ways that you express it. Learn how to give and receive gifts in the other person’s style. You may not always notice that you are being given a gift when it’s not on your wavelength.', pullQuote: '', bodyBlurb2: ''},
    {header1: 'blue', header2: 'purple', shareLink: '', bodyBlurb: 'Chances are that Purples and Blues find beauty and meaning in distinctly divergent ways. With your strengths combined, Purples and Blues may create functional beauty. A Blue may bring the detailed, orderly perfectionism needed to launch something fantastic. A Purple may bring an unexpected work-around to a tough problem, or a seemingly odd idea that with a Blue’s rational perspective may lead to a workable solution. Pause to solicit ideas from each other, and affirm each others strengths. Often the natural human instinct is to feel frustration when confronted with difference seek to cultivate joy in the diversity between you.', pullQuote: '', bodyBlurb2: ''},
    {header1: 'blue', header2: 'crimson', shareLink: '', bodyBlurb: 'You’re both committed and hard-working which makes you the most boring color combination of all time; laughing at yourselves will help with this. Incidentally, you are also probably the most productive color combination of all time. While you’re wonderfully efficient, your duo probably isn’t the source of crazy, new ideas. To a Crimson, Blue may seem bogged down by precision and rules. On the other hand, a Crimson may seem reckless and imprudent to a Blue. Although this might be frustrating, you certainly complement each other. Chances are that together you’ll be far more fruitful than you would be with any other color.', pullQuote: '', bodyBlurb2: ''},
    {header1: 'blue', header2: 'green', shareLink: '', bodyBlurb: 'Green and Blue may just be the lowest stress color combination of them all: a low-key Green attitude that doesn’t make a mountain out of a molehill and with detail-oriented Blue thinking that keeps on top of things. However, there is potential for seriously conflicting priorities. Blues may sometimes see Greens as not pulling their weight; Greens may see Blues as stressing out over every little thing. Both of you communicate nonverbally, and will be tempted to respond to the other’s behavior by intensifying your own; Greens becoming ever more flagrantly chill, and Blues ever more aggressively diligent. So communicate! Allow your differences to complement each other instead of exacerbate the problem.', pullQuote: '', bodyBlurb2: ''},

    {header1: 'green', header2: 'orange', shareLink: '', bodyBlurb: 'Green and Orange are not the best duo to move a project forward aggressively. You are both perfectly happy dwelling in the comfort zone. If you start to feel stuck, you may try bringing other personality types into the mix. As a team, you both help with team cohesion and harmony. Oranges, you see the positive side to any personality. By sharing this with the team, you may help change negative attitudes. You are also unafraid of disagreement; you see it as a natural expression of personality difference. While you don’t enjoy unhealthy or overly aggressive conflict, you find healthy conflict to be positive and growth-oriented.', pullQuote: '', bodyBlurb2: ''},
    {header1: 'green', header2: 'purple', shareLink: '', bodyBlurb: 'Purples and Greens most likely get along perfectly well. If you can accept each other’s attitudes as genuine, Purple and Green make for a relaxed, conflict-free team. It may be hard to solicit ideas from a Green, particularly when there is a difference of opinion in the room. Chances are the Green would foremost like to see resolution, even if it comes at the expense of the product...and there may even be times that preservation of work relationships is the most important thing. Purples, with their non-threatening quirkiness, may be able to help Greens engage in contentious work, and see that creative tension can come with enormous benefits.', pullQuote: '', bodyBlurb2: ''},
    {header1: 'green', header2: 'crimson', shareLink: '', bodyBlurb: 'The brash go-getter and the stress-free chillaxer may not have a lot in common aesthetically and can find themselves taken aback and irked by each other at times. That’s okay, and may even be positive if you’re committed to making it work! Greens, try not to sacrifice honesty for the sake of cohesion; positive conflict equals growth. Lean into a healthy disagreement. Try allowing yourself to be swept up by Crimson’s ambition and vision. Crimsons, be aware when you are amping up your energy levels to compensate for the Greens around you. Be aware that Greens avoid conflict, and may reflexively voice agreement without true commitment, simply to keep the peace.', pullQuote: '', bodyBlurb2: ''},
    {header1: 'green', header2: 'grey', shareLink: '', bodyBlurb: 'Greens see strength in stability. Greys see strength in pushing through facade to a more “real” relationship. If you can understand where the other is coming from, you can get into a solid friendship. Greys may need to try less talk, more walk in terms of being the good they want to see. Greens should realize a well-placed critique can break the ice, with humor and without anxiety. Greys may be able to bring a Green into a new situation by showing them that risk can be mysterious, even beautiful. Greens, you may be able to help a Grey open up, by modeling peaceful honesty.', pullQuote: '', bodyBlurb2: ''},

    {header1: 'green', header2: 'green', shareLink: '', bodyBlurb: 'The chances that you two, as Greens, will erupt into conflict hovers somewhere between zero and minus zero. But that doesn’t mean you will be the most productive pair, either. The first issue that may harm your productivity is the fact you both prefer stability, so change (even productive change) can upset the status quo. A little-known fact about Greens is that under their very calm exteriors are some very strong opinions. And just because you are both Greens does not mean you have the same opinions on everything. While eruptions rarely occur, conflicts do not automatically resolve themselves. So don’t assume things are always great with each other. Keep checking in and keep support levels high.', pullQuote: '', bodyBlurb2: ''},
    {header1: 'blue', header2: 'blue', bodyBlurb: 'Theoretically, two Blues working together should be an ideal pair. How could two dependable and organized folks not work together to improve the outcomes of both? Well, a part of being Blue is also having a distinct preference for calling the shots and we all know what happens when we have more than one chef in the kitchen. Sometimes you may find that it is best to agree to have different areas where you can each explore your own ideas. But that is certainly not the typical outcome, and with some compromises and cooperation you can both apply your incredible abilities to work together for everyone’s advantage.', pullQuote: '', bodyBlurb2: ''},
    {header1: 'grey', header2: 'grey', shareLink: '', bodyBlurb: 'Who hates each other more: two punks who love different bands, or a blue-haired social justice warrior stuck in a room with an internet troll? When you buck the establishment, its hard to get along with other anti-establishment types unless their interests align exactly with your own. Fortunately, the antidote is also your strong suit: self-deprecating humor and snarky comments. Admit the flaws in your own crusade, and hopefully theyll admit the flaws in theirs too and you can have a good laugh about the hopelessness of it all. Then move on and get some freakin work done. Shoulder to shoulder you will quickly find that the other person brings sharp clarity and new perspectives that can really push the project forward and expand your own understanding.', pullQuote: '', bodyBlurb2: ''},
    {header1: 'crimson', header2: 'crimson', shareLink: '', bodyBlurb: 'This same-color pair often enjoys a spectacular outcome when working together. The energy, passion and adventurousness of two Crimsons combine to produce results above and beyond what either could have done alone. But there are also times when aspects of Crimsons may clash. The desire to lead, to be in the spotlight, to be recognized as unique, and other Crimson traits can make it difficult to work together toward a common goal. The sooner Crimsons recognize their common traits, the easier it is to build workarounds to make sure your similarities do not clash. Create separate areas where you can both shine, find ways to share the spotlight, or take turns being out in front. It will take considerable effort, but always strive to mesh your incredible drives and passions and find ways to pull together.', pullQuote: '', bodyBlurb2: ''},
    {header1: 'purple', header2: 'purple', shareLink: '', bodyBlurb: 'If days were only longer, Purples could find ways to work so much more effectively together. There never seems to be enough time to describe all the ideas that fill every Purple’s mind. Even when working in close proximity, a Purple often prefers to have more time focusing on the task at hand without the presence of another. The key is to find the areas where you both The key is to find the areas where you both excel and give each other recognition and support for your individual strengths. It may also take some volitional effort by both of you to make sure productivity doesn’t lose out to the desire to brainstorm. However, when you provide mutual support and both help each other stay focused on productivity, chances are you will be an exceptional pair of colleagues.', pullQuote: '', bodyBlurb2: ''},
    {header1: 'orange', header2: 'orange', shareLink: '', bodyBlurb: 'When a Orange joins forces with another Orange, an enjoyable association is bound to result. Oranges bring joy and optimism to everyone and know exactly when to help and when to step back. The only real problem for two Oranges is that neither of you may be comfortable taking the lead because you both enjoy being helpful. Of course, one of you may know the work environment so well that you may enjoy taking the lead even if it is not your natural style. Regardless, given your mutual desire to make the world a better place every day, you are sure to find ways mesh together to get the job done.', pullQuote: '', bodyBlurb2: ''},

    {header1: 'grey', header2: 'crimson', shareLink: '', bodyBlurb: 'You both approach social interactions with a bold courage, although the emotional impulse which drives your courage is quite different. With this in mind, Crimsons, be aware that not all social behavior is to be taken literally. Although it doesn’t feel efficient, try engaging a Grey in a short caper before getting down to business; tell a story, say something intentionally mysterious just for fun. This will help you build rapport with a Grey. Greys, examine the motivations behind your behavior and ask yourself if there are better ways to accomplish your goals. Mystery is certainly an awesome hat to have in your closet, but hopefully you’re not using it just to annoy.', pullQuote: '', bodyBlurb2: ''},
    {header1: 'grey', header2: 'orange', shareLink: '', bodyBlurb: 'Greys and Oranges both want to improve relationships. Oranges may put themselves out there in risky and vulnerable ways, and may get hurt by a Grey, especially if a Grey uses the opportunity to crack a joke. Oranges, realize that a snarky joke is sometimes intended to be friendly when it is used to start rapport. A Grey will likely be overjoyed if you snark back. In reality, emotional closeness and cutting through the nonsense are both necessary for building close relationships. With this in mind, you may start to enjoy each other’s company.', pullQuote: '', bodyBlurb2: ''},
    {header1: 'grey', header2: 'purple', shareLink: '', bodyBlurb: 'Greys and Purples are likely to share personality traits and maybe even interests and may even be amused and inspired by each other. However, although Greys and Purples tend to appreciate one another, there is always potential for conflict or misunderstanding. Greys may intentionally say something obtuse, and Purples have been known to wax poetic, especially when they have just discovered a new artist or author. Greys, remember that it takes a lot of courage to put yourself out there. Until you have risked as much as the Purple has, don’t dare speak to them in a way that’s going to make them hold back. Ease up on the brutal side of your brutal honesty.', pullQuote: '', bodyBlurb2: ''},

    {header1: 'crimson', header2: 'orange', shareLink: '', bodyBlurb: 'Crimson and Orange may be at different ends of the introvert-extrovert spectrum. It can be a lot of fun to hang out, as long as you know this about each other. Orange, if you need an advocate or ally, try reaching out to a Crimson. Crimson will gladly take the spotlight at a meeting, while Orange may feel more comfortable talking one-on-one afterwards. Crimson, be aware of the Oranges in the room, and ask them to speak up, or pause before speaking to give others a chance. And Orange, if you have a great idea, try blurting it out before you can second guess yourself.', pullQuote: '', bodyBlurb2: ''},
    {header1: 'orange', header2: 'purple', shareLink: '', bodyBlurb: 'Purples and Oranges will tend to communicate well with each other; Oranges try to be great listeners, and Purples are expressive; well, at least when they have something original to share. Purples may enjoy hanging out with someone who laughs at their odd remarks (it takes creative energy to come up with new things to say!), and lobs a joke of their own back. Purples and Oranges might not be the best duo to get things accomplished quickly and efficiently. Oranges promote team cohesion and morale, and Purples generate new ideas and solve problems. So you may find it helpful to bring a Blue or Crimson on the team to manage and drive outcomes.', pullQuote: '', bodyBlurb2: ''},
    {header1: 'crimson', header2: 'purple', shareLink: '', bodyBlurb: 'There’s potential for fantastic collaboration between a Crimson and Purple. Purple brings the creative, outside-of-the-box inspiration; Crimson brings the ambitious, enterprising charge toward the finish line. Together this may be a recipe for innovation. Purple on its own may never get past thinking and designing, but Crimson loves a new idea, takes it, and leads the charge. A word of caution: a team of only Crimson and Purple may do wise to bring on a pragmatist. You may benefit from a voice of practicality--someone to research, test, and plan.', pullQuote: '', bodyBlurb2: ''},
  ];

  var bodyTexts = {
    'myCOLOR': {body: 'We’ve updated the myCOLOR personality quiz to be more accurate and effective. With the addition of twelve new questions, the quiz results can better determine your personality type and how you can improve your work and social interactions with others. By encouraging your friends and colleagues to take the myCOLOR personality quiz, you’ll be able to leverage your personality’s specific color traits and theirs to strengthen your relationships through better communication and understanding.\n\nUsing our Soulmates.AI technology, our chief scientific advisor, Dr. J. Galen Buckwalter, created a fun quiz that lets you discover the color of your personality, which we call myCOLOR. Learning about your color will give you insights into yourself as well as how you can interact more effectively with others, from family and friends to co-workers and other teammates.\n\nPeople are often surprised to find the color revealed by the quiz is different than the one they assume defines their personality. See if the color you receive reveals new information about your personality by taking the quiz below.\n\n', topBold: '', buttonLink: 'https://thecolorofmypersonality.com/', buttonTitle: 'Take the Quiz'},

    'yourCOLOR': {body: '', topBold: (username != '') ? `Hi ${username}.\nYour color is ${userColor}. Cheers! \n` : `\n`, buttonLink: '', buttonTitle: 'Share'},

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
           // do the damage
           setUsername(item);
           //console.log('We remember you! '+username);
         }
    });
    AsyncStorage.getItem('userColor')
      .then((item) => {
           if (item) {
             // dont override otherwise
             if(userColor == '')
             {
               setUserColor(item);
             }
           }
      });

});

const KeyIsAColor = (key) => {
  return colorMenuItems.filter((item) => item.header.toLowerCase() === key.toLowerCase()).length > 0;
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
      }, 500);
    }
  };

  const toggleHeader = () => {
    if (headerMenu._value > 120) {
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
    } else {
      setoptionsHeaderVisible(false);
      setHeaderMenuOptionsVisible(true);
      setoptionsVisible(true);
      Animated.spring(headerMenu, {
        toValue: KeyIsAColor(currentKey.toLowerCase()) ? 240 : 200,
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

//SELECT DROPDOWN
  const handleValueSelect = (value) => {

    //console.log('Selecting '+value);
    setCurrentKey(value);

    if(value == 'yourCOLOR' || value == 'myCOLOR' || value == 'Teams')
    {
        setCurrentTextKey(value);
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

    if(global.isinLongPress)
    {
        if(!isMenuOpen && KeyIsAColor(currentKey))
        {
          console.log('SAME COLOR COMBO SELECTED! Current: ', currentKey.toLowerCase(), 'Secondary: ', currentKey.toLowerCase());
          if(getColorComboItemArray(currentKey.toLowerCase(), currentKey.toLowerCase()).length > 0)
          {
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
    setCurrentColor(item.color);

    console.log('GLOBAL: ', global.isinLongPress);

    if(global.isinLongPress)
    {
      console.log('COLOR COMBO PRESS');
      console.log('Current: ', currentKey.toLowerCase(), 'Secondary: ', item.header);
      if(getColorComboItemArray(currentKey.toLowerCase(), item.header).length > 0)
      {
        setCurrentColorCombo(getColorComboItemArray(currentKey.toLowerCase(), item.header)[0]);
        console.log(getColorComboItemArray(currentKey.toLowerCase(), item.header)[0]);
      }
    }


    setCurrentKey(Capitalize(item.header));
    setCurrentTextKey(item.header);
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

    //button functions

    // <Jiro
      //     style={{width: hp('35%'), marginLeft: -50}}
      //     label={'Your name'}
      //     labelStyle={{color: '#F48D10', fontFamily: 'SequelSans-BlackDisp', fontSize: hp('1.5%'), marginLeft: 28}}
      //     borderColor={'#FDE6C9'}
      //     inputPadding={16}
      //     inputStyle={{ color: '#F48D10', fontFamily: 'SequelSans-RomanDisp', fontSize: hp('4.8%'), marginLeft: 28}}
      //     returnKeyType="next"
      //     onSubmitEditing={(textVal) => saveName(textVal.nativeEvent.text)}
      //   />

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

  React.useEffect(() => {
    if (backgroundColor._value === 0) {
      startBackgroundColorAnimation();
    }
  }, [backgroundColor, startBackgroundColorAnimation]);

  useEffect(() => {
    const interval = setInterval(() => {

      Animated.parallel([
        Animated.spring(splashOffsetY, {
  				toValue: hp('100%'),
  				bounciness: 1,
  				useNativeDriver: false,
          speed: 1.4
  			}),
        Animated.spring(containerOffsetY, {
  				toValue: hp('-3%'),
  				bounciness: 5,
  				useNativeDriver: false,
          speed: 1.2
  			})
      ]).start();

  }, 0); //WAS 4200
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

      //console.log('Setting user color: '+colorResult);

      AsyncStorage.setItem('userColor', userColor);

      setTimeout(() => {
        if (quizQuestions.length > currentQuestionIndex + 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          setShowResult(true);
        }
      }, 100);
    };

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

const styles = StyleSheet.create({
  shadow1: elevationShadowStyle(5),
  shadow2: elevationShadowStyle(10),
  shadow3: elevationShadowStyle(20),

  button: {
    borderRadius: 13,
    backgroundColor: 'white',
    padding: 20
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
    flex: 1, justifyContent: 'center', width: wp('101%'), overflow: 'visible'
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
    fontSize: hp('2.35%'),
    textAlign: 'center'
  },
  bodyText: {
    fontFamily: 'CircularStd-Book',
    color: 'black',
    fontSize: hp('2.35%')
  },
  topBold: {
    fontFamily: 'CircularStd-Black',
    color: 'black',
    fontSize: hp('2.35%')
  },
  splash: {
        ...StyleSheet.absoluteFillObject,
        resizeMode: "cover",
        height: hp('100%'),
        width: wp('100%'),
        zIndex: 10,
      },
  scrollView: {
      paddingLeft: (currentKey == 'yourCOLOR' || (currentKey == 'Quiz') || KeyIsAColor(currentKey)) ? 0 : wp('15%'),
      paddingRight: (currentKey == 'yourCOLOR' || (currentKey == 'Quiz') || KeyIsAColor(currentKey)) ? 0 : wp('15%'),
      overflow: (currentKey == 'yourCOLOR' || (currentKey == 'Quiz') || KeyIsAColor(currentKey)) ? 'visible' : 'hidden'
    },
    creditsBtn: {
      width: wp('20%'),
      height: wp('17%'),
      flex: 1,
      justifyContent: 'flex-start',
      transform: [{translateX: wp('8%')}, {translateY: hp('4.5%')}],
      position: 'absolute',
      zIndex: 5,
    },
    quizParagraph: {
      fontFamily: 'CircularStd-Book',
      color: 'black',
      fontSize: hp('2.35%'),
      },
      question: {
        fontFamily: 'CircularStd-Black',
        color: 'black',
        fontSize: hp('2.35%'),
        marginBottom: hp('7%'),
        marginTop: -hp('7%')
      },
      colorAttributesText: {
        fontFamily: 'CircularStd-Black',
        color: 'black',
        fontSize: hp('2.35%'),
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
        fontSize: hp('2.35%'),
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
        fontSize: hp('2.35%'),
        marginTop: hp('10%'),
        padding: wp('14%')
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
        borderRadius: 10,
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
        transform: [{translateX: wp('17.5%') }, {translateY: hp('7.5%')}]
      },
      pullQuote: {
        fontFamily: 'CircularStd-BlackItalic',
        color: 'black',
        fontSize: hp('3.1%'),
        textAlign: 'left'
      },
      colorWheel:
      {
        height: hp('40%'),
        padding: wp('20%'),
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        overflow: 'visible',
        marginBottom: hp('4%'),
        marginTop: hp('0%')
      },
      colorChar1:
      {
        position: 'absolute',
        width: wp('37%'),
        height: wp('37%'),
        marginLeft: wp('47%'),
        marginTop: hp('45%'),
        zIndex: 5
      },
      colorChar2:
      {
        position: 'absolute',
        width: wp('41%'),
        height: wp('41%'),
        marginLeft: wp('-13%'),
        marginTop: hp('95%'),
        zIndex: 5
      }
});

function getColorComboTextFormatted(colorItem)
{
  if(colorComboMenuItems.indexOf(colorItem) > -1)
  {
    return ([

      <View style = {{paddingLeft: wp('12%'), paddingRight: wp('12%'), marginTop: hp('4%')}}>
          <Text key = {1} style={[styles.pullQuote, {marginTop: hp('25%')}]}><InlineImage style = {{width: wp('5%'), height: wp('5%')}} source={require('./assets/arrowright.png')} /> {colorItem.header1} and {colorItem.header2}</Text>
          <Text key = {2} style ={[styles.bodyText, {marginBottom: hp('3%')}]}> {getResultColorItem(colorItem.header1)[0].title} and {getResultColorItem(colorItem.header2)[0].title}</Text>
          <Text key = {20} style = {styles.bodyText}> {colorItem.bodyBlurb} {'\n'}{'\n'}</Text>
          <Text key = {22} >{'\n'}</Text>
      </View>
    ]);
  }
}

function getResultColorFormatted(color)
{
  if(KeyIsAColor(color))
  {
    return ([

      <View key = {0} pointerEvents='none' style = {{display: (currentKey == 'yourCOLOR' || (currentKey == 'Quiz' && showResult) || KeyIsAColor(currentKey)) ? 'flex' : 'none', backgroundColor: (getResultColorItem(color).length > 0) ? getResultColorItem(color)[0].color : 'transparent', position: 'absolute', height: hp('100%'), width: wp('100.4%'), padding: 20, zIndex: 0, marginTop: -hp('75%'), overflow: 'hidden'}} >
          <Image style = {{width: wp('100%'), height: wp('100%'), position: 'absolute', marginTop: hp('60%')}} source={getResultColorItem(color)[0].image} />
      </View>,
      <View style = {{paddingLeft: wp('12%'), paddingRight: wp('12%'), marginTop: hp('4%')}}>

      <TouchableOpacity style= {{marginTop: hp('25%')}} onPress = {() => handleRetakePress()}>
      <Text style = {styles.topBold}>Take Again</Text>
      </TouchableOpacity>

          <Text key = {1} style={[styles.pullQuote, {marginTop: hp('2%')}]}><InlineImage style = {{width: wp('5%'), height: wp('5%')}} source={require('./assets/arrowright.png')} />{getResultColorItem(color)[0].title}</Text>
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
          <Text key = {9} >{'\n'}</Text>
          <Text key = {20} style = {styles.bodyText}> {getResultColorItem(color)[0].bodyBlurb} {'\n'}{'\n'}</Text>
          <Text key = {21} style = {styles.pullQuote}><InlineImage style = {{width: wp('5%'), height: wp('5%')}} source={require('./assets/arrowright.png')} /> {getResultColorItem(color)[0].pullQuote} {'\n'}{'\n'} </Text>
          <Text key = {25} style = {styles.bodyText}> {getResultColorItem(color)[0].bodyBlurb2} </Text>
          <Text key = {22} >{'\n'}</Text>
      </View>
    ]);
  }
}

function getColorTextFormatted(color)
{
  if(KeyIsAColor(color))
  {
    return ([

      <View key = {0} pointerEvents='none' style = {{display: (currentKey == 'yourCOLOR' || (currentKey == 'Quiz' && showResult) || KeyIsAColor(currentKey)) ? 'flex' : 'none', backgroundColor: (getResultColorItem(color).length > 0) ? getResultColorItem(color)[0].color : 'transparent', position: 'absolute', height: hp('100%'), width: wp('100.4%'), padding: 20, zIndex: 0, marginTop: -hp('75%'), overflow: 'hidden'}} >
          <Image style = {{width: wp('100%'), height: wp('100%'), position: 'absolute', marginTop: hp('60%')}} source={getResultColorItem(color)[0].image} />
      </View>,
      <View style = {{paddingLeft: wp('12%'), paddingRight: wp('12%'), marginTop: hp('4%')}}>
          <Text key = {1} style={[styles.pullQuote, {marginTop: hp('25%')}]}><InlineImage style = {{width: wp('5%'), height: wp('5%')}} source={require('./assets/arrowright.png')} /> {getResultColorItem(color)[0].title}</Text>
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
          <Text key = {9} >{'\n'}</Text>
          <Text key = {20} style = {styles.bodyText}> {getResultColorItem(color)[0].bodyBlurb} {'\n'}{'\n'}</Text>
          <Text key = {21} style = {styles.pullQuote}><InlineImage style = {{width: wp('5%'), height: wp('5%')}} source={require('./assets/arrowright.png')} /> {getResultColorItem(color)[0].pullQuote} {'\n'}{'\n'} </Text>
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

const SvgComponent = (props) => {

  if(props.id == 0)
  {
    return (
      <Svg viewBox="0 0 891.22 891.22" {...props}>
        <G data-name="Layer 2">
          <G data-name="Layer 13">
            <Path
              d="M281.51 182.41L213.86 65A447.58 447.58 0 0051.61 237.16L168.89 305a310.31 310.31 0 01112.62-122.59z"
              fill="#e53112"
            />
          </G>
        </G>
      </Svg>
    )
  } else if(props.id == 1)
  {
    return (
      <Svg viewBox="0 0 891.22 891.22" {...props}>
        <G data-name="Layer 2">
          <G data-name="Layer 13">
            <Path
              d="M444 136.05V0a443.45 443.45 0 00-230.31 65l67.79 117.4A307.32 307.32 0 01444 136.05z"
              fill="#f9ad0a"
            />
          </G>
        </G>
      </Svg>
    )
  } else if(props.id == 2)
  {
    return (
      <Svg viewBox="0 0 891.22 891.22" {...props}>
        <G data-name="Layer 2">
          <G data-name="Layer 13">
            <Path
              d="M444.31 136.05a307.41 307.41 0 01162.31 46.06l68.44-118.55A443.3 443.3 0 00445.61 0H444v136z"
              fill="#f3f40f"
            />
          </G>
        </G>
      </Svg>
    )
  }
  else if(props.id == 3)
  {
    return (
      <Svg viewBox="0 0 891.22 891.22" {...props}>
        <G data-name="Layer 2">
          <G data-name="Layer 13">
          <Path
            d="M719.6 304.72l119.26-68.86a447.38 447.38 0 00-163.8-172.3l-68.44 118.55A310.29 310.29 0 01719.6 304.72z"
            fill="#4cd71c"
          />
          </G>
        </G>
      </Svg>
    )
  }
  else if(props.id == 4)
  {
    return (
      <Svg viewBox="0 0 891.22 891.22" {...props}>
        <G data-name="Layer 2">
          <G data-name="Layer 13">
          <Path
            d="M838.86 235.86L719.6 304.72a307.55 307.55 0 0133.58 140.2c0 6.36-.21 12.67-.59 18.94h138.26q.38-9.08.37-18.25a443.55 443.55 0 00-52.36-209.75z"
            fill="#38b54e"
          />
          </G>
        </G>
      </Svg>
    )
  }
  else if(props.id == 5)
  {
    return (
      <Svg viewBox="0 0 891.22 891.22" {...props}>
        <G data-name="Layer 2">
          <G data-name="Layer 13">
          <Path
            d="M135.45 444.92A307.56 307.56 0 01168.87 305L51.58 237.32A443.69 443.69 0 000 445.61q0 9.18.38 18.25H136c-.34-6.27-.55-12.58-.55-18.94z"
            fill="#de0037"
          />
          </G>
        </G>
      </Svg>
    )
  }
  else if(props.id == 6)
  {
    return (
      <Svg viewBox="0 0 891.22 891.22" {...props}>
        <G data-name="Layer 2">
          <G data-name="Layer 13">
          <Path
            d="M136 463.86H.38a443.13 443.13 0 0067 217.43l117.91-68.09A307.09 307.09 0 01136 463.86z"
            fill="#db00a0"
          />
          </G>
        </G>
      </Svg>
    )
  }
  else if(props.id == 7)
  {
    return (
      <Svg viewBox="0 0 891.22 891.22" {...props}>
        <G data-name="Layer 2">
          <G data-name="Layer 13">
          <Path
           d="M752.59 463.86a307.17 307.17 0 01-49.45 149.64L823 682.69a443.09 443.09 0 0067.86-218.83z"
           fill="#2bd49e"
         />
          </G>
        </G>
      </Svg>
    )
  }
  else if(props.id == 8)
  {
    return (
      <Svg viewBox="0 0 891.22 891.22" {...props}>
        <G data-name="Layer 2">
          <G data-name="Layer 13">
          <Path
            d="M703.14 613.5a310.3 310.3 0 01-112.92 103.7l69 119.57A447.85 447.85 0 00823 682.69z"
            fill="#1ba0e0"
          />
          </G>
        </G>
      </Svg>
    )
  }
  else if(props.id == 9)
  {
    return (
      <Svg viewBox="0 0 891.22 891.22" {...props}>
        <G data-name="Layer 2">
          <G data-name="Layer 13">
          <Path
            d="M444.31 753.79H444v137.42h1.66a443.62 443.62 0 00213.64-54.45l-69-119.57a307.41 307.41 0 01-145.99 36.6z"
            fill="#1230df"
          />
          </G>
        </G>
      </Svg>
    )
  }
  else if(props.id == 10)
  {
    return (
      <Svg viewBox="0 0 891.22 891.22" {...props}>
        <G data-name="Layer 2">
          <G data-name="Layer 13">
          <Path
            d="M297.85 716.91l-68.39 118.46A443.24 443.24 0 00444 891.21V753.78a307.44 307.44 0 01-146.15-36.87z"
            fill="#6a02e0"
            fillRule="evenodd"
          />
          </G>
        </G>
      </Svg>
    )
  }
  else if(props.id == 11)
  {
    return (
      <Svg viewBox="0 0 891.22 891.22" {...props}>
        <G data-name="Layer 2">
          <G data-name="Layer 13">
          <Path
            d="M185.29 613.2L67.35 681.29a447.83 447.83 0 00162.11 154.08l68.39-118.46A310.36 310.36 0 01185.29 613.2z"
            fill="#a200e0"
          />
          </G>
        </G>
      </Svg>
    )
  } else {
    return null;
  }
}

//old myCOLOR:
// <Text style = {styles.bodyText}>We’ve updated the myCOLOR personality quiz to be more accurate and effective. With the addition of twelve new questions, the quiz results can better determine your personality type and how you can improve your work and social interactions with others.{'\n'}{'\n'}</Text>
// <Text style = {styles.pullQuote}><InlineImage style = {{width: wp('5%'), height: wp('5%')}} source={require('./assets/arrowright.png')} /> Learning about your color will give you insights into yourself as well as how you can interact more effectively with others</Text>
// <Text style = {styles.bodyText}>{'\n'}{'\n'}By encouraging your friends and colleagues to take the myCOLOR personality quiz, you’ll be able to leverage your personality’s specific color traits and theirs to strengthen your relationships through better communication and understanding.{'\n'}{'\n'}</Text>
// <Text style = {styles.pullQuote}> <InlineImage style = {{width: wp('5%'), height: wp('5%')}} source={require('./assets/arrowright.png')} /> People are often surprised to find the color revealed by the quiz is different than the one they assume defines their personality.</Text>
// <Text style = {styles.bodyText}> {'\n'}{'\n'}Using our Soulmates.AI technology, our chief scientific advisor, Dr. J. Galen Buckwalter, created a fun quiz that lets you discover the color of your personality, which we call myCOLOR. Learning about your color will give you insights into yourself as well as how you can interact more effectively with others, from family and friends to co-workers and other teammates.{'\n'}{'\n'}</Text>

//VIEW ELEMENTS ------------------------------------------------------
  return (
    <View style={[styles.container]}>
    <View style={styles.dropDown}>
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
            <Text
              style={[
                styles.headerText,
                styles.shadow1,
                { marginTop: 15 },
              ]}
            >
              {currentKey}
            </Text>
          )}
          {!optionsVisible && !optionsHeaderVisible && (
            <View style={{ width: 120 }} />
          )}
          {optionsVisible && (
            <View style={{ width: 120 }}>
              <Text
                style={[
                  styles.headerText,
                  styles.shadow1,
                  { marginBottom: 10, marginTop: 15 },
                ]}
              >
                {currentKey}
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
    <View pointerEvents='none' style={styles.arrow}>
    <Animated.Image
      style={{
        width: wp("8%"),
        height: wp("8%"),
        transform: [{ rotate: spin }],
      }}
      source={require("./assets/arrow.png")}
    />
    </View>

      <Animated.Image pointerEvents={"none"} style={[styles.splash, { transform: [{translateY: splashOffsetY }]} ]} source={require('./assets/splash2-txt.png')} />
      <Animated.View pointerEvents={"none"} style = {[styles.splash, {zIndex: 9, transform: [{translateY: splashOffsetY }], backgroundColor: backgroundColor.interpolate({
          inputRange: [0, 30, 60, 90, 120, 150, 180],
          outputRange: [
            '#d12b51',
            '#0081d1',
            '#6fa229',
            '#939598',
            '#fca500',
            '#b15de6',
            '#d12b51'
          ],
        }),}]}>
      </Animated.View>

      <Animated.View style={{ transform: [{translateY: containerOffsetY }]}}>
                  <Animated.View style={[styles.creditsContainer, { transform: [{translateX: creditsOffsetX }]}]}>
                    <Text style = {styles.creditsTxt}><Text style={{ fontFamily: 'CircularStd-Black' }}>myCOLOR</Text> was developed by scientific advisor Dr. J. Galen Buckwalter and redesigned as a mobile experience by Skylar Thomas at <Text style={{ fontFamily: 'CircularStd-Black' }}>Ayzenberg Group,</Text> an award winning creative agency based in Pasadena, CA. {'\n'}{'\n'}At Ayzenberg, we continually build bridges not only between our clients and their audiences, but also among disciplines, providing our teams with powerful tools, inspiring work spaces, and a philosophy and methodology based on the virtuous cycle of <Text style={{ fontFamily: 'CircularStd-Black' }}>Listen, Create, and Share. </Text></Text>
                    <TouchableOpacity onPress={() => {openLink('https://www.ayzenberg.com/')}}><Text style = {[styles.creditsTxt, {fontFamily: 'CircularStd-Black', marginTop: hp('3%')}]}>© a.network.</Text></TouchableOpacity>
                  </Animated.View>
                  <TouchableOpacity style = {styles.creditsBtn} onPress={toggleCredits}>
                      <LottieView
                            ref={LottieRef}
                            style={styles.shadow1}
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
                            primaryColor={KeyIsAColor(currentKey.toLowerCase()) ? currentColor : ((currentKey == 'yourCOLOR' && userColor != '') ? getResultColorItem(userColor)[0].color : '#ffffff')}
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
                          style={{zIndex: -3, overflow: 'visible', marginTop: hp('18%')}}>

                          <View style = {[styles.quizContent, {paddingHorizontal: showResult ? 0 : wp('14%')}]}>
                                    <Text style={[styles.pullQuote, {display: showResult ? 'none' : 'flex', marginBottom: hp('7%'), marginTop: -hp('7%')}]}>
                                      {showResult ? '' : quizQuestions[currentQuestionIndex].question}
                                    </Text>
                                      <Progress.Bar isAnimated duration={showResult ? 500 : 200} progress={showResult ? 0 : (parseInt(currentQuestionIndex + 1) / 21)} color={"#333333"} trackColor={showResult ? 'transparent' : "#F0F0F0"} height={hp('0.35%')} style = {[styles.shadow1, {shadowOpacity: 1}]} />
                                      <View style = {{flexDirection:'row', flexWrap:'wrap'}}>
                                                <TouchableOpacity style= {{marginTop: hp('1.5%'), marginLeft: -wp('3%')}} onPress = {() => showResult ? handleRetakePress() : handleBackPress(currentQuestionIndex)}>
                                                    <View style = {{flexDirection:'row', flexWrap:'wrap'}}>
                                                      <Image style = {{width: wp('8%'), height: wp('8%'), marginTop: -4}} source={require('./assets/arrowLeft.png')} />
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
                                            }} style={{display: showResult ? 'flex' : 'none'}}>
                                          <Text>Share</Text>
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

                              <View style = {{display: isSelectingSecondColor ? 'flex' : 'none'}}>
                              {getColorComboTextFormatted(currentColorCombo)}
                              </View>

                              <View style = {{display: (currentKey == 'yourCOLOR') ? 'flex' : 'none'}}>
                              {getColorTextFormatted(userColor)}
                              </View>

                              <View style = {{display: KeyIsAColor(currentKey) ? 'flex' : 'none'}}>
                                {getColorTextFormatted(currentKey.toLowerCase())}
                              </View>

                              <View style = {{display: (currentKey == 'myCOLOR') ? 'flex' : 'none'}}>

                              <View style = {styles.colorWheel}>
                                <TouchableOpacity key={200}
                                onPressIn={() => {SCALE.pressInAnimation(scaleOutAnimated)}}
                                onPressOut={() => {SCALE.pressOutAnimation(scaleOutAnimated)}}
                                style={[SCALE.getScaleTransformationStyle(scaleOutAnimated, 1, 1.14), {justifyContent: 'center', alignItems: 'center'}]}
                                >
                                    <Image style = {{width: wp('120%'), height: wp('120%')}} source={require('./assets/placeholder.png')} />
                                </TouchableOpacity>

                              </View>
                                  <Text style = {styles.pullQuote}><InlineImage style = {{width: wp('5%'), height: wp('5%')}} source={require('./assets/arrowright.png')} /> What's the color of your personality? What's your vibe?{'\n'}</Text>
                                  <Text style = {styles.bodyText}>Take our myCOLOR quiz and discover the essence of your personality - who are you and how do you function alongside others? Leverage your personality’s specific color traits and share the quiz with friends to strengthen your relationships through better communication and understanding. {'\n \n'}</Text>
                                <Image style = {styles.colorChar1} source={require('./assets/guy.png')}/>

                              </View>


                                <View style = {{display: (currentKey == 'Teams') ? 'flex' : 'none'}}>
                                <Text style={[styles.bodyText, {fontFamily: 'CircularStd-BookItalic'}]}>
                                    “Building teams inclusive of all personalities find themselves creating transformative experiences  - that is the power behind myCOLOR.”{"\n"}
                                    </Text>
                                    <TouchableOpacity onPress = {() => { openLink('https://www.ayzenberg.com/our-team/chris-younger/')}}><Text style = {styles.pullQuote}><InlineImage style = {{width: wp('5%'), height: wp('5%')}} source={require('./assets/arrowright.png')} /> Chris Younger</Text></TouchableOpacity>

                                    <Text style={[styles.bodyText, {fontFamily: 'CircularStd-BookItalic'}]}>
                                        {"\n"}"The optimal team for any communications project is the smallest adequate team for the challenge you face. Smallness empowers identity, ownership, agency, nimbleness, speed and efficiency and much more. The challenge in determining your team size is the subjectivity of “adequate to the challenge.” {"\n"}
                                        </Text>
                                    <TouchableOpacity onPress = {() => { openLink('https://www.ayzenberg.com/our-team/matt-bretz/')}}><Text style = {styles.pullQuote}><InlineImage style = {{width: wp('5%'), height: wp('5%')}} source={require('./assets/arrowright.png')} /> Matt Bretz</Text></TouchableOpacity>

                                    <Text style={[styles.bodyText, {fontFamily: 'CircularStd-BookItalic'}]}> {"\n"} Together we are stronger. 1+1 = 4. Our strengths and weaknesses compliment one another. Impenetrable force together. ”{"\n"}
                                        </Text>
                                    <TouchableOpacity onPress = {() => { openLink('https://www.ayzenberg.com/our-team/gary-goodman/')}}><Text style = {styles.pullQuote}><InlineImage style = {{width: wp('5%'), height: wp('5%')}} source={require('./assets/arrowright.png')} /> Gary Goodman{"\n"}</Text></TouchableOpacity>
                                </View>
                                  <Image style = {[styles.colorChar2, {display: currentKey == 'myCOLOR' ? 'flex' : 'none'}]} source={require('./assets/guy2.png')}/>
                                <TouchableOpacity onPress = {() => {
                                      if(currentKey == 'myCOLOR')
                                      {
                                        toggleQuiz(true);
                                        setCurrentKey('Quiz');
                                        //buttonPress(bodyTexts[currentKey]?.buttonLink, false, '');
                                      } else if(currentKey == 'Teams')
                                      {
                                        buttonPress(bodyTexts[currentKey]?.buttonLink, true, 'Check out myCOLOR Teams');
                                      } else if(colorMenuItems.filter((item) => item.header === currentTextKey).length > 0) //1 color (not me)
                                      {
                                        buttonPress('https://thecolorofmypersonality.com/', true, `This is you if the color of your personality is ${currentTextKey}`);
                                      } else if(currentKey == 'colors') //2 color combo
                                      {
                                        buttonPress('https://thecolorofmypersonality.com/', true, `Here's what happens when you put a ${currentColor} and ${secondColor} together`);
                                      } else if (currentKey == 'yourCOLOR') //my color (last time taken under my name)
                                      {
                                        buttonPress('https://thecolorofmypersonality.com/', true, `The color of my personality is ${userColor}`);
                                      }
                                    }} style={[styles.button, styles.shadow3, {width: wp('79%'), alignSelf: 'center'}]} >
                                  <Text style = {[styles.pullQuote, {textAlign: 'center'}]}>{colorMenuItems.filter((item) => item.header === currentTextKey).length > 0 ? 'Share' : bodyTexts[currentTextKey]?.buttonTitle} </Text>
                                </TouchableOpacity>
                                <Text>{"\n"}{"\n"}{"\n"}{"\n"}</Text>
                              </ScrollView>
                            </SafeAreaView>
                          </Animated.View>

                    </Animated.View>
            </Animated.View>
      </View>
  );
  }
}
