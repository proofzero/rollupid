const utils = require('../src/utils.js');

// Sample Alchemy NFT API response.
const ALCHEMY_NFTS_FIXTURE = {
	"ownedNfts": [{
		"contract": {
			"address": "0x028ae75bb01eef2a581172607b93af8d24f50643"
		},
		"tokenId": "0",
		"tokenType": "ERC721",
		"title": "3ID PFP: GEN 0",
		"description": "3ID PFP for 0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52",
		"timeLastUpdated": "2022-09-16T21:13:14.131Z",
		"rawMetadata": {
			"name": "3ID PFP: GEN 0",
			"cover": "ipfs://bafybeiavtmfmzqbgcf3rtdyvmm6gy47lj36yso5ye7swenajanrhoc6poy/cover.png",
			"description": "3ID PFP for 0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52",
			"image": "ipfs://bafybeigvlth7b65ump3jbyoat2monxaopkfch3u4g7mbl7lxhtlogcsbxm/threeid.png",
			"properties": {
				"GEN": "Mint Green (V0)",
				"metadata": {
					"name": "ethereum",
					"chainId": 5,
					"account": "0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52"
				},
				"Points": "Ocean Blue",
				"traits": {
					"trait2": {
						"type": "COMMON",
						"value": {
							"name": "Mist Blue",
							"rgb": {
								"r": 167,
								"b": 153,
								"g": 171
							},
							"rnd": [0.5294867525666676, 0.34329529715825835, 0.4839295947693194, 0.8612019943381166, 0.825141365016532, 0.09134496383496082]
						}
					},
					"trait3": {
						"type": "UNCOMMON",
						"value": {
							"name": "Ocean Blue",
							"rgb": {
								"r": 98,
								"b": 189,
								"g": 115
							},
							"rnd": [0.4028243586672722, 0.5723152025568266, 0.5852902383952501, 0.47518616865889696, 0.12760708334637272, 0.5776526680823542]
						}
					},
					"trait0": {
						"type": "GEN",
						"value": {
							"name": "Mint Green (V0)",
							"rgb": {
								"r": 45,
								"b": 277,
								"g": 74
							},
							"rnd": [0.6689976939822713, 0.4148438755354671, 0.9063612415765292, 0.8896042562721858, 0.3206137836276337, 0.9073548735588304]
						}
					},
					"trait1": {
						"type": "UNCOMMON",
						"value": {
							"name": "Cream",
							"rgb": {
								"r": 255,
								"b": 171,
								"g": 224
							},
							"rnd": [0.6889722394916404, 0.6280319657790543, 0.037026059748865636, 0.14704877701399255, 0.20336056911231615, 0.490159443027687]
						}
					}
				},
				"Friend": "Mist Blue",
				"Priority": "Cream"
			}
		},
		"tokenUri": {
			"raw": "ipfs://bafyreifoajdzxyqg527ei5pikki4t7aqvxewgpussuxlzwtyu5ymz6cp2i/metadata.json",
			"gateway": "https://ipfs.io/ipfs/bafyreifoajdzxyqg527ei5pikki4t7aqvxewgpussuxlzwtyu5ymz6cp2i/metadata.json"
		},
		"media": [{
			"raw": "ipfs://bafybeigvlth7b65ump3jbyoat2monxaopkfch3u4g7mbl7lxhtlogcsbxm/threeid.png",
			"gateway": "https://ipfs.io/ipfs/bafybeigvlth7b65ump3jbyoat2monxaopkfch3u4g7mbl7lxhtlogcsbxm/threeid.png"
		}],
		"balance": 1
	}, {
		"contract": {
			"address": "0x3493f9e191020cabbcdcc07697f74e019292e469"
		},
		"tokenId": "1",
		"tokenType": "ERC721",
		"title": "3iD invite #0001",
		"description": "Generation#0 invitation to threeid.xyz",
		"timeLastUpdated": "2022-09-16T19:06:02.386Z",
		"rawMetadata": {
			"name": "3iD invite #0001",
			"description": "Generation#0 invitation to threeid.xyz",
			"image": "ipfs://bafybeihrlopjh4jmgjn5kxks4f55i3pxggzpxubvlxb64odtt5rsaj3vry/invite-0001.svg",
			"properties": {
				"issueDate": "8/12/2022",
				"inviteId": "0001",
				"inviteTier": "generation#0"
			}
		},
		"tokenUri": {
			"raw": "ipfs://bafyreig5xalnbs3ki2omxoo4coy7h46zivgrokkuo3qfm7wzaztbemoluu/metadata.json",
			"gateway": "https://ipfs.io/ipfs/bafyreig5xalnbs3ki2omxoo4coy7h46zivgrokkuo3qfm7wzaztbemoluu/metadata.json"
		},
		"media": [{
			"raw": "ipfs://bafybeihrlopjh4jmgjn5kxks4f55i3pxggzpxubvlxb64odtt5rsaj3vry/invite-0001.svg",
			"gateway": "https://ipfs.io/ipfs/bafybeihrlopjh4jmgjn5kxks4f55i3pxggzpxubvlxb64odtt5rsaj3vry/invite-0001.svg"
		}],
		"balance": 1
	}, {
		"contract": {
			"address": "0x4bde2ca790416d54187b3ad50eaec0f29a33067b"
		},
		"tokenId": "1",
		"tokenType": "ERC721",
		"title": "Buffalo",
		"description": "It's actually a bison?",
		"timeLastUpdated": "2022-08-01T23:14:43.971Z",
		"rawMetadata": {
			"name": "Buffalo",
			"description": "It's actually a bison?",
			"image": "https://austingriffith.com/images/paintings/buffalo.jpg",
			"external_url": "https://austingriffith.com/portfolio/paintings/",
			"attributes": [{
				"value": "green",
				"trait_type": "BackgroundColor"
			}, {
				"value": "googly",
				"trait_type": "Eyes"
			}, {
				"value": 42,
				"trait_type": "Stamina"
			}]
		},
		"tokenUri": {
			"raw": "https://ipfs.io/ipfs/QmfVMAmNM1kDEBYrC2TPzQDoCRFH6F5tE1e9Mr4FkkR5Xr",
			"gateway": "https://ipfs.io/ipfs/QmfVMAmNM1kDEBYrC2TPzQDoCRFH6F5tE1e9Mr4FkkR5Xr"
		},
		"media": [{
			"raw": "https://austingriffith.com/images/paintings/buffalo.jpg",
			"gateway": "https://austingriffith.com/images/paintings/buffalo.jpg"
		}],
		"balance": 1
	}, {
		"contract": {
			"address": "0x4bde2ca790416d54187b3ad50eaec0f29a33067b"
		},
		"tokenId": "2",
		"tokenType": "ERC721",
		"title": "Buffalo",
		"description": "It's actually a bison?",
		"timeLastUpdated": "2022-08-01T23:14:43.984Z",
		"rawMetadata": {
			"name": "Buffalo",
			"description": "It's actually a bison?",
			"image": "https://austingriffith.com/images/paintings/buffalo.jpg",
			"external_url": "https://austingriffith.com/portfolio/paintings/",
			"attributes": [{
				"value": "green",
				"trait_type": "BackgroundColor"
			}, {
				"value": "googly",
				"trait_type": "Eyes"
			}, {
				"value": 42,
				"trait_type": "Stamina"
			}]
		},
		"tokenUri": {
			"raw": "https://ipfs.io/ipfs/QmfVMAmNM1kDEBYrC2TPzQDoCRFH6F5tE1e9Mr4FkkR5Xr",
			"gateway": "https://ipfs.io/ipfs/QmfVMAmNM1kDEBYrC2TPzQDoCRFH6F5tE1e9Mr4FkkR5Xr"
		},
		"media": [{
			"raw": "https://austingriffith.com/images/paintings/buffalo.jpg",
			"gateway": "https://austingriffith.com/images/paintings/buffalo.jpg"
		}],
		"balance": 1
	}, {
		"contract": {
			"address": "0x4bde2ca790416d54187b3ad50eaec0f29a33067b"
		},
		"tokenId": "3",
		"tokenType": "ERC721",
		"title": "Zebra",
		"description": "What is it so worried about?",
		"timeLastUpdated": "2022-09-16T19:06:01.512Z",
		"rawMetadata": {
			"name": "Zebra",
			"description": "What is it so worried about?",
			"image": "https://austingriffith.com/images/paintings/zebra.jpg",
			"external_url": "https://austingriffith.com/portfolio/paintings/",
			"attributes": [{
				"value": "blue",
				"trait_type": "BackgroundColor"
			}, {
				"value": "googly",
				"trait_type": "Eyes"
			}, {
				"value": 38,
				"trait_type": "Stamina"
			}]
		},
		"tokenUri": {
			"raw": "https://ipfs.io/ipfs/QmVHi3c4qkZcH3cJynzDXRm5n7dzc9R9TUtUcfnWQvhdcw",
			"gateway": "https://ipfs.io/ipfs/QmVHi3c4qkZcH3cJynzDXRm5n7dzc9R9TUtUcfnWQvhdcw"
		},
		"media": [{
			"raw": "https://austingriffith.com/images/paintings/zebra.jpg",
			"gateway": "https://austingriffith.com/images/paintings/zebra.jpg"
		}],
		"balance": 1
	}, {
		"contract": {
			"address": "0x4bde2ca790416d54187b3ad50eaec0f29a33067b"
		},
		"tokenId": "4",
		"tokenType": "ERC721",
		"title": "Rhino",
		"description": "What a horn!",
		"timeLastUpdated": "2022-09-16T19:06:01.507Z",
		"rawMetadata": {
			"name": "Rhino",
			"description": "What a horn!",
			"image": "https://austingriffith.com/images/paintings/rhino.jpg",
			"external_url": "https://austingriffith.com/portfolio/paintings/",
			"attributes": [{
				"value": "pink",
				"trait_type": "BackgroundColor"
			}, {
				"value": "googly",
				"trait_type": "Eyes"
			}, {
				"value": 22,
				"trait_type": "Stamina"
			}]
		},
		"tokenUri": {
			"raw": "https://ipfs.io/ipfs/QmcvcUaKf6JyCXhLD1by6hJXNruPQGs3kkLg2W1xr7nF1j",
			"gateway": "https://ipfs.io/ipfs/QmcvcUaKf6JyCXhLD1by6hJXNruPQGs3kkLg2W1xr7nF1j"
		},
		"media": [{
			"raw": "https://austingriffith.com/images/paintings/rhino.jpg",
			"gateway": "https://austingriffith.com/images/paintings/rhino.jpg"
		}],
		"balance": 1
	}, {
		"contract": {
			"address": "0x4bde2ca790416d54187b3ad50eaec0f29a33067b"
		},
		"tokenId": "5",
		"tokenType": "ERC721",
		"title": "Fish",
		"description": "Is that an underbyte?",
		"timeLastUpdated": "2022-09-16T19:06:01.515Z",
		"rawMetadata": {
			"name": "Fish",
			"description": "Is that an underbyte?",
			"image": "https://austingriffith.com/images/paintings/fish.jpg",
			"external_url": "https://austingriffith.com/portfolio/paintings/",
			"attributes": [{
				"value": "blue",
				"trait_type": "BackgroundColor"
			}, {
				"value": "googly",
				"trait_type": "Eyes"
			}, {
				"value": 15,
				"trait_type": "Stamina"
			}]
		},
		"tokenUri": {
			"raw": "https://ipfs.io/ipfs/QmZUaKqR7Sd2iJHABbRmAN94nKqEjjj9GdM1LR66UDKUhe",
			"gateway": "https://ipfs.io/ipfs/QmZUaKqR7Sd2iJHABbRmAN94nKqEjjj9GdM1LR66UDKUhe"
		},
		"media": [{
			"raw": "https://austingriffith.com/images/paintings/fish.jpg",
			"gateway": "https://austingriffith.com/images/paintings/fish.jpg"
		}],
		"balance": 1
	}, {
		"contract": {
			"address": "0x4bde2ca790416d54187b3ad50eaec0f29a33067b"
		},
		"tokenId": "6",
		"tokenType": "ERC721",
		"title": "Flamingo",
		"description": "So delicate.",
		"timeLastUpdated": "2022-08-01T23:14:43.981Z",
		"rawMetadata": {
			"name": "Flamingo",
			"description": "So delicate.",
			"image": "https://austingriffith.com/images/paintings/flamingo.jpg",
			"external_url": "https://austingriffith.com/portfolio/paintings/",
			"attributes": [{
				"value": "black",
				"trait_type": "BackgroundColor"
			}, {
				"value": "googly",
				"trait_type": "Eyes"
			}, {
				"value": 6,
				"trait_type": "Stamina"
			}]
		},
		"tokenUri": {
			"raw": "https://ipfs.io/ipfs/QmW95YgCMVFSfA4G6tNP86BnkTBVkQBY6bUYYb8Cqtpr6m",
			"gateway": "https://ipfs.io/ipfs/QmW95YgCMVFSfA4G6tNP86BnkTBVkQBY6bUYYb8Cqtpr6m"
		},
		"media": [{
			"raw": "https://austingriffith.com/images/paintings/flamingo.jpg",
			"gateway": "https://austingriffith.com/images/paintings/flamingo.jpg"
		}],
		"balance": 1
	}, {
		"contract": {
			"address": "0x4db9bddbe9f271135028890543a9c35a58c97255"
		},
		"tokenId": "0",
		"tokenType": "ERC721",
		"title": "3id",
		"description": "3id PFP for 0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52",
		"timeLastUpdated": "2022-09-16T19:06:01.503Z",
		"rawMetadata": {
			"name": "3id",
			"description": "3id PFP for 0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52",
			"image": "ipfs://bafybeihtahy2nm4i3t2yj5btjq2khvunqv537nbwxxave2xodkyyte27xi/threeid.png",
			"properties": {
				"blockchain": {
					"name": "ethereum",
					"chainId": 5
				},
				"account": "0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52",
				"traits": {
					"trait2": {
						"type": "COMMON",
						"value": {
							"name": "Cocoa",
							"rgb": {
								"r": 139,
								"b": 125,
								"g": 125
							},
							"rnd": [0.39179299653685074, 0.7569213887189279, 0.6833970600170927, 0.23456410469014077, 0.09226268780496683, 0.3521594338633953]
						}
					},
					"trait3": {
						"type": "COMMON",
						"value": {
							"name": "Azure Blue",
							"rgb": {
								"r": 120,
								"b": 145,
								"g": 137
							},
							"rnd": [0.4116369657435073, 0.6019013716435797, 0.7110889281587591, 0.4699610864346462, 0.8782044866035736, 0.57065904631536]
						}
					},
					"trait0": {
						"type": "GEN",
						"value": {
							"name": "Mint Green (V0)",
							"rgb": {
								"r": 45,
								"b": 277,
								"g": 74
							},
							"rnd": [0.2472423882406296, 0.8121251774204337, 0.07893918668749822, 0.675348575783554, 0.40877113512325103, 0.8557530787445364]
						}
					},
					"trait1": {
						"type": "COMMON",
						"value": {
							"name": "Azure Blue",
							"rgb": {
								"r": 120,
								"b": 145,
								"g": 137
							},
							"rnd": [0.015518985832038812, 0.8259235674131078, 0.8993661658205623, 0.904993513131297, 0.8033920285422669, 0.45534436339194206]
						}
					}
				}
			}
		},
		"tokenUri": {
			"raw": "ipfs://bafyreicz6dnxx7o4teihqlk637lx2iwfy7ffh45cozlmoz7zoiuctr3b5y/metadata.json",
			"gateway": "https://ipfs.io/ipfs/bafyreicz6dnxx7o4teihqlk637lx2iwfy7ffh45cozlmoz7zoiuctr3b5y/metadata.json"
		},
		"media": [{
			"raw": "ipfs://bafybeihtahy2nm4i3t2yj5btjq2khvunqv537nbwxxave2xodkyyte27xi/threeid.png",
			"gateway": "https://ipfs.io/ipfs/bafybeihtahy2nm4i3t2yj5btjq2khvunqv537nbwxxave2xodkyyte27xi/threeid.png"
		}],
		"balance": 1
	}, {
		"contract": {
			"address": "0x90f3afee6a835bbe996ab5546d0c7f7a9611ad2f"
		},
		"tokenId": "36",
		"tokenType": "ERC721",
		"title": "3ID Invite #0036",
		"description": "Gen Zero 3ID Invite",
		"timeLastUpdated": "2022-09-16T19:06:01.981Z",
		"rawMetadata": {
			"name": "3ID Invite #0036",
			"description": "Gen Zero 3ID Invite",
			"image": "ipfs://bafybeibk7lhphosybw27okq4bqe7hi7sbs52wsasrmqpuh477rwbvluzea/invite-0036.svg",
			"properties": {
				"issueDate": "8/29/2022",
				"inviteId": "0036",
				"inviteTier": "Gen Zero"
			}
		},
		"tokenUri": {
			"raw": "ipfs://bafyreieveyzx467pl2gj5p6jf36f67azncs5fryi4fkqnl4kq4rdhggl24/metadata.json",
			"gateway": "https://ipfs.io/ipfs/bafyreieveyzx467pl2gj5p6jf36f67azncs5fryi4fkqnl4kq4rdhggl24/metadata.json"
		},
		"media": [{
			"raw": "ipfs://bafybeibk7lhphosybw27okq4bqe7hi7sbs52wsasrmqpuh477rwbvluzea/invite-0036.svg",
			"gateway": "https://ipfs.io/ipfs/bafybeibk7lhphosybw27okq4bqe7hi7sbs52wsasrmqpuh477rwbvluzea/invite-0036.svg"
		}],
		"balance": 1
	}, {
		"contract": {
			"address": "0x980147d3da0db97edc7094bc49241bbb45b89409"
		},
		"tokenId": "0",
		"tokenType": "ERC721",
		"title": "3id",
		"description": "3id PFP for 0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52",
		"timeLastUpdated": "2022-09-12T14:49:59.236Z",
		"rawMetadata": {
			"name": "3id",
			"description": "3id PFP for 0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52",
			"image": "ipfs://bafybeibednl2ttpnsqxlktl6jbthn3nbf2expcz3p6mdi4tqqklbsliksa/threeid.png",
			"properties": {
				"blockchain": {
					"name": "ethereum",
					"chainId": 5
				},
				"account": "0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52",
				"traits": {
					"trait2": {
						"type": "UNCOMMON",
						"value": {
							"name": "Ocean Blue",
							"rgb": {
								"r": 98,
								"b": 189,
								"g": 115
							},
							"rnd": [0.7065230908088378, 0.8755071659996614, 0.5274302754443148, 0.5591815598347769, 0.5633853190105316, 0.5802165919842277]
						}
					},
					"trait3": {
						"type": "COMMON",
						"value": {
							"name": "Lavender Gray",
							"rgb": {
								"r": 117,
								"b": 151,
								"g": 115
							},
							"rnd": [0.9779903883727998, 0.7064467491818933, 0.8081929089416784, 0.24999419123134503, 0.2095830164569641, 0.07294465273321338]
						}
					},
					"trait0": {
						"type": "GEN",
						"value": {
							"name": "Mint Green (V0)",
							"rgb": {
								"r": 45,
								"b": 277,
								"g": 74
							},
							"rnd": [0.7437835478647827, 0.28485807269697716, 0.9407372504078853, 0.7851287651687047, 0.40357200777083646, 0.3177678580234471]
						}
					},
					"trait1": {
						"type": "UNCOMMON",
						"value": {
							"name": "Beryl Green",
							"rgb": {
								"r": 208,
								"b": 177,
								"g": 242
							},
							"rnd": [0.8126481650413921, 0.7649932217433826, 0.7748174469548645, 0.6423923531531741, 0.7925366949241557, 0.24339488934387377]
						}
					}
				}
			}
		},
		"tokenUri": {
			"raw": "ipfs://bafyreifjb5z26e6skpnt2owanigzihv5uzpc4eyahgxkmdsdslm5rxvhle/metadata.json",
			"gateway": "https://ipfs.io/ipfs/bafyreifjb5z26e6skpnt2owanigzihv5uzpc4eyahgxkmdsdslm5rxvhle/metadata.json"
		},
		"media": [{
			"raw": "ipfs://bafybeibednl2ttpnsqxlktl6jbthn3nbf2expcz3p6mdi4tqqklbsliksa/threeid.png",
			"gateway": "https://ipfs.io/ipfs/bafybeibednl2ttpnsqxlktl6jbthn3nbf2expcz3p6mdi4tqqklbsliksa/threeid.png"
		}],
		"balance": 1
	}, {
		"contract": {
			"address": "0xb612ec36a3ae278b82d8870a56e47dc1a0af40ea"
		},
		"tokenId": "0",
		"tokenType": "ERC721",
		"title": "3iD invite #0000",
		"description": "Gold-tier invitation to threeid.xyz",
		"timeLastUpdated": "2022-08-18T20:05:23.874Z",
		"rawMetadata": {
			"name": "3iD invite #0000",
			"description": "Gold-tier invitation to threeid.xyz",
			"image": "ipfs://bafybeiasz55ht3gsoncilov5xvuqcnsmru6zyegvpfszifkqoysuw3izbi/invite-0000.svg",
			"properties": {
				"issueDate": "2022-08-05",
				"inviteId": "0000",
				"inviteTier": "gold"
			}
		},
		"tokenUri": {
			"raw": "ipfs://bafyreidlagfdld5qozkgsvtwe4ix62vp5zihtrmyrdgpzw6rsujvxtw2gu/metadata.json",
			"gateway": "https://ipfs.io/ipfs/bafyreidlagfdld5qozkgsvtwe4ix62vp5zihtrmyrdgpzw6rsujvxtw2gu/metadata.json"
		},
		"media": [{
			"raw": "ipfs://bafybeiasz55ht3gsoncilov5xvuqcnsmru6zyegvpfszifkqoysuw3izbi/invite-0000.svg",
			"gateway": "https://ipfs.io/ipfs/bafybeiasz55ht3gsoncilov5xvuqcnsmru6zyegvpfszifkqoysuw3izbi/invite-0000.svg"
		}],
		"balance": 1
	}, {
		"contract": {
			"address": "0xcd0d3cabb835429dbbcc2ed876b604906cc3234a"
		},
		"tokenId": "0",
		"tokenType": "UNKNOWN",
		"title": "",
		"description": "",
		"timeLastUpdated": "2022-09-23T14:25:32.480Z",
		"metadataError": "Contract does not have any code",
		"rawMetadata": {},
		"media": [],
		"balance": 1
	}, {
		"contract": {
			"address": "0xf8496fe24cdeb4b769e5a617b3a6159a031446d2"
		},
		"tokenId": "1",
		"tokenType": "ERC721",
		"title": "3ID Invite #0001",
		"description": "Gen Zero 3ID Invite",
		"timeLastUpdated": "2022-08-19T14:30:28.387Z",
		"rawMetadata": {
			"name": "3ID Invite #0001",
			"description": "Gen Zero 3ID Invite",
			"image": "ipfs://bafybeidahdrha6ct2ammm37jnykqtbw4aacgmbz4r4f5xgtwarldfhgrhq/invite-0001.svg",
			"properties": {
				"issueDate": "8/18/2022",
				"inviteId": "0001",
				"inviteTier": "Gen Zero"
			}
		},
		"tokenUri": {
			"raw": "ipfs://bafyreigxtjqd3x72ljwxtkdaamwohyj3chi23db5swg3oa7m2gdvqgnqhi/metadata.json",
			"gateway": "https://ipfs.io/ipfs/bafyreigxtjqd3x72ljwxtkdaamwohyj3chi23db5swg3oa7m2gdvqgnqhi/metadata.json"
		},
		"media": [{
			"raw": "ipfs://bafybeidahdrha6ct2ammm37jnykqtbw4aacgmbz4r4f5xgtwarldfhgrhq/invite-0001.svg",
			"gateway": "https://ipfs.io/ipfs/bafybeidahdrha6ct2ammm37jnykqtbw4aacgmbz4r4f5xgtwarldfhgrhq/invite-0001.svg"
		}],
		"balance": 1
	}, {
		"contract": {
			"address": "0xf8496fe24cdeb4b769e5a617b3a6159a031446d2"
		},
		"tokenId": "2",
		"tokenType": "ERC721",
		"title": "3ID Invite #0002",
		"description": "Gen Zero 3ID Invite",
		"timeLastUpdated": "2022-09-16T19:06:02.415Z",
		"rawMetadata": {
			"name": "3ID Invite #0002",
			"description": "Gen Zero 3ID Invite",
			"image": "ipfs://bafybeib7pgtuln33iw2zikyy5j264szvuc6gjbt2zdhlndavvlxajr57oi/invite-0002.svg",
			"properties": {
				"issueDate": "8/18/2022",
				"inviteId": "0002",
				"inviteTier": "Gen Zero"
			}
		},
		"tokenUri": {
			"raw": "ipfs://bafyreihkhldejishwavsq2gss4kg3yo4tszyjy3qslvkuzy3rvdqcm5yqa/metadata.json",
			"gateway": "https://ipfs.io/ipfs/bafyreihkhldejishwavsq2gss4kg3yo4tszyjy3qslvkuzy3rvdqcm5yqa/metadata.json"
		},
		"media": [{
			"raw": "ipfs://bafybeib7pgtuln33iw2zikyy5j264szvuc6gjbt2zdhlndavvlxajr57oi/invite-0002.svg",
			"gateway": "https://ipfs.io/ipfs/bafybeib7pgtuln33iw2zikyy5j264szvuc6gjbt2zdhlndavvlxajr57oi/invite-0002.svg"
		}],
		"balance": 1
	}, {
		"contract": {
			"address": "0xf8496fe24cdeb4b769e5a617b3a6159a031446d2"
		},
		"tokenId": "6",
		"tokenType": "ERC721",
		"title": "3ID Invite #0006",
		"description": "Gen Zero 3ID Invite",
		"timeLastUpdated": "2022-09-07T16:19:35.225Z",
		"rawMetadata": {
			"name": "3ID Invite #0006",
			"description": "Gen Zero 3ID Invite",
			"image": "ipfs://bafybeihq22itfejizarbd3mqpbhcbp6fzsfwkc2x3zvojio3dfewt6s4fm/invite-0006.svg",
			"properties": {
				"issueDate": "8/19/2022",
				"inviteId": "0006",
				"inviteTier": "Gen Zero"
			}
		},
		"tokenUri": {
			"raw": "ipfs://bafyreib5ggqh7dodnggp3e7smp45ikzsiknguqwcw6xymbkrx47wdm2yvi/metadata.json",
			"gateway": "https://ipfs.io/ipfs/bafyreib5ggqh7dodnggp3e7smp45ikzsiknguqwcw6xymbkrx47wdm2yvi/metadata.json"
		},
		"media": [{
			"raw": "ipfs:2022-09-23T14:25:32.586048600Z //bafybeihq22itfejizarbd3mqpbhcbp6fzsfwkc2x3zvojio3dfewt6s4fm/invite-0006.svg",
			"gateway": "https://ipfs.io/ipfs/bafybeihq22itfejizarbd3mqpbhcbp6fzsfwkc2x3zvojio3dfewt6s4fm/invite-0006.svg"
		}],
		"balance": 1
	}],
	"totalCount": 16
};

