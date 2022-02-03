import { Request, Response } from "express";
import { param, validationResult } from "express-validator";

const { encodeURLSafe, decodeURLSafe } = require('@stablelib/base64')

const jwt = require('jsonwebtoken');
var Hypercore = require('hypercore')
var feed = new Hypercore('./my-first-dataset', {valueEncoding: 'utf-8'})

const Hyperbee = require('hyperbee')
const db = new Hyperbee(feed, {
	keyEncoding: 'utf-8', // can be set to undefined (binary), utf-8, ascii or and abstract-encoding
	valueEncoding: 'binary' // same options as above
})

export const postSaveNameByKbtIdNosec = async (req: Request, res: Response) => {

	//TODO: add authentication, verification that you own the key via keypair signature 
	//TODO: validate key format 

	let kbtname : string = ""
	let kbtendpoint : string = ""

	try {
		kbtname = req.body.kbtname
		kbtendpoint = req.body.endpoint
		//console.log("saving " + kbtendpoint + " to name key " + kbtname);
		await db.put(kbtname, kbtendpoint);
		//console.log("\nJWT verification result: " + JSON.stringify(legit));

		res.status(200).json({ success: true, operation: 'save', 'kbtname': kbtname, endpoint: kbtendpoint});
	} catch {
		// error
		//console.log("bad token");
		res.status(500).json({success: false, error: "missing fields"});
	}


};


export const postSaveNameByKbtId = async (req: Request, res: Response) => {

	//TODO: add authentication, verification that you own the key via keypair signature 
	//TODO: validate key format 

	let kbtname : string = ""
	let kbtendpoint : string = ""

	try {
		const token : string = req.body.jwt;
		//console.log(token);
		var verifyOptions = {
			expiresIn:  "12h",
			algorithm:  ["RS256"]
		};

		// extract the public key from the payload and use it to verify
		var decoded = jwt.decode(token);
		var extractedPK = decoded.pubkey;

		var legit = jwt.verify(token, extractedPK, verifyOptions);
		kbtname = legit.kbtname
		kbtendpoint = legit.endpoint
		//console.log("saving " + kbtendpoint + " to name key " + kbtname);
		await db.put(kbtname, kbtendpoint);
		//console.log("\nJWT verification result: " + JSON.stringify(legit));

		res.status(200).json({ success: true, operation: 'save', 'kbtname': kbtname, endpoint: kbtendpoint});
	} catch {
		// error
		//console.log("bad token");
		res.status(500).json({success: false, error: "invalid token"});
	}


};


export const getNameByKbtId = async (req: Request, res: Response) => {

	const kbtId : string = (req.params.kbtid).toString();

	const node = await db.get(kbtId) 
	if(node !== null) {
		//console.log(node) 
		res.status(200).json({ success: true, operation: 'lookup', result: node.value.toString(), params: kbtId});
	} else {
		res.status(500).json({ success: false, error: "invalid kbt name"});
	}
};

function is_hex(str : string) {
	for (const c of str) {
		if ("0123456789ABCDEFabcdef".indexOf(c) === -1) {
			return false;
		}
	}
	return true;
}

