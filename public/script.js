// ============================================
// FICHIER: script.js
// BOT: ELEXTERCORES FLEX
// PROPRIÉTAIRE: ÑĞĮĻJÃ_ÑĪJ
// ============================================

// ============================================
// INITIALISATION SOCKET.IO
// ============================================
const socket = io();
let botConnected = false;
let messageCount = 0;
let commandCount = 0;
let logsVisible = true;

// ============================================
// ÉLÉMENTS DU DOM
// ============================================
const qrSection = document.getElementById('qrSection');
const dashboard = document.getElementById('dashboard');
const qrCode = document.getElementById('qrCode');
const qrPlaceholder = document.getElementById('qrPlaceholder');
const statusDot = document.querySelector('.status-dot');
const statusText = document.getElementById('statusText');
const botNumber = document.getElementById('botNumber');
const botOwner = document.getElementById('botOwner');
const botUptime = document.getElementById('botUptime');
const totalMessages = document.getElementById('totalMessages');
const totalCommands = document.getElementById('totalCommands');
const totalGroups = document.getElementById('totalGroups');
const botStatus = document.getElementById('botStatus');
const logContainer = document.getElementById('logContainer');
const versionText = document.getElementById('versionText');
const qrBotName = document.getElementById('qrBotName');
const ownerName = document.getElementById('ownerName');
const toggleIcon = document.getElementById('toggleIcon');

// ============================================
// ÉVÉNEMENTS SOCKET.IO
// ============================================

// Réception du QR Code
socket.on('qr', (qrData) => {
    console.log('📱 QR Code reçu');
    qrPlaceholder.style.display = 'none';
    qrCode.src = qrData;
    qrCode.style.display = 'block';
    showToast('QR Code généré ! Scannez avec WhatsApp', 'info');
});

// Connexion réussie
socket.on('connected', (data) => {
    console.log('✅ Bot connecté!', data);
    botConnected = true;
    
    // Mise à jour de l'interface
    qrSection.style.display = 'none';
    dashboard.style.display = 'block';
    
    // Mise à jour des informations
    statusDot.className = 'status-dot connected';
    statusText.textContent = 'Connecté';
    botNumber.textContent = data.number || 'Inconnu';
    botOwner.textContent = data.owner || 'ÑĞĮĻJÃ_ÑĪJ';
    versionText.textContent = data.version || '1.0.0';
    qrBotName.textContent = data.name || 'ELEXTERCORES FLEX';
    ownerName.textContent = data.owner || 'ÑĞĮĻJÃ_ÑĪJ';
    botStatus.textContent = 'Actif';
    
    showToast(`✅ Bot connecté: ${data.number}`, 'success');
    
    // Démarrer le compteur d'uptime
    startUptimeCounter();
});

// Déconnexion
socket.on('disconnected', (data) => {
    console.log('❌ Bot déconnecté');
    botConnected = false;
    
    qrSection.style.display = 'flex';
    dashboard.style.display = 'none';
    
    statusDot.className = 'status-dot disconnected';
    statusText.textContent = 'Déconnecté';
    
    if (data && data.permanent) {
        showToast('❌ Session expirée. Reconnectez-vous.', 'error');
    } else {
        showToast('❌ Bot déconnecté', 'error');
    }
});

// Reconnexion en cours
socket.on('reconnecting', (data) => {
    showToast(`🔄 Reconnexion (${data.attempt}/${data.max})...`, 'info');
    statusText.textContent = 'Reconnexion...';
});

// Nouveau message
socket.on('newMessage', (msg) => {
    messageCount++;
    totalMessages.textContent = messageCount;
    addLog(msg);
});

// Commande exécutée
socket.on('commandExecuted', (data) => {
    commandCount++;
    totalCommands.textContent = commandCount;
    
    if (data.status === 'success') {
        addLog({
            from: '⚡ Système',
            text: `Commande exécutée: .${data.command}`,
            time: data.time
        });
    } else if (data.status === 'error') {
        addLog({
            from: '❌ Erreur',
            text: `Échec de .${data.command}: ${data.error}`,
            time: data.time
        });
    }
});

// Mise à jour de groupe
socket.on('groupUpdate', (data) => {
    const groupCount = parseInt(totalGroups.textContent) || 0;
    totalGroups.textContent = groupCount + 1;
    
    let actionText = '';
    switch(data.action) {
        case 'add':
            actionText = '➕ Nouveau membre ajouté';
            break;
        case 'remove':
            actionText = '➖ Membre retiré';
            break;
        case 'promote':
            actionText = '⬆️ Membre promu admin';
            break;
        case 'demote':
            actionText = '⬇️ Admin rétrogradé';
            break;
        default:
            actionText = '👥 Mise à jour groupe';
    }
    
    addLog({
        from: `👥 Groupe`,
        text: `${actionText} (${data.participants.length} participant(s))`,
        time: data.time
    });
});

