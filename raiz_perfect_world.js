/**
 * 🧬 RAIZ Perfect World - Real System Simulation
 * Simulação realística baseada no código RAIZ real
 */

// Estados dos TRONs baseados no código real
const TronState = {
    ALIVE: 'alive',
    DYING: 'dying',
    DEAD: 'dead'
};

// Classe TRON baseada na implementação real
class RealTronVivo {
    constructor(id, content, valor, potencia, frequencia, ttl_seconds, hops = 3) {
        this.id = id || this.generateId();
        this.content = content;
        this.valor = valor; // -1, 0, 1
        this.potencia = potencia; // 0.1 - 10.0
        this.frequencia = frequencia; // Hz
        this.ttl_seconds = ttl_seconds;
        this.hops = hops;
        this.created_at = new Date();
        this.replicas = new Set();
        this.state = TronState.ALIVE;
        this.delivered = false;
        this.death_signal_sent = false;
        this.target_node = null;
    }

    generateId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `tron_${timestamp}_${random}`;
    }

    get age_seconds() {
        return Math.floor((Date.now() - this.created_at.getTime()) / 1000);
    }

    get ttl_remaining() {
        return Math.max(0, this.ttl_seconds - this.age_seconds);
    }

    get progress() {
        return Math.min(100, (this.age_seconds / this.ttl_seconds) * 100);
    }

    shouldDie() {
        return this.age_seconds >= this.ttl_seconds || this.delivered;
    }

    triggerApoptosis() {
        this.state = TronState.DYING;
        setTimeout(() => {
            this.state = TronState.DEAD;
        }, 2000); // 2 segundos para morrer
    }
}

// Classe Memória Distribuída baseada na implementação real
class RealMemoriaDistribuida {
    constructor(node_id) {
        this.node_id = node_id;
        this.trons = new Map();
        this.replicas = new Map();
        this.running = false;
        this.stats = {
            trons_created: 0,
            trons_replicated: 0,
            trons_deleted: 0,
            messages_sent: 0,
            apoptosis_triggered: 0
        };
    }

    start() {
        this.running = true;
        this.startApoptosisMonitor();
    }

    stop() {
        this.running = false;
    }

    create_tron(content, valor = 1, potencia = 1.0, frequencia = 8.0, ttl_seconds = 30) {
        const tron = new RealTronVivo(null, content, valor, potencia, frequencia, ttl_seconds);
        this.trons.set(tron.id, tron);
        this.stats.trons_created++;
        
        console.log(`[${this.node_id}] TRON criado: ${tron.id}`);
        return tron;
    }

    replicate_tron(tron, target_nodes) {
        target_nodes.forEach(node_id => {
            tron.replicas.add(node_id);
            this.stats.trons_replicated++;
        });
        
        console.log(`[${this.node_id}] TRON ${tron.id} replicado para ${target_nodes.length} nós`);
    }

    mark_delivered(tron_id, target_node) {
        const tron = this.trons.get(tron_id);
        if (tron) {
            tron.delivered = true;
            tron.target_node = target_node;
            console.log(`[${this.node_id}] TRON ${tron_id} marcado como entregue`);
        }
    }

    startApoptosisMonitor() {
        const monitor = () => {
            if (!this.running) return;
            
            for (const [tron_id, tron] of this.trons) {
                if (tron.shouldDie() && tron.state === TronState.ALIVE) {
                    tron.triggerApoptosis();
                    this.stats.apoptosis_triggered++;
                    console.log(`[${this.node_id}] Apoptose iniciada para TRON ${tron_id}`);
                }
                
                if (tron.state === TronState.DEAD) {
                    this.trons.delete(tron_id);
                    this.stats.trons_deleted++;
                    console.log(`[${this.node_id}] TRON ${tron_id} removido (apoptose completa)`);
                }
            }
            
            setTimeout(monitor, 1000);
        };
        
        monitor();
    }

    get_status() {
        return {
            node_id: this.node_id,
            trons_active: this.trons.size,
            stats: this.stats,
            running: this.running
        };
    }
}

// Classe Gateway Modular baseada na implementação real
class RealGatewayModular {
    constructor() {
        this.protocols = {
            udp: { active: true, messages: 0 },
            websocket: { active: true, messages: 0 },
            ble: { active: true, messages: 0 },
            local: { active: true, messages: 0 }
        };
        this.total_messages = 0;
    }

    propagate_tron(tron, protocol = 'all') {
        if (protocol === 'all') {
            Object.keys(this.protocols).forEach(p => {
                if (this.protocols[p].active) {
                    this.protocols[p].messages++;
                    this.total_messages++;
                }
            });
        } else if (this.protocols[protocol] && this.protocols[protocol].active) {
            this.protocols[protocol].messages++;
            this.total_messages++;
        }
        
        console.log(`[Gateway] TRON ${tron.id} propagado via ${protocol}`);
    }

