import { ManutencaoBocaDeLoboContract } from './contrato.interface';
import { contratoService } from './contrato.service';
import { sensorService } from '../sensor/sensor.service';
import { gravarHashTransacao } from '../chamado/transaction-log.service';

class EventosListener {
    private contrato: ManutencaoBocaDeLoboContract | null = null;

    async escutarEventos() {
        this.contrato = await contratoService.getContrato();

        this.contrato.on(
            'NovoChamado',
            async (id, lat, long, sensorId, dataAbertura, event) => {
                const latExibicao = Number(lat) / 1000000;
                const longExibicao = Number(long) / 1000000;

                console.log('-----------------------------');
                console.log(
                    `--- CHAMADO #${id} ABERTO ${new Date(Number(dataAbertura) * 1000)} ---`
                );
                console.log(`Latitude: ${latExibicao}`);
                console.log(`Longitude: ${longExibicao}`);
                console.log('-----------------------------');

                await gravarHashTransacao(
                    event.log.transactionHash,
                    'NovoChamado',
                    Number(dataAbertura),
                    Number(id)
                );
            }
        );

        this.contrato.on(
            'ChamadoEmAndamento',
            async (id, dataAtualizacao, event) => {
                console.log('-----------------------------');
                console.log(
                    `--- CHAMADO #${id} EM ANDAMENTO ${new Date(
                        Number(dataAtualizacao) * 1000
                    )}---`
                );
                console.log('-----------------------------');

                await gravarHashTransacao(
                    event.log.transactionHash,
                    'ChamadoEmAndamento',
                    Number(dataAtualizacao),
                    Number(id)
                );
            }
        );

        this.contrato.on(
            'ChamadoValidarManutencao',
            async (id, dataAtualizacao, event) => {
                console.log('-----------------------------');
                console.log(
                    `--- CHAMADO #${id} PARA VALIDAR MANUTENÇÃO ${new Date(Number(dataAtualizacao) * 1000)} ---`
                );
                console.log('-----------------------------');

                await gravarHashTransacao(
                    event.log.transactionHash,
                    'ChamadoValidarManutencao',
                    Number(dataAtualizacao),
                    Number(id)
                );
            }
        );

        this.contrato.on(
            'ChamadoFinalizado',
            async (id, dataAtualizacao, event) => {
                console.log('-----------------------------');
                console.log(
                    `--- CHAMADO #${id} FINALIZADO ${new Date(Number(dataAtualizacao) * 1000)} ---`
                );
                console.log('-----------------------------');

                const sensor = sensorService
                    .getSensores()
                    .find((s) => s.idChamado === Number(id));

                if (sensor) {
                    sensor.setIdChamado(undefined);
                    console.log(
                        `Sensor ${sensor.id} atualizado para Normalizado.`
                    );
                }

                await gravarHashTransacao(
                    event.log.transactionHash,
                    'ChamadoFinalizado',
                    Number(dataAtualizacao),
                    Number(id)
                );
            }
        );
    }
}

export const eventosListener = new EventosListener();
