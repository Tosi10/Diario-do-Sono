# Identidade visual — Ana Gonçalves

Fonte: *Posicionamento e Identidade Visual* (Ananda Souza · Studio de Marcas, 2026).  
Este documento substitui o kit de teste (índigo / lavanda / dark mode).

**Nome da marca:** Ana Gonçalves  
**Categoria:** Psiquiatra (atuação ampla; sono e estilo de vida são *temas*, não o limite da marca)  
**Tagline:** Saúde mental é abrir espaço para a vida se renovar.  
**Instagram:** @anagonçalves.psiquiatra

Credenciais a confirmar com ela antes de publicar: CRM/PR e RQE (o PDF traz `CRM/PR 23.313 • RQE 190` nos cards digitais).

---

## O que a marca é (e não é)

| É | Não é |
|---|---|
| Baseada em evidências, acolhedora, clara | Fria, automática, só protocolo |
| Flexível com responsabilidade | Improvisada, rígida ou permissiva |
| Realista e esperançosa | Promessa de solução rápida |
| Profissional e próxima | Comercial demais / marketing de fórmula |
| Ampla em saúde mental | Só “medicina do sono” |

**Atributos:** técnica · atualizada · flexível · acolhedora · clara · realista  
**Síntese:** rigor sem rigidez.

---

## Paleta oficial

Valores oficiais do *Manual de Marca* (HEX / RGB / CMYK).

| # | Nome | Hex | RGB | Papel |
|---|------|-----|-----|--------|
| 01 | Terra rosada | `#78494E` | 120 73 78 | Autoridade, base, headers, texto principal |
| 02 | Marfim | `#F2EDE0` | 242 237 224 | Fundo principal, clareza, respiro |
| 03 | Argila | `#AD665C` | 173 102 92 | Calor, proximidade, CTA humano |
| 04 | Oliva | `#A39D79` | 163 157 121 | Crescimento, adaptação, acentos de saúde |
| 05 | Areia | `#E0D6C1` | 224 214 193 | Superfícies, cards, “espaço seguro” |

**Uso no produto**

- Fundo de tela: Marfim (nunca branco puro, nunca o índigo do demo).
- Cards / superfícies: Areia em 40–70% ou Marfim + borda Terra 8%.
- Texto: Terra rosada. Texto invertido: Marfim.
- Botão primário (agendar / salvar): Argila ou Terra. Sucesso / “hoje ok”: Oliva.
- Evitar neon, azul clínico, roxo “IA”, preto 100%.

O diário é preenchido **de manhã**. A identidade clara e quente é a correta — não um app “noite escura”.

---

## Tipografia

| Papel | Fonte | Onde |
|-------|--------|------|
| Títulos | **Bethany Elingston** (Regular / Italic) | H1–H2, quotes, nome da marca |
| UI e texto | **Work Sans** (Regular, Medium, Semibold, Bold) | App, formulários, landing body |
| Detalhe | **Jasmine Signature** | Tagline pontual, nunca em botão ou campo |

Bethany e Jasmine são **comerciais**. Work Sans é [Google Fonts](https://fonts.google.com/specimen/Work+Sans).  
Até ter a licença: fallback visual *Cormorant Garamond* (títulos) — só temporário.

---

## Logo (símbolo)

União da folha de **ginkgo** com formas botânicas + **ponto na base** (conhecimento técnico).

Valores do símbolo: resiliência · mente e ciência · flexibilidade · renovação · conhecimento.

**Lockups vistos no PDF (precisamos em SVG):**

1. Símbolo sozinho  
2. Símbolo + Ana Gonçalves + PSIQUIATRA (vertical, principal)  
3. Símbolo à direita de “Ana” (compacto)  
4. Símbolo em círculo (selo / favicon / app icon)  
5. “Ana G.” + símbolo (papelaria reduzida)

**Versões de cor:** Terra no Marfim · Marfim no Terra · Marfim no Oliva · Oliva no Terra · Argila no Marfim.

Não distorcer. Não recolorir com a paleta antiga. Não colocar em círculo extra se o lockup já tiver o selo.

---

## Texturas e elementos

Usar com parcimônia (marca d’água 6–12% opacidade):

- **Linho** — fundo Terra / Oliva  
- **Listras** orgânicas — seções da landing  
- **Tecidos** — fundo Marfim texturizado  
- **Elementos** — ginkgo, brotos, pontos (divisores, empty states, highlights do Instagram)

Fotografia: macro floral desfocada, areia, madeira, botânica. Nunca stock “médico de jaleco sorrindo”.

---

## Tom de voz (copy)

Clara, adulta, sem infantilizar. Sem “atendimento humanizado” genérico.  
Explicar possibilidades, limites e próximo passo. Decisão compartilhada.

Landing e app falam **Ana Gonçalves, psiquiatra**. O produto clínico do diário chama-se **Mapa do Sono**.

---

## App — Mapa do Sono

| Token `sleep.*` | Hex | Papel no app |
|-----------------|-----|--------------|
| bg | `#F1ECDF` | Fundo Marfim |
| ink | `#5C383D` | Texto Terra |
| accent | `#AC665C` | CTA Argila |
| lavender | `#A29D79` | Acentos Oliva |
| rose | `#78484E` | Labels |
| areia/line | `#DFD5C1` / `#D4C8B4` | Cards e bordas |

Tipografia no app: **Bodoni Moda** (títulos) + **Work Sans** (UI).  
Splash / ícone: selo ginkgo em fundo Marfim.

---

## Pasta de assets (quando extraídos)

```
assets/brand/
  logo-mark.svg
  logo-lockup-vertical.svg
  logo-lockup-compact.svg
  logo-seal.svg
  logo-ana-g.svg
  textures/linho.png
  textures/listras.png
  textures/tecidos.png
  elements/ginkgo.svg
  photo/hero-floral.jpg
  photo/retrato-consultorio.jpg
fonts/
  BethanyElingston-Regular.otf
  BethanyElingston-Italic.otf
  JasmineSignature.otf
```
