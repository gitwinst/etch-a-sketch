const GRID_CONTAINER_SIZE_PX = 704;
const DEFAULT_GRID_SIZE = 16;

const flexContainer = document.getElementById('flex-container');
const gridSection = document.getElementById('grid-section');
const gridSizeUI = document.getElementById('grid-size-ui');
const newGridButton = document.getElementById('new-grid-button');
const colorModeButton = document.getElementById('color-mode');
const clickModeButton = document.getElementById('click-mode');
const toggleGridButton = document.getElementById('toggle-grid')

let mouseIsDown = false;
let clickModeOn = true;
let colorModeOn = false;

createGrid(DEFAULT_GRID_SIZE);


// EVENT LISTENERS
colorModeButton.addEventListener('click', toggleColorMode);
clickModeButton.addEventListener('click', toggleClickMode);
newGridButton.addEventListener('click', promptForNewGridSize);
toggleGridButton.addEventListener('click', toggleGridDisplay)

// EVENT LISTENER CALLBACK FUNCTIONS
function toggleColorMode() {
    colorModeOn = !colorModeOn;
    colorModeButton.textContent = colorModeOn ? 'Color Mode: On' : 'Color Mode: Off';
}

function toggleClickMode() {
    clickModeOn = !clickModeOn;
    clickModeButton.textContent = clickModeOn ? 'Mode: Click' : 'Mode: Drag';
}

function promptForNewGridSize() {
    const MIN_GRID_SIZE = 1;
    const MAX_GRID_SIZE = 100;

    const userNum = prompt(`enter a number btw ${MIN_GRID_SIZE} and ${MAX_GRID_SIZE}`, DEFAULT_GRID_SIZE);
    createGrid(Math.max(Math.min(MAX_GRID_SIZE, userNum), MIN_GRID_SIZE));
}

function toggleGridDisplay() {
    console.log('test');
}
// // // // // // 


function randomColor() {
    return `rgb(${randomNum()}, ${randomNum()}, ${randomNum()})`;

    function randomNum() {
        const MAX_RGB_VALUE = 256;
        return Math.floor(Math.random()*MAX_RGB_VALUE);
    }
}

function createGrid(squaresPerSide) {
    removeOldGridFromDOM();
    const gridContainer = createNewGridContainer();
    updateSquareSizeCSS(squaresPerSide);
    buildGrid(gridContainer, squaresPerSide);
    gridSection.appendChild(gridContainer);
    gridSizeUI.textContent = `Grid size: ${squaresPerSide} x ${squaresPerSide}`;

    function removeOldGridFromDOM() {
        const oldGridContainer = document.getElementById('grid-container');
        gridSection.removeChild(oldGridContainer);
    }

    function createNewGridContainer() {
        const gridContainer = document.createElement('div');
        gridContainer.setAttribute('id', 'grid-container');
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
            div.addEventListener('mouseover', () => handleMouseOver(div));
            div.addEventListener('mousedown', () => handleMouseDown(div));
            div.addEventListener('mouseup', handleMouseUp);
            gridContainer.appendChild(div);
        }

        function setBackgroundColor(div) {
            if (!clickModeOn || (clickModeOn && mouseIsDown)) {
                if (colorModeOn) {
                    div.style.background = randomColor();
                } else {
                    div.style.background = '';
                    div.classList.add('hover-effect');
                }
            }
        }

        function handleMouseOver(div) {
            setBackgroundColor(div);
        }

        function handleMouseDown(div) {
            mouseIsDown = true;
            setBackgroundColor(div);
        }

        function handleMouseUp() {
            mouseIsDown = false;
        }
    }
}
