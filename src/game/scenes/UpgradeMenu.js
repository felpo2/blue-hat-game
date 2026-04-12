import { Scene } from 'phaser';

export class UpgradeMenu extends Scene {
    constructor() {
        super({ key: 'UpgradeMenu' });
    }

    create(data) {
        this.stats = data.stats;
        const W = this.scale.width;
        const H = this.scale.height;

        this.add.rectangle(0, 0, W, H, 0x000000, 0.85).setOrigin(0);

        this.add.text(W / 2, H * 0.15, 'ESCOLHA UM UPGRADE', {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        const opcoes = [
            // UPGRADES PLAYER 
            {
                titulo: 'CURATIVO\n(+50 HP)',
                descricao: 'Recupera danos',
                custo: 5,
                cor: 0xaa2266,
                acao: () => {
                    if (this.stats.gastarMoedas(5)) {
                        this.stats.curar(50);
                        this.fecharMenu();
                    }
                }
            },
            {
                titulo: 'TIRO RAPIDO\n(-50ms)',
                descricao: 'Atire veloz',
                custo: this.stats.custoUpgradeTiro,
                cor: 0x33ff33,
                acao: () => {
                    if (this.stats.gastarMoedas(this.stats.custoUpgradeTiro)) {
                        this.stats.intervaloTiro = Math.max(100, this.stats.intervaloTiro - 50);
                        this.stats.custoUpgradeTiro += 10;
                        this.fecharMenu();
                    }
                }
            },
            //  UPGRADES TORRE PRINCIPAL (MEIO) 
            {
                titulo: 'T.CENTRAL: ATK\n(+20 DANO)',
                descricao: 'Torre do meio mais forte',
                custo: 10,
                cor: 0xff8c00,
                tipo: 'principal',
                acao: () => {
                    if (this.stats.gastarMoedas(10)) {
                        this.stats.danoTorrePrincipal += 20;
                        this.fecharMenu();
                    }
                }
            },
            {
                titulo: 'T.CENTRAL: VIDA\n(+100 HP)',
                descricao: 'Mais vida para o meio',
                custo: 12,
                cor: 0x44bbff,
                tipo: 'principal',
                acao: () => {
                    if (this.stats.gastarMoedas(12)) {
                        const gameScene = this.scene.get('Game');
                        if (gameScene && gameScene.torre) {
                            gameScene.torre.vidaMaxima += 100;
                            gameScene.torre.vida += 100;
                        }
                        this.fecharMenu();
                    }
                }
            },
            // UPGRADES MINI TORRE 
            {
                titulo: 'MINI: DANO\n(+15 ATK)',
                descricao: 'Mini torres letais',
                custo: 8,
                cor: 0xff44ff,
                tipo: 'mini',
                acao: () => {
                    if (this.stats.gastarMoedas(8)) {
                        this.stats.danoMiniTorre += 15;
                        this.fecharMenu();
                    }
                }
            },
            {
                titulo: 'MINI: ALCANCE\n(+100 RANGE)',
                descricao: 'Mini torres enxergam longe',
                custo: 10,
                cor: 0xaa44ff,
                tipo: 'mini',
                acao: () => {
                    if (this.stats.gastarMoedas(10)) {
                        this.stats.rangeMiniTorre += 100;
                        this.fecharMenu();
                    }
                }
            }
        ];

        // LOGICA DE FILTRO: Só mostra upgrades de Mini Torre se houver torres construídas *Felipe Tomadas isso me causou uma dor de cabeça mas foi resolvido kkkk
        const gameScene = this.scene.get('Game');
        const temMiniTorre = gameScene && gameScene.grupoTorresSecundarias && gameScene.grupoTorresSecundarias.getLength() > 0;

        const poolFiltrada = opcoes.filter(op => {
            if (op.tipo === 'mini' && !temMiniTorre) return false;
            return true;
        });

        const sorteados = Phaser.Utils.Array.Shuffle(poolFiltrada).slice(0, 3);
        const cardWidth = 240;
        const spacing = 30;
        const startX = (W - ((cardWidth * 3) + (spacing * 2))) / 2 + (cardWidth / 2);

        sorteados.forEach((opt, index) => {
            const x = startX + (index * (cardWidth + spacing));
            const y = H / 2;
            const podeComprar = this.stats.moedas >= opt.custo;

            const card = this.add.rectangle(x, y, cardWidth, 340, podeComprar ? opt.cor : 0x333333, 0.9)
                .setStrokeStyle(4, 0xffffff)
                .setInteractive({ useHandCursor: true });

            this.add.text(x, y - 110, opt.titulo, {
                fontFamily: '"Press Start 2P"',
                fontSize: '12px',
                fill: '#fff',
                align: 'center',
                lineSpacing: 8
            }).setOrigin(0.5);

            this.add.text(x, y - 10, opt.descricao, {
                fontFamily: '"Press Start 2P"',
                fontSize: '8px',
                fill: '#ddd',
                align: 'center',
                wordWrap: { width: cardWidth - 40 }
            }).setOrigin(0.5);

            this.add.text(x, y + 100, `$ ${opt.custo}`, {
                fontFamily: '"Press Start 2P"',
                fontSize: '20px',
                fill: podeComprar ? '#ffe066' : '#ff4444'
            }).setOrigin(0.5);

            if (podeComprar) {
                card.on('pointerdown', () => {
                    this.sound.play('select');
                    opt.acao();
                });
                card.on('pointerover', () => {
                    card.setScale(1.05);
                    card.setStrokeStyle(4, 0xffff00);
                });
                card.on('pointerout', () => {
                    card.setScale(1);
                    card.setStrokeStyle(4, 0xffffff);
                });
            } else {
                card.setAlpha(0.6);
            }
        });

        const btnPular = this.add.text(W / 2, H * 0.88, '[ PULAR (GRATIS) ]', {
            fontFamily: '"Press Start 2P"',
            fontSize: '10px',
            fill: '#888'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btnPular.on('pointerdown', () => {
            this.sound.play('select');
            this.fecharMenu();
        });
        
        btnPular.on('pointerover', () => btnPular.setColor('#ffffff'));
        btnPular.on('pointerout', () => btnPular.setColor('#888888'));
    }

    fecharMenu(acao = 'resume_normal') {
        const gameScene = this.scene.get('Game');
        if (gameScene && gameScene.bgMusic) gameScene.bgMusic.setMute(false);
        this.scene.resume('Game', { acao: acao });
        this.scene.stop();
    }
}
