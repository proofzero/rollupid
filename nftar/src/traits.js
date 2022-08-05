const TRAIT_CATEGORIES = [
    ['COMMON', 100],
    ['UNCOMMON', 50],
    ['RARE', 25],
    ['EPIC', 1],   
]

const V0_COLORS = {
    "GEN": [
        {key: "GEN", data: {name: "Mint Green (V0)", rgb: {r: 45, g: 74, b: 277}}, weight: 1}
    ],
    "COMMON": [
        {key: "A", data: {name: "Northern Blue", rbg: {r: 99, g: 138, b: 141}}, weight: 1}, 
        {key: "B", data: {name: "Azure Blue", rbg: {r: 120, g: 137, b: 145}}, weight: 1}, 
        {key: "C", data: {name: "Mist Blue", rbg: {r: 167, g: 171, b: 153}}, weight: 1}, 
        {key: "D", data: {name: "Lavender Gray", rbg: {r: 117, g: 115, b: 151}}, weight: 1}, 
        {key: "E", data: {name: "Lavender", rbg: {r: 165, g: 137, b: 152}}, weight: 1}, 
        {key: "F", data: {name: "Cocoa", rbg: {r: 139, g: 125, b: 125}}, weight: 1}, 
        {key: "G", data: {name: "Soft White", rbg: {r: 206, g: 201, b: 175}}, weight: 1}, 
        {key: "H", data: {name: "Antique White", rbg: {r: 205, g: 169, b: 134}}, weight: 1}, 
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

module.exports = {
    TRAIT_CATEGORIES,
    V0_COLORS
}