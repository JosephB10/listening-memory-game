
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

startButton.addEventListener("click", gameLoop)
stopButton.addEventListener("click", () => {
  stopFlag = true
  window.speechSynthesis.cancel()
})


// ----------------------------------Difficulty Settings--------------------------------------

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





// ----------------------------------Playing Audio--------------------------------------



//Wait until voices are loaded
//Then pick the right one
let selectedVoice = null
window.speechSynthesis.onvoiceschanged = () => {
  const voices = window.speechSynthesis.getVoices()
  selectedVoice = voices.find(v => v.name === "Google UK English Male") 
}


//HTML audio elements only play once then audio calls get ignored
//This gets around that by cloning the node so each one plays separately
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




// ----------------------------------Small Helper Functions--------------------------------------




//Keeps the console from being plugged up with debug info
async function printDebugToConsole(){
  console.log(debugText.join("\n"))
  debugText = []
}


//Creates a delay that's broken up into 50ms values to stop more promptly when the stop button is selected
const delay = (ms) => new Promise(resolve => {
  const start = Date.now();
  const interval = setInterval(() => {
    if (stopFlag || Date.now() - start >= ms) {
      clearInterval(interval)
      resolve()
    }
  }, 50); 
});

//Returns a float between the min and max
function getRandomFloatInRange(min, max) {
  return Math.random() * (max - min) + min
}

function getRandomIntInRange(min,max){
  return Math.floor(Math.random() * (max-min) + min)
}






// ----------------------------------Game Logic--------------------------------------


//Returns a promise that resolves when one of the buttons has been selected
//Resolves with the target of the button press
//Play's an audible click
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



//Returns a string of "### abc"
//Uses the global invalidOptions set to make sure it doesn't return a copy
//Could possibly return multiple copies when it's reading options
function createRandomNames(){

  const numberOfLetters = 3
  const numberOfNumbers = 3

  //Loops Until it's created a version that isn't in the invalidOptions set
  while(true){

    let name = []
  
    //Not used but potentially useful in the future
    const ICAO_letters = ["Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel", "India", "Juliet", "Kilo", "Lima", "Mike", "November", "Oscar", "Papa", "Quebec", "Romeo", "Sierra", "Tango", "Uniform", "Victor", "Whiskey", "X-ray", "Yankee", "Zulu"]
    
    const numbers = ["0","1", "2", "3", "4", "5", "6", "7", "8", "9"]
    const letters = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]
  
  
    //Get the numbers
    for(let i = 0; i < numberOfNumbers; i++){
      const numberIndex = getRandomIntInRange(0,numbers.length)
      name.push(numbers[numberIndex])
    }
  
    //Separate the numbers and letters for readability
    name.push(" ")
  
    //Get the letters
    for(let i = 0; i < numberOfLetters; i++){
      const lettersIndex = getRandomIntInRange(0, letters.length)
      name.push(letters[lettersIndex])
    }
  

    const endingValue = name.join("")

    //Return the value if it isn't in invalidOptions
    if(!invalidOptions.has(endingValue)){
      debugText.push("create Random Names Returns value: ", endingValue)
      return endingValue
    }


    //Loop again
    debugText.push("Ran into a copy, rerunning: ", endingValue)
  }
}





// ----------------------------------Primary Gameplay Loop--------------------------------------



