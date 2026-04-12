import { Scene } from 'phaser';

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        this.load.setPath('assets');
        
        // SPRITES DO MUNDO E ENTIDADES
        this.load.image('piso', 'sprite_frames/piso/piso.png');
        this.load.image('arma', 'sprite_frames/gun/gun.png.png');
        this.load.image('inimigo_sprite', 'sprite_frames/enemy/enemy.png');
        // Moeda 
        for (let i = 1; i <= 10; i++) {
            this.load.image(`coin_frame_${i}`, `sprite_frames/spinning_coin/coin${i}.png`);
        }
        
        // LOGOS DO PROJETO
        this.load.image('logo_sem_fundo', 'logo/logosemfundopng');
        this.load.image('logo_com_fundo', 'logo/logocomfundo.png');
        this.load.image('logo_main', 'logo/logotelaincial.png');
        this.load.image('fundo_main', 'logo/bg.png');
        
        // SPRITE DO PLAYER
        const fS = { frameWidth: 32, frameHeight: 32 };
        this.load.spritesheet('p_down_idle', 'sprite_frames/frames/001_idle.png', fS);
        this.load.spritesheet('p_left_idle', 'sprite_frames/frames/002_left-idle.png', fS);
        this.load.spritesheet('p_right_idle', 'sprite_frames/frames/003_right-idle.png', fS);
        this.load.spritesheet('p_top_idle', 'sprite_frames/frames/004_top-idle.png', fS);
        this.load.spritesheet('p_down_walk', 'sprite_frames/frames/005_down-speed.png', fS);
        this.load.spritesheet('p_left_walk', 'sprite_frames/frames/006_left-speed.png', fS);
        this.load.spritesheet('p_right_walk', 'sprite_frames/frames/007_right-speed.png', fS);
        this.load.spritesheet('p_top_walk', 'sprite_frames/frames/008-top-speed.png', fS);

        // SONS E MÚSICA
        this.load.setPath('assets/sons-games');
        this.load.audio('gameOver', 'gameOver.mp3');
        this.load.audio('levelUp', 'levelUp.mp3');
        this.load.audio('moeda', 'moeda.mp3');
        this.load.audio('musica_fundo', 'music_0002.mp3'); 
        this.load.audio('musica_menu', 'music_0002.mp3'); 
        this.load.audio('select', 'select.mp3');
        this.load.audio('shoot', 'shoot.mp3');
        this.load.audio('shoot_tower', 'shootTower.mp3');
        this.load.audio('inimigo_morte', 'explosion.mp3');
        this.load.audio('xp_coleta', 'orbs.mp3');
        this.load.audio('som_inimigo', 'enemysound.mp3');
        this.load.audio('passos_chao', 'Steps_tiles-002.ogg');
        this.load.audio('passos_pisos', 'Steps_tiles-002.ogg');
    }

    create() {
        // Prepara Animações do Jogador
        const criarAnim = (k, skey) => {
            this.anims.create({
                key: k,
                frames: this.anims.generateFrameNumbers(skey, { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1
            });
        };

        criarAnim('down_idle', 'p_down_idle');
        criarAnim('left_idle', 'p_left_idle');
        criarAnim('right_idle', 'p_right_idle');
        criarAnim('top_idle', 'p_top_idle');
        
        criarAnim('down_walk', 'p_down_walk');
        criarAnim('left_walk', 'p_left_walk');
        criarAnim('right_walk', 'p_right_walk');
        criarAnim('top_walk', 'p_top_walk');

        // CURSOR MIRA X
        const cursorCanvas = document.createElement('canvas');
        cursorCanvas.width = 32;
        cursorCanvas.height = 32;
        const ctx = cursorCanvas.getContext('2d');
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        // Desenha o X
        ctx.beginPath();
        ctx.moveTo(8, 8); ctx.lineTo(24, 24);
        ctx.moveTo(24, 8); ctx.lineTo(8, 24);
        ctx.stroke();
        
        // Sombra
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();

        const cursorUrl = cursorCanvas.toDataURL();
        this.input.setDefaultCursor(`url(${cursorUrl}) 16 16, crosshair`);

        this.scene.start('MainMenu');
    }
}
