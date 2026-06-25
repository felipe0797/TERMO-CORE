/**
 * CONTEÚDO PADRÃO DAS ABAS
 * Renderiza conteúdo padrão quando as abas não têm dados
 */

// ============================================================
// RENDERIZAR PERFIL PADRÃO
// ============================================================
function renderDefaultProfile() {
    const container = document.querySelector('[data-tab="profile"]');
    if (!container) return;

    // Obter dados do localStorage
    const platformUser = localStorage.getItem('cg_current_user');
    let username = 'Usuário';
    let level = 1;
    let xp = 0;
    let coins = 0;
    let totalGames = 0;
    let ownedItems = 0;

    if (platformUser) {
        try {
            const userData = JSON.parse(platformUser);
            username = userData.username || 'Usuário';
        } catch (e) {
            console.error('❌ Erro ao parsear usuário:', e);
        }
    }

    container.innerHTML = `
        <div style="padding: 20px;">
            <div style="background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 100, 200, 0.1) 100%); padding: 24px; border-radius: 12px; border: 1px solid rgba(0, 212, 255, 0.2); margin-bottom: 24px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 10px;">👨‍💼</div>
                        <div style="color: #00d4ff; font-weight: 700; font-size: 18px;">${username}</div>
                        <div style="color: #a0aec0; font-size: 14px;">Nível ${level}</div>
                    </div>
                    <div style="display: flex; flex-direction: column; justify-content: center; gap: 12px;">
                        <div style="background: rgba(0, 212, 255, 0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(0, 212, 255, 0.2);">
                            <div style="color: #a0aec0; font-size: 12px; text-transform: uppercase;">XP Total</div>
                            <div style="color: #00d4ff; font-weight: 700; font-size: 18px;">${xp}</div>
                        </div>
                        <div style="background: rgba(0, 212, 255, 0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(0, 212, 255, 0.2);">
                            <div style="color: #a0aec0; font-size: 12px; text-transform: uppercase;">Moedas</div>
                            <div style="color: #00d4ff; font-weight: 700; font-size: 18px;">💰 ${coins}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div style="background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 100, 200, 0.1) 100%); padding: 24px; border-radius: 12px; border: 1px solid rgba(0, 212, 255, 0.2);">
                <div style="font-weight: 700; color: #00d4ff; margin-bottom: 16px; font-size: 16px;">📊 Estatísticas</div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
                    <div style="background: rgba(0, 212, 255, 0.05); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="color: #a0aec0; font-size: 12px; margin-bottom: 8px;">Jogos Jogados</div>
                        <div style="color: #00d4ff; font-weight: 700; font-size: 20px;">${totalGames}</div>
                    </div>
                    <div style="background: rgba(0, 212, 255, 0.05); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="color: #a0aec0; font-size: 12px; margin-bottom: 8px;">Nível</div>
                        <div style="color: #00d4ff; font-weight: 700; font-size: 20px;">${level}</div>
                    </div>
                    <div style="background: rgba(0, 212, 255, 0.05); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="color: #a0aec0; font-size: 12px; margin-bottom: 8px;">Itens</div>
                        <div style="color: #00d4ff; font-weight: 700; font-size: 20px;">${ownedItems}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// RENDERIZAR SOCIAL PADRÃO
// ============================================================
function renderDefaultSocial() {
    const container = document.querySelector('[data-tab="social"]');
    if (!container) return;

    container.innerHTML = `
        <div style="padding: 20px;">
            <div style="background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 100, 200, 0.1) 100%); padding: 24px; border-radius: 12px; border: 1px solid rgba(0, 212, 255, 0.2);">
                <div style="font-weight: 700; color: #00d4ff; margin-bottom: 16px; font-size: 16px;">👥 Amigos</div>
                <div style="text-align: center; color: #a0aec0; padding: 20px;">
                    <p>Você ainda não tem amigos.</p>
                    <p style="font-size: 12px;">Convide seus amigos para jogar!</p>
                </div>
            </div>

            <div style="background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 100, 200, 0.1) 100%); padding: 24px; border-radius: 12px; border: 1px solid rgba(0, 212, 255, 0.2); margin-top: 16px;">
                <div style="font-weight: 700; color: #00d4ff; margin-bottom: 16px; font-size: 16px;">💬 Mensagens</div>
                <div style="text-align: center; color: #a0aec0; padding: 20px;">
                    <p>Nenhuma mensagem ainda.</p>
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// RENDERIZAR CONQUISTAS PADRÃO
// ============================================================
function renderDefaultAchievements() {
    const container = document.querySelector('[data-tab="achievements"]');
    if (!container) return;

    container.innerHTML = `
        <div style="padding: 20px;">
            <div style="background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 100, 200, 0.1) 100%); padding: 24px; border-radius: 12px; border: 1px solid rgba(0, 212, 255, 0.2);">
                <div style="font-weight: 700; color: #00d4ff; margin-bottom: 16px; font-size: 16px;">🏆 Conquistas</div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
                    <div style="background: rgba(0, 212, 255, 0.05); padding: 16px; border-radius: 8px; text-align: center; opacity: 0.5;">
                        <div style="font-size: 32px; margin-bottom: 8px;">🎮</div>
                        <div style="color: #a0aec0; font-size: 12px;">Primeira Vitória</div>
                    </div>
                    <div style="background: rgba(0, 212, 255, 0.05); padding: 16px; border-radius: 8px; text-align: center; opacity: 0.5;">
                        <div style="font-size: 32px; margin-bottom: 8px;">⭐</div>
                        <div style="color: #a0aec0; font-size: 12px;">Perfeição</div>
                    </div>
                    <div style="background: rgba(0, 212, 255, 0.05); padding: 16px; border-radius: 8px; text-align: center; opacity: 0.5;">
                        <div style="font-size: 32px; margin-bottom: 8px;">📈</div>
                        <div style="color: #a0aec0; font-size: 12px;">Escalador</div>
                    </div>
                    <div style="background: rgba(0, 212, 255, 0.05); padding: 16px; border-radius: 8px; text-align: center; opacity: 0.5;">
                        <div style="font-size: 32px; margin-bottom: 8px;">🏅</div>
                        <div style="color: #a0aec0; font-size: 12px;">Veterano</div>
                    </div>
                </div>
                <div style="text-align: center; color: #a0aec0; margin-top: 20px; font-size: 12px;">
                    <p>Jogue mais para desbloquear conquistas!</p>
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// RENDERIZAR LOJA PADRÃO
// ============================================================
function renderDefaultShop() {
    const container = document.querySelector('[data-tab="shop"]');
    if (!container) return;

    container.innerHTML = `
        <div style="padding: 20px;">
            <div style="background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 100, 200, 0.1) 100%); padding: 24px; border-radius: 12px; border: 1px solid rgba(0, 212, 255, 0.2);">
                <div style="font-weight: 700; color: #00d4ff; margin-bottom: 16px; font-size: 16px;">🛒 Loja</div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
                    <div style="background: rgba(0, 212, 255, 0.05); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 32px; margin-bottom: 8px;">🌀</div>
                        <div style="color: #a0aec0; font-size: 12px; margin-bottom: 8px;">Neon Night</div>
                        <div style="color: #00d4ff; font-weight: 700; font-size: 14px;">5.000 💰</div>
                    </div>
                    <div style="background: rgba(0, 212, 255, 0.05); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 32px; margin-bottom: 8px;">🌅</div>
                        <div style="color: #a0aec0; font-size: 12px; margin-bottom: 8px;">Sunset Horizon</div>
                        <div style="color: #00d4ff; font-weight: 700; font-size: 14px;">6.000 💰</div>
                    </div>
                    <div style="background: rgba(0, 212, 255, 0.05); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 32px; margin-bottom: 8px;">🌲</div>
                        <div style="color: #a0aec0; font-size: 12px; margin-bottom: 8px;">Emerald Forest</div>
                        <div style="color: #00d4ff; font-weight: 700; font-size: 14px;">7.500 💰</div>
                    </div>
                    <div style="background: rgba(0, 212, 255, 0.05); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 32px; margin-bottom: 8px;">🤖</div>
                        <div style="color: #a0aec0; font-size: 12px; margin-bottom: 8px;">Cyberpunk 2077</div>
                        <div style="color: #00d4ff; font-weight: 700; font-size: 14px;">10.000 💰</div>
                    </div>
                </div>
                <div style="text-align: center; color: #a0aec0; margin-top: 20px; font-size: 12px;">
                    <p>Ganhe moedas jogando para comprar itens!</p>
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// RENDERIZAR ROLETA PADRÃO
// ============================================================
function renderDefaultRoulette() {
    const container = document.querySelector('[data-tab="roulette"]');
    if (!container) return;

    container.innerHTML = `
        <div style="padding: 20px;">
            <div style="background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 100, 200, 0.1) 100%); padding: 24px; border-radius: 12px; border: 1px solid rgba(0, 212, 255, 0.2); text-align: center;">
                <div style="font-size: 64px; margin-bottom: 16px;">🎡</div>
                <div style="font-weight: 700; color: #00d4ff; margin-bottom: 8px; font-size: 18px;">Roleta da Sorte</div>
                <div style="color: #a0aec0; margin-bottom: 20px;">
                    <p>Jogue TermoCore para ganhar tickets!</p>
                    <p style="font-size: 12px;">Use os tickets para girar a roleta e ganhar prêmios incríveis.</p>
                </div>
                <button style="padding: 12px 24px; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); color: #000; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 14px;">
                    🎮 Jogar TermoCore
                </button>
            </div>
        </div>
    `;
}

// ============================================================
// INICIALIZAR CONTEÚDO PADRÃO
// ============================================================
function initializeDefaultContent() {
    try {
        console.log('📝 Renderizando conteúdo padrão das abas...');
        
        renderGameSelector();
        renderDefaultProfile();
        renderDefaultSocial();
        renderDefaultAchievements();
        renderDefaultShop();
        renderDefaultRoulette();
        
        console.log('✅ Conteúdo padrão renderizado com sucesso');
    } catch (error) {
        console.error('❌ Erro ao renderizar conteúdo padrão:', error);
    }
}

// ============================================================
// RENDERIZAR GAME SELECTOR
// ============================================================
function renderGameSelector() {
    const container = document.querySelector('[data-tab="games"]');
    if (!container) return;

    container.innerHTML = `
        <div style="padding: 20px;">
            <div style="background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 100, 200, 0.1) 100%); padding: 24px; border-radius: 12px; border: 1px solid rgba(0, 212, 255, 0.2);">
                <div style="font-weight: 700; color: #00d4ff; margin-bottom: 20px; font-size: 18px;">🎮 Selecione um Jogo</div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                    <!-- Card TermoCore -->
                    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border: 2px solid #00d4ff; border-radius: 12px; overflow: hidden; transition: all 0.3s ease; cursor: pointer;" onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 10px 30px rgba(0, 212, 255, 0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                        <div style="background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); padding: 20px; text-align: center;">
                            <div style="font-size: 48px; margin-bottom: 10px;">🎮</div>
                            <div style="color: #000; font-weight: 700; font-size: 18px;">TERMOCORE</div>
                        </div>
                        <div style="padding: 20px;">
                            <div style="color: #a0aec0; font-size: 14px; margin-bottom: 12px;">Adivinhe palavras em português com 5 ou 7 letras</div>
                            <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                                <span style="background: rgba(0, 212, 255, 0.2); color: #00d4ff; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Puzzle</span>
                                <span style="background: rgba(0, 212, 255, 0.2); color: #00d4ff; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Palavras</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                <span style="color: #a0aec0; font-size: 12px;">⭐ 4.8 (1.2K)</span>
                                <span style="color: #a0aec0; font-size: 12px;">👥 5.3K jogadores</span>
                            </div>
                            <button onclick="playGame('termocore')" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); color: #000; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 14px; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                ▶️ JOGAR AGORA
                            </button>
                        </div>
                    </div>

                    <!-- Card Coming Soon -->
                    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border: 2px solid rgba(0, 212, 255, 0.3); border-radius: 12px; overflow: hidden; opacity: 0.6;">
                        <div style="background: linear-gradient(135deg, #666 0%, #444 100%); padding: 20px; text-align: center;">
                            <div style="font-size: 48px; margin-bottom: 10px;">🔒</div>
                            <div style="color: #999; font-weight: 700; font-size: 18px;">EM BREVE</div>
                        </div>
                        <div style="padding: 20px;">
                            <div style="color: #666; font-size: 14px; margin-bottom: 12px;">Novos jogos em desenvolvimento</div>
                            <div style="text-align: center; color: #666; font-size: 12px;">Volte em breve para mais diversão!</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// JOGAR JOGO
// ============================================================
function playGame(gameName) {
    if (gameName === 'termocore') {
        // Marcar que veio da plataforma
        localStorage.setItem('cg_current_game', 'termocore');
        
        // Redirecionar para o jogo
        window.location.href = './games/termocore/';
    }
}