//Function is called when the user selects "Start"
async function gameLoop(){


  //Use CSS class to remove start screen div and replace it with the running screen div
  startScreen.classList.remove("active")
  runningScreen.classList.add("active")

  if(!runningText.classList.contains("active")){
    runningText.classList.add("active")
    buttonsDiv.classList.remove("active")
  }


  //Stop flag indicates when the loop should stop
  //It's activated when the user select's the stop button
  //Not perfect solution but good enough.

  //Counter stops the game after 10 loops
  stopFlag = false
  let counter = 0

  //Delay before the first iteration
  let time = initialDelay
  if(randomDelayTime === true){
    time = getRandomFloatInRange(initialDelay, endOfDelay )
  } 
  await delay(time * 1000)



  debugText.push(`Initial Delay time: ${time}`)


  
  //This is used to catch errors and exiting early when getting a stop flag
  try{

    //Every Loop plays the audio and gets the users answer
    while(stopFlag === false && counter < 10){
      counter++

      invalidOptions = new Set([])
      const validOptions = []
      
      //Creates 4 codes that will be used for the multiple choice (one will be replaced with the correct option from validOptions)
      for(let i = 0; i < 4; i++){
        invalidOptions.add(createRandomNames())
      }
      

      //** This was for a random number of Spoken Options **
      // const numberOfOptions = getRandomIntInRange(3, 7)
      // debugText.push(`Number of Options: ${numberOfOptions}`)
      

      //--------------------------------------------- Logic to Speak the Names ---------------------------------

      //Loops for each spoken code
      for(let i = 0; i < spokenOptions; i++){
        
        //Make sure the user hasn't selected stop
        if(stopFlag === true) throw new Error("stopFlag")

        //Get a code then push it to validOptions
        const nameValue = createRandomNames()
        validOptions.push(nameValue)


        //Play the Audio Clip 
        //Use comma and spaces to slow down the Computers pronunciation
        await playAudio(nameValue.split(" ").join(",").split("").join(" "))
    
        //Delay either a random amount or the initial amount
        if(randomDelayTime === true){
          time = getRandomFloatInRange(initialDelay, endOfDelay )
        } 
        debugText.push(`Name: ${nameValue}, and Delayed: ${time}`)
        await delay(time * 1000)
      }


      //--------------------------------------------- Insert a Correct Answer and Update the Buttons ---------------------------------

      //Turn the invalid Options Set into an AnswerArray
      //Use random values to select which correct value to insert where
      const answerArray = [...invalidOptions]

      const replacedIndex = getRandomIntInRange(0,4)
      const replaced = answerArray[replacedIndex]  

      const validReplacmentIndex = getRandomIntInRange(0, validOptions.length)
      const validReplacement = validOptions[validReplacmentIndex]

      debugText.push(`Replacement Operation: \n   Replaced value ${replaced} at index ${replacedIndex} \n   with...\n   ${validReplacement} from index: ${validReplacmentIndex}`)

      answerArray[replacedIndex] = validReplacement

      //Update the HTML BUttons
      for(let i = 0; i < answerArray.length; i++){
        answerButtons[i].textContent = answerArray[i]
      }




      //--------------------------------------------- Make the Options Visible and wait for Selection ---------------------------------


      //Exchange "Running..." text with the buttons
      runningText.classList.remove("active")
      buttonsDiv.classList.add("active")

      //Play the Attention Grabbing Beep
      const beepSound = document.getElementById('beep')
      beepSound.volume = (volume.value / 100) * 0.5
      beepSound.play()

      //Wait for the user's input
      const pressedButton = await waitForButtonPress(allStopButtons)
      if(pressedButton.textContent === "Stop") throw new Error("Stop Pressed")



      //--------------------------------------------- Handle Correct vs Wrong Answers ---------------------------------

      pressedButton.classList.add("selected")

      //Dramatic Pause Before Showing Answer
      await delay(2000)


      pressedButton.classList.remove("selected")
      

      //Increase/Decrease the Right/Wrong Score
      //Play the correct sound
      //Update the buttons to be Red or Green
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
      
      //Allow the user to see the correct answer
      await delay(3000)
      

      //Reset the CSS to switch back to the Running... text
      runningText.classList.add("active")
      buttonsDiv.classList.remove("active")

      answerButtons[replacedIndex].classList.remove("correct")
      pressedButton.classList.remove("wrong")

    }



  }catch(error){
    console.log("Catch: ", error)
    debugText.push(`Catch Error: ${error}`)
  }


  //When we exit the loop switch back to the start screen 

  startScreen.classList.add("active")
  runningScreen.classList.remove("active")
  debugText.push(`Ended`)
  console.log("Ended")
}










