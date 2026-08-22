import { config } from 'dotenv';

config();

function obrigatoria(nome: string): string {
    const valor = process.env[nome];

    if (!valor) {
        throw new Error(`Variável de ambiente ${nome} não definida.`);
    }

    return valor;
}

export const env = {
    deploymentPath: obrigatoria('DEPLOYMENT_PATH'),
    artifactName: obrigatoria('ARTIFACT_NAME'),
    artifactsPath: obrigatoria('ARTIFACTS_PATH'),
    webSocketProviderUrl: obrigatoria('WEB_SOCKET_PROVIDER_URL'),
    privateKey: obrigatoria('PRIVATE_KEY'),
};
