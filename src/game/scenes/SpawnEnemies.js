import { Inimigo } from './Inimigo';

export class Spawner {
    constructor(scene) {
        this.scene = scene;

        // cria o grupo de física na cena
        this.groupEnemies = this.scene.physics.add.group();
        this.ultimoSpawn = 0;
    }

    spawner(rodada = 1) {
        let x, y;
        let dist = 0;
        const minDistance = 500; // Distância minima 
        let attempts = 0;

        // Tenta achar uma posição longe do player (máximo 10 tentativas para performance. bug resolvido *travamento)
        do {
            x = Phaser.Math.Between(0, 2000);
            y = Phaser.Math.Between(0, 2000);
            
            if (this.scene.player && this.scene.player.player) {
                dist = Phaser.Math.Distance.Between(x, y, this.scene.player.player.x, this.scene.player.player.y);
            } else {
                dist = minDistance + 1; // se player não existir ainda
            }
            attempts++;
        } while (dist < minDistance && attempts < 10);

        const enemy = new Inimigo(this.scene, x, y, rodada);
        this.groupEnemies.add(enemy);
    }

    // essa função faz o inimigo andar e ir atrás do alvo mais próximo dentro de um array
    updateVisandoArray(player, arrayEstruturas) {
        let rodadaAtual = this.scene.stats ? this.scene.stats.rodada : 1;
        const agora = this.scene.time.now;
        
        // Intervalo começa em 2000ms e cai 120ms por onda, mínimo 600ms
        let intervaloAtual = Math.max(600, 2000 - ((rodadaAtual - 1) * 120));

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