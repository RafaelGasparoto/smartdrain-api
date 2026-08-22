import express from 'express';
import { sensorService } from './sensor.service';

export function registrarRotasSensor(app: express.Application) {
    app.get('/sensores', (req, res) => {
        try {
            const sensores = sensorService.obterSensores();
            res.json({ sucesso: true, sensores });
        } catch (erro) {
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao obter sensores',
            });
        }
    });
}
