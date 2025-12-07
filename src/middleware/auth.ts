import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";

const auth = (...roles: string[]) =>{
return async(req: Request, res: Response, next: NextFunction)=>{
  try {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

    const jwtToken = token.split(" ")[1];
    const decoded = jwt.verify(jwtToken as string, config.jwtSecret as string) as JwtPayload;
    req.user = decoded;

    console.log(decoded);
    // Role-based access

    if (roles.length && !roles.includes(decoded.role as string)) {
        return res.status(403).json({ error: "Forbidden!!!" });
      }
      next();
  } catch (error: any) {
     res.status(500).json({
        success: false,
        message: error.message,
      });
  }
}
}

export default auth;