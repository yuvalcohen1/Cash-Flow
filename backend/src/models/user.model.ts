import { query } from "../database";
import { User } from "../interfaces/User.interfaace";

export const createUser = async (
  name: string,
  email: string,
  passwordHash: string
): Promise<User> => {
  // Let PostgreSQL generate the UUID using gen_random_uuid()
  const result = await query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, email, passwordHash]
  );

  return result.rows[0];
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const result = await query(`SELECT * FROM users WHERE email = $1`, [email]);

  return result.rows[0] || null;
};

export const getUserById = async (id: string): Promise<User | null> => {
  const result = await query(`SELECT * FROM users WHERE id = $1`, [id]);

  return result.rows[0] || null;
};
