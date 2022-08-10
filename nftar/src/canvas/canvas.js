const GlowParticle = require('./glowparticle.js');

const FRAMES_PER_SECOND = 12;  // Valid values are 60,30,20,15,10...

function requestAnimationFrame(f){
    if (typeof window === 'undefined') {
        setImmediate(()=>f());
    } else {
        window.requestAnimationFrame(f);
    }
}

class App {
    constructor(canvas_el, COLORS, PIXEL_RATIO = 1, FPS) {
        this.canvas = canvas_el;
        this.ctx = this.canvas.getContext('2d');

        this.COLORS = COLORS;

        if (FPS) {
            this.lastFrameTime = 0;
            this.time = 0;
            this.fpsInterval = 1000 / FPS;
            this.then = Date.now();
            this.dn =  Date.now;
        }

        this.pixelRatio = PIXEL_RATIO;
        // Use the full with and height of the passed-in canvas.
        this.stageWidth = this.canvas.getWidth();
        this.stageHeight = this.canvas.getHeight();

        this.totalParticles = 4;
        this.particles = [];
        this.maxRadius = 1250;
        this.minRadius = 500;

        this.frame = null;
        this.rendered = false;

        this.canvas.width = this.stageWidth * this.pixelRatio;
        this.canvas.height = this.stageHeight * this.pixelRatio;
        this.ctx.scale(this.pixelRatio, this.pixelRatio);

        this.ctx.globalCompositeOperation = 'saturation';

        this.createParticles();
    }

    async freeze() {
        const sleep = ms => new Promise(res => setTimeout(res, ms));

        var framePromise = new Promise(async function(resolve, reject){
            let count = 0;
            await sleep(1000);
            while(!this.isRendered() && count <= 10) {
                count++;
                await sleep(100);
            }
            if (count >= 10) {
                reject('timeout');
            }

            this.frame = this.ctx.canvas.toDataURL();
            resolve(this.frame);

        }.bind(this));
        return framePromise;
    }

    createParticles() {
        let curColor = 0;
        this.particles = [];

        // TODO: make it so the params always position the gradient the same way for first frame
        // akak deterministic placements of particles
        for(let i = 0; i < this.totalParticles; i++) {
            const curCol = this.COLORS[curColor];
            const item = new GlowParticle(
                curCol.rnd[0] * this.stageWidth,
                curCol.rnd[1] * this.stageHeight,
                curCol.rnd[2] * (this.maxRadius - this.minRadius) + this.minRadius,
                this.COLORS[curColor],
            );

            if (++curColor >= this.COLORS.length) {
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
            //console.log('frame', this.then);

            this.then = now - (elapsed % this.fpsInterval);

            // clear the canvas
            this.clear();

            // draw the particles
            for (let i = 0; i < this.totalParticles; i++) {
                const item = this.particles[i];
                item.animate(this.ctx, this.stageWidth, this.stageHeight);
            }
        }

        // console.log('here', this.rendered)
        this.rendered = true;
    }

    /**
     * Empty the entire drawing context.
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.getWidth(), this.canvas.getHeight());
    }

    /**
     * Generate a single frame to use as PFP.
     *
     * @return a stream of PNG image data
     */
    snapshot() {
        requestAnimationFrame(this.animate.bind(this));

        this.clear();

        for (const particle of this.particles) {
            particle.animate(this.ctx, this.canvas.getWidth(), this.canvas.getHeight());
        }

        return this.canvas.createPNGStream();
    }

    isRendered() {
        return this.rendered;
    }
}

module.exports = App;
