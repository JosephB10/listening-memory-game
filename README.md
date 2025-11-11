
![Vocal Memory Game](public/vocalMemory.png)

A small project made with vanilla Javascript, HTML, and CSS. There is a simple node express server to serve the files to localhost:3000. 

Run `npm start` in the main directory to start the server, then go to localhost:3000 in a browser to play. 

The gameplay loop involves a voice reading a few codes that consist of 3 numbers and 3 letters.  After which it presents four options and you have to select the code that you heard. 

There are three different difficulty options.

##### Fast Challenge 
- Speaks 3 codes to the user
- 3 second delay between each code read
##### Training
- Speaks 3 codes to the user
- Random delay in the range of 7 to 30 seconds between each code read
##### Hard
- Speaks 5 codes to the user
- Random delay in the range of 3 to 6 seconds between each code read


The goal with training was to have it going in the background while you do another task. Allowing you to work on multitasking. 
