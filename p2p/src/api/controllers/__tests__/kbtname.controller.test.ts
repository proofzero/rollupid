import request from "supertest";

import app from "../../../app";

beforeAll(() => {});

//TODO: set key to random value, check random value is returned 

describe("kbt Controller", () => {
	it("should update kbt key/value ", async () => {
		const res = await request(app).get("/updatekbt/deadbeef/reddit.com");
		expect(res.status).toEqual(200);
	});

	it("should get kbt name by kbtid", async () => {
		const res = await request(app).get("/kbt/deadbeef");
		expect(res.status).toEqual(200);
	});

});
