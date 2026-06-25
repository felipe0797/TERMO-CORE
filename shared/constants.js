/**
 * CONSTANTES COMPARTILHADAS - Core Games Platform
 * Usadas por todos os jogos e pela plataforma
 */

// ============================================================
// SUPABASE CONFIGURATION
// ============================================================
const SUPABASE_URL = 'https://tdxygivlneimyorbxzzy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LjpRcjeUfTAw0TSxYJhlzQ_dX_jzYVa';

// ============================================================
// GAMES CATALOG
// ============================================================
const GAMES_CATALOG = [
    {
        id: 'termocore',
        name: 'TermoCore',
        description: 'Jogo de palavras tipo Wordle com 4 modos de jogo',
        icon: '📝',
        color: '#6366f1',
        url: 'games/termocore/index.html',
        status: 'available',
        version: 'v1.1.1'
    }
    // Futuros jogos serão adicionados aqui
];

// ============================================================
// PLATFORM SCREENS
// ============================================================
const SCREENS = {
    LOGIN: 'screen-login',
    GAMES_SELECTOR: 'screen-games-selector',
    GAME_PLAYING: 'screen-game-playing'
};

// ============================================================
// STORAGE KEYS
// ============================================================
const STORAGE_KEYS = {
    CURRENT_USER: 'core_games_current_user',
    CURRENT_GAME: 'core_games_current_game',
    PLATFORM_THEME: 'core_games_theme',
    AUTH_TOKEN: 'core_games_auth_token'
};

// ============================================================
// THEMES
// ============================================================
const PLATFORM_THEMES = {
    DARK: 'dark',
    LIGHT: 'light'
};

// ============================================================
// API ENDPOINTS
// ============================================================
const API_ENDPOINTS = {
    GAMES: '/api/games',
    USER_PROFILE: '/api/user/profile',
    USER_STATS: '/api/user/stats'
};

// ============================================================
// EXPORT
// ============================================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        GAMES_CATALOG,
        SCREENS,
        STORAGE_KEYS,
        PLATFORM_THEMES,
        API_ENDPOINTS
    };
}
