import { config } from 'dotenv';

config();

function obrigatoria(nome: string): string {
    const valor = process.env[nome];

    if (!valor) {
        throw new Error(`Variável de ambiente ${nome} não definida.`);
    }

    return valor;
}

export const ambiente = {
    caminhoImplantacao: obrigatoria('DEPLOYMENT_PATH'),
    nomeArtefato: obrigatoria('ARTIFACT_NAME'),
    caminhoArtefatos: obrigatoria('ARTIFACTS_PATH'),
    urlProvedorWebSocket: obrigatoria('WEB_SOCKET_PROVIDER_URL'),
    chavePrivada: obrigatoria('PRIVATE_KEY'),
};
