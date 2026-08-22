import express from 'express';
import { sensorService } from '../services/sensor.service';
import { auditarEstadoPorHash } from '../services/auditaria.service';
import {
    gravarHashTransacao,
    lerLogTransacoes,
} from '../services/transaction-log.service';
import { Chamado } from '../interfaces/chamado.interface';
import { SensorStatus } from '../enum/status-sensor.enum';
import { Status, statusToString } from '../enum/status-chamado.enum';
import { contratoService } from '../services/contrato-setup.service';

export async function inicializarRotas(app: express.Application) {
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

            await contrato.iniciarAtendimento(BigInt(id));

            const sensor = sensorService
                .getSensores()
                .find((s) => s.idChamado === id);

            if (sensor) {
                sensor.status = SensorStatus.EmAndamento;
            }

            res.json({ success: true, message: 'Chamado em andamento' });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Erro ao colocar chamado em andamento',
            });
        }
    });

    app.post('/chamados/:id/validar-manutencao', async (req, res) => {
        try {
            const id = parseInt(req.params.id);
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

            await contrato.validarManutencao(BigInt(id));

            res.json({
                success: true,
                message: 'Chamado alterado para validar manutenção',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Erro ao atualizar chamado para validar manutenção',
            });
        }
    });

    app.get('/sensores', (req, res) => {
        try {
            const sensores = sensorService.getSensores();
            res.json({ success: true, sensores });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Erro ao obter sensores',
            });
        }
    });
}

function convertChamadoToResponse(chamado: Chamado) {
    return {
        id: Number(chamado.id),
        sensorId: Number(chamado.sensorId),
        lat: Number(chamado.lat) / 1000000,
        long: Number(chamado.long) / 1000000,
        status: statusToString(Number(chamado.status)),
        dataAbertura: Number(chamado.dataAbertura) * 1000,
        dataAtualizacao: Number(chamado.dataAtualizacao) * 1000,
        dataFechamento: Number(chamado.dataFechamento) * 1000,
    };
}
