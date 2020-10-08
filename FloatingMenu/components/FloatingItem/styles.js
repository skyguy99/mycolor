import { StyleSheet } from 'react-native';

import { Design } from '../../constants';

export default StyleSheet.create({
  itemLabel: {
    lineHeight: 20,
    width: 150,
    position: 'absolute',
    top: Design.buttonWidth * 0.5 - 12,
    zIndex: 7,
    transform: [{ rotate: '0deg' }],
    overflow: 'hidden'
  },

  activityIndicator: {
    width: 30,
    height: 30,
    alignSelf: 'center',
  },
});

const colorMenuItems = [
  { label: '', header: 'orange', color: '#fca500', darkerColor: '#AF7300', shareLink: '', attributes: 'Optimistic, Friendly, Perceptive',
  bodyText: '\nOptimism and friendliness characterize people, like you, whose personality color is Orange. \n\n You are friendly and nurturing, but may need to take care that your good nature doesn’t lead others to unload all their frustrations on you without any reciprocation. \n\nPeople whose personality color is Orange aren’t typically big party people. You prefer smaller gatherings where you can engage with everyone else. You’re whimsical and value zaniness in others. You’re also bubbly, in an infectious, happy, joyful way. You see the best in people, despite what others may say about them. And you’re a forgiver—to a fault. As a hopeless romantic, breaking connections is difficult for you. \n\nWhen you open your heart, it’s all or nothing. This means you love deeper, but also that heartbreak hurts more. You may never stop loving former flames, with hopes of one day rekindling. But you are never opposed to new opportunities for love and connection.\n\n'},

  { label: '', header: 'blue', color: '#0081d1', darkerColor: '#00578D', shareLink: '', attributes: 'Dependable, Practical, Directive',
  bodyText: '\nDependability is a key feature that characterizes people, like you, whose personality color is blue. \n\nBlues tend to be rule-following, dependable, long-enduring, and tenacious. You make sacrifices in order to rise up the ranks in the world. You put in the extra hours in the office. You always fill out your taxes and pay your bills on time. You have a plan that you stick to. You never stand people up and are always timely. Most importantly, you’re there for your loved ones when they need you most. You lend an ear, do favors, and don’t disappoint. You don’t cheat and try to be 100% honest in all aspects of life. \n\nYou value honesty above all. You might miss out on fun once and a while, due to your discipline. But in your mind, it’s worth it in the long-run. One night of partying isn’t worth not being at your best for work in the morning. You like routines and outlines, things that maintain structure. Organization is key to the way you operate; it’s what makes you staunch, loyal, and trustworthy.\n\n'},

  { label: '', header: 'green', color: '#6fa229', darkerColor: '#47651D', shareLink: '', attributes: 'Peaceful, Serene, Accommodating',
  bodyText: '\nPeacefulness and tranquility characterize people, like you, whose personality color is green. \n\nAs a Green, you are known for your chill vibes, and your body is rarely consumed with anxiety. Chores, work, and even exercise is easier when you are well rested and relaxed. \n\nYour life is centered around achieving maximum comfort, whether it’s investing in luxuries like massage chairs and water beds or meditating and productively removing stress from your body. You’re a deep sleeper and everything is better when it can be done from the comfort of your bed. Confrontation is not a part of your lifestyle. You prefer when issues resolve themselves or require minimal input and stress on your part. Accommodation is where you thrive—allowing others to achieve their peace without interrupting yours. Your chillness and cool, calm, collected way of composing yourself is attractive to a lot of people, but also means that you don’t take some things seriously that deserve uninterrupted attention.\n\n'},

  { label: '', header: 'grey', color: '#939598', darkerColor: '#5C5D5F', shareLink: '', attributes: 'Powerful, Mysterious, Provocative',
  bodyText: '\nPower and mystery are dominant factors that characterize people, like you, whose personality color is Grey. \n\nAs a Grey, you know no fear—and no limits. You like to keep people guessing. People crave mystery and uncertainty—they want to find out more about you. But you won’t let them; you never let anyone get too close, to fully discover who you are. \n\nYou have an air of aloofness; you play coy and hard to get. Never the one to initiate, you attract all sorts of invitations to various events from those around you. You value solitude, reflection, and privacy. An eclectic grouping of interest takes up your time, which exposes you to all sorts of different crowds. You enjoy exhilarating activities, living life on the edge at times. Cavalier and brash, but collected, is how you live your life. You don’t care about the judgement of others and make decisions for yourself and yourself alone. This may mean that you have trouble with intimacy, but it doesn’t mean you don’t have romantic interests. Perhaps they just don’t last very long, or maybe your loved one is the only person you aren’t a mystery to.\n\n'},

  { label: '', header: 'crimson', color: '#d12b51', darkerColor: '#901F39', shareLink: '', attributes: 'Adventurous, Bold, Direct',
  bodyText: '\nFriendliness and a love of excitement characterize people, like you, whose personality color is Crimson. \n\nBold, assertive, domineering, craving excitement—it’s how you live your life. You aren’t afraid to tell people exactly what you think, and you certainly don’t hold back in any aspect of your life. Passion and brashness can get you into trouble, but that’s par for the course. \n\nYou are achievement-focused and work hard towards achieving what you desire. Settling down is not on your agenda. Mistakes are made, but life keeps moving forward. \n\nAs a social animal, you don’t mind (and might even thrive on) being the center of attention. Extraverted is an understatement; you love getting to know people and discussing cool new opportunities with them. Popularity is key; your place in society and how people regard you is extremely important to your identity. Everything needs to be efficient, clean, and, most importantly, sleek. You’re the life of the party and the face that brightens up the room.\n\n'},

  { label: '', header: 'purple', color: '#b15de6', darkerColor: '#901F39', shareLink: '', attributes: 'Creative, Expressive, Emotive',
  bodyText: '\nCreativity is the dominant element that characterizes people, like you, whose personality color is purple. \n\nAs a Purple, you are a creative thinker: thoughtful, reflective, maybe even a little quirky. Convention does not influence you. You are a problem solver, but take the road less traveled. You value art and other creative ventures. You’re very expressive verbally, physically, and in the work that you do. Life is whimsical; you leave your options open. Philosophy is important to you, as is existential thinking and maybe even a bit of nihilism. \n\nYou take great pride in the culturally diverse life you live, and the knowledge and respect that you have for all things in the realm of eclectic art. You have a wellspring of creative energy that you channel into productive artistic activity, including travel. You’re skilled with your hands and a true artisan at heart. Some people may criticize your fringy lifestyle, but you are unapologetic.\n\n'},

];