    get_status() {
        return {
            protocols: this.protocols,
            total_messages: this.total_messages
        };
    }
}

// Sistema RAIZ Principal
class RealRAIZSystem {
    constructor() {
        this.nodes = new Map();
        this.gateway = new RealGatewayModular();
        this.running = false;
        this.currentStage = null;
        
        this.initializeNodes();
        this.setupEventListeners();
    }

    initializeNodes() {
        // Criar nós de memória distribuída
        ['node-001', 'node-002', 'node-003'].forEach(nodeId => {
            const node = new RealMemoriaDistribuida(nodeId);
            this.nodes.set(nodeId, node);
        });
    }

    setupEventListeners() {
        document.getElementById('start-system').addEventListener('click', () => this.startSystem());
        document.getElementById('spawn-tron').addEventListener('click', () => this.spawnTron());
        document.getElementById('trigger-apoptosis').addEventListener('click', () => this.triggerApoptosis());
        document.getElementById('reset-system').addEventListener('click', () => this.resetSystem());
    }    startSystem() {
        this.running = true;
        
        // Atualizar indicador de status
        this.updateSystemStatusIndicator('online', 'Sistema Online - Nós inicializando...');
        
        // Iniciar todos os nós
        for (const node of this.nodes.values()) {
            node.start();
        }
        
        // Indicar sistema ativo após inicialização
        setTimeout(() => {
            this.updateSystemStatusIndicator('active', 'Sistema Ativo - Rede RAIZ operacional!');
        }, 2000);
        
        // Iniciar atualizações da UI
        this.startUIUpdates();
        
        // Simular atividade automática
        this.startAutoActivity();
        
        this.updateSystemStatus();
        console.log('🚀 Sistema RAIZ iniciado!');
    }

    spawnTron() {
        if (!this.running) {
            alert('Sistema precisa estar iniciado!');
            return;
        }
        
        // Selecionar nó aleatório
        const nodeIds = Array.from(this.nodes.keys());
        const sourceNodeId = nodeIds[Math.floor(Math.random() * nodeIds.length)];
        const sourceNode = this.nodes.get(sourceNodeId);
        
        // Criar TRON
        const content = `Mensagem ${Date.now()}`;
        const valor = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        const potencia = Math.random() * 9.9 + 0.1; // 0.1 - 10.0
        const frequencia = Math.random() * 49 + 1; // 1 - 50 Hz
        const ttl = Math.floor(Math.random() * 20) + 10; // 10-30 segundos
        
        const tron = sourceNode.create_tron(content, valor, potencia, frequencia, ttl);
        
        // Animação de nascimento
        this.animateStage('birth');
        
        // Replicar para outros nós
        setTimeout(() => {
            const otherNodes = nodeIds.filter(id => id !== sourceNodeId);
            sourceNode.replicate_tron(tron, otherNodes);
            this.animateStage('replication');
            
            // Propagar via gateway
            setTimeout(() => {
                this.gateway.propagate_tron(tron);
                this.animateStage('propagation');
                
                // Simular entrega
                setTimeout(() => {
                    const targetNode = otherNodes[Math.floor(Math.random() * otherNodes.length)];
                    sourceNode.mark_delivered(tron.id, targetNode);
                    this.animateStage('delivery');
                }, 2000);
            }, 1000);
        }, 1000);
    }

    triggerApoptosis() {
        // Forçar apoptose em todos os TRONs
        for (const node of this.nodes.values()) {
            for (const tron of node.trons.values()) {
                if (tron.state === TronState.ALIVE) {
                    tron.triggerApoptosis();
                }
            }
        }
        
        this.animateStage('apoptosis');
        console.log('💀 Apoptose forçada em todos os TRONs');
    }    resetSystem() {
        this.running = false;
        
        // Atualizar indicador de status
        this.updateSystemStatusIndicator('offline', 'Sistema Offline - Clique em "Iniciar Sistema RAIZ"');
        
        // Parar todos os nós
        for (const node of this.nodes.values()) {
            node.stop();
            node.trons.clear();
            node.stats = {
                trons_created: 0,
                trons_replicated: 0,
                trons_deleted: 0,
                messages_sent: 0,
                apoptosis_triggered: 0
            };
        }
        
        // Reset gateway
        this.gateway = new RealGatewayModular();
        
        // Reset UI
        this.updateSystemStatus();
        this.clearActiveStages();
        document.getElementById('active-trons-list').innerHTML = '';
        
        console.log('🔄 Sistema resetado');
    }

