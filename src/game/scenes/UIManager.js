export class UIManager {
    constructor(cena, stats) {
        this.cena = cena;
        this.stats = stats;

        const W = cena.scale.width;
        const H = cena.scale.height;
        const margin = 20;

        // TOPO
        this.textoMoedas = cena.add.text(margin, margin, '$ 0', {
            fontFamily: '"Press Start 2P"',
            fontSize: '18px',
            fill: '#ffe066'
        }).setScrollFactor(0).setDepth(100);

        this.textoOnda = cena.add.text(W - margin, margin, 'ONDA: 1', {
            fontFamily: '"Press Start 2P"',
            fontSize: '16px',
            fill: '#ff5555'
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);

        this.barraXpFundo = cena.add.rectangle(W / 2, margin + 5, 400, 10, 0x1a1a1a)
            .setOrigin(0.5, 0).setScrollFactor(0).setDepth(100).setStrokeStyle(1, 0xffffff, 0.2);

        this.barraXpGlow = cena.add.rectangle((W / 2) - 200, margin + 5, 0, 10, 0x6060c2)
            .setOrigin(0, 0).setScrollFactor(0).setDepth(101);

        this.xpWidth = 0; 

        this.textoNivel = cena.add.text(W / 2, margin + 25, 'LV. 1', {
            fontFamily: '"Press Start 2P"',
            fontSize: '10px',
            fill: '#ffffff'
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(102);

        // EM BAIXO 
        this.barraVidaFundo = cena.add.rectangle(margin, H - margin - 20, 200, 15, 0x1a1a1a)
            .setOrigin(0, 0).setScrollFactor(0).setDepth(100).setStrokeStyle(1, 0xffffff, 0.2);

        this.barraVidaPreenchimento = cena.add.rectangle(margin, H - margin - 20, 200, 15, 0x22dd44)
            .setOrigin(0, 0).setScrollFactor(0).setDepth(101);

        this.vidaWidth = 200; 

        this.textoVida = cena.add.text(margin + 100, H - margin - 12, 'HP: 100/100', {
            fontFamily: '"Press Start 2P"',
            fontSize: '8px',
            fill: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

        this.textoStatus = cena.add.text(W / 2, H - margin - 12, '', {
            fontFamily: '"Press Start 2P"',
            fontSize: '10px',
            fill: '#ffffff',
            alpha: 0.8
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

        this.textoTempo = cena.add.text(W / 2, margin - 10, '00:00', {
            fontFamily: '"Press Start 2P"',
            fontSize: '12px',
            fill: '#ffffff'
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

        // BOTÃO PAUSE 
        this.btnPause = cena.add.text(W - margin, margin + 30, '[PAUSE]', {
            fontFamily: '"Press Start 2P"',
            fontSize: '10px',
            fill: '#ffffff',
            backgroundColor: '#1a1a1a',
            padding: { x: 6, y: 4 }
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(100).setInteractive({ useHandCursor: true });

        this.btnPause.on('pointerdown', () => {
            cena.sound.play('select');
            cena.scene.pause('Game');
            cena.scene.launch('PauseMenu');
        });

        // BOTÃO CONSTRUIR TORRE
        const btnTorre = cena.add.text(W - margin, H - margin - 20, '[ MINI TORRE: $10 ]', {
            fontFamily: '"Press Start 2P"',
            fontSize: '12px',
            fill: '#ffffff',
            backgroundColor: '#1a4a1a',
            padding: { x: 20, y: 10 }
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(100)
          .setInteractive({ useHandCursor: true });

        btnTorre.on('pointerdown', (pointer, localX, localY, event) => {
            if (!this.stats || !this.stats.estaVivo()) return;
            if (cena.modoConstrucaoAtivo) return; // Não deixa pagar duas vezes se já estiver construindo
            
            const custo = this.stats.custoConstruirTorre;
            if (this.stats.moedas < custo) return;
            
            if (this.stats.gastarMoedas(custo)) {
                this.stats.custoConstruirTorre += 15;
                cena.sound.play('select');
                cena.iniciarModoConstrucao();
                
                // Impede que o clique no botão se propague para o mundo e coloque uma torre imediatamente
                if (event) event.stopPropagation();
            }
        });

        this.btnTorre = btnTorre;
    }

    atualizar() {
        const s = this.stats;
        if (!s) return;

        this.textoTempo.setText(s.getTempoFormatado());
        this.textoMoedas.setText(`$ ${Math.floor(s.moedas)}`);
        this.textoVida.setText(`HP: ${Math.ceil(s.vida)}/${s.vidaMaxima}`);
        this.textoOnda.setText(`ONDA: ${s.rodada}`);
        this.textoNivel.setText(`LV. ${s.nivelAtual}`);

        const propVida = Math.max(0, s.vida / s.vidaMaxima);
        this.barraVidaPreenchimento.width = 200 * propVida;
        
        const propXp = Math.max(0, (s.xp || 0) / (s.xpMaximo || 100));
        this.barraXpGlow.width = 400 * propXp;
        
        const cad = (s.intervaloTiro / 1000).toFixed(2);
        this.textoStatus.setText(
            `DMG: ${s.danoTiro} | ASPD: ${cad}s | SPD: ${s.velocidade}`
        );

        if (this.btnTorre) {
            const custo = s.custoConstruirTorre;
            const temMoedas = s.moedas >= custo;
            this.btnTorre.setText(`[ MINI TORRE: $${custo} ]`);
            this.btnTorre.setBackgroundColor(temMoedas ? '#22dd44' : '#551111');
        }
    }
}
