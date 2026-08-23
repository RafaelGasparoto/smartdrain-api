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

Configure o `.env` (veja as variáveis usadas em `src/config/ambiente.ts`).

## Uso

```shell
npm run dev
```
