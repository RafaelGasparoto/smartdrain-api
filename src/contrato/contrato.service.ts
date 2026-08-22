import { readFileSync } from 'fs';
import { ethers } from 'ethers';
import { env } from '../config/env';
import { ManutencaoBocaDeLoboContract } from './contrato.interface';

class ContratoService {
    private contract: ManutencaoBocaDeLoboContract | null = null;

    async getContrato(): Promise<ManutencaoBocaDeLoboContract> {
        if (!this.contract) {
            this.contract = await this.setupContract();
        }
        return this.contract;
    }

    private async setupContract(): Promise<ManutencaoBocaDeLoboContract> {
        const deployedAddresses = JSON.parse(
            readFileSync(env.deploymentPath, 'utf8')
        );
        const contractAddress = deployedAddresses[env.artifactName];

        const artifact = JSON.parse(readFileSync(env.artifactsPath, 'utf8'));
        const abi = artifact.abi;

        const provider = new ethers.WebSocketProvider(
            env.webSocketProviderUrl
        );

        const contratoConector = new ethers.Contract(
            contractAddress,
            abi,
            provider
        );

        console.log(`Conectado ao contrato em: ${contractAddress}`);

        const wallet = new ethers.Wallet(env.privateKey, provider);

        const contrato = contratoConector.connect(
            wallet
        ) as ManutencaoBocaDeLoboContract;

        return contrato;
    }
}

export const contratoService = new ContratoService();
