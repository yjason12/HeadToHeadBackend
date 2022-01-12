const { createLogger, format, transports } = require('winston');
const { combine, splat, timestamp, printf } = format;

const myFormat = printf( ({ level, message, timestamp}) => {
  return `${timestamp} [${level}] : ${message}`
});

const logger = createLogger({
  level: 'debug',
  format: combine(
	format.colorize(),
	splat(),
	timestamp(),
	myFormat
  ),
  transports: [
	new transports.Console(),
  ]
});
module.exports = logger