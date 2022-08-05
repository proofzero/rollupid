const GlowParticle = require('./glowparticle.js');

const COLORS = [
    // {r:162, g:236, b:142}

    {r: 45, g: 74, b: 277},
    {r: 255, g: 104, b: 248},
    {r: 44, g: 209, b: 252},
    {r: 54, g: 233, b: 84},
    // {r: 255, g: 255, b: 0},
]

const FRAMES_PER_SECOND = 12;  // Valid values are 60,30,20,15,10...

function requestAnimationFrame(f){
    if (typeof window === 'undefined') {
        setImmediate(()=>f())
    } else {
        window.requestAnimationFrame(f);
    }
}

class App {
    constructor(canvas_el) {
        this.canvas = canvas_el
        this.ctx = this.canvas.getContext('2d');

        this.lastFrameTime = 0;
        this.time = 0;

        this.pixelRatio = (typeof window !== 'undefined' && window.devicePixelRatio > 1) ? 2 : 1;

        this.totalParticles = 4;
        this.particles = [];
        this.maxRadius = 2000;
        this.minRadius = 1500;

        // if (typeof window !== 'undefined') {
        //     window.addEventListener('resize', this.resize.bind(this), false);
        // }
        this.resize();

        this.fpsInterval = 1000 / FRAMES_PER_SECOND;
        this.then = Date.now();
        this.dn =  Date.now;

        requestAnimationFrame(this.animate.bind(this));

        this.frame = null;
        this.rendered = false;
    }

    async freeze() {
        const sleep = ms => new Promise(res => setTimeout(res, ms));

        var framePromise = new Promise(async function(resolve, reject){
            let count = 0
            await sleep(1000);
            while(!this.isRendered() && count <= 10) {
                console.log(count, this.isRendered())
                count++
                await sleep(100);
            }
            if (count >= 10) {
                reject('timeout')
            }
            this.frame = this.ctx.canvas.toDataURL();
            resolve(this.frame)
        }.bind(this));
        return framePromise
    }

    resize() {
        this.stageWidth = 1500;
        this.stageHeight = 750;

        this.canvas.width = this.stageWidth * this.pixelRatio;
        this.canvas.height = this.stageHeight * this.pixelRatio;
        this.ctx.scale(this.pixelRatio, this.pixelRatio);

        this.ctx.globalCompositeOperation = 'saturation';
        
        this.createParticles();

    }

    createParticles() {
        let curColor = 0;
        this.particles = [];

        // TODO: make it so the params always position the gradient the same way for first frame
        // akak deterministic placements of particles
        for(let i = 0; i < this.totalParticles; i++) {
            const item = new GlowParticle(
                Math.random() * this.stageWidth,
                Math.random() * this.stageHeight,
                Math.random() * (this.maxRadius - this.minRadius) + this.minRadius,
                COLORS[curColor]
            );

            if (++curColor >= COLORS.length) {
                curColor = 0;
            }

            this.particles[i] = item;
        }
    }

    animate() {
        
        requestAnimationFrame(this.animate.bind(this));

        const now = Date.now();
        const elapsed = now - this.then;

        if (elapsed > this.fpsInterval) {
            // console.log('frame', this.then)

            this.then = now - (elapsed % this.fpsInterval);

            this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight);

            for (let i = 0; i < this.totalParticles; i++) {
                const item = this.particles[i];
                item.animate(this.ctx, this.stageWidth, this.stageHeight);
            }
        }
        // console.log('here', this.rendered)
        this.rendered = true;
    }

    isRendered() {
        return this.rendered;
    }
}

module.exports = App;