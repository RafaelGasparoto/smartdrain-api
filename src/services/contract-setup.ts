import { readFileSync } from 'fs';
import { ethers } from 'ethers';
import { config } from 'dotenv';
import { ManutencaoBocaDeLoboContract } from '../interfaces/contract-interface';
import process = require('process');

config();

export async function setupContract(): Promise<ManutencaoBocaDeLoboContract> {
    const deployedAddresses = JSON.parse(
        readFileSync(process.env.DEPLOYMENT_PATH!, 'utf8')
    );
    const contractAddress = deployedAddresses[process.env.ARTIFACT_NAME!];

    const artifact = JSON.parse(
        readFileSync(process.env.ARTIFACTS_PATH!, 'utf8')
    );
    const abi = artifact.abi;

    const provider = new ethers.WebSocketProvider('ws://127.0.0.1:8545');
    const contract = new ethers.Contract(contractAddress, abi, provider);

    console.log(`Conectado ao contrato em: ${contractAddress}`);
    const signer = await provider.getSigner(1);

    const contractWithSigner = contract.connect(
        signer
    ) as ManutencaoBocaDeLoboContract;

    return contractWithSigner;
}
