import { ManutencaoBocaDeLoboContract } from '../interfaces/contract-interface';

export async function escutarEventos(
    manutencaoContrato: ManutencaoBocaDeLoboContract
) {
    const contrato = manutencaoContrato;

    console.log('Escutando novos chamados de manutenção...');

    contrato.on('NovoChamado', (id, localizacao, event) => {
        console.log('--- NOVO EVENTO DETECTADO ---');
        console.log(`ID do Chamado: ${id}`);
        console.log(`Localização: ${localizacao}`);
        console.log(`Bloco da Transação: ${event.log.blockNumber}`);
        console.log(`Hash da Transação: ${event.log.transactionHash}`);
        console.log('-----------------------------');
    });
}
