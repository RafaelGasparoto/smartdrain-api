import { promises as fs } from 'fs';
import path from 'path';

const caminhoLogTransacoes = path.resolve(__dirname, '../..', 'transacoes.txt');

export async function gravarHashTransacao(
    hashTransacao: string,
    acao: string,
    timestampTransacao: number,
    chamadoId: number
) {
    const linha = `${timestampTransacao} - ${acao} - id=${chamadoId} - ${hashTransacao}\n`;

    await fs.appendFile(caminhoLogTransacoes, linha, 'utf8');
}

export async function lerLogTransacoes() {
    try {
        const data = await fs.readFile(caminhoLogTransacoes, 'utf8');
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
    } catch (erro) {
        console.error('Erro ao ler transações:', erro);
        return [];
    }
}
