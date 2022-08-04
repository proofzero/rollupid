#[macro_use]
extern crate serde_derive;

use std::path::PathBuf;

use apis::{nft_storage_api::store, configuration::Configuration};
use models::{Meta, Type, Form};
use serde_json::json;
use worker::*;
use serde::Serialize;

use rand::{thread_rng, Rng};
use colorgrad::{Color};
use noise::NoiseFn;
use random_color::{RandomColor};

mod utils;
pub mod apis;
pub mod models;

#[macro_use]
extern crate lazy_static;

const NOISE_NAMES: [&str; 3] = [
    "perlin",
    "open-simplex",
    "super-simplex",
];

enum NoiseSel {
    Perlin(noise::Perlin),
    OpenSimplex(noise::OpenSimplex),
    SuperSimplex(noise::SuperSimplex),
}

const TRAIT_CATEGORIES: [&str; 4] = [
    "common",
    "uncommon",
    "rare",
    "epic",
];

lazy_static! {
    pub static ref COMMON: [(u8, u8, u8, u8); 8] = [
        (99, 138, 141, 255),
        (120, 137, 145, 255),
        (167, 171, 153, 255),
        (117, 115, 151, 255),
        (165, 137, 152, 255),
        (139, 125, 125, 255),
        (216, 201, 175, 255),
        (205, 169, 134, 255),
    ];
    pub static ref UNCOMMON: [(u8, u8, u8, u8); 8] = [
        (208, 242, 177, 255),
        (207, 241, 214, 255),
        (247, 246, 175, 255),
        (255, 224, 171, 255),
        (254, 182, 156, 255),
        (241, 159, 157, 255),
        (135, 185, 231, 255),
        (98, 115, 186, 255),
    ];
    pub static ref RARE: [(u8, u8, u8, u8); 7] = [
        (223, 248, 30, 255),
        (255, 235, 109, 255),
        (253, 130, 11, 255),
        (252, 92, 66, 255),
        (241, 46, 109, 255),
        (30, 165, 252, 255),
        (137, 98, 252, 248),
    ];
    pub static ref EPIC: [(u8, u8, u8, u8); 2] = [
        (255, 255, 255, 255),
        (56, 56, 56, 255),
    ];

}

fn log_request(req: &Request) {
    console_log!(
        "{} - [{}], located at: {:?}, within: {}",
        Date::now().to_string(),
        req.path(),
        req.cf().coordinates().unwrap_or_default(),
        req.cf().region().unwrap_or("unknown region".into())
    );
}

#[derive(Serialize)]
struct PFPGenRequest {
    scale: f64,
    sharpness: usize,
    smoothness: f64,
    width: usize,
    height: usize,
    noise_algo: String,
}

#[derive(Serialize)]
struct PFPGenResponse {
    pfp: String,
    cover: String,
}

