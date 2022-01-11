import express from "express";
import { getNameByKbtId, saveNameByKbtId} from "./controllers";

const router: express.Router = express.Router();

router.get("/updatekbt/:kbtid/:kbturl", saveNameByKbtId);
router.get("/kbt/:kbtid", getNameByKbtId);

export default router;
