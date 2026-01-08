import express from 'express';
import vmController from './vmController.js';

const vmRouter = express.Router();

vmRouter.get('/getDashboardStats', vmController.getDashboardStats);
vmRouter.get('/getVmUsageStats', vmController.getVmUsageStats);

export default vmRouter;
