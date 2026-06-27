/**
 * PLATFORM ROULETTE UI v2.2
 * Interface da roleta da plataforma Core Games.
 * Usa platformRouletteManager (game_stats) — sem dependência de global_* ou universal_*.
 */

class PlatformRouletteUI {
    constructor() {
        this.isAnimating = false;
    }

    // ============================================================
    // RENDERIZAR ROLETA
    // ============================================================
    async renderRoulette() {
        const container = document.querySelector('[data-tab="roulette"]') ||
                          document.getElementById('roulette-container');
        if (!container) return;

        const raw = localStorage.getItem('cg_current_user');
        if (!raw) {
            container.innerHTML = '<p style="color:#a0aec0;padding:20px;">Usuário não autenticado</p>';
            return;
        }
        const userData = JSON.parse(raw);
        const tickets  = await platformRouletteManager.getTickets(userData.id);
        const prizes   = platformRouletteManager.prizes;

        container.innerHTML = `
        <div style="padding:20px;max-width:700px;margin:0 auto;">

            <!-- CABEÇALHO -->
            <div style="text-align:center;margin-bottom:24px;">
                <div style="font-size:48px;margin-bottom:8px;">🎡</div>
                <div style="font-size:22px;font-weight:700;color:#00d4ff;">Roleta Core Games</div>
                <div style="color:#a0aec0;font-size:13px;margin-top:4px;">Gire a roleta e ganhe prêmios incríveis!</div>
            </div>

            <!-- FICHAS -->
            <div style="background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.3);border-radius:8px;padding:12px 20px;display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:24px;">
                <span style="font-size:22px;">🎟️</span>
                <span style="color:#fbbf24;font-weight:700;font-size:18px;" id="roulette-tickets-display">${tickets}</span>
                <span style="color:#a0aec0;font-size:13px;">ficha${tickets !== 1 ? 's' : ''} disponível${tickets !== 1 ? 'is' : ''}</span>
            </div>

            <!-- RODA VISUAL (simplificada) -->
            <div style="background:linear-gradient(135deg,rgba(0,212,255,.08),rgba(0,100,200,.08));border:2px solid rgba(0,212,255,.2);border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
                <div id="roulette-prize-display" style="font-size:36px;margin-bottom:8px;">🎯</div>
                <div id="roulette-prize-label" style="color:#cbd5e0;font-weight:700;font-size:16px;">Pronto para girar!</div>
            </div>

            <!-- BOTÃO GIRAR -->
            <div style="text-align:center;margin-bottom:28px;">
                <button id="spin-btn"
                    onclick="platformRouletteUI.spin()"
                    ${tickets < 1 ? 'disabled' : ''}
                    style="padding:14px 40px;background:${tickets >= 1 ? 'linear-gradient(135deg,#00d4ff,#0099cc)' : 'rgba(100,100,100,.3)'};
                           color:${tickets >= 1 ? '#000' : '#718096'};border:none;border-radius:10px;
                           font-weight:700;font-size:16px;cursor:${tickets >= 1 ? 'pointer' : 'not-allowed'};
                           transition:all .2s;"
                    ${tickets >= 1 ? 'onmouseover="this.style.transform=\'scale(1.05)\'" onmouseout="this.style.transform=\'scale(1)\'"' : ''}>
                    🎯 Girar Roleta (1 ficha)
                </button>
                ${tickets < 1 ? '<div style="color:#a0aec0;font-size:12px;margin-top:8px;">Jogue TermoCore para ganhar fichas!</div>' : ''}
            </div>

            <!-- TABELA DE PRÊMIOS -->
            <div>
                <div style="font-weight:700;color:#00d4ff;margin-bottom:12px;font-size:15px;">🏆 Prêmios Possíveis</div>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;">
                    ${prizes.map(p => {
                        const totalWeight = prizes.reduce((s, x) => s + x.weight, 0);
                        const pct = Math.round((p.weight / totalWeight) * 100);
                        return `
                        <div style="background:rgba(0,212,255,.05);border:1px solid rgba(0,212,255,.1);border-radius:8px;padding:12px;text-align:center;">
                            <div style="font-size:24px;margin-bottom:4px;">${p.icon}</div>
                            <div style="color:#cbd5e0;font-size:13px;font-weight:600;">${p.label}</div>
                            <div style="color:#718096;font-size:11px;margin-top:2px;">${pct}% de chance</div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
        `;
    }

    // ============================================================
    // GIRAR ROLETA
    // ============================================================
    async spin() {
        if (this.isAnimating) return;

        const spinBtn = document.getElementById('spin-btn');
        if (spinBtn && spinBtn.disabled) {
            showToast('🎟️ Fichas insuficientes! Jogue TermoCore para ganhar fichas.', 'error');
            return;
        }

        this.isAnimating = true;
        if (spinBtn) spinBtn.disabled = true;

        // Animação de "girando"
        const prizeDisplay = document.getElementById('roulette-prize-display');
        const prizeLabel   = document.getElementById('roulette-prize-label');
        if (prizeDisplay) prizeDisplay.textContent = '🌀';
        if (prizeLabel)   prizeLabel.textContent   = 'Girando...';

        try {
            // Aguardar animação visual (1.5s)
            await new Promise(r => setTimeout(r, 1500));

            // Girar de verdade
            const prize = await platformRouletteManager.spinRoulette();

            if (prize) {
                if (prizeDisplay) prizeDisplay.textContent = prize.icon;
                if (prizeLabel)   prizeLabel.textContent   = prize.label;
                showToast(`🎉 Você ganhou: ${prize.label}!`, 'success');

                // Re-renderizar após breve delay para atualizar fichas
                setTimeout(() => this.renderRoulette(), 2000);
            } else {
                if (prizeDisplay) prizeDisplay.textContent = '❌';
                if (prizeLabel)   prizeLabel.textContent   = 'Erro ao girar';
                if (spinBtn) spinBtn.disabled = false;
            }
        } catch (err) {
            console.error('❌ [RouletteUI] spin:', err);
            if (spinBtn) spinBtn.disabled = false;
        } finally {
            this.isAnimating = false;
        }
    }
}

// Instância global
const platformRouletteUI = new PlatformRouletteUI();
console.log('✅ platform-roulette-ui.js v2.2 carregado');
