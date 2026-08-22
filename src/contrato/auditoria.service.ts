import { ManutencaoBocaDeLoboContract } from './contrato.interface';

async function auditarEstadoPorHash(
    txHash: string,
    contract: ManutencaoBocaDeLoboContract
) {
    const provider = contract.runner!.provider!;

    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
        throw new Error(`Recibo da transação ${txHash} não encontrado.`);
    }

    const logs = receipt.logs;

    if (!logs.length) {
        console.log('Nenhum log encontrado nesta transação.');
        return null;
    }

    const parsedLog = contract.interface.parseLog(logs[0]);
    let id: bigint | null = null;

    parsedLog?.fragment.inputs.forEach((input, idx) => {
        const name = input.name || `arg${idx}`;
        if (name.toLowerCase() === 'id') {
            id = parsedLog.args[idx];
        }
    });

    if (!id) {
        throw new Error('ID do chamado nao encontrado.');
    }

    const chamado = await contract.chamados(id, {
        blockTag: receipt.blockNumber!,
    });
    return chamado;
}

export { auditarEstadoPorHash };
