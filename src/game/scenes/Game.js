import { Scene } from 'phaser';


import { Player } from './Player';
import { Spawner } from './SpawnEnemies';
import { Inimigo } from './Inimigo';
import { Torre } from './Torre';
import { TorreSecundaria } from './TorreSecundaria';

import { PlayerStats } from '../scenes/PlayerStats';
import { UIManager } from '../scenes/UIManager';
import { Moeda } from '../scenes/Moeda';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    _criarTexturas() {
        if (this.textures.exists('moeda')) return;
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xffe033);
        g.fillRect(0, 0, 12, 12);
        g.generateTexture('moeda', 12, 12);
        g.destroy();

        // Textura do inimigo
        if (!this.textures.exists('inimigo')) {
            const g2 = this.make.graphics({ x: 0, y: 0, add: false });
            g2.fillStyle(0xff0000);
            g2.fillRect(0, 0, 40, 40);
            g2.generateTexture('inimigo', 40, 40);
            g2.destroy();
        }
    }

    create() {
        this._criarTexturas();

        this.physics.world.setBounds(0, 0, 2000, 2000);
        this.add.grid(1000, 1000, 2000, 2000, 50, 50, 0x000000, 0, 0x333333, 0.5).setDepth(-1);

        this.torre = new Torre(this, 1000, 1000);
        this.player = new Player(this);

        // Câmera segue o player dentro do mundo 2000x2000
        this.cameras.main.setBounds(0, 0, 2000, 2000);
        this.cameras.main.startFollow(this.player.player, true, 0.1, 0.1);

        this.spawner = new Spawner(this);

        this.stats = new PlayerStats(100);
        this.ui = new UIManager(this, this.stats);

        this.grupoMoedas = this.physics.add.group();
        this.grupoTorresSecundarias = this.add.group({ runChildUpdate: false });
        this.projetosTorres = this.physics.add.group(); // Projéteis atirados pela torre secundária

        this.modoConstrucaoAtivo = false;

        // Temporizador: 1 tick por segundo
        this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                if (this.modoConstrucaoAtivo) return; // Pausa o tick no modo contrução invisivel
                this.stats.tick();
                // Verifica se mudou a rodada
                if (this.stats.tempoEmSegundos % 30 === 0 && this.stats.tempoEmSegundos > 0) {
                    this.scene.pause('Game');
                    this.scene.launch('UpgradeMenu', { stats: this.stats });
                }
            }
        });

        // Evento quando a cena game volta do pause
        this.events.on('resume', (sys, data) => {
            if (data && data.acao === 'modo_construcao') {
                this.iniciarModoConstrucao();
            } else {
                this._invencivel = true;
                this.player.player.fillColor = 0xff0000;
                this.time.delayedCall(2000, () => {
                    this._invencivel = false;
                    this.player.player.fillColor = 0x00ff00;
                });
            }
        });

        this.physics.add.collider(
            this.player.player,
            this.spawner.groupEnemies,
            (player, enemy) => this.handleCollision(player, enemy)
        );

        this.physics.add.overlap(
            this.player.player,
            this.grupoMoedas,
            (player, moeda) => this._aoColetarMoeda(player, moeda)
        );

        // Colisão entre projéteis e inimigos
        this.physics.add.overlap(
            this.player.getGrupoProjecteis(),
            this.spawner.groupEnemies,
            (proj, enemy) => this._aoAcertarInimigo(proj, enemy)
        );

        // Colisão dos inimigos contra a Torre (Para causar dano)
        this.physics.add.overlap(
            this.torre.getSprite(),
            this.spawner.groupEnemies,
            (torreSprite, enemy) => this._aoInimigoBaterTorre(enemy)
        );

        // Colisão projeto torre contra inimigos
        this.physics.add.overlap(
            this.projetosTorres,
            this.spawner.groupEnemies,
            (proj, enemy) => this._aoAcertarInimigo(proj, enemy)
        );

        // Input mouse para construir
        this.input.on('pointerdown', (pointer) => {
            if (this.modoConstrucaoAtivo) this._tentarColocarTorre(pointer);
        });

        this._invencivel = false;
    }

    update() {
        if (!this.stats.estaVivo() || this.torre.vida <= 0) return;

        if (this.modoConstrucaoAtivo) {
            this._atualizarVisaoConstrucao();
            return;
        }

        this.player.update();

        // Passar todas as torres pro spawner perseguir
        const todasAsTorres = [this.torre.getSprite(), ...this.grupoTorresSecundarias.getChildren()];
        this.spawner.updateVisandoArray(this.player.player, todasAsTorres);

        // Fazer torres secundárias verificarem se podem atirar
        this.grupoTorresSecundarias.getChildren().forEach(torre => {
            torre.update(this.spawner.groupEnemies);
        });

        this.ui.atualizar();
    }

    handleCollision(player, enemy) {
        // Se está em invencibilidade, ignora colisão
        if (this._invencivel) {
            return;
        }

        // Ativa invencibilidade imediatamente para evitar múltiplos danos
        this._invencivel = true;
        this.time.delayedCall(1200, () => {
            this._invencivel = false;
        });

        // Aplica dano no PlayerStats
        const dano = 10;
        this.stats.tomarDano(dano);
        console.log(`Player levou ${dano} de dano. Vida: ${this.stats.vida}`);


        // Verifica se o player morreu
        if (!this.stats.estaVivo()) {
            console.log('GAME OVER - Player morreu');
            this._gameOver();
        }
    }

    droparMoedas(x, y, quantidade = 1) {
        for (let i = 0; i < quantidade; i++) {
            const moeda = new Moeda(this, x, y);
            this.grupoMoedas.add(moeda);
        }
    }

    _aoColetarMoeda(player, moeda) {
        const valorOriginal = moeda.valor || 1;
        const valor = valorOriginal * this.stats.multiplicadorMoeda;

        moeda.destroy();
        this.stats.coletarMoeda(valor);
        this._mostrarTextoFlutuante(moeda.x, moeda.y, `+${valor}`, '#ffe066');
    }

    _aoAcertarInimigo(proj, enemy) {
        proj.destroy();
        const dano = 10;

        if (enemy instanceof Inimigo) {
            enemy.receberDano(dano);
        } else {
            // Inimigos simples (retângulos sem classe Inimigo)
            if (!enemy.vida) enemy.vida = 30;
            enemy.vida -= dano;

            if (enemy.vida <= 0) {
                this.droparMoedas(enemy.x, enemy.y, 1);
                enemy.destroy();
            }
        }
    }

    _aoInimigoBaterTorre(enemy) {
        if (!this.torre || this.torre.vida <= 0) return;

        enemy.receberDano(999); // Inimigo explode estilo Kamikaze
        this.torre.receberDano(25); // Dá 25 de dano na Torre

        if (this.torre.vida <= 0) {
            console.log('GAME OVER - A Torre Caiu!');
            this._gameOver();
        }
    }

    // contador de texto flutuante para mostrar dano ou moedas coletadas
    _mostrarTextoFlutuante(x, y, mensagem, cor = '#ffffff') {
        const texto = this.add.text(x, y, mensagem, {
            fontFamily: 'Courier New',
            fontSize: '20px',
            fill: cor,
            stroke: '#000',
            strokeThickness: 3
        }).setDepth(200);

        this.tweens.add({
            targets: texto,
            y: y - 60,
            alpha: 0,
            duration: 700,
            ease: 'Power2',
            onComplete: () => texto.destroy()
        });
    }

    // ====== modo de construção da torre de defesa ======

    iniciarModoConstrucao() {
        this.modoConstrucaoAtivo = true;
        this.physics.pause(); // Para os monstros

        // câmera se deslocar para a torre central (: no raio de 1000x1000
        this.cameras.main.stopFollow();
        this.cameras.main.pan(1000, 1000, 800, 'Power2');

        // cria o círculo visual determinando a área límite 
        this.areaRange = this.add.circle(1000, 1000, 400).setStrokeStyle(4, 0x44ff44).setDepth(150);

        // cria um ghost verde claro com opacidade no mouse simulando aonde vai a torre 
        this.torreGhost = this.add.rectangle(0, 0, 40, 40, 0x2244ff, 0.5).setDepth(250);
    }

    _atualizarVisaoConstrucao() {
        // obter posição do mouse no mundo
        const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
        this.torreGhost.setPosition(worldPoint.x, worldPoint.y);

        const distRadius = Phaser.Math.Distance.Between(worldPoint.x, worldPoint.y, 1000, 1000);
        if (distRadius > 400) {
            this.torreGhost.fillColor = 0xff0000;
            this.areaRange.setStrokeStyle(4, 0xff0000);
        } else {
            this.torreGhost.fillColor = 0x2244ff;
            this.areaRange.setStrokeStyle(4, 0x44ff44);
        }
    }

    _tentarColocarTorre(pointer) {
        const worldPoint = pointer.positionToCamera(this.cameras.main);
        const distRadius = Phaser.Math.Distance.Between(worldPoint.x, worldPoint.y, 1000, 1000);

        if (distRadius > 400) {
            this._mostrarTextoFlutuante(worldPoint.x, worldPoint.y, 'Longe da Base!', '#ff0000');
            return;
        }

        // posiciona a torre de verdade
        const novaTorre = new TorreSecundaria(this, worldPoint.x, worldPoint.y);
        this.grupoTorresSecundarias.add(novaTorre);

        // adiciona colisão entre inimigos e essa nova torre
        this.physics.add.overlap(
            novaTorre,
            this.spawner.groupEnemies,
            (t, enemy) => {
                enemy.receberDano(999);
                t.receberDano(30);
            }
        );

        this.sairModoConstrucao();
    }

    sairModoConstrucao() {
        this.modoConstrucaoAtivo = false;

        // retira os fantasmas visuais
        this.areaRange.destroy();
        this.torreGhost.destroy();

        // volta pra câmera do player
        this.cameras.main.pan(this.player.player.x, this.player.player.y, 600, 'Power2');
        this.time.delayedCall(600, () => {
            this.cameras.main.startFollow(this.player.player, true, 0.1, 0.1);
            this.physics.resume();
        });
    }

    dispararProjetilTorre(x, y, alvo) {
        // disparo tele-guiado das torres secundárias
        if (!this.textures.exists('proj_torre')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0x00ffff);
            g.fillRect(0, 0, 10, 10);
            g.generateTexture('proj_torre', 10, 10);
            g.destroy();
        }

        const proj = this.projetosTorres.create(x, y, 'proj_torre');
        this.physics.moveToObject(proj, alvo, 500);

        this.time.delayedCall(4000, () => {
            if (proj && proj.active) proj.destroy();
        });
    }

    _gameOver() {
        this.physics.pause();
        
        // em vez de piscar texto, agora abre a cena de GameOver real
        this.time.delayedCall(1500, () => {
            this.scene.start('GameOver');
        });
    }
}