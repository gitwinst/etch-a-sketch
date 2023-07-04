
const gridContainer = document.getElementById('grid-container');
const gridSizeUI = document.getElementById('grid-size-ui');

// you're not using this atm... but you gotta save that prompt somewhere right
let gridSize = 16;

function createGrid(gridSize) {
    const totalGridSquares = gridSize * gridSize;
    for (let i = 0; i < totalGridSquares; i++) {
        const div = document.createElement('div');
        div.classList.add('square');
        div.addEventListener('mouseover', () => {
            div.classList.add('hover-effect');
        });
        // div.addEventListener('mouseout', () => {
        //     div.classList.remove('hover-effect');
        // })
        gridContainer.appendChild(div);
    }
}

gridSizeUI.textContent = `Grid size: ${gridSize} x ${gridSize}`;

createGrid(16);