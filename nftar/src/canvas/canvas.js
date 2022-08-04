import { GlowParticle } from './glowparticle.js';

const COLORS = [
    // {r:162, g:236, b:142}

    {r: 45, g: 74, b: 277},
    {r: 255, g: 104, b: 248},
    {r: 44, g: 209, b: 252},
    {r: 54, g: 233, b: 84},
    // {r: 255, g: 255, b: 0},
]

const FRAMES_PER_SECOND = 12;  // Valid values are 60,30,20,15,10...

class App {
    constructor() {
        this.canvas = document.getElementById('canvas');
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.lastFrameTime = 0;
        this.time = 0;
      

        // this.ctx.globalCompositeOperation = 'destination-over'
        // this.ctx.canvas.style.backgroundColor = 'rbg(162, 236, 142)';
        // this.ctx.fill()



        this.pixelRatio = (window.devicePixelRatio > 1) ? 2 : 1;

        this.totalParticles = 4;
        this.particles = [];
        this.maxRadius = 2000;
        this.minRadius = 1500;

        window.addEventListener('resize', this.resize.bind(this), false);
        this.resize();

        this.fpsInterval = 1000 / FRAMES_PER_SECOND;
        this.then = Date.now();
        this.dn =  Date.now;

        window.requestAnimationFrame(this.animate.bind(this));

        setTimeout(() => {
        const freeze = this.ctx.canvas.toDataURL();
            // console.log(freeze);
            document.getElementById('hex').setAttribute('src', freeze);
        }, 1000);
    }

    resize() {
        this.stageWidth = document.body.clientWidth;
        this.stageHeight = document.body.clientHeight;

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
        
        window.requestAnimationFrame(this.animate.bind(this));

        const now = Date.now();
        const elapsed = now - this.then;

        if (elapsed > this.fpsInterval) {
            // console.log('frame', this.then)

            this.then = now - (elapsed % this.fpsInterval);

            this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight);

            // Add behind elements.
            // this.ctx.beginPath()
            // this.ctx.fillStyle = 'rgb(162, 236, 142)';
            // this.ctx.fillRect(0, 0, this.stageWidth, this.stageHeight);


            for (let i = 0; i < this.totalParticles; i++) {
                const item = this.particles[i];
                item.animate(this.ctx, this.stageWidth, this.stageHeight);
            }
        }
    }
}

window.onload = () => {
    new App();
}