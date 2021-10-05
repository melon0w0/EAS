//#region variable declarations and app initializing
let color = "#A58888";  //current brush color. changes each time user inputs color
let gridSize = 16;  //changes each time user finishing adjusting gridSize

let maxHistoryStored = 10;
let history;  //array of canvas history (in 1D array form). 
let loc; //user's current "location" in the history array.

const inputBrushColor = document.querySelector(".inputBrushColor");
const inputBackgroundColor = document.querySelector(".inputBackgroundColor");

const buttonAddToPalette = document.querySelector("button[data-index = '1'");
const palette = document.querySelector(".palette");
const customColor = document.querySelector(".customColor");
const buttonResetPalette = document.querySelector("button[data-index = '2'");
customColor.parentElement.removeChild(customColor);

const inputGridsize = document.querySelector(".inputGridsize");
const displayGridsize = document.querySelectorAll(".displayGridsize");

const buttonShading = document.querySelector("button[data-index = '3']");
const buttonLighten = document.querySelector("button[data-index = '4']");
const buttonRainbow = document.querySelector("button[data-index = '5']");
const buttonToggleGrid = document.querySelector("button[data-index = '6']");
const buttonMirror = document.querySelector("button[data-index = '7']");
const regularButtons = [buttonToggleGrid, buttonMirror];
const mutuallyExclusiveButtons = [buttonShading, buttonLighten, buttonRainbow];

const canvas = document.querySelector(".canvas");
const buttonClear = document.querySelector(".clear");
const buttonUndo = document.querySelector("button[data-index = '8']");
const buttonRedo = document.querySelector("button[data-index = '9']");
const rainbowColors = ["#FF8B94", "#FFAAA5", "#FFD3B6", "#DCEDC1", "#A8E6CF", "#A8B6F1", "#E9AADF"]

canvas.addEventListener("contextmenu", e => e.preventDefault());
palette.addEventListener("contextmenu", e => e.preventDefault());

//initialize the app
resetGridsize(16);
resetPalette();
//#endregion

//#region color and palette settings
// colorInputElement.value  <= always in hex, and only accepts hex value;
// element.style.backgroundColor <= accepts hex but always converts into rgb. like WHY?????

// use element.innerHTML = "" to reset canvas/palette may not be the best practice
// see https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript

inputBrushColor.addEventListener("input", function(e) {
    color = e.target.value; //hex
})

inputBackgroundColor.addEventListener("input", function(e) {
    for (let unit of canvas.children) {
        unit.style.backgroundColor = e.target.value; //rgb
    }
})

palette.addEventListener("click", function(e){
    if(e.target.parentElement == palette && e.target.style.backgroundColor != "") {
        color = e.target.style.backgroundColor; //rgb
        //need to first convert color(in rgb) to hex
        inputBrushColor.value = rgbToHex(color);
    }
})

palette.addEventListener("contextmenu", function(e) {
    if (e.target.parentElement == palette) {
        e.target.style.backgroundColor = "";
    }
}); //right click color in the palette to delete (reset to nothing)

buttonAddToPalette.addEventListener("click", function(e) {
    for (let child of palette.children) {
        if (child.style.backgroundColor == "") {
            child.style.backgroundColor = color; //hex
            break;
        }
    }  
})

buttonResetPalette.addEventListener("click", resetPalette);
function resetPalette() {
    removeChildElements(palette);
    for (let x = 0; x<20; x++) {
        palette.appendChild(customColor.cloneNode());
    }
}
//#endregion

//#region gridsize setting
inputGridsize.addEventListener("input", function(e) {
    let gridsize = e.target.value;
    displayGridsize[0].textContent = gridsize;
    displayGridsize[1].textContent = gridsize;
})

inputGridsize.addEventListener("change", function(e) {
    resetGridsize(e.target.value);
    gridSize = e.target.value;
})

function resetGridsize(gridsize) {
    removeChildElements(canvas);
    // populate canvas with grid units
    for (let x = 0; x < gridsize**2; x++) {
        let unit = document.createElement("div");
        unit.classList.add("unit");
        if (buttonToggleGrid.value == "on") {
            unit.classList.add("gridOn");
        }
        unit.style.width = `${1/gridsize*100}%`;
        unit.style.height = `${1/gridsize*100}%`;
        unit.setAttribute("tabindex","0")
        unit.addEventListener("mouseenter", (e)=> {e.target.focus()})
        canvas.appendChild(unit);
    }
    history = [];
    history.push(archiveFromCanvas());
    loc = 0;
}
//#endregion

