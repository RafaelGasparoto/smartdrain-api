import { readFileSync } from 'fs';
import { ethers } from 'ethers';
import { config } from 'dotenv';
import { ManutencaoBocaDeLoboContract } from '../interfaces/contrato.interface';
import process = require('process');

config();

class ContractService {
    private contract: ManutencaoBocaDeLoboContract | null = null;

    async getContrato(): Promise<ManutencaoBocaDeLoboContract> {
        if (!this.contract) {
            this.contract = await this.setupContract();
        }
        return this.contract;
    }

    private async setupContract(): Promise<ManutencaoBocaDeLoboContract> {
        const deployedAddresses = JSON.parse(
            readFileSync(process.env.DEPLOYMENT_PATH!, 'utf8')
        );
        const contractAddress = deployedAddresses[process.env.ARTIFACT_NAME!];

        const artifact = JSON.parse(
            readFileSync(process.env.ARTIFACTS_PATH!, 'utf8')
        );
        const abi = artifact.abi;

        const provider = new ethers.WebSocketProvider(
            process.env.WEB_SOCKET_PROVIDER_URL!
        );

        const contratoConector = new ethers.Contract(
            contractAddress,
            abi,
            provider
        );

        console.log(`Conectado ao contrato em: ${contractAddress}`);

        const privateKey = process.env.PRIVATE_KEY!;
        const wallet = new ethers.Wallet(privateKey, provider);

        const contrato = contratoConector.connect(
            wallet
        ) as ManutencaoBocaDeLoboContract;

        return contrato;
    }
}

export const contratoService = new ContractService();
