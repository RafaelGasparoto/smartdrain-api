import {
    BaseContract,
    BigNumberish,
    ContractEventPayload,
    ContractTransactionResponse,
} from 'ethers';

export enum Status {
    Aberto = 0,
    EmAndamento = 1,
    Concluido = 2,
}

export interface ChamadoSaida {
    id: bigint;
    localizacao: string;
    status: bigint;
    sensor: string;
    dataAbertura: bigint;
}

interface ManutencaoBocaDeLoboFunctions {
    abrirChamado(localizacao: string): Promise<ContractTransactionResponse>;
    chamados(id: BigNumberish): Promise<ChamadoSaida>;
    totalChamados(): Promise<bigint>;

    on(
        event: 'NovoChamado',
        listener: (
            id: bigint,
            localizacao: string,
            event: ContractEventPayload
        ) => void
    ): this;
}

export type ManutencaoBocaDeLoboContract = BaseContract &
    ManutencaoBocaDeLoboFunctions;
