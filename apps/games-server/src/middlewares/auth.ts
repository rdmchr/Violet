import verifyUser from "../utils/verifyUser";
import express from "express";

const authMiddleware = async function (req: express.Request, res: express.Response, next: express.NextFunction) {
    const token = req.headers.token as string;
    const user = await verifyUser(token);
    if (!user) {
        res.status(401).send('Not authorized');
        return;
    }
    req.user = user;
    next();
}

export default authMiddleware;