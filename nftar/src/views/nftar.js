const generateTraitItems = (traits) => {
    let markup = ''
    for (const item in traits) {
        if (!Object.hasOwn(traits, item)) continue;
        markup += `<li>
            <div>${item}: Type: ${ traits[item].type }</div>
            <div>Name: ${traits[item].value.name }</div>
            <div>RGB: ${traits[item].value.rgb }</div>
            <div>RND: ${traits[item].value.rnd }</div>
        </li>`;
    }
    return markup
}

const animationViewer = (account, traits) => {
    return `<!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="utf-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome-1">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0">
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
                            width: 1500px; /* TODO: make this dynamic */
                            height: 750px; /* TODO: make this dynamic */
                            margin: auto;
                            display: block;
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                        }
                        canvas {
                            display: none;
                        }
                        img {
                            /* display: none; */
                        }
                    </style>
                </head>
                <body>
                    <image id="hex" src="" />
                    <canvas id="canvas"></canvas>
                    <!-- <script src="https://requirejs.org/docs/release/2.3.6/minified/require.js"></script> -->
                    <script type="module" src="/public/canvas.js"></script>

                    <ul class="traits">
                        ${generateTraitItems(traits)}
                    </ul>

                    <script type="module">
                        const TRAITS = ${traits}
                        const COLORS = Object.keys(TRAITS).map((k) => TRAITS[k].value)
                        const FRAMES_PER_SECOND = 30;  // Valid values are 60,30,20,15,10...
                        const PIXEL_RATIO = (window.devicePixelRatio > 1) ? 2 : 1

                        const g = new Gradient(document.getElementById('canvas'), COLORS, PIXEL_RATIO, FRAMES_PER_SECOND);
                        g.animate()

                        // window.addEventListener('resize', g.resize.bind(g), false);

                        const png = await g.freeze()
                        document.getElementById('hex').setAttribute('src', png);

                        window.g = g
                    </script>
                </body>
            </html>`;
        };

module.exports = animationViewer;