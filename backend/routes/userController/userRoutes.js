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

export default userRouter;
