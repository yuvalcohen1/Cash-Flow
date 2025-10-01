import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { JWTPayload } from "../interfaces/Jwt.interface";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = Number(process.env.JWT_EXPIRES_IN) || 604_800;

const options: SignOptions = {
  expiresIn: JWT_EXPIRES_IN, // 7 days in seconds
};

export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, options);
};
