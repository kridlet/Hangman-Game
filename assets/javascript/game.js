// create a new player object
function player() {
    this.wins = 0;
    this.losses = 0;
    this.lettersGuessed = [];
    this.currentWord = [];
    this.maskedWord = [];
    this.userSelection = '';
    this.guessesRemaining = 7;
    this.userStarted = 0;

    this.begin = function() {
        this.userStarted = 1;
        document.getElementById("overlay").style.display = "none";
        document.getElementById("modal").style.display = "none";
        // draw gallows
        drawLine(180, 280, 180, 20);
        drawLine(180, 20, 80, 20);
        drawLine(160, 280, 200, 280);
    }

    this.wordFinish = function(winLose) {
        this.userStarted = 0;
        document.getElementById("overlay").style.display = "inline";
        document.getElementById("modal").style.display = "inline";
        wordHTML = "";
        this.currentWord.forEach((letter,index) => {
            wordHTML = wordHTML + letter;
        });
        if (winLose === "win") {
            document.getElementById("modal").innerHTML = "Congratulations! Your word was " + wordHTML + ".\n\nPress any key to play again.";
        }
        else if (winLose === "lose") {
            document.getElementById("modal").innerHTML = "Sorry! The word was " + wordHTML + ".\n\nPress any key to play again.";
        }
        this.reset();
    }

    this.getNewWord = function(category) {
        // api that returns random popular english words of 6 characters or more
        var wordURL = "https://callo.io/word.php?";
        var parameters = new URLSearchParams();
        parameters.append('category', category);
        parameters.append('api_key', '3jf0JSWj4)4jdnak*3ndksj349dHQoen');
        parameters.append('results', '1');
        var Httpreq = new XMLHttpRequest();
        // do a synchronous request. this is depricated, but i don't want to deal with promises and fetch
        Httpreq.open("get", wordURL + parameters, false);
        Httpreq.send(null);
        var json_obj = JSON.parse(Httpreq.responseText);
        // for this use, only retun one word
        this.currentWord = json_obj.words[0];
//        this.currentWord = "wpwpwpwpwpwpwpwz"
    }

    this.reset = function() {
        // fetch a new word
        this.getNewWord();
        // ensur there are no non-letter characters in string
        if (this.currentWord.search(/[^a-z]+/i) === -1) {
            this.currentWord = this.currentWord.toUpperCase();
            this.currentWord = this.currentWord.split("");
        } else {
            this.reset();
        }
        // reinitialize
        this.lettersGuessed = [];
        this.guessesRemaining = 7;
        this.maskedWord = Array(this.currentWord.length).fill("_");
        // reset canvass and counts
        resetDisplay();
    }

    this.inputCheck = function(userInput) {
        // get unicode
        var unicode = userInput.charCode ? userInput.charCode : userInput.keyCode
        // check if a letter
        if ((unicode > 64 && unicode < 91) || (unicode > 96 && unicode < 123)) {
            this.userSelection = userInput.key.toUpperCase();
            // check if the character has already been guessed and add to lettersGuessed if not
            if (this.lettersGuessed.indexOf(this.userSelection) === -1) {
                this.lettersGuessed.push(this.userSelection);
                document.getElementById(this.userSelection).style.textDecoration = "red line-through";
                // check if guessed letter exists in word
                var guessCharLocation = this.guessCheck(this.userSelection);
                if (guessCharLocation.length > 0) {
                    // unmask letter to diplay
                    guessCharLocation.forEach((charPosition, index) => {
                        this.maskedWord[charPosition] = this.currentWord[charPosition];
                        displayMaskewdWord();
                    });
                    var winCheck = this.arrayCompare();
                    if (winCheck) {
                        this.wins++;
                        this.wordFinish("win");
                    }
                } else {
                    //decrement remaining guess count
                    this.guessesRemaining--;
                    document.getElementById("guesses-remaining").innerHTML = this.guessesRemaining;
                    switch (this.guessesRemaining) {
                        case 6:
                            //draw head
                            drawCircle(80, 75, 25);
                            break;
                        case 5:
                            // draw body
                            drawLine(80, 100, 80, 200);
                            break;
                        case 4:
                            // draw right arm
                            drawLine(80, 110, 140, 130);
                            drawCircle(143, 132, 5, );
                            break;
                        case 3:
                            // draw left arm
                            drawLine(80, 110, 20, 130);
                            drawCircle(17, 132, 5);
                            break;
                        case 2:
                            // draw right leg
                            drawLine(80, 200, 110, 270);
                            drawCircle(113, 272, 5);
                            break;
                        case 1:
                            // draw left leg
                            drawLine(80, 200, 50, 270);
                            drawCircle(47, 272, 5);
                            break;
                        case 0:
                            // draw noose
                            drawLine(80, 20, 80, 50);
                            this.losses++;
                            this.wordFinish("lose");
                            break;
                    }
                }
            }
            return true;
        } else {
            return false;
        }
    }

    // compare user input to array of chars and return locations if a match
    this.guessCheck = function(userGuess) {
        var a = [];
        var i = -1;
        while ((i = this.currentWord.indexOf(userGuess, i + 1)) >= 0) {
            a.push(i);
        }
        return a;
    }

    this.arrayCompare = function() {
        // if the other array is a falsy value, return
        if (!this.maskedWord)
            return false;
    
        // compare length ths - can save a lot of time
        if (this.currentWord.length != this.maskedWord.length)
            return false;
    
        for (var i = 0; i < this.currentWord.length; i++) {
            // Check if we have nested arrays
            if (this.currentWord[i] instanceof Array && this.maskedWord[i] instanceof Array) {
                // recurse into the nested arrays
                if (!compare(this.currentWord[i], this.maskedWord[i]))
                    return false;
            } else if (this.currentWord[i] != this.maskedWord[i]) {
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;
            }
        }
        return true;
    }
};

function resetDisplay() {
    // wipe the canvass
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    ctx.clearRect(0, 0, 220, 300);
    // reset display variables
    document.getElementById("guesses-remaining").innerHTML = playerObj.guessesRemaining;
    displayMaskewdWord();
    document.getElementById("wins").innerHTML = playerObj.wins;
    document.getElementById("losses").innerHTML = playerObj.losses;

    alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    alphabet.forEach((letter, index) => {
        var set = document.getElementById(letter);
        document.getElementById(letter).style.textDecoration = '';
    });
}

function drawLine(xStart, yStart, xEnd, yEnd) {
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(xStart, yStart);
    ctx.lineTo(xEnd, yEnd);
    ctx.stroke();
}

function drawCircle(xStart, yStart, radius) {
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    ctx.beginPath();
    ctx.arc(xStart, yStart, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();
}

function drawAlphabet() {
    alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    var targetDiv = document.getElementById("alphabet");
    alphabet.forEach((letter, index) => {
        var newDiv = document.createElement("span");
        newDiv.setAttribute("id", letter);
        newDiv.setAttribute("class", "letter")
        newDiv.innerHTML = letter;
        targetDiv.appendChild(newDiv);
    });
}

function displayMaskewdWord() {
    var wordHTML = '';
    playerObj.maskedWord.forEach((letter,index) => {
        wordHTML = wordHTML + letter;
    });
    document.getElementById("word").innerHTML = wordHTML;
}

var playerObj = new player();
drawAlphabet();
playerObj.reset();
document.onkeypress = function (event) {
    if (playerObj.userStarted === 0) {
        playerObj.begin();
    }
    else {
        playerObj.inputCheck(event);
    }
}