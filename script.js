let color = "#A58888";

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

canvas.addEventListener("contextmenu", e => e.preventDefault());
palette.addEventListener("contextmenu", e => e.preventDefault());

//initialize the app
resetGridsize(16);
resetPalette();
//////////////////////

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

inputGridsize.addEventListener("input", function(e) {
    let gridsize = e.target.value;
    displayGridsize[0].textContent = gridsize;
    displayGridsize[1].textContent = gridsize;
})

inputGridsize.addEventListener("change", function(e) {
    resetGridsize(e.target.value);
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
}

// buttons toggling section
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
                alert("Only 1 button can be on at a time for this section!");
                return;} //if other but is already on, don't do anything
            }
        // loop finishes if all buttons are off, then we shall toggle the button on
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

//canvas section
canvas.addEventListener("mouseover",changeColor); 
canvas.addEventListener("mousedown",changeColor);
canvas.addEventListener("keydown",changeColor);

function changeColor(e) {
    if (e.target.parentElement != canvas) {return;}

    if (checkPaintingMode(e) == "painting"){ 
        switch (checkBrushMode()) {
            case "shading":
                let targetColor = e.target.style.backgroundColor; //rgb
                //convert to hsl first, then darken => raise s, lower l
                let HSLarray = rgbtoHSL(targetColor);
                HSLarray[1] += 2;  //raise saturation
                HSLarray[2] -= 5;  //lower lightness
                e.target.style.backgroundColor = HSLarrayToString(HSLarray);          
            case "lighten":
                break
            case "rainbow":
                break
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

function removeChildElements(parentElement) {
    while (parentElement.firstChild) {
        parentElement.removeChild(parentElement.lastChild);
    }
}

// e.buttons
//1 left click
//2 right click
//3 both click

// e.altKey, e.ctrlKey


