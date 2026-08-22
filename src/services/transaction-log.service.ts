import { promises as fs } from 'fs';
import path from 'path';

const hashLogPath = path.resolve(__dirname, '../..', 'transacoes.txt');

export async function gravarHashTransacao(
    txHash: string,
    action: string,
    timestampTransacao: number,
    chamadoId: number
) {
    const linha = `${timestampTransacao} - ${action} - id=${chamadoId} - ${txHash}\n`;

    await fs.appendFile(hashLogPath, linha, 'utf8');
}

export async function lerLogTransacoes() {
    try {
        const data = await fs.readFile(hashLogPath, 'utf8');
        const linhas = data.trim().split('\n');

        return linhas.map((linha) => {
            const [timestamp, evento, id, hashTransacao] = linha.split(' - ');
            return {
                timestamp,
                evento,
                id: Number(id.replace('id=', '')),
                hashTransacao,
            };
        });
    } catch (error) {
        console.error('Erro ao ler transações:', error);
        return [];
    }
}
