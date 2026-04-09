export class PlayerStats {
    constructor(vidaMaxima = 100) {
        this.vidaMaxima = vidaMaxima;
        this.vida = vidaMaxima;
        this.vidas = 5;
        this.moedas = 0;
        this.tempoEmSegundos = 0;
        this.morreu = false;
        this.rodada = 1;

        // Sistema de XP
        this.xp = 0;
        this.xpMaximo = 50; // Começa pedindo cap pequeno (5 monstros +- 10xp)
        this.nivelAtual = 1;

        // faz upgrade na moeda
        this.multiplicadorMoeda = 1;
        // faz upgrade no tiro (Velocidade suave)
        this.intervaloTiro = 600;
        this.danoTiro = 25;
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

    ganharXp(quantidade) {
        let levelUp = false;
        this.xp += quantidade;

        if (this.xp >= this.xpMaximo) {
            this.xp -= this.xpMaximo;
            this.nivelAtual++;
            // Aumenta o cap do proximo nivel de forma escalar (50% a mais do anterior)
            this.xpMaximo = Math.floor(this.xpMaximo * 1.5);
            levelUp = true;
        }
        return levelUp;
    }
}