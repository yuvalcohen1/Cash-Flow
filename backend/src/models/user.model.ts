import db from "../database";
import { User } from "../interfaces/User.interfaace";

export const getUserByEmail = (email: string): User | undefined => {
  const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
  return stmt.get(email) as User | undefined;
};

export const getUserById = (id: number): User | undefined => {
  const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
  return stmt.get(id) as User | undefined;
};

export const createUser = (
  name: string,
  email: string,
  passwordHash: string
): User => {
  const stmt = db.prepare(`
    INSERT INTO users (name, email, password_hash)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(name, email, passwordHash);
  return getUserById(result.lastInsertRowid as number)!;
};
