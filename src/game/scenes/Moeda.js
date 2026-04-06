export class Moeda extends Phaser.Physics.Arcade.Image {
    constructor(cena, x, y) {
        super(cena, x, y, 'moeda'); // textura gerada no GameScene

        cena.add.existing(this);
        cena.physics.add.existing(this);

        this.setVelocity(
            Phaser.Math.Between(-80, 80),
            -200
        );
        this.setBounce(0.5);
        this.setCollideWorldBounds(true);
        this.setDrag(80, 0);

        this.valor = 1;
    }
}