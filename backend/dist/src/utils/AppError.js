export class AppError extends Error {
    statusCode;
    errorCode;
    details;
    constructor(statusCode, errorCode, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}
//# sourceMappingURL=AppError.js.map