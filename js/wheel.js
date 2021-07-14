const container = document.querySelector('.wheel_container');

const wheel_canvas = document.getElementById('wheel');
const playBtn = document.getElementById('rotate');
const prize_list = document.getElementById('prize_list');
const prize_input = document.getElementById('prize_input');
const context = wheel_canvas.getContext('2d');


const canvas_size = (wheel_canvas.width + wheel_canvas.height) / 2;

const x = wheel_canvas.width/2,
      y = wheel_canvas.height/2

const radius = 360;

const prizes = [
    { id: 1, value: '1', color: '4643e6' },
    { id: 2, value: '2', color: 'ffa300' },
    { id: 3, value: '3', color: '4643e6' },
    { id: 4, value: '4', color: 'ffa300' },
    { id: 5, value: '5', color: '4643e6' },
    { id: 6, value: '6', color: 'ffa300' }
]

// used to get prize
const reversedPrizes = [...prizes, []].reverse();

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
    width: canvas_size/20,
    height: canvas_size/20
}

let rotate_deg = 0;

initWheel();

function getPrize(actualDeg) {
    let computedPrize = Math.ceil(actualDeg / prize);
    alert("PRIZE: " + reversedPrizes[computedPrize].value);
    // alert("Prize: " + reversedPrizes[computedPrize].value)
}

function calculatePrize(p) {
    const rng = Math.random() * prize-1;
    const computedAngle = (p * prize) - rng;
    const numOfRotation = radius * (Math.floor(10 + Math.random() * 25)); //min 10 rotations, max 25 rotations
    const stopValue = Math.ceil(computedAngle + numOfRotation);
    // console.log(computedAngle);
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
    console.log(rotate_deg, "rotate deg");
    console.log(actualDeg, "actual deg");
    getPrize(actualDeg);
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
        console.log(startAngle, endAngle);
        // width: 0;
        // height: 0;
        // border-style: solid;
        // border-width: 0 50px 200px 50px;
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
        const endAngle = (i+1)*angle;
        let text = p.value.split("/n");
        console.log(text);
        context.beginPath();
        context.fillStyle = `#${p.color}`;
        context.moveTo(x, y);
        context.arc(x, y, r, startAngle, endAngle);
        context.lineTo(x, y)
        context.fill();
        context.closePath();

        context.save();

        context.beginPath();
        context.textAlign = "center";
        context.textBaseline = "middle";
        // context.translate(x, y);
        context.translate(x + Math.cos(startAngle + angle / 1.8) * 180,
                    y + Math.sin(startAngle + angle / 2) * 180);
        context.rotate(startAngle + angle / 2 + Math.PI / 2);
        context.fillStyle = "#fff";
        context.font = "bold 30px sans-serif";
        text.forEach(txt => {            
            context.fillText(p.value, -context.measureText(txt).width / 2, 10);
        })
        context.closePath();
        context.restore();
        // // LABELS
        // let theta = (startAngle + endAngle) / 2;
        // let dY = Math.sin(theta) * 0.8 * r;
        // let dX = Math.cos(theta) * 0.8 * r;

        // drawText(p.value, dY, dX);
    })
    // wheel_canvas.style.transform = `rotate(${1.8 * Math.PI * radius/numberOfPrizes}deg)`;
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

// function displayPrizes() {
//     reversedPrizes.forEach((p, i) => {
//         if(p.hasOwnProperty('id')) {
//             const li = document.createElement('li');
//             li.innerHTML = i + " - " + p.value;
//             prize_list.appendChild(li);
//         }
//     })
// }





