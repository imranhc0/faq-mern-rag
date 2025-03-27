// create logger using winston and morgan, there will be no file logging, only console logging
import winston from 'winston';
import morgan from 'morgan';

// Create Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(
                    info => `${info.timestamp} ${info.level}: ${info.message}`
                )
            )
        })
    ]
});

// Create Morgan stream for Winston
const stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};

// Create Morgan middleware
const morganMiddleware = morgan('combined', { stream });

export { logger, morganMiddleware };
