import { ManutencaoBocaDeLoboContract } from './contrato.interface';
import { contratoService } from './contrato.service';
import { sensorService } from '../sensor/sensor.service';
import { SensorStatus } from '../sensor/sensor.enum';
import { gravarHashTransacao } from '../chamado/log-transacoes.service';

class OuvinteDeEventos {
    private contrato: ManutencaoBocaDeLoboContract | null = null;

    async escutarEventos() {
        this.contrato = await contratoService.obterContrato();

        this.contrato.on(
            'NovoChamado',
            async (id, lat, long, sensorId, dataAbertura, evento) => {
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
                    evento.log.transactionHash,
                    'NovoChamado',
                    Number(dataAbertura),
                    Number(id)
                );
            }
        );

        this.contrato.on(
            'ChamadoEmAndamento',
            async (id, tecnico, dataAtualizacao, evento) => {
                console.log('-----------------------------');
                console.log(
                    `--- CHAMADO #${id} EM ANDAMENTO ${new Date(
                        Number(dataAtualizacao) * 1000
                    )}---`
                );
                console.log(`Técnico: ${tecnico}`);
                console.log('-----------------------------');

                await gravarHashTransacao(
                    evento.log.transactionHash,
                    'ChamadoEmAndamento',
                    Number(dataAtualizacao),
                    Number(id)
                );
            }
        );

        this.contrato.on(
            'ChamadoValidarManutencao',
            async (id, tecnico, dataAtualizacao, evento) => {
                console.log('-----------------------------');
                console.log(
                    `--- CHAMADO #${id} PARA VALIDAR MANUTENÇÃO ${new Date(Number(dataAtualizacao) * 1000)} ---`
                );
                console.log(`Técnico: ${tecnico}`);
                console.log('-----------------------------');

                await gravarHashTransacao(
                    evento.log.transactionHash,
                    'ChamadoValidarManutencao',
                    Number(dataAtualizacao),
                    Number(id)
                );
            }
        );

        this.contrato.on(
            'ChamadoFinalizado',
            async (id, finalizadoSemIntervencao, dataFechamento, evento) => {
                console.log('-----------------------------');
                console.log(
                    `--- CHAMADO #${id} FINALIZADO ${new Date(Number(dataFechamento) * 1000)} ---`
                );
                console.log(
                    finalizadoSemIntervencao
                        ? 'Finalizado automaticamente, sem intervenção técnica (queda de sinal).'
                        : 'Finalizado após validação de manutenção pelo técnico.'
                );
                console.log('-----------------------------');

                const sensor = sensorService
                    .obterSensores()
                    .find((s) => s.idChamado === Number(id));

                if (sensor) {
                    sensor.definirIdChamado(undefined);
                    sensor.status = SensorStatus.Normalizado;
                    console.log(
                        `Sensor ${sensor.id} atualizado para Normalizado.`
                    );
                }

                await gravarHashTransacao(
                    evento.log.transactionHash,
                    finalizadoSemIntervencao
                        ? 'ChamadoFinalizadoAutomaticamente'
                        : 'ChamadoFinalizado',
                    Number(dataFechamento),
                    Number(id)
                );
            }
        );
    }
}

export const ouvinteDeEventos = new OuvinteDeEventos();
