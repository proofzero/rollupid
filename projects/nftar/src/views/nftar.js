function generateTraitItems (traits) {
    let markup = ''
    for (const item in traits) {
        if (!Object.hasOwn(traits, item)) continue;
        markup += `<li>
            <div>${item}: Type: ${ traits[item].type }</div>
            <div>Name: ${traits[item].value.name }</div>
            <div>RGB: ${JSON.stringify(traits[item].value.rgb) }</div>
            <div>RND: ${JSON.stringify(traits[item].value.rnd) }</div>
        </li>`;
    }
    return markup
}

function animationViewer (account, traits) {
    return `<!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="utf-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome-1">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0">
                    <link rel="icon" type="image/png" href="https://my.threeid.xyz/favicon.ico"/>
                    <title>NFTar ${account}</title>
                    <style>
                        * {
                            outline: 0;
                            margin: 0;
                            padding: 0;
                        }

                        html {
                            width: 100%;
                            height: 100%;
                        }

                        body {
                            width: 100%;
                            height: 100%;
                        }

                        canvas, img {
                            /* background-color: rgb(162, 236, 142); */
                            /* background-color: white; */
                            width: 1000px;  // PFP is 1000x1000 (see app.js)
                            height: 1000px; // PFP is 1000x1000 (see app.js)
                            margin: auto;
                            display: block;
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                        }
                    </style>
                </head>
                <body>
                    <image id="hex" src="" />
                    <canvas id="canvas"></canvas>

                    <!-- <ul class="traits">
                        ${generateTraitItems(traits)}
                    </ul> -->

                    <script type="module">

                        const P12 = Math.PI * 2;

                        class GlowParticle {
                            constructor(x, y, radius, colors) {
                                this.x = x;
                                this.y = y;
                                this.radius = radius;
                                this.rgb = colors.rgb;
                        
                                this.vx = colors.rnd[3] * 4;
                                this.vy = colors.rnd[4] * 4;
                        
                                this.sinValue = colors.rnd[5];
                            }
                        
                            animate(ctx, stageWidth, stageHeight) {
                                this.sinValue += 0.01;
                        
                                this.radius += Math.sin(this.sinValue);
                        
                                this.x += this.vx;
                                this.y += this.vy;
                        
                                if (this.x < 0) {
                                    this.vx *= -1;
                                    this.x += 10;
                                } else if (this.x > stageWidth) {
                                    this.vx *= -1;
                                    this.x -= 10;
                                }
                        
                                if (this.y < 0) {
                                    this.vy *= -1;
                                    this.y += 10;
                                } else if (this.y > stageHeight) {
                                    this.vy *= -1;
                                    this.y -= 10;
                                }
                        
                                ctx.beginPath();
                                const g = ctx.createRadialGradient(
                                    this.x,
                                    this.y,
                                    this.radius * 0.01,
                                    this.x,
                                    this.y,
                                    this.radius
                                );

                                const stop0Color = 'rgba('+this.rgb.r+', '+this.rgb.g+', '+this.rgb.b+', 0.6)';
                                const stop1Color = 'rgba('+this.rgb.r+', '+this.rgb.g+', '+this.rgb.b+', 0.0)';

                                g.addColorStop(0, stop0Color);
                                g.addColorStop(1, stop1Color);
                        
                                ctx.fillStyle = g;
                                ctx.arc(this.x, this.y, this.radius, 0, P12, false);
                                ctx.fill();
                            }
                        }

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
                                this.stageWidth = this.canvas.width;
                                this.stageHeight = this.canvas.height;
                        
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
                                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
                                    particle.animate(this.ctx, this.canvas.width, this.canvas.height);
                                }
                        
                                return this.canvas.createPNGStream();
                            }
                        
                            isRendered() {
                                return this.rendered;
                            }
                        }

                        const TRAITS = ${JSON.stringify(traits)}

                        const COLORS = Object.keys(TRAITS).map((k) => TRAITS[k].value)
                        const FRAMES_PER_SECOND = 30;  // Valid values are 60,30,20,15,10...
                        // OpenSea display should be 1:1.
                        const PIXEL_RATIO = 1; // (window.devicePixelRatio > 1) ? 2 : 1

                        const app = new App(document.getElementById('canvas'), COLORS, PIXEL_RATIO, FRAMES_PER_SECOND);
                        app.animate();
                    </script>
                </body>
            </html>`;
        };

module.exports = { animationViewer };
