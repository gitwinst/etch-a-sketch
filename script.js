
let rect = document.getElementById("grid-container");
let bcRect = rect.getBoundingClientRect();

let currentMousePos = { x: -1, y: -1 };

document.body.addEventListener("mousemove", function(e) {
    currentMousePos.x = e.pageX+160;
    currentMousePos.y = e.pageY+30;
    let val = "circle(100% at "+currentMousePos.x+"px "+currentMousePos.y+"px)"
    let grid = document.getElementById("background-grid");
    grid.style.clipPath = val;
});


// .
// .
// . HARD-CODED CONSTS
// .
// .
const GRID_CONTAINER_SIZE_PX = 672;
const DEFAULT_GRID_SIZE = 16;

// .
// .
// . SQUARE CLASS
// .
// .

class Square {
    constructor(div) {
        this.div = div;
        this.defaultColor = "#ffffff";
        this.color = this.defaultColor;
        this.border = "";
    }

    applyColor(newColor, bucketed = false) {
        redoHistory = [];
        this.updateHistory(this.color, newColor, bucketed);
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

    updateHistory(prevColor, newColor, bucketed) {
        if ( !bucketed && prevColor === newColor ) {
            return;
        }
        let historyEntry = {
            squareInstance: this,
            prevColor: prevColor,
            currentColor: newColor,
            bucketed: bucketed
        };
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

const flexContainer = document.getElementById("flex-container");
const gridSection = document.getElementById("grid-section");
const gridSizeUI = document.getElementById("grid-size-ui");
const newGridButton = document.getElementById("new-grid-button");
const rainbowButton = document.getElementById("rainbow-mode");
const clickModeButton = document.getElementById("click-mode");
const eraserButton = document.getElementById("toggle-eraser");
const gridButton = document.getElementById("toggle-grid");
const colorPickerInput = document.getElementById("color-picker");
const screenshotButton = document.getElementById("screenshot");
const paintBucketButton = document.getElementById("paint-bucket");
const undoButton = document.getElementById("undo");
const redoButton = document.getElementById("redo");
const lightenButton = document.getElementById("lighten");
const darkenButton = document.getElementById("darken");

// .
// .
// . APPLICATION STATE
// .
// .

let totalGridSquares = null;
let undoHistory = [];
let redoHistory = [];
let allSquares = [];
let mouseIsDown = false;
let clickMode = true;
let gridMode = { "active": true, "id": "Grid", "element": gridButton };
let colorPickerValue = document.getElementById("color-picker").value;
// if you want you can create an explicit by combining a check for clickMode and mouseDown...

// .
// . Exclusive modes
// .

let rainbowMode = { "active": false, "id": "Rainbow", "element": rainbowButton };
let eraserMode = { "active": false, "id": "Eraser", "element": eraserButton };
let lightenMode = { "active": false, "id": "Lightener", "element": lightenButton };
let darkenMode = { "active": false, "id": "Darkener", "element": darkenButton };

const exclusiveModes = [ rainbowMode, eraserMode, lightenMode, darkenMode ];

// .
// .
// . EVENT LISTENERS
// .
// .

newGridButton.addEventListener("click", promptForNewGridSize);
rainbowButton.addEventListener("click", toggleRainbowMode);
clickModeButton.addEventListener("click", toggleClickMode);
gridButton.addEventListener("click", toggleGridBorder);
eraserButton.addEventListener("click", toggleEraserMode);
paintBucketButton.addEventListener("click", applyPaintBucket);
screenshotButton.addEventListener("click", takeScreenshot);
undoButton.addEventListener("click", undoLastChange);
redoButton.addEventListener("click", redoLastChange);
lightenButton.addEventListener("click", toggleLightenMode);
darkenButton.addEventListener("click", toggleDarkenMode);
colorPickerInput.addEventListener("input", setColorPickerColor);

// .
// . Confirm user wants to reload the page
// .

window.addEventListener("beforeunload", function (e) {
    e.preventDefault();
    e.returnValue = "";
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
    deactivateAllModesExcept(null);
    createGrid(size);
}

function toggleClickMode() {
    clickMode = !clickMode;
    clickModeButton.textContent = clickMode ? "Mode: Click" : "Mode: Drag";
}

function setColorPickerColor() {
    deactivateAllModesExcept(null);
    colorPickerValue = document.getElementById("color-picker").value;
}

function toggleGridBorder() {
    const gridContainer = document.getElementById("grid-container");
    gridContainer.classList.toggle("grid-style");
    gridMode.active = !gridMode.active;
    updateModeUI(gridMode, gridButton);
}

function toggleRainbowMode() {
    rainbowMode.active = !rainbowMode.active;
    deactivateAllModesExcept(rainbowMode);
    updateModeUI(rainbowMode, rainbowButton);
}

function toggleEraserMode() {
    eraserMode.active = !eraserMode.active;
    deactivateAllModesExcept(eraserMode);
    updateModeUI(eraserMode, eraserButton);
}

function toggleLightenMode() {
    lightenMode.active = !lightenMode.active;
    deactivateAllModesExcept(lightenMode);
    updateModeUI(lightenMode, lightenButton);
}

function toggleDarkenMode() {
    darkenMode.active = !darkenMode.active;
    deactivateAllModesExcept(darkenMode);
    updateModeUI(darkenMode, darkenButton);
}

function deactivateAllModesExcept(activeMode) {
    for (const mode in exclusiveModes) {
        if (exclusiveModes[mode] === activeMode) {
            continue;
        }
        exclusiveModes[mode].active = false;
        updateModeUI(exclusiveModes[mode], exclusiveModes[mode].element);
    }
}

function updateModeUI(mode, element) {
    if (mode.active) {
        element.style.backgroundColor = "pink";
        element.textContent = `${mode.id}: On`;
    } else {
        element.style.backgroundColor = "";
        element.textContent = `${mode.id}: Off`;
    }
}

// .
// . Get new grid based on user
// .

function getUserGridSize() {
    const MIN_GRID_SIZE = 1;
    const MAX_GRID_SIZE = 64;
    const userNum = prompt(
        `Enter a number between ${MIN_GRID_SIZE} and ${MAX_GRID_SIZE}`,
        DEFAULT_GRID_SIZE
    );
    if (userNum === null) {
        return userNum;
    }
    return Math.max(Math.min(MAX_GRID_SIZE, userNum), MIN_GRID_SIZE);
}

// .
// . Screenshot functionality
// .

function takeScreenshot() {
    const gridContainer = document.getElementById("grid-container");
    html2canvas(gridContainer).then((canvas) => {
        saveAs(canvas.toDataURL(), "file-name.png");
    });
}

function saveAs(uri, filename) {
    const link = document.createElement("a");
    if (typeof link.download === "string") {
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

function undoLastChange() {
    if (undoHistory.length === 0) {
        console.log("no history!");
        return;
    }

    const paintBucketUsed = undoHistory[undoHistory.length - 1].bucketed;
    if (paintBucketUsed) {
        for (let i = 0; i < totalGridSquares; i++) {
            undoLastColor()
        }
    } else {
        undoLastColor()
    }
}

function redoLastChange() {
    if (redoHistory.length === 0) {
        console.log("nothing to redo!");
        return;
    }

    const paintBucketUsed = redoHistory[redoHistory.length - 1].bucketed;
    if (paintBucketUsed) {
        for (let i = 0; i < totalGridSquares; i++) {
            redoLastColor()
        }
    } else {
        redoLastColor()
    }
}

function undoLastColor() {
    const recentSquare = undoHistory.pop();
    redoHistory.push(recentSquare);
    recentSquare.squareInstance.revertColor(recentSquare.prevColor);
}

function redoLastColor() {
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
    const oldGridContainer = document.getElementById("grid-container");
    gridSection.removeChild(oldGridContainer);
}

function clearUndoHistory() {
    undoHistory = [];
}

function createNewGridContainer() {
    const gridContainer = document.createElement("div");
    gridContainer.setAttribute("id", "grid-container");
    gridContainer.setAttribute("class", "grid-style");
    gridContainer.addEventListener("mouseleave", () => {
        mouseIsDown = false;
    });
    return gridContainer;
}

function updateSquareSizeCSS(squaresPerSide) {
    let squareSize = GRID_CONTAINER_SIZE_PX / squaresPerSide;
    let sheet = document.getElementById("square-styles");
    sheet.innerHTML = `.square {width: ${squareSize}px; height: ${squareSize}px;}`;
    document.body.appendChild(sheet);
    let backgroundGrid = document.getElementById("background-grid");
    let topOffset = Math.ceil(bcRect.y / squareSize);
    let leftOffset = Math.ceil(bcRect.x / squareSize)
    backgroundGrid.style.backgroundSize = `${squareSize}px`;
    // backgroundGrid.style.top = `${ -1 * ((squareSize * topOffset)) }px`;
    backgroundGrid.style.top = `0px`;
    // backgroundGrid.style.left = `${ -1 * ((squareSize * leftOffset)) }px`;
    backgroundGrid.style.left = `0px`;
    console.log(squareSize);
}

function buildGrid(gridContainer, squaresPerSide) {
    totalGridSquares = squaresPerSide * squaresPerSide;

    for (let i = 0; i < totalGridSquares; i++) {
        const div = document.createElement("div");
        div.classList.add("square");
        const square = new Square(div);
        div.addEventListener("mouseover", () => handleMouseOver(square));
        div.addEventListener("mousedown", () => handleMouseDown(square));
        div.addEventListener("mouseup", handleMouseUp);
        gridContainer.appendChild(div);
        allSquares.push(square);
    }
}

function handleMouseOver(square) {
    setColor(square);
}

function handleMouseDown(square) {
    mouseIsDown = true;
    setColor(square);
}

function handleMouseUp() {
    mouseIsDown = false;
}

// .
// .
// . COLORING FUNCTIONS
// .
// .

function setColor(square) {
    if (!clickMode || (clickMode && mouseIsDown)) {
        if (rainbowMode.active) {
            square.applyColor(randomColor());
        } else if (lightenMode.active || darkenMode.active) {
            square.applyColor(shadeColor(square));
        } else if (eraserMode.active) {
            square.removeColor();
        } else {
            square.applyColor(colorPickerValue);
        }
    }
}

function randomColor() {
    return RGBToHex(randomNum(), randomNum(), randomNum());

    function randomNum() {
        const MAX_RGB_VALUE = 256;
        return Math.floor(Math.random() * MAX_RGB_VALUE);
    }
}

function shadeColor(square) {
    let newLightnessValue;
    const color = square.color;
    const hslColorArray = hexToHSL(color);
    if (lightenMode.active) {
        newLightnessValue = Math.min(
            hslColorArray[2] + hslColorArray[2] * 0.1,
            100
        );
    } else {
        newLightnessValue = Math.max(
            hslColorArray[2] - hslColorArray[2] * 0.1,
            0
        );
    }
    const finalHex = HSLToHex(
        hslColorArray[0],
        hslColorArray[1],
        newLightnessValue
    );
    return finalHex;
}

function applyPaintBucket() {
    const color = document.getElementById("color-picker").value;
    for (const square of allSquares) {
        square.applyColor(color, true);
    }
}

// .
// . Color conversion
// .

function RGBToHex(r, g, b) {
    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);

    if (r.length == 1) r = "0" + r;
    if (g.length == 1) g = "0" + g;
    if (b.length == 1) b = "0" + b;

    return "#" + r + g + b;
}

function hexToHSL(H) {
    // Convert hex to RGB first
    let r = 0,
        g = 0,
        b = 0;
    if (H.length == 4) {
        r = "0x" + H[1] + H[1];
        g = "0x" + H[2] + H[2];
        b = "0x" + H[3] + H[3];
    } else if (H.length == 7) {
        r = "0x" + H[1] + H[2];
        g = "0x" + H[3] + H[4];
        b = "0x" + H[5] + H[6];
    }
    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta == 0) h = 0;
    else if (cmax == r) h = ((g - b) / delta) % 6;
    else if (cmax == g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0) h += 360;

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return [h, s, l];
}

function HSLToHex(h, s, l) {
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
        m = l - c / 2,
        r = 0,
        g = 0,
        b = 0;

    if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else if (300 <= h && h < 360) {
        r = c;
        g = 0;
        b = x;
    }
    // Having obtained RGB, convert channels to hex
    r = Math.round((r + m) * 255).toString(16);
    g = Math.round((g + m) * 255).toString(16);
    b = Math.round((b + m) * 255).toString(16);

    // Prepend 0s, if necessary
    if (r.length == 1) r = "0" + r;
    if (g.length == 1) g = "0" + g;
    if (b.length == 1) b = "0" + b;

    return "#" + r + g + b;
}

// .
// .
// . RUN PROGRAM
// .
// .

createGrid(DEFAULT_GRID_SIZE);
