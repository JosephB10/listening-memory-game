
const startScreen = document.querySelector(".startScreen")
const runningScreen = document.querySelector(".runningScreen")
const answerScreen = document.querySelector(".answerScreen")

const startButton = document.querySelector(".startButton")
const stopButton = document.querySelector(".stopButton")

const volume = document.querySelector(".volume")

const rightAnswers = document.querySelector(".rightAnswers")
const wrongAnswers = document.querySelector(".wrongAnswers")

const buttonsDiv = document.querySelector(".buttonsDiv")
const runningText = document.querySelector(".runningText")

const answerButtons = document.querySelectorAll(".answers")

const beepSound = document.getElementById('beep')
const clickSound = document.getElementById("click")
const correctSound = document.getElementById("correct")

const allStopButtons = [...document.querySelectorAll(".answers")]
allStopButtons.push(stopButton)

const difficultyOption = document.querySelectorAll(".difficultyOption")


let debugText = []

let audioText = "Default Text"
let stopFlag = false
let invalidOptions = new Set([])


let spokenOptions = 3
let initialDelay = 7
let endOfDelay = 30
let randomDelayTime = true

difficultyOption.forEach((option) => option.addEventListener("click", (e) => changeSettings(e)))


async function changeSettings(e){
  playClickSound()

  const selectedButton = document.querySelectorAll(".difficultyOption.selected")

  selectedButton.forEach((button) => button.classList.remove("selected"))
  e.target.classList.add("selected")

  //Set the difficulty options 
  switch(e.target.textContent){
    case "Fast Challenge":
      spokenOptions = 3
      initialDelay = 3
      randomDelayTime = false
      break

    case "Training":
      spokenOptions = 3
      initialDelay = 7
      endOfDelay = 30
      randomDelayTime = true    
      break

    case "Hard":
      spokenOptions = 5
      initialDelay = 3
      endOfDelay = 6
      randomDelayTime = true
      break
  }
}


startButton.addEventListener("click", gameLoop)
stopButton.addEventListener("click", () => {
  stopFlag = true
  window.speechSynthesis.cancel()
})

let selectedVoice = null

// // Wait until voices are loaded
// // Then pick the right one
window.speechSynthesis.onvoiceschanged = () => {
  const voices = window.speechSynthesis.getVoices()
  selectedVoice = voices.find(v => v.name === "Google UK English Male") 
}


async function playClickSound(){
  const sound = clickSound.cloneNode()
  sound.volume = volume.value / 100
  sound.play()
}



//Uses the volume, picked voice, and provided text to speak
//Uses a promise so we can await the end of the speech
function playAudio(audio){

  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(audio)
    utterance.voice = selectedVoice
    utterance.rate = 1.1
    utterance.volume = volume.value / 100

    //Resolve when finished
    utterance.onend = () => resolve()

    //Reject on error
    utterance.onerror = (e) => reject(e)

    window.speechSynthesis.speak(utterance)

  })
}


async function printDebugToConsole(){
  console.log(debugText.join("\n"))
  debugText = []
}


//Creates a delay that's broken up into 50ms values to stop more promptly
const delay = (ms) => new Promise(resolve => {
  const start = Date.now();
  const interval = setInterval(() => {
    if (stopFlag || Date.now() - start >= ms) {
      clearInterval(interval);
      resolve();
    }
  }, 50); // check every 50ms
});


function waitForButtonPress(buttons){
  return new Promise((resolve) => {
    const handler = (e) => {
      playClickSound()
      
      buttons.forEach(b => b.removeEventListener('click', handler))
      resolve(e.target)
    }

    buttons.forEach(b=> b.addEventListener('click', handler))
  })
}



//Returns a float between the min and max
function getRandomFloatInRange(min, max) {
  return Math.random() * (max - min) + min
}

function getRandomIntInRange(min,max){
  return Math.floor(Math.random() * (max-min) + min)
}



function createRandomNames(){

  const numberOfLetters = 3
  const numberOfNumbers = 3
  let endingValue


  while(true){

    let name = []
  
    const ICAO_letters = ["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel", "India", "Juliet", "Kilo", "Lima", "Mike", "November", "Oscar", "Papa", "Quebec", "Romeo", "Sierra", "Tango", "Uniform", "Victor", "Whiskey", "X-ray", "Yankee", "Zulu"]
    const numbers = ["0","1", "2", "3", "4", "5", "6", "7", "8", "9"]
    const letters = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]
  
  
  
    for(let i = 0; i < numberOfNumbers; i++){
      const numberIndex = getRandomIntInRange(0,numbers.length)
      name.push(numbers[numberIndex])
    }
  
    name.push(" ")
  
    for(let i = 0; i < numberOfLetters; i++){
      const lettersIndex = getRandomIntInRange(0, letters.length)
      name.push(letters[lettersIndex])
  
    }
  
    endingValue = name.join("")

    if(!invalidOptions.has(endingValue)){
      debugText.push("create Random Names Returns value: ", endingValue)
      return endingValue
    }

    debugText.push("Ran into a copy, rerunning: ", endingValue)
  }
}




