import { Scene } from 'phaser';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        const W = this.scale.width;
        const H = this.scale.height;

        this.cameras.main.fadeIn(500, 0, 0, 0);
        this.cameras.main.setBackgroundColor(0x000000);

        // LÓGICA DE ÁUDIO AUTOPLAY (IMPORTANTE MELHORAR ISSO COM UMA TELA DE PRÉ-CARREGAMENTO) * BUGS ACONTECENDO A MÚSICA DEMORA PARA COMEÇAR
        const startAudio = () => {
            if (this.sound.context.state === 'suspended') {dd
                this.sound.context.resume();
            }
            if (this.cache.audio.exists('musica_menu')) {
                if (!this.sound.get('musica_menu')) {
                    this.bgMusic = this.sound.add('musica_menu', { loop: true, volume: 0.05 });
                    this.bgMusic.play();
                } else {
                    this.bgMusic = this.sound.get('musica_menu');
                    if (!this.bgMusic.isPlaying) this.bgMusic.play();
                    this.bgMusic.setVolume(0.05); // Volume reduzido
                }
            }
        };

        // Ativa no primeiro clique ou tecla
        this.input.once('pointerdown', startAudio);
        this.input.keyboard.once('keydown', startAudio);

        // Logo
        this.add.image(W / 2, H / 2, 'logo_main')
            .setOrigin(0.5)
            .setScale(0.6)
            .setDepth(3);

        // Instruções
        const startText = this.add.text(W / 2, H * 0.88, 'PRESSIONE PARA INICIAR', {
            fontFamily: '"Press Start 2P"',
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(4);

        // Efeito de piscar 
        this.tweens.add({
            targets: startText,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            loop: -1
        });

        // Score
        const recordeOnda = localStorage.getItem('highscore_onda') || 0;
        const recordeTempo = localStorage.getItem('highscore_tempo') || 0;
        
        const min = Math.floor(recordeTempo / 60);
        const sec = recordeTempo % 60;
        const tempoStr = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

        this.add.text(W - 20, H - 20, `BEST: ONDA ${recordeOnda} [${tempoStr}]`, {
            fontFamily: '"Press Start 2P"',
            fontSize: '10px', 
            color: '#ffffff',
            align: 'right'
        })
        .setOrigin(1, 1)
        .setAlpha(0.6)
        .setDepth(10);

        // Se clicado = abrir o jogo
        this.input.once('pointerdown', () => {
            try { this.sound.play('select'); } catch (e) {}
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('Game');
            });
        });
    }
}