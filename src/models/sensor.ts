import { SensorStatus } from '../enum/status-sensor.enum';

export class Sensor {
    id: number;
    latitude: number;
    longitude: number;
    status: SensorStatus;
    idChamado?: number;
    ultimoSinal: number;

    constructor(
        id: number,
        latitude: number,
        longitude: number,
        status: SensorStatus
    ) {
        this.id = id;
        this.latitude = latitude;
        this.longitude = longitude;
        this.status = status;
        this.ultimoSinal = Date.now();
    }

    public atualizarSinal() {
        this.ultimoSinal = Date.now();
        console.log(
            `Sinal atualizado para o sensor ${this.id} em ${new Date(this.ultimoSinal).toLocaleTimeString()}`
        );

        if (this.status === SensorStatus.Obstruido) {
            this.status = SensorStatus.Normalizado;
        }
    }

    public verificarAtivo(sinalTimeout: number): boolean {
        const atividade = Date.now() - this.ultimoSinal < sinalTimeout;

        if (atividade) {
            console.log(`Sensor ${this.id} está ativo.`);
        } else {
            console.log(`Sensor ${this.id} está inativo.`);
            this.status = SensorStatus.Obstruido;
        }

        return atividade;
    }

    public tempoDesdeUltimoSinal(): number {
        return Date.now() - this.ultimoSinal;
    }

    public setIdChamado(idChamado?: number) {
        this.idChamado = idChamado;
    }

    public marcarSemSinal(): void {
        this.ultimoSinal = 0;
    }
}
