const container = document.querySelector('.wheel_container');
const wheel_canvas = document.getElementById('wheel');
const playBtn = document.getElementById('rotate');
const context = wheel_canvas.getContext('2d');
const lose_modal = document.querySelector('.lose_modal');
const win_modal = document.querySelector('.win_modal');
const modal_btns = document.querySelectorAll('.modal .button');
const prize_modal = win_modal.querySelector('.prize');
const lose_modal_content = lose_modal.querySelector('.prize');
const lose_modal_title = lose_modal.querySelector('.title');


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

            // Draw Icons
            if(p.PanelType === 0) {
                this.drawIcons(p, startAngle);
            }
        })
        
        this.wheel_canvas.style.transform = `rotate(${1.8 * Math.PI * this.radius/this.numberOfPrizes}deg)`;
    }

    drawText(p, startAngle, endAngle) {
        this.context.save();

        
        let fontSize = this.getFontSize()*1.25;

        if(this.numberOfPrizes <= 8) {
            let text = p.Title.includes(" ") ? p.Title.split(" ") : [p.Title];
            if(p.PanelType === 0) {
                this.context.translate(this.x + Math.cos(startAngle + this.angle / 2) * (this.x/2), this.y + Math.sin(startAngle + this.angle / 2) * (this.y/2));
                fontSize = this.getFontSize();
            } else {
                this.context.translate(this.x + Math.cos(startAngle + this.angle / 2) * (this.x/1.5), this.y + Math.sin(startAngle + this.angle / 2) * (this.y/1.5));
            }
            this.context.rotate(startAngle + this.angle / 2 + Math.PI / 2);

            this.context.beginPath();

            this.context.textAlign = "left";
            this.context.fillStyle = "#fff";

            if(text.length > 2) {
                let start = 0;
                let end = 1;
                let new_arr = [];
                for(let i = 0; i < text.length; i+=2) {
                    new_arr.push(text[start] + ' ' + text[end])
                    end+=2;
                    start+=2;

                }

                text = new_arr;
            }

            text.forEach((txt, x) => { 
                if(txt.includes('<span>')) {
                    txt = txt.split('<span>')[1];
                    fontSize = this.getFontSize() * 3.5;
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

    drawIcons(p, startAngle) {
        // console.log(this.canvas_size);
        let img = new Image();
        const img_w = (this.canvas_size/6);
        const img_h = (this.canvas_size/6);
        img.src = p.Image;
        img.onerror = function() {
            img.src = '../assets/images/Sad Emoji.png';
            img.style.borderRadius = '50%';
        }

        img.onload = () => {
            let rotation = startAngle + this.angle / 2 + Math.PI / 2;
            this.context.save();

            this.context.translate(this.x, this.y);
            this.context.rotate(rotation);
            this.context.translate(-this.x, -this.y);

            this.roundedImage(img_w*2.5, 5, img_w-5, img_h-5, (img_w-5)/2);
            this.context.clip();
            
            this.context.drawImage(img, (img_w*2.5), 5, img_w-5, img_h-5);

            this.context.restore();
        }
        
    }

    roundedImage(x, y, width, height, radius) {
        this.context.beginPath();
        this.context.moveTo(x + radius, y);
        this.context.lineTo(x + width - radius, y);
        this.context.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.context.lineTo(x + width, y + height - radius);
        this.context.quadraticCurveTo(
          x + width,
          y + height,
          x + width - radius,
          y + height
        );
        this.context.lineTo(x + radius, y + height);
        this.context.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.context.lineTo(x, y + radius);
        this.context.quadraticCurveTo(x, y, x + radius, y);
        this.context.closePath();
      }

    getFontSize() {
        const fontBase = this.wheel_canvas.clientWidth,
        fontSize = this.wheel_canvas.clientWidth/20;
        const ratio = fontSize / fontBase;
        const size = this.canvas_size * ratio;
        return (size|0);
    }

    rotate(winningID) {
        
        if(this.audio_ctx.state !== 'suspended') {
            let input = this.reversedPrizes.findIndex(p => p.Id === winningID);
            this.rotate_deg = this.calculateRotation(input);

            this.audioInterval = () => {
                if(this.counter <= (this.rotate_deg/this.animationLength)*.35) {
                    this.counter += ((this.rotate_deg/this.animationLength)*.020);
                    this.playSound(this.clickingBuffer, 0, 0);
                    setTimeout(this.audioInterval, this.counter);
                } else {
                    this.counter = 0;
                    playBtn.disabled = false;
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
                if (!buffer) return;
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
            img.onerror = function() {
                img.src = 'https://via.placeholder.com/150';
                img.style.borderRadius = '50%';
            }
            img.alt = p.Title;
            span.innerHTML = p.Title;
            
            if(p.PanelType === 0) {
                lose_modal_content.appendChild(img);
                lose_modal_title.appendChild(span);

                lose_modal.classList.add('showModal');
                return;
            }

            prize_modal.appendChild(img);
            prize_modal.appendChild(span);
            win_modal.classList.add('showModal');

        }, 600)
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
        // mode: 'cors',
        headers: headers,
        body: JSON.stringify(body)
    })

    return response.json();
}

async function sendResult(url, access_token, request_token, panelID, playID) {
    const headers = {
      'Content-Type': 'application/json',
      'x-access-token': access_token
    }
    let body = {
        "RequestToken": request_token,
        "PanelId": panelID,
        "PlayId": playID
    }

    const response = await fetch(url, {
        method: 'POST',
        // mode: 'cors',
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

function setPrizeList(prizes) {
    const prize_container = document.querySelector('.prizes');
    if(prizes.length > 0) {
        prizes.forEach(prize => {
            if(prize.PanelType !== 0) {
                let div = document.createElement('div');
                let img = document.createElement('img');
                let span = document.createElement('span');

                div.classList = 'prize';
                img.src = prize.Title;
                img.alt = prize.Title;
                img.onerror = function() {
                    img.src = 'https://via.placeholder.com/150';
                    img.style.borderRadius = '50%';
                }
                span.innerHTML = prize.Title;

                div.appendChild(img);
                div.appendChild(span);

                prize_container.appendChild(div);
            }
        })
    }

}



window.onload = () => {
    const API_URL = 'https://epson-stw.prm-dev.com';
    const access_token = 'RD9F647C7CBE042B9BF44DC47A2F4C7E476';

    let isAllowedToPlay = true;

    let content = document.querySelector('.main_wrapper');
    let landing_page = document.querySelector('.landing');
    let landing_page_msg = landing_page.querySelector('.landing_msg');
    let landing_page_btn = landing_page.querySelector('.button');
    let loader = document.querySelector('.loading');
    let wheel;


    // Hide content 

    if(getParameterByName('token')) {
        const request_token = getParameterByName('token');
        
        getData(`${API_URL}/api/Game/SpinTheWheel`, access_token, request_token).then(res => {
            let panelID = null;
            let playID = null;
            let panels = null;
            
            landing_page.style.display = "flex";

            loader.style.display = 'none';
            

            if(res.ResponseCode === 5100) {
                isAllowedToPlay = false;
            }

            // Events
            landing_page_btn.addEventListener('click', () => {
                if(isAllowedToPlay) {
                    landing_page.style.display = 'none';
                    loader.style.display = 'flex';
                    setTimeout(() => {
                        panels = res['Data']['Panels'];
                        panelID = res['Data']['PanelId'];
                        playID = res['Data']['PlayId'];

                        setPrizeList(panels);

                        content.style.display = 'flex';
                        loader.style.display = 'none';

                        // Spin Wheel
                        wheel = new SpinWheel(wheel_canvas, context, panels, container, panelID, playID);
                        wheel.draw();
  
                    }, 500)
                } else {
                    loader.style.display = 'flex';
                    landing_page_msg.innerHTML = '';
                    landing_page_btn.style.display = "none";
                    setTimeout(() => {
                        loader.style.display = 'none';
                        landing_page_msg.innerHTML = res.Message;
                        
                    }, 700)
                }
            })
            
            playBtn.addEventListener('click', () => {
                wheel.audio_ctx.resume();

                if(!playBtn.disabled) {
                    setTimeout(() => {
                        //pass prize ID
                        wheel.rotate(panelID);

                    }, 50)
                }

                playBtn.disabled = true;

                
            });

            wheel_canvas.addEventListener('transitionend', () => {
                playBtn.style.pointerEvents = 'auto';
                wheel.transitionEnd();
            })

            modal_btns.forEach(btn => {
                btn.addEventListener('click', () => {
                    sendResult(`${API_URL}/api/Game/SpinTheWheelResult`, access_token, request_token, panelID, playID).then(res => {
                        if(res.ResponseCode === 5000) {
                            window.location.reload();
                        }
                    })
                })
            })

        }).catch(err => {
            console.log(err);
        })
    } else {
        alert("Request Token Unavailable.");
        loader.style.display = 'none';
    }
}