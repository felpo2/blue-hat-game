export class Torre {
    constructor(scene, x, y) {
        this.scene = scene;

        // Sombra
        scene.add.ellipse(x, y + 35, 90, 25, 0x000000, 0.3).setDepth(1);
        
        // Sprite da torre (MUDAR FUTURAMENTE)
        this.torre = scene.add.rectangle(x, y, 80, 80, 0x6060c2);

        // física estática 
        scene.physics.add.existing(this.torre, true);

        this.vidaMaxima = 500;
        this.vida = this.vidaMaxima;

        // barrinha de vida bem legal
        this.barraFundo = scene.add.rectangle(x, y - 55, 100, 10, 0x330000).setDepth(50);
        this.barraVida = scene.add.rectangle(x, y - 55, 100, 10, 0x22dd44).setDepth(51);
    }

    receberDano(dano) {
        this.vida -= dano;
        if (this.vida < 0) this.vida = 0;

        // efeito de dano
        this.torre.fillColor = 0xff0000;
        this.scene.time.delayedCall(150, () => {
            if (this.torre.active && this.vida > 0) this.torre.fillColor = 0x6060c2;
        });

        const proporcao = Math.max(0, this.vida / this.vidaMaxima);
        this.barraVida.width = 100 * proporcao;

        // "fui destruida" - diz a torre
        if (this.vida <= 0) {
            this.destruida();
        }
    }

    destruida() {
        this.barraFundo.destroy();
        this.barraVida.destroy();
        this.torre.fillColor = 0x555555; // fica cinza quando morta (arrumar bug não ficou cinza)
    }


    getSprite() {
        return this.torre;
    }
}
