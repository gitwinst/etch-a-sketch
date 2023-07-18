// .
// .
// . HARD-CODED CONSTS
// .
// .
const GRID_CONTAINER_SIZE_PX = 704;
const DEFAULT_GRID_SIZE = 16;

// .
// .
// . APPLICATION STATE
// .
// .

let mouseIsDown = false;
let clickModeOn = true;
let rainbowModeOn = false;
let eraserModeOn = false;
let gridOn = true;
let squareChangeHistory = [];

// .
// .
// . SQUARE CLASS
// .
// .

class Square {
    constructor(div) {
        this.div = div;
        this.defaultColor = '';
        this.color = this.defaultColor;
        this.border = '';
        this.colorHistory = [''];
    }

    applyColor(color) {
        this.color = color;
        this.updateHistory(this.color);
        this.updateColor();
    }

    removeColor() {
        this.color = this.defaultColor;
        this.updateHistory(this.color);
        this.updateColor();
    }

    updateColor() {
        this.div.style.background = this.color;
    }

    updateHistory(color) {
        // if the previous color is the same as the current color, don't update
        if (color === this.colorHistory[this.colorHistory.length - 1]) {
            return;
        }
        squareChangeHistory.push(this);
        this.colorHistory.push(color);
    }

      // this is what our undo function will use
      revertColor() {
        this.colorHistory.pop();
        this.color = this.colorHistory[this.colorHistory.length - 1];
        this.updateColor();
    }
}

// .
// .
// . DOM ELEMENTS
// .
// .

const flexContainer = document.getElementById('flex-container');
const gridSection = document.getElementById('grid-section');
const gridSizeUI = document.getElementById('grid-size-ui');
const newGridButton = document.getElementById('new-grid-button');
const rainbowModeButton = document.getElementById('rainbow-mode');
const clickModeButton = document.getElementById('click-mode');
const toggleEraserButton = document.getElementById('toggle-eraser');
const toggleGridButton = document.getElementById('toggle-grid');
const colorPickerInput = document.getElementById('color-picker');
const screenshotButton = document.getElementById('screenshot');
const underpaintButton = document.getElementById('underpaint');
const undoButton = document.getElementById('undo');

// .
// .
// . EVENT LISTENERS
// .
// .

newGridButton.addEventListener('click', promptForNewGridSize);
rainbowModeButton.addEventListener('click', toggleRainbowMode);
clickModeButton.addEventListener('click', toggleClickMode);
toggleGridButton.addEventListener('click', toggleGridBorder);
toggleEraserButton.addEventListener('click', toggleEraserMode);
underpaintButton.addEventListener('click', applyUnderpaint);
screenshotButton.addEventListener('click', takeScreenshot);
undoButton.addEventListener('click', undoLastColor);

// .
// . Confirm user wants to reload the page
// .

window.addEventListener('beforeunload', function (e) {
    e.preventDefault();
    e.returnValue = '';
});

// .
// .
// . EVENT LISTENER CALLBACK FUNCTIONS
// .
// .

// .
// . Mode toggles
// .

function promptForNewGridSize() {
    const size = getUserGridSize();
    if (size === null) {
        return;
    }
    createGrid(size);
}

function toggleRainbowMode() {
    rainbowModeOn = toggleMode(rainbowModeOn);
    updateModeUI(rainbowModeButton, rainbowModeOn, 'Rainbow Mode');
}

function toggleClickMode() {
    clickModeOn = toggleMode(clickModeOn);
    clickModeButton.textContent = clickModeOn ? 'Mode: Click' : 'Mode: Drag';
}

function toggleEraserMode() {
    eraserModeOn = toggleMode(eraserModeOn);
    updateModeUI(toggleEraserButton, eraserModeOn, 'Eraser');
}

function toggleGridBorder() {
    const gridContainer = document.getElementById('grid-container');
    gridContainer.classList.toggle('grid-style');
    gridOn = toggleMode(gridOn);
    updateModeUI(toggleGridButton, gridOn, 'Grid');
}

function toggleMode(mode) {
    return !mode;
}

function updateModeUI(element, mode, text) {
    element.textContent = mode ? `${text}: On` : `${text}: Off`;
}

// .
// . Get new grid based on user
// .

function getUserGridSize() {
    const MIN_GRID_SIZE = 1;
    const MAX_GRID_SIZE = 100;
    const userNum = prompt(`Enter a number between ${MIN_GRID_SIZE} and ${MAX_GRID_SIZE}`, DEFAULT_GRID_SIZE);
    if (userNum === null) {
        return userNum;
    }
    return Math.max(Math.min(MAX_GRID_SIZE, userNum), MIN_GRID_SIZE);
}

