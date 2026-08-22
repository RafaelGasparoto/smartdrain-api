import { EventLog } from 'ethers';
import { sensorService } from './sensor.service';
import { ManutencaoBocaDeLoboContract } from '../interfaces/contrato.interface';
import { SensorStatus } from '../enum/status-sensor.enum';
import { Status } from '../enum/status-chamado.enum';
import { Sensor } from '../models/sensor';
import { contratoService } from './contrato-setup.service';

class SinalMonitor {
    private manutencaoContrato: ManutencaoBocaDeLoboContract | null = null;
    private monitoringIntervalId: NodeJS.Timeout | null = null;
    private readonly checkIntervalMs = 10000;

    constructor() {}

    public async iniciar(): Promise<void> {
        this.parar();

        this.manutencaoContrato = await contratoService.getContrato();

        await this.sincronizarChamadosExistentes();

        if (this.monitoringIntervalId) {
            return;
        }

        this.monitoringIntervalId = setInterval(() => {
            this.verificarSinal();
        }, this.checkIntervalMs);
    }

    private async sincronizarChamadosExistentes(): Promise<void> {
        for (const sensor of sensorService.getSensores()) {
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

            const chamado = await this.manutencaoContrato!.getChamado(
                ultimoEvento.args.id
            );

            if (Number(chamado.status) === Status.Concluido) {
                return;
            }

            sensor.setIdChamado(Number(chamado.id));
            sensor.status =
                Number(chamado.status) === Status.Aberto
                    ? SensorStatus.Obstruido
                    : SensorStatus.EmAndamento;
            sensor.marcarSemSinal();

            console.log(
                `Chamado #${chamado.id} já existente encontrado para o sensor ${sensor.id}, sincronizando estado.`
            );
        } catch (error) {
            console.error(
                `Erro ao sincronizar chamado existente do sensor ${sensor.id}:`,
                error
            );
        }
    }

    private parar(): void {
        if (this.monitoringIntervalId) {
            clearInterval(this.monitoringIntervalId);
            this.monitoringIntervalId = null;
        }
    }

    private async verificarSinal(): Promise<void> {
        const sensores = sensorService.getSensores();

        for (const sensor of sensores) {
            if (!sensor.verificarAtivo(this.checkIntervalMs)) {
                if (
                    sensor.status == SensorStatus.Obstruido &&
                    !sensor.idChamado
                ) {
                    await this.abrirChamado(sensor.id);
                }
            } else if (sensor.idChamado) {
                await this.finalizarChamado(sensor);
            }
        }
    }

    private async abrirChamado(sensorId: number): Promise<void> {
        try {
            const sensor = sensorService.getSensor(sensorId);

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

            const receipt = await tx.wait();

            if (!receipt || !receipt.logs) {
                throw new Error('Transação sem logs');
            }

            let chamadoId: bigint | null = null;

            for (const log of receipt.logs) {
                const parsedLog =
                    this.manutencaoContrato!.interface.parseLog(log);

                if (!parsedLog) {
                    continue;
                }

                if (parsedLog.name === 'NovoChamado') {
                    chamadoId = parsedLog.args[0];
                    break;
                }
            }

            if (!chamadoId) {
                throw new Error('ID do chamado não encontrado nos logs');
            }

            sensor.setIdChamado(Number(chamadoId));

            console.log(
                `Chamado #${chamadoId} aberto para o sensor ${sensorId}`
            );
        } catch (error) {
            console.error(
                `Erro ao abrir chamado automático para sensor ${sensorId}:`,
                error
            );
        }
    }

    private async finalizarChamado(sensor: Sensor): Promise<void> {
        if (!sensor.idChamado) {
            return;
        }

        if (!sensor.verificarAtivo(this.checkIntervalMs)) {
            return;
        }

        try {
            const chamado = await this.manutencaoContrato!.getChamado(
                BigInt(sensor.idChamado)
            );

            if (
                Number(chamado.status) === Status.ValidarManutencao ||
                Number(chamado.status) === Status.Aberto
            ) {
                await this.manutencaoContrato!.finalizarChamado(
                    BigInt(sensor.idChamado)
                );
            }
        } catch (error) {
            console.error(
                `Erro ao atualizar status do chamado #${sensor.idChamado!}:`,
                error
            );
        }
    }
}

export const sinalMonitor = new SinalMonitor();
