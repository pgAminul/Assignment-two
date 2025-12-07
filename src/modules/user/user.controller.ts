import { Request, Response } from "express"
import { userService } from "./user.service"



const getAllUsers = async(req: Request, res: Response)=>{
try {
    const result = await userService.getAllUsers();
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result,
    });
} catch (error: any) {
    res.status(500).json({
    success: false,
    message: error.message,
    details: error,
  })
}
}

const getSingle = async(req:Request, res: Response)=>{
  try {
     const result = await userService.getSingle(req.params.userId as string);
      if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "User fetched successfully",
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

const updateUser = async(req: Request, res: Response)=>{
  const {name, email, phone, role} = req.body;
 try {

   // Customer cannot update other users
    if (req.user?.role !== "admin" && String(req.user?.id) !== req.params.userId) {
      return res.status(403).json({ 
        success: false, 
        message: "You are not allowed to update this user" 
      });
    }
  const result = await userService.updateUser(name, email, phone, role, req.params.userId as string);
if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "User updated successfully",
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

const deleteUser = async(req: Request, res: Response)=>{
 try {
      if (req.user?.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "You are not allowed to update this user" 
      });
    }
   const result = await userService.deleteUser(req.params.userId as string);

    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "User deleted successfully",
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

export const userController = {
 getAllUsers,
 getSingle,
 updateUser,
 deleteUser,
}