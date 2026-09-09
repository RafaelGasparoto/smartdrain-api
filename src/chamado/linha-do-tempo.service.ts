import { EventLog } from 'ethers';
import { ManutencaoBocaDeLoboContract } from '../contrato/contrato.interface';

const NOMES_EVENTOS_TIMELINE = [
    'NovoChamado',
    'ChamadoEmAndamento',
    'ChamadoValidarManutencao',
    'ChamadoFinalizado',
    'ChamadoReaberto',
] as const;

const CAMPO_TIMESTAMP_POR_EVENTO: Record<string, string> = {
    NovoChamado: 'dataAbertura',
    ChamadoEmAndamento: 'dataAtualizacao',
    ChamadoValidarManutencao: 'dataAtualizacao',
    ChamadoFinalizado: 'dataFechamento',
    ChamadoReaberto: 'dataAtualizacao',
};

export interface EventoTimeline {
    timestamp: number;
    evento: string;
    id: number;
    hashTransacao: string;
}

function nomeEvento(log: EventLog): string {
    if (
        log.fragment.name === 'ChamadoFinalizado' &&
        log.args.finalizadoSemIntervencao
    ) {
        return 'ChamadoFinalizadoAutomaticamente';
    }

    return log.fragment.name;
}

function converterLog(log: EventLog): EventoTimeline {
    const campoTimestamp = CAMPO_TIMESTAMP_POR_EVENTO[log.fragment.name];

    return {
        timestamp: Number(log.args[campoTimestamp]),
        evento: nomeEvento(log),
        id: Number(log.args.id),
        hashTransacao: log.transactionHash,
    };
}

function ordenarLogs(a: EventLog, b: EventLog): number {
    if (a.blockNumber !== b.blockNumber) {
        return a.blockNumber - b.blockNumber;
    }

    return a.index - b.index;
}

async function buscarLogsDosEventos(
    contrato: ManutencaoBocaDeLoboContract,
    filtros: unknown[]
): Promise<EventoTimeline[]> {
    const eventos = await Promise.all(
        filtros.map((filtro) => contrato.queryFilter(filtro as never))
    );

    return eventos
        .flat()
        .filter((evento): evento is EventLog => 'args' in evento)
        .sort(ordenarLogs)
        .map(converterLog);
}

export async function obterLinhaDoTempo(
    contrato: ManutencaoBocaDeLoboContract
): Promise<EventoTimeline[]> {
    return buscarLogsDosEventos(contrato, [...NOMES_EVENTOS_TIMELINE]);
}

export async function obterLinhaDoTempoPorChamado(
    contrato: ManutencaoBocaDeLoboContract,
    id: number
): Promise<EventoTimeline[]> {
    const filtros = NOMES_EVENTOS_TIMELINE.map((nome) =>
        contrato.filters[nome](id)
    );

    return buscarLogsDosEventos(contrato, filtros);
}
