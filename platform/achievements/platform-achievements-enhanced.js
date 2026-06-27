/**
 * PLATFORM ACHIEVEMENTS ENHANCED v2.2
 * Conquistas da plataforma Core Games.
 * Lê dados reais de game_stats via loadUserDataFromTermoCore.
 */

// ============================================================
// RENDERIZAR CONQUISTAS
// ============================================================
async function renderEnhancedAchievements() {
    const container = document.querySelector('[data-tab="achievements"]');
    if (!container) return;

    try {
        const raw = localStorage.getItem('cg_current_user');
        if (!raw) {
            container.innerHTML = '<p style="color:#a0aec0;padding:20px;">Usuário não autenticado</p>';
            return;
        }

        const userData = JSON.parse(raw);
        const stats    = await loadUserDataFromTermoCore(userData.id);

        const allAchievements = {
            termocore: [
                {
                    id: 'first_win',
                    name: 'Primeira Vitória',
                    description: 'Ganhe uma partida de 5 letras',
                    icon: '🎯',
                    unlocked: (stats?.['5_LETTERS']?.wins || 0) > 0,
                    reward: '100 XP'
                },
                {
                    id: 'perfect_game',
                    name: 'Jogo Perfeito',
                    description: 'Ganhe uma partida sem errar',
                    icon: '⭐',
                    unlocked: (stats?.perfectGames5L || 0) > 0,
                    reward: '250 XP'
                },
                {
                    id: 'survival_master',
                    name: 'Mestre da Sobrevivência',
                    description: 'Chegue na fase 10 no modo Sobrevivência',
                    icon: '💪',
                    unlocked: (stats?.bestSurvivalRound || 0) >= 10,
                    reward: '500 XP'
                },
                {
                    id: 'avalanche_champion',
                    name: 'Campeão da Avalanche',
                    description: 'Chegue na fase 5 no modo Avalanche',
                    icon: '🏔️',
                    unlocked: (stats?.bestAvalanchePhase || 0) >= 5,
                    reward: '500 XP'
                },
                {
                    id: 'collector',
                    name: 'Colecionador',
                    description: 'Acumule 1.000 moedas',
                    icon: '💰',
                    unlocked: (stats?.coins || 0) >= 1000,
                    reward: '200 XP'
                },
                {
                    id: 'veteran',
                    name: 'Veterano',
                    description: 'Jogue 100 partidas',
                    icon: '🎖️',
                    unlocked: (stats?.totalGames || 0) >= 100,
                    reward: '300 XP'
                }
            ]
        };

        const selectedGame   = document.getElementById('achievement-game-select')?.value || 'termocore';
        const achievements   = allAchievements[selectedGame] || allAchievements.termocore;
        const unlockedCount  = achievements.filter(a => a.unlocked).length;
        const progressPercent = achievements.length > 0
            ? Math.round((unlockedCount / achievements.length) * 100)
            : 0;

        container.innerHTML = `
        <div style="padding:20px;max-width:800px;margin:0 auto;">

            <!-- SELETOR DE JOGO -->
            <div style="background:linear-gradient(135deg,rgba(0,212,255,.1),rgba(0,100,200,.1));padding:16px;border-radius:12px;border:1px solid rgba(0,212,255,.2);margin-bottom:20px;">
                <label style="color:#a0aec0;font-size:12px;display:block;margin-bottom:8px;">Filtrar por Jogo:</label>
                <select id="achievement-game-select" onchange="renderEnhancedAchievements()"
                    style="width:100%;padding:10px;background:rgba(0,212,255,.05);border:1px solid rgba(0,212,255,.2);border-radius:6px;color:#cbd5e0;font-weight:700;">
                    <option value="termocore">🎮 TermoCore</option>
                </select>
            </div>

            <!-- PROGRESSO -->
            <div style="background:linear-gradient(135deg,rgba(0,212,255,.1),rgba(0,100,200,.1));padding:16px;border-radius:12px;border:1px solid rgba(0,212,255,.2);margin-bottom:20px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                    <span style="color:#a0aec0;font-size:12px;">Progresso</span>
                    <span style="color:#00d4ff;font-weight:700;font-size:12px;">${unlockedCount}/${achievements.length} Desbloqueadas</span>
                </div>
                <div style="width:100%;height:8px;background:rgba(0,212,255,.1);border-radius:4px;overflow:hidden;">
                    <div style="width:${progressPercent}%;height:100%;background:linear-gradient(90deg,#00d4ff,#0099cc);transition:width .3s ease;"></div>
                </div>
            </div>

            <!-- LISTA DE CONQUISTAS -->
            <div style="display:grid;gap:12px;">
                ${achievements.map(a => `
                <div style="background:${a.unlocked ? 'rgba(16,185,129,.05)' : 'rgba(0,212,255,.05)'};
                            padding:16px;border-radius:8px;
                            border:1px solid ${a.unlocked ? 'rgba(16,185,129,.2)' : 'rgba(0,212,255,.1)'};
                            opacity:${a.unlocked ? '1' : '0.7'};">
                    <div style="display:flex;gap:12px;align-items:flex-start;">
                        <div style="font-size:32px;">${a.icon}</div>
                        <div style="flex:1;">
                            <div style="color:${a.unlocked ? '#10b981' : '#cbd5e0'};font-weight:700;margin-bottom:4px;">${a.name}</div>
                            <div style="color:#a0aec0;font-size:12px;margin-bottom:8px;">${a.description}</div>
                            <div style="display:flex;justify-content:space-between;">
                                <span style="color:#a0aec0;font-size:11px;">Recompensa: ${a.reward}</span>
                                <span style="color:${a.unlocked ? '#10b981' : '#a0aec0'};font-size:11px;font-weight:700;">
                                    ${a.unlocked ? '✓ DESBLOQUEADA' : '🔒 BLOQUEADA'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
        `;

        console.log('✅ [Achievements] Conquistas renderizadas');
    } catch (err) {
        console.error('❌ [Achievements] renderEnhancedAchievements:', err);
        container.innerHTML = '<p style="color:#ef4444;padding:20px;">Erro ao carregar conquistas.</p>';
    }
}

// ============================================================
// ATUALIZAÇÃO PERIÓDICA
// ============================================================
function startAchievementsUpdateInterval() {
    setInterval(async () => {
        const activeBtn = document.querySelector('.nav-btn.active');
        if (activeBtn?.getAttribute('data-nav-btn') === 'achievements') {
            await renderEnhancedAchievements();
        }
    }, 20000);
}

console.log('✅ platform-achievements-enhanced.js v2.2 carregado');
