// IMPORTANTE: O Player está na classe inimigo para ocorrer a interação entre os dois (estava ocorrendo bugs onde o inimigo não dava dano no inimigo)

export class Player {
    constructor(scene) {
        this.scene = scene;

        // Sprite físico
        this.player = scene.physics.add.sprite(1000, 1050, 'p_down_idle');
        this.player.setScale(3); 
        this.player.body.setSize(16, 16).setOffset(8, 16); 
        this.player.body.setCollideWorldBounds(true);
        this.player.setDepth(10); 
        this.facing = 'down';

        // Sombra
        this.sombra = scene.add.ellipse(this.player.x, this.player.y + 20, 40, 15, 0x000000, 0.3);
        this.sombra.setDepth(9);

        // Arma Orbital
        this.arma = scene.add.sprite(this.player.x, this.player.y, 'arma')
            .setScale(2.6) 
            .setOrigin(-0.35, 0.5) 
            .setDepth(11);

        // Tween de "Respiro" (Idle) - Criado uma vez para performance
        this.idleTween = scene.tweens.add({
            targets: this.player,
            scaleY: 3.05,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            paused: true
        });

        // Controles
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = scene.input.keyboard.addKeys('W,A,S,D');

        // Stats e Projéteis
        this.speed = scene.stats.velocidade || 140;
        this.grupoProjecteis = scene.physics.add.group();
        this.ultimoTiro = 0;
        this.recuo = 0; 
        this.tempoUltimoPasso = 0;

        scene.cameras.main.startFollow(this.player);
        this._criarTexturaProjetil();
    }

    _criarTexturaProjetil() {
        if (this.scene.textures.exists('projetil')) return;
        const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
        // Projetil principal
        g.fillStyle(0x6060c2, 1).fillRect(0, 0, 12, 12);
        g.fillStyle(0xffffff, 1).fillRect(3, 3, 6, 6);
        g.generateTexture('projetil', 12, 12);
        // Partículas
        g.clear().fillStyle(0x6060c2, 0.5).fillCircle(4, 4, 4);
        g.generateTexture('trail_particle', 8, 8);
        g.destroy();
    }

    update() {
        this.speed = this.scene.stats.velocidade;
        this.player.body.setVelocity(0);

        let moveX = 0;
        let moveY = 0;

        // Input
        if (this.cursors.left.isDown || this.wasd.A.isDown) moveX = -1;
        else if (this.cursors.right.isDown || this.wasd.D.isDown) moveX = 1;
        if (this.cursors.up.isDown || this.wasd.W.isDown) moveY = -1;
        else if (this.cursors.down.isDown || this.wasd.S.isDown) moveY = 1;

        const isMoving = moveX !== 0 || moveY !== 0;

        if (isMoving) {
            // Lógica de Movimento
            if (moveX !== 0) this.facing = moveX > 0 ? 'right' : 'left';
            if (moveY !== 0) this.facing = moveY > 0 ? 'down' : 'top';

            this.player.body.setVelocity(moveX * this.speed, moveY * this.speed);
            this.player.body.velocity.normalize().scale(this.speed);
            this.player.play(`${this.facing}_walk`, true);
            this.player.setAngle(moveX !== 0 && moveY !== 0 ? moveX * 8 : 0);

            // Gestão do Tween Idle e Som
            if (this.idleTween.isPlaying) this.idleTween.pause();
            this._tocarSomPassos();
        } else {
            this.player.play(`${this.facing}_idle`, true);
            this.player.setAngle(0);
            if (this.idleTween.isPaused) this.idleTween.resume();
        }

        this.sombra.setPosition(this.player.x, this.player.y + 20);
        this._atualizarArma();
    }

    _tocarSomPassos() {
        const agora = this.scene.time.now;
        if (agora - this.tempoUltimoPasso > 300) {
            if (this.scene.cache.audio.exists('passos_chao')) {
                this.scene.sound.play('passos_chao', { volume: 0.1 });
            }
            this.tempoUltimoPasso = agora;
        }
    }

    _atualizarArma() {
        this.recuo *= 0.85; 
        const pointer = this.scene.input.activePointer;
        const mousePoint = pointer.positionToCamera(this.scene.cameras.main);
        const angulo = Phaser.Math.Angle.Between(this.player.x, this.player.y, mousePoint.x, mousePoint.y);
        
        // Offset de recuo (visual)
        const offX = Math.cos(angulo) * this.recuo;
        const offY = Math.sin(angulo) * this.recuo;
        
        this.arma.setPosition(this.player.x - offX, this.player.y - offY);
        this.arma.setRotation(angulo);
        this.arma.setFlipY(Math.abs(angulo) > Math.PI / 2);

        if (pointer.isDown) this.atirar(mousePoint);
    }

