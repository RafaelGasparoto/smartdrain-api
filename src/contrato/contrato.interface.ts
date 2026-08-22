import {
    BaseContract,
    BigNumberish,
    ContractEventPayload,
    ContractTransactionResponse,
} from 'ethers';
import { Chamado } from '../chamado/chamado.interface';

interface ManutencaoBocaDeLoboFunctions {
    chamados(id: BigNumberish, overrides?: any): Promise<Chamado>;
    abrirChamado(
        sensorId: bigint,
        lat: bigint,
        long: bigint
    ): Promise<ContractTransactionResponse>;
    iniciarAtendimento(id: bigint): Promise<ContractTransactionResponse>;
    validarManutencao(id: bigint): Promise<ContractTransactionResponse>;
    getChamado(id: BigNumberish): Promise<Chamado>;
    finalizarChamado(id: bigint): Promise<ContractTransactionResponse>;

    on(
        event: 'ChamadoFinalizado',
        listener: (
            id: bigint,
            dataFechamento: bigint,
            event: ContractEventPayload
        ) => void
    ): this;

    on(
        event: 'ChamadoEmAndamento',
        listener: (
            id: bigint,
            tecnico: string,
            dataAtualizacao: bigint,
            event: ContractEventPayload
        ) => void
    ): this;

    on(
        event: 'ChamadoValidarManutencao',
        listener: (
            id: bigint,
            tecnico: string,
            dataAtualizacao: bigint,
            event: ContractEventPayload
        ) => void
    ): this;

    on(
        event: 'NovoChamado',
        listener: (
            id: bigint,
            lat: bigint,
            long: bigint,
            sensorId: bigint,
            dataAbertura: bigint,
            event: ContractEventPayload
        ) => void
    ): this;
}

export type ManutencaoBocaDeLoboContract = BaseContract &
    ManutencaoBocaDeLoboFunctions;
