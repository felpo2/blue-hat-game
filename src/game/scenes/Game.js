import { Scene } from 'phaser';
import { Player } from './Player';
import { Spawner } from './SpawnEnemies';
import { Inimigo } from './Inimigo';
import { Torre } from './Torre';
import { TorreSecundaria } from './TorreSecundaria';
import { UpgradeMenu } from './UpgradeMenu';
import { PlayerStats } from './PlayerStats';
import { UIManager } from './UIManager';
import { Moeda } from './Moeda';
import { XPOrb } from './XPOrb';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    _criarTexturas() {
        if (this.textures.exists('piso_digital')) return;
        
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        g.fillStyle(0x181e2e);
        g.fillRect(0, 0, 38, 38);
        g.fillRect(38, 38, 38, 38);
        g.fillStyle(0x222a3a); 
        g.fillRect(38, 0, 38, 38);
        g.fillRect(0, 38, 38, 38);
        g.generateTexture('piso_digital', 76, 76);

        g.clear();
        g.fillStyle(0x6060c2);
        g.fillCircle(8, 8, 8);
        g.fillStyle(0xffffff, 0.8);
        g.fillCircle(8, 8, 4);
        g.generateTexture('xp_orb', 16, 16);

        g.clear();
        g.fillStyle(0xffffff, 0.5);
        g.fillCircle(4, 4, 4);
        g.generateTexture('dust', 8, 8);

        g.destroy();
    }

    create() {
        this._criarTexturas();
        this.physics.world.setBounds(0, 0, 2000, 2000);
        this.add.rectangle(0, 0, 2000, 2000, 0x000000).setOrigin(0).setDepth(-10);

        this.piso = this.add.tileSprite(1000, 1000, 2000, 2000, 'piso_digital').setDepth(-9);
            
        // DEGRADÊ DO CHÃO 
        const vgn = this.add.graphics().setDepth(-8);
        const corPreta = 0x000000;
        const espessuraBorda = 400; // O degradê começa a 400px  da borda

        // Topo Preto -> Transparente
        vgn.fillGradientStyle(corPreta, corPreta, 0x000000, 0x000000, 1, 1, 0, 0);
        vgn.fillRect(0, 0, 2000, espessuraBorda);

        // Baixo Transparente -> Preto
        vgn.fillGradientStyle(0x000000, 0x000000, corPreta, corPreta, 0, 0, 1, 1);
        vgn.fillRect(0, 2000 - espessuraBorda, 2000, espessuraBorda);

        // Esquerda Preto -> Transparente
        vgn.fillGradientStyle(corPreta, 0x000000, corPreta, 0x000000, 1, 0, 1, 0);
        vgn.fillRect(0, 0, espessuraBorda, 2000);

        // Direita Transparente -> Preto
        vgn.fillGradientStyle(0x000000, corPreta, 0x000000, corPreta, 0, 1, 0, 1);
        vgn.fillRect(2000 - espessuraBorda, 0, espessuraBorda, 2000);

        this.stats = new PlayerStats(100);
        this.torre = new Torre(this, 1000, 1000);
        this.player = new Player(this);

        this.spawner = new Spawner(this);
        this.ui = new UIManager(this, this.stats);

        this.grupoMoedas = this.physics.add.group();
        this.grupoXP = this.physics.add.group();
        this.grupoTorresSecundarias = this.physics.add.staticGroup(); 
        this.projetosTorres = this.physics.add.group(); 

        this.modoConstrucaoAtivo = false;

        this.time.addEvent({
            delay: 1000, loop: true,
            callback: () => {
                if (this.modoConstrucaoAtivo) return; 
                this.stats.tick();
                if (this.stats.tempoEmSegundos % 30 === 0 && this.stats.tempoEmSegundos > 0) this.stats.rodada++;
            }
        });

        this.physics.add.collider(this.player.player, this.spawner.groupEnemies, (p, e) => this.handleCollision(p, e));
        this.physics.add.overlap(this.player.player, this.grupoMoedas, (p, m) => this._aoColetarMoeda(p, m));
        this.physics.add.overlap(this.player.player, this.grupoXP, (p, o) => this._aoColetarXP(p, o));
        this.physics.add.overlap(this.player.getGrupoProjecteis(), this.spawner.groupEnemies, (pr, e) => this._aoAcertarInimigo(pr, e, true));
        this.physics.add.overlap(this.torre.getSprite(), this.spawner.groupEnemies, (t, e) => this._aoInimigoBaterTorre(e));
        
        this.physics.add.overlap(this.grupoTorresSecundarias, this.spawner.groupEnemies, (t, e) => {
            if (t.active && e.active) {
                e.receberDano(999); 
                t.receberDano(30);  
                this.cameras.main.shake(100, 0.002);
            }
        });

        this.physics.add.overlap(this.projetosTorres, this.spawner.groupEnemies, (pr, e) => this._aoAcertarInimigo(pr, e, false));

        this.input.on('pointerdown', (p) => { if (this.modoConstrucaoAtivo) this._tentarColocarTorre(p); });
        this.physics.add.collider(this.player.player, this.torre.getSprite());
        this.physics.add.collider(this.player.player, this.grupoTorresSecundarias);

        this.input.keyboard.on('keydown-ESC', () => this.pausarJogo());
    }

    update() {
        if (!this.stats.estaVivo() || (this.torre && this.torre.vida <= 0)) return;
        if (this.modoConstrucaoAtivo) { this._atualizarVisaoConstrucao(); return; }
        this.player.update();

        const todasAsTorres = [this.torre.getSprite(), ...this.grupoTorresSecundarias.getChildren()];
        this.spawner.updateVisandoArray(this.player.player, todasAsTorres);

        this.grupoTorresSecundarias.getChildren().forEach(torre => { torre.update(this.spawner.groupEnemies); });

        this.grupoMoedas.getChildren().forEach(m => {
            if (m.active) {
                this.physics.moveToObject(m, this.player.player, 400);
                if (Phaser.Math.Distance.Between(this.player.player.x, this.player.player.y, m.x, m.y) < 30) this._aoColetarMoeda(this.player.player, m);
            }
        });

        this.grupoXP.getChildren().forEach(o => {
            if (o.active) {
                this.physics.moveToObject(o, this.player.player, 600);
                if (Phaser.Math.Distance.Between(this.player.player.x, this.player.player.y, o.x, o.y) < 40) this._aoColetarXP(this.player.player, o);
            }
        });

        this.ui.atualizar();
        if (this.piso) {
            this.piso.tilePositionX = this.cameras.main.scrollX * 0.1;
            this.piso.tilePositionY = this.cameras.main.scrollY * 0.1;
        }
    }

    handleCollision(player, enemy) {
        if (this._invencivel) return;
        
        // Visual Feedback
        this.cameras.main.flash(300, 255, 0, 0, 0.12);
        this.cameras.main.shake(150, 0.015);
        this.player.takeDamage(); // Faz o player piscar vermelho

        this._invencivel = true;
        this.time.delayedCall(600, () => this._invencivel = false);

        const dano = (enemy && enemy.danoAoCausarNoPlayer) ? enemy.danoAoCausarNoPlayer : 10;
        this.stats.tomarDano(dano);

        if (!this.stats.estaVivo()) this._gameOver();
    }

    droparMoedas(x, y, quantidade = 1) {
        for (let i = 0; i < quantidade; i++) {
            const moeda = new Moeda(this, x, y);
            this.grupoMoedas.add(moeda);
        }
    }

    droparXP(x, y, valor = 10) {
        const orb = new XPOrb(this, x, y, valor);
        this.grupoXP.add(orb);
    }

    eventoMonstroMorto(xpBase) {
        if (this.stats.ganharXp(xpBase)) {
            if (this.levelUpPendente) return; 
            this.levelUpPendente = true;
            this.time.delayedCall(400, () => {
                this.scene.pause('Game');
                this.scene.launch('UpgradeMenu', { stats: this.stats });
            });
        }
    }

    _aoColetarMoeda(player, moeda) {
        if (!moeda.active) return;
        const valor = (moeda.valor || 1) * this.stats.multiplicadorMoeda;
        moeda.destroy();
        this.sound.play('moeda', { volume: 0.3 });
        this.stats.coletarMoeda(valor);
        this._mostrarTextoFlutuante(moeda.x, moeda.y, `+${valor}`, '#ffe066');
    }

    _aoColetarXP(player, orb) {
        if (!orb.active) return;
        const valor = orb.valor || 10;
        orb.destroy();
        this.eventoMonstroMorto(valor);
    }

    _aoAcertarInimigo(proj, enemy, isPlayer = true) {
        const vx = proj.body.velocity.x;
        const vy = proj.body.velocity.y;
        const mag = Math.sqrt(vx*vx + vy*vy);
        const kx = vx / mag || 0;
        const ky = vy / mag || 0;
        proj.destroy();
        let forcaTiro = isPlayer ? this.stats.danoTiro : (proj.tipoFonte === 'mini' ? this.stats.danoMiniTorre : this.stats.danoTorrePrincipal);
        if (enemy instanceof Inimigo) enemy.receberDano(forcaTiro, isPlayer, kx, ky);
    }

    _aoInimigoBaterTorre(enemy) {
        if (!this.torre || this.torre.vida <= 0) return;
        enemy.receberDano(999); 
        this.torre.receberDano(25); 
        if (this.torre.vida <= 0) this._gameOver();
    }

    _mostrarTextoFlutuante(x, y, mensagem, cor = '#ffffff') {
        const t = this.add.text(x, y, mensagem, { fontFamily: '"Press Start 2P"', fontSize: '12px', fill: cor }).setDepth(200);
        this.tweens.add({ targets: t, y: y - 60, alpha: 0, duration: 800, onComplete: () => t.destroy() });
    }

    iniciarModoConstrucao() {
        if (this.modoConstrucaoAtivo) return;

        // Limpa resquícios de tentativas anteriores
        if (this.areaRange) this.areaRange.destroy();
        if (this.torreGhost) this.torreGhost.destroy();

        this.modoConstrucaoAtivo = true;
        this.physics.pause();
        this.cameras.main.stopFollow();

        // Camêra se locamove suavemente para o centro da área de construção
        this.cameras.main.pan(1000, 1000, 600, 'Power1');
        
        this.areaRange = this.add.circle(1000, 1000, 400).setStrokeStyle(4, 0x44ff44).setDepth(150);
        this.torreGhost = this.add.rectangle(0, 0, 40, 40, 0x6060c2, 0.5).setDepth(250);
    }

    _verificarSePodeConstruir(x, y) {
        const d = Phaser.Math.Distance.Between(x, y, 1000, 1000);
        if (d > 400 || d < 60) return false;
        let l = true;
        this.grupoTorresSecundarias.getChildren().forEach(t => { if (Phaser.Math.Distance.Between(x, y, t.x, t.y) < 50) l = false; });
        return l;
    }

    _atualizarVisaoConstrucao() {
        const p = this.input.activePointer.positionToCamera(this.cameras.main);
        this.torreGhost.setPosition(p.x, p.y);
        const pode = this._verificarSePodeConstruir(p.x, p.y);
        this.torreGhost.fillColor = pode ? 0x6060c2 : 0xff0000;
        this.areaRange.setStrokeStyle(4, pode ? 0x44ff44 : 0xff0000);
    }

    _tentarColocarTorre(p) {
        if (!this.modoConstrucaoAtivo) return;
        this.modoConstrucaoAtivo = false; // Reseta imediatamente para evitar multi-click

        const wp = p.positionToCamera(this.cameras.main);
        if (!this._verificarSePodeConstruir(wp.x, wp.y)) {
            this.modoConstrucaoAtivo = true; // Devolve o modo se o clique foi inválido
            return;
        }

        const nt = new TorreSecundaria(this, wp.x, wp.y);
        if (nt) this.grupoTorresSecundarias.add(nt);
        
        this.sairModoConstrucao();
    }

    sairModoConstrucao() {
        this.modoConstrucaoAtivo = false;
        
        if (this.areaRange) { this.areaRange.destroy(); this.areaRange = null; }
        if (this.torreGhost) { this.torreGhost.destroy(); this.torreGhost = null; }

        // Retoma o foco no player imediatamente
        this.cameras.main.pan(this.player.player.x, this.player.player.y, 400, 'Power1');
        
        // Retoma a física e o follow assim que o pan terminar ou logo em seguida
        this.time.delayedCall(400, () => { 
            if (this.player && this.player.player) {
                this.cameras.main.startFollow(this.player.player, true, 0.1, 0.1); 
            }
            this.physics.resume(); 
        });
    }

    dispararProjetilTorre(x, y, alvo, tipo = 'mini') {
        const proj = this.projetosTorres.create(x, y, 'projetil');
        proj.tipoFonte = tipo; 
        this.physics.moveToObject(proj, alvo, 500);
        const emitter = this.add.particles(0, 0, 'trail_particle', { speed: 10, scale: { start: 1.5, end: 0 }, alpha: { start: 0.8, end: 0 }, lifespan: 300, tint: 0x6060c2, blendMode: 'ADD', follow: proj });
        this.time.delayedCall(4000, () => { if (proj && proj.active) { emitter.destroy(); proj.destroy(); } });
    }

    _gameOver() { this.physics.pause(); this.scene.start('GameOver'); }
    pausarJogo() { this.scene.pause('Game'); this.scene.launch('PauseMenu'); }
}
