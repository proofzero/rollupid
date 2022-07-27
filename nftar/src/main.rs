use rand::{thread_rng, Rng};

use clap::{/*ArgEnum,*/ Parser};

use colorgrad::{Color};

use noise::NoiseFn;
use random_color::{RandomColor};

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

const EXTRA_HELP: &str =
    "Use a blockchain account address to with -a <account>.";

const EXTRA_LONG_HELP: &str = "EXAMPLES:

    gradient -a xd3C1D6a6B70d95e5140E01Ad7614bE8175C05787

    gradient -a xd3C1D68a6B70d95e5140E01Ad7614bE8175C05787n -n open-simplex

REPOSITORY: <https://github.com/kubelt/kubelt/nftar>
";

#[derive(Clone, Default, Parser)]
#[clap(name = "nftar", author, version, about, after_help = EXTRA_HELP, after_long_help = EXTRA_LONG_HELP)]
#[clap(arg_required_else_help(true))]
struct Opt {
    /// Set blockchain account address (required)
    #[clap(short = 'a', long, value_name = "ACCOUNT", help_heading = Some("ENTROPY"))]
    account: Option<String>,

    /// Lists all available preset noise names
    #[clap(short = 'p', long, help_heading = Some("GRADIENT"))]
    list_noise: bool,

    /// Use the preset noise
    #[clap(short = 'n', long, value_name = "NAME", help_heading = Some("GRADIENT"))]
    noise: Option<String>,

    /// Scale Override
    #[clap(short = 's', long, value_name = "SCALE DEMONINATOR", help_heading = Some("GRADIENT"))]
    scale: Option<f64>,

    /// Lists all available trait categories
    #[clap(short = 'c', long, help_heading = Some("TRAITS"))]
    list_traits: bool,

    /// Select trait category
    #[clap(short = 't', long, value_name = "TRAIT", help_heading = Some("TRAITS"))]
    pfp_trait: Option<String>,
    
    /// Set output file [default: examples/pfp.png]
    #[clap(short = 'o', long, value_name = "OUTPUT", help_heading = Some("OUTPUT"))]
    output: Option<String>,

    /// Output display width [default: 3000]
    #[clap(short = 'w', long, value_name = "NUM", help_heading = Some("OUTPUT"))]
    width: Option<u32>,

    /// Output display height [default: 1000]
    #[clap(short = 'h', long, value_name = "NUM", help_heading = Some("OUTPUT"))]
    height: Option<u32>,
}

fn main() {
    let opt = Opt::parse();

    if opt.list_noise {
        for name in &NOISE_NAMES {
            println!("{}", name);
        }
        return;
    }
    if opt.list_traits {
        for name in &TRAIT_CATEGORIES {
            println!("{}", name);
        }
        return;
    }

    // TODO: verify blockchain account address
    let account_address = opt.account.expect("--account is required");
    let acct_color = RandomColor::new().seed(account_address).to_rgb_array();

    // NOTE: modify scale in the same ratio as modifying resolution.
    // E.g. if you double the scale you need to double the width and height to get the same pattern
    let scale_denominator = opt.scale.unwrap_or(2.0) * 100000.0;
    // TODO: do we generate two images (one for pfp and one for cover)
    // NOTE: larger res == slower (could try to make async)
    let output_width = opt.width.unwrap_or(1000);
    let output_height = opt.height.unwrap_or(500);
    let output_file = opt.output.unwrap_or("examples/pfp.png".to_string());
    let noise_name = opt.noise.unwrap_or("super-simplex".to_string());

    // TODO: probability algo
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
        .build().unwrap();

    let color_sum = acct_color.iter().fold(0,|a, &b| a as u32 + b as u32); // TODO: summing the account colors may not be unique enough
    let scale = color_sum as f64 / scale_denominator;// play with scale for more meshyness
    
    let noise_sel = match noise_name.as_str() {
        "perlin" => NoiseSel::Perlin(noise::Perlin::new(color_sum)),
        "open-simplex" => NoiseSel::OpenSimplex(noise::OpenSimplex::new(color_sum)),
        "super-simplex" => NoiseSel::SuperSimplex(noise::SuperSimplex::new(color_sum)),
        _ => panic!("Unknown noise name: {}", noise_name),
    };
 
    println!("scale {}", scale);
    
    
    let mut img = image::ImageBuffer::new(output_width, output_height);
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

    // no noise horizontal
    // for (x, _, pixel) in img.enumerate_pixels_mut() {
    //     let rgba = grad.at(x as f64 / output_width as f64).to_rgba8();
    //     *pixel = image::Rgba(rgba);
    // }
    // no noise vertical
    // for (_, y, pixel) in img.enumerate_pixels_mut() {
    //     let rgba = grad.at(y as f64 / output_height as f64).to_rgba8();
    //     *pixel = image::Rgba(rgba);
    // }

    // TODO: output as base64 with metadata (values used to generate the image)
    img.save(output_file).unwrap();
}

// async fn gen_pixel(u8, u8, pixel) -> Result

// Map t from range [a, b] to range [c, d]
fn remap(t: f64, a: f64, b: f64, c: f64, d: f64) -> f64 {
    (t - a) * ((d - c) / (b - a)) + c
}
