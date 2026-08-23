import { SensorStatus } from './sensor.enum';
import { Sensor } from './sensor.modelo';

class SensorService {
    private sensores: Sensor[];

    constructor() {
        this.sensores = [
            new Sensor(10, -24.7212, -53.7428, SensorStatus.Normalizado),
            new Sensor(11, -24.718, -53.739, SensorStatus.Normalizado),
            new Sensor(12, -24.725, -53.747, SensorStatus.Normalizado),
            new Sensor(13, -24.73, -53.735, SensorStatus.Normalizado),
            new Sensor(14, -24.715, -53.75, SensorStatus.Normalizado),
        ];
    }

    obterSensores() {
        return this.sensores;
    }

    obterSensor(id: number) {
        return this.sensores.find((s) => s.id === id);
    }
}

export const sensorService: SensorService = new SensorService();
