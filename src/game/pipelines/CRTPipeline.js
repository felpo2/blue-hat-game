const fragShader = `
precision mediump float;
uniform sampler2D uMainSampler;
varying vec2 outTexCoord;
uniform float uTime;

void main() {
    vec2 uv = outTexCoord;
    
    // 1. DISTORÇÃO DE BARRIL (Muito mais suave)
    vec2 pos = uv - 0.5;
    float dist = length(pos);
    uv = 0.5 + pos * (1.0 + 0.02 * dist * dist); 

    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }

    // 2. AMOSTRAGEM PURA
    vec4 color = texture2D(uMainSampler, uv);
    
    // Pequeno brilho (bloom muito sutil)
    float bloomAgg = 0.0005;
    vec4 bloom = texture2D(uMainSampler, uv + vec2(bloomAgg, 0.0)) +
                 texture2D(uMainSampler, uv + vec2(-bloomAgg, 0.0)) +
                 texture2D(uMainSampler, uv + vec2(0.0, bloomAgg)) +
                 texture2D(uMainSampler, uv + vec2(0.0, -bloomAgg));
    bloom /= 4.0;
    
    color += (bloom * 0.05);

    // 4. SCANLINES SUTIS
    float scanline = sin(uv.y * 800.0) * 0.03;
    color.rgb -= scanline;
    
    // 5. MÁSCARA DE FÓSFORO (Reduzida)
    float mask = 1.0;
    if (mod(uv.x * 1200.0, 2.0) < 1.0) {
        mask = 0.98;
    }
    color.rgb *= mask;

    // 6. VINHETA SUAVE
    float vignette = 1.0 - smoothstep(0.45, 0.8, dist);
    color.rgb *= (vignette * 0.2 + 0.8);

    gl_FragColor = color;
}
`;

export default class CRTPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
    constructor(game) {
        super({
            game,
            name: 'CRTPipeline',
            fragShader
        });
    }
}
