import { EventLog } from 'ethers';
import { sensorService } from './sensor.service';
import { ManutencaoBocaDeLoboContract } from '../contrato/contrato.interface';
import { SensorStatus } from './sensor.enum';
import { Status } from '../chamado/chamado.enum';
import { Sensor } from './sensor.modelo';
import { contratoService } from '../contrato/contrato.service';
import { ambiente } from '../config/ambiente';

class SinalMonitor {
    private manutencaoContrato: ManutencaoBocaDeLoboContract | null = null;
    private idIntervaloVerificacao: NodeJS.Timeout | null = null;
    private verificando = false;

    constructor() {}

    public async iniciar(): Promise<void> {
        this.parar();

        this.manutencaoContrato = await contratoService.obterContrato();

        await this.sincronizarChamadosExistentes();

        if (this.idIntervaloVerificacao) {
            return;
        }

        this.idIntervaloVerificacao = setInterval(() => {
            this.verificarSinal();
        }, ambiente.intervaloVerificacaoSensorMs);
    }

    private async sincronizarChamadosExistentes(): Promise<void> {
        for (const sensor of sensorService.obterSensores()) {
            await this.sincronizarChamadoAtivo(sensor);
        }
    }

    private async sincronizarChamadoAtivo(sensor: Sensor): Promise<void> {
        try {
            const eventos = await this.manutencaoContrato!.queryFilter(
                'NovoChamado'
            );

            const ultimoEvento = eventos
                .filter((evento): evento is EventLog => 'args' in evento)
                .filter((evento) => Number(evento.args.sensorId) === sensor.id)
                .pop();

            if (!ultimoEvento) {
                return;
            }

            const chamado = await this.manutencaoContrato!.obterChamado(
                ultimoEvento.args.id
            );

            if (Number(chamado.status) === Status.Concluido) {
                return;
            }

            sensor.definirIdChamado(Number(chamado.id));
            sensor.status =
                Number(chamado.status) === Status.Aberto
                    ? SensorStatus.Obstruido
                    : SensorStatus.EmAndamento;
            sensor.marcarSemSinal();

            console.log(
                `Chamado #${chamado.id} já existente encontrado para o sensor ${sensor.id}, sincronizando estado.`
            );
        } catch (erro) {
            console.error(
                `Erro ao sincronizar chamado existente do sensor ${sensor.id}:`,
                erro
            );
        }
    }

    private parar(): void {
        if (this.idIntervaloVerificacao) {
            clearInterval(this.idIntervaloVerificacao);
            this.idIntervaloVerificacao = null;
        }
    }

    private async verificarSinal(): Promise<void> {
        if (this.verificando) {
            return;
        }

        this.verificando = true;

        try {
            const sensores = sensorService.obterSensores();

            for (const sensor of sensores) {
                const ativo = sensor.verificarAtivo(
                    ambiente.tempoSensorInativoMs
                );

                if (!ativo) {
                    if (sensor.idChamado) {
                        await this.verificarExpiracaoValidacao(sensor);
                    } else if (sensor.status == SensorStatus.Obstruido) {
                        await this.abrirChamado(sensor.id);
                    }
                } else if (sensor.idChamado) {
                    await this.finalizarChamado(sensor);
                }
            }
        } finally {
            this.verificando = false;
        }
    }

    private async abrirChamado(sensorId: number): Promise<void> {
        try {
            const sensor = sensorService.obterSensor(sensorId);

            if (!sensor) {
                console.error(`Sensor ${sensorId} não encontrado`);
                return;
            }

            const latContrato = BigInt(Math.round(sensor.latitude * 1000000));
            const longContrato = BigInt(Math.round(sensor.longitude * 1000000));
            const sensorIdContrato = BigInt(sensorId);

            const tx = await this.manutencaoContrato!.abrirChamado(
                sensorIdContrato,
                latContrato,
                longContrato
            );

            const recibo = await tx.wait();

            if (!recibo || !recibo.logs) {
                throw new Error('Transação sem logs');
            }

            let chamadoId: bigint | null = null;

            for (const log of recibo.logs) {
                const logDecodificado =
                    this.manutencaoContrato!.interface.parseLog(log);

                if (!logDecodificado) {
                    continue;
                }

                if (logDecodificado.name === 'NovoChamado') {
                    chamadoId = logDecodificado.args[0];
                    break;
                }
            }

            if (!chamadoId) {
                throw new Error('ID do chamado não encontrado nos logs');
            }

            sensor.definirIdChamado(Number(chamadoId));

            console.log(
                `Chamado #${chamadoId} aberto para o sensor ${sensorId}`
            );
        } catch (erro) {
            console.error(
                `Erro ao abrir chamado automático para sensor ${sensorId}:`,
                erro
            );
        }
    }

    private async verificarExpiracaoValidacao(sensor: Sensor): Promise<void> {
        if (!sensor.idChamado) {
            return;
        }

        try {
            const chamado = await this.manutencaoContrato!.obterChamado(
                BigInt(sensor.idChamado)
            );

            if (Number(chamado.status) !== Status.ValidarManutencao) {
                return;
            }

            const tempoDesdeValidacaoMs =
                Date.now() - Number(chamado.dataAtualizacao) * 1000;

            if (tempoDesdeValidacaoMs < ambiente.tempoLimiteValidacaoMs) {
                return;
            }

            await this.manutencaoContrato!.reabrirAtendimento(
                BigInt(sensor.idChamado)
            );

            console.log(
                `Chamado #${sensor.idChamado} voltou para em andamento: validação expirou sem o sensor confirmar sinal.`
            );
        } catch (erro) {
            console.error(
                `Erro ao verificar expiração de validação do chamado #${sensor.idChamado}:`,
                erro
            );
        }
    }

    private async finalizarChamado(sensor: Sensor): Promise<void> {
        if (!sensor.idChamado) {
            return;
        }

        if (!sensor.verificarAtivo(ambiente.tempoSensorInativoMs)) {
            return;
        }

        try {
            const chamado = await this.manutencaoContrato!.obterChamado(
                BigInt(sensor.idChamado)
            );

            const apenasQuedaDeSinal =
                Number(chamado.status) === Status.Aberto;

            if (
                apenasQuedaDeSinal ||
                Number(chamado.status) === Status.ValidarManutencao
            ) {
                await this.manutencaoContrato!.finalizarChamado(
                    BigInt(sensor.idChamado)
                );

                console.log(
                    apenasQuedaDeSinal
                        ? `Chamado #${sensor.idChamado} finalizado automaticamente: sensor voltou a dar sinal sem intervenção de manutenção (provável queda de sinal).`
                        : `Chamado #${sensor.idChamado} finalizado após validação de manutenção.`
                );

                sensor.definirIdChamado(undefined);
            }
        } catch (erro) {
            console.error(
                `Erro ao atualizar status do chamado #${sensor.idChamado!}:`,
                erro
            );
        }
    }
}

export const sinalMonitor = new SinalMonitor();
