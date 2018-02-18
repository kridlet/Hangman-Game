// create a new player object
function player(name) {
    this.name = name;
    this.wins = 0;
    this.losses = 0;
    this.lettersGuessed = [];
    this.countWrong = 0;
    this.currentWord = [];
    this.maskedWord = [];

    this.addLetterGuessed = function (playerGuess) {
        if (this.lettersGuessed.indexOf(playerGuess) === -1) {
            this.lettersGuessed.push(playerGuess);
        }
    };

    this.newWord = function () {
        // fetch a new word
        this.currentWord = getNewWord();
        // ensur there are no non-letter characters in string
        if (this.currentWord.search(/[^a-z]+/i) === -1) {
            this.currentWord = this.currentWord.toLowerCase();
            this.currentWord = this.currentWord.split("");
        } else {
            this.newWord();
        }
        // reinitialize
        this.lettersGuessed = [];
        this.countWrong = 0;
        playerObj.maskedWord = Array(playerObj.currentWord.length).fill("_ ");
        // reset canvass and counts
        resetDisplay();
    }
};

function resetDisplay() {
    // wipe the canvass
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    ctx.clearRect(0, 0, 220, 300);
    // reset display variables
    document.getElementById("wrong-choices").innerHTML = playerObj.countWrong;
    document.getElementById("word").innerHTML = playerObj.maskedWord;
    document.getElementById("user-choice").innerHTML = playerObj.lettersGuessed;
    document.getElementById("wins").innerHTML = playerObj.wins;
    document.getElementById("losses").innerHTML = playerObj.losses;
}

// compare user input to array of chars and return locations if a match
function guessCheck(userGuess, wordArray) {
    var a = [];
    var i = -1;
    while ((i = wordArray.indexOf(userGuess, i + 1)) >= 0) {
        a.push(i);
    }
    return a;
}

function arrayCompare(array1, array2) {
    // if the other array is a falsy value, return
    if (!array2)
        return false;

    // compare length ths - can save a lot of time
    if (array1.length != array2.length)
        return false;

    for (var i = 0; i < array1.length; i++) {
        // Check if we have nested arrays
        if (array1[i] instanceof Array && array2[i] instanceof Array) {
            // recurse into the nested arrays
            if (!compare(array1[i], array2[i]))
                return false;
        } else if (array1[i] != array2[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
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

function getNewWord() {
    // api that returns random words of 6 characters or more
    var wordURL = "https://callo.io/word.php?";
    var parameters = new URLSearchParams();
    parameters.append('category', '');
    parameters.append('api_key', '3jf0JSWj4)4jdnak*3ndksj349dHQoen');
    parameters.append('results', '1');
    var Httpreq = new XMLHttpRequest();
    // do a synchronous request. this is depricated, but i don't want to deal with promises and fetch
    Httpreq.open("get", wordURL + parameters, false);
    Httpreq.send(null);
    var json_obj = JSON.parse(Httpreq.responseText);
    // for this use, only retun one word
    return json_obj.words[0];
}

var playerObj = new player("Dirk");
playerObj.newWord();

document.onkeypress = function (event) {
    var unicode = event.charCode ? event.charCode : event.keyCode
    // check if a letter
    if ((unicode > 64 && unicode < 91) || (unicode > 96 && unicode < 123)) {
        userGuess = event.key.toLowerCase();
        // check if the character has already been guessed
        if (playerObj.lettersGuessed.indexOf(userGuess) === -1) {
            playerObj.addLetterGuessed(userGuess);
            document.getElementById("user-choice").innerHTML = playerObj.lettersGuessed;
            // check if guessed letter exists in word
            var guessCharLocation = guessCheck(userGuess, playerObj.currentWord);
            if (guessCharLocation.length > 0) {
                // unmask letter to diplay
                guessCharLocation.forEach((charPosition, index) => {
                    playerObj.maskedWord[charPosition] = playerObj.currentWord[charPosition];
                    document.getElementById("word").innerHTML = playerObj.maskedWord;
                });
                var winCheck = arrayCompare(playerObj.currentWord, playerObj.maskedWord);
                if (winCheck) {
                    playerObj.wins++;
                    if (confirm(playerObj.currentWord + " play again?")) {
                        playerObj.newWord();
                    }
                }
            } else {
                //increment incorrect count
                playerObj.countWrong++;
                document.getElementById("wrong-choices").innerHTML = playerObj.countWrong;
                switch (playerObj.countWrong) {
                    case 1:
                        // draw gallows
                        drawLine(180, 280, 180, 20);
                        drawLine(180, 20, 80, 20);
                        drawLine(160, 280, 200, 280);
                        break;
                    case 2:
                        //draw head
                        drawCircle(80, 75, 25);
                        break;
                    case 3:
                        // draw body
                        drawLine(80, 100, 80, 200);
                        break;
                    case 4:
                        // draw right arm
                        drawLine(80, 110, 140, 130);
                        drawCircle(143, 132, 5, );
                        break;
                    case 5:
                        // draw left arm
                        drawLine(80, 110, 20, 130);
                        drawCircle(17, 132, 5);
                        break;
                    case 6:
                        // draw right leg
                        drawLine(80, 200, 110, 270);
                        drawCircle(113, 272, 5);
                        break;
                    case 7:
                        // draw left leg
                        drawLine(80, 200, 50, 270);
                        drawCircle(47, 272, 5);
                        break;
                    case 8:
                        // draw noose
                        drawLine(80, 20, 80, 50);
                        playerObj.losses++;
                        if (confirm(playerObj.currentWord + " play again?")) {
                            playerObj.newWord();
                        }
                        break;
                }
            }
        }
    }
}