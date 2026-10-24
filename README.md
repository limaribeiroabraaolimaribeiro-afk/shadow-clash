# Shadow Clash — Veterano GLB 3D e Arena Distrito das Sombras (v0.3)

**Arena corrigida:** o ringue de boxe foi removido. O palco e a câmera estão configurados para a rua industrial com piso molhado, caminhão, prédios e o panorama derivado da imagem aprovada.

**Personagem carregado do arquivo real:** `assets/models/veterano-rig-3d.glb` é uma malha tridimensional com vértices, triângulos, 16 ossos, pesos de skinning e 12 animações. `src/veterano-glb.mjs` carrega esse arquivo com GLTFLoader e o motor de combate movimenta seu esqueleto. Há fallback para a malha procedural `src/veterano-mesh.mjs` caso o carregamento falhe.

## Arquivos 3D integrados

- `assets/models/veterano-rig-3d.glb`: modelo real GLB, **15.776 vértices, 31.272 triângulos, 16 ossos e 12 clipes** (guarda, movimentação, jab, soco forte, gancho, chutes, defesa, salto, reação e especial).
- `assets/arena/rua-industrial-aprovada.jpg`: arte originalmente aprovada, aplicada como panorama no fundo da cena 3D.
- `src/veterano-glb.mjs`: importação GLTFLoader com validação da malha e mapeamento dos ossos.
- `tests/glb.test.mjs`: testes de integridade dos arquivos e do skinning.
- Câmera e palco adaptados para a orientação vertical dos celulares.

## O que foi feito

- **Arena 01 — Distrito das Sombras:** piso asfáltico molhado, rachaduras, reflexos, prédios, janelas, viaduto, caminhão, obstáculos de concreto, neblina, chuva e iluminação cinematográfica.
- **Veterano 3D por código:** triangulação verdadeira (`THREE.BufferGeometry`), coordenadas XYZ, normais, oito materiais, atributos `skinIndex` e `skinWeight`, `THREE.SkinnedMesh` e `THREE.Skeleton` com 16 ossos.
- **Identidade preservada como referência:** boné preto para trás (aba vinho), barba grisalha, jaqueta impermeável escura, mochila preta com alças, faixa vermelha na mão, camisa cinza, calça larga e botas pretas.
- **Movimentação:** rigging usado pelo código já existente para guarda, caminhada, defesa, salto, agachamento, reação, cinco golpes e técnica especial.
- **360° verdadeiro:** o botão agora gira a geometria tridimensional (pode usar a tecla V).
- **Download de GLB:** botão **GLB** baixa o arquivo real versionado em `assets/models/` quando carregado. Se o GLB estiver indisponível, o botão exporta o personagem procedural alternativo.

## Fidelidade e limitações

Este é um **modelo 3D procedural de referência**, e não uma captura 3D do homem nas fotografias. Anatomia, rosto, textura da pele, dobras da roupa e proporções foram aproximadas por código. Não seria correto prometer que uma foto estática ou um turntable de imagens 2D contenha dados para reconstrução facial exata. Uma versão de acabamento cinematográfico exige retopologia, texturas, escaneamento/fotogrametria com ângulos adequados ou geração/edição em Meshy/Blender, e revisão dos pesos de skinning.

O rig inicial é simples (16 ossos, com peso dominante por seção) e as animações jogáveis continuam sendo geradas proceduralmente, **não por captura de movimento**. O GLB independente também possui 12 clipes de animação embutidos para outros pipelines. O segundo personagem ainda é um adversário de treinamento provisório. Nenhum sprite 360° controla a aparência renderizada do Veterano.

## Testar

```bash
npm install
npm test
npm run check
python3 -m http.server 8000
```

Abra `http://localhost:8000`. O site de jogo usa Three.js via CDN; é necessário acesso à internet no navegador.

## Como baixar a malha

No jogo, clique em **GLB**. O navegador cria `shadow-clash-veterano-rig-animacoes.glb`, que pode ser aberto no Blender e em visualizadores glTF. O GLB contém o personagem animável; **a arena não está nesse arquivo**.

## Próximas melhorias

1. Reconstrução facial de alta fidelidade usando referências adequadas.
2. Melhorar skinning nos ombros, joelhos, dedos e tecido.
3. Substituir movimentos procedurais por animações validadas para jogos de luta.
4. Criar adversário com qualidade visual equivalente.
