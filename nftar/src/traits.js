// nftar/src/traits.js

const TRAIT_CATEGORIES = [
    ['COMMON', 100],
    ['UNCOMMON', 50],
    ['RARE', 25],
    ['EPIC', 1],
]

const V0_COLORS = {
    "GEN": [
        {key: "GEN", data: {name: "Mint Green (V0)", rgb: {r: 162, g: 236, b: 142}}, weight: 1}
    ],
    "COMMON": [
        {key: "A", data: {name: "Northern Blue", rgb: {r: 99, g: 138, b: 141}}, weight: 1},
        {key: "B", data: {name: "Azure Blue", rgb: {r: 120, g: 137, b: 145}}, weight: 1},
        {key: "C", data: {name: "Mist Blue", rgb: {r: 167, g: 171, b: 153}}, weight: 1},
        {key: "D", data: {name: "Lavender Gray", rgb: {r: 117, g: 115, b: 151}}, weight: 1},
        {key: "E", data: {name: "Lavender", rgb: {r: 165, g: 137, b: 152}}, weight: 1},
        {key: "F", data: {name: "Cocoa", rgb: {r: 139, g: 125, b: 125}}, weight: 1},
        {key: "G", data: {name: "Soft White", rgb: {r: 206, g: 201, b: 175}}, weight: 1},
        {key: "H", data: {name: "Antique White", rgb: {r: 205, g: 169, b: 134}}, weight: 1},
    ],
    "UNCOMMON": [
        {key: "I", data: {name: "Beryl Green", rgb: {r: 208, g: 242, b: 177}}, weight: 1},
        {key: "J", data: {name: "Sea Foam Green", rgb: {r: 207, g: 241, b: 214}}, weight: 1},
        {key: "K", data: {name: "Mellow Yellow", rgb: {r: 247, g: 246, b: 175}}, weight: 1},
        {key: "L", data: {name: "Cream", rgb: {r: 255, g: 224, b: 171}}, weight: 1},
        {key: "M", data: {name: "Pink Sand", rgb: {r: 254, g: 182, b: 156}}, weight: 1},
        {key: "N", data: {name: "Light Pink", rgb: {r: 241, g: 159, b: 157}}, weight: 1},
        {key: "O", data: {name: "Cerulian Blue", rgb: {r: 135, g: 185, b: 231}}, weight: 1},
        {key: "P", data: {name: "Ocean Blue", rgb: {r: 98, g: 115, b: 189}}, weight: 1},
    ],
    "RARE": [
        {key: "Q", data: {name: "Flash", rgb: {r: 223, g: 248, b: 30}}, weight: 1},
        {key: "R", data: {name: "Lemon Cream", rgb: {r: 255, g: 231, b: 109}}, weight: 1},
        {key: "S", data: {name: "Light Orange", rgb: {r: 253, g: 130, b: 11}}, weight: 1},
        {key: "T", data: {name: "Apricot", rgb: {r: 252, g: 92, b: 66}}, weight: 1},
        {key: "U", data: {name: "Dragon Fruit", rgb: {r: 241, g: 46, b: 109}}, weight: 1},
        {key: "V", data: {name: "Blue", rgb: {r: 30, g: 165, b: 252}}, weight: 1},
        {key: "W", data: {name: "Purple", rgb: {r: 137, g: 98, b: 248}}, weight: 1},
    ],
    "EPIC": [
        {key: "X", data: {name: "White", rgb:{r: 255, g: 255, b: 255}}, weight: 1},
        {key: "Y", data: {name: "Black", rgb:{r: 56, g: 56, b: 56}}, weight: 1},
    ],
}

const POPULAR_COLLECTIONS = {
    "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d": {
        name: "Bored Ape Yacht Club",
        kind: "EPIC",
        value: 2,
    },
    "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb": {
        name: "Cyrpto Punks",
        kind: "EPIC",
        value: 1,
    },
    "0x60e4d786628fea6478f785a6d7e704777c86a7c6": {
        name: "Mutant Ape Yacht Club",
        kind: "RARE",
        value: 3,
    },
    "0x23581767a106ae21c074b2276d25e5c3e136a68b": {
        name: "Moonbirds",
        kind: "RARE",
        value: 2,
    },
    "0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b": {
        name: "Clonex",
        kind: "RARE",
        value: 1,
    },
    "0x8a90cab2b38dba80c64b7734e58ee1db38b8992e": {
        name: "Doodles",
        kind: "UNCOMMON",
        value: 4,
    },
    "0xed5af388653567af2f388e6224dc7c4b3241c544": {
        name: "Azuki",
        kind: "UNCOMMON",
        value: 3,
    },
    "0xa3aee8bce55beea1951ef834b99f3ac60d1abeeb": {
        name: "Vee Friends",
        kind: "UNCOMMON",
        value: 2,
    },
    "0xe785e82358879f061bc3dcac6f0444462d4b5330": {
        name: "World of Women",
        kind: "UNCOMMON",
        value: 1,
    },
}

const SPECIAL_COLLECTIONS = {
    "0x581425c638882bd8169dae6f2995878927c9fe70": { // TODO: this is on polygon?
        name: "Courtyard",
        kind: "EPIC",
        value: 2,
    },
    "0xcd79de06dd12b09c5beb567f83b2e9a51a4aafd6": {
        name: "Raremint",
        kind: "EPIC",
        value: 1,
    },
    "0x92ce069c08e39bca867d45d2bdc4ebe94e28321a": {
        name: "3ID Invite",
        kind: "EPIC",
        value: 2,
    }
}

module.exports = {
    TRAIT_CATEGORIES,
    V0_COLORS,
    POPULAR_COLLECTIONS,
    SPECIAL_COLLECTIONS,
}
