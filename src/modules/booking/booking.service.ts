import { pool } from "../../config/db";


const createBooking = async (payload: any) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

  if (!customer_id || !vehicle_id || !rent_start_date || !rent_end_date) {
    throw new Error("All fields are required");
  }

  const vehicleResult = await pool.query(
    `SELECT vehicle_name, daily_rent_price FROM vehicles WHERE id=$1`,
    [vehicle_id]
  );

  if (!vehicleResult || vehicleResult.rows.length === 0) {
    throw new Error("Vehicle not found");
  }

  const vehicle = vehicleResult.rows[0];

  const activeBooking = await pool.query(
    `SELECT * FROM bookings WHERE vehicle_id=$1 AND status='active'`,
    [vehicle_id]
  );

  if (activeBooking.rows.length > 0) {
    throw new Error("Vehicle already has an active booking");
  }

  const start = new Date(rent_start_date);
  const end = new Date(rent_end_date);
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));

  if (diffDays <= 0) throw new Error("End date must be after start date");

  const total_price = diffDays * Number(vehicle.daily_rent_price);


  const bookingResult = await pool.query(
    `INSERT INTO bookings (
      customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status
    ) VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *`,
    [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]
  );

  const booking = bookingResult.rows[0];


  await pool.query(
    `UPDATE vehicles SET availability_status='booked' WHERE id=$1`,
    [vehicle_id]
  );


  return {
    ...booking,
    rent_start_date: booking.rent_start_date.toISOString().split("T")[0],
    rent_end_date: booking.rent_end_date.toISOString().split("T")[0],
    total_price: total_price,
    vehicle: {
      vehicle_name: vehicle.vehicle_name,
      daily_rent_price: Number(vehicle.daily_rent_price),
    },
  };
};


const getBooks = async(user: any)=>{
let result;

  if (user.role === "admin") {
    result = await pool.query(`
      SELECT 
        b.*, 
        u.name AS customer_name, 
        u.email AS customer_email,
        v.vehicle_name,
        v.registration_number
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN vehicles v ON b.vehicle_id = v.id
    `);

    return result.rows.map(b => ({
      id: b.id,
      customer_id: b.customer_id,
      vehicle_id: b.vehicle_id,
      rent_start_date: b.rent_start_date.toISOString().split("T")[0],
      rent_end_date: b.rent_end_date.toISOString().split("T")[0],
      total_price: Number(b.total_price),
      status: b.status,
      customer: {
        name: b.customer_name,
        email: b.customer_email
      },
      vehicle: {
        vehicle_name: b.vehicle_name,
        registration_number: b.registration_number
      }
    }));
  } else {
    result = await pool.query(`
      SELECT 
        b.*, 
        v.vehicle_name,
        v.registration_number,
        v.type
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.customer_id=$1
    `, [user.id]);

    return result.rows.map(b => ({
      id: b.id,
      vehicle_id: b.vehicle_id,
      rent_start_date: b.rent_start_date.toISOString().split("T")[0],
      rent_end_date: b.rent_end_date.toISOString().split("T")[0],
      total_price: Number(b.total_price),
      status: b.status,
      vehicle: {
        vehicle_name: b.vehicle_name,
        registration_number: b.registration_number,
        type: b.type
      }
    }));
  }
}

const updateBooking = async(user: any, bookingId: string, status: "cancelled" | "returned") =>{

  const bookingResult = await pool.query(`SELECT * FROM bookings WHERE id=$1`, [bookingId]);
  if (bookingResult.rows.length === 0) throw new Error("Booking not found");

  const booking = bookingResult.rows[0];

  const now = new Date();
  const rentStart = new Date(booking.rent_start_date);


  if (status === "cancelled") {
    if (user.role !== "customer" || user.id !== booking.customer_id) {
      throw new Error("You are not allowed to cancel this booking");
    }
    if (now >= rentStart) {
      throw new Error("Cannot cancel booking after start date");
    }
  }

  if (status === "returned") {
    if (user.role !== "admin") {
      throw new Error("Only admin can mark booking as returned");
    }
  }

  const updatedBookingResult = await pool.query(
    `UPDATE bookings SET status=$1 WHERE id=$2 RETURNING *`,
    [status, bookingId]
  );
  const updatedBooking = updatedBookingResult.rows[0];


  let vehicleData = null;
  if (status === "returned") {
    await pool.query(`UPDATE vehicles SET availability_status='available' WHERE id=$1`, [booking.vehicle_id]);
    const vehicleResult = await pool.query(`SELECT availability_status FROM vehicles WHERE id=$1`, [booking.vehicle_id]);
    vehicleData = vehicleResult.rows[0];
  }

  return {
    ...updatedBooking,
    total_price: Number(updatedBooking.total_price),
    vehicle: vehicleData || undefined
  };
}


 const autoReturnBookings = async () => {
  try {
    const now = new Date();
    const expiredBookings = await pool.query(
      `SELECT * FROM bookings WHERE status='active' AND rent_end_date < $1`,
      [now]
    );

    if (expiredBookings.rows.length === 0) return;
    for (const booking of expiredBookings.rows) {
      await pool.query(
        `UPDATE bookings SET status='returned' WHERE id=$1`,
        [booking.id]
      );

      await pool.query(
        `UPDATE vehicles SET availability_status='available' WHERE id=$1`,
        [booking.vehicle_id]
      );
    }
  
  } catch (error) {
    console.error("Error auto-marking bookings as returned:", error);
  }
};


export const bookingService = {
  createBooking,
  getBooks,
  updateBooking,
  autoReturnBookings,
}