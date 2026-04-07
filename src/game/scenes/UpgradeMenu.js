import { Scene } from 'phaser';

export class UpgradeMenu extends Scene {
    constructor() {
        super({ key: 'UpgradeMenu' });
    }

    create(data) {
        this.stats = data.stats;
        const W = this.scale.width;
        const H = this.scale.height;

        const darkBg = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7);
        darkBg.setInteractive();

        this.add.text(W / 2, H / 2 - 250, 'ESCOLHA SEU UPGRADE', {
            fontFamily: 'Courier New',
            fontSize: '36px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);

        this.add.text(W / 2, H / 2 - 200, `Carteira: $${this.stats.moedas}`, {
            fontFamily: 'Courier New',
            fontSize: '24px',
            fill: '#ffe066'
        }).setOrigin(0.5);

        // lista de todas as 4 opções possíveis (adicionar mais opções e mais status)
        const opcoes = [
            {
                titulo: 'Vida Máxima\n(+20)',
                descricao: 'Aumente o cap de sangue',
                custo: this.stats.custoUpgradeVida,
                cor: 0xff4444,
                acao: () => {
                    if (this.stats.gastarMoedas(this.stats.custoUpgradeVida)) {
                        this.stats.vidaMaxima += 20;
                        this.stats.vida += 20;
                        this.stats.custoUpgradeVida += 10;
                        this.fecharMenu();
                    }
                }
            },
            {
                titulo: 'Dinheiro Extra\n(+50%)',
                descricao: 'Lucre mais nas moedas',
                custo: this.stats.custoUpgradeMoeda,
                cor: 0xffe066,
                acao: () => {
                    if (this.stats.gastarMoedas(this.stats.custoUpgradeMoeda)) {
                        this.stats.multiplicadorMoeda += 0.5;
                        this.stats.custoUpgradeMoeda += 10;
                        this.fecharMenu();
                    }
                }
            },
            {
                titulo: 'Tiro Rápido\n(-20ms)',
                descricao: 'Reduz Cooldown de Disparo',
                custo: this.stats.custoUpgradeTiro,
                cor: 0x44ff44,
                acao: () => {
                    if (this.stats.gastarMoedas(this.stats.custoUpgradeTiro)) {
                        this.stats.intervaloTiro = Math.max(20, this.stats.intervaloTiro - 20);
                        this.stats.custoUpgradeTiro += 10;
                        this.fecharMenu();
                    }
                }
            },
            {
                titulo: 'Construir\nTorre',
                descricao: 'Posiciona torre que atira',
                custo: this.stats.custoConstruirTorre,
                cor: 0x4444ff,
                acao: () => {
                    if (this.stats.gastarMoedas(this.stats.custoConstruirTorre)) {
                        // não aumenta de preço logo de cara, ou podemos aumentar
                        this.stats.custoConstruirTorre += 15;
                        this.iniciarModoConstrucao();
                    }
                }
            }
        ];

        // sorteia exatamente 3 opções
        Phaser.Utils.Array.Shuffle(opcoes);
        const escolhidas = opcoes.slice(0, 3);

        const cardWidth = 220;
        const cardHeight = 280;
        const spacing = 40;
        const startX = (W / 2) - cardWidth - spacing;

        // renderiza as 3 Cartas
        escolhidas.forEach((opt, index) => {
            const x = startX + (index * (cardWidth + spacing));
            const y = H / 2 + 20;

            this.criarCarta(x, y, cardWidth, cardHeight, opt);
        });

        // botão de Pular para não prender o jogador sem dinheiro
        const pularBg = this.add.rectangle(W / 2, H - 80, 200, 40, 0x550000).setInteractive();
        pularBg.setStrokeStyle(2, 0xffffff);
        this.add.text(W / 2, H - 80, 'PULAR DE GRAÇA', {
            fontFamily: 'Courier New',
            fontSize: '18px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        pularBg.on('pointerdown', () => this.fecharMenu());
        pularBg.on('pointerover', () => pularBg.setFillStyle(0x770000));
        pularBg.on('pointerout', () => pularBg.setFillStyle(0x550000));
    }

    criarCarta(x, y, w, h, config) {
        const podeComprar = this.stats.moedas >= config.custo;

        // fundo da Carta
        const bgCarta = this.add.rectangle(x, y, w, h, 0x222222).setInteractive();
        bgCarta.setStrokeStyle(4, podeComprar ? config.cor : 0x555555);

        if (podeComprar) {
            bgCarta.on('pointerover', () => { bgCarta.setScale(1.05); });
            bgCarta.on('pointerout', () => { bgCarta.setScale(1.0); });
            bgCarta.on('pointerdown', config.acao);
        } else {
            bgCarta.setAlpha(0.6); // deixa fosca se não puder comprar
        }

        // textos 
        this.add.text(x, y - 80, config.titulo, {
            fontFamily: 'Courier New',
            fontSize: '22px',
            fill: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this.add.text(x, y + 10, config.descricao, {
            fontFamily: 'Arial',
            fontSize: '14px',
            fill: '#cccccc',
            align: 'center',
            wordWrap: { width: w - 20 }
        }).setOrigin(0.5);

        // valor
        const bgCusto = this.add.rectangle(x, y + 80, 120, 40, podeComprar ? config.cor : 0x333333);
        const corLetraCusto = podeComprar ? '#000000' : '#ff5555';
        this.add.text(x, y + 80, `$ ${config.custo}`, {
            fontFamily: 'Courier New',
            fontSize: '22px',
            fill: corLetraCusto,
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    fecharMenu() {
        this.scene.resume('Game', { acao: 'resume_normal' });
        this.scene.stop();
    }

    iniciarModoConstrucao() {
        this.scene.resume('Game', { acao: 'modo_construcao' });
        this.scene.stop();
    }
}
