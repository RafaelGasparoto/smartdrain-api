# SmartDrain API

Backend do projeto SmartDrain: integra sensores IoT (via MQTT) com o contrato inteligente, abrindo e acompanhando chamados de manutenção de bocas de lobo automaticamente.

## Sobre o projeto

Este repositório faz parte de um TCC sobre o uso de blockchain para automatizar, rastrear e auditar a manutenção de bocas de lobo. O projeto é dividido em três repositórios:

- [smartdrain-contract](https://github.com/RafaelGasparoto/smartdrain-contract) — contrato inteligente
- **smartdrain-api** (este repositório) — API que integra os sensores (MQTT) com a blockchain
- [smartdrain-web](https://github.com/RafaelGasparoto/smartdrain-web) — dashboard e painel do técnico

## Requisitos

- Node.js
- npm
- Um nó local do `smartdrain-contract` rodando (`npm run start`) com o contrato deployado (`npm run deploy`)

## Instalação

```shell
npm install
```

Configure o `.env` na raiz do projeto (use o `.env` de exemplo abaixo como base):

```env
DEPLOYMENT_PATH = "../smartdrain-contract/ignition/deployments/chain-31337/deployed_addresses.json"
ARTIFACTS_PATH  = "../smartdrain-contract/ignition/deployments/chain-31337/artifacts/ManutencaoBocaDeLoboModule#ManutencaoBocaDeLobo.json"
ARTIFACT_NAME = "ManutencaoBocaDeLoboModule#ManutencaoBocaDeLobo"
WEB_SOCKET_PROVIDER_URL = "ws://localhost:8545"
PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

TEMPO_LIMITE_VALIDACAO_MS = "60000"

TECNICO_PRIVATE_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
```

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `DEPLOYMENT_PATH` | Sim | Caminho do `deployed_addresses.json` gerado pelo `npm run deploy` do `smartdrain-contract`. **Não precisa editar o conteúdo desse arquivo nem colar o endereço do contrato aqui** — o Ignition escreve o endereço nele automaticamente a cada deploy, e a API lê esse arquivo direto ao iniciar. Só ajuste o caminho se o deploy for feito em outra rede (a pasta `chain-31337` é o id da rede local do Hardhat). |
| `ARTIFACTS_PATH` | Sim | Caminho do artefato do contrato (ABI) gerado pelo mesmo deploy, também preenchido automaticamente pelo Ignition — nada aqui é preenchido manualmente. |
| `ARTIFACT_NAME` | Sim | Chave usada para achar o endereço dentro do `deployed_addresses.json`. Segue o padrão `<NomeDoModuleIgnition>#<NomeDoContrato>` (ver `ignition/modules/ManutencaoBocaDeLobo.ts` no `smartdrain-contract`) — só muda se o módulo ou o contrato forem renomeados. |
| `WEB_SOCKET_PROVIDER_URL` | Sim | Endpoint WebSocket do nó (`npm run start` no `smartdrain-contract` sobe um nó Hardhat local em `ws://localhost:8545`). |
| `PRIVATE_KEY` | Sim | Chave da carteira "dona" do contrato, usada pela própria API para abrir/finalizar/reabrir chamados (funções restritas por `apenasDono`). Em ambiente local, use uma das contas impressas pelo `npx hardhat node` (por padrão a Account #0). |
| `TEMPO_LIMITE_VALIDACAO_MS` | Não (padrão `60000`) | Tempo, em ms, que o técnico tem para validar a manutenção antes do chamado voltar sozinho para "Em Andamento". |
| `TECNICO_PRIVATE_KEY` | Não | Não é lida pelo código (não existe em `src/config/ambiente.ts`) — é só uma cópia de conveniência de uma conta de teste do Hardhat (Account #1), pra colar rápido ao testar os endpoints de técnico manualmente. O painel do técnico (`smartdrain-web/tecnico.js`) já usa essa mesma chave fixa. |

## Uso

```shell
npm run dev
```
