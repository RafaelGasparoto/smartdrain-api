import { SensorStatus } from '../enum/status-sensor.enum';
import { Sensor } from '../models/sensor';

class SensorService {
    private sensores: Sensor[];

    constructor() {
        this.sensores = [
            new Sensor(10, -24.7212, -53.7428, SensorStatus.Normalizado),
        ];
    }

    getSensores() {
        return this.sensores;
    }

    getSensor(id: number) {
        return this.sensores.find((s) => s.id === id);
    }
}

export const sensorService: SensorService = new SensorService();
