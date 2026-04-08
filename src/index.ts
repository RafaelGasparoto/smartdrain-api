import { ManutencaoBocaDeLoboContract } from './interfaces/contract-interface';
import { initRoutes } from './routes/contract.routes';
import { setupContract } from './services/contract-setup';
import { escutarEventos } from './services/escutar-eventos';
import express from 'express';

let manutencaoContrato: ManutencaoBocaDeLoboContract | null = null;
const app = express();
app.use(express.json());

export async function bootstrap() {
    try {
        manutencaoContrato = await setupContract();
        escutarEventos(manutencaoContrato);

        const port = 3000;
        app.listen(port, () => {
            console.log(`Servidor rodando em http://localhost:${port}`);
        });

        initRoutes(app, manutencaoContrato);
    } catch (error) {
        console.error('Falha ao iniciar contrato:', error);
        process.exit(1);
    }
}

bootstrap();
