import { pool } from "../../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../config";

const createUser = async(payload: Record<string, unknown>) =>{
 const {name, email, password, phone, role} = payload;

 const hashPassword = await bcrypt.hash(password as string, 10);
 const result = await pool.query(`INSERT INTO users(name, email, password, phone, role) VALUES($1, $2, $3, $4, $5) RETURNING *`, [name, email,hashPassword, phone, role]);

  delete result.rows[0].password
  return result;

}

const loginUser = async(email: string, password: string)=>{
   
const result = await pool.query(`SELECT * FROM users WHERE email=$1`, [
    email,
  ]);

  if (result.rows.length === 0) {
  throw new Error("User not found!");
  }

const user = result.rows[0];

const matchPassword = await bcrypt.compare(password, user.password);
if(!matchPassword){
  return 'Invalid credentials'
}

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role : user.role,
  };
 
  const token = jwt.sign(jwtPayload, config.jwtSecret as string, {expiresIn: "7d"})

  delete user.password;
  return {token: `Bearer ${token}`, user}
}

export const authService = {
  createUser,
 loginUser,
}