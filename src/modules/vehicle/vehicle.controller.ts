import { Request, Response } from "express"
import { vehicleService } from "./vehicle.service"



const createVehicle = async(req:Request, res: Response)=>{
 try {

  const result = await vehicleService.createVehicle(req.body);
  res.status(201).json({
    success: true,
    message: "Vehicle created successfully",
    data: result.rows[0],
  })
  
 } catch (error: any) {
  res.status(500).json({
    success: false,
    message: error.message,
    details: error,
  })
 }
}

const getAllVehicles = async(req: Request, res: Response)=>{
try {
  const result = await vehicleService.getAllVehicles();

      if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No vehicles found",
        data: [],
      });
    }
    res.status(200).json({
      success: true,
      message: "Vehicles retrieved successfully",
      data: result.rows,
    });
} catch (error: any) {
  res.status(500).json({
    success: false,
    message: error.message,
    details: error,
  })
}
}

const getSingleVehicle = async(req: Request, res: Response)=>{
try {
     const result = await vehicleService.getSingleVehicle(req.params.vehicleId as string);
      if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Vehicle retrieved successfully",
        data: result.rows[0],
      });
    }
  } catch (error: any) {
    res.status(500).json({
    success: false,
    message: error.message,
    details: error,
  })
  }
}

const updateVehicle = async(req: Request, res: Response)=>{
const {vehicle_name, type, registration_number, daily_rent_price, availability_status} = req.body;

  const result = await vehicleService.updateVehicle(vehicle_name, type, registration_number, daily_rent_price, availability_status, req.params.vehicleId as string);
if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "vehicle not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Vehicle updated successfully",
        data: result.rows[0],
      });
    }
}

const deleteVehicle = async(req: Request, res: Response)=>{
try {
  
   const result = await vehicleService.deleteVehicle(req.params.vehicleId as string);

    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Vehicle deleted successfully",
      });
    }
 } catch (error: any) {
    res.status(500).json({
    success: false,
    message: error.message,
    details: error,
  })
 }
}
export const vehicleController = {
  createVehicle,
  getAllVehicles,
  getSingleVehicle,
  updateVehicle,
  deleteVehicle,
}