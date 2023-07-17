'use strict';
var imagesArray = [];
function rgb(red, green, blue) {
    return (red & 0xF0 ? '#' : '#0') + (red << 16 | green << 8 | blue).toString(16);
}

function displayImages() {
    var output = document.querySelector("output");
    var images = "";
    imagesArray.forEach(function (image, index) {
        images += "<div class=\"image\">\n              <img id=\"runImgId\" src=\"".concat(URL.createObjectURL(image), "\" alt=\"image\">\n              <span onclick=\"deleteImage(").concat(index, ")\">&times;</span>\n            </div>");
    });
    output.innerHTML = images;
}
/*
Note for ref from https://developer.mozilla.org/en-US/docs/Web/API/ImageData
ImageData.data Read only
A Uint8ClampedArray representing a one-dimensional
array containing the data in the RGBA order, with
integer values between 0 and 255 (inclusive).
The order goes by rows from the top-left pixel to the bottom-right.

*/
function loadSample1() {
    const dim = 64
    const scale = dim * dim * 4
    var canvas = document.getElementById("canvasId");
    canvas.height = canvas.width = dim;
    var ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(dim, dim);
    // clear canvas
    for (let i = 0; i < scale; i++) {
        imageData.data[i] = 255;
    }
    // draw circle
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.stroke();
}

function loadSample2() {
    const dim = 64
    const scale = dim * dim * 4
    var canvas = document.getElementById("canvasId");
    canvas.height = canvas.width = dim;
    var ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(dim, dim);
    // clear canvas
    for (let i = 0; i < scale; i++) {
        imageData.data[i] = 255;
    }
    // draw circle
    ctx.beginPath();
    ctx.arc(32, 32, 12, 0, 2 * Math.PI);
    ctx.fillStyle = "green";
    ctx.fill();
    // ctx.stroke();
}

