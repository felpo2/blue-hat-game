export class Player {
    constructor(scene) {
        this.scene = scene;

        // Cria o retângulo verde (player) no centro (embaixo da torre)
        this.player = scene.add.rectangle(1000, 1050, 64, 64, 0x00ff00);

        // Adiciona física ao player
        scene.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        // Camera segue o player
        scene.cameras.main.startFollow(this.player);

        // Controles
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = scene.input.keyboard.addKeys('W,A,S,D');

        this.speed = 200;
        this.lastDirection = { x: 0, y: -1 }; // Direção padrão: cima

        // Cria o grupo de projéteis
        this.grupoProjecteis = scene.physics.add.group();
        this.ultimoTiro = 0;

        // Cria textura para o projétil
        this._criarTexturaProjetil();
    }

    _criarTexturaProjetil() {
        if (this.scene.textures.exists('projetil')) return;
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xffff00);
        g.fillRect(0, 0, 8, 8);
        g.generateTexture('projetil', 8, 8);
        g.destroy();
    }

    update() {
        // Se o player estiver parado, a velocidade é 0
        this.player.body.setVelocity(0);

        // Lógica de movimento horizontal
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.player.body.setVelocityX(-this.speed);
            this.lastDirection.x = -1;
            this.lastDirection.y = 0;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.player.body.setVelocityX(this.speed);
            this.lastDirection.x = 1;
            this.lastDirection.y = 0;
        }

        // Lógica de movimento vertical
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            this.player.body.setVelocityY(-this.speed);
            this.lastDirection.x = 0;
            this.lastDirection.y = -1;
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            this.player.body.setVelocityY(this.speed);
            this.lastDirection.x = 0;
            this.lastDirection.y = 1;
        }

        // impede que o personagem se mova mais rápido na diagonal
        this.player.body.velocity.normalize().scale(this.speed);

        // sistema de auto-tiro (pegar inimigo mais perto num raio)
        if (this.scene.spawner && this.scene.spawner.groupEnemies) {
            const inimigos = this.scene.spawner.groupEnemies.getChildren();
            let alvoMaisProximo = null;
            let menorDist = 500; // alcance de tiro do player

            inimigos.forEach(inimigo => {
                if (inimigo.active) {
                    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, inimigo.x, inimigo.y);
                    if (dist < menorDist) {
                        menorDist = dist;
                        alvoMaisProximo = inimigo;
                    }
                }
            });

            if (alvoMaisProximo) {
                this.atirar(alvoMaisProximo);
            }
        }
    }

    atirar(alvo) {
        const agora = this.scene.time.now;
        //
        if (agora - this.ultimoTiro < this.scene.stats.intervaloTiro) {
            return;
        }
        this.ultimoTiro = agora;

        // Calcula vetor de direção normalizado
        const angulo = Math.atan2(alvo.y - this.player.y, alvo.x - this.player.x);
        const dirX = Math.cos(angulo);
        const dirY = Math.sin(angulo);

        // Cria o projétil como sprite direto da borda
        const proj = this.grupoProjecteis.create(
            this.player.x + (dirX * 20),
            this.player.y + (dirY * 20),
            'projetil'
        );

        if (!proj) return;

        // Configura velocidade guiada para a direção estática final
        const projVel = 400;
        proj.body.setVelocity(dirX * projVel, dirY * projVel);
        proj.body.setCollideWorldBounds(false);

        // Remove projétil após 5 segundos
        this.scene.time.delayedCall(5000, () => {
            if (proj && proj.active) {
                proj.destroy();
            }
        });
    }

    getGrupoProjecteis() {
        return this.grupoProjecteis;
    }

    takeDamage() {
        this.player.fillColor = 0xff0000;
        this.scene.time.delayedCall(300, () => {
            this.player.fillColor = 0x00ff00;
        }, [], this);
    }
}
