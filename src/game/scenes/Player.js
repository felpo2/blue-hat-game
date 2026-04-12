export class Player {
    constructor(scene) {
        this.scene = scene;

        // Cria o sprite físico (animado)
        this.player = scene.physics.add.sprite(1000, 1050, 'p_down_idle');
        this.player.setScale(3); 
        this.player.body.setSize(16, 16); 
        this.player.body.setOffset(8, 16); 
        this.player.body.setCollideWorldBounds(true);
        this.player.setDepth(10); 
        this.facing = 'down';

        // SOMBRA
        this.sombra = scene.add.ellipse(this.player.x, this.player.y + 20, 40, 15, 0x000000, 0.3);
        this.sombra.setDepth(9);

        // ARMA 360 (Nova)
        this.arma = scene.add.sprite(this.player.x, this.player.y, 'arma')
            .setScale(2.6) 
            .setOrigin(-0.35, 0.5) 
            .setDepth(11);

        // Camera segue o player
        scene.cameras.main.startFollow(this.player);

        // Controles
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = scene.input.keyboard.addKeys('W,A,S,D');

        this.speed = scene.stats.velocidade || 140;
        this.lastDirection = { x: 0, y: -1 }; 

        // Cria o grupo de projéteis
        this.grupoProjecteis = scene.physics.add.group();
        this.ultimoTiro = 0;
        this.recuo = 0; 
        this.tempoUltimoPasso = 0; // Para controle de áudio dos passos (Talvez remover ou mudar o som de passos)

        this._criarTexturaProjetil();
    }

    _criarTexturaProjetil() {
        if (this.scene.textures.exists('projetil')) return;
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        // Quadrado Azul
        g.fillStyle(0x6060c2, 1);
        g.fillRect(0, 0, 12, 12);
        g.fillStyle(0xffffff, 1);
        g.fillRect(3, 3, 6, 6);
        g.generateTexture('projetil', 12, 12);
        
        // Rastro
        g.clear();
        g.fillStyle(0x6060c2, 0.5);
        g.fillCircle(4, 4, 4);
        g.generateTexture('trail_particle', 8, 8);

        // Textura Poeira
        g.clear();
        g.fillStyle(0xcccccc, 0.4);
        g.fillCircle(4, 4, 4);
        g.generateTexture('dust_particle', 8, 8);
        
        g.destroy();
    }

    update() {
        this.speed = this.scene.stats.velocidade;
        
        this.player.body.setVelocity(0);

        let isMoving = false;
        let moveX = 0;
        let moveY = 0;

        // Movimento
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            moveX = -1;
            this.facing = 'left';
            isMoving = true;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            moveX = 1;
            this.facing = 'right';
            isMoving = true;
        }

        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            moveY = -1;
            this.facing = 'top';
            isMoving = true;
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            moveY = 1;
            this.facing = 'down';
            isMoving = true;
        }

        if (isMoving) {
            this.player.body.setVelocity(moveX * this.speed, moveY * this.speed);
            this.player.body.velocity.normalize().scale(this.speed);
            this.player.play(`${this.facing}_walk`, true);

            // Inclinação Diagonal Suave
            if (moveX !== 0 && moveY !== 0) {
                this.player.setAngle(moveX * 8);
            } else {
                this.player.setAngle(0);
            }
        } else {
            this.player.play(`${this.facing}_idle`, true);
            this.player.setAngle(0);
            
            // Idle 
            if (this.player.scaleY === 3) {
                this.scene.tweens.add({
                    targets: this.player,
                    scaleY: 3.03,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        }

        // Atualizar Sombra
        this.sombra.setPosition(this.player.x, this.player.y + 20);
        
        // Juice de movimento 
        if (isMoving) {
            const agora = this.scene.time.now;
            // Som de passos a cada 300ms (Remover o audio ou achar um melhor)
            if (agora - this.tempoUltimoPasso > 300) {
                if (this.scene.cache.audio.exists('passos_chao')) {
                    this.scene.sound.play('passos_chao', { volume: 0.1 });
                }
                this.tempoUltimoPasso = agora;
            }
        }
        // ARMA (MIRA 360)
        this.recuo *= 0.8; 
        
        const pointer = this.scene.input.activePointer;
        const mouseWorldPoint = pointer.positionToCamera(this.scene.cameras.main);
        const angulo = Phaser.Math.Angle.Between(this.player.x, this.player.y, mouseWorldPoint.x, mouseWorldPoint.y);
        
        // Recuo na direção oposta ao ângulo do mouse
        const offsetX = Math.cos(angulo) * this.recuo;
        const offsetY = Math.sin(angulo) * this.recuo;
        
        this.arma.setPosition(this.player.x - offsetX, this.player.y - offsetY);
        this.arma.setRotation(angulo);

        // Inversão da arma para não ficar de cabeça para baixo
        if (Math.abs(angulo) > Math.PI / 2) {
            this.arma.setFlipY(true);
        } else {
            this.arma.setFlipY(false);
        }

        // ATIRAR AO CLICAR/SEGURAR MOUSE
        if (pointer.isDown) {
            this.atirar(mouseWorldPoint);
        }
    }

    atirar(alvo) {
        const agora = this.scene.time.now;
        if (agora - this.ultimoTiro < this.scene.stats.intervaloTiro) {
            return;
        }
        this.ultimoTiro = agora;

        this.scene.sound.play('shoot', { volume: 0.25 });

        // Juice tremor ao atirar
        this.scene.cameras.main.shake(50, 0.002);

        // Efeito de recuo 
        this.recuo = 35;
        this.scene.tweens.add({
            targets: this.arma,
            scale: 3.2,
            duration: 50,
            yoyo: true,
            ease: 'Back.easeOut'
        });

        // Calcula vetor de direção normalizado para o projétil
        const angulo = Phaser.Math.Angle.Between(this.player.x, this.player.y, alvo.x, alvo.y);
        const dirX = Math.cos(angulo);
        const dirY = Math.sin(angulo);

        // Explosão na ponta da arma
        const muzzleX = this.player.x + (dirX * 70);
        const muzzleY = this.player.y + (dirY * 70);
        const muzzle = this.scene.add.particles(muzzleX, muzzleY, 'trail_particle', {
            speed: { min: 50, max: 150 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 100,
            tint: 0xffffff,
            quantity: 10,
            blendMode: 'ADD',
            emitting: false
        });
        muzzle.explode(10);
        this.scene.time.delayedCall(200, () => muzzle.destroy());

        // Cria o projétil saindo da ponta da arma (Só deixei mais longe de onde sai o tiro hahah)
        const projX = this.player.x + (dirX * 75);
        const projY = this.player.y + (dirY * 75);
        const proj = this.grupoProjecteis.create(projX, projY, 'projetil');

        if (!proj) return;

        const projVel = 400;
        proj.body.setVelocity(dirX * projVel, dirY * projVel);
        proj.setRotation(angulo);

        // Rastros glow 
        const emitter = this.scene.add.particles(0, 0, 'trail_particle', {
            speed: 10,
            scale: { start: 1.8, end: 0 }, // Aumentado para mais brilho
            alpha: { start: 0.8, end: 0 },
            lifespan: 300,
            tint: 0x6060c2,
            blendMode: 'ADD', // Isso cria o efeito de luz
            follow: proj
        });
        
        this.scene.time.delayedCall(3000, () => {
            if (proj && proj.active) {
                emitter.destroy();
                proj.destroy();
            }
        });
    }

    getGrupoProjecteis() {
        return this.grupoProjecteis;
    }

    takeDamage() {
        this.player.setTint(0xff0000);
        this.scene.time.delayedCall(150, () => {
            if (this.player && this.player.active) this.player.clearTint();
        });
    }
}
