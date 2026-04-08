import express from 'express';
import { ManutencaoBocaDeLoboContract } from '../interfaces/contract-interface';

export function initRoutes(
    app: express.Application,
    manutencaoContrato: ManutencaoBocaDeLoboContract
) {
    app.get('/abrir-chamado', async (req, res) => {
        try {
            const value = await manutencaoContrato.abrirChamado(
                'Teste de Localização'
            );
            res.json({ success: true, value: value.toString() });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Erro ao ler contrato',
            });
        }
    });

    app.get('/total-chamados', async (req, res) => {
        try {
            const total = await manutencaoContrato.totalChamados();
            res.json({ success: true, total: total.toString() });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Erro ao ler contrato',
            });
        }
    });
}
