# SmartDrain API

Backend do projeto SmartDrain: integra sensores IoT (via MQTT) com o contrato inteligente, abrindo e acompanhando chamados de manutenção de bocas de lobo automaticamente.

## Sobre o projeto

Este repositório faz parte de um TCC sobre o uso de blockchain para automatizar, rastrear e auditar a manutenção de bocas de lobo. O projeto é dividido em três repositórios:

- [smartdrain-contract](https://github.com/RafaelGasparoto/smartdrain-contract) — contrato inteligente
- **smartdrain-api** (este repositório) — API que integra os sensores (MQTT) com a blockchain
- [smartdrain-web](https://github.com/RafaelGasparoto/smartdrain-web) — dashboard e painel do técnico

## Rodando tudo com Docker (mais rápido)

O [`docker-compose.yml`](docker-compose.yml) fica neste repositório, na raiz. Baixe só esse arquivo e rode:

```shell
docker compose pull
docker compose up
```

Requisito: Docker Desktop instalado e em execução.

| Serviço | Endereço |
| --- | --- |
| Dashboard | http://localhost:8080 |
| Painel do técnico | http://localhost:8080/tecnico.html |
| Simulador de sensores | http://localhost:8080/simulador.html |
| API (este repositório) | http://localhost:3000 |
| Blockchain local (Hardhat) | `localhost:8545` |
| Broker MQTT | `localhost:1883` (MQTT) / `localhost:9001` (WebSocket) |

Pra derrubar: `Ctrl+C` e `docker compose down`.

### Ajustando os tempos

As variáveis de ambiente da API ficam no bloco `environment:` do serviço `api` no `docker-compose.yml`. As que controlam tempos podem ser alteradas livremente:

| Variável | Valor no compose | Descrição |
| --- | --- | --- |
| `TEMPO_SENSOR_INATIVO_MS` | `10000` | Tempo sem sinal para o sensor ser considerado obstruído e abrir chamado |
| `INTERVALO_VERIFICACAO_SENSOR_MS` | `15000` | De quanto em quanto tempo a API verifica o sinal dos sensores |
| `TEMPO_LIMITE_VALIDACAO_MS` | `60000` | Tempo para a validação da manutenção expirar e o chamado voltar para "Em Andamento" |

Depois de alterar, basta recriar o container (não precisa rebuildar a imagem):

```shell
docker compose up -d api
```

A descrição completa de todas as variáveis está em [Instalação](#instalação).

## Rodando sem Docker

### Requisitos

- Node.js
- npm
- Um nó local do `smartdrain-contract` rodando (`npm run start`) com o contrato deployado (`npm run deploy`)

### Instalação

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
TEMPO_SENSOR_INATIVO_MS = "10000"
INTERVALO_VERIFICACAO_SENSOR_MS = "15000"

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
| `TEMPO_SENSOR_INATIVO_MS` | Não (padrão `10000`) | Tempo, em ms, sem receber sinal para o sensor ser considerado inativo (obstruído) e abrir chamado. Deve ser maior que o intervalo de envio do sensor (o simulador envia a cada 4s). |
| `INTERVALO_VERIFICACAO_SENSOR_MS` | Não (padrão `10000`) | De quanto em quanto tempo, em ms, a API verifica o sinal dos sensores. Somado ao `TEMPO_SENSOR_INATIVO_MS`, dá o tempo máximo até uma obstrução virar chamado. |
| `TECNICO_PRIVATE_KEY` | Não | Não é lida pelo código (não existe em `src/config/ambiente.ts`) — é só uma cópia de conveniência de uma conta de teste do Hardhat (Account #1), pra colar rápido ao testar os endpoints de técnico manualmente. O painel do técnico (`smartdrain-web/tecnico.js`) já usa essa mesma chave fixa. |
| `BROKER_URL` | Não (padrão `mqtt://broker.hivemq.com`) | URL do broker MQTT que a API escuta (ver `src/sensor/broker.constant.ts`). No ambiente Docker (raiz do projeto, `docker-compose.yml`) é sobrescrita para `mqtt://mosquitto:1883`, apontando pro broker local. |
| `TOPICO` | Não (padrão `sensor/sinal`) | Tópico MQTT usado para receber o sinal dos sensores. |

### Uso

```shell
npm run dev
```
