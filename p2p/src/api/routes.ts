import express from "express";
import { getNameByKbtId, postSaveNameByKbtId, postSaveNameByKbtIdNosec} from "./controllers";

const router: express.Router = express.Router();

//router.get("/updatekbt/:kbtid/:kbturl", saveNameByKbtId);
router.post("/updatekbt", postSaveNameByKbtId);
router.post("/updatekbtnosec", postSaveNameByKbtIdNosec);
router.get("/kbt/:kbtid", getNameByKbtId);

export default router;
