const COLORS = [
    {r: 45, g: 74, b: 277},
    {r: 255, g: 0, b: 0},
    {r: 0, g: 255, b: 0},
    {r: 0, g: 0, b: 255},
    {r: 255, g: 255, b: 0},
]

class App {
    constructor() {
        this.canvas = document.getElementById('canvas');
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.pixelRatio = (window.devicePixelRatio > 1) ? 2 : 1;

        this.totalParticles = 1;
        this.particles = [];
        this.maxRadius = 90;
        this.minRadus = 40;

        window.addEventListener('resize', this.resize.bind(this), false);
        this.resize();

        window.requestAnimationFrame(this.animate.bind(this));
    
    }

    resize() {
        this.stage  

    }

    animate() {

    }
}

window.onload = () => {
    new App();
}