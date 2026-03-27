import { Scene } from 'phaser';

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    create ()
    {
        //player. (retangulo enquanto nao temos um sprite)
        this.player = this.add.rectangle(100, 100, 64, 64, 0x00ff00);


        //fisica do personagem, para que ele colida com paredes
        this.physics.add.existing(this.player);

        this.physics.world.setBounds(0,0,2000,2000)
        //adiciona colisao natural do mundo no player
        this.player.body.setCollideWorldBounds(true)
        //camera segue o player
        this.cameras.main.startFollow(this.player)


        //movimentacao do personagem
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');


        this.add.grid(1000, 1000, 2000, 2000, 50, 50, 0x000000, 0, 0x333333, 0.5).setDepth(-1);
        }

        update (){
        const speed = 200;

        //se o player estiver parado, a velocidade é 0
        this.player.body.setVelocity(0);

        //logica 
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.player.body.setVelocityX(-speed);
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.player.body.setVelocityX(speed);
        }

        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            this.player.body.setVelocityY(-speed);
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            this.player.body.setVelocityY(speed);
        }

        //impede que o personagem se mova mais rápido na diagonal
        this.player.body.velocity.normalize().scale(speed);
    }
}