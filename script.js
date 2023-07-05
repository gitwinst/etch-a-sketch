
const flexContainer = document.getElementById('flex-container');
const gridSection = document.getElementById('grid-section');
const gridSizeUI = document.getElementById('grid-size-ui');
const newGridButton = document.getElementById('new-grid-button');
const GRID_CONTAINER_SIZE = 704;

// let squaresPerSide = 16;
// let squareSize = GRID_CONTAINER_SIZE / squaresPerSide;

createGrid(16);

newGridButton.addEventListener('click', () => {
    createGrid(4);
});

function createGrid(squaresPerSize) {
    removeOldGridFromDOM();
    const gridContainer = createNewGridContainer();
    updateSquareSizeCSS(squaresPerSize);
    buildGrid(gridContainer, squaresPerSize);
    gridSection.appendChild(gridContainer);

    // functions!
    function removeOldGridFromDOM() {
        const oldGridContainer = document.getElementById('grid-container');
        gridSection.removeChild(oldGridContainer);
    }

    function createNewGridContainer() {
        const gridContainer = document.createElement('div');
        gridContainer.setAttribute('id', 'grid-container');
        return gridContainer;
    }

    // REMOVE THE OLD SHEET BEFORE ADDING A NEW ONE
    function updateSquareSizeCSS(squaresPerSize) {
        let squareSize = GRID_CONTAINER_SIZE / squaresPerSize;
        let sheet = document.createElement('style');
        sheet.setAttribute('id', 'square-styles');
        sheet.innerHTML = `.square {width: ${squareSize}px; height: ${squareSize}px;}`;
        document.body.appendChild(sheet);
    }

    function buildGrid(gridContainer, squaresPerSize) {
        const totalGridSquares = squaresPerSize * squaresPerSize;

        for (let i = 0; i < totalGridSquares; i++) {
            const div = document.createElement('div');
            div.classList.add('square');
            div.addEventListener('mouseover', () => {
                div.classList.add('hover-effect');
            });
            gridContainer.appendChild(div);
        }
    }
}

gridSizeUI.textContent = `Grid size: ${squaresPerSide} x ${squaresPerSide}`;



// on button click
// prompt user to enter number between 1 and 100 (number of squares per side)
// remove current grid
// create new grid
// remove current style, create new style