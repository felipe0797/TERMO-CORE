/**
 * UTILITÁRIOS COMPARTILHADOS - Core Games Platform
 * Funções auxiliares usadas por todos os módulos
 */

/**
 * Mostrar tela específica (esconder todas as outras)
 */
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

/**
 * Esconder tela
 */
function hideScreen(screenId) {
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.remove('active');
    }
}

/**
 * Mostrar notificação toast
 */
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Salvar dados no localStorage
 */
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
        return false;
    }
}

/**
 * Recuperar dados do localStorage
 */
function getFromLocalStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('Erro ao recuperar do localStorage:', error);
        return defaultValue;
    }
}

/**
 * Remover dados do localStorage
 */
function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Erro ao remover do localStorage:', error);
        return false;
    }
}

/**
 * Limpar todo o localStorage
 */
function clearLocalStorage() {
    try {
        localStorage.clear();
        return true;
    } catch (error) {
        console.error('Erro ao limpar localStorage:', error);
        return false;
    }
}

/**
 * Formatar número com separador de milhares
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Formatar moeda brasileira
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Formatar data
 */
function formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

/**
 * Delay/Sleep
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Verificar se usuário está autenticado
 */
async function isUserAuthenticated() {
    try {
        const user = await getCurrentUser();
        return user !== null;
    } catch (error) {
        return false;
    }
}

/**
 * Obter URL do jogo
 */
function getGameUrl(gameId) {
    const game = GAMES_CATALOG.find(g => g.id === gameId);
    return game ? game.url : null;
}

/**
 * Obter informações do jogo
 */
function getGameInfo(gameId) {
    return GAMES_CATALOG.find(g => g.id === gameId) || null;
}

/**
 * Validar email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validar username
 */
function isValidUsername(username) {
    // Username deve ter 3-20 caracteres, apenas letras, números e underscore
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
}

/**
 * Validar senha
 */
function isValidPassword(password) {
    // Mínimo 6 caracteres
    return password && password.length >= 6;
}

/**
 * Gerar ID único
 */
function generateUniqueId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Copiar para clipboard
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copiado para clipboard!', 'success');
        return true;
    } catch (error) {
        console.error('Erro ao copiar:', error);
        showToast('Erro ao copiar', 'error');
        return false;
    }
}

/**
 * Detectar dispositivo mobile
 */
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Detectar navegador
 */
function getBrowser() {
    const ua = navigator.userAgent;
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    if (ua.indexOf('Edge') > -1) return 'Edge';
    return 'Unknown';
}

/**
 * Log com timestamp
 */
function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    const prefix = `[${timestamp}]`;
    
    switch (type) {
        case 'error':
            console.error(`${prefix} ❌`, message);
            break;
        case 'success':
            console.log(`${prefix} ✅`, message);
            break;
        case 'warning':
            console.warn(`${prefix} ⚠️`, message);
            break;
        default:
            console.log(`${prefix} ℹ️`, message);
    }
}