// Statut du serveur
socket.on('status', (data) => {
    if (data.connected) {
        botConnected = true;
        statusDot.className = 'status-dot connected';
        statusText.textContent = 'Connecté';
        botOwner.textContent = data.owner || 'ÑĞĮĻJÃ_ÑĪJ';
    }
});

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

// Ajouter un log
function addLog(msg) {
    const template = document.getElementById('logTemplate');
    const logItem = template.content.cloneNode(true);
    
    const timeDiv = logItem.querySelector('.log-time');
    const fromDiv = logItem.querySelector('.log-from');
    const textDiv = logItem.querySelector('.log-text');
    
    timeDiv.textContent = msg.time || new Date().toLocaleTimeString('fr-FR');
    fromDiv.textContent = msg.from || 'Inconnu';
    textDiv.textContent = msg.text || '';
    
    // Supprimer le placeholder s'il existe
    const placeholder = logContainer.querySelector('.log-placeholder');
    if (placeholder) {
        placeholder.remove();
    }
    
    logContainer.appendChild(logItem);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// Effacer les logs
function clearLogs() {
    logContainer.innerHTML = `
        <div class="log-placeholder">
            <i class="fas fa-inbox"></i>
            <p>Logs effacés</p>
        </div>
    `;
    showToast('🧹 Logs effacés', 'info');
}

// Afficher/Masquer les logs
function toggleLogs() {
    if (logContainer.style.maxHeight) {
        logContainer.style.maxHeight = null;
        toggleIcon.className = 'fas fa-chevron-up';
        logsVisible = true;
    } else {
        logContainer.style.maxHeight = '100px';
        toggleIcon.className = 'fas fa-chevron-down';
        logsVisible = false;
    }
}

// Envoyer une commande rapide
async function sendQuickCommand(cmd) {
    if (!botConnected) {
        showToast('❌ Bot non connecté!', 'error');
        return;
    }
    
    const number = document.getElementById('phoneNumber').value;
    if (!number) {
        showToast('📱 Entrez un numéro de téléphone', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/api/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: number,
                message: cmd
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            addLog({
                from: `👤 Vous → ${number}`,
                text: cmd,
                time: new Date().toLocaleTimeString('fr-FR')
            });
            showToast(`✅ Commande envoyée: ${cmd}`, 'success');
        } else {
            showToast(`❌ Erreur: ${data.error}`, 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showToast('❌ Erreur de connexion', 'error');
    }
}

// Envoyer un message
async function sendMessage() {
    if (!botConnected) {
        showToast('❌ Bot non connecté!', 'error');
        return;
    }
    
    const number = document.getElementById('phoneNumber').value;
    const message = document.getElementById('messageText').value;
    const messageType = document.getElementById('messageType').value;
    
    if (!number) {
        showToast('📱 Entrez un numéro de téléphone', 'warning');
        return;
    }
    
    if (!message) {
        showToast('📝 Entrez un message', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/api/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: number,
                message: message
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            addLog({
                from: `👤 Vous → ${number} (${messageType})`,
                text: message,
                time: new Date().toLocaleTimeString('fr-FR')
            });
            document.getElementById('messageText').value = '';
            showToast('✅ Message envoyé!', 'success');
        } else {
            showToast(`❌ Erreur: ${data.error}`, 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showToast('❌ Erreur de connexion', 'error');
    }
}

// Déconnecter le bot
async function logoutBot() {
    if (!botConnected) {
        showToast('❌ Bot déjà déconnecté', 'error');
        return;
    }
    
    if (!confirm('⚠️ Êtes-vous sûr de vouloir déconnecter le bot ?')) {
        return;
    }
    
    try {
        const response = await fetch('/api/logout', {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('✅ Bot déconnecté avec succès', 'success');
            botConnected = false;
            qrSection.style.display = 'flex';
            dashboard.style.display = 'none';
            statusDot.className = 'status-dot disconnected';
            statusText.textContent = 'Déconnecté';
        } else {
            showToast(`❌ Erreur: ${data.error}`, 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showToast('❌ Erreur de connexion', 'error');
    }
}

// Rafraîchir le statut
async function refreshStatus() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        
        if (data.connected) {
            botConnected = true;
            statusDot.className = 'status-dot connected';
            statusText.textContent = 'Connecté';
            botNumber.textContent = data.number || 'Inconnu';
            botOwner.textContent = data.owner || 'ÑĞĮĻJÃ_ÑĪJ';
            versionText.textContent = data.version || '1.0.0';
        }
        
        showToast('🔄 Statut actualisé', 'info');
    } catch (error) {
        console.error('Erreur:', error);
        showToast('❌ Erreur de rafraîchissement', 'error');
    }
}

// Compteur d'uptime
function startUptimeCounter() {
    const startTime = Date.now();
    
    setInterval(() => {
        if (botConnected) {
            const uptime = Math.floor((Date.now() - startTime) / 1000);
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = uptime % 60;
            
            botUptime.textContent = `${hours}h ${minutes}m ${seconds}s`;
        }
    }, 1000);
}

// Afficher une notification toast
function showToast(message, type = 'info') {
    // Supprimer les toasts existants
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Créer le toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '';
    switch(type) {
        case 'success':
            icon = '✅';
            break;
        case 'error':
            icon = '❌';
            break;
        case 'warning':
            icon = '⚠️';
            break;
        default:
            icon = 'ℹ️';
    }
    
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Disparition automatique
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Vérifier le statut au chargement
window.addEventListener('load', async () => {
    console.log('🚀 Dashboard chargé');
    
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        
        if (data.connected) {
            botConnected = true;
            qrSection.style.display = 'none';
            dashboard.style.display = 'block';
            statusDot.className = 'status-dot connected';
            statusText.textContent = 'Connecté';
            botNumber.textContent = data.number || 'Inconnu';
            botOwner.textContent = data.owner || 'ÑĞĮĻJÃ_ÑĪJ';
            versionText.textContent = data.version || '1.0.0';
            qrBotName.textContent = data.botName || 'ELEXTERCORES FLEX';
            botStatus.textContent = 'Actif';
            
            startUptimeCounter();
            showToast('✅ Bot déjà connecté!', 'success');
        }
    } catch (error) {
        console.error('Erreur de chargement:', error);
    }
});

// Gestionnaire d'événements pour la touche Entrée
document.getElementById('messageText')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Animation de chargement pour les boutons
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function() {
        if (!this.classList.contains('no-animation')) {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
        }
    });
});

// ============================================
// EXPORT POUR UTILISATION GLOBALE
// ============================================
window.sendQuickCommand = sendQuickCommand;
window.sendMessage = sendMessage;
window.logoutBot = logoutBot;
window.refreshStatus = refreshStatus;
window.clearLogs = clearLogs;
window.toggleLogs = toggleLogs;// ============================================
// FONCTION POUR DEMANDER LE CODE DE PARRAGE
// ============================================
async function requestPairingCode() {
    const phoneNumber = document.getElementById('phoneNumberPair').value;
    const countryCode = document.getElementById('countryCode').value;
    
    if (!phoneNumber) {
        showToast('📱 Entrez votre numéro de téléphone', 'warning');
        return;
    }
    
    // Combiner le code pays et le numéro
    let fullNumber = countryCode + phoneNumber.replace(/^0+/, '');
    
    showToast('⏳ Génération du code en cours...', 'info');
    
    try {
        const response = await fetch('/api/pair', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phoneNumber: fullNumber })
        });
        
        const data = await response.json();
        
        if (response.ok && data.code) {
            // Afficher le code
            document.getElementById('codeBox').textContent = data.code;
            document.getElementById('pairingCodeDisplay').style.display = 'block';
            
            // Cacher le QR code si affiché
            document.getElementById('qrContainer').style.display = 'none';
            
            showToast(`✅ Code généré: ${data.code}`, 'success');
            
            // Copier automatiquement dans le presse-papier si possible
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(data.code);
                showToast('📋 Code copié!', 'success');
            }
        } else {
            showToast(`❌ Erreur: ${data.error}`, 'error');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showToast('❌ Erreur de connexion', 'error');
    }
}

// ============================================
// FONCTIONS POUR BASCOLER ENTRE QR ET CODE
// ============================================
function showQrMode() {
    document.getElementById('showQrBtn').classList.add('active');
    document.getElementById('showPairBtn').classList.remove('active');
    document.querySelector('.qr-section').style.display = 'block';
    document.querySelector('.pairing-section').style.display = 'none';
}

function showPairMode() {
    document.getElementById('showPairBtn').classList.add('active');
    document.getElementById('showQrBtn').classList.remove('active');
    document.querySelector('.qr-section').style.display = 'none';
    document.querySelector('.pairing-section').style.display = 'block';
}