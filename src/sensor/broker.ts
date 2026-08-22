import * as mqtt from 'mqtt';
import { BROKER_URL, TOPICO } from './broker.constant';
import { sensorService } from './sensor.service';

export function iniciarBroker() {
    const cliente = mqtt.connect(BROKER_URL);

    cliente.on('connect', () => {
        cliente.subscribe(TOPICO, (erro) => {
            if (erro) {
                console.error('Erro ao se inscrever no tópico:', erro);
            }
        });
    });

    cliente.on('message', (topico, mensagem) => {
        if (topico === TOPICO) {
            const sensorId = parseInt(mensagem.toString());
            sensorService.obterSensor(sensorId)?.atualizarSinal();
        }
    });

    return cliente;
}
