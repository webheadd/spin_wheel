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



class SpinWheel {
    
    constructor(wheel_canvas, context, prizes, container, panelID, playID) {
        this.panelID = panelID;
        this.playID = playID;

        this.container = container;
        this.wheel_canvas = wheel_canvas;
        this.context = context;
        this.prizes = prizes;
        this.reversedPrizes = [...this.prizes, []].reverse();

        this.canvas_size = (this.wheel_canvas.clientWidth + this.wheel_canvas.clientHeight) / 2;
        this.scale = 2;
        this.width = this.canvas_size * this.scale;
        this.height = this.canvas_size * this.scale;

        this.x = this.wheel_canvas.clientWidth/2;
        this.y = this.wheel_canvas.clientHeight/2;

        this.radius = 360;
        
        this.numberOfBulb = 8;
        this.bulbW = this.x/2;
        this.bulbH = this.y/2;

        this.segment_depth = this.canvas_size/2;
        this.numberOfPrizes = this.prizes.length;
        this.angle = 2 * Math.PI / this.numberOfPrizes;
        this.prize = this.radius/this.numberOfPrizes;

        this.rotate_deg = 0;
        this.animationLength = 5;

        // audio
        this.clickingBuffer = null;
        this.audio_ctx;
        this.audioInterval = null;

        this.counter = 0;
        
    }

    draw() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audio_ctx = this.audioContextCheck();
        console.log(this.audio_ctx.state);
        this.loadClickSound('assets/tick.mp3');

        this.wheel_canvas.width = this.width;
        this.wheel_canvas.height = this.height;

