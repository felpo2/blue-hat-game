import { Inimigo } from './Inimigo';

export class Spawner {
    constructor(scene) {
        this.scene = scene;

        // cria o grupo de física na cena
        this.groupEnemies = this.scene.physics.add.group();
        this.ultimoSpawn = 0;
    }

    spawner(rodada = 1) {
        const x = Phaser.Math.Between(0, 2000);
        const y = Phaser.Math.Between(0, 2000);

        const enemy = new Inimigo(this.scene, x, y, rodada);
        this.groupEnemies.add(enemy);
    }

    // essa função faz o inimigo andar e ir atrás do alvo mais próximo dentro de um array
    updateVisandoArray(player, arrayEstruturas) {
        let rodadaAtual = this.scene.stats ? this.scene.stats.rodada : 1;
        const agora = this.scene.time.now;
        
        // intervalo começa em 2500ms e cai 150ms a cada onda. limite mínimo de lotação de tela: 800ms pra não travar(experiencia propria kkkk).
        let intervaloAtual = Math.max(800, 2500 - ((rodadaAtual - 1) * 150));

        if (agora - this.ultimoSpawn >= intervaloAtual) {
            this.spawner(rodadaAtual);
            this.ultimoSpawn = agora;
        }

        this.groupEnemies.getChildren().forEach(enemy => {
            if (enemy.active) {
                let target = player;
                let minDist = Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y);

                arrayEstruturas.forEach(estrutura => {
                    if (estrutura && estrutura.active) {
                        let distEstrutura = Phaser.Math.Distance.Between(enemy.x, enemy.y, estrutura.x, estrutura.y);
                        if (distEstrutura < minDist) {
                            target = estrutura;
                            minDist = distEstrutura;
                        }
                    }
                });
                
                // se move na direção do alvo
                this.scene.physics.moveToObject(enemy, target, 100);
            }
        });
    }
}