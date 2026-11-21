# Navalha Real · site de barbearia

Site 100% em HTML, CSS e JavaScript, sem WordPress nem templates. Animações com GSAP, ScrollTrigger e Lenis (scroll suave).

## Como ver
Abram `index.html` no browser, ou publiquem a pasta no GitHub Pages. Precisa de internet para as fontes, as animações e as fotos.

## O que têm de mudar antes de publicar
1. **Número do WhatsApp**: em `js/main.js`, na linha `whatsapp: ''`, escrevam o número com indicativo e sem `+`, por exemplo `'244923000000'`. Enquanto estiver vazio, os botões abrem o WhatsApp sem contacto.
2. **Morada, horário e telefone**: em `index.html`, na secção `#contacto` e no rodapé (estão como "A confirmar" e `+244 9XX XXX XXX`).
3. **Nome**: "Navalha Real" é um nome de exemplo. Procurem e substituam em `index.html` e em `js/main.js`.
4. **Preços**: são valores de exemplo. Estão em `index.html` nas abas de serviços, nos cortes em destaque, na tabela de preços e no simulador (atributos `data-price`).
5. **Instagram, Facebook e TikTok**: os links do rodapé apontam para `#inicio`. Troquem pelos endereços reais.
6. **Mapa**: a caixa tracejada na secção de contacto é um espaço reservado. Substituam por um mapa quando houver morada.

## Fotos
As fotos são reais, do Unsplash, ligadas por URL (como na Pizzaria Italia). Não há imagens geradas por IA. As descrições vêm do próprio Unsplash, por isso confirmem se cada foto combina com o texto ao lado e troquem as que não servirem.

Para ter as fotos dentro do projeto, em vez de ligadas ao Unsplash:
1. Dentro desta pasta, corram `node baixar-fotos.mjs` (Node 18 ou mais recente). Descarrega todas para `img/` com os nomes da tabela abaixo.
2. Em `js/main.js`, mudem `USE_LOCAL_IMAGES = false` para `true`.

Para usar fotos vossas (recomendado, sobretudo na secção "Quem corta", que deve mostrar a equipa verdadeira), guardem-nas em `img/` com os mesmos nomes da tabela e façam só o passo 2.

| Ficheiro em `img/` | Onde aparece | Fotógrafo (Unsplash) | ID da foto |
|---|---|---|---|
| `hero.jpg` | Fundo do topo | Redd Francisco | `1672642150228-3fcd5826ec26` |
| `razor.jpg` | Secção "A casa" (foto larga) | Agustin Fernandez | `1599351431202-1e0f0137899a` |
| `svc-cut.jpg` | Serviços: corte à tesoura | Nate Johnston | `1647140655214-e4a2d914971f` |
| `svc-fade.jpg` | Serviços: degradê (e pré-visualização do degradê alto) | Peter Vimalis | `1783908688260-0c47404926f3` |
| `svc-beard.jpg` | Serviços: barba | Mr Shave | `1599011176306-4a96f1516d4d` |
| `svc-shave.jpg` | Serviços: navalha | Adam Sherez | `1494873446894-adbfecfc407a` |
| `svc-style.jpg` | Serviços: lavagem e styling | delfina pan | `1605497788044-5a32c7078486` |
| `style-fade.jpg` | Cortes em destaque: degradê (e simulador) | Michael DeMoya | `1593702275687-f8b402bf1fb5` |
| `style-classic.jpg` | Cortes em destaque: clássico (e simulador) | Josh Marty | `1761931403667-a6753db21f32` |
| `style-pomp.jpg` | Cortes em destaque: pompadour (e simulador) | Salah Regouane | `1635273051839-003bf06a8751` |
| `style-buzz.jpg` | Simulador: corte rente | Allef Vinicius | `1503951914875-452162b0f3f1` |
| `team-1.jpg` | Quem corta: 1.ª foto | Obi | `1567894340315-735d7c361db0` |
| `team-2.jpg` | Quem corta: 2.ª foto | Mitchell Orr | `1640301133857-c4bc5789c1bb` |
| `team-3.jpg` | Quem corta: 3.ª foto | Tá Focando | `1648221122323-572c13a31663` |
| `g1.jpg` | Galeria 1 | Barney Goodman | `1781455793310-8427c96454c7` |
| `g2.jpg` | Galeria 2 | Nathon Oski | `1585747860715-2ba37e788b70` |
| `g3.jpg` | Galeria 3 | T | `1773904215697-e6c21fc27ac2` |
| `g4.jpg` | Galeria 4 (larga) | Andrea Donato | `1621605815971-fbc98d665033` |
| `g5.jpg` | Galeria 5 | Jason Leung | `1536520002442-39764a41e987` |
| `g6.jpg` | Galeria 6 | František Čaník | `1675599193990-33d71150902b` |
| `g7.jpg` | Galeria 7 | Redd Francisco | `1702865272115-5afdbae975af` |
| `g8.jpg` | Galeria 8 (larga) | Thom Holmes | `1523532931495-f51ebf4bc3a2` |
| `visit.jpg` | Fundo da secção de contacto | Barney Goodman | `1781768526571-ef9c333279c7` |

Créditos: fotos de Unsplash, usadas ao abrigo da licença Unsplash.

## Estrutura
```
index.html
css/style.css       estilos e paleta (variáveis no topo)
js/main.js          menu, abas, simulador, formulário, galeria, WhatsApp
js/animations.js    GSAP, ScrollTrigger e Lenis (se não carregarem, o site continua completo)
img/                fotos (vazia até correrem baixar-fotos.mjs ou juntarem as vossas)
baixar-fotos.mjs    descarrega as fotos do Unsplash para img/
```

## Animações
Pré-carregamento com a risca do poste, entrada do título do hero, faixa de serviços que acelera com o scroll, títulos palavra a palavra, fotos com cortina e zoom, parallax, contadores, troca de abas, total do simulador a contar, botões que seguem o rato, galeria ampliada e barra de progresso. Tudo é desligado para quem tem "reduzir movimento" ativo.
