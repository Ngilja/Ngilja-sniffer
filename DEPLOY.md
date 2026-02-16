<!-- ============================================
     FICHIER: DEPLOY.md
     BOT: ELEXTERCORES FLEX
     PROPRIÉTAIRE: ÑĞĮĻJÃ_ÑĪJ
     ============================================ -->

<div align="center">
  
  <!-- Bannière de déploiement -->
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=40&duration=3000&pause=1000&color=FF0000&center=true&vCenter=true&width=600&height=100&lines=%F0%9F%9A%80+GUIDE+DE+D%C3%89PLOIEMENT+%F0%9F%9A%80;%F0%9F%94%B4+ELEXTERCORES+FLEX+%F0%9F%9F%A2" alt="Typing SVG" />
  
  <br>
  
  <!-- Badges de déploiement -->
  <p align="center">
    <img src="https://img.shields.io/badge/Render.com-Déploiement-FF0000?style=for-the-badge&logo=render" alt="Render">
    <img src="https://img.shields.io/badge/Heroku-Déploiement-00FF00?style=for-the-badge&logo=heroku" alt="Heroku">
    <img src="https://img.shields.io/badge/Railway-Déploiement-FF0000?style=for-the-badge&logo=railway" alt="Railway">
    <img src="https://img.shields.io/badge/Cyclic.sh-Déploiement-00FF00?style=for-the-badge&logo=cyclic" alt="Cyclic">
  </p>

  <!-- Ligne de séparation -->
  <hr style="border: 2px solid #FF0000; width: 80%;">
  
  <h2 style="color: #00FF00;">📋 Guide complet étape par étape</h2>
  
  <hr style="border: 2px solid #00FF00; width: 60%;">
  
</div>

<br>

<!-- ============================================
     TABLE DES MATIÈRES
     ============================================ -->

## 📑 **Table des matières**

<div style="background: #1e1e1e; color: white; padding: 20px; border-radius: 15px; margin-bottom: 30px;">

- [🚀 Déploiement sur Render.com](#-déploiement-sur-rendercom)
- [💜 Déploiement sur Heroku](#-déploiement-sur-heroku)
- [🚆 Déploiement sur Railway](#-déploiement-sur-railway)
- [🔄 Déploiement sur Cyclic.sh](#-déploiement-sur-cyclicsh)
- [🌐 Déploiement sur VPS (Ubuntu)](#-déploiement-sur-vps-ubuntu)
- [📦 Déploiement avec Docker](#-déploiement-avec-docker)
- [⚙️ Configuration avancée](#️-configuration-avancée)
- [❓ Dépannage](#-dépannage)

</div>

<br>

<!-- ============================================
     SECTION RENDER.COM
     ============================================ -->

## 🚀 **Déploiement sur Render.com**

<div style="background: linear-gradient(135deg, #2D2D2D, #1A1A1A); color: white; padding: 30px; border-radius: 20px; margin-bottom: 30px; border-left: 5px solid #FF0000;">

### 📝 **Étape 1: Préparer votre projet**

Créez un fichier `render.yaml` à la racine :

```yaml
# render.yaml
services:
  - type: web
    name: elextercores-bot
    env: node
    branch: main
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_VERSION
        value: 18.x
      - key: PORT
        value: 3000
      - key: BOT_NAME
        value: ELEXTERCORES FLEX
      - key: BOT_OWNER
        value: ÑĞĮĻJÃ_ÑĪJ
    plan: free