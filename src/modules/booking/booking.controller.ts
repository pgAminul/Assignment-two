import { Request, Response } from "express";
import { bookingService } from "./booking.service";


const createBooking = async(req:Request, res: Response)=>{
 try {
  const result = await bookingService.createBooking(req.body);
  res.status(201).json({
    success: true,
    message: "Booking created successfully",
    data: result,
  })
  
 } catch (error: any) {
  res.status(500).json({
    success: false,
    message: error.message,
    details: error,
  })
 }
}

const getBooks = async(req: Request, res: Response)=>{
   try {
    const bookings = await bookingService.getBooks(req.user);
    res.status(200).json({
      success: true,
      message: req.user?.role === "admin" 
        ? "Bookings retrieved successfully" 
        : "Your bookings retrieved successfully",
      data: bookings
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      details: error
    });
  }
}

const updateBooking = async(req: Request, res: Response)=>{
 try {
    const user = req.user; 
    const { status } = req.body;
    const bookingId = req.params.bookingId;

    const updatedBooking = await bookingService.updateBooking(user, bookingId as string, status);

    res.status(200).json({
      success: true,
      message: status === "cancelled"
        ? "Booking cancelled successfully"
        : "Booking marked as returned. Vehicle is now available",
      data: updatedBooking
    });
  } catch (error: any) {
    res.status(403).json({
      success: false,
      message: error.message
    });
  }
}





export const bookingController = {
  createBooking,
  getBooks,
  updateBooking,

}