#[event(fetch)]
pub async fn main(req: Request, env: Env, _ctx: worker::Context) -> Result<Response> {
    log_request(&req);

    // Optionally, get more helpful error messages written to the console in the case of a panic.
    utils::set_panic_hook();

    // Optionally, use the Router to handle matching endpoints, use ":name" placeholders, or "*name"
    // catch-alls to match on specific patterns. Alternatively, use `Router::with_data(D)` to
    // provide arbitrary data that will be accessible in each route via the `ctx.data()` method.
    let router = Router::new();

    // Add as many routes as your Worker needs! Each route will get a `Request` for handling HTTP
    // functionality and a `RouteContext` which you can use to  and get route parameters and
    // Environment bindings like KV Stores, Durable Objects, Secrets, and Variables.
    router
        .get("/", |_, _| Response::ok("Hello from Workers!"))
        .get("/worker-version", |_, ctx| {
            let version = ctx.var("WORKERS_RS_VERSION")?.to_string();
            Response::ok(version)
        })
        .post_async("/pfp/:address", |mut req: Request, ctx| async move {
            if let Some(address) = ctx.param("address") {
                let json: serde_json::Value = req.json().await?;
                
                let scale_denominator = json["scale_denominator"].as_f64().unwrap_or(3.0) * 100000.0;
                let sharp_segment = json["sharp_segment"].as_u64().unwrap_or(5);
                let smoothness = json["smoothness"].as_f64().unwrap_or(1.0);
                let output_width = json["output_width"].as_u64().unwrap_or(500);
                let output_height = json["output_height"].as_u64().unwrap_or(500);
                let noise_algo = json["noise_algo"].as_str().unwrap_or("perlin");

                let acct_color = RandomColor::new().seed(address).to_rgb_array();

                let mut rng = thread_rng();
                let random_trait_cat: usize = rng.gen_range(0..3);
                let trait_color = match random_trait_cat {
                    0 => {
                        let color_sel: usize = rng.gen_range(0..7);
                        Color::from_rgba8(COMMON[color_sel].0, COMMON[color_sel].1, COMMON[color_sel].2, COMMON[color_sel].3)
                    }
                    1 => {
                        let color_sel: usize = rng.gen_range(0..7);
                        Color::from_rgba8(UNCOMMON[color_sel].0, UNCOMMON[color_sel].1, UNCOMMON[color_sel].2, UNCOMMON[color_sel].3)
                    }
                    2 => {
                        let color_sel: usize = rng.gen_range(0..6);
                        Color::from_rgba8(RARE[color_sel].0, RARE[color_sel].1, RARE[color_sel].2, RARE[color_sel].3)
                    }
                    3 => {
                        let color_sel: usize = rng.gen_range(0..1);
                        Color::from_rgba8(EPIC[color_sel].0, EPIC[color_sel].1, EPIC[color_sel].2, EPIC[color_sel].3)
                    }
                    _ => panic!("Unknown color trait: {}", random_trait_cat),
                };

                let grad = colorgrad::CustomGradient::new()
                    .colors(&[ // we can play around with amount of colors and use them as traits
                        Color::from_rgba8(162, 236, 142, 255), // version color
                        Color::from_rgba8(acct_color[0], acct_color[1], acct_color[2], 255), // account color
                        trait_color,
                        // Color::from_rgba8(COMMON[random_common].0, COMMON[random_common].1, COMMON[random_common].2, COMMON[random_common].3),
                        // common_traits, // trait colour
                        // uncommon_traits, // trait colour
                        // rare_traits, // trait colour
                    ])
                    .build().unwrap().sharp(sharp_segment as usize, smoothness);

                let color_sum = acct_color.iter().fold(0,|a, &b| a as u32 + b as u32); // TODO: summing the account colors may not be unique enough
                let scale = color_sum as f64 / scale_denominator;// play with scale for more meshyness
                
                let noise_sel = match noise_algo {
                    "perlin" => NoiseSel::Perlin(noise::Perlin::new(color_sum)),
                    "open-simplex" => NoiseSel::OpenSimplex(noise::OpenSimplex::new(color_sum)),
                    "super-simplex" => NoiseSel::SuperSimplex(noise::SuperSimplex::new(color_sum)),
                    _ => panic!("Unknown noise name: {}", noise_algo),
                };

                let mut img = image::ImageBuffer::new(output_width as u32, output_height as u32);
                // TODO: can this be concurrent: https://github.com/emberhunt/outline-tool/blob/master/src/main.rs

                for (x, y, pixel) in img.enumerate_pixels_mut() {
                    let t = match noise_sel {
                        NoiseSel::Perlin(ns) => ns.get([x as f64 * scale as f64, y as f64 * scale as f64]),
                        NoiseSel::OpenSimplex(ns) => ns.get([x as f64 * scale as f64, y as f64 * scale as f64]),
                        NoiseSel::SuperSimplex(ns) => ns.get([x as f64 * scale as f64, y as f64 * scale as f64]),
                        // _ => panic!("Unknown noise selection"),
                    };
                    // let rgba = grad.at(t).to_rgba8();
                    let rgba = grad.at(remap(t, -0.5, 0.5, 0.0, 1.0)).to_rgba8();
                    *pixel = image::Rgba(rgba);
                }

                // TODO: can I save buffer to memory?
                //    image::save_buffer("image.png", buffer, 800, 600, image::ColorType::Rgb8).unwrap()


                let configuration: &mut Configuration = &mut Configuration::default();
                configuration.bearer_access_token = Some("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDc3YTZCRURiMTM5NzBhMWMzQUU2NTQ4Mjk4QkVlNDc5NkUyNjM4MEUiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1OTU2NzUxMDY5OCwibmFtZSI6Im5mdGFyLWFkcmlhbiJ9.E7QLmq_H_FwkoydMK1aBvmTtZnDHYJJVucFKtf1Dkzs".to_string());
                
                let mut bytes = Vec::new();
                img.write_to(&mut std::io::Cursor::new(&mut bytes), image::ImageOutputFormat::Png);

                let meta = Meta {
                    name: None,
                    description: None,
                    properties: None,
                    image: None,
                    // image: Some(img.into_raw()),
                    // file: None,
                    // image: Some(Type::ImageJpeg),
                };

                let form = Form {
                    meta: Some(meta),
                    // data: Some(img.into_vec()),
                    // data: None,
                    // file: None,
                };

                let resp = store(configuration, form).await;
                match resp {
                    Ok(v) => return Response::from_json(&json!({
                        "address": address,
                        "scale_denominator": scale_denominator,
                        "smoothness": smoothness,
                        "output_width": output_width,
                        "output_height": output_height,
                        "noise_algo": noise_algo,
                        "acct_color": acct_color,
                        "resp": v.value,
                    })),
                    Err(e) => return Response::from_json(&json!({
                        "error": e.to_string(),
                    })),  
                }   
            }

            Response::error("Bad Request", 400)
        })
        .run(req, env)
        .await
}

// Map t from range [a, b] to range [c, d]
fn remap(t: f64, a: f64, b: f64, c: f64, d: f64) -> f64 {
    (t - a) * ((d - c) / (b - a)) + c
}