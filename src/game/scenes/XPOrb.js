export class XPOrb extends Phaser.Physics.Arcade.Image {
    constructor(cena, x, y, valor = 10) {
        super(cena, x, y, 'xp_orb'); 

        cena.add.existing(this);
        cena.physics.add.existing(this);

        // Explosão inicial ao dropar
        this.setVelocity(
            Phaser.Math.Between(-150, 150),
            Phaser.Math.Between(-150, 150)
        );
        this.setBounce(0.7);
        this.setCollideWorldBounds(true);
        this.setDrag(120);

        this.valor = valor;

        // Efeito de pulsação 
        cena.tweens.add({
            targets: this,
            scale: 1.3,
            alpha: 0.7,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Partículas de rastro 
        this.particles = cena.add.particles(0, 0, 'dust', {
            speed: 20,
            scale: { start: 0.6, end: 0 },
            alpha: { start: 0.4, end: 0 },
            lifespan: 400,
            follow: this,
            tint: 0x6060c2,
            blendMode: 'ADD'
        });
    }

    destroy() {
        if (this.particles) this.particles.destroy();
        super.destroy();
    }
}
