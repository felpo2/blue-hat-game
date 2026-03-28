export class Spawner {
    constructor(scene) {
        this.scene = scene;

        // inimigos
        this.typesEnemies = [
            { cor: 0xff0000, w: 40, h: 40, vel: 100 },
            { cor: 0x00ff00, w: 20, h: 60, vel: 150 },
            { cor: 0x0000ff, w: 60, h: 20, vel: 80 },
            { cor: 0xffff00, w: 30, h: 30, vel: 200 }
        ];

        // cria o grupo de física na cena
        this.groupEnemies = this.scene.physics.add.group();

        // cria o temporizador (a cada x segundos aparece mais inimigos)
        this.scene.time.addEvent({
            delay: 1000,
            callback: this.spawner,
            callbackScope: this,
            loop: true
        });
    }

    spawner() {
        const type = Phaser.Utils.Array.GetRandom(this.typesEnemies);

        const x = Phaser.Math.Between(0, 2000);
        const y = Phaser.Math.Between(0, 2000);

        // retângulo(: 
        let enemies = this.scene.add.rectangle(x, y, type.w, type.h, type.cor);
        this.scene.physics.add.existing(enemies);

        enemies.velocityEnemies = type.vel;

        this.groupEnemies.add(enemies);
    }

    // essa função faz o inimigo andar e ir atrás do player 
    update(player) {
        this.groupEnemies.getChildren().forEach(enemy => {
            if (enemy.active) {
                // se move na direção do player
                this.scene.physics.moveToObject(enemy, player, enemy.velocityEnemies);
            }
        });
    }
}