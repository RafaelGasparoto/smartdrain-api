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
    obterChamado(id: BigNumberish): Promise<Chamado>;
    finalizarChamado(id: bigint): Promise<ContractTransactionResponse>;
    reabrirAtendimento(id: bigint): Promise<ContractTransactionResponse>;

    on(
        evento: 'ChamadoReaberto',
        listener: (
            id: bigint,
            dataAtualizacao: bigint,
            evento: ContractEventPayload
        ) => void
    ): this;

    on(
        evento: 'ChamadoFinalizado',
        listener: (
            id: bigint,
            finalizadoSemIntervencao: boolean,
            dataFechamento: bigint,
            evento: ContractEventPayload
        ) => void
    ): this;

    on(
        evento: 'ChamadoEmAndamento',
        listener: (
            id: bigint,
            tecnico: string,
            dataAtualizacao: bigint,
            evento: ContractEventPayload
        ) => void
    ): this;

    on(
        evento: 'ChamadoValidarManutencao',
        listener: (
            id: bigint,
            tecnico: string,
            dataAtualizacao: bigint,
            evento: ContractEventPayload
        ) => void
    ): this;

    on(
        evento: 'NovoChamado',
        listener: (
            id: bigint,
            lat: bigint,
            long: bigint,
            sensorId: bigint,
            dataAbertura: bigint,
            evento: ContractEventPayload
        ) => void
    ): this;
}

export type ManutencaoBocaDeLoboContract = BaseContract &
    ManutencaoBocaDeLoboFunctions;
