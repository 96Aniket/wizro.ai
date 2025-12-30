import express from 'express';

import userController from './userController.js';

const userRouter = express.Router();

userRouter.post('/register', userController.register);
userRouter.post('/login', userController.login);
userRouter.post('/updateUser', userController.updateUser);
userRouter.post('/deleteUser', userController.deleteUser);

// NEW secure routes
userRouter.post('/refresh', userController.refreshToken);
userRouter.post('/logout', userController.logout);

userRouter.get("/getAll", userController.getUsers);
userRouter.post("/create", userController.createUser);
userRouter.delete("/delete/:id", userController.deleteUser);
userRouter.put("/update", userController.updateUserDetails);
// userRouter.delete("/delete/:id", userController.deleteUserDetails);

userRouter.post("/create", userController.createRole);
// userRouter.get("/getAll", roleController.getRoles);
// userRouter.put("/update", roleController.updateRole);
// userRouter.delete("/delete/:id", roleController.deleteRole);

export default userRouter;
