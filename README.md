# Shadow Clash — Arena e Veterano 3D (v0.2)

**Correção da versão anterior:** a arena aprovada é uma **rua industrial chuvosa**, não um ringue. O Veterano agora é uma **malha tridimensional animável por esqueleto real**, não uma montagem de imagens 2D.

## O que foi feito

- **Arena 01 — Distrito das Sombras:** piso asfáltico molhado, rachaduras, reflexos, prédios, janelas, viaduto, caminhão, obstáculos de concreto, neblina, chuva e iluminação cinematográfica.
- **Veterano 3D por código:** triangulação verdadeira (`THREE.BufferGeometry`), coordenadas XYZ, normais, oito materiais, atributos `skinIndex` e `skinWeight`, `THREE.SkinnedMesh` e `THREE.Skeleton` com 16 ossos.
- **Identidade preservada como referência:** boné preto para trás (aba vinho), barba grisalha, jaqueta impermeável escura, mochila preta com alças, faixa vermelha na mão, camisa cinza, calça larga e botas pretas.
- **Movimentação:** rigging usado pelo código já existente para guarda, caminhada, defesa, salto, agachamento, reação, cinco golpes e técnica especial.
- **360° verdadeiro:** o botão agora gira a geometria tridimensional (pode usar a tecla V).
- **Exportação de GLB:** botão **GLB** no cabeçalho gera um arquivo com malha, ossos e 12 clipes de animação. A exportação ocorre no navegador, utilizando o `GLTFExporter` do Three.js.

## Fidelidade e limitações

Este é um **modelo 3D procedural de referência**, e não uma captura 3D do homem nas fotografias. Anatomia, rosto, textura da pele, dobras da roupa e proporções foram aproximadas por código. Não seria correto prometer que uma foto estática ou um turntable de imagens 2D contenha dados para reconstrução facial exata. Uma versão de acabamento cinematográfico exige retopologia, texturas, escaneamento/fotogrametria com ângulos adequados ou geração/edição em Meshy/Blender, e revisão dos pesos de skinning.

O rig inicial é simples (16 ossos, com peso dominante por seção) e as animações são procedurais, **não mocap**. O segundo personagem ainda é um adversário de treinamento provisório. Nenhum sprite 360° controla a aparência renderizada do Veterano.

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
