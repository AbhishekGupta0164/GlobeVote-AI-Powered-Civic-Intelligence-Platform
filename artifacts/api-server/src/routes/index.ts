import { Router, type IRouter } from "express";
import healthRouter from "./health";
import countriesRouter from "./countries";
import electionsRouter from "./elections";
import electoralSystemsRouter from "./electoral_systems";
import chatRouter from "./chat";
import quizRouter from "./quiz";
import claimsRouter from "./claims";
import newsRouter from "./news";
import progressRouter from "./progress";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(countriesRouter);
router.use(electionsRouter);
router.use(electoralSystemsRouter);
router.use(chatRouter);
router.use(quizRouter);
router.use(claimsRouter);
router.use(newsRouter);
router.use(progressRouter);
router.use(statsRouter);

export default router;