    animateStage(stageName) {
        // Remover animação anterior
        this.clearActiveStages();
        
        // Ativar nova animação
        const stageMap = {
            'birth': 0,
            'replication': 1,
            'propagation': 2,
            'delivery': 3,
            'apoptosis': 4
        };
        
        const stages = document.querySelectorAll('.stage');
        if (stages[stageMap[stageName]]) {
            stages[stageMap[stageName]].classList.add('active');
            this.currentStage = stageName;
            
            // Remover após 3 segundos
            setTimeout(() => {
                stages[stageMap[stageName]].classList.remove('active');
                if (this.currentStage === stageName) {
                    this.currentStage = null;
                }
            }, 3000);
        }
    }

    clearActiveStages() {
        document.querySelectorAll('.stage').forEach(stage => {
            stage.classList.remove('active');
        });
    }

    startUIUpdates() {
        const updateUI = () => {
            if (!this.running) return;
            
            this.updateSystemStatus();
            this.updateActiveTrons();
            
            setTimeout(updateUI, 1000);
        };
        
        updateUI();
    }

    startAutoActivity() {
        const createAutoTron = () => {
            if (!this.running) return;
            
            // 30% chance de criar TRON automaticamente
            if (Math.random() < 0.3) {
                this.spawnTron();
            }
            
            setTimeout(createAutoTron, 5000);
        };
        
        setTimeout(createAutoTron, 5000);
    }    updateSystemStatusIndicator(status, message) {
        const statusElement = document.getElementById('system-status');
        const indicator = statusElement.querySelector('.status-indicator');
        const text = statusElement.querySelector('.status-text');
        
        // Remover classes anteriores
        indicator.classList.remove('offline', 'online', 'active');
        
        // Adicionar nova classe
        indicator.classList.add(status);
        
        // Atualizar texto
        text.textContent = message;
    }

    updateSystemStatus() {
        // Atualizar status dos nós
        for (const [nodeId, node] of this.nodes) {
            const nodeElement = document.getElementById(nodeId);
            if (nodeElement) {
                const status = node.get_status();
                nodeElement.querySelector('.tron-count').textContent = status.trons_active;
                nodeElement.querySelector('.replica-count').textContent = status.stats.trons_replicated;
                nodeElement.querySelector('.node-status').textContent = status.running ? 'ATIVO' : 'PARADO';
                
                // Mudar cor do status
                const statusElement = nodeElement.querySelector('.node-status');
                statusElement.style.background = status.running ? 
                    'rgba(0, 255, 136, 0.2)' : 'rgba(255, 107, 107, 0.2)';
                statusElement.style.color = status.running ? '#00ff88' : '#ff6b6b';
            }
        }
        
        // Atualizar gateway
        const gatewayStatus = this.gateway.get_status();
        const gatewayElement = document.getElementById('gateway-001');
        if (gatewayElement) {
            gatewayElement.querySelector('.msg-count').textContent = gatewayStatus.total_messages;
            
            // Atualizar protocolos
            Object.entries(gatewayStatus.protocols).forEach(([protocol, data]) => {
                const protocolElement = gatewayElement.querySelector(`.protocol.${protocol} .status`);
                if (protocolElement) {
                    protocolElement.textContent = data.active ? 'ATIVO' : 'INATIVO';
                    protocolElement.style.color = data.active ? '#00ff88' : '#ff6b6b';
                }
            });
        }
    }

    updateActiveTrons() {
        const activeTronsList = document.getElementById('active-trons-list');
        activeTronsList.innerHTML = '';
        
        // Coletar todos os TRONs ativos
        const allTrons = [];
        for (const node of this.nodes.values()) {
            for (const tron of node.trons.values()) {
                allTrons.push({ tron, node_id: node.node_id });
            }
        }
        
        // Criar elementos para cada TRON
        allTrons.forEach(({ tron, node_id }) => {
            const tronElement = document.createElement('div');
            tronElement.className = 'live-tron';
            tronElement.innerHTML = `
                <div class="tron-header">
                    <div class="tron-id">${tron.id.substr(0, 20)}...</div>
                    <div class="tron-state ${tron.state}">${tron.state.toUpperCase()}</div>
                </div>
                <div class="tron-info">Nó: <span>${node_id}</span></div>
                <div class="tron-info">Conteúdo: <span>${tron.content}</span></div>
                <div class="tron-info">Valor: <span>${tron.valor}</span></div>
                <div class="tron-info">Potência: <span>${tron.potencia.toFixed(1)} Hz</span></div>
                <div class="tron-info">Frequência: <span>${tron.frequencia.toFixed(1)} MHz</span></div>
                <div class="tron-info">TTL Restante: <span>${tron.ttl_remaining}s</span></div>
                <div class="tron-info">Réplicas: <span>${tron.replicas.size}</span></div>
                <div class="tron-progress">
                    <div class="tron-progress-bar" style="width: ${tron.progress}%"></div>
                </div>
            `;
            
            activeTronsList.appendChild(tronElement);
        });
        
        // Se não há TRONs, mostrar mensagem
        if (allTrons.length === 0) {
            activeTronsList.innerHTML = '<div style="text-align: center; opacity: 0.7; padding: 2rem;">Nenhum TRON ativo no sistema</div>';
        }
    }
}

