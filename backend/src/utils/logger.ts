export const logger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({ level: 'info', message, timestamp: new Date().toISOString(), ...meta }));
  },
  error: (message: string, error?: any) => {
    // Only log the error stack if not in production to ensure stack traces are not exposed
    const isProduction = process.env.NODE_ENV === 'production';
    console.error(JSON.stringify({ 
      level: 'error', 
      message, 
      timestamp: new Date().toISOString(), 
      error: error?.message || error,
      stack: !isProduction && error?.stack ? error.stack : undefined
    }));
  },
  warn: (message: string, meta?: any) => {
    console.warn(JSON.stringify({ level: 'warn', message, timestamp: new Date().toISOString(), ...meta }));
  }
};
