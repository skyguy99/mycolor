/**
 * Answer map contains a correlation of questionNo
 * with each answer index representing its actual color key
 *
 * @type {Object}
 */
const answerMap = {
  // self driving cars
  1: [ 6, 4, 3, 5, 2, 1 ],
  // college roomate in town
  2: [ 2, 3, 5, 1, 4, 6 ],
  // favorite aunt
  3: [ 6, 3, 4, 5, 1, 2 ],
  // favorite reading material
  4: [ 3, 6, 5, 1, 4, 2 ],
  // what place to live
  5: [ 3, 5, 1, 4, 2, 6 ],
  // ordering a drink
  6: [ 5, 2, 4, 1, 6, 3 ],
  // dream car
  7: [ 4, 3, 5, 2, 1, 6 ],
  // what job would be terrible
  8: [ 2, 5, 1, 4, 6, 3 ],
  // pet peeve
  9: [ 2, 6, 4, 5, 1, 3 ],
  // mythical creature
  10: [ 3, 6, 1, 2, 5, 4 ],
  // left phone in uber
  11: [ 6, 4, 3, 5, 2, 1 ],
  // people at party
  12: [ 2, 3, 5, 1, 4, 6 ],
  // text breakup
  13: [ 6, 3, 4, 5, 1, 2 ],
  // really drunk
  14: [ 3, 6, 5, 1, 4, 2 ],
  // paranoid facebook friends
  15: [ 3, 5, 1, 4, 2, 6 ],
  // free afternoon
  16: [ 5, 2, 4, 1, 6, 3 ],
  // brunch
  17: [ 4, 3, 5, 2, 1, 6 ],
  // ideal vacation
  18: [ 2, 5, 1, 4, 6, 3 ],
  // work recognition
  19: [ 2, 6, 4, 5, 1, 3 ],
  // traffic line
  20: [ 4, 3, 1, 6, 5, 2 ],
  // birthday text
  21: [ 6, 2, 3, 4, 1, 5 ]
  // people at party - old
  // num: [ 3, 5, 1, 6, 2, 4 ],
  // travel destination - old
  // num: [ 1, 2, 3, 4, 5, 6 ],
}

/**
 * Array where the ( position + 1 ) in the array
 * corresponds to the value in the answer map
 *
 * @type {Array}
 */
const colorKey = [
  'orange',
  'crimson',
  'purple',
  'blue',
  'green',
  'grey'
]

/**
 * Each answer comes in as the index of the answer in the radio list
 * we'll need to convert this to what color the index secretly stands for
 * using the index above
 *
 * @param  {number} questionNo [The question number in the quiz]
 * @param  {number} index      [The index order of the answer]
 * @return {number}            [The color index value]
 */
export function convertIndexToAnswer(questionNo, index) {
  return answerMap[questionNo][index]
}

/**
 * Each answer comes in as the index of the answer in the radio list
 * we'll need to convert this to what color the index secretly stands for
 * using the index above
 *
 * @param  {number} questionNo [The question number in the quiz]
 * @param  {number} index      [The index order of the answer]
 * @return {number}            [The color index value]
 */
export function convertAnswerToIndex(questionNo, AnswerIndex) {
  return answerMap[questionNo].indexOf(AnswerIndex)
}


/**
 * Go through the user answers and check if there is a tie
 * between any color indexes and if so, return an array containing all
 * the indexes involved in the tie
 *
 * @param  {object} userAnswers [description]
 * @return {array}             [description]
 */
export function checkForTie(userAnswers) {
  const resultObj = tallyIndexFrequencies(userAnswers)
  const tiedColors = sortIndexes(resultObj)
  return tiedColors
}

function sortIndexes(resultObj) {
  let sortable = []
  for (let index in resultObj) {
    sortable.push( [ parseInt(index), resultObj[index] ] )
  }
  sortable = sortable.sort((a, b) => ( a[1] - b[1] ))
  sortable = sortable.reverse()
  // return an array of items that are tied for first place
  let tiedIndexes = sortable.filter((singleScore) => ( singleScore[1] === sortable[0][1] ))
  tiedIndexes = tiedIndexes.map((singleScore) => ( singleScore[0] ))
  return tiedIndexes
}


/**
 * Given the answerMap index, return the corresponding
 * color name by looking up in the colorKey array
 *
 * @param  {number} index [description]
 * @return {string}       [description]
 */
export function convertIndexToColorName(index) {
  return colorKey[index -1]
}


export function calculateResultIndex(userAnswers) {
  const resultObj = tallyIndexFrequencies(userAnswers)
  const colorIndex = sortIndexes(resultObj)
  const colorResult = convertIndexToColorName(colorIndex)
  return colorResult
}

export function getTieBreakerAnswers(answers, step, tiedIndexes) {
  return answers.filter((answer, index) => {
    const answerColorIndex = convertIndexToAnswer( step, index )
    return tiedIndexes.includes(answerColorIndex)
  })
}

export function isTieBreakerAnswer(step, answerIndex, tiedIndexes) {
  const answerColorIndex = convertIndexToAnswer( step, answerIndex )
  return tiedIndexes.includes(answerColorIndex)
}


/**
 * Convert object of user answers into an object
 * where the properties are the color indexes, and their
 * corresponding values are the number of times they were
 * chosen as the answer
 *
 * @param  {object} userAnswers [description]
 * @return {object} resultObj   [description]
 */
function tallyIndexFrequencies(userAnswers) {
  let resultObj = {}
  for ( var prop in userAnswers ) {
    if ( resultObj[ userAnswers[prop] ] ) {
      resultObj[userAnswers[prop]] += 1
   }
   else {
      resultObj[userAnswers[prop]] = 1
   }
  }
  return resultObj
}
