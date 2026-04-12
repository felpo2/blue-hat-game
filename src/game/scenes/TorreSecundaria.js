import Phaser from 'phaser';

export class TorreSecundaria extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y) {
        super(scene, x, y, ''); 

        scene.add.existing(this);
        this.setDepth(5); 

        if (!scene.textures.exists('torre_secundaria')) {
            const g = scene.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0x6060c2); 
            g.fillRect(0, 0, 40, 40);
            g.generateTexture('torre_secundaria', 40, 40);
            g.destroy();
        }
        
        this.sombra = scene.add.ellipse(x, y + 18, 45, 12, 0x000000, 0.25).setDepth(2);
        this.setTexture('torre_secundaria');

        // Vida base vinda dos stats globais
        this.vidaMaxima = scene.stats ? scene.stats.vidaBaseMiniTorre : 200;
        this.vida = this.vidaMaxima;

        this.barraFundo = scene.add.rectangle(x, y - 30, 40, 5, 0x330000).setDepth(50);
        this.barraVida = scene.add.rectangle(x, y - 30, 40, 5, 0x44ff44).setDepth(51);

        this.ultimoTiro = scene.time.now;
        this.intervaloTiro = 900; 
    }

    receberDano(dano) {
        this.vida -= dano;
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            if (this.active && this.vida > 0) this.clearTint();
        });

        const proporcao = Math.max(0, this.vida / this.vidaMaxima);
        this.barraVida.width = 40 * proporcao;

        if (this.vida <= 0) {
            this.destruirCompletamente();
        }
    }

    destruirCompletamente() {
        this.barraFundo.destroy();
        this.barraVida.destroy();
        this.sombra.destroy();
        this.destroy(); 
    }

    update(inimigos) {
        if (!this.active) return;

        this.sombra.setPosition(this.x, this.y + 18);
        this.barraFundo.setPosition(this.x, this.y - 30);
        this.barraVida.setPosition(
            this.x - (40 - this.barraVida.width) / 2,
            this.y - 30
        );

        const agora = this.scene.time.now;
        if (agora - this.ultimoTiro >= this.intervaloTiro) {

            let alvoMaisProximo = null;
            let menorDistancia = this.scene.stats ? this.scene.stats.rangeMiniTorre : 280;

            inimigos.getChildren().forEach(inimigo => {
                if (inimigo.active) {
                    const dist = Phaser.Math.Distance.Between(this.x, this.y, inimigo.x, inimigo.y);
                    if (dist < menorDistancia) {
                        menorDistancia = dist;
                        alvoMaisProximo = inimigo;
                    }
                }
            });

            if (alvoMaisProximo) {
                this.atirar(alvoMaisProximo);
                this.ultimoTiro = agora;
            }
        }
    }

    atirar(alvo) {
        if (this.scene && this.scene.dispararProjetilTorre) {
            this.scene.dispararProjetilTorre(this.x, this.y, alvo, 'mini');
        }
    }
}
