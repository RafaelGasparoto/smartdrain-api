export interface Chamado {
    id: bigint;
    lat: bigint;
    long: bigint;
    sensorId: bigint;
    status: bigint;
    tecnico: string;
    dataAbertura: bigint;
    dataAtualizacao: bigint;
    dataFechamento: bigint;
}
