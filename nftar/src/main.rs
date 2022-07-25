use rand::{thread_rng, Rng};

use clap::{/*ArgEnum,*/ Parser};

use colorgrad::{Color};

use noise::NoiseFn;
use random_color::{RandomColor};

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

const EXTRA_HELP: &str =
    "Use a blockchain account address to with -a <account>.";

const EXTRA_LONG_HELP: &str = "EXAMPLES:

    gradient -a xd3C1D6a6B70d95e5140E01Ad7614bE8175C05787

    gradient -a xd3C1D6a6B70d95e5140E01Ad7614bE8175C05787n -n open-simplex

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


    let scale_denominator = opt.scale.unwrap_or(30.0) * 100000.0;

    let acct_color = RandomColor::new().seed(account_address).to_rgb_array();
    let output_width = opt.width.unwrap_or(3000);
    let output_height = opt.height.unwrap_or(1000);
    let output_file = opt.output.unwrap_or("examples/pfp.png".to_string());
    let noise_name = opt.noise.unwrap_or("perlin".to_string());

    // TODO: these trait colors ranges should be in categories
    // we can use an address' nft collection to weigh in on probabilities
    let mut rng = thread_rng();
    let rngone = rng.gen_range(0..255);
    let rngtwo = rng.gen_range(0..255);
    let rngthree = rng.gen_range(0..255);


    let grad = colorgrad::CustomGradient::new()
    // TODO: traits
    .colors(&[ // we can play around with amount of colors and use them as traits
        Color::from_rgba8(acct_color[0], acct_color[1], acct_color[2], 255),
        Color::from_rgba8(0, 0, 0, 255), // version account
        Color::from_rgba8(rngone, rngtwo, rngthree, 255), // trait colour
        Color::new(0.274, 0.5, 0.7, 1.0), // brand color
        // Color::from_hsva(50.0, 1.0, 1.0, 1.0),
        // Color::from_hsva(348.0, 0.9, 0.8, 1.0),
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
    
    
    let mut imgbuf = image::ImageBuffer::new(output_width, output_height);

    for (x, y, pixel) in imgbuf.enumerate_pixels_mut() {
        let t = match noise_sel {
            NoiseSel::Perlin(ns) => ns.get([x as f64 * scale as f64, y as f64 * scale as f64]),
            NoiseSel::OpenSimplex(ns) => ns.get([x as f64 * scale as f64, y as f64 * scale as f64]),
            NoiseSel::SuperSimplex(ns) => ns.get([x as f64 * scale as f64, y as f64 * scale as f64]),
            // _ => panic!("Unknown noise selection"),
        };
        let rgba = grad.at(remap(t, -0.5, 0.5, 0.0, 1.0)).to_rgba8();
        *pixel = image::Rgba(rgba);
    }

    // TODO: output as base64 with metadata (values used to generate the image)
    imgbuf.save(output_file).unwrap();
}

// Map t from range [a, b] to range [c, d]
fn remap(t: f64, a: f64, b: f64, c: f64, d: f64) -> f64 {
    (t - a) * ((d - c) / (b - a)) + c
}
