import request from "supertest";
import app from "../../../app";
const fs = require('fs');
const jwt = require('jsonwebtoken');

beforeAll(() => {});

//TODO: set key to random value, check random value is returned 

describe("kbt Controller", () => {

	//TODO: generate and send JWT with save request. verify endpoint is hash of pubkey
	// implementation of JWT logic below

	// store and get valid data
	it("should update kbt key/value ", async () => {
		const res = await request(app).get("/updatekbt/deadbeef/reddit.com");
		expect(res.status).toEqual(200);
	});

	it("should get kbt name by kbtid", async () => {
		const res = await request(app).get("/kbt/deadbeef");
		expect(res.status).toEqual(200);
	});


	// check for bad input
	it("should not update kbt key/value ", async () => {
		const res = await request(app).get("/updatekbt/deadbeefzz/reddit.com");
		expect(res.status).toEqual(500);
	});

	it("should provide 500 error for bad hex in kbt name ", async () => {
		const res = await request(app).get("/kbt/deadbeefzzz");
		expect(res.status).toEqual(500);
	});


	it("should create and validate jwt ", async () => {
		//TODO: check for case sensitivity

		// JWT reference

		var privateKEY  = fs.readFileSync('./test/private.key', 'utf8');
		var publicKEY  = fs.readFileSync('./test/public.key', 'utf8');
		var payload = {
			kbt: 'deadbeef',
			dest: 'bafyx0x0x0x0x0',
			pubkey: publicKEY
		};
		var i  = 'Mysoft corp';   
		var s  = 'some@user.com';   
		var a  = 'http://mysoftcorp.in';
		var signOptions = {
			issuer:  i,
			subject:  s,
			audience:  a,
			expiresIn:  "12h",
			algorithm:  "RS256"   // RSASSA [ "RS256", "RS384", "RS512" ]
		};
		var token = jwt.sign(payload, privateKEY, signOptions);
		//console.log("Token :" + token);
		/*
		 *  ====================   JWT Verify =====================
		 *  */
		var verifyOptions = {
			issuer:  i,
			subject:  s,
			audience:  a,
			expiresIn:  "12h",
			algorithm:  ["RS256"]
		};

		try {
			// extract the public key from the payload and use it to verify
			var decoded = jwt.decode(token);
			var extractedPK = decoded.pubkey;

			try {
				var notlegit = jwt.verify(token, "badkey", verifyOptions);
			} catch {
				// should have failed
				expect(true).toEqual(true);
			}

			var legit = jwt.verify(token, extractedPK, verifyOptions);
			//console.log("\nJWT verification result: " + JSON.stringify(legit));

			expect(legit.kbt).toEqual('deadbeef');

		} catch {
			// error
			expect(true).toEqual(false);
		}
	});
});
