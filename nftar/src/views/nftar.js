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
                    <link rel="icon" type="image/png" href="https://dapp.threeid.xyz/favicon.ico"/>
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

                    <ul class="traits">
                        ${generateTraitItems(traits)}
                    </ul>

                    <script type="module">
                        const TRAITS = ${JSON.stringify(traits)}
                        const COLORS = Object.keys(TRAITS).map((k) => TRAITS[k].value)
                        const FRAMES_PER_SECOND = 30;  // Valid values are 60,30,20,15,10...
                        const PIXEL_RATIO = (window.devicePixelRatio > 1) ? 2 : 1

                        var c = document.getElementById('canvas');
                        var ctx = c.getContext("2d");
                        var grd = ctx.createRadialGradient(75, 50, 5, 90, 60, 100);
                        grd.addColorStop(0, "red");
                        grd.addColorStop(1, "white");
                        ctx.fillStyle = grd;
                        ctx.fillRect(10, 10, 150, 80);

                        document.getElementById('hex').setAttribute('src', ctx.canvas.toDataURL());
                    </script>
                </body>
            </html>`;
        };

module.exports = { animationViewer };