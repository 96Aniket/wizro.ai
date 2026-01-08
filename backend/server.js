import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import multer from 'multer';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { v4 as uuidv4 } from 'uuid';

import pool from './config/config.js';
import amRoutes from './routes/amController/amRoutes.js';
import commonRoutes from './routes/commonController/commonRoutes.js';
import pmRoutes from './routes/pmController/pmRoutes.js';
import ticketRoutes from './routes/ticketController/ticketRoutes.js';
import userRoutes from './routes/userController/userRoutes.js';
import dbqueryexecute from './utils/dbqueryexecute.js';
import fmrouter from './routes/fmController/fm.routes.js';
import vmRouter from './routes/vmController/vmRoutes.js';

const ensureUploadDir = async () => {
  const uploadPath = './uploads';

  try {
    await fs.access(uploadPath);
  } catch {
    await fs.mkdir(uploadPath, { recursive: true });
  }
};

// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath(import.meta.url),
  // eslint-disable-next-line no-underscore-dangle
  __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

app.use(
  cors({
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    origin: 'http://localhost:5173',
  }),
);

app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, 'dist')));

// Multer setup (unchanged)
const storage = multer.diskStorage({
    destination(_req, _file, callback) {
      callback(null, 'uploads/');
    },
    filename(_req, file, callback) {
      const ext = path.extname(file.originalname),
        uuidName = uuidv4().split('-')[0] + ext;

      file.newname = uuidName;
      callback(null, uuidName);
    },
  }),
  upload = multer({ storage });

// Route mounts (unchanged)
app.use('/tms', ticketRoutes);
app.use('/user', userRoutes);
app.use('/pm', pmRoutes);
app.use('/am', amRoutes);
app.use('/common', commonRoutes);
app.use('/fm', fmrouter);
app.use('/vm', vmRouter);

const fileUploadLimit = 10;

app.post(
  '/upload',
  upload.array('files', fileUploadLimit),
  async (req, res) => {
    const { ticketId, empID } = req.body,
      { files } = req,
      arr = [],
      placeholder = [];

    await ensureUploadDir();

    for (const file of files) {
      placeholder.push('(?, ?, ?, ?, ?)');
      arr.push(
        parseInt(ticketId, 10),
        parseInt(empID, 10),
        file.originalname,
        file.newname,
        'uploads',
      );
    }

    const obj = {
      arr,
      queryString: `INSERT INTO tbl_tm_ticket_attachments
      (ticket_id, uploaded_by, og_name, new_name, file_path)
      values${placeholder.join(', ')};`,
    };

    await dbqueryexecute
      .executeSelectObj(obj, pool)
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  },
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});
