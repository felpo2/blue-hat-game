import { Inimigo } from './Inimigo';

export class Spawner {
    constructor(scene) {
        this.scene = scene;

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
        const x = Phaser.Math.Between(0, 2000);
        const y = Phaser.Math.Between(0, 2000);

        const enemy = new Inimigo(this.scene, x, y);
        this.groupEnemies.add(enemy);
    }

    // essa função faz o inimigo andar e ir atrás do player 
    update(player) {
        this.groupEnemies.getChildren().forEach(enemy => {
            if (enemy.active) {
                // se move na direção do player
                this.scene.physics.moveToObject(enemy, player, 100);
            }
        });
    }
}