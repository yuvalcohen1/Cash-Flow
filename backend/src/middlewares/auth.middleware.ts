import { Response, Request, NextFunction } from "express";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { AuthRequest } from "../interfaces/AuthRequest.interface";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "your-secret-key";

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    const payload = decoded as JwtPayload;
    req.user = { id: payload.userId, email: payload.email };
    next();
  });
};
