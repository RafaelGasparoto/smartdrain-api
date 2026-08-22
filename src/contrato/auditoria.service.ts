import { ManutencaoBocaDeLoboContract } from './contrato.interface';

async function auditarEstadoPorHash(
    hashTransacao: string,
    contrato: ManutencaoBocaDeLoboContract
) {
    const provedor = contrato.runner!.provider!;

    const recibo = await provedor.getTransactionReceipt(hashTransacao);

    if (!recibo) {
        throw new Error(`Recibo da transação ${hashTransacao} não encontrado.`);
    }

    const logs = recibo.logs;

    if (!logs.length) {
        console.log('Nenhum log encontrado nesta transação.');
        return null;
    }

    const logDecodificado = contrato.interface.parseLog(logs[0]);
    let id: bigint | null = null;

    logDecodificado?.fragment.inputs.forEach((entrada, indice) => {
        const nome = entrada.name || `arg${indice}`;
        if (nome.toLowerCase() === 'id') {
            id = logDecodificado.args[indice];
        }
    });

    if (!id) {
        throw new Error('ID do chamado nao encontrado.');
    }

    const chamado = await contrato.chamados(id, {
        blockTag: recibo.blockNumber!,
    });
    return chamado;
}

export { auditarEstadoPorHash };