//#region toggleable buttons
// note: if you write 2 callback functions for an element's event listener of the same type
// e.g. element.addEventListener("click", function1)
//      element.addEventListener("click", function2)
// function 1 will be called before function 2 when the event is detected

function toggleNormalButton(e) { //this only changes the value and appearence of the button
    let button = e.target;
    if (button.value == "off") {
        button.value = "on";
        button.textContent = button.textContent.replace("off","on");
        
    } else { //button.value == "on"
        button.value = "off";
        button.textContent = button.textContent.replace("on","off");
    } 
}

for (let button of regularButtons) {
    button.addEventListener("click", toggleNormalButton);
} 
// we add the toggleButton function first to all the buttons' click event
// then we add that whatever unique functions fired after this function
// note that the buttons' value will be already reversed after toggleButton is called
buttonToggleGrid.addEventListener("click", function(e) {
    if (buttonToggleGrid.value == "on") {
        for (let unit of canvas.children) {
            unit.classList.add("gridOn");
        }
    } else {
        for (let unit of canvas.children) {
            unit.classList.remove("gridOn");
        }
    }
})

// for the mutually exclusive buttons, only 1 button can be on at a time. How to do this?
function toggleMutuallyExclusiveButton(e) {
    let button = e.target;

    if (button.value == "off") {
        for (let otherButton of mutuallyExclusiveButtons) {
            if (otherButton.value == "on") {
                otherButton.value = "off";
                otherButton.textContent = otherButton.textContent.replace("on", "off");
                break;
            } 
            }
        // after we toggled the other button to off, we shall toggle the button on
        button.value = "on"
        button.textContent = button.textContent.replace("off","on");
        
    } else { //button is on
        button.value = "off";
        button.textContent = button.textContent.replace("on","off");
    }
}

for (let button of mutuallyExclusiveButtons) {
    button.addEventListener("click", toggleMutuallyExclusiveButton);
}
//#endregion

//#region drawing related and exporting
canvas.addEventListener("mouseover",changeColor); 
canvas.addEventListener("mousedown",changeColor);
canvas.addEventListener("keydown",changeColor);
canvas.addEventListener("dblclick", floodFill); //dbclick currently doesn't work bc there's a mousedown event 


function changeColor(e) {
    if (e.target.parentElement != canvas) {return;}

    if (checkPaintingMode(e) == "painting"){ 

        switch (checkBrushMode()) {

            case "shading": {
                let targetColor = e.target.style.backgroundColor; //rgb
                if (targetColor == "white"||targetColor == "") {
                    targetColor = "rgb(255,255,255)";
                }
                //convert to hsl first, then darken
                let HSLarray = rgbtoHSL(targetColor);
                HSLarray[2] -= 5;  //lower lightness
                e.target.style.backgroundColor = HSLarrayToString(HSLarray);
            }
                break;

            case "lighten": {
                let targetColor = e.target.style.backgroundColor; //rgb
                if (targetColor == "white"||targetColor == "") {
                    targetColor = "rgb(255,255,255)";
                }
                //convert to hsl first, then lighten
                let HSLarray = rgbtoHSL(targetColor);
                HSLarray[2] += 5;  //lower lightness
                e.target.style.backgroundColor = HSLarrayToString(HSLarray); 
            }
                break;

            case "rainbow": {
                let randomColor = rainbowColors[getRandomInt(7)];
                e.target.style.backgroundColor = randomColor;
            }
                break;

            default:
                e.target.style.backgroundColor = color;
        }
    }
    else if (checkPaintingMode(e) == "erasing"){
        e.target.style.backgroundColor = "white";}
    
}

function checkPaintingMode(e) {
    if (e.altKey == true || e.buttons == 1) {
        return "painting";
    }
    if (e.ctrlKey == true || e.buttons == 2) {
        return "erasing";
    }
}

function checkBrushMode() { //shading, lightening or rainbow
    if (buttonShading.value == "on") {return "shading";}
    if (buttonLighten.value == "on") {return "lighten";}
    if (buttonRainbow.value == "on") {return "rainbow";}
}

buttonClear.addEventListener("click", () => {
    for (unit of canvas.children) {
        unit.style.backgroundColor = "white";
    }
    inputBackgroundColor.value = "#FFFFFF";
});
//#endregion

//#region Flood fill algorithm
function gen2dArrayFromCanvas() {
    //initialize an 2d array with empty rows. number of rows = grid size
    let arr = [];
    for (let a = 0; a < gridSize; a++) {
        arr.push([]);
    }
    //populate the array with the grid elements
    for (let a = 0; a<gridSize**2; a++) {
        let rowNumber = Math.floor(a/gridSize);  //the element belongs to this row
        arr[rowNumber].push(canvas.children[a]);
    }
    return arr;
}