async function gameLoop(){


  startScreen.classList.remove("active")
  runningScreen.classList.add("active")

  if(!runningText.classList.contains("active")){
    runningText.classList.add("active")
    buttonsDiv.classList.remove("active")
  }


  //Initial Values
  stopFlag = false
  let counter = 0

  //Delay either a random amount or the initial amount
  let time = initialDelay
  if(randomDelayTime === true){
    time = getRandomFloatInRange(initialDelay, endOfDelay )
  } 
  await delay(time * 1000)

  debugText.push(`Initial Delay time: ${time}`)


  //Game Loop

  try{

    // Outer Loop that runs 10 times
    while(stopFlag === false && counter < 10){

      counter++

      invalidOptions = new Set([])
      const validOptions = []
      
      //Creates 4 names that will be used for the multiple choice (one will be replaced with the correct)
      for(let i = 0; i < 4; i++){
        invalidOptions.add(createRandomNames())
      }
      

      //** This was for a random number of Spoken Options **
      // const numberOfOptions = getRandomIntInRange(3, 7)
      // debugText.push(`Number of Options: ${numberOfOptions}`)
      

      //--------------------------------------------- Logic to Speak the Names ---------------------------------

      for(let i = 0; i < spokenOptions; i++){
        
        //Make sure the user hasn't selected stop
        if(stopFlag === true) throw new Error("stopFlag")

        //Get a random and unique "123 abc" then push it to validOptions
        const nameValue = createRandomNames()
        validOptions.push(nameValue)


        //Play the Audio Clip 
        await playAudio(nameValue.split(" ").join(",").split("").join(" "))
    
        //Delay either a random amount or the initial amount
        if(randomDelayTime === true){
          time = getRandomFloatInRange(initialDelay, endOfDelay )
        } 
        debugText.push(`Name: ${nameValue}, and Delayed: ${time}`)
        await delay(time * 1000)


      }

      const answerArray = [...invalidOptions]

      const replacedIndex = getRandomIntInRange(0,4)
      const replaced = answerArray[replacedIndex]  

      const validReplacmentIndex = getRandomIntInRange(0, validOptions.length)
      const validReplacement = validOptions[validReplacmentIndex]

      debugText.push(`Replacement Operation: \n   Replaced value ${replaced} at index ${replacedIndex} \n   with...\n   ${validReplacement} from index: ${validReplacmentIndex}`)

      answerArray[replacedIndex] = validReplacement


      for(let i = 0; i < answerArray.length; i++){
        answerButtons[i].textContent = answerArray[i]
      }


      await delay(2000)

      runningText.classList.remove("active")
      buttonsDiv.classList.add("active")

      const beepSound = document.getElementById('beep')
      beepSound.volume = (volume.value / 100) * 0.5
      beepSound.play()

      const pressedButton = await waitForButtonPress(allStopButtons)
      if(pressedButton.textContent === "Stop") throw new Error("Stop Pressed")


      pressedButton.classList.add("selected")

      await delay(2000)


      pressedButton.classList.remove("selected")
      
      if(pressedButton.textContent === validReplacement){
        rightAnswers.textContent = Number(rightAnswers.textContent) + 1
        correctSound.volume = (volume.value / 100) * 0.5
        correctSound.play()
        answerButtons[replacedIndex].classList.add("correct")
      } else{
        wrongAnswers.textContent = Number(wrongAnswers.textContent) + 1
        pressedButton.classList.add("wrong")
        answerButtons[replacedIndex].classList.add("correct")
        
      }
      
      await delay(3000)
      
      runningText.classList.add("active")
      buttonsDiv.classList.remove("active")

      answerButtons[replacedIndex].classList.remove("correct")
      pressedButton.classList.remove("wrong")


    }



  }catch(error){
    console.log("Catch: ", error)
    debugText.push(`Catch Error: ${error}`)
  }

  startScreen.classList.add("active")
  runningScreen.classList.remove("active")
  debugText.push(`Ended`)
  console.log("Ended")
}