        this.wheel_canvas.style.width = this.canvas_size;
        this.wheel_canvas.style.height = this.canvas_size;
        this.context.scale(this.scale, this.scale);
        this.drawSegments();
        this.drawLightBulbs();
    }

    drawSegments() {
        this.prizes.forEach((p, i)=> {
            const startAngle = i*this.angle;
            const endAngle = (i+1)*this.angle;
            this.context.beginPath();

            if(i % 2 == 0) {
                // EVEN
                this.context.fillStyle = `${segmentColors[1]}`;
            } else {
                this.context.fillStyle = `${segmentColors[2]}`;
            }
            // context.fillStyle = `${segmentColors[i % prizes.length]}`;
            


            this.context.moveTo(this.x, this.y);
            this.context.arc(this.x, this.y, this.segment_depth, startAngle, endAngle);
            this.context.lineTo(this.x, this.y)
            this.context.fill();
            this.context.closePath();

            // Draw Label texts
            this.drawText(p, startAngle, endAngle);
        })
        
        this.wheel_canvas.style.transform = `rotate(${1.8 * Math.PI * this.radius/this.numberOfPrizes}deg)`;
    }

    drawText(p, startAngle, endAngle) {
        this.context.save();

        
        let fontSize = this.getFontSize()*1.2;

        if(this.numberOfPrizes <= 6) {
            let text = p.Title.includes(" ") ? p.Title.split(" ") : [p.Title];
            this.context.translate(this.x + Math.cos(startAngle + this.angle / 2) * (this.x/1.5), this.y + Math.sin(startAngle + this.angle / 2) * (this.y/1.5));
            this.context.rotate(startAngle + this.angle / 2 + Math.PI / 2);

            this.context.beginPath();

            this.context.textAlign = "left";
            this.context.fillStyle = "#fff";

            text.forEach((txt, x) => { 
                
                if(txt.includes('<span>')) {
                    txt = txt.split('<span>')[1];
                    fontSize = this.getFontSize() * 3.2;
                }

                this.context.font = `${fontSize}px Epson`;
                this.context.fillText(txt.toUpperCase(), -this.context.measureText(txt.toUpperCase()).width / 2, (fontSize*x));
                
            })
            
        } else {
            this.context.translate(this.x, this.y);
            this.context.rotate(startAngle + this.angle / 2);

            this.context.beginPath();

            this.context.textAlign = "center";
            this.context.fillStyle = "#fff";
            
            this.context.font = `${fontSize}px Epson`;
            this.context.fillText(p.Title.toUpperCase(), this.x/1.7, this.y*0.05);
        }
        this.context.restore();
    }

    getFontSize() {
        const fontBase = this.wheel_canvas.clientWidth,
        fontSize = this.wheel_canvas.clientWidth/20;
        const ratio = fontSize / fontBase;
        const size = this.canvas_size * ratio;
        return (size|0);
    }

    rotate(winningID) {
        console.log(this.audio_ctx.state);
        if(this.audio_ctx.state !== 'suspended') {
            let input = this.reversedPrizes.findIndex(p => p.id === winningID);
            this.rotate_deg = this.calculateRotation(input);

            this.audioInterval = () => {
                if(this.counter <= (this.rotate_deg/this.animationLength)*.35) {
                    this.counter += ((this.rotate_deg/this.animationLength)*.020);
                    this.playSound(this.clickingBuffer, 0, 0);
                    setTimeout(this.audioInterval, this.counter);
                } else {
                    this.counter = 0;
                }

                
            }
            setTimeout(this.audioInterval, this.counter);
            
            this.wheel_canvas.style.transition = `all ${this.animationLength}s ease-out`;
            this.wheel_canvas.style.transform = `rotate(${this.rotate_deg}deg)`;
        }
    }

    calculateRotation(p) {
        const rng = Math.random() * this.prize-1;
        const computedAngle = (p * this.prize) - rng - 90;
        const numOfRotation = this.radius * 20; //20 rotations 
        const stopValue = Math.ceil(computedAngle + numOfRotation);
        return stopValue;
    }

    getPrize(actualDeg) {
        let computedPrize = Math.ceil(actualDeg / this.prize);
        let prize_received;
        if(computedPrize > this.numberOfPrizes) computedPrize = computedPrize - this.numberOfPrizes;
        prize_received = this.reversedPrizes[computedPrize]
        this.openResultModal(prize_received);
    }

    transitionEnd() {
        clearInterval(this.audioInterval);

        
        this.wheel_canvas.style.transition = 'none';

        const actualDeg = ((this.rotate_deg) % this.radius);

        this.getPrize(actualDeg + 90); // +90 to make results at 0 deg

        this.wheel_canvas.style.transform = `rotate(${actualDeg}deg)`;
    }

    drawLightBulbs() {
        const borderSize = (this.container.offsetWidth - this.container.clientWidth) / 2; //get outer border size
        const containerWidth = this.container.clientWidth + borderSize;
        
        let angle = this.radius - 90; //first angle
        let dangle = this.radius / this.numberOfBulb;

        for( let i = 0; i < this.numberOfBulb; i++ ){
            let blb = document.createElement('div');
            blb.classList = 'bulb';
            blb.style.width = `${borderSize/1.1}px`;
            blb.style.height = `${borderSize/1.1}px`;
            blb.style.margin = `-${(borderSize)/2}px`;
            blb.style.zIndex = 10;
            angle += dangle;
            blb.style.transform = `rotate(${angle}deg) translate(${containerWidth / 2}px) rotate(-${angle}deg)`;
            this.container.appendChild(blb);
        }
    }

    async loadClickSound(url) {
        const response = await fetch(url);
        response.arrayBuffer().then(res => {
            this.audio_ctx.decodeAudioData(res, (buffer) => {
                if (!buffer) {
                    console.log('Error decoding file data: ' + url);
                    return;
                }
                // console.log(buffer, "QWEQWE");
                this.clickingBuffer = buffer;
                
            });
        })
        
    }

    audioContextCheck() {
        if (typeof AudioContext !== "undefined") {
            return new AudioContext();
        } else if (typeof webkitAudioContext !== "undefined") {
            return new webkitAudioContext();
        } else if (typeof mozAudioContext !== "undefined") {
            return new mozAudioContext();
        } else {
            throw new Error('AudioContext not supported');
        }
    }

    playSound(buffer, time, volume) {
        let source = this.audio_ctx.createBufferSource();
        let gainNode = this.audio_ctx.createGain();
        
        source.buffer = buffer;
        source.connect(this.audio_ctx.destination);
        source.connect(gainNode);

        

        gainNode.connect(this.audio_ctx.destination);
        gainNode.gain.value = volume;

        source.start(time); 
    }
    
    openResultModal(p) {
        setTimeout(() => {
            let img = document.createElement('img');
            let span = document.createElement('span');
            img.src = p.Image;
            span.innerHTML = p.Title;
            
            if(p.PanelType === 0) {
                lose_modal.appendChild(img);
                lose_modal.appendChild(span);
                lose_modal.classList.add('showModal');
                return;
            }

            win_modal.appendChild(img);
            win_modal.appendChild(span);
            win_modal.classList.add('showModal');

        }, 100)
    }

}
// END OF WHEEL CLASS
async function getData(url, access_token, request_token) {
    const headers = {
      'Content-Type': 'application/json',
      'x-access-token': access_token
    }
    let body = {
        "RequestToken": request_token
    }

    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: headers,
        body: JSON.stringify(body)
    })

    return response.json();
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
    const API_URL = 'https://epson-stw.prm-dev.com';
    const access_token = 'RD9F647C7CBE042B9BF44DC47A2F4C7E476';

    let content = document.querySelector('.main_wrapper');
    let loader = document.querySelector('.loading');
    let wheel;


    // Hide content 
    content.style.visibility = 'hidden';

    if(getParameterByName('token')) {
        const request_token = getParameterByName('token');
        getData(`${API_URL}/api/Game/SpinTheWheel`, access_token, request_token).then(res => {
            let panelID = null;
            let playID = null;
            let panels = null;

            if(res.ResponseCode !== 5000) return alert(res.Message);

            // SUCCESS RESPONSE

            panels = res['Data']['Panels'];
            panelID = res['Data']['PanelId'];
            playID = res['Data']['PlayId'];

            loader.style.display = 'none';
            content.style.visibility = 'visible';
            wheel = new SpinWheel(wheel_canvas, context, panels, container, panelID, playID);
            wheel.draw();

            // Events
            
            playBtn.addEventListener('click', () => {
                wheel.audio_ctx.resume();

                setTimeout(() => {
                    //pass prize ID
                    wheel.rotate(panelID);
                }, 50)
            });

            wheel_canvas.addEventListener('transitionend', () => {
                playBtn.style.pointerEvents = 'auto';
                wheel.transitionEnd();
            })

            modal_btn.addEventListener('click', () => {
                lose_modal.classList.remove('showModal');
            })

            win_modal.addEventListener('click', () => {
                prize_modal.innerHTML = '';
                win_modal.classList.remove('showModal');
            })

        }).catch(err => {
            console.log(err);
        })
    } else {
        console.log("Request Token Unavailable.");
    }
}