function getCoordinatesOfTarget(e) {
    let index = Array.from(canvas.children).indexOf(e.target);
    let rowNumber = Math.floor(index/gridSize);
    let colNumber = index % gridSize;
    return [rowNumber,colNumber];  // a coord array
}

function findNeighbors(coord) {  //coord is a coord array [x,y] of the target
    let x = coord[0];
    let y = coord[1];
    return [[x,y-1],[x-1,y],[x+1,y],[x,y+1]]; 
    //this can return invalid(negative) coords, like [-1, 2] 
    //but we'll filter invalid coords out in fill()
}

let visited = []; //coordinates of changed grid unit

function fill(array, x, y, oldColor, newColor) {
    // pass color to newColor;
    // pass e.target.style.backgroundColor to oldColor 
    
    if ( x<0 || x>= array.length) {return;}
    if ( y<0 || y>= array[0].length) {return;}
    if (array[x][y].style.backgroundColor != oldColor) {return;}

    array[x][y].style.backgroundColor = newColor;
    visited.push([x,y]);
    let moves = findNeighbors([x,y]);

    for (let move of moves) {
        if (!visited.includes(move)) {
            fill(array, move[0], move[1], oldColor, newColor);
        }
    }
}

function floodFill(e) {
    let canvas2dArray = gen2dArrayFromCanvas();
    let coord = getCoordinatesOfTarget(e);  // [x,y]
    let currentColor = e.target.style.backgroundColor;
    fill(canvas2dArray, coord[0], coord[1], currentColor, color);
    visited = [];
}
//#endregion

//#region undo/redo
function archiveFromCanvas() {
    arr = [];
    for (let unit of canvas.children) {
        arr.push(unit.cloneNode());
    }
    return arr;
}

function recordMove() {
    if (loc+1 != history.length) { //if user's are at a previous location
        history = history.slice(0, loc+1)
    }

    if (history.length != maxHistoryStored) {
        loc++;
    } else {//history is full, reset it!  
        //<= this is not a great idea, need to instead drop the first archive from history
        histroy = [];
        loc = 0;
    }
    history.push(archiveFromCanvas());
}

function undo() {
    if (loc == 0) {return;}
    loc--;
    previousState = history[loc];
    removeChildElements(canvas);
    for (let unit of previousState) {
        canvas.appendChild(unit.cloneNode());
    }
    //although we recover it from an archived state/array
    //the event listeners aren't archived! need to add them back
    for (let unit of canvas.children) {
        unit.addEventListener("mouseenter", (e)=> {e.target.focus()})
    }
}

function redo() {
    if (loc+1 ==  history.length) {return;}
    loc++;
    nextState = history[loc];
    removeChildElements(canvas);
    for (let unit of nextState) {
        canvas.appendChild(unit.cloneNode());
    }
    //same as before, add the event listeners back
    for (let unit of canvas.children) {
        unit.addEventListener("mouseenter", (e)=> {e.target.focus()})
    }
}

canvas.addEventListener("mouseup", recordMove);
canvas.addEventListener("keyup", recordMove);
buttonClear.addEventListener("click", recordMove);
buttonUndo.addEventListener("click", undo);
buttonRedo.addEventListener("click", redo);
//#endregion

//#region color format conversion functions
function rgbToHex(rgbString) {
    let rgbArray = rgbString.match(/\d+/g);
    let r = Number(rgbArray[0]);
    let g = Number(rgbArray[1]);
    let b = Number(rgbArray[2]);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    //credit https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
  }

function rgbtoHSL(rgbString) {
    let rgbArray = rgbString.match(/\d+/g);
    let r = Number(rgbArray[0]);
    let g = Number(rgbArray[1]);
    let b = Number(rgbArray[2]);
    r /= 255, g /= 255, b /= 255;

    let cmin = Math.min(r,g,b),
    cmax = Math.max(r,g,b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;

    if (delta == 0)
        h = 0;
    else if (cmax == r)
        h = ((g - b) / delta) % 6;
    else if (cmax == g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;
        h = Math.round(h * 60);
    if (h < 0)
        h += 360;

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return [h,s,l];
    return "hsl(" + h + "," + s + "%," + l + "%)";
  //credit https://css-tricks.com/converting-color-spaces-in-javascript/
}

function HSLarrayToString(arr) {
    return `hsl(${arr[0]}, ${arr[1]}%, ${arr[2]}%)`
}
//#endregion

//#region miscellaneous functions
function removeChildElements(parentElement) {
    while (parentElement.firstChild) {
        parentElement.removeChild(parentElement.lastChild);
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
//#endregion

