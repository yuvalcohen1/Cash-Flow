import { Request, Response, Router } from "express";
import { body, validationResult } from "express-validator";
import {
  validateLogin,
  validateRegister,
} from "../middlewares/validation.middleware";
import { createUser, getUserByEmail, getUserById } from "../models/user.model";
import {
  comparePassword,
  hashPassword,
} from "../middlewares/password.middleware";
import { generateToken } from "../middlewares/jwt.middleware";
import { authenticateToken } from "../middlewares/auth.middleware";
import { AuthRequest } from "../interfaces/AuthRequest.interface";

const router = Router();

// POST /auth/register
router.post(
  "/register",
  validateRegister,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(400)
          .json({ error: "Validation failed", details: errors.array() });
        return;
      }

      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = getUserByEmail(email);
      if (existingUser) {
        res.status(409).json({ error: "User with this email already exists" });
        return;
      }

      // Hash password and create user
      const passwordHash = await hashPassword(password);
      const user = createUser(name, email, passwordHash);

      // Generate JWT token
      const token = generateToken({ userId: user.id, email: user.email });

      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at,
        },
        token,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /auth/login
router.post(
  "/login",
  validateLogin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res
          .status(400)
          .json({ error: "Validation failed", details: errors.array() });
        return;
      }

      const { email, password } = req.body;

      // Find user
      const user = getUserByEmail(email);
      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Verify password
      const isValidPassword = await comparePassword(
        password,
        user.password_hash
      );
      if (!isValidPassword) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Generate JWT token
      const token = generateToken({ userId: user.id, email: user.email });

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at,
        },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /auth/logout
router.post(
  "/logout",
  authenticateToken,
  (req: AuthRequest, res: Response): void => {
    // With JWTs, logout is typically handled client-side by removing the token
    // However, this endpoint can be useful for:
    // 1. Logging logout events
    // 2. Token blacklisting (if implemented)
    // 3. Clearing server-side sessions (if used alongside JWTs)

    try {
      // Optional: Log the logout event
      console.log(`User ${req.user!.id} (${req.user!.email}) logged out`);

      // Optional: Add token to blacklist (requires additional implementation)
      // blacklistToken(req.headers['authorization']?.split(' ')[1]);

      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// GET /auth/me
router.get(
  "/me",
  authenticateToken,
  (req: AuthRequest, res: Response): void => {
    try {
      const user = getUserById(req.user!.id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at,
        },
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /auth/refresh
router.post(
  "/refresh",
  authenticateToken,
  (req: AuthRequest, res: Response): void => {
    try {
      const token = generateToken({
        userId: req.user!.id,
        email: req.user!.email,
      });
      res.json({ token });
    } catch (error) {
      console.error("Token refresh error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
