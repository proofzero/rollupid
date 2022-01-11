import { Request, Response } from "express";
import { param, validationResult } from "express-validator";

var Hypercore = require('hypercore')
var feed = new Hypercore('./my-first-dataset', {valueEncoding: 'utf-8'})

const Hyperbee = require('hyperbee')
const db = new Hyperbee(feed, {
	  keyEncoding: 'utf-8', // can be set to undefined (binary), utf-8, ascii or and abstract-encoding
	  valueEncoding: 'binary' // same options as above
})

export const saveNameByKbtId = async (req: Request, res: Response) => {

	//TODO: add authentication, verification that you own the key via keypair signature 
	//TODO: validate key format 
	
	
	const kbtId : string = req.params.kbtid;
	const kbtEndpoint : string = req.params.kbturl;

	await db.put(kbtId, kbtEndpoint)

	res.status(200).json({ success: true, params: req.params});
};


export const getNameByKbtId = async (req: Request, res: Response) => {

	const kbtId : string = req.params.kbtid;
	
	const node = await db.get(kbtId) 

	console.log(node) 
	res.status(200).json({ success: true, result: node.value.toString(), params: kbtId});
};