    atirar(alvo) {
        const agora = this.scene.time.now;
        if (agora - this.ultimoTiro < this.scene.stats.intervaloTiro) return;
        this.ultimoTiro = agora;

        this.scene.sound.play('shoot', { volume: 0.2 });
        this.scene.cameras.main.shake(50, 0.002);
        this.recuo = 15; // Impacto visual na arma

        const angulo = Phaser.Math.Angle.Between(this.player.x, this.player.y, alvo.x, alvo.y);
        const dirX = Math.cos(angulo);
        const dirY = Math.sin(angulo);

        // Kickback no corpo do player (Opcional, dá peso)
        this.player.x -= dirX * 2;
        this.player.y -= dirY * 2;

        // Projétil
        const proj = this.grupoProjecteis.create(this.player.x + (dirX * 75), this.player.y + (dirY * 75), 'projetil');
        if (proj) {
            proj.body.setVelocity(dirX * 700, dirY * 700);
            proj.setRotation(angulo);
            
            // Efeito de Rastro (Glow)
            const emitter = this.scene.add.particles(0, 0, 'trail_particle', {
                scale: { start: 1.5, end: 0 },
                alpha: { start: 0.6, end: 0 },
                lifespan: 200,
                blendMode: 'ADD',
                follow: proj
            });
            
            // Destruição segura
            this.scene.time.delayedCall(2000, () => { 
                if (proj.active) { emitter.destroy(); proj.destroy(); }
            });
        }
    }

    takeDamage() {
        this.player.setTint(0xff0000);
        this.scene.time.delayedCall(150, () => { if (this.player.active) this.player.clearTint(); });
    }
}




// INIMIGO


export class Inimigo extends Phaser.Physics.Arcade.Image {
    constructor(cena, x, y, rodada = 1) {
        super(cena, x, y, 'inimigo_sprite'); 
        cena.add.existing(this);
        cena.physics.add.existing(this);
        this.setCollideWorldBounds(true).setScale(2);

        this.vidaMaxima = 18 + (rodada * 12);
        this.vida = this.vidaMaxima;
        this.recompensa = 1 + Math.floor(rodada / 4);

        // Barras de Vida 
        this.barraFundo = cena.add.rectangle(x, y - 28, 40, 5, 0x330000).setDepth(50);
        this.barraVida  = cena.add.rectangle(x, y - 28, 40, 5, 0xff4444).setDepth(51);
        this.barraVida.setOrigin(0, 0.5); // Facilita o redimensionamento 

        this.sombra = cena.add.ellipse(x, y + 15, 30, 10, 0x000000, 0.25).setDepth(4);

        // Efeito de movimento (É somente um sprite por isso essa animação)
        this.bounceTween = cena.tweens.add({
            targets: this,
            scaleY: 2.3,
            duration: 200 + Math.random() * 100,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    receberDano(dano, isPlayer = true, kX = 0, kY = 0) {
        this.vida -= dano;
        this.x += kX * 30; // Knockback
        this.y += kY * 30;

        // Hit Flash 
        this.setTintFill(0xffffff);
        this.scene.time.delayedCall(80, () => { if (this.active) this.clearTint(); });

        // Atualiza Barra
        const pct = Math.max(0, this.vida / this.vidaMaxima);
        this.barraVida.width = 40 * pct;

        if (this.vida <= 0) this._morrer();
        else if (this.scene.cache.audio.exists('som_inimigo')) {
            this.scene.sound.play('som_inimigo', { volume: 0.6 });
        }
    }

    _morrer() {
        // Partículas de explosão
        const explosion = this.scene.add.particles(this.x, this.y, 'trail_particle', {
            speed: { min: 50, max: 200 },
            scale: { start: 2, end: 0 },
            lifespan: 500,
            tint: 0xff4444,
            quantity: 20,
            emitting: false
        });
        explosion.explode(20);
        
        this.scene.sound.play('inimigo_morte', { volume: 0.8 });
        this.scene.droparMoedas(this.x, this.y, this.recompensa);
        this.scene.droparXP(this.x, this.y, 10 + (this.recompensa * 2));
        
        // Limpeza completa
        this.bounceTween.stop();
        [this.barraFundo, this.barraVida, this.sombra].forEach(obj => obj.destroy());
        this.destroy();
    }

    preUpdate(time, delta) {
        if (this.active) {
            this.sombra.setPosition(this.x, this.y + 15);
            this.barraFundo.setPosition(this.x, this.y - 28);
            // Agora a barra vida só segue o X da esquerda da barra fundo
            this.barraVida.setPosition(this.x - 20, this.y - 28);
        }
    }
}