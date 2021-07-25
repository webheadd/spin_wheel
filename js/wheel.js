const container = document.querySelector('.wheel_container');
const wheel_canvas = document.getElementById('wheel');
const playBtn = document.getElementById('rotate');
const prize_list = document.getElementById('prize_list');
const prize_input = document.getElementById('prize_input');
const context = wheel_canvas.getContext('2d');
const lose_modal = document.querySelector('.lose_modal');
const win_modal = document.querySelector('.win_modal');
const modal_btn = document.querySelector('.lose_modal .button');
const prize_modal = win_modal.querySelector('.prize');



// wheel_canvas.style.width = wheel_canvas.clientWidth/2 + 'px';

const canvas_size = (wheel_canvas.clientWidth + wheel_canvas.clientHeight) / 2; 

const scale = 2;

wheel_canvas.width = canvas_size * scale;
wheel_canvas.height = canvas_size * scale;

wheel_canvas.style.width = canvas_size;
wheel_canvas.style.height = canvas_size;

context.scale(scale, scale);

const animationLength = 10;

const x = wheel_canvas.clientWidth/2,
      y = wheel_canvas.clientHeight/2;


const radius = 360;



const prizes = [
    { id: 1, value: '<span>$50/nE-Voucher', isWin: true, img: "../assets/images/e-Voucher 50.png", color: '4643e6' },
    { id: 2, value: 'Better Luck/nNext Time1', isWin: false, img: "../assets/images/e-Voucher 50.png", color: 'ffa300' },
    { id: 3, value: 'Mystery/nGift', isWin: true, img: "../assets/images/Mystery Gift.png", color: '4643e6' },
    { id: 4, value: 'Better Luck/nNext Time2', isWin: false, img: "../assets/images/Mystery Gift.png", color: 'ffa300' },
    { id: 5, value: '<span>$10/nE-Voucher', isWin: true, img: "../assets/images/e-Voucher 10.png", color: '4643e6' },
    { id: 6, value: 'Better Luck/nNext Time3', isWin: false, img: "../assets/images/e-Voucher 10.png", color: 'ffa300' }
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

let audioInterval;

const tickSound = new Audio('../assets/tick.mp3');

playBtn.addEventListener('click', () => {
    let input = 6//Math.floor(Math.random() * numberOfPrizes);
    playBtn.style.pointerEvents = 'none';
    rotate_deg = calculateRotation(input);
    let counter = 0;
    audioInterval = function() {
        
        if(counter <= (rotate_deg/animationLength)*.7) {
            counter += ((rotate_deg/animationLength)*.20)*.10;
            playSoundEffect();
            setTimeout(audioInterval, counter);
        }
        
    }
    setTimeout(audioInterval, counter);
    wheel_canvas.style.transition = `all ${animationLength}s ease-out`;
    wheel_canvas.style.transform = `rotate(${rotate_deg}deg)`;
})

wheel_canvas.addEventListener('transitionend', () => {
    clearInterval(audioInterval);
    playBtn.style.pointerEvents = 'auto';
    wheel_canvas.style.transition = 'none';
    const actualDeg = ((rotate_deg) % 360);
    getPrize(actualDeg + 90); // +90 to make results at 0 deg
    wheel_canvas.style.transform = `rotate(${actualDeg}deg)`;
})

modal_btn.addEventListener('click', () => {
    lose_modal.classList.remove('showModal');
})

win_modal.addEventListener('click', () => {
    prize_modal.innerHTML = '';
    win_modal.classList.remove('showModal');
})

function initWheel() {
    drawSegments(prize_depth);
    drawLightBulbs();
}

function getPrize(actualDeg) {
    let computedPrize = Math.ceil(actualDeg / prize);
    let prize_received;
    if(computedPrize > numberOfPrizes) computedPrize = computedPrize - numberOfPrizes;
    prize_received = reversedPrizes[computedPrize]
    openResultModal(prize_received);
}

function openResultModal(p) {
    console.log(p);
    if(!p.isWin) {
        setTimeout(() => {
            lose_modal.classList.add('showModal');
        }, 100)
    } else {
        setTimeout(() => {
            
            let img = document.createElement('img');
            let span = document.createElement('span');
            img.src = p.img;
            span.innerHTML = p.value.replace('/n', ' ');
            prize_modal.appendChild(img);
            prize_modal.appendChild(span);
            win_modal.classList.add('showModal');
        }, 100)
    }
}

function calculateRotation(p) {
    const rng = Math.random() * prize-1;
    const computedAngle = (p * prize) - rng - 90;
    const numOfRotation = radius * 20; //20 rotations 
    const stopValue = Math.ceil(computedAngle + numOfRotation);
    return stopValue;
}

function drawLightBulbs() {
    const borderSize = (container.offsetWidth - container.clientWidth) / 2; //get outer border size
    const containerWidth = container.clientWidth + borderSize;
    
    let angle = radius - 90; //first angle
    let dangle = radius / numberOfBulb;

    for( let i = 0; i < numberOfBulb; i++ ){
        let blb = document.createElement('div');
        blb.classList = 'bulb';
        blb.style.width = `${borderSize/1.1}px`;
        blb.style.height = `${borderSize/1.1}px`;
        blb.style.margin = `-${(borderSize)/2}px`;
        blb.style.zIndex = 10;
        angle += dangle;
        blb.style.transform = `rotate(${angle}deg) translate(${containerWidth / 2}px) rotate(-${angle}deg)`;
        container.appendChild(blb);
    }
}

function drawSegments(r) {
    prizes.forEach((p, i)=> {
        const startAngle = i*angle;
        const endAngle = (i+1)*angle;

        context.beginPath();
        context.fillStyle = `#${p.color}`;
        context.moveTo(x, y);
        context.arc(x, y, r, startAngle, endAngle);
        context.lineTo(x, y)
        context.fill();
        context.closePath();
        // Draw Label texts
        drawText(p, startAngle, endAngle);

        // PENDING
        // if(!p.isWin) {
        //     drawIcons(p, startAngle, endAngle);
        // }
        
        
    })
    
    wheel_canvas.style.transform = `rotate(${1.8 * Math.PI * radius/numberOfPrizes}deg)`;
}

function drawText(p, startAngle, endAngle) {
    context.save();

    let text = p.value.split("/n");

    context.translate(x + Math.cos(startAngle + angle / 2) * (x/1.6), y + Math.sin(startAngle + angle / 2) * (y/1.6));
    context.rotate(startAngle + angle / 2 + Math.PI / 2);    

    context.beginPath();

    context.textAlign = "left";
    context.fillStyle = "#fff";
    text.forEach((txt, x) => { 
        let fontSize;

        if(txt.includes('<span>')) {

            txt = txt.split('<span>')[1];
            fontSize = getFont() * 3.2;

        } else {

            fontSize = getFont()*1.2;

        }

        context.font = `${fontSize}px Epson`;
        context.fillText(txt.toUpperCase(), -context.measureText(txt.toUpperCase()).width / 2, (fontSize*x));
    })

    context.restore();
}

function drawIcons(p, startAngle, endAngle) {
    console.log("DRAW");
    let img = new Image();
    img.src = p.img;
    img.width = canvas_size*0.2;
    img.height = canvas_size*0.2;
    let imageLeft = 0,
        imageTop = 0,
        imageAngle = 0;

    //check if image has loaded
    if(img.height || img.width) {
        // console.log(img.width, img.height);
        imageLeft = (x - (img.width));
        imageTop = (y - (img.height))/2;
        imageAngle = (startAngle + ((endAngle - startAngle)/2));
    }

    context.save();
    context.translate(x, y);

    console.log(x, y);
    console.log(imageLeft, imageTop);

    context.rotate(imageAngle);
    // console.log(imageLeft, imageTop, imageAngle);
    context.translate(-x, -y);

    context.drawImage(img, imageLeft, imageTop, 80, 80);

    context.restore();
}

function playSoundEffect() {
    let soundCopy = tickSound.cloneNode(true);
    soundCopy.play();
}

function getFont() {
    const fontBase = wheel_canvas.clientWidth,
    fontSize = wheel_canvas.clientWidth/20;
    const ratio = fontSize / fontBase;
    const size = canvas_size * ratio;
    return (size|0);
}

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

window.onload = () => {
    initWheel();
    if(getParameterByName('id')) alert("ID Parameter: " + getParameterByName('id'));
}