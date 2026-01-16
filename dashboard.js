// dashboard.js - Gère le dashboard web du bot ÑĞĮĻJÃ_ÑĪJ

const logsDiv = document.getElementById('logs');
const waStatus = document.getElementById('wa-status');
const tgStatus = document.getElementById('tg-status');

// Fonction pour afficher les logs
function addLog(message, type='info') {
    const logEntry = document.createElement('div');
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logEntry.className = type === 'info' ? 'log' : type;
    logsDiv.appendChild(logEntry);
    logsDiv.scrollTop = logsDiv.scrollHeight; // auto-scroll
}

// Simule les mises à jour du statut WhatsApp / Telegram
function setStatus(bot, status) {
    if(bot === 'wa') waStatus.textContent = status;
    if(bot === 'tg') tgStatus.textContent = status;

    if(status.toLowerCase().includes('connect')) {
        if(bot === 'wa') waStatus.className = 'success';
        if(bot === 'tg') tgStatus.className = 'success';
    } else {
        if(bot === 'wa') waStatus.className = 'warning';
        if(bot === 'tg') tgStatus.className = 'warning';
    }
}

// Fonction pour envoyer des commandes (à compléter côté serveur)
function sendCommand(command) {
    addLog(`Commande envoyée: ${command}`, 'info');
    // Ici tu peux appeler ton API Node.js via fetch/Axios
    // Exemple:
    // fetch(`/api/command/${command}`).then(res => res.json()).then(data => addLog(data.msg))
}

// Test d'exemple
addLog('Dashboard prêt !', 'success');