function loadSample3() {
    const dim = 64
    const scale = dim * dim * 4
    const canvas = document.getElementById("canvasId");
    const ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(dim, dim);

    for (let i = 0; i < imageData.data.length; i += 4) {
        // Percentage in the x direction, times 255
        let x = ((i % (dim * 4)) / (dim * 4)) * 255;
        // Percentage in the y direction, times 255
        let y = (Math.ceil(i / (dim * 4)) / dim) * 255;

        // Modify pixel data
        imageData.data[i + 0] = x; // R value
        imageData.data[i + 1] = y; // G value
        imageData.data[i + 2] = 255 - x; // B value
        imageData.data[i + 3] = 255; // A value
    }
    ctx.putImageData(imageData, 0, 0);
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function loadRandom() {
    const dim = 64
    const scale = dim * dim * 4
    var canvas = document.getElementById("canvasId");
    canvas.height = canvas.width = dim;
    var ctx = canvas.getContext("2d");
    const imageData = ctx.createImageData(dim, dim);
    for (let i = 0; i < scale; i = i + 4) {
        imageData.data[i] = getRandomInt(256)
        imageData.data[i + 1] = getRandomInt(256)
        imageData.data[i + 2] = getRandomInt(256)
        imageData.data[i + 3] = 255 // alpha        
    }
    ctx.putImageData(imageData, 0, 0);
}

function loadInputImg() {
    var img = document.getElementById("runImgId");
    var canvas = document.getElementById("canvasId");
    var newCanvas = document.getElementById("newCanvasId");
    var ctx = canvas.getContext("2d");
    newCanvas.width = canvas.width = img.naturalWidth;
    newCanvas.height = canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
}

function loadResultImg() {
    var canvas = document.getElementById("canvasId");
    var newCanvas = document.getElementById("newCanvasId");
    var ctx = canvas.getContext("2d");
    var newCtx = newCanvas.getContext("2d");
    let newImg = newCtx.getImageData(0,0, newCanvas.width, newCanvas.height)
    ctx.putImageData(newImg, 0, 0);
    // clear canvas
    for (let i = 0; i < newCanvas.width * newCanvas.height; i++) {
        newImg.data[i] = 255;
    }
}

function recurse(i){
    for(let r = 0; r <= i; r++){
        photoGoGo();
        loadResultImg()
    }
}

function animateGoGo(i){
    for(let r = 0; r <= i; r++){
        setTimeout(() => {
            photoGoGo();
        }, 500);
        loadResultImg()
    }
}

function deleteImage(index) {
    imagesArray.splice(index, 1);
    displayImages();
}

function photoGoGo() {
    // get original img
    var canvas = document.getElementById("canvasId");
    var ctx = canvas.getContext("2d");
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    // create new image
    var newCanvas = document.getElementById("newCanvasId");
    var newCtx = newCanvas.getContext("2d");
    const newImageData = newCtx.createImageData(canvas.width, canvas.height);

    const w = (canvas.width * 4) // this is the array index chunk w
    const h = canvas.height

    for (let p = 0; p < w*h; p += 4) {
        let pixel = data.slice(p, p + 3)
        // creating a vector from each pixel
        // direction comes from the leftmost op-bits
        //  1..2..3     p-w-1   p-w     p-w+1
        //  4..0..5     p-1     p       p+1
        //  6..7..8     p+w-1   p+w     p+w+1
        // console.log(p)
        // op and data are 2, left 0 buffered, bytes
        let opR = opFromDec(pixel[0])
        let dataR = dataFromDec(pixel[0])
        let opG = opFromDec(pixel[1])
        let dataG = dataFromDec(pixel[1])
        let opB = opFromDec(pixel[2])
        let dataB = dataFromDec(pixel[2])
        let d = '' + opR.charAt(0) + opG.charAt(0) + opB.charAt(0)
        let i = p
        // if (d == '000')  i=p // do nothing
        switch (d) {
            case '001':
                i = p - w - 1;
                break;
            case '010':
                i = p - w;
                break;
            case '011':
                i = p - w + 1;
                break;
            case '100':
                i = p - 1;
                break;
            case '101':
                i = p + 1;
                break;
            case '110':
                i = p + w - 1;
                break;
            case '111':
                i = p + w + 1;
                break;
        }
        // NEGATIVE ARRAY INDEX WRAP
        if (i < 0) {
            i = w * h + i
        }
        //
        // we have the new vector direction, now compute payload
        //
        let payloadR = dataR
        let operationR = '' + opR.charAt(2) + opR.charAt(3)
        
        let payloadG = dataG
        let operationG = '' + opG.charAt(2) + opG.charAt(3)
        
        let payloadB = dataB
        let operationB = '' + opB.charAt(2) + opB.charAt(3)
        // R
        // if(operation == '11') payload = data // do nothing
        switch (operationR) {
            case '11':
                // NOT
                let notPR = ''
                for (const b in payloadR) {
                    if (b == '0')
                        notPR += '1'
                    else {
                        notPR += '0'
                    }
                }
                break;
            case '01':
                // OR
                let orPR = ''
                if (opR.charAt(1) == '0') {
                    // OR RED WITH BLUE
                    for (let d = 0; d < 4; d++) {
                        if (payloadR.charAt(d) == '1' | payloadB.charAt(d) == '1')
                            orPR += '1'
                        else {
                            orPR += '0'
                        }
                    }
                } else {
                    // OR RED WITH GREEN
                    for (let d = 0; d < 4; d++) {
                        if (payloadR.charAt(d) == '1' | payloadG.charAt(d) == '1')
                            orPR += '1'
                        else {
                            orPR += '0'
                        }
                    }
                }
                payloadR = orPR
                break;
            case '10':
                // AND
                let andPr = ''
                if (opR.charAt(1) == '0') {
                    // AND RED WITH BLUE
                    for (let d = 0; d < 4; d++) {
                        if (payloadR.charAt(d) == '1' & payloadB.charAt(d) == '1')
                            andPr += '1'
                        else {
                            andPr += '0'
                        }
                    }
                } else {
                    // AND RED WITH GREEN
                    for (let d = 0; d < 4; d++) {
                        if (payloadR.charAt(d) == '1' & payloadG.charAt(d) == '1')
                            andPr += '1'
                        else {
                            andPr += '0'
                        }
                    }
                }
                payloadR = andPr
                break;
        }
        //G
        switch (operationG) {
            case '11':
                // NOT
                let notPR = ''
                for (const b in payloadG) {
                    if (b == '0')
                        notPR += '1'
                    else {
                        notPR += '0'
                    }
                }
                break;
            case '01':
                // OR
                let orPR = ''
                if (opG.charAt(1) == '0') {
                    // OR GREEN WITH RED
                    for (let d = 0; d < 4; d++) {
                        if (payloadG.charAt(d) == '1' | payloadR.charAt(d) == '1')
                            orPR += '1'
                        else {
                            orPR += '0'
                        }
                    }
                } else {
                    // OR GREEN WITH BLUE
                    for (let d = 0; d < 4; d++) {
                        if (payloadG.charAt(d) == '1' | payloadB.charAt(d) == '1')
                            orPR += '1'
                        else {
                            orPR += '0'
                        }
                    }
                }
                payloadG = orPR
                break;
            case '10':
                // AND
                let andPr = ''
                if (opG.charAt(1) == '0') {
                    // AND GREEN WITH RED
                    for (let d = 0; d < 4; d++) {
                        if (payloadG.charAt(d) == '1' & payloadR.charAt(d) == '1')
                            andPr += '1'
                        else {
                            andPr += '0'
                        }
                    }
                } else {
                    // AND GREEN WITH BLUE
                    for (let d = 0; d < 4; d++) {
                        if (payloadG.charAt(d) == '1' & payloadB.charAt(d) == '1')
                            andPr += '1'
                        else {
                            andPr += '0'
                        }
                    }
                }
                payloadG = andPr
                break;
        }
        //B
        switch (operationB) {
            case '11':
                // NOT
                let notPR = ''
                for (const b in payloadB) {
                    if (b == '0')
                        notPR += '1'
                    else {
                        notPR += '0'
                    }
                }
                break;
            case '01':
                // OR
                let orPR = ''
                if (opB.charAt(1) == '0') {
                    // OR BLUE WITH GREEN
                    for (let d = 0; d < 4; d++) {
                        if (payloadB.charAt(d) == '1' | payloadG.charAt(d) == '1')
                            orPR += '1'
                        else {
                            orPR += '0'
                        }
                    }
                } else {
                    // OR BLUE WITH RED
                    for (let d = 0; d < 4; d++) {
                        if (payloadB.charAt(d) == '1' | payloadR.charAt(d) == '1')
                            orPR += '1'
                        else {
                            orPR += '0'
                        }
                    }
                }
                payloadB = orPR
                break;
            case '10':
                // AND
                let andPr = ''
                if (opB.charAt(1) == '0') {
                    // AND BLUE WITH GREEN
                    for (let d = 0; d < 4; d++) {
                        if (payloadB.charAt(d) == '1' & payloadG.charAt(d) == '1')
                            andPr += '1'
                        else {
                            andPr += '0'
                        }
                    }
                } else {
                    // AND BLUE WITH RED
                    for (let d = 0; d < 4; d++) {
                        if (payloadB.charAt(d) == '1' & payloadR.charAt(d) == '1')
                            andPr += '1'
                        else {
                            andPr += '0'
                        }
                    }
                }
                payloadB = andPr
                break;
        }
        // assembling the payloads is as follows,
        // (r,g,b) = (pR.pG , pG.pB , pB.pR)
        let newR = payloadR.concat(payloadG)
        let newG = payloadG.concat(payloadB)
        let newB = payloadB.concat(payloadR)
        //
        // ASSIGN NEW PIXEL AT NEW INDEX
        //
        newImageData.data[i] += newR;
        newImageData.data[i+1] += newG;
        newImageData.data[i+2] += newB;
        newImageData.data[i+3] = 255; // alpha
    }
    newCtx.putImageData(newImageData,0,0)
}

function dec2bin(dec) {
    return (dec >>> 0).toString(2);
}

function opFromDec(dec) {
    let b = (dec >>> 0).toString(2).substring(0, 4);
    while (b.length < 4) b = '0' + b;
    return b
}

function dataFromDec(dec) {
    let b = (dec >>> 0).toString(2).substring(4, 8);
    while (b.length < 4) b = '0' + b;
    return b
}

function seek2d(row, column, imgWidth) {
    // top left to bottom right
    //  0-------c
    //  1-------c
    //  .........
    //  r-------c
    return imgWidth * row + column;
}

function addUnitImg(unit8Arr) {
    // const content = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 5, 0, 0, 0, 5, 8, 6, 0, 0, 0, 141, 111, 38, 229, 0, 0, 0, 28, 73, 68, 65, 84, 8, 215, 99, 248, 255, 255, 63, 195, 127, 6, 32, 5, 195, 32, 18, 132, 208, 49, 241, 130, 88, 205, 4, 0, 14, 245, 53, 203, 209, 142, 14, 31, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]);

    document.getElementById('newCanvasId').src = URL.createObjectURL(
        new Blob([unit8Arr.buffer], { type: 'image/png' } /* (1) */)
    );
}

window.onload = function (event) {
    var input = document.querySelector("input");
    if (input) {
        input.addEventListener("change", function () {
            var file = input.files;
            if (file) {
                imagesArray.push(file[0]);
            }
            displayImages();
        });
    }
};