describe('Utilities', () => {

  test('isPFPOwner null tests', () => {
    const NOT_A_CONTRACT_ADDRESS = '0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52';
    let result = utils.isPFPOwner();
    expect(result).toStrictEqual(false);
    result = utils.isPFPOwner(ALCHEMY_NFTS_FIXTURE.ownedNfts);
    expect(result).toStrictEqual(false);
    result = utils.isPFPOwner(ALCHEMY_NFTS_FIXTURE.ownedNfts, NOT_A_CONTRACT_ADDRESS);
    expect(result).toStrictEqual(false);
  });

  test('isPFPOwner falsy test', () => {
    const NOT_A_CONTRACT_ADDRESS = '0x3DaC36FE079e311489c6cF5CC456a6f38FE01A52';
    let result = utils.isPFPOwner(ALCHEMY_NFTS_FIXTURE.ownedNfts, NOT_A_CONTRACT_ADDRESS);
    expect(result).toStrictEqual(false);
  });

  test('isPFPOwner truthy test', () => {
    const IS_A_CONTRACT_ADDRESS = '0xf8496fe24cdeb4b769e5a617b3a6159a031446d2';
    let result = utils.isPFPOwner(ALCHEMY_NFTS_FIXTURE.ownedNfts, IS_A_CONTRACT_ADDRESS);
    expect(result).toStrictEqual(true);
  });

  test('calculateNFTWeight null test', () => {
    const nfts = new Map();
    const result = utils.calculateNFTWeight(nfts);
    expect(result).toStrictEqual({"COMMON": 0, "EPIC": 0, "RARE": 0, "UNCOMMON": 0});
  });

  test('calculateNFTWeight BAYC test', () => {
    const nfts = new Map();
    for (const index in ALCHEMY_NFTS_FIXTURE.ownedNfts) {
      nfts.set(index, ALCHEMY_NFTS_FIXTURE.ownedNfts[index]);
    }
    nfts.set(nfts.size, {
      contract: { address: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D" },
      name: "Bored Ape Yacht Club",
      kind: "EPIC",
      value: 2,
    });
    const result = utils.calculateNFTWeight(nfts);
    expect(result).toStrictEqual({"COMMON": 0, "EPIC": 2, "RARE": 0, "UNCOMMON": 0});
  });

  test('calculateSpecialWeight null test', () => {
    const nfts = new Map();
    const result = utils.calculateSpecialWeight(nfts);
    expect(result).toStrictEqual({"COMMON": 0, "EPIC": 0, "RARE": 0, "UNCOMMON": 0});
  });

  test('calculateSpecialWeight invite test', () => {
    const nfts = new Map();
    for (const index in ALCHEMY_NFTS_FIXTURE.ownedNfts) {
      nfts.set(index, ALCHEMY_NFTS_FIXTURE.ownedNfts[index]);
    }
    nfts.set(nfts.size, {
      contract: { address: "0x92cE069c08e39bcA867d45d2Bdc4eBE94e28321a" },
      name: "3ID Invite",
      kind: "EPIC",
      value: 2,
    });
    const result = utils.calculateSpecialWeight(nfts);
    expect(result).toStrictEqual({"COMMON": 0, "EPIC": 2, "RARE": 0, "UNCOMMON": 0});
  });

  test('calculateBalanceWeight full test', () => {
    const nfts = new Map();
    for (const index in ALCHEMY_NFTS_FIXTURE.ownedNfts) {
      nfts.set(index, ALCHEMY_NFTS_FIXTURE.ownedNfts[index]);
    }
    nfts.set(nfts.size, {
      contract: { address: "0x92cE069c08e39bcA867d45d2Bdc4eBE94e28321a" },
      name: "3ID Invite",
      kind: "EPIC",
      value: 2,
    });
    expect(utils.calculateBalanceWeight(0)).toStrictEqual({"COMMON": 0, "EPIC": 0, "RARE": 0, "UNCOMMON": 0});
    expect(utils.calculateBalanceWeight(2)).toStrictEqual({"COMMON": 0, "EPIC": 0, "RARE": 0, "UNCOMMON": 1});
    expect(utils.calculateBalanceWeight(11)).toStrictEqual({"COMMON": 0, "EPIC": 0, "RARE": 1, "UNCOMMON": 0});
    expect(utils.calculateBalanceWeight(101)).toStrictEqual({"COMMON": 0, "EPIC": 1, "RARE": 0, "UNCOMMON": 0});
  });

  test('EPIC traits do not underflow', () => {
    expect(() => {
      // We take out all of the weights, leaving only EPIC: 2. We then draw
      // three traits, which would underflow the list of two EPIC traits
      // without the new _default parameter.
      utils.generateTraits({
        trait1: {
          COMMON: -100,
          UNCOMMON: -50,
          RARE: -25,
          EPIC: 0,
        },
        trait2: {
          COMMON: -100,
          UNCOMMON: -50,
          RARE: -25,
          EPIC: 0,
        },
        trait3: {
          COMMON: -100,
          UNCOMMON: -50,
          RARE: -25,
          EPIC: 0,
        },
      });
    }).not.toThrow();
  });
});