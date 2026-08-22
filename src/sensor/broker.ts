import * as mqtt from 'mqtt';
import { BROKER_URL, TOPICO } from './broker.constant';
import { sensorService } from './sensor.service';

export function iniciarBroker() {
    const client = mqtt.connect(BROKER_URL);

    client.on('connect', () => {
        client.subscribe(TOPICO, (err) => {
            if (err) {
                console.error('Erro ao se inscrever no tópico:', err);
            }
        });
    });

    client.on('message', (topico, message) => {
        if (topico === TOPICO) {
            const sensorId = parseInt(message.toString());
            sensorService.getSensor(sensorId)?.atualizarSinal();
        }
    });

    return client;
}
