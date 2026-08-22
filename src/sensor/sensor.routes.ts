import express from 'express';
import { sensorService } from './sensor.service';

export function registrarRotasSensor(app: express.Application) {
    app.get('/sensores', (req, res) => {
        try {
            const sensores = sensorService.getSensores();
            res.json({ success: true, sensores });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Erro ao obter sensores',
            });
        }
    });
}
