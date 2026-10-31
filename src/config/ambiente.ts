import { config } from 'dotenv';

config();

function obrigatoria(nome: string): string {
    const valor = process.env[nome];

    if (!valor) {
        throw new Error(`Variável de ambiente ${nome} não definida.`);
    }

    return valor;
}

function opcional(nome: string, padrao: string): string {
    return process.env[nome] || padrao;
}

export const ambiente = {
    caminhoImplantacao: obrigatoria('DEPLOYMENT_PATH'),
    nomeArtefato: obrigatoria('ARTIFACT_NAME'),
    caminhoArtefatos: obrigatoria('ARTIFACTS_PATH'),
    urlProvedorWebSocket: obrigatoria('WEB_SOCKET_PROVIDER_URL'),
    chavePrivada: obrigatoria('PRIVATE_KEY'),
    tempoLimiteValidacaoMs: Number(
        opcional('TEMPO_LIMITE_VALIDACAO_MS', '60000')
    ),
    tempoSensorInativoMs: Number(
        opcional('TEMPO_SENSOR_INATIVO_MS', '10000')
    ),
    intervaloVerificacaoSensorMs: Number(
        opcional('INTERVALO_VERIFICACAO_SENSOR_MS', '10000')
    ),
};
