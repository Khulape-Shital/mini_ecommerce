import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middlewares/errorHandler.js';
import { logger } from './utils/logger.js';
import v1Routes from './routes/v1/index.js';
const app = express();
// Security Middlewares
app.use(helmet());
app.use(cors()); // Configure CORS as needed
// Body Parsing
app.use(express.json());
// Basic Request Logging
app.use((req, res, next) => {
    logger.info(`Incoming Request: ${req.method} ${req.url}`);
    next();
});
// API Routes
app.use('/api/v1', v1Routes);
// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'Route not found'
        }
    });
});
// Centralized Error Handling
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map