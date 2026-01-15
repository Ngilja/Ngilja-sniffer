/**
 * ÑĞĮĻJÃ_ÑĪJ - Bot WhatsApp Multi-Device
 * Point d'entrée principal
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const moment = require('moment-timezone');
const config = require('./config/config.js');

// Créer les dossiers nécessaires
async function setupDirectories() {
  const dirs = [
    config.PATHS.sessions,
    config.PATHS.downloads,
    config.PATHS.logs,
    './tmp'
  ];
  
  for (const dir of dirs) {
    await fs.ensureDir(dir);
    console.log(chalk.green(`✓ Dossier créé: ${dir}`));
  }
}

// Banner d'affichage
function displayBanner() {
  const banner = `
  ${chalk.cyan('╔══════════════════════════════════════╗')}
  ${chalk.cyan('║')}      ${chalk.yellow.bold('ÑĞĮĻJÃ_ÑĪJ BOT')}           ${chalk.cyan('║')}
  ${chalk.cyan('║')}   ${chalk.white('WhatsApp Multi-Device')}     ${chalk.cyan('║')}
  ${chalk.cyan('║')}     ${chalk.white('GitHub Edition')}          ${chalk.cyan('║')}
  ${chalk.cyan('╚══════════════════════════════════════╝')}
  
  ${chalk.cyan('📱')} ${chalk.white('Nom:')} ${chalk.yellow(config.BOT_NAME)}
  ${chalk.cyan('👑')} ${chalk.white('Owner:')} ${chalk.yellow(config.OWNER_NUMBER)}
  ${chalk.cyan('🌐')} ${chalk.white('GitHub:')} ${chalk.blue(config.URLS.REPOSITORY)}
  ${chalk.cyan('📦')} ${chalk.white('Version:')} ${chalk.green(config.VERSION)}
  ${chalk.cyan('⚙️')} ${chalk.white('Node.js:')} ${chalk.green(process.version)}
  
  ${chalk.cyan('══════════════════════════════════════')}
  `;
  
  console.log(banner);
}

// Log des fonctionnalités activées
function logFeatures() {
  console.log(chalk.cyan('🚀 Fonctionnalités activées:'));
  
  const features = Object.entries(config.FEATURES)
    .filter(([_, value]) => value)
    .map(([key]) => `  ${chalk.green('✓')} ${key}`);
  
  if (features.length > 0) {
    console.log(features.join('\n'));
  } else {
    console.log(chalk.yellow('  Aucune fonctionnalité activée'));
  }
  
  console.log('');
}

// Fonction principale
async function main() {
  try {
    // Afficher le banner
    displayBanner();
    
    // Créer les dossiers
    console.log(chalk.cyan('📁 Initialisation des dossiers...'));
    await setupDirectories();
    
    // Afficher les fonctionnalités
    logFeatures();
    
    // Charger dynamiquement le module WhatsApp
    console.log(chalk.cyan('📱 Chargement du module WhatsApp...'));
    const { startWhatsApp } = require('./whatsapp/connect');
    
    // Démarrer WhatsApp
    console.log(chalk.cyan('🔗 Connexion à WhatsApp...\n'));
    await startWhatsApp(config);
    
  } catch (error) {
    console.error(chalk.red('❌ Erreur critique:'), error.message);
    console.error(chalk.red('Stack:'), error.stack);
    
    // Redémarrer après 10 secondes
    console.log(chalk.yellow('🔄 Redémarrage dans 10 secondes...'));
    setTimeout(main, 10000);
  }
}

// Gestion des signaux
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n👋 Arrêt gracieux du bot...'));
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(chalk.yellow('\n⚠️ Signal SIGTERM reçu, arrêt...'));
  process.exit(0);
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error(chalk.red('💥 Erreur non capturée:'), error.message);
  console.error(chalk.red('Stack:'), error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('💥 Promesse rejetée non gérée:'), reason);
});

// Démarrer l'application
if (require.main === module) {
  main();
}

module.exports = { main };