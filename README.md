# ⬡ DEMO — Card RPG

> *"Cada vitória revela novos horrores. Cada derrota, uma lição escrita em sangue."*

Um RPG de cartas singleplayer jogado no navegador — sem dependências, sem build, sem framework. Apenas HTML, CSS e JavaScript puro.

---

## 📁 Estrutura do Projeto

```
abismo-arcano/
├── index.html       ← Estrutura e telas do jogo
├── style.css        ← Visual completo (dark gothic)
├── script.js        ← Toda a lógica do jogo
└── README.md        ← Você está aqui
```

> **Como rodar:** abra o `index.html` direto no navegador. Sem servidor necessário.

---

## 🎮 Funcionalidades

| Área | O que tem |
|---|---|
| 🃏 Grimório | Monte um deck de até **5 cartas**, filtre por classe |
| 🗺️ Campanha | **5 capítulos** com dificuldade progressiva |
| ⚔️ Batalha | Sistema de turnos com **Atacar / Habilidade / Defender** |
| ✨ Habilidades | **8 efeitos únicos** — veneno, escudo, dreno, crítico e mais |
| 📜 Status | Efeitos persistentes com contador de turnos |
| 💾 Save | Progresso salvo automaticamente no `localStorage` |

---

## 🃏 Cartas Disponíveis

| Carta | Classe | HP | ATK | DEF | Habilidade | Efeito |
|---|---|:---:|:---:|:---:|---|---|
| 🧙 Mago do Vazio | Mago | 30 | 18 | 5 | Explosão Arcana | Ignora toda a defesa |
| 🗡️ Cavaleiro de Ônix | Guerreiro | 55 | 13 | 18 | Investida Pesada | Ataca + aplica Escudo |
| 🏹 Arqueira Sombria | Arqueiro | 28 | 24 | 4 | Flecha Envenenada | Aplica Veneno (3t) |
| 💀 Necromante | Mago | 38 | 16 | 9 | Roubo de Vida | Drena HP do inimigo |
| 🌿 Druida da Névoa | Druida | 45 | 11 | 14 | Regeneração | Regenera HP (3t) |
| ⚜️ Paladina Ardente | Guerreiro | 48 | 15 | 16 | Chama Sagrada | Aplica Queimadura (3t) |
| 🗝️ Assassina das Sombras | Arqueiro | 24 | 28 | 3 | Golpe Crítico | Chance de dano 2.2× |
| ⚡ Elementalista | Mago | 34 | 20 | 7 | Tempestade Arcana | Ataca + remove buffs |

---

## 🗺️ Capítulos da Campanha

```
Cap. I  ──[Fácil]──  Guarda Corrompido   (Cavaleiro de Ônix)
Cap. II ──[Fácil]──  Cultista Sombrio    (Necromante)
Cap. III──[Médio]──  Ent Corrompido      (Druida da Névoa)
Cap. IV ──[Difícil]─ Paladino das Cinzas (Paladina Ardente)
Cap. V  ──[CHEFE]──  Arquimago do Caos   (Mago do Vazio)
```

Cada vitória desbloqueia o próximo capítulo e é marcada como **✓ Completo** no mapa.

---

## 🔄 Fluxo do Jogo

```mermaid
flowchart TD
    START([🧙 Iniciar Jogo]) --> LOAD[Carregar progresso\ndo localStorage]
    LOAD --> HOME{Tela Inicial}

    HOME --> DECK[🃏 Grimório\nMonte seu Deck]
    HOME --> MAP[🗺️ Mapa da Campanha]

    DECK --> FILTER[Filtrar por classe]
    FILTER --> SELECT[Selecionar carta\n até 5 no deck]
    SELECT --> SAVE[💾 Selar Baralho\nSalva no localStorage]
    SAVE --> HOME

    MAP --> LOCKED{Capítulo\nbloqueado?}
    LOCKED -- Sim --> MAP
    LOCKED -- Não --> CHAMPION[Escolher Campeão\ndo seu Deck]
    CHAMPION --> BATTLE

    subgraph BATTLE [⚔️ Arena de Batalha]
        direction TB
        B_START([Turno do Jogador]) --> ACTION{Escolher Ação}
        ACTION -- Atacar --> ATK[Dano = ATK - DEF/2\nmín. 1]
        ACTION -- Habilidade --> SKILL[Efeito único\nda carta]
        ACTION -- Defender --> DEF_ACT[+50% defesa\nneste turno]

        ATK --> STATUS_P[Processar Status\ndo Jogador]
        SKILL --> STATUS_P
        DEF_ACT --> STATUS_P

        STATUS_P --> CHECK1{Fim de batalha?}
        CHECK1 -- Não --> ENEMY_TURN[Turno do Inimigo\nAtaque ou Habilidade 35%]
        ENEMY_TURN --> STATUS_E[Processar Status\ndo Inimigo]
        STATUS_E --> CHECK2{Fim de batalha?}
        CHECK2 -- Não --> B_START

        CHECK1 -- Inimigo morreu --> VICTORY
        CHECK2 -- Herói morreu --> DEFEAT
        CHECK1 -- Herói morreu --> DEFEAT
        CHECK2 -- Inimigo morreu --> VICTORY
    end

    VICTORY([🏆 Vitória!]) --> UNLOCK[Desbloquear\npróximo capítulo]
    UNLOCK --> SAVE2[💾 Salvar progresso]
    SAVE2 --> MAP

    DEFEAT([💀 Derrota]) --> MAP
```

