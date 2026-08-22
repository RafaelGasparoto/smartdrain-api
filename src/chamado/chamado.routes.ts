import express from 'express';
import { ethers } from 'ethers';
import { sensorService } from '../sensor/sensor.service';
import { auditarEstadoPorHash } from '../contrato/auditoria.service';
import { lerLogTransacoes } from './transaction-log.service';
import { Chamado } from './chamado.interface';
import { SensorStatus } from '../sensor/sensor.enum';
import { Status, statusToString } from './chamado.enum';
import { contratoService } from '../contrato/contrato.service';
import { ManutencaoBocaDeLoboContract } from '../contrato/contrato.interface';

export async function registrarRotasChamado(app: express.Application) {
    const contrato = await contratoService.getContrato();

    app.get('/auditoria/:hash', async (req, res) => {
        try {
            const hash = req.params.hash;

            const chamado = await auditarEstadoPorHash(hash, contrato);

            if (!chamado) {
                return res.status(404).json({
                    success: false,
                    error: 'Transação não encontrada.',
                });
            }

            res.json({
                success: true,
                chamado: convertChamadoToResponse(chamado),
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Erro ao consultar auditoria.',
            });
        }
    });

    app.get('/chamados', async (req, res) => {
        try {
            const chamados = await lerLogTransacoes();

            res.json({
                success: true,
                chamados,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Erro ao obter chamados',
            });
        }
    });

    app.get('/chamados/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id);

            const chamado = await contrato.getChamado(BigInt(id));

            if (!chamado) {
                return res.status(404).json({
                    success: false,
                    error: 'Chamado não encontrado',
                });
            }

            res.json({
                success: true,
                chamado: convertChamadoToResponse(chamado),
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Erro ao obter chamado',
            });
        }
    });

    app.post('/chamados/:id/em-andamento', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const { chavePrivada } = req.body;

            const tecnico = conectarComoTecnico(contrato, chavePrivada);

            if (!tecnico) {
                return res.status(400).json({
                    success: false,
                    error: 'chavePrivada do técnico é obrigatória e deve ser válida',
                });
            }

            const chamado = await contrato.getChamado(BigInt(id));

            if (!chamado) {
                return res.status(404).json({
                    success: false,
                    error: 'Chamado não encontrado',
                });
            }

            if (Number(chamado.status) !== Status.Aberto) {
                return res.status(400).json({
                    success: false,
                    error: 'Somente chamados abertos podem ser colocados em andamento',
                });
            }

            await tecnico.contrato.iniciarAtendimento(BigInt(id));

            const sensor = sensorService
                .getSensores()
                .find((s) => s.idChamado === id);

            if (sensor) {
                sensor.status = SensorStatus.EmAndamento;
            }

            res.json({
                success: true,
                message: 'Chamado em andamento',
                tecnico: tecnico.endereco,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Erro ao colocar chamado em andamento',
            });
        }
    });

    app.post('/chamados/:id/validar-manutencao', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            const { chavePrivada } = req.body;

            const tecnico = conectarComoTecnico(contrato, chavePrivada);

            if (!tecnico) {
                return res.status(400).json({
                    success: false,
                    error: 'chavePrivada do técnico é obrigatória e deve ser válida',
                });
            }

            const chamado = await contrato.getChamado(BigInt(id));

            if (!chamado) {
                return res.status(404).json({
                    success: false,
                    error: 'Chamado não encontrado',
                });
            }

            if (Number(chamado.status) !== Status.EmAndamento) {
                return res.status(400).json({
                    success: false,
                    error: 'Somente chamados em andamento podem ser validados para manutenção',
                });
            }

            await tecnico.contrato.validarManutencao(BigInt(id));

            res.json({
                success: true,
                message: 'Chamado alterado para validar manutenção',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : 'Erro ao atualizar chamado para validar manutenção',
            });
        }
    });
}

function conectarComoTecnico(
    contrato: ManutencaoBocaDeLoboContract,
    chavePrivada: unknown
): { contrato: ManutencaoBocaDeLoboContract; endereco: string } | null {
    if (typeof chavePrivada !== 'string' || !chavePrivada) {
        return null;
    }

    try {
        const provider = contrato.runner!.provider!;
        const tecnico = new ethers.Wallet(chavePrivada, provider);
        return {
            contrato: contrato.connect(tecnico) as ManutencaoBocaDeLoboContract,
            endereco: tecnico.address,
        };
    } catch {
        return null;
    }
}

function convertChamadoToResponse(chamado: Chamado) {
    const finalizadoSemIntervencao =
        Number(chamado.status) === Status.Concluido &&
        Number(chamado.dataAtualizacao) === 0;

    return {
        id: Number(chamado.id),
        sensorId: Number(chamado.sensorId),
        lat: Number(chamado.lat) / 1000000,
        long: Number(chamado.long) / 1000000,
        status: statusToString(Number(chamado.status)),
        tecnico:
            chamado.tecnico === ethers.ZeroAddress ? null : chamado.tecnico,
        dataAbertura: Number(chamado.dataAbertura) * 1000,
        dataAtualizacao: Number(chamado.dataAtualizacao) * 1000,
        dataFechamento: Number(chamado.dataFechamento) * 1000,
        finalizadoSemIntervencao,
    };
}
