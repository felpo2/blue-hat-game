// IMPORTANTE: Migrar os status que não são do player para outra classe ou mudar o nome da classe


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
        this.xpMaximo = 30; // Começa mais fácil (3 monstros +- 10xp)
        this.nivelAtual = 1;

        // faz upgrade na moeda
        this.multiplicadorMoeda = 1;
        // faz upgrade no tiro
        this.intervaloTiro = 800;   // mais lento no início
        this.danoTiro = 12;         // menos dano base
        this.velocidade = 140;      // mais lento
        
        // Custo upgrade na vida
        this.custoUpgradeVida = 5;
        // Custo do upgrade na moeda
        this.custoUpgradeMoeda = 5;
        // Custo do upgrade no tiro
        this.custoUpgradeTiro = 5;
        // Custo de velocidade 
        this.custoUpgradeVelocidade = 10;
        // Custo da Construção de Mini Torre 
        this.custoConstruirTorre = 10;

        // Stats Globais de Torre Principal
        this.danoTorrePrincipal = 40;
        this.rangeTorrePrincipal = 450;
        this.vidaBaseTorrePrincipal = 500;

        // Stats Globais de Mini Torre 
        this.danoMiniTorre = 14;
        this.rangeMiniTorre = 280;
        this.vidaBaseMiniTorre = 200;
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
        if (this.moedas >= (quantidade || 0)) {
            this.moedas -= (quantidade || 0);
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
            // Dificuldade progressiva mais suave: aumenta 50% por nível
            this.xpMaximo = Math.floor(this.xpMaximo * 1.5);
            levelUp = true;
        }
        return levelUp;
    }
}
