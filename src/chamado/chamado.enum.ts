export enum Status {
    Aberto = 0,
    EmAndamento = 1,
    ValidarManutencao = 2,
    Concluido = 3,
}

export function statusParaTexto(status: Status): string {
    switch (status) {
        case Status.Aberto:
            return 'Aberto';
        case Status.EmAndamento:
            return 'Em Andamento';
        case Status.ValidarManutencao:
            return 'Validar Manutenção';
        case Status.Concluido:
            return 'Concluído';
        default:
            return 'Desconhecido';
    }
}
