export class PlayerStats {
    constructor(vidaMaxima = 100) {
        this.vidaMaxima = vidaMaxima;
        this.vida = vidaMaxima;
        this.moedas = 0;
        this.tempoEmSegundos = 0;
        this.morreu = false;
    }

    tick() {
        if (!this.morreu) this.tempoEmSegundos += 1;
    }

    getTempoFormatado() {
        const minutos = Math.floor(this.tempoEmSegundos / 60);
        const segundos = this.tempoEmSegundos % 60;
        return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
    }

    coletarMoeda(quantidade = 1) {
        this.moedas += quantidade;
    }

    gastarMoedas(quantidade) {
        if (this.moedas >= quantidade) {
            this.moedas -= quantidade;
            return true;
        }
        return false;
    }

    tomarDano(dano) {
        this.vida -= dano;
        if (this.vida <= 0) {
            this.vida = 0;
            this.morreu = true;
        }
    }

    curar(quantidade) {
        this.vida += quantidade;
        if (this.vida > this.vidaMaxima) this.vida = this.vidaMaxima;
    }

    getPorcentagemVida() {
        return (this.vida / this.vidaMaxima) * 100;
    }

    estaVivo() {
        return !this.morreu;
    }
}