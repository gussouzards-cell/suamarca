# Fluap Infrastructure Diagram

Diagrama visual estilo Stripe Infrastructure representando a **Infraestrutura Central de Benefícios da Fluap**.

## 🎯 Conceito

> **"A Fluap é a Stripe do cuidado. Benefícios são as transações do ecossistema."**

## 📋 Estrutura

O diagrama é **radial/orbital**, com três camadas principais:

### ☀️ Núcleo Central
- **FLUAP ACCESS** - Core de Benefícios em Saúde
  - Envio, aplicação e liquidação de benefícios e descontos em farmácias

### 🟦 Camada Core Operacional (Órbita 1)
9 módulos principais conectados diretamente ao núcleo:
1. **FLUAP BENEFITS ENGINE** - Criação e gestão de benefícios
2. **FLUAP BENEFITS RULES** - Elegibilidade e segmentação
3. **FLUAP BENEFITS DELIVERY** - Envio de benefícios
4. **FLUAP BENEFITS REDEMPTION** - Validação em farmácia
5. **FLUAP BENEFITS LEDGER** - Livro razão imutável
6. **FLUAP BENEFITS CLEARING** - Cálculo de subsídio
7. **FLUAP BENEFITS FRAUD** - Antifraude
8. **FLUAP BENEFITS SUBSCRIPTIONS** - Benefícios recorrentes
9. **FLUAP BENEFITS API** - API pública

### 🧬 Sistemas de Suporte (Órbita 2)
5 módulos integrados:
- **FLUAP PASS** - Identidade e permissões
- **FLUAP PAY** - Pagamentos e repasses
- **FLUAP RX** - Prescrição como gatilho
- **FLUAP CONNECT** - Integração com farmácias
- **FLUAP CARE** - Acompanhamento do paciente

### 🌙 Camada de Impacto Social (Órbita 3)
- **FLUAP RECOVERY** - Doações automáticas baseadas no uso de benefícios

## 🚀 Como Usar

1. Abra o arquivo `fluap-infrastructure-diagram.html` em qualquer navegador moderno
2. O diagrama é interativo - passe o mouse sobre os módulos para destacá-los
3. As conexões mostram o fluxo bidirecional entre os componentes

## 🎨 Características Visuais

- **Estilo**: Clean, profissional, tech/infra (inspirado em diagramas Stripe)
- **Cores**: 
  - Azul Fluap como base (#3b82f6)
  - Dourado/amarelo para o núcleo (#FFD700)
- **Cards**: Bordas arredondadas (12px)
- **Ícones**: Minimalistas e simples
- **Conexões**: Setas bidirecionais mostrando fluxo contínuo

## 🔄 Fluxo Principal

```
RX / Care / Pass → Rules → Benefits Engine → Delivery → Redemption → Ledger → Clearing → Pay → Recovery
```

## 💡 Frase de Destaque

> *"Benefits are the transaction primitive of the Fluap ecosystem."*

---

Desenvolvido para visualizar a arquitetura central de benefícios da Fluap de forma clara e profissional.


