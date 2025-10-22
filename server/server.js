import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";

import connectDB from "./config/mongodb.js"
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import brandRouter from "./routes/brandRoutes.js";
import productRouter from "./routes/productRoutes.js";
import adminRouter from "./routes/adminRoutes.js";

const app = express();
const port = process.env.PORT || 4000
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://ladanv-8hxns8w8x-nguyentrongnguyen04s-projects.vercel.app',
    'https://ladanv.vercel.app',
    /^https:\/\/.*\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}))

// API Endpoints
app.get('/', (req, res)=> res.send("API Working"));
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/brands', brandRouter)
app.use('/api/products', productRouter)
app.use('/api/admin', adminRouter)

// Export cho Vercel
export default app;

// Chỉ chạy server khi không phải trên Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, ()=> console.log(`Server started on PORT:${port}`));
}