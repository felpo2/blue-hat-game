export class PlayerStats {
    constructor(vidaMaxima = 100) {
        this.vidaMaxima = vidaMaxima;
        this.vida = vidaMaxima;
        this.vidas = 5;
        this.moedas = 0;
        this.tempoEmSegundos = 0;
        this.morreu = false;

        // faz upgrade na moeda
        this.multiplicadorMoeda = 1;
        // faz upgrade no tiro
        this.intervaloTiro = 200;
        //  Custo upgrade na vida
        this.custoUpgradeVida = 10;
        // Custo do upgrade na moeda
        this.custoUpgradeMoeda = 10;
        // Custo do upgrade no tiro
        this.custoUpgradeTiro = 10;
        // Custo da Construção de Torre Secundaria
        this.custoConstruirTorre = 30;
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
            this.vidas -= 1;
            if (this.vidas > 0) {
                // recupera a vida a custo de 1 das 5 vidas
                this.vida = this.vidaMaxima;
            } else {
                // game over final
                this.vida = 0;
                this.morreu = true;
            }
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