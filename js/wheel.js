const container = document.querySelector('.wheel_container');
const wheel_canvas = document.getElementById('wheel');
const playBtn = document.getElementById('rotate');
const prize_list = document.getElementById('prize_list');
const prize_input = document.getElementById('prize_input');
const context = wheel_canvas.getContext('2d');

wheel_canvas.style.width = wheel_canvas.clientWidth/2 + 'px';

const canvas_size = (wheel_canvas.width + wheel_canvas.height) / 2;

const x = wheel_canvas.width/2,
      y = wheel_canvas.height/2
      

const radius = 360;

const prizes = [
    { id: 1, value: '$50/nVoucher', color: '4643e6' },
    { id: 2, value: 'Better Luck-1/nNext Time', color: 'ffa300' },
    { id: 3, value: 'Mystery/nGift', color: '4643e6' },
    { id: 4, value: 'Better Luck-2/nNext Time', color: 'ffa300' },
    { id: 5, value: '$10/nVoucher', color: '4643e6' },
    { id: 6, value: 'Better Luck-3/nNext Time', color: 'ffa300' }
]

// used to get prize
const reversedPrizes = [...prizes, []].reverse();
console.log(reversedPrizes);
// total prizes count
let numberOfPrizes = prizes.length;

// 1 segment = 1 prize
let prize = radius/numberOfPrizes;

// set prize angle
let angle = 2 * Math.PI / numberOfPrizes;

// size of each segment
let prize_depth = canvas_size/2;

// BULB
let numberOfBulb = 8;
let bulb = {
    width: x/20,
    height: y/20
}

let rotate_deg = 0;



function getPrize(actualDeg) {
    console.log(actualDeg);
    let computedPrize = Math.ceil(actualDeg / prize);
    alert("PRIZE: " + reversedPrizes[computedPrize].value);
    // alert("Prize: " + reversedPrizes[computedPrize].value)
}

function calculatePrize(p) {
    const rng = Math.random() * prize-1;
    const computedAngle = (p * prize) - rng;
    const numOfRotation = radius * (Math.floor(15 + Math.random() * 35)); //min 10 rotations, max 25 rotations
    const stopValue = Math.ceil(computedAngle + numOfRotation);
    return stopValue;
}

playBtn.addEventListener('click', () => {
    let input = Math.floor(Math.random() * numberOfPrizes);
    // if(prize_input.value) {
    //     input = Number(prize_input.value);
    //     if(input > numberOfPrizes) return alert(`Please set prize between 1-${numberOfPrizes}`);
    //     if(input <= 0) return alert(`Please set prize between 1-${numberOfPrizes}`);
    // } else {
    //     return alert(`Please set prize between 1-${numberOfPrizes}`);
    // }
    playBtn.style.pointerEvents = 'none';
    rotate_deg = calculatePrize(input)//Math.floor(5000 + Math.random() * 5000);
    wheel_canvas.style.transition = 'all 5s ease-in-out'
    wheel_canvas.style.transform = `rotate(${rotate_deg}deg)`;
})

wheel_canvas.addEventListener('transitionend', () => {
    playBtn.style.pointerEvents = 'auto';
    wheel_canvas.style.transition = 'none';
    const actualDeg = ((rotate_deg) % 360);
    // console.log(actualDeg, Math.PI/2);
    getPrize(actualDeg+90);//remove 90 to right arrow
    wheel_canvas.style.transform = `rotate(${actualDeg}deg)`;
})


function initWheel() {
    drawSegments(prize_depth);
    // displayPrizes();
    drawLightBulbs();
    // drawWheel();
}

function drawLightBulbs() {
    const containerWidth = container.clientWidth + 25;

    let angle = radius - 90; //first angle
    let dangle = radius / numberOfBulb;

    for( let i = 0; i < numberOfBulb; ++i ){
        let blb = document.createElement('div');
        blb.classList = 'bulb';
        blb.style.width = `${bulb.width}px`;
        blb.style.height = `${bulb.height}px`;
        blb.style.margin = `-${bulb.width/2}px`;
        blb.style.zIndex = 10;
        angle += dangle;
        blb.style.transform = `rotate(${angle}deg) translate(${containerWidth / 2}px) rotate(-${angle}deg)`;
        container.appendChild(blb);
    }
}

function drawWheel() {
    console.log("TEST");
    prizes.forEach((p, i) => {
        const test_wheel = document.getElementById('test_wheel');
        const startAngle = i*angle;
        const endAngle = (i+1)*angle;
        const new_div = document.createElement('div');
        new_div.className = "triangle";
        new_div.style.width = 0;
        new_div.style.height = 0;
        new_div.style.borderStyle = 'solid';
        new_div.style.borderWidth = '200px 100px 0 100px';
        new_div.style.borderColor = `#${p.color} transparent transparent transparent`;
        new_div.style.transform = `rotate(${prize*i}deg)`;
        console.log(prize*i);
        test_wheel.appendChild(new_div);
    })
}

function drawSegments(r) {
    prizes.forEach((p, i)=> {
        const startAngle = i*angle;
        console.log(startAngle, "Start");
        const endAngle = (i+1)*angle;
        let text = p.value.split("/n");
        context.beginPath();
        context.fillStyle = `#${p.color}`;
        context.moveTo(x, y);
        context.arc(x, y, r, startAngle, endAngle);
        context.lineTo(x, y)
        context.fill();
        context.closePath();
        context.save();

        context.beginPath();
        context.textAlign = "left";
        context.translate(x + Math.cos(startAngle + angle / 2) * (x/1.5),
                    y + Math.sin(startAngle + angle / 2) * (y/1.5));
        context.rotate(startAngle + angle / 2 + Math.PI / 2);    
        context.fillStyle = "#fff";
        text.forEach((txt, x) => { 
            let fontSize;
            if(x === 0) {
                fontSize = getFont();
            } else {
                fontSize = getFont();
            }
            context.font = `bold ${fontSize}px Epson`;
            context.fillText(txt.toUpperCase(), -context.measureText(txt.toUpperCase()).width / 2, fontSize*x);
        })
        context.closePath();
        context.restore();
    })
    
    wheel_canvas.style.transform = `rotate(${1.8 * Math.PI * radius/numberOfPrizes}deg)`;
}



function getFont() {
    const fontBase = wheel_canvas.width,
    fontSize = wheel_canvas.width/15;
    const ratio = fontSize / fontBase;
    const size = canvas_size * ratio;
    return (size|0);
}


function drawText(text, dY, dX) {
    context.save();
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "20px Arial";
    context.fillStyle = "black";
    context.fillText(text, dX + x, dY + y);
    context.restore();
}



window.onload = () => {
    initWheel();
}