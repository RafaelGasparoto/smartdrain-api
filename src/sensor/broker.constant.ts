import { config } from 'dotenv';

config();

export const BROKER_URL = process.env.BROKER_URL || 'mqtt://broker.hivemq.com';
export const TOPICO = process.env.TOPICO || 'sensor/sinal';
