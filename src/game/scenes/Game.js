import { Scene } from 'phaser';


import { Player   } from './Player';
import { Spawner  } from './SpawnEnemies';
import { Inimigo  } from './Inimigo';

import { PlayerStats } from '../scenes/PlayerStats';
import { UIManager   } from '../scenes/UIManager';
import { Moeda       } from '../scenes/Moeda';

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

        this.player = new Player(this);

        // Câmera segue o player dentro do mundo 2000x2000
        this.cameras.main.setBounds(0, 0, 2000, 2000);
        this.cameras.main.startFollow(this.player.player, true, 0.1, 0.1);

        this.spawner = new Spawner(this);

        this.stats = new PlayerStats(100);
        this.ui    = new UIManager(this, this.stats);

        this.grupoMoedas = this.physics.add.group();

        // Temporizador: 1 tick por segundo
        this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => this.stats.tick()
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

        this._invencivel = false;
    }

    update() {
        if (!this.stats.estaVivo()) return;

        this.player.update();
        this.spawner.update(this.player.player);
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
        const valor = moeda.valor || 1;
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

    _gameOver() {
        this.physics.pause();

        // Centraliza na câmera, não no mundo
        const camX = this.cameras.main.scrollX + this.scale.width  / 2;
        const camY = this.cameras.main.scrollY + this.scale.height / 2;

        this.add.text(camX, camY, 'GAME OVER', {
            fontFamily: 'Courier New',
            fontSize: '64px',
            fill: '#ff2222',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5).setDepth(999);

        this.time.delayedCall(2500, () => this.scene.restart());
    }
}