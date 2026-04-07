import Phaser from 'phaser';

export class TorreSecundaria extends Phaser.Physics.Arcade.Image {
    constructor(scene, x, y) {
        super(scene, x, y, ''); // textura direto

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // texura da torre
        if (!scene.textures.exists('torre_secundaria')) {
            const g = scene.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0x2244ff);
            g.fillRect(0, 0, 40, 40);
            g.generateTexture('torre_secundaria', 40, 40);
            g.destroy();
        }
        this.setTexture('torre_secundaria');
        this.setImmovable(true);

        this.vidaMaxima = 150;
        this.vida = this.vidaMaxima;

        // menorzinha e azulada
        this.barraFundo = scene.add.rectangle(x, y - 30, 40, 5, 0x330000).setDepth(50);
        this.barraVida = scene.add.rectangle(x, y - 30, 40, 5, 0x44ff44).setDepth(51);

        this.ultimoTiro = scene.time.now;
        this.intervaloTiro = 1000; // atira a cada 1 segundo
        this.rangeTiro = 400; // alcança até 400 pixels
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
        this.destroy(); // SOME do mapa
    }

    update(inimigos) {
        if (!this.active) return;

        // Atualiza barrinha de vida de lugar
        this.barraFundo.setPosition(this.x, this.y - 30);
        this.barraVida.setPosition(
            this.x - (40 - this.barraVida.width) / 2,
            this.y - 30
        );

        // lógica de atirar no alvo mais próximo
        const agora = this.scene.time.now;
        if (agora - this.ultimoTiro >= this.intervaloTiro) {

            let alvoMaisProximo = null;
            let menorDistancia = this.rangeTiro;

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

        // por praticidade, invoca um projétil diretamente via o GameScene.
        if (this.scene && this.scene.dispararProjetilTorre) {
            this.scene.dispararProjetilTorre(this.x, this.y, alvo);
        }
    }
}
