import { pool } from "../../config/db";

const getAllUsers = async () => {
  const result = await pool.query(`SELECT * FROM users`);

  // Remove password from each user
  const users = result.rows.map(user => {
    const { password, ...rest } = user; 
    return rest;
  });

  return users;
};

const getSingle = async(id: string)=>{
     const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id,]);
    delete result.rows[0].password
    return result;
}


const updateUser = async (
  name?: string,
  email?: string,
  phone?: string,
  role?: string,
  id?: string
) => {
  if (!id) throw new Error("User ID is required");

  const fields: string[] = [];
  const values: any[] = [];
  let index = 1;

  if (name) {
    fields.push(`name=$${index++}`);
    values.push(name);
  }
  if (email) {
    fields.push(`email=$${index++}`);
    values.push(email);
  }
  if (phone) {
    fields.push(`phone=$${index++}`);
    values.push(phone);
  }
  if (role) {
    fields.push(`role=$${index++}`);
    values.push(role);
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }


  values.push(id); 

  const result = await pool.query(`UPDATE users SET ${fields.join(", ")} WHERE id=$${index} RETURNING *`, values);

  if (result.rows.length) delete result.rows[0].password;

  return result;
};



const deleteUser = async (id: string) => {
  const activeBooking = await pool.query(
    `SELECT id FROM bookings WHERE customer_id = $1 AND status = 'active'`,
    [id]
  );
  if (activeBooking.rows.length > 0) {
    throw new Error("User cannot be deleted because they have active bookings");
  }
  const result = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING *`, [id]);

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  return result.rows[0];
};

export const userService = {
  getAllUsers,
  getSingle,
  updateUser,
  deleteUser,
};
