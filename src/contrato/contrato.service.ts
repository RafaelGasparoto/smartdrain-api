import { readFileSync } from 'fs';
import { ethers } from 'ethers';
import { ambiente } from '../config/ambiente';
import { ManutencaoBocaDeLoboContract } from './contrato.interface';

class ContratoService {
    private contrato: ManutencaoBocaDeLoboContract | null = null;

    async obterContrato(): Promise<ManutencaoBocaDeLoboContract> {
        if (!this.contrato) {
            this.contrato = await this.configurarContrato();
        }
        return this.contrato;
    }

    private async configurarContrato(): Promise<ManutencaoBocaDeLoboContract> {
        const enderecosImplantados = JSON.parse(
            readFileSync(ambiente.caminhoImplantacao, 'utf8')
        );
        const enderecoContrato = enderecosImplantados[ambiente.nomeArtefato];

        const artefato = JSON.parse(
            readFileSync(ambiente.caminhoArtefatos, 'utf8')
        );
        const abi = artefato.abi;

        const provedor = new ethers.WebSocketProvider(
            ambiente.urlProvedorWebSocket
        );

        const contratoConector = new ethers.Contract(
            enderecoContrato,
            abi,
            provedor
        );

        console.log(`Conectado ao contrato em: ${enderecoContrato}`);

        const carteira = new ethers.Wallet(ambiente.chavePrivada, provedor);
        const carteiraComNonceGerenciado = new ethers.NonceManager(carteira);

        const contrato = contratoConector.connect(
            carteiraComNonceGerenciado
        ) as ManutencaoBocaDeLoboContract;

        return contrato;
    }
}

export const contratoService = new ContratoService();
