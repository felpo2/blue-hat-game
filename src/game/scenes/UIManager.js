export class UIManager {
    constructor(cena, stats) {
        this.cena = cena;
        this.stats = stats;

        const W = cena.scale.width;

        // TEMPORIZADOR — centro, topo
        this.textoTempo = cena.add.text(W / 2, 80, '00:00', {
            fontFamily: 'Courier New',
            fontSize: '28px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        })
        .setOrigin(0.5, 0)
        .setScrollFactor(0)
        .setDepth(100);

        // INDICADOR DE ONDA - canto superior direito
        this.textoOnda = cena.add.text(W - 20, 20, 'ONDA: 1', {
            fontFamily: 'Courier New',
            fontSize: '28px',
            fill: '#ff5555',
            stroke: '#000000',
            strokeThickness: 4,
            fontStyle: 'bold'
        })
        .setOrigin(1, 0)
        .setScrollFactor(0)
        .setDepth(100);

        // BARRA DE XP — topo centro
        this.barraXpFundo = cena.add.rectangle(W / 2, 35, 400, 15, 0x111111)
            .setOrigin(0.5, 0)
            .setScrollFactor(0)
            .setDepth(100);

        this.barraXpGlow = cena.add.rectangle((W / 2) - 200, 35, 0, 15, 0x00aaff)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(101);

        this.textoNivel = cena.add.text(W / 2, 43, 'LV. 1', {
            fontFamily: 'Courier New',
            fontSize: '14px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(102);

        // MOEDAS — canto superior esquerdo
        this.textoMoedas = cena.add.text(16, 16, '$ 0', {
            fontFamily: 'Courier New',
            fontSize: '22px',
            fill: '#ffe066',
            stroke: '#000000',
            strokeThickness: 4
        })
        .setScrollFactor(0)
        .setDepth(100);

        // BARRA DE VIDA — fundo vermelho escuro
        this.barraVidaFundo = cena.add.rectangle(16, 52, 200, 18, 0x5c0000)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(100);

        // BARRA DE VIDA — preenchimento
        this.barraVidaPreenchimento = cena.add.rectangle(16, 52, 200, 18, 0x22dd44)
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(101);

        // TEXTO DE VIDA em cima da barra
        this.textoVida = cena.add.text(116, 53, '100 / 100', {
            fontFamily: 'Courier New',
            fontSize: '13px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        })
        .setOrigin(0.5, 0)
        .setScrollFactor(0)
        .setDepth(102);

        // TEXTO DE VIDAS RESERVA
        this.textoVidas = cena.add.text(16, 75, 'Vidas: 5', {
            fontFamily: 'Courier New',
            fontSize: '18px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        })
        .setScrollFactor(0)
        .setDepth(100);
    }

    atualizar() {
        this.textoTempo.setText(this.stats.getTempoFormatado());
        this.textoMoedas.setText(`$ ${this.stats.moedas}`);

        const porcentagem = this.stats.getPorcentagemVida();
        this.barraVidaPreenchimento.width = (porcentagem / 100) * 200;

        if (porcentagem > 60) {
            this.barraVidaPreenchimento.setFillStyle(0x22dd44); // verde
        } else if (porcentagem > 30) {
            this.barraVidaPreenchimento.setFillStyle(0xddcc00); // amarelo
        } else {
            this.barraVidaPreenchimento.setFillStyle(0xdd2222); // vermelho
        }

        this.textoVida.setText(`${this.stats.vida} / ${this.stats.vidaMaxima}`);
        
        // tualiza Quantas vidas extras restam
        this.textoVidas.setText(`Vidas: ${this.stats.vidas}`);

        // atualiza a onda no canto
        this.textoOnda.setText(`ONDA: ${this.stats.rodada}`);

        // atualiza barra de XP
        const pctXp = Math.min(1, this.stats.xp / this.stats.xpMaximo);
        // barra tem tamanho max de 400px de width  
        this.barraXpGlow.width = 400 * pctXp;
        this.textoNivel.setText(`LV. ${this.stats.nivelAtual}`);
    }
}