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

    const logDoContrato = logs.filter(
        (log) =>
            log.address.toLowerCase() ===
            contrato.target.toString().toLowerCase()
    );

    if (!logDoContrato.length) {
        console.log('Nenhum log do contrato encontrado nesta transação.');
        return null;
    }

    const logDecodificado = contrato.interface.parseLog(logDoContrato[0]);
    const id: bigint | undefined = logDecodificado?.args.id;

    if (!id) {
        throw new Error('ID do chamado nao encontrado.');
    }

    const chamado = await contrato.chamados(id, {
        blockTag: recibo.blockNumber!,
    });
    return chamado;
}

export { auditarEstadoPorHash };