/**
 * Welcome Popup Management
 */
function closeWelcomePopup() {
    const overlay = document.getElementById('welcomeOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
        setTimeout(() => {
            overlay.remove();
        }, 500);
    }
}

// Auto-show welcome popup on load
window.addEventListener('load', () => {
    // Small delay to ensure smooth animation
    setTimeout(() => {
        const overlay = document.getElementById('welcomeOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }, 1000);
});

// Make closeWelcomePopup globally available
window.closeWelcomePopup = closeWelcomePopup;

// Inicializar sistema quando página carrega
window.addEventListener('load', () => {
    window.raizSystem = new RealRAIZSystem();
    
    // Criar popup de boas-vindas opcional (mais elegante que alert)
    setTimeout(() => {
        createWelcomeModal();
    }, 4000); // Aparece após 4 segundos
});

// Função para criar modal de boas-vindas elegante
function createWelcomeModal() {
    const modal = document.createElement('div');
    modal.id = 'welcome-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: modal-fade-in 0.5s ease-out;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: linear-gradient(135deg, #1a0a2e, #16213e);
        padding: 3rem;
        border-radius: 20px;
        border: 2px solid #00ff88;
        max-width: 600px;
        width: 90%;
        color: white;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 255, 136, 0.3);
        animation: modal-slide-in 0.5s ease-out;
    `;
    
    content.innerHTML = `
        <div style="font-size: 4rem; margin-bottom: 1rem;">🧬</div>
        <h2 style="color: #00ff88; margin-bottom: 1.5rem; font-size: 2rem;">
            Bem-vindo ao RAIZ Perfect World!
        </h2>
        <div style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 2rem; opacity: 0.9;">
            <p style="margin-bottom: 1rem;">
                <strong>🚀 Experimente o sistema RAIZ funcionando perfeitamente!</strong>
            </p>
            <div style="text-align: left; max-width: 400px; margin: 0 auto;">
                <p>• <strong>Iniciar Sistema:</strong> Liga toda a rede distribuída</p>
                <p>• <strong>Criar TRON:</strong> Veja entidades nascerem e evoluírem</p>
                <p>• <strong>Apoptose Digital:</strong> TRONs morrem automaticamente</p>
                <p>• <strong>Tempo Real:</strong> Tudo funciona como sistema real</p>
            </div>
        </div>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <button onclick="document.getElementById('welcome-modal').remove(); document.getElementById('start-system').click();" style="
                background: linear-gradient(135deg, #00ff88, #00cc6a);
                color: black;
                border: none;
                padding: 1rem 2rem;
                border-radius: 10px;
                font-weight: bold;
                cursor: pointer;
                font-size: 1rem;
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                🚀 Começar Agora!
            </button>
            <button onclick="document.getElementById('welcome-modal').remove()" style="
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.3);
                padding: 1rem 2rem;
                border-radius: 10px;
                font-weight: bold;
                cursor: pointer;
                font-size: 1rem;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='rgba(255, 255, 255, 0.2)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.1)'">
                Explorar Primeiro
            </button>
        </div>
        <div style="margin-top: 1.5rem; font-size: 0.9rem; opacity: 0.7;">
            Pressione ESC para fechar a qualquer momento
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Adicionar animações CSS se não existirem
    if (!document.getElementById('modal-animations')) {
        const style = document.createElement('style');
        style.id = 'modal-animations';
        style.textContent = `
            @keyframes modal-fade-in {
                0% { opacity: 0; }
                100% { opacity: 1; }
            }
            
            @keyframes modal-slide-in {
                0% { transform: translateY(-50px) scale(0.9); opacity: 0; }
                100% { transform: translateY(0) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Fechar com ESC
    const handleKeydown = (e) => {
        if (e.key === 'Escape' && document.getElementById('welcome-modal')) {
            document.getElementById('welcome-modal').remove();
            document.removeEventListener('keydown', handleKeydown);
        }
    };
    document.addEventListener('keydown', handleKeydown);
    
    // Fechar clicando fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            document.removeEventListener('keydown', handleKeydown);
        }
    });
}
