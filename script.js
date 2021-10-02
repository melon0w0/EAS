// ctrl key || right click erase
// alt key || left click paint
// also provide toggle option
let color = "black";

const inputBrushColor = document.querySelector(".inputBrushColor");
const inputBackgroundColor = document.querySelector(".inputBackgroundColor");
const canvas = document.querySelector(".canvas");
const inputGridsize = document.querySelector(".inputGridsize");
const displayGridsize = document.querySelectorAll(".displayGridsize");
const buttonClear = document.querySelector(".clear");
const buttonAddToPalette = document.querySelector(".addToPalette");
const palette = document.querySelector(".palette");
const customColor = document.querySelector(".customColor");
customColor.parentElement.removeChild(customColor);
canvas.addEventListener("contextmenu", e => e.preventDefault());

//initialize the app
resetGridsize(32);
resetPalette();
//////////////////////

inputBrushColor.addEventListener("input", function(e) {
    color = e.target.value;
})

inputBackgroundColor.addEventListener("input", function(e) {
    for (let unit of canvas.children) {
        unit.style.backgroundColor = e.target.value;
    }
})

buttonAddToPalette.addEventListener("click", function(e) {
    for (let child of palette.children) {
        if (child.style.backgroundColor == "") {
            child.style.backgroundColor = color;
            break;
        }
    }  
})

inputGridsize.addEventListener("input", function(e) {
    let gridsize = e.target.value;
    displayGridsize[0].textContent = gridsize;
    displayGridsize[1].textContent = gridsize;
    resetGridsize(gridsize);
})

function resetGridsize(gridsize) {
    canvas.innerHTML = "";
    // populate canvas with grid units
    for (let x = 0; x < gridsize**2; x++) {
        let unit = document.createElement("div");
        unit.classList.add("unit");
        unit.style.width = `${1/gridsize*100}%`;
        unit.style.height = `${1/gridsize*100}%`;

        unit.addEventListener("mouseenter",changeColor);
        canvas.appendChild(unit);
    }
}

buttonClear.addEventListener("click", () => {
    for (unit of canvas.children) {
        unit.style.backgroundColor = "white";
    }
});

function changeColor(e) {
    if (checkPaintingMode(e) == "painting"){
        e.target.style.backgroundColor = color;}
    else if (checkPaintingMode(e) == "erasing"){
        e.target.style.backgroundColor = "white";}
}

function checkPaintingMode(e) {
    if (e.altKey == true || e.buttons == 1) {
        return "painting";
    }
    if (e.ctrlKey == true || e.buttons ==2) {
        return "erasing";
    }
}

function resetPalette() {
    for (let x = 0; x<20; x++) {
        palette.appendChild(customColor.cloneNode());
    }
}
// e.buttons
//1 left click
//2 right click
//3 both click

// e.altKey, e.ctrlKey
