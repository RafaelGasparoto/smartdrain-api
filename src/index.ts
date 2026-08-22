import { inicializarRotas } from './routes/contract.routes';
import express from 'express';
import cors from 'cors';
import { iniciarBroker } from './mqtt/broker';
import { eventosListener } from './services/escutar-eventos.service';
import { sinalMonitor } from './services/sinal-monitor.service';
const app = express();

app.use(cors({ origin: '*' }), express.json());

export async function bootstrap() {
    try {
        await sinalMonitor.iniciar();
        await eventosListener.escutarEventos();
        await inicializarRotas(app);

        const port = 3000;

        app.listen(port, () => {
            console.log(`Servidor rodando em http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Falha ao iniciar:', error);
        process.exit(1);
    }
}

bootstrap();
iniciarBroker();
