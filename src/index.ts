import express from 'express';
import cors from 'cors';
import { iniciarBroker } from './sensor/broker';
import { ouvinteDeEventos } from './contrato/eventos.service';
import { sinalMonitor } from './sensor/sinal-monitor.service';
import { registrarRotasChamado } from './chamado/chamado.routes';
import { registrarRotasSensor } from './sensor/sensor.routes';
const app = express();

app.use(cors({ origin: '*' }), express.json());

export async function bootstrap() {
    try {
        await sinalMonitor.iniciar();
        await ouvinteDeEventos.escutarEventos();
        await registrarRotasChamado(app);
        registrarRotasSensor(app);

        const port = 3000;

        app.listen(port, () => {
            console.log(`Servidor rodando em http://localhost:${port}`);
        });
    } catch (erro) {
        console.error('Falha ao iniciar:', erro);
        process.exit(1);
    }
}

bootstrap();
iniciarBroker();
