import express from 'express';
import { ethers } from 'ethers';
import { sensorService } from '../sensor/sensor.service';
import { auditarEstadoPorHash } from '../contrato/auditoria.service';
import { lerLogTransacoes } from './log-transacoes.service';
import { Chamado } from './chamado.interface';
import { SensorStatus } from '../sensor/sensor.enum';
import { Status, statusParaTexto } from './chamado.enum';
import { contratoService } from '../contrato/contrato.service';
import { ManutencaoBocaDeLoboContract } from '../contrato/contrato.interface';

export async function registrarRotasChamado(app: express.Application) {
    const contrato = await contratoService.obterContrato();

    app.get('/auditoria/:hash', async (req, res) => {
        try {
            const hash = req.params.hash;

            const chamado = await auditarEstadoPorHash(hash, contrato);

            if (!chamado) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Transação não encontrada.',
                });
            }

            res.json({
                sucesso: true,
                chamado: converterChamadoParaResposta(chamado),
            });
        } catch (erro) {
            res.status(500).json({
                sucesso: false,
                erro:
                    erro instanceof Error
                        ? erro.message
                        : 'Erro ao consultar auditoria.',
            });
        }
    });

    app.get('/chamados', async (req, res) => {
        try {
            const chamados = await lerLogTransacoes();

            res.json({
                sucesso: true,
                chamados,
            });
        } catch (erro) {
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao obter chamados',
            });
        }
    });

    app.get('/chamados/:id', async (req, res) => {
        try {
            const id = parseInt(req.params.id);

            const chamado = await contrato.obterChamado(BigInt(id));

            if (!chamado) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Chamado não encontrado',
                });
            }

            res.json({
                sucesso: true,
                chamado: converterChamadoParaResposta(chamado),
            });
        } catch (erro) {
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao obter chamado',
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
                    sucesso: false,
                    erro: 'chavePrivada do técnico é obrigatória e deve ser válida',
                });
            }

            const chamado = await contrato.obterChamado(BigInt(id));

            if (!chamado) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Chamado não encontrado',
                });
            }

            if (Number(chamado.status) !== Status.Aberto) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Somente chamados abertos podem ser colocados em andamento',
                });
            }

            await tecnico.contrato.iniciarAtendimento(BigInt(id));

            const sensor = sensorService
                .obterSensores()
                .find((s) => s.idChamado === id);

            if (sensor) {
                sensor.status = SensorStatus.EmAndamento;
            }

            res.json({
                sucesso: true,
                mensagem: 'Chamado em andamento',
                tecnico: tecnico.endereco,
            });
        } catch (erro) {
            res.status(500).json({
                sucesso: false,
                erro:
                    erro instanceof Error
                        ? erro.message
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
                    sucesso: false,
                    erro: 'chavePrivada do técnico é obrigatória e deve ser válida',
                });
            }

            const chamado = await contrato.obterChamado(BigInt(id));

            if (!chamado) {
                return res.status(404).json({
                    sucesso: false,
                    erro: 'Chamado não encontrado',
                });
            }

            if (Number(chamado.status) !== Status.EmAndamento) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Somente chamados em andamento podem ser validados para manutenção',
                });
            }

            await tecnico.contrato.validarManutencao(BigInt(id));

            res.json({
                sucesso: true,
                mensagem: 'Chamado alterado para validar manutenção',
            });
        } catch (erro) {
            res.status(500).json({
                sucesso: false,
                erro:
                    erro instanceof Error
                        ? erro.message
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
        const provedor = contrato.runner!.provider!;
        const tecnico = new ethers.Wallet(chavePrivada, provedor);
        return {
            contrato: contrato.connect(tecnico) as ManutencaoBocaDeLoboContract,
            endereco: tecnico.address,
        };
    } catch {
        return null;
    }
}

function converterChamadoParaResposta(chamado: Chamado) {
    const finalizadoSemIntervencao =
        Number(chamado.status) === Status.Concluido &&
        Number(chamado.dataAtualizacao) === 0;

    return {
        id: Number(chamado.id),
        sensorId: Number(chamado.sensorId),
        lat: Number(chamado.lat) / 1000000,
        long: Number(chamado.long) / 1000000,
        status: statusParaTexto(Number(chamado.status)),
        tecnico:
            chamado.tecnico === ethers.ZeroAddress ? null : chamado.tecnico,
        dataAbertura: Number(chamado.dataAbertura) * 1000,
        dataAtualizacao: Number(chamado.dataAtualizacao) * 1000,
        dataFechamento: Number(chamado.dataFechamento) * 1000,
        finalizadoSemIntervencao,
    };
}