---

## ⚡ Sistema de Status

Os efeitos persistem por turnos e são processados ao **fim de cada turno** de quem os carrega.

```mermaid
flowchart LR
    SKILL_USE[Habilidade\nativada] --> TYPE{Tipo de\nefeito}

    TYPE -- Veneno --> POISON["☠ Veneno\n−7% HP/turno\n3 turnos"]
    TYPE -- Queimadura --> BURN["🔥 Queimadura\n−5% HP/turno\n3 turnos"]
    TYPE -- Regeneração --> REGEN["💚 Regen\n+8% HP/turno\n3 turnos"]
    TYPE -- Escudo --> SHIELD["🛡 Escudo\n+50% DEF efetiva\n2 turnos"]

    POISON --> TICK[Fim do turno:\ncontar −1]
    BURN --> TICK
    REGEN --> TICK
    SHIELD --> TICK

    TICK --> ZERO{Turnos = 0?}
    ZERO -- Sim --> REMOVE[Remover status]
    ZERO -- Não --> NEXT[Continuar]
```

---

## 🧮 Fórmulas de Combate

```
Dano Normal   = max(1, ATK_atacante − ⌊DEF_defensor / 2⌋)
Dano c/Defesa = max(1, ATK_atacante − ⌊(DEF × 1.5) / 2⌋)

Dreno de Vida:
  → Dano = ATK × 0.9
  → Cura = Dano × 0.6

Golpe Crítico:
  → 70% de chance: dano × 2.2
  → 30% de chance: dano × 1.5

Veneno / Queimadura / Regen calculados sobre o HP máximo da carta.
```

---

## 🧱 Arquitetura do Código

```mermaid
flowchart TD
    subgraph DATA [📦 Dados]
        CARDS[allCards\nArray de 8 cartas]
        CAMPS[campaigns\nArray de 5 capítulos]
    end

    subgraph STATE [🧠 Estado Global]
        GS[gameState\nplayerDeck\nunlockedLevel\ncompletedLevels]
        BS[battleState\nplayerCard · enemyCard\nturn · statuses\ndefending]
    end

    subgraph UI [🖥️ Interface]
        NAV[Navegação\nnavigate]
        DECK_UI[Grimório\nrenderDeckBuilder]
        MAP_UI[Mapa\nrenderCampaigns]
        BATTLE_UI[Arena\nupdateBattleUI]
        OVERLAY[Overlays\nresult · seletor]
    end

    subgraph LOGIC [⚙️ Lógica]
        TURN[executePlayerTurn\nexecuteEnemyTurn]
        FX[applySkillEffect\napplyDamage · applyHeal]
        STATUS[addStatus\nprocessStatusEffects]
        END[checkBattleEnd]
    end

    DATA --> STATE
    STATE --> UI
    UI --> LOGIC
    LOGIC --> STATE
    STATE -->|saveProgress| LS[(localStorage)]
    LS -->|loadProgress| STATE
```

---

## 🛠️ Detalhes Técnicos

- **Zero dependências** — sem npm, sem build, sem bundler
- **Fontes** via Google Fonts (Cinzel Decorative, IM Fell English, JetBrains Mono)
- **Persistência** via `localStorage` com chave `abismoArcano_v2`
- **Animações** 100% em CSS (`@keyframes`, `transition`)
- **Responsivo** — funciona em mobile com media queries em 900px e 600px
- **Compatibilidade** — Chrome, Firefox, Safari, Edge (qualquer navegador moderno)

---

## 🔮 Possíveis Expansões

- [ ] Múltiplas cartas em campo simultaneamente (batalha 3v3)
- [ ] Sistema de XP e evolução de cartas
- [ ] Loja com moeda ganhas por vitórias
- [ ] Efeitos sonoros e trilha com Web Audio API
- [ ] Modo PvP local (dois jogadores, mesma tela)
- [ ] Novas classes: Vampiro, Monge, Bardo
- [ ] Animações de habilidade com partículas CSS

---

<div align="center">

*Feito com HTML · CSS · JavaScript puro*

**⬡ DEMO RPG ⬡**

</div>
