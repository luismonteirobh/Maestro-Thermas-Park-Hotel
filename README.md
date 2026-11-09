# Maestro Thermas Park & Hotel Fazenda - Clone Fiel

Clone estático e interativo da página oficial do **Maestro Thermas Park & Hotel Fazenda** (referência: `https://circuitoaguasquentes.com.br/maestro-thermas`), mapeado e validado utilizando a engine REA (Reverse Engineer Anything).

## Características

- **Clone 100% fiel e responsivo**:
  - Banner principal e navegação.
  - Motor de reservas completo e interativo (`Enjoy Booking`) com cálculo de noites, seleção de adultos, crianças, idades e envio para WhatsApp.
  - Seções de Estrutura, Vilas, Gastronomia com Pensão Completa e Atrações.
  - Galeria interativa de fotos com modal, miniaturas e categorização dinâmica (`Fazendinha`, `Complexo Coberto 37°C`, `Vilas & Apartamentos`, `Gastronomia`, `Lazer & Pesca`, `Fachada`).
  - Acordeão completo de Perguntas Frequentes (FAQ) com todas as 23 dúvidas respondidas.
  - Rodapé oficial completo com selos do Ministério do Turismo / Cadastur.
  - **Sem a seção de blog e artigos**, conforme solicitado.

- **Offline-ready**:
  - Todas as fontes (`Amelia`, `Baloo 2`, `Inter`, `Montserrat`, `Playfair Display`).
  - Todos os estilos CSS (`bundle.css`).
  - Ícones vetoriais SVG (`sprite2.svg`).
  - Todas as 127 fotos de alta resolução da galeria e fotos da página localizadas na pasta `maestro-thermas/`.

## Como Executar Localmente

### Opção 1: Via Servidor Local Node.js (incluso)
Na raiz do projeto:
```bash
node scripts/serve-clone.mjs
```
Acesse no navegador:
```
http://127.0.0.1:3000/
```

### Opção 2: Via qualquer servidor estático
```bash
npx serve maestro-site
```
ou com Python:
```bash
cd maestro-site
python -m http.server 3000
```
