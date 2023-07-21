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
let undoHistory = [];
let redoHistory = [];

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
    }

    applyColor(newColor) {
        redoHistory = [];
        this.updateHistory(this.color, newColor);
        this.color = newColor;
        this.updateColor();
    }

    removeColor() {
        redoHistory = [];
        this.updateHistory(this.color, this.defaultColor);
        this.color = this.defaultColor;
        this.updateColor();
    }

    updateColor() {
        this.div.style.background = this.color;
    }

    updateHistory(prevColor, newColor) {
        if (prevColor === newColor) {
            return;
        }
        let historyEntry = {
            squareInstance: this,
            prevColor: prevColor,
            currentColor: newColor
        }
        undoHistory.push(historyEntry);
    }

      revertColor(prevColor) {
        this.color = prevColor;
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
const redoButton = document.getElementById('redo');

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
redoButton.addEventListener('click', redoLastColor);

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
    const MAX_GRID_SIZE = 64;
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
// . Undo / Redo functionality
// .

function undoLastColor() {
    if (undoHistory.length === 0) {
        console.log('no history!');
        return;
    }
    const recentSquare = undoHistory.pop();
    redoHistory.push(recentSquare);
    recentSquare.squareInstance.revertColor(recentSquare.prevColor);
}

function redoLastColor() {
    if (redoHistory.length === 0) {
        console.log('nothing to redo!');
        return;
    }
    const recentSquare = redoHistory.pop();
    undoHistory.push(recentSquare);
    recentSquare.squareInstance.revertColor(recentSquare.currentColor);
}

// .
// .
// . GRID FUNCTIONS
// .
// .

function createGrid(squaresPerSide) {
    removeOldGridFromDOM();
    clearUndoHistory();
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

function clearUndoHistory() {
    undoHistory = [];
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
// - is there a simple way to do basic terrain generation? automata?
//      - fuuucckkk if i know! but these might be two good places to start your investigation
// - the current ui sux! brainstorm
// - function that colors every block the same color
//      - the hack i figured out was adding a style background color to the entire grid-container div that's the parent of all the square divs
//      - are there any drawbacks to doing it this way? ... yes, history doesn't work
//      - loop over history and reset any squares that have their own color
// – event listeners code is over the place. 
// - BUG: double clicking effectively enables a pseudo-drag mode.
// - drag mode should move from being a mode button to a key you hold down. maybe space?


// NEXT STEPS:
// *** FIRST: merge current branch into main, delete old branch, push to github
// *** THEN:
// - increment / decrement color by 10%, without changing color picker value (faster to change look of terrain)
// is there a simple way to do this?
// i think to start, i continue with the bad ui and implement this as buttons, lighten mode + darken mode
// in setBackgroundColor, check for lighten mode. if on, call applyColor method and pass it lightenColor()
// lightenColor() calculates a color 10% lighter than current color and returns it
//      - how to implement: ...
// same for darkenColor()