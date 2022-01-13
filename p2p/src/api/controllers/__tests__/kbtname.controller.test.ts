import request from "supertest";
import app from "../../../app";
const fs = require('fs');
const jwt = require('jsonwebtoken');

const { encodeURLSafe, decodeURLSafe } = require('@stablelib/base64')
const sha256 = require('@stablelib/sha256')
beforeAll(() => {});

//TODO: set key to random value, check random value is returned 

// JWT reference

var privateKEY  = fs.readFileSync('./test/private.key', 'utf8');
var publicKEY  = fs.readFileSync('./test/public.key', 'utf8');

var privateKEYbad  = fs.readFileSync('./test/private_bad.key', 'utf8');
var publicKEYbad  = fs.readFileSync('./test/public_bad.key', 'utf8');


var payload = {
	pubkey: publicKEY,
	endpoint: 'bafyx0x0x0x0x0',
	kbtname: encodeURLSafe(sha256.hash(publicKEY)) 
};
var signOptions = {
	expiresIn:  "12h",
	algorithm:  "RS256"   // RSASSA [ "RS256", "RS384", "RS512" ]
};
var token = jwt.sign(payload, privateKEY, signOptions);
var badtoken = jwt.sign(payload, privateKEYbad, signOptions);


describe("kbt Controller", () => {

	//TODO: generate and send JWT with save request. verify endpoint is hash of pubkey
	// implementation of JWT logic below

	// store and get valid data
	it("should update kbt key/value ", async () => {
		const res = await request(app).post('/updatekbt')
			.send({jwt: token})
		//console.log(res.body);
		expect(res.status).toEqual(200);
	});


	// simulate compromised token (mitm) 
	it("should reject update ", async () => {

		const res = await request(app).post('/updatekbt')
			.send({jwt: badtoken})
		//console.log(res.body);
		expect(res.status).toEqual(500);
	});



	it("should get kbt name by kbtid", async () => {
		const res = await request(app).get("/kbt/052k5eDIiFXfWOTk0M_iM6npF_WhKKeP1RcBGO3ghkY=");
		expect(res.status).toEqual(200);
	});
});
