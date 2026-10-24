# SHADOW CLASH — Protótipo jogável 2.5D

Este projeto contém um **ringue 3D com combate jogável**, um adversário procedural e o primeiro lutador, **Veterano**, representado por imagens recortadas de uma folha de referência de 360° aprovada durante a criação do jogo.

## O personagem integrado

As imagens de frente, costas e perfis estão em `assets/veterano/*.webp`, com transparência. `src/appearance.mjs` carrega essas vistas, mantém o personagem voltado para a câmera e apresenta movimentos visuais limitados, como caminhar, se agachar, saltar e inclinar o corpo durante ataques. A aparência preserva a referência fotográfica muito melhor do que o manequim de geometria simples.

**Limitação importante:** são imagens 2D montadas em planos dentro de um ringue 3D (representação 2.5D), não um verdadeiro modelo tridimensional riggado. A movimentação dos braços e das pernas na aparência recortada **não é animação esquelética real**. As colisões e a temporização continuam sendo calculadas pelo sistema procedural, que fica invisível sob a ilustração. Para animação corporal realista e visão 360° contínua, precisaremos de uma malha 3D com rig e texturas, idealmente `.glb`.

## Jogar

Execute a pasta num servidor HTTP local, por exemplo:

```bash
python3 -m http.server 8000
```

Abra `http://localhost:8000`. É necessária internet para carregar `three@0.166.1` pelo import map. Também é possível publicar usando GitHub Pages com a raiz da branch `main`.

| Comando | Tecla |
| --- | --- |
| Caminhar | A/D ou ←/→ |
| Saltar | W/↑ |
| Agachar | S/↓ |
| Soco rápido | J |
| Soco forte | K |
| Gancho | H |
| Chute baixo | L |
| Chute alto | O |
| Defender | I |
| Especial | U |
| **Ver as vistas 360°** | **V** ou botão **360°** |
| Reiniciar | R |

Há controles de toque para movimento e golpes em smartphones.

## Arquitetura

- `index.html` — página e interface;
- `styles.css` — painel, vidas e controles de toque;
- `src/arena.mjs` — ringue, cordas, luzes e arquibancada;
- `src/fighter.mjs` — esqueleto geométrico de colisão e fallback;
- `src/appearance.mjs` — vistas do Veterano, renderização 2.5D e inspeção 360°;
- `src/motions.mjs` — duração e poses dos golpes;
- `src/main.mjs` — câmera, controle, colisões e jogo;
- `assets/veterano/*.webp` — cortes com fundo transparente do modelo visual aprovado.

## Próxima etapa: personagem 3D final

Para fidelidade de animação semelhante aos grandes jogos de luta, exportar do Meshy um GLB humanoide **texturizado e com esqueleto**, aplicar animações de combate e substituir o modo de exibição em `src/appearance.mjs` por um `SkinnedMesh` e `AnimationMixer`. As imagens de referência não contêm uma malha nem pesos de vértices necessários para fazer esse processo automaticamente.

## Testes

```bash
node --test tests/*.test.mjs
```