// .
// . Screenshot functionality
// .

function takeScreenshot() {
    const gridContainer = document.getElementById('grid-container');
    html2canvas(gridContainer).then( (canvas) => {
        saveAs(canvas.toDataURL(), 'file-name.png');
    });
}

function saveAs(uri, filename) {
    const link = document.createElement('a');
    if (typeof link.download === 'string') {
        link.href = uri;
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// .
// . Undo functionality
// .

function undoLastColor() {
    if (squareChangeHistory.length === 0) {
        return;
    }
    const square = squareChangeHistory.pop();
    square.revertColor();
}

// .
// .
// . GRID FUNCTIONS
// .
// .

function createGrid(squaresPerSide) {
    removeOldGridFromDOM();
    clearSquareChangeHistory();
    const newGridContainer = createNewGridContainer();
    updateSquareSizeCSS(squaresPerSide);
    buildGrid(newGridContainer, squaresPerSide);
    gridSection.appendChild(newGridContainer);
    gridSizeUI.textContent = `Grid size: ${squaresPerSide} x ${squaresPerSide}`;
}

function removeOldGridFromDOM() {
    const oldGridContainer = document.getElementById('grid-container');
    gridSection.removeChild(oldGridContainer);
}

function clearSquareChangeHistory() {
    squareChangeHistory = [];
}

function createNewGridContainer() {
    const gridContainer = document.createElement('div');
    gridContainer.setAttribute('id', 'grid-container');
    gridContainer.setAttribute('class', 'grid-style');
    gridContainer.addEventListener('mouseleave', () => {
        mouseIsDown = false;
    });
    return gridContainer;
}

function updateSquareSizeCSS(squaresPerSide) {
    let squareSize = GRID_CONTAINER_SIZE_PX / squaresPerSide;
    let sheet = document.getElementById('square-styles');
    sheet.innerHTML = `.square {width: ${squareSize}px; height: ${squareSize}px;}`;
    document.body.appendChild(sheet);
}

function buildGrid(gridContainer, squaresPerSide) {
    const totalGridSquares = squaresPerSide * squaresPerSide;
    
    for (let i = 0; i < totalGridSquares; i++) {
        const div = document.createElement('div');
        div.classList.add('square');
        const square = new Square(div);
        div.addEventListener('mouseover', () => handleMouseOver(square));
        div.addEventListener('mousedown', () => handleMouseDown(square));
        div.addEventListener('mouseup', handleMouseUp);
        gridContainer.appendChild(div);
    }
}

function handleMouseOver(square) {
    setBackgroundColor(square);
}

function handleMouseDown(square) {
    mouseIsDown = true;
    setBackgroundColor(square);
}

function handleMouseUp() {
    mouseIsDown = false;
}

// .
// .
// . COLORING FUNCTIONS
// .
// .

function setBackgroundColor(square) {

    if (!clickModeOn || (clickModeOn && mouseIsDown)) {
        if (rainbowModeOn) {
            square.applyColor(randomColor());
        } else if (eraserModeOn) {
            square.removeColor();
        } else {
            square.applyColor(document.getElementById('color-picker').value);
        }
    }
}

function randomColor() {
    return `rgb(${randomNum()}, ${randomNum()}, ${randomNum()})`;

    function randomNum() {
        const MAX_RGB_VALUE = 256;
        return Math.floor(Math.random() * MAX_RGB_VALUE);
    }
}

// the way you should do this: the whole grid should be an instance of the square class, that way you could use applyColor method and be done with it
// also: not a fan of the ux as implemented. also: right now undo function isn't going to undo this style, fyi! will fix later
function applyUnderpaint() {
    const gridContainer = document.getElementById('grid-container');
    const currColor = document.getElementById('color-picker').value;
    gridContainer.style.background = currColor;
}



// .
// .
// . RUN PROGRAM
// .
// .

createGrid(DEFAULT_GRID_SIZE);


// TODO:
// - refactor
// - increment / decrement color by 10%, without changing color picker value (faster to change look of terrain)
// - is there a simple way to do basic terrain generation? automata?
//      - fuuucckkk if i know! but these might be two good places to start your investigation
// - the current ui sux! brainstorm: how could it be improved?
// - function that colors every block the same color
//  - the hack i figured out was adding a style background color to the entire grid-container div that's the parent of all the square divs
//  - are there any drawbacks to doing it this way? ... no! in fact i think it's the smartest way of going about it
//  - loop over history and reset any squares that have their own color


// CURRENT TODO:

// - undo button
//        - every time i press undo, go to list of recent changes, find most recent change, and undo it
//              - every change is 1 square going from 1 color to another
//              - so for every change we make, we want to note original color -> new color
//              - when we undo, we look at the list of changes, find most recent change, and update that square to original color
//              - that means we also need to be tracking which square was changed
//              - a multi-dimensional array? an array, where each item is an array with: [ [square index, ogColor, newColor], [...], ... ]

// history tracking - where does this live? each change adds to array...

// should the history of each change live within each square instance? and then i have a separate overall state history that 
// that tracks what square was most recently changed?
// on each change, the square index that was changed is pushed to the state history array. so that array is a list of every single change. if the same square changes, it's pushed again to the same array.
// in addition to that, each instance has a history object that holds the change made at that historical moment.
// it holds original color and updated color
// or maybe it's a multidimensional array? each entry is it's own array: [ [STATE_HISTORY_ARRAY_INDEX, [OGCOLOR, NEWCOLOR]] ]
// so with this structure, how would the undo function work?

// undo would first check the last (most recent) change in the overall application state history array.
// ===> hmmm that SHOULD return the class instance of the most recently changed square (does this mean every instance should be added to an array so i can access them?)
// ===> it should also pop that array item off so when called again, undo will operate on the next array item
//          - doing the above means no redo... which i'm fine with for now

// now that we have the class instance that was most recently changed, we need to go in and find out what the change was so we can revert it
// inside our instance, we have a square history array
// this is a multi-dimensional array. each item is an array that holds the old color and the new color.
// soooo... do we need to save the new color? because i don't think we're using it anywhere...
//      - so is it just a regular array, that holds the color it was previously before it changed?
// we grab the most recent change, grab the old color, and pass that to the square's applyColor method.
// then we pop that most recent change off so the next one up is the one before.

// we need some error handling too —— what if the application state history array is empty?
// this is how the undo function would work —— but we also need to build the application state history array and the individual square history arrays!!

// here's our order of operations of stuff to build in pseudo-pseudo-code:

// APP STATE AND SQUARE HISTORY DATA STRUCTURES
// DONE - 1. add every square instance to a lookup array
// 2. when a square's color is updated, push that square's lookup array index to the application state history array
// 3. add an array to the square class that will hold the square's individual history array
// 4. the array should be initalized with the standard starting color
// 5. when a square's color is updated, push that new color to that square's individual history array

// UNDO FUNCTIONALITY
// 6. when the undo button is clicked
// 7. get the last item from the application state history, which is the square's index number
//  - if length of application state history is 0, return
// 8. now that you have your square, get the n-1 item from it's history, which is the square's previous color
//  - because the nth item is the current color, n-1 is it's previous color, n-2 is two colors ago, etc.
//  - not sure i need to error check this... as long as i'm error checking the application state history
// 9. update the color by using the square's revertColor() method
// 10. and that might be it? :)

// what if instead, we focus on the square's individual history
// and application state history is set when the inidivudal history is being set
// so we have the reference to the square we're currently working on.
// and we just store that ref in the application history
// and forgo the square instance lookup array.
// so when undo is clicked, we look at the app state history array, find the last item in it, which is a ref to the square instance,
// and we pass that square instance to a function called revert...



// UPDATED TODOS


// STEP 1: APP STATE + SQUARE HISTORY
// DONE – 1.  create application change history array
// DONE – 2.  when a square's color is updated, push that square instance to change history array
// DONE – 3.  add an array to the square class that will hold the square's individual history array
// DONE – 4.  the array should be initalized with the standard starting color
// DONE – 5.  when a square's color is updated, push that new color to that square's individual history array


// STEP 2: UNDO FUNCTIONALITY
// DONE – 6.  create undo button
// DONE – 7.  add event listener to undo button, triggers undo function on click
// DONE – 8.  undo function first checks if the length of change history array is 0, if so returns
// DONE – 9.  undo function then pops the last item off the change history array, which is the most recently updated square
// DONE – 10. then calls the square's revertColor() method
// 11. the revertColor() method pops the last item off the colorHistory array, which is the current color 
// 12. it then sets this.color to the last item in the colorHistory array, which is now the previous color
// 12. it then calls updateColor()
// 14. ... and THAT might be it?


