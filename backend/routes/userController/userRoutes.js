import express from 'express';

import userController from './userController.js';
import { upload } from '../../middleware/upload.js';

const userRouter = express.Router();

userRouter.post('/register', userController.register);
userRouter.post('/login', userController.login);
userRouter.post('/updateUser', userController.updateUser);

// NEW secure routes
userRouter.post('/refresh', userController.refreshToken);
userRouter.post('/logout', userController.logout);

userRouter.get('/getAll', userController.getUsers);

// 🔥 ADD MULTER MIDDLEWARE HERE
userRouter.post('/create', upload.fields([
  { name: 'b_aadhar_card_img', maxCount: 1 },
  { name: 'b_pan_card_img', maxCount: 1 },
  { name: 'b_passport_photo', maxCount: 1 },
  { name: 'b_10th_mark_sheet', maxCount: 1 },
  { name: 'b_12th_mark_sheet', maxCount: 1 },
  { name: 'b_degree_mark_sheet', maxCount: 1 },
  { name: 'b_certificates', maxCount: 1 },
  { name: 'b_professional_certifications', maxCount: 1 },
  { name: 'b_offer_letter', maxCount: 1 },
  { name: 'b_experience_letter', maxCount: 1 },
  { name: 'b_salary_slips', maxCount: 1 },
  { name: 'b_bank_passbook_copy', maxCount: 1 },
  { name: 'b_resume_cv', maxCount: 1 }
]), userController.createUser);

// 🔥 ADD MULTER MIDDLEWARE HERE TOO
userRouter.put('/update', upload.fields([
  { name: 'b_aadhar_card_img', maxCount: 1 },
  { name: 'b_pan_card_img', maxCount: 1 },
  { name: 'b_passport_photo', maxCount: 1 },
  { name: 'b_10th_mark_sheet', maxCount: 1 },
  { name: 'b_12th_mark_sheet', maxCount: 1 },
  { name: 'b_degree_mark_sheet', maxCount: 1 },
  { name: 'b_certificates', maxCount: 1 },
  { name: 'b_professional_certifications', maxCount: 1 },
  { name: 'b_offer_letter', maxCount: 1 },
  { name: 'b_experience_letter', maxCount: 1 },
  { name: 'b_salary_slips', maxCount: 1 },
  { name: 'b_bank_passbook_copy', maxCount: 1 },
  { name: 'b_resume_cv', maxCount: 1 }
]), userController.updateUser);

userRouter.delete('/delete/:id', userController.deleteUsers);

userRouter.post("/role/create", userController.createRole);
userRouter.get("/role/getAll", userController.getRoles);
userRouter.put("/role/update", userController.updateRole);
userRouter.delete("/role/delete/:id", userController.deleteRole);

userRouter.get("/permission/getAll", userController.getAllPermissions);
userRouter.post("/permission/create", userController.createPermission);
userRouter.delete("/permission/delete/:id", userController.deletePermission);

userRouter.post("/permission/assign", userController.assignPermission);
userRouter.get("/permission/getByRole/:roleId", userController.getPermissionsByRole);
userRouter.delete("/permission/unassign", userController.unassignPermission);

userRouter.get('/document/:id/:docType', userController.downloadDocument);

export default userRouter;