import type {
  LevelDefinition,
  LevelId,
  LevelGameState,
  LevelProgress,
  LevelPlayerState,
  DadongAIState,
  EnemyState,
  AreaControlState,
  AreaType,
  LevelCompletionResult,
  LevelTurnPhase,
  LevelPhaseResult,
  LevelPendingJudgment,
  LevelResponseEvent,
  LevelTeamSharedLevels,
  ActiveEffect
} from '@/types/levelTypes';
import {
  LEVEL_DATABASE,
  LEVEL_ORDER,
  INITIAL_UNLOCKED_CARDS
} from '@/data/levelDatabase';
import {
  DADONG_AI,
  getXiaobaiResourceRecovery,
  getXiaobaiActionPoints
} from '@/data/levelCharacters';
import { DEFENDER_T1_CARDS, ATTACKER_T1_CARDS } from '@/data/cardDatabase';
import { LEVEL1_CARDS, LEVEL2_CARDS, LEVEL3_CARDS, LEVEL4_CARDS, LEVEL5_CARDS, LEVEL6_CARDS, LEVEL7_CARDS, LEVEL8_CARDS, LEVEL9_CARDS, JUDGMENT_CARDS } from '@/data/levelCardDatabase';
import type { Card } from '@/types/legacy/card_v16';
import {
  LEVEL_TURN_PHASES,
  LEVEL_PHASE_NAMES,
  getLevelHandLimit,
  getLevelDrawCount
} from '@/types/levelTypes';
import { LevelAIController } from './LevelAIController';
import type { AIOperationLog, VisualizationUpdateData } from './LevelAIController';
import { JudgmentEventBus } from './JudgmentEventBus';

const STORAGE_KEY = 'level_progress';

interface LevelProgressStorage {
  [key: LevelId]: LevelProgress;
}

export class LevelGameStateManager {
  private state: LevelGameState | null = null;
  private progressStorage: LevelProgressStorage;
  private onStateChange: ((state: LevelGameState) => void) | null = null;
  private onLevelComplete: ((result: LevelCompletionResult) => void) | null = null;
  private onGameOver: (() => void) | null = null;
  private onPhaseChange: ((phase: LevelTurnPhase) => void) | null = null;
  private aiController: LevelAIController;
  private onAIOperationLog?: (log: AIOperationLog) => void;
  private onVisualizationUpdate?: (data: VisualizationUpdateData) => void;

  constructor() {
    this.progressStorage = this.loadProgress();
    this.aiController = new LevelAIController({
      dadongDifficulty: 'medium',
      enemyDifficulty: 'medium',
      enableVisualization: true,
      delayBetweenActions: 600
    });
    
    // 设置AI操作日志回调
    this.aiController.setOnOperationLog((log) => {
      if (this.onAIOperationLog) {
        this.onAIOperationLog(log);
      }
    });
    
    // 设置AI状态变更回调
    this.aiController.setOnStateChange((state) => {
      this.state = state;
      this.notifyStateChange();
    });

    // 设置AI可视化更新回调
    this.aiController.setOnVisualizationUpdate((data) => {
      if (this.onVisualizationUpdate) {
        this.onVisualizationUpdate(data);
      }
      // 同时通过 window 对象通知界面组件
      if (typeof window !== 'undefined') {
        const callback = (window as unknown as { onLevelAIVisualizationUpdate?: (data: VisualizationUpdateData) => void }).onLevelAIVisualizationUpdate;
        if (callback) {
          callback(data);
        }
      }
    });
  }

  setOnAIOperationLog(callback: (log: AIOperationLog) => void): void {
    this.onAIOperationLog = callback;
  }

  setOnVisualizationUpdate(callback: (data: VisualizationUpdateData) => void): void {
    this.onVisualizationUpdate = callback;
  }

  private loadProgress(): LevelProgressStorage {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load level progress:', e);
    }
    return this.initializeProgress();
  }

  private initializeProgress(): LevelProgressStorage {
    const progress: LevelProgressStorage = {};
    LEVEL_ORDER.forEach((levelId, index) => {
      progress[levelId] = {
        levelId,
        status: index === 0 ? 'available' : 'locked',
        completedObjectives: [],
        attempts: 0
      };
    });
    this.saveProgress(progress);
    return progress;
  }

  private saveProgress(progress: LevelProgressStorage = this.progressStorage): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save level progress:', e);
    }
  }

  setOnStateChange(callback: (state: LevelGameState) => void): void {
    this.onStateChange = callback;
  }

  setOnLevelComplete(callback: (result: LevelCompletionResult) => void): void {
    this.onLevelComplete = callback;
  }

  setOnGameOver(callback: () => void): void {
    this.onGameOver = callback;
  }

  setOnPhaseChange(callback: (phase: LevelTurnPhase) => void): void {
    this.onPhaseChange = callback;
  }

  getProgress(): LevelProgressStorage {
    return this.progressStorage;
  }

  getLevelProgress(levelId: LevelId): LevelProgress | undefined {
    return this.progressStorage[levelId];
  }

  isLevelUnlocked(levelId: LevelId): boolean {
    const progress = this.progressStorage[levelId];
    return progress?.status === 'available' || progress?.status === 'completed' || progress?.status === 'mastered';
  }

  startLevel(levelId: LevelId): LevelGameState {
    const level = LEVEL_DATABASE[levelId];
    if (!level) {
      throw new Error(`Level ${levelId} not found`);
    }

    const progress = this.progressStorage[levelId];
    if (progress.status === 'locked') {
      throw new Error(`Level ${levelId} is locked`);
    }

    this.progressStorage[levelId].status = 'in_progress';
    this.progressStorage[levelId].attempts += 1;
    this.saveProgress();

    const initialState = this.createInitialState(level);
    this.state = initialState;
    console.log('[LevelGameStateManager] startLevel: created initial state with phase:', initialState.currentPhase);
    
    // 创建状态副本返回给调用者
    const stateCopy = this.createStateCopy(initialState);
    
    // 同时通过回调通知
    this.notifyStateChange();
    console.log('[LevelGameStateManager] startLevel: notifyStateChange called');
    
    return stateCopy;
  }

  private createInitialState(level: LevelDefinition): LevelGameState {
    const initialSetup = level.initialSetup;
    const resourceRecovery = getXiaobaiResourceRecovery();
    const actionPoints = getXiaobaiActionPoints();

    // 根据关卡配置玩家属性
    const playerHandSize = level.playerConfig?.handSize || 3;
    const playerActionPoints = level.playerConfig?.actionPoints || actionPoints;
    
    const playerState: LevelPlayerState = {
      characterId: 'XIAOBAI',
      resources: {
        computing: 2,
        funds: 2,
        information: 2,
        permission: 0
      },
      resourceRecovery,
      actionPoints: playerActionPoints,
      maxActionPoints: playerActionPoints,
      hand: this.drawInitialHand(playerHandSize),
      deck: this.createDeck(level.id), // 传入关卡ID以加载关卡专属卡牌
      discardPile: [],
      defenseCardsUsed: 0,
      securityLevel: initialSetup.securityLevel,
      maxSecurityLevel: 100
    };

    // 根据关卡配置大东AI属性
    const dadongActionPoints = level.dadongConfig?.actionPoints || DADONG_AI.level1Config?.actionPoints || 3;
    const dadongHandSize = level.dadongConfig?.handSize || DADONG_AI.level1Config?.handSize || 2;
    
    const dadongState: DadongAIState = {
      isActive: true,
      hand: this.drawInitialHand(dadongHandSize),
      deck: this.createDeck(level.id),
      cooperationBonus: DADONG_AI.behavior.cooperationBonus,
      resources: {
        computing: 10,
        funds: 10,
        information: 10
      },
      actionPoints: dadongActionPoints,
      maxActionPoints: dadongActionPoints
    };

    const enemyState: EnemyState = {
      name: level.enemyConfig.name,
      type: level.enemyConfig.type,
      infiltrationLevel: 0,
      resources: {
        computing: 3 + level.enemyConfig.resourceBonus,
        funds: 3 + level.enemyConfig.resourceBonus,
        information: 2 + level.enemyConfig.resourceBonus
      },
      hand: this.drawEnemyInitialHand(2),
      deck: this.createEnemyDeck(level.id),
      discardPile: [],
      attackCooldown: 0,
      specialAbilityActive: false,
      // 初始化技能冷却追踪
      skillCooldowns: {},
      // 初始化每个区域的标记累计数
      markerCountByArea: {
        internal: 0,
        industrial: 0,
        dmz: 0,
        external: 0
      },
      // 初始化感染区域列表
      infectedAreas: [],
      // 初始化活跃敌人ID列表（从关卡配置获取）
      activeEnemyIds: level.enemyIds || []
    };

    // 从关卡配置的区域分布中读取初始敌方标记数
    const getInitialEnemyMarkers = (areaType: AreaType): number => {
      if (level.areaDistribution && level.areaDistribution[areaType]) {
        return level.areaDistribution[areaType].enemyMarkers;
      }
      return 0;
    };

    const areaControl: AreaControlState = {
      internal: {
        controller: initialSetup.controlledAreas.includes('internal') ? 'player' : 'neutral',
        defenseMarkers: initialSetup.areaMarkers.internal,
        attackMarkers: getInitialEnemyMarkers('internal'),
        specialEffects: []
      },
      industrial: {
        controller: initialSetup.controlledAreas.includes('industrial') ? 'player' : 'neutral',
        defenseMarkers: initialSetup.areaMarkers.industrial,
        attackMarkers: getInitialEnemyMarkers('industrial'),
        specialEffects: []
      },
      dmz: {
        controller: 'neutral',
        defenseMarkers: initialSetup.areaMarkers.dmz,
        attackMarkers: getInitialEnemyMarkers('dmz'),
        specialEffects: []
      },
      external: {
        controller: 'neutral',
        defenseMarkers: initialSetup.areaMarkers.external,
        attackMarkers: getInitialEnemyMarkers('external'),
        specialEffects: []
      }
    };

    const unlockedCards = [...INITIAL_UNLOCKED_CARDS];

    const teamSharedLevels: LevelTeamSharedLevels = {
      player: { infiltrationLevel: 0, safetyLevel: initialSetup.securityLevel },
      enemy: { infiltrationLevel: 0, safetyLevel: 0 }
    };

    return {
      currentLevel: level,
      progress: this.progressStorage[level.id],
      objectives: level.objectives.map(obj => ({ ...obj, current: 0, completed: false })),
      currentTurn: 1,
      currentPhase: 'judgment',
      currentActor: 'player',
      playerState,
      dadongAIState: dadongState,
      enemyState,
      areaControl,
      unlockedCards,
      isTutorialMode: level.difficulty <= 2,
      tutorialStep: level.difficulty <= 2 ? 0 : undefined,
      phaseLogs: [],
      round: 1,
      pendingJudgments: [],
      responseEvents: [],
      teamSharedLevels,
      // 回合阶段追踪
      dadongPhase: undefined,
      enemyPhase: undefined,
      isDadongTurn: false,
      isEnemyTurn: false,
      // AI操作日志
      aiOperationLogs: [],
      // 持续效果追踪
      activeEffects: []
    };
  }

  private drawInitialHand(size: number = 3): Card[] {
    const hand: Card[] = [];
    const t1Cards = [...DEFENDER_T1_CARDS];
    for (let i = 0; i < size; i++) {
      const randomIndex = Math.floor(Math.random() * t1Cards.length);
      hand.push(t1Cards[randomIndex]);
    }
    return hand;
  }

  private drawEnemyInitialHand(size: number = 2): Card[] {
    const hand: Card[] = [];
    const attackerCards = [...ATTACKER_T1_CARDS];
    for (let i = 0; i < size; i++) {
      const randomIndex = Math.floor(Math.random() * attackerCards.length);
      hand.push(attackerCards[randomIndex]);
    }
    return hand;
  }

  private createDeck(levelId?: LevelId): Card[] {
    // 基础卡牌
    const deck: Card[] = [...DEFENDER_T1_CARDS, ...DEFENDER_T1_CARDS];
    
    // 添加判定卡牌到卡池（每种卡牌加入2张）
    JUDGMENT_CARDS.forEach(card => {
      deck.push(card);
      deck.push(card);
    });
    console.log('[LevelGameStateManager] 判定卡牌已加入卡池:', JUDGMENT_CARDS.map(c => c.name));
    
    // 如果指定了关卡，添加关卡专属卡牌到卡池
    if (levelId) {
      const levelCards = this.getLevelCards(levelId);
      if (levelCards.length > 0) {
        // 将关卡卡牌加入卡池（每种卡牌加入2张）
        levelCards.forEach(card => {
          deck.push(card);
          deck.push(card); // 每种关卡卡牌2张
        });
        console.log(`[LevelGameStateManager] 关卡 ${levelId} 专属卡牌已加入卡池:`, levelCards.map(c => c.name));
      }
    }
    
    return this.shuffleDeck(deck);
  }

  private createEnemyDeck(levelId?: LevelId): Card[] {
    // 敌人牌库基础是进攻方卡牌
    const deck: Card[] = [...ATTACKER_T1_CARDS, ...ATTACKER_T1_CARDS];
    
    // 根据关卡添加敌人专属卡牌
    if (levelId === 'LV001') {
      // 第一关敌人的牌库可以包含一些额外的病毒主题卡牌
      console.log('[LevelGameStateManager] 第一关敌人牌库创建完成');
    }
    
    return this.shuffleDeck(deck);
  }

  private shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * 获取关卡专属卡牌
   * 根据关卡ID返回对应的关卡卡牌
   */
  private getLevelCards(levelId: LevelId): Card[] {
    switch (levelId) {
      case 'LV001':
        return LEVEL1_CARDS;
      case 'LV002':
        return LEVEL2_CARDS;
      case 'LV003':
        return LEVEL3_CARDS;
      case 'LV004':
        return LEVEL4_CARDS;
      case 'LV005':
        return LEVEL5_CARDS;
      case 'LV006':
        return LEVEL6_CARDS;
      case 'LV007':
        return LEVEL7_CARDS;
      case 'LV008':
        return LEVEL8_CARDS;
      case 'LV009':
        return LEVEL9_CARDS;
      default:
        return [];
    }
  }

  getState(): LevelGameState | null {
    return this.state;
  }

  getCurrentPhase(): LevelTurnPhase | null {
    return this.state?.currentPhase ?? null;
  }

  getPhaseName(phase: LevelTurnPhase): string {
    return LEVEL_PHASE_NAMES[phase];
  }

  getNextPhase(currentPhase: LevelTurnPhase): LevelTurnPhase | null {
    const currentIndex = LEVEL_TURN_PHASES.indexOf(currentPhase);
    if (currentIndex === -1 || currentIndex >= LEVEL_TURN_PHASES.length - 1) {
      return null;
    }
    return LEVEL_TURN_PHASES[currentIndex + 1];
  }

  async advancePhase(): Promise<LevelPhaseResult> {
    console.log('[LevelGameStateManager] advancePhase called, current phase:', this.state?.currentPhase);
    console.log('[LevelGameStateManager] current pending judgments:', this.state?.pendingJudgments?.length);
    if (this.state && this.state.pendingJudgments && this.state.pendingJudgments.length > 0) {
      console.log('[LevelGameStateManager] pending judgments:', this.state.pendingJudgments.map(j => ({ id: j.id, cardName: j.cardName, isImmediate: j.isImmediate, resolved: j.resolved })));
    }
    
    if (!this.state) {
      return { success: false, logs: ['错误：无游戏状态'], canProceed: false };
    }

    const nextPhase = this.getNextPhase(this.state.currentPhase);
    console.log('[LevelGameStateManager] nextPhase:', nextPhase);
    
    if (!nextPhase) {
      // 没有下一个阶段，执行endTurn（包含大东和敌人的回合）
      return await this.endTurn();
    }

    this.state.currentPhase = nextPhase;
    const result = this.executePhase(nextPhase);
    
    console.log('[LevelGameStateManager] calling notifyStateChange, new phase:', this.state.currentPhase);
    this.notifyStateChange();
    return result;
  }

  executePhase(phase: LevelTurnPhase): LevelPhaseResult {
    if (!this.state) {
      return { success: false, logs: ['错误：无游戏状态'], canProceed: false };
    }

    const logs: string[] = [`【${LEVEL_PHASE_NAMES[phase]}】`];
    let result: LevelPhaseResult;

    switch (phase) {
      case 'judgment':
        result = this.executeJudgmentPhase();
        break;
      case 'recovery':
        result = this.executeRecoveryPhase();
        break;
      case 'draw':
        result = this.executeDrawPhase();
        break;
      case 'action':
        result = this.executeActionPhase();
        break;
      case 'response':
        result = this.executeResponsePhase();
        break;
      case 'discard':
        result = this.executeDiscardPhase();
        break;
      case 'end':
        result = this.executeEndPhase();
        break;
      default:
        result = { success: false, logs: [`错误：未知阶段 ${phase}`], canProceed: false };
    }

    result.logs = [...logs, ...result.logs];
    this.state.phaseLogs = [...this.state.phaseLogs, ...result.logs];
    
    return result;
  }

  private executeJudgmentPhase(): LevelPhaseResult {
    if (!this.state) {
      console.log('[LevelGameStateManager] executeJudgmentPhase: 无游戏状态');
      return { success: false, logs: ['错误：无游戏状态'], canProceed: false };
    }

    console.log('[LevelGameStateManager] executeJudgmentPhase: 开始执行判定阶段');
    console.log('[LevelGameStateManager] 当前待处理判定总数:', this.state.pendingJudgments.length);
    console.log('[LevelGameStateManager] 待处理判定详情:', this.state.pendingJudgments.map(j => ({
      id: j.id,
      cardName: j.cardName,
      resolved: j.resolved,
      isImmediate: j.isImmediate
    })));

    const logs: string[] = [];
    
    logs.push('⚖️ ====== 判定阶段开始 ======');
    logs.push(`📊 当前待处理判定总数: ${this.state.pendingJudgments.length}`);
    
    const delayedJudgments = this.state.pendingJudgments.filter(j => !j.resolved && !j.isImmediate);
    
    logs.push('⚖️ 检查待处理延时判定...');
    logs.push(`📋 发现 ${delayedJudgments.length} 个未完成的延时判定`);
    
    if (delayedJudgments.length > 0) {
      logs.push(`⚖️ 有 ${delayedJudgments.length} 个待处理延时判定需要结算`);
      logs.push('📋 延时判定列表:');
      delayedJudgments.forEach((j, index) => {
        logs.push(`  ${index + 1}. 【${j.cardName}】- ${j.description || '无描述'}`);
      });
      
      console.log('[LevelGameStateManager] 有待处理延时判定，返回 canProceed: false');
      
      // 触发第一个待处理判定的用户交互
      const firstJudgment = delayedJudgments[0];
      console.log('[LevelGameStateManager] 触发第一个判定:', firstJudgment.cardName);
      this.triggerJudgmentUI(firstJudgment, 'judgment');
      
      return { 
        success: true, 
        logs, 
        canProceed: false, 
        phaseData: { 
          hasPendingJudgments: true, 
          judgment: firstJudgment 
        } 
      };
    } else {
      logs.push('✓ 没有待处理的延时判定');
    }

    logs.push('📋 结算持续效果...');
    logs.push('✓ 持续效果已更新');
    logs.push('⚖️ ====== 判定阶段结束 ======');
    
    console.log('[LevelGameStateManager] 没有待处理延时判定，返回 canProceed: true');

    return { success: true, logs, canProceed: true };
  }

  resolveJudgment(judgmentId: string, success: boolean): boolean {
    if (!this.state) return false;

    const judgment = this.state.pendingJudgments.find(j => j.id === judgmentId);
    if (!judgment || judgment.resolved) return false;

    const effects = success ? judgment.effects.success : judgment.effects.failure;
    
    if (effects.infiltrationChange) {
      this.state.teamSharedLevels.player.infiltrationLevel = Math.max(0, Math.min(100,
        this.state.teamSharedLevels.player.infiltrationLevel + effects.infiltrationChange
      ));
    }
    if (effects.safetyChange) {
      this.state.teamSharedLevels.player.safetyLevel = Math.max(0, Math.min(100,
        this.state.teamSharedLevels.player.safetyLevel + effects.safetyChange
      ));
      this.state.playerState.securityLevel = this.state.teamSharedLevels.player.safetyLevel;
    }

    judgment.resolved = true;
    this.state.phaseLogs.push(`⚖️ 判定【${judgment.description}】: ${success ? '✅ 成功' : '❌ 失败'}`);
    
    this.notifyStateChange();
    return true;
  }

  private executeRecoveryPhase(): LevelPhaseResult {
    if (!this.state) {
      return { success: false, logs: ['错误：无游戏状态'], canProceed: false };
    }

    const logs: string[] = [];
    const recovery = this.state.playerState.resourceRecovery;

    const oldComputing = this.state.playerState.resources.computing;
    const oldFunds = this.state.playerState.resources.funds;
    const oldInformation = this.state.playerState.resources.information;

    this.state.playerState.resources.computing = Math.min(
      15,
      this.state.playerState.resources.computing + recovery.computing
    );
    this.state.playerState.resources.funds = Math.min(
      15,
      this.state.playerState.resources.funds + recovery.funds
    );
    this.state.playerState.resources.information = Math.min(
      12,
      this.state.playerState.resources.information + recovery.information
    );

    const restoredResources: string[] = [];
    if (this.state.playerState.resources.computing > oldComputing) {
      restoredResources.push(`算力+${recovery.computing}`);
    }
    if (this.state.playerState.resources.funds > oldFunds) {
      restoredResources.push(`资金+${recovery.funds}`);
    }
    if (this.state.playerState.resources.information > oldInformation) {
      restoredResources.push(`信息+${recovery.information}`);
    }

    if (restoredResources.length > 0) {
      logs.push(`💫 资源恢复: ${restoredResources.join(', ')}`);
    } else {
      logs.push('✓ 资源已达上限');
    }

    const controlledAreas = Object.values(this.state.areaControl)
      .filter(area => area.controller === 'player').length;
    if (controlledAreas > 0) {
      logs.push(`🏰 区域控制加成: 控制${controlledAreas}个区域`);
    }

    return { success: true, logs, canProceed: true };
  }

  private executeDrawPhase(): LevelPhaseResult {
    if (!this.state) {
      return { success: false, logs: ['错误：无游戏状态'], canProceed: false };
    }

    const logs: string[] = [];
    const drawCount = getLevelDrawCount(this.state.round);

    logs.push(`🎴 抽牌阶段: 抽取 ${drawCount} 张卡牌`);

    const drawnCards: string[] = [];
    for (let i = 0; i < drawCount; i++) {
      if (this.state.playerState.deck.length === 0) {
        if (this.state.playerState.discardPile.length === 0) {
          logs.push('⚠️ 牌库和弃牌堆都已空');
          break;
        }
        this.state.playerState.deck = this.shuffleDeck([...this.state.playerState.discardPile]);
        this.state.playerState.discardPile = [];
        logs.push('🔄 弃牌堆洗入牌库');
      }

      if (this.state.playerState.deck.length > 0) {
        const card = this.state.playerState.deck.pop()!;
        this.state.playerState.hand.push(card);
        drawnCards.push(card.name);
      }
    }

    if (drawnCards.length > 0) {
      logs.push(`✅ 抽到卡牌: ${drawnCards.join(', ')}`);
    }

    return { success: true, logs, canProceed: true, phaseData: { drawnCards } };
  }

  private executeActionPhase(): LevelPhaseResult {
    if (!this.state) {
      return { success: false, logs: ['错误：无游戏状态'], canProceed: false };
    }

    const logs: string[] = [];

    this.state.playerState.actionPoints = this.state.playerState.maxActionPoints;
    logs.push(`⚡ 行动阶段: 获得 ${this.state.playerState.actionPoints} 点行动点`);
    logs.push('🎯 可以打出卡牌或使用技能');

    return { success: true, logs, canProceed: true };
  }

  private executeResponsePhase(): LevelPhaseResult {
    if (!this.state) {
      console.log('[LevelGameStateManager] executeResponsePhase: 无游戏状态');
      return { success: false, logs: ['错误：无游戏状态'], canProceed: false };
    }

    console.log('[LevelGameStateManager] executeResponsePhase: 开始执行响应阶段');
    console.log('[LevelGameStateManager] 当前待处理判定总数:', this.state.pendingJudgments.length);
    console.log('[LevelGameStateManager] 待处理判定详情:', this.state.pendingJudgments.map(j => ({
      id: j.id,
      cardName: j.cardName,
      resolved: j.resolved,
      isImmediate: j.isImmediate
    })));

    const logs: string[] = [];
    
    logs.push('⏱️ ====== 响应阶段开始 ======');
    logs.push(`📊 当前待处理判定总数: ${this.state.pendingJudgments.length}`);
    
    const immediateJudgments = this.state.pendingJudgments.filter(j => !j.resolved && j.isImmediate === true);
    
    logs.push('🎯 检查待处理即时判定...');
    logs.push(`📋 发现 ${immediateJudgments.length} 个未完成的即时判定`);
    
    if (immediateJudgments.length > 0) {
      logs.push(`🎯 有 ${immediateJudgments.length} 个即时判定需要执行`);
      logs.push('📋 即时判定列表:');
      immediateJudgments.forEach((j, index) => {
        logs.push(`  ${index + 1}. 【${j.cardName}】- ${j.description || '无描述'}`);
      });
      
      console.log('[LevelGameStateManager] 有待处理即时判定，返回 canProceed: false');
      
      // 触发第一个待处理判定的用户交互
      const firstJudgment = immediateJudgments[0];
      console.log('[LevelGameStateManager] 触发第一个判定:', firstJudgment.cardName);
      this.triggerJudgmentUI(firstJudgment, 'response');
      
      return { 
        success: true, 
        logs, 
        canProceed: false, 
        phaseData: { 
          hasPendingJudgments: true, 
          judgment: firstJudgment 
        } 
      };
    }
    
    const unresolvedEvents = this.state.responseEvents.filter(e => !e.responded);

    logs.push('⏱️ 检查是否有需要响应的事件');
    
    if (unresolvedEvents.length > 0) {
      logs.push(`⏱️ 有 ${unresolvedEvents.length} 个事件需要响应`);
      return { 
        success: true, 
        logs, 
        canProceed: false,
        phaseData: { 
          hasResponseEvents: true, 
          eventCount: unresolvedEvents.length,
          responseEvents: unresolvedEvents
        } 
      };
    } else {
      logs.push('✓ 没有需要响应的事件');
    }

    return { success: true, logs, canProceed: true };
  }

  resolveResponseEvent(eventId: string, response: 'accept' | 'reject'): boolean {
    if (!this.state) return false;

    const event = this.state.responseEvents.find(e => e.id === eventId);
    if (!event || event.responded) return false;

    event.responded = true;
    this.state.phaseLogs.push(`⏱️ 响应事件【${event.description}】: ${response === 'accept' ? '✅ 接受' : '❌ 拒绝'}`);
    
    this.notifyStateChange();
    return true;
  }

  addPendingJudgment(judgment: LevelPendingJudgment): void {
    if (!this.state) return;
    this.state.pendingJudgments.push(judgment);
    this.notifyStateChange();
  }

  addResponseEvent(event: LevelResponseEvent): void {
    if (!this.state) return;
    this.state.responseEvents.push(event);
    this.notifyStateChange();
  }

  executeDiscardPhase(): LevelPhaseResult {
    if (!this.state) {
      return { success: false, logs: ['错误：无游戏状态'], canProceed: false };
    }

    const logs: string[] = [];
    const handLimit = getLevelHandLimit(this.state.round);
    const currentHandSize = this.state.playerState.hand.length;

    logs.push(`📋 手牌上限: ${handLimit}张 (轮次 ${this.state.round})`);
    logs.push(`🎴 当前手牌: ${currentHandSize}张`);

    if (currentHandSize <= handLimit) {
      logs.push(`✅ 手牌数量符合要求（${currentHandSize}/${handLimit}），自动进入结束阶段`);
      // 手牌数量符合要求，可以自动推进到结束阶段
      return { success: true, logs, canProceed: true };
    }

    const discardCount = currentHandSize - handLimit;
    logs.push(`⚠️ 需要弃置 ${discardCount} 张卡牌`);
    logs.push('💡 请选择要弃置的卡牌，或点击"结束弃牌"自动弃置');

    return { 
      success: true, 
      logs, 
      canProceed: false,
      phaseData: { 
        requiresDiscard: true, 
        discardCount,
        handLimit 
      } 
    };
  }

  discardCard(cardIndex: number): boolean {
    if (!this.state) return false;

    const handLimit = getLevelHandLimit(this.state.round);
    if (this.state.playerState.hand.length <= handLimit) return false;

    if (cardIndex < 0 || cardIndex >= this.state.playerState.hand.length) return false;

    const card = this.state.playerState.hand.splice(cardIndex, 1)[0];
    this.state.playerState.discardPile.push(card);

    this.state.phaseLogs.push(`🗑️ 弃置卡牌: ${card.name}`);

    if (this.state.playerState.hand.length <= handLimit) {
      this.state.phaseLogs.push(`✅ 弃牌完成，保留 ${this.state.playerState.hand.length} 张手牌`);
    }

    this.notifyStateChange();
    return true;
  }

  endDiscardPhase(): LevelPhaseResult {
    if (!this.state) {
      return { success: false, logs: ['错误：无游戏状态'], canProceed: false };
    }

    const logs: string[] = [];
    const handLimit = getLevelHandLimit(this.state.round);
    const currentHandSize = this.state.playerState.hand.length;

    if (currentHandSize > handLimit) {
      const discardCount = currentHandSize - handLimit;
      for (let i = 0; i < discardCount; i++) {
        if (this.state.playerState.hand.length > 0) {
          const card = this.state.playerState.hand.pop()!;
          this.state.playerState.discardPile.push(card);
          logs.push(`🗑️ 自动弃置: ${card.name}`);
        }
      }
    }

    logs.push(`✅ 弃牌阶段结束，保留 ${this.state.playerState.hand.length} 张手牌`);

    return { success: true, logs, canProceed: true };
  }

  private executeEndPhase(): LevelPhaseResult {
    if (!this.state) {
      return { success: false, logs: ['错误：无游戏状态'], canProceed: false };
    }

    const logs: string[] = [];

    logs.push('🏁 结束阶段: 清除临时效果');
    this.state.playerState.actionPoints = 0;

    // 减少持续效果的剩余回合数
    logs.push('⏳ 更新持续效果...');
    this.decrementEffectTurns();
    
    // 显示当前活跃效果
    const activeEffects = this.getActiveEffects();
    if (activeEffects.length > 0) {
      logs.push(`📋 当前活跃效果: ${activeEffects.length} 个`);
      activeEffects.forEach(effect => {
        logs.push(`  - ${effect.description} (剩余 ${effect.remainingTurns} 回合)`);
      });
    } else {
      logs.push('📋 当前无活跃效果');
    }

    logs.push('✓ 回合结束');

    return { success: true, logs, canProceed: true };
  }

  // 存储需要区域选择的卡牌信息
  private pendingAreaSelectionCard: { cardIndex: number; card: Card } | null = null;

  /**
   * 检查卡牌是否需要区域选择
   */
  private cardNeedsAreaSelection(card: Card): boolean {
    const effect = card.effects?.[0];
    if (!effect) return false;
    
    // 需要区域选择的卡牌效果类型
    const areaEffectTypes = [
      'area_defense',
      'infiltration_reduce',
      'trap_set',
      'skill_immunity',
      'defense_marker',
      'dice_check'
    ];
    
    return areaEffectTypes.includes(effect.type);
  }

  /**
   * 获取卡牌区域选择提示信息
   */
  getCardAreaSelectionInfo(card: Card): { title: string; description: string } | null {
    if (!this.cardNeedsAreaSelection(card)) return null;
    
    const effect = card.effects?.[0];
    if (!effect) return null;
    
    switch (effect.type) {
      case 'area_defense':
        return {
          title: '选择目标区域',
          description: '请选择一个区域放置防御标记'
        };
      case 'infiltration_reduce':
        return {
          title: '选择目标区域',
          description: '请选择一个区域移除敌方标记'
        };
      case 'trap_set':
        return {
          title: '选择陷阱位置',
          description: '请选择一个区域设置陷阱'
        };
      case 'skill_immunity':
        return {
          title: '选择保护区域',
          description: '请选择一个区域获得技能免疫'
        };
      case 'dice_check':
        const isImmediate = this.isImmediateJudgmentCard(card);
        return {
          title: '选择目标区域',
          description: isImmediate 
            ? `请选择一个区域执行【${card.name}】的即时判定效果`
            : `请选择一个区域，【${card.name}】将在下回合判定阶段执行延时判定效果`
        };
      default:
        return {
          title: '选择目标区域',
          description: '请选择一个区域执行卡牌效果'
        };
    }
  }

  playCard(cardIndex: number): boolean | 'needs_area_selection' | 'needs_advance_to_response' {
    if (!this.state) return false;

    if (this.state.currentPhase !== 'action') {
      return false;
    }

    const card = this.state.playerState.hand[cardIndex];
    if (!card) return false;

    if (this.state.playerState.actionPoints <= 0) return false;

    // 检查是否需要区域选择
    if (this.cardNeedsAreaSelection(card)) {
      this.pendingAreaSelectionCard = { cardIndex, card };
      return 'needs_area_selection';
    }

    // 不需要区域选择，直接执行
    return this.executePlayCard(cardIndex, card);
  }

  /**
   * 执行区域选择后的卡牌效果
   */
  playCardWithAreaSelection(area: AreaType): boolean | 'needs_advance_to_response' {
    if (!this.state || !this.pendingAreaSelectionCard) return false;
    
    const { cardIndex, card } = this.pendingAreaSelectionCard;
    
    // 执行卡牌效果，传入选择的区域
    const result = this.executePlayCard(cardIndex, card, area);
    
    if (result) {
      this.pendingAreaSelectionCard = null;
    }
    
    return result;
  }

  /**
   * 取消区域选择
   */
  cancelAreaSelection(): void {
    this.pendingAreaSelectionCard = null;
  }

  /**
   * 获取当前待区域选择的卡牌
   */
  getPendingAreaSelectionCard(): Card | null {
    return this.pendingAreaSelectionCard?.card || null;
  }

  private executePlayCard(cardIndex: number, card: Card, selectedArea?: AreaType): boolean | 'needs_advance_to_response' {
    if (!this.state) return false;

    const cost = card.cost || {};
    
    console.log('[LevelGameStateManager] executePlayCard - 卡牌:', card.name, '资源消耗:', cost);
    console.log('[LevelGameStateManager] executePlayCard - 当前资源:', this.state.playerState.resources);
    
    if (cost.compute && this.state.playerState.resources.computing < cost.compute) {
      this.state.phaseLogs.push(`❌ 算力不足，需要 ${cost.compute} 点`);
      return false;
    }
    if (cost.funds && this.state.playerState.resources.funds < cost.funds) {
      this.state.phaseLogs.push(`❌ 资金不足，需要 ${cost.funds} 点`);
      return false;
    }
    if (cost.information && this.state.playerState.resources.information < cost.information) {
      this.state.phaseLogs.push(`❌ 信息不足，需要 ${cost.information} 点`);
      return false;
    }

    if (cost.compute) {
      this.state.playerState.resources.computing -= cost.compute;
      this.state.phaseLogs.push(`💻 消耗算力: ${cost.compute}`);
    }
    if (cost.funds) {
      this.state.playerState.resources.funds -= cost.funds;
      this.state.phaseLogs.push(`💰 消耗资金: ${cost.funds}`);
    }
    if (cost.information) {
      this.state.playerState.resources.information -= cost.information;
      this.state.phaseLogs.push(`📊 消耗信息: ${cost.information}`);
    }
    
    console.log('[LevelGameStateManager] executePlayCard - 消耗后资源:', this.state.playerState.resources);

    // 从手牌移除
    this.state.playerState.hand.splice(cardIndex, 1);
    this.state.playerState.discardPile.push(card);
    this.state.playerState.actionPoints -= 1;

    // 检查是否是防御卡牌
    const isDefenseCard = card.faction === 'defense' || 
                          card.type?.includes('defense') || 
                          card.type === 'basic_defense' ||
                          card.type === 'intrusion_detection' ||
                          card.type === 'active_defense' ||
                          card.type === 'defense_in_depth' ||
                          card.type?.includes('防御');
    
    if (isDefenseCard) {
      this.state.playerState.defenseCardsUsed += 1;
      this.state.phaseLogs.push(`🛡️ 使用防御卡牌: ${card.name} (${this.state.playerState.defenseCardsUsed}/${this.state.objectives.find(obj => obj.type === 'use_defense_cards')?.target || '?'})`);
    }

    // 应用卡牌效果，传入选择的区域
    const needsResponsePhase = this.applyCardEffect(card, selectedArea);

    this.state.phaseLogs.push(`🃏 打出卡牌: ${card.name}`);
    this.notifyStateChange();
    return needsResponsePhase ? 'needs_advance_to_response' : true;
  }

  private applyCardEffect(card: Card, selectedArea?: AreaType): boolean {
    if (!this.state) return false;

    const effect = card.effects?.[0] as any;
    if (!effect) return false;

    // 使用玩家选择的区域，如果没有选择则使用卡牌默认区域或internal
    const targetArea: AreaType = selectedArea || effect.targetArea || 'internal';

    // 获取区域特性修正
    const areaTraitModifier = this.getAreaTraitModifier(targetArea, 'place_friendly');
    if (areaTraitModifier !== 0) {
      // 应用区域特性修正：安全区域返还行动点
      this.state.playerState.actionPoints = Math.min(
        this.state.playerState.maxActionPoints,
        this.state.playerState.actionPoints - areaTraitModifier
      );
      const traitDesc = this.getAreaTraitDescription(targetArea);
      this.state.phaseLogs.push(`🌟 区域特性生效：${traitDesc}`);
    }

    let needsResponsePhase = false;

    switch (effect.type) {
      case 'security_gain':
        this.state.playerState.securityLevel = Math.min(
          this.state.playerState.securityLevel + (effect.baseValue || 1),
          this.state.playerState.maxSecurityLevel
        );
        this.state.phaseLogs.push(`🛡️ 安全等级 +${effect.baseValue || 1}`);
        break;
      case 'resource_gain':
        if (effect.resourceType === 'compute') {
          this.state.playerState.resources.computing += effect.value || 1;
          this.state.phaseLogs.push(`💻 算力 +${effect.value || 1}`);
        } else if (effect.resourceType === 'information') {
          this.state.playerState.resources.information += effect.value || 1;
          this.state.phaseLogs.push(`📊 信息 +${effect.value || 1}`);
        } else if (effect.resourceType === 'funds') {
          this.state.playerState.resources.funds += effect.value || 1;
          this.state.phaseLogs.push(`💰 资金 +${effect.value || 1}`);
        }
        break;
      case 'infiltration_reduce':
        // 系统重写类卡牌：移除目标区域的所有敌方标记
        const allAttackMarkers = this.state.areaControl[targetArea].attackMarkers;
        this.state.areaControl[targetArea].attackMarkers = 0;
        
        // 如果是"系统重写"卡牌，添加弃置手牌要求
        if (card.name === '系统重写') {
          // 弃置手牌要求
          if (this.state.playerState.hand.length > 0) {
            const discardCard = this.state.playerState.hand.pop()!;
            this.state.playerState.discardPile.push(discardCard);
            this.state.phaseLogs.push(`🗑️ 弃置手牌: ${discardCard.name}`);
          }
          
          // 添加系统重写效果标记（用于胜利条件检查）
          this.addActiveEffect({
            id: `system_rewrite_${Date.now()}`,
            type: 'other',
            source: card.name,
            targetArea,
            remainingTurns: 99, // 持续到游戏结束
            description: '系统重写已执行',
            appliedAt: this.state.currentTurn
          });
          
          this.state.phaseLogs.push(`🧹 系统重写！在${this.getLevelAreaName(targetArea)}移除了${allAttackMarkers}个敌方标记`);
          this.state.phaseLogs.push(`🔄 系统重写卡牌已使用！`);
        } else {
          // 其他卡牌的常规效果
          this.state.phaseLogs.push(`🧹 在${this.getLevelAreaName(targetArea)}移除了${allAttackMarkers}个敌方标记`);
        }
        
        this.updateAreaControl();
        break;
      case 'area_defense':
        // 签名接种类卡牌：添加持续效果
        this.state.areaControl[targetArea].defenseMarkers += effect.value || 1;
        // 添加持续效果
        this.addActiveEffect({
          id: `vaccinated_${Date.now()}`,
          type: 'vaccinated',
          source: card.name,
          targetArea,
          remainingTurns: 3,
          description: '病毒免疫',
          appliedAt: this.state.currentTurn
        });
        // 添加特殊效果标记
        if (!this.state.areaControl[targetArea].specialEffects.includes('已接种')) {
          this.state.areaControl[targetArea].specialEffects.push('已接种');
        }
        this.state.phaseLogs.push(`💉 在${this.getLevelAreaName(targetArea)}完成签名接种，病毒免疫3回合`);
        this.updateAreaControl();
        break;
      case 'defense_marker':
        // 增加防御标记（通用效果）
        this.state.areaControl[targetArea].defenseMarkers += effect.value || 1;
        this.state.phaseLogs.push(`🛡️ 在${this.getLevelAreaName(targetArea)}放置了${effect.value || 1}个防御标记`);
        this.updateAreaControl();
        break;
      case 'trap_set':
        // 来路不明软盘类卡牌：设置陷阱（持续效果）
        this.addActiveEffect({
          id: `trap_${Date.now()}`,
          type: 'trap',
          source: card.name,
          targetArea,
          remainingTurns: 5, // 陷阱持续5回合
          description: '陷阱',
          appliedAt: this.state.currentTurn
        });
        if (!this.state.areaControl[targetArea].specialEffects.includes('陷阱')) {
          this.state.areaControl[targetArea].specialEffects.push('陷阱');
        }
        this.state.phaseLogs.push(`⚠️ 在${this.getLevelAreaName(targetArea)}设置了陷阱，持续5回合`);
        break;
      case 'skill_immunity':
        // 病毒库更新类卡牌：技能免疫（持续效果）
        this.addActiveEffect({
          id: `skill_immunity_${Date.now()}`,
          type: 'skill_immunity',
          source: card.name,
          targetArea,
          remainingTurns: 3, // 技能免疫持续3回合
          description: '技能免疫',
          appliedAt: this.state.currentTurn
        });
        if (!this.state.areaControl[targetArea].specialEffects.includes('技能免疫')) {
          this.state.areaControl[targetArea].specialEffects.push('技能免疫');
        }
        // 恢复行动点
        const actionPointRecovery = effect.baseValue || 1;
        this.state.playerState.actionPoints = Math.min(
          this.state.playerState.maxActionPoints,
          this.state.playerState.actionPoints + actionPointRecovery
        );
        this.state.phaseLogs.push(`🛡️ ${this.getLevelAreaName(targetArea)}获得技能免疫3回合，恢复${actionPointRecovery}行动点`);
        break;
      case 'dice_check':
        const isImmediateJudgment = this.isImmediateJudgmentCard(card);
        if (isImmediateJudgment) {
          this.state.phaseLogs.push(`🎲 使用判定卡牌: ${card.name} - 将在响应阶段执行`);
          this.createPendingJudgment(card, effect, selectedArea, true);
          needsResponsePhase = true;
        } else {
          this.state.phaseLogs.push(`🎲 使用延时判定卡牌: ${card.name} - 将在判定阶段执行`);
          this.createPendingJudgment(card, effect, selectedArea, false);
        }
        break;
    }

    this.updateObjectives();
    return needsResponsePhase;
  }

  private isImmediateJudgmentCard(card: Card): boolean {
    const effect = card.effects?.[0] as any;
    if (effect && 'isDelayed' in effect) {
      const isDelayed = effect.isDelayed;
      return !isDelayed;
    }
    const cardCode = card.card_code || '';
    if (cardCode.startsWith('LI')) {
      return true;
    }
    if (cardCode.startsWith('LA')) {
      return false;
    }
    return true;
  }

  /**
   * 触发判定UI界面
   */
  private triggerJudgmentUI(judgment: any, phase: 'judgment' | 'response'): void {
    console.log(`[LevelGameStateManager] 触发判定UI: ${judgment.cardName}, 阶段: ${phase}`);
    
    // 通过事件总线触发判定界面
    JudgmentEventBus.emitJudgmentStart({
      id: judgment.id,
      type: 'dice',
      phase: phase,
      title: judgment.cardName || '判定',
      description: judgment.description || '进行判定',
      initiatorId: judgment.sourcePlayerId || 'player',
      initiatorName: '玩家',
      targetId: 'enemy',
      targetName: '敌方',
      difficulty: judgment.difficulty || 3,
      onSuccess: (judgment.onSuccess as any) || { description: '成功' },
      onFailure: (judgment.onFailure as any) || { description: '失败' },
      onCriticalSuccess: (judgment.onCriticalSuccess as any),
      onCriticalFailure: (judgment.onCriticalFailure as any),
      cardName: judgment.cardName,
    });
  }

  /**
   * 处理判定完成结果
   */
  resolveJudgmentWithResult(judgmentId: string, resultData: any): boolean {
    if (!this.state) return false;

    const judgment = this.state.pendingJudgments.find(j => j.id === judgmentId);
    if (!judgment || judgment.resolved) return false;

    console.log('[LevelGameStateManager] resolveJudgmentWithResult:', judgmentId, resultData);
    
    // 标记为已解决
    judgment.resolved = true;
    
    // 记录日志
    this.state.phaseLogs.push(`🎲 判定【${judgment.cardName}】: ${resultData.detail || '完成'}`);
    
    // 获取目标区域
    const targetArea = (judgment as any).targetArea || 'internal';
    
    // 确定使用哪个效果（成功/失败/大成功/大失败）
    let effectToApply: any;
    if (resultData.isCriticalSuccess && (judgment as any).onCriticalSuccess) {
      effectToApply = (judgment as any).onCriticalSuccess;
      this.state.phaseLogs.push(`🎲 大成功！应用大成功效果`);
    } else if (resultData.isCriticalFailure && (judgment as any).onCriticalFailure) {
      effectToApply = (judgment as any).onCriticalFailure;
      this.state.phaseLogs.push(`🎲 大失败！应用大失败效果`);
    } else if (resultData.success) {
      effectToApply = (judgment as any).onSuccess;
      this.state.phaseLogs.push(`🎲 判定成功！应用成功效果`);
    } else {
      effectToApply = (judgment as any).onFailure;
      this.state.phaseLogs.push(`🎲 判定失败！应用失败效果`);
    }
    
    // 应用效果
    if (effectToApply) {
      this.applyDiceCheckEffectResult(effectToApply, targetArea);
    }
    
    // 通知状态变化
    this.notifyStateChange();
    
    // 检查是否还有未处理的判定
    const currentPhase = this.state.currentPhase;
    const hasMoreJudgments = this.checkAndContinuePhase(currentPhase);
    
    if (!hasMoreJudgments) {
      // 没有更多判定，进入下一阶段
      setTimeout(() => {
        this.advancePhase();
      }, 500);
    }
    
    return true;
  }

  /**
   * 检查当前阶段是否还有未处理的内容并继续执行
   * 返回 true 表示还有内容需要处理，false 表示可以进入下一阶段
   */
  private checkAndContinuePhase(currentPhase: LevelTurnPhase): boolean {
    if (!this.state) return false;

    console.log('[LevelGameStateManager] checkAndContinuePhase:', currentPhase);

    if (currentPhase === 'judgment') {
      // 检查是否还有未处理的延时判定
      const pendingDelayedJudgments = this.state.pendingJudgments.filter(
        j => !j.resolved && !j.isImmediate
      );
      
      console.log('[LevelGameStateManager] 剩余延时判定:', pendingDelayedJudgments.length);
      
      if (pendingDelayedJudgments.length > 0) {
        // 继续触发下一个判定
        const nextJudgment = pendingDelayedJudgments[0];
        this.triggerJudgmentUI(nextJudgment, 'judgment');
        return true;
      }
    } else if (currentPhase === 'response') {
      // 首先检查是否还有未处理的即时判定
      const pendingImmediateJudgments = this.state.pendingJudgments.filter(
        j => !j.resolved && j.isImmediate === true
      );
      
      console.log('[LevelGameStateManager] 剩余即时判定:', pendingImmediateJudgments.length);
      
      if (pendingImmediateJudgments.length > 0) {
        // 继续触发下一个判定
        const nextJudgment = pendingImmediateJudgments[0];
        this.triggerJudgmentUI(nextJudgment, 'response');
        return true;
      }
      
      // 检查是否还有未处理的响应事件
      const pendingResponseEvents = this.state.responseEvents.filter(e => !e.responded);
      
      console.log('[LevelGameStateManager] 剩余响应事件:', pendingResponseEvents.length);
      
      if (pendingResponseEvents.length > 0) {
        // 这里可以继续处理响应事件，暂时返回false让流程继续
        return false;
      }
    }
    
    return false;
  }



  private createPendingJudgment(card: Card, effect: any, selectedArea?: AreaType, isImmediate?: boolean): void {
    if (!this.state) return;

    const isImmediateJudgment = isImmediate ?? this.isImmediateJudgmentCard(card);
    const judgmentType = isImmediateJudgment ? 'immediate' : 'delayed';
    const judgmentId = `${judgmentType}_judgment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const pendingJudgment: any = {
      id: judgmentId,
      type: 'dice' as const,
      targetPlayerId: 'enemy',
      cardId: card.card_code,
      cardName: card.name,
      description: effect.description as string || `${isImmediateJudgment ? '即时' : '延时'}判定: ${card.name}`,
      difficulty: (effect.difficulty as number) || 3,
      onSuccess: effect.onSuccess as Record<string, unknown>,
      onFailure: effect.onFailure as Record<string, unknown>,
      onCriticalSuccess: effect.onCriticalSuccess as Record<string, unknown>,
      onCriticalFailure: effect.onCriticalFailure as Record<string, unknown>,
      sourcePlayerId: 'player',
      targetArea: selectedArea || effect.targetArea as string || 'internal',
      resolved: false,
      timestamp: Date.now(),
      isImmediate: isImmediateJudgment,
      effects: {
        success: { description: (effect.onSuccess as any)?.description || '成功' },
        failure: { description: (effect.onFailure as any)?.description || '失败' }
      }
    };

    this.state.pendingJudgments.push(pendingJudgment);
    
    if (isImmediateJudgment) {
      this.state.phaseLogs.push(`🎯 创建即时判定: ${card.name} - 将在响应阶段执行`);
    } else {
      this.state.phaseLogs.push(`⏳ 创建延时判定: ${card.name} - 将在判定阶段执行`);
    }

    const difficulty = (effect.difficulty as number) || 3;
    console.log(`[LevelGameStateManager] 已创建${isImmediateJudgment ? '即时' : '延时'}判定: ${card.name}, 难度: ${difficulty}, 将在${isImmediateJudgment ? '响应' : '判定'}阶段执行`);
    
    this.notifyStateChange();
  }

  private applyDiceCheckEffectResult(effect: any, targetArea: string = 'internal'): void {
    if (!this.state) return;

    const effects = effect.effects as Array<any> || 
                    effect.additionalEffects as Array<any>;
    
    if (effects && Array.isArray(effects)) {
      for (const subEffect of effects) {
        this.applyDiceCheckEffectResult(subEffect, targetArea);
      }
      return;
    }

    const effectType = effect.type as string;
    const baseValue = (effect.baseValue as number) || 0;
    const value = (effect.value as number) || 0;
    const amount = baseValue || value;

    const securityChange = (effect.securityChange as number) || 
                           (effect.securityBonus as number) || 
                           (effect.securityPenalty as number);
    const infiltrationChange = (effect.infiltrationChange as number) || 
                               (effect.infiltrationBonus as number) || 
                               (effect.infiltrationPenalty as number);

    const actualTargetArea = effect.targetArea as string || targetArea;

    if (securityChange !== undefined) {
      if (securityChange > 0) {
        this.state.playerState.securityLevel = Math.min(
          this.state.playerState.maxSecurityLevel,
          this.state.playerState.securityLevel + securityChange
        );
        this.state.teamSharedLevels.player.safetyLevel = this.state.playerState.securityLevel;
        this.state.phaseLogs.push(`🛡️ 安全等级 +${securityChange}`);
      } else if (securityChange < 0) {
        this.state.playerState.securityLevel = Math.max(0,
          this.state.playerState.securityLevel + securityChange
        );
        this.state.teamSharedLevels.player.safetyLevel = this.state.playerState.securityLevel;
        this.state.phaseLogs.push(`🛡️ 安全等级 ${securityChange}`);
      }
    }

    if (infiltrationChange !== undefined) {
      if (infiltrationChange > 0) {
        this.state.teamSharedLevels.player.infiltrationLevel = Math.min(100,
          this.state.teamSharedLevels.player.infiltrationLevel + infiltrationChange
        );
        this.state.phaseLogs.push(`⬆️ 渗透等级 +${infiltrationChange}`);
      } else if (infiltrationChange < 0) {
        this.state.teamSharedLevels.player.infiltrationLevel = Math.max(0,
          this.state.teamSharedLevels.player.infiltrationLevel + infiltrationChange
        );
        this.state.phaseLogs.push(`⬇️ 渗透等级 ${infiltrationChange}`);
      }
    }

    switch (effectType) {
      case 'infiltration_gain':
        this.state.teamSharedLevels.player.infiltrationLevel = Math.min(100,
          this.state.teamSharedLevels.player.infiltrationLevel + amount
        );
        this.state.phaseLogs.push(`⬆️ 渗透等级 +${amount}`);
        break;
      case 'infiltration_reduce':
        this.state.teamSharedLevels.player.infiltrationLevel = Math.max(0,
          this.state.teamSharedLevels.player.infiltrationLevel - amount
        );
        this.state.phaseLogs.push(`⬇️ 渗透等级 -${amount}`);
        break;
      case 'security_reduce':
        this.state.playerState.securityLevel = Math.max(0,
          this.state.playerState.securityLevel - amount
        );
        this.state.teamSharedLevels.player.safetyLevel = this.state.playerState.securityLevel;
        this.state.phaseLogs.push(`🛡️ 安全等级 -${amount}`);
        break;
      case 'security_gain':
        this.state.playerState.securityLevel = Math.min(
          this.state.playerState.maxSecurityLevel,
          this.state.playerState.securityLevel + amount
        );
        this.state.teamSharedLevels.player.safetyLevel = this.state.playerState.securityLevel;
        this.state.phaseLogs.push(`🛡️ 安全等级 +${amount}`);
        break;
      case 'resource_gain':
        const resourceType = effect.resourceType as string;
        if (resourceType === 'compute') {
          this.state.playerState.resources.computing = Math.min(15,
            this.state.playerState.resources.computing + amount
          );
          this.state.phaseLogs.push(`💻 算力 +${amount}`);
        } else if (resourceType === 'information') {
          this.state.playerState.resources.information = Math.min(12,
            this.state.playerState.resources.information + amount
          );
          this.state.phaseLogs.push(`📊 信息 +${amount}`);
        } else if (resourceType === 'funds') {
          this.state.playerState.resources.funds = Math.min(20,
            this.state.playerState.resources.funds + amount
          );
          this.state.phaseLogs.push(`💰 资金 +${amount}`);
        } else if (resourceType === 'action') {
          this.state.phaseLogs.push(`⚡ 行动点效果: ${effect.description || '无描述'}`);
        }
        break;
      case 'area_defense':
        // 添加持续效果
        this.addActiveEffect({
          id: `vaccinated_${Date.now()}`,
          type: 'vaccinated',
          source: '判定效果',
          targetArea: actualTargetArea as any,
          remainingTurns: 3,
          description: '病毒免疫',
          appliedAt: this.state.currentTurn
        });
        this.state.areaControl[actualTargetArea as any].defenseMarkers += effect.value || 1;
        if (!this.state.areaControl[actualTargetArea as any].specialEffects.includes('已接种')) {
          this.state.areaControl[actualTargetArea as any].specialEffects.push('已接种');
        }
        this.state.phaseLogs.push(`💉 在${this.getLevelAreaName(actualTargetArea as any)}完成签名接种，病毒免疫3回合`);
        this.updateAreaControl();
        break;
      case 'defense_marker':
        this.state.areaControl[actualTargetArea as any].defenseMarkers += effect.value || 1;
        this.state.phaseLogs.push(`🛡️ 在${this.getLevelAreaName(actualTargetArea as any)}放置了${effect.value || 1}个防御标记`);
        this.updateAreaControl();
        break;
      case 'trap_set':
        // 添加持续效果
        this.addActiveEffect({
          id: `trap_${Date.now()}`,
          type: 'trap',
          source: '判定效果',
          targetArea: actualTargetArea as any,
          remainingTurns: 5,
          description: '陷阱',
          appliedAt: this.state.currentTurn
        });
        if (!this.state.areaControl[actualTargetArea as any].specialEffects.includes('陷阱')) {
          this.state.areaControl[actualTargetArea as any].specialEffects.push('陷阱');
        }
        this.state.phaseLogs.push(`⚠️ 在${this.getLevelAreaName(actualTargetArea as any)}设置了陷阱，持续5回合`);
        break;
      case 'skill_immunity':
        // 添加持续效果
        this.addActiveEffect({
          id: `skill_immunity_${Date.now()}`,
          type: 'skill_immunity',
          source: '判定效果',
          targetArea: actualTargetArea as any,
          remainingTurns: 3,
          description: '技能免疫',
          appliedAt: this.state.currentTurn
        });
        if (!this.state.areaControl[actualTargetArea as any].specialEffects.includes('技能免疫')) {
          this.state.areaControl[actualTargetArea as any].specialEffects.push('技能免疫');
        }
        const actionPointRecovery = effect.baseValue || 1;
        this.state.playerState.actionPoints = Math.min(
          this.state.playerState.maxActionPoints,
          this.state.playerState.actionPoints + actionPointRecovery
        );
        this.state.phaseLogs.push(`🛡️ ${this.getLevelAreaName(actualTargetArea as any)}获得技能免疫3回合，恢复${actionPointRecovery}行动点`);
        break;
      default:
        if (!securityChange && !infiltrationChange) {
          this.state.phaseLogs.push(`⚠️ 未知效果类型: ${effectType}, 描述: ${effect.description || '无描述'}`);
        }
    }
  }

  async endTurn(): Promise<LevelPhaseResult> {
    if (!this.state) {
      return { success: false, logs: ['错误：无游戏状态'], canProceed: false };
    }

    const logs: string[] = ['═══════════════════════════════════'];
    logs.push(`📊 玩家回合 ${this.state.currentTurn} 结束`);

    // 设置AI控制器状态
    this.aiController.setState(this.state);

    // 更新回合和轮次
    // 一个完整轮次 = 玩家回合 + 大东回合 + 敌人回合
    this.state.currentTurn += 1;
    // 每3个回合（玩家+大东+敌人）= 1个轮次
    this.state.round = Math.ceil(this.state.currentTurn / 3);

    // 执行大东AI回合（七个阶段）
    this.state.currentActor = 'dadong';
    this.state.isDadongTurn = true;
    const dadongResult = await this.aiController.executeDadongTurn();
    logs.push(...dadongResult.logs);
    logs.push('🤖 大东AI回合执行完成');
    this.state.isDadongTurn = false;

    // 执行敌人AI回合（七个阶段）
    this.state.currentActor = 'enemy';
    this.state.isEnemyTurn = true;
    const enemyResult = await this.aiController.executeEnemyTurn();
    logs.push(...enemyResult.logs);
    logs.push('👾 敌方回合执行完成');
    this.state.isEnemyTurn = false;
    this.state.currentPhase = 'judgment';
    this.state.currentActor = 'player';
    this.state.phaseLogs = [];

    this.updateObjectives();
    const gameEndResult = this.checkGameEnd();

    if (gameEndResult) {
      logs.push(...gameEndResult.logs);
      return { 
        success: true, 
        logs, 
        canProceed: false,
        phaseData: gameEndResult 
      };
    }

    logs.push(`🔄 进入回合 ${this.state.currentTurn} (轮次 ${this.state.round})`);

    this.notifyStateChange();
    return { success: true, logs, canProceed: true };
  }

  private executeDadongAITurn(): void {
    if (!this.state || !this.state.dadongAIState.isActive) return;

    // 恢复大东AI的行动点
    this.state.dadongAIState.actionPoints = this.state.dadongAIState.maxActionPoints;

    // 大东AI抽牌阶段
    const cardsToDraw = DADONG_AI.behavior.cardsPerTurn;
    for (let i = 0; i < cardsToDraw; i++) {
      if (this.state.playerState.deck.length > 0) {
        const card = this.state.playerState.deck.pop()!;
        this.state.dadongAIState.hand.push(card);
      }
    }

    this.state.phaseLogs.push(`🤖 大东AI回合开始，行动点: ${this.state.dadongAIState.actionPoints}`);

    // 大东AI出牌阶段 - 使用资源系统
    let cardsPlayed = 0;
    while (this.state.dadongAIState.actionPoints > 0 && this.state.dadongAIState.hand.length > 0) {
      // 找出可以打出的卡牌（资源足够）
      const playableCards = this.state.dadongAIState.hand.filter((card, index) => {
        const cost = card.cost || {};
        return (
          (cost.compute || 0) <= this.state!.dadongAIState.resources.computing &&
          (cost.funds || 0) <= this.state!.dadongAIState.resources.funds &&
          (cost.information || 0) <= this.state!.dadongAIState.resources.information
        );
      });

      if (playableCards.length === 0) break;

      // 随机选择一张可打的卡牌
      const randomIndex = Math.floor(Math.random() * playableCards.length);
      const card = playableCards[randomIndex];
      const handIndex = this.state.dadongAIState.hand.indexOf(card);
      
      // 扣除资源
      const cost = card.cost || {};
      this.state.dadongAIState.resources.computing -= (cost.compute || 0);
      this.state.dadongAIState.resources.funds -= (cost.funds || 0);
      this.state.dadongAIState.resources.information -= (cost.information || 0);
      this.state.dadongAIState.actionPoints -= 1;
      
      // 从手牌移除
      this.state.dadongAIState.hand.splice(handIndex, 1);
      this.state.dadongAIState.lastPlayedCard = card;
      cardsPlayed++;

      // 应用卡牌效果
      this.applyDadongCardEffect(card);
      
      this.state.phaseLogs.push(`🤖 大东打出: ${card.name}`);
    }

    // 大东AI资源恢复
    this.state.dadongAIState.resources.computing += 3;
    this.state.dadongAIState.resources.funds += 3;
    this.state.dadongAIState.resources.information += 3;

    this.state.phaseLogs.push(`🤖 大东AI回合结束，打出${cardsPlayed}张卡牌`);
  }

  private applyDadongCardEffect(card: Card): void {
    if (!this.state) return;

    const effect = card.effects?.[0];
    if (!effect) return;

    switch (effect.type) {
      case 'security_gain':
        this.state.playerState.securityLevel = Math.min(
          this.state.playerState.securityLevel + (effect.baseValue || 1) + this.state.dadongAIState.cooperationBonus,
          this.state.playerState.maxSecurityLevel
        );
        break;
      case 'resource_gain':
        if (effect.resourceType === 'compute') {
          this.state.playerState.resources.computing += effect.value || 1;
        } else if (effect.resourceType === 'information') {
          this.state.playerState.resources.information += effect.value || 1;
        }
        break;
      case 'infiltration_reduce':
        this.state.enemyState.infiltrationLevel = Math.max(
          0,
          this.state.enemyState.infiltrationLevel - (effect.baseValue || 1)
        );
        break;
      case 'area_defense':
        if (effect.targetArea) {
          this.state.areaControl[effect.targetArea].defenseMarkers += effect.value || 1;
          this.updateAreaControl();
        } else {
          this.state.areaControl.internal.defenseMarkers += effect.value || 1;
          this.updateAreaControl();
        }
        break;
    }
  }

  private executeEnemyTurn(): void {
    if (!this.state) return;

    const enemyConfig = this.state.currentLevel.enemyConfig;

    this.state.enemyState.infiltrationLevel += 1;

    for (const pattern of enemyConfig.attackPattern) {
      if (pattern.turn === 'all' || pattern.turn === this.state.currentTurn) {
        this.executeEnemyAttack(pattern.intensity);
      }
    }

    for (const ability of enemyConfig.specialAbilities) {
      if (ability.trigger.includes('回合') || ability.trigger === '每回合') {
        this.state.enemyState.infiltrationLevel += 1;
      }
    }
  }

  private executeEnemyAttack(intensity: 'low' | 'medium' | 'high'): void {
    if (!this.state) return;

    const damageMap = { low: 2, medium: 4, high: 6 };
    const damage = damageMap[intensity];

    this.state.playerState.securityLevel = Math.max(
      0,
      this.state.playerState.securityLevel - damage
    );

    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    const randomArea = areas[Math.floor(Math.random() * areas.length)];
    this.state.areaControl[randomArea].attackMarkers += 1;
    
    // 更新区域控制
    this.updateAreaControl();
  }

  private updateAreaControl(): void {
    if (!this.state) return;

    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    
    for (const area of areas) {
      const areaState = this.state.areaControl[area];
      
      if (areaState.attackMarkers > areaState.defenseMarkers) {
        // 攻击方标记多于防御方，区域被敌方占领
        if (areaState.controller !== 'enemy') {
          areaState.controller = 'enemy';
          this.state.phaseLogs.push(`⚠️ ${this.getLevelAreaName(area)}被敌方占领！`);
        }
      } else if (areaState.defenseMarkers > areaState.attackMarkers) {
        // 防御方标记多于攻击方，区域被玩家占领
        if (areaState.controller !== 'player') {
          areaState.controller = 'player';
          this.state.phaseLogs.push(`✅ ${this.getLevelAreaName(area)}被玩家占领！`);
        }
      } else {
        // 标记相等，区域变为中立
        if (areaState.controller !== 'neutral') {
          areaState.controller = 'neutral';
          this.state.phaseLogs.push(`⚖️ ${this.getLevelAreaName(area)}变为中立`);
        }
      }
    }
  }

  /**
   * 获取关卡专属区域名称
   * 优先从关卡配置中读取，如果没有配置则使用默认名称
   * @param area 区域类型
   * @returns 区域名称
   */
  getLevelAreaName(area: AreaType): string {
    // 优先从关卡配置中读取专属名称
    const levelAreaName = this.state?.currentLevel.areaDistribution?.[area]?.name;
    if (levelAreaName) {
      return levelAreaName;
    }
    // 回退到默认名称
    return this.getAreaName(area);
  }

  /**
   * 获取默认区域名称
   * @param area 区域类型
   * @returns 默认区域名称
   */
  private getAreaName(area: AreaType): string {
    const areaNames: Record<AreaType, string> = {
      internal: '内网',
      industrial: '工控网',
      dmz: 'DMZ区',
      external: '外网'
    };
    return areaNames[area];
  }

  /**
   * 获取区域特性修正
   * @param area 区域类型
   * @param action 行动类型
   * @returns 修正值（行动点消耗修正）
   */
  getAreaTraitModifier(area: AreaType, action: 'place_friendly' | 'place_enemy' | 'enemy_skill'): number {
    const trait = this.state?.currentLevel.areaDistribution?.[area]?.traitType;
    switch (trait) {
      case 'infection_zone':
        return action === 'place_enemy' ? -1 : 0; // 感染高发区：敌方放置标记时行动点消耗-1
      case 'safe_zone':
        return action === 'place_friendly' ? -1 : 0; // 安全区域：友方放置标记时行动点消耗-1
      case 'protected':
        return action === 'enemy_skill' ? 0.5 : 0; // 防护区域：敌方技能效果减半
      default:
        return 0; // 中立区域：无特殊效果
    }
  }

  /**
   * 获取区域特性描述
   * @param area 区域类型
   * @returns 区域特性描述
   */
  getAreaTraitDescription(area: AreaType): string {
    return this.state?.currentLevel.areaDistribution?.[area]?.trait || '无特殊效果';
  }

  /**
   * 检查区域是否有特定特性
   * @param area 区域类型
   * @param traitType 特性类型
   * @returns 是否具有该特性
   */
  hasAreaTrait(area: AreaType, traitType: string): boolean {
    return this.state?.currentLevel.areaDistribution?.[area]?.traitType === traitType;
  }

  /**
   * 应用区域特性对敌方技能效果的修正
   * @param area 区域类型
   * @param baseEffect 基础效果值
   * @returns 修正后的效果值
   */
  applyAreaTraitToEnemySkill(area: AreaType, baseEffect: number): number {
    const modifier = this.getAreaTraitModifier(area, 'enemy_skill');
    if (modifier === 0.5) {
      // 防护区域：敌方技能效果减半
      return Math.floor(baseEffect * 0.5);
    }
    return baseEffect;
  }

  private drawCards(): void {
    if (!this.state) return;

    while (this.state.playerState.hand.length < 3 && this.state.playerState.deck.length > 0) {
      const card = this.state.playerState.deck.pop()!;
      this.state.playerState.hand.push(card);
    }

    if (this.state.playerState.deck.length === 0 && this.state.playerState.discardPile.length > 0) {
      this.state.playerState.deck = this.shuffleDeck([...this.state.playerState.discardPile]);
      this.state.playerState.discardPile = [];
    }
  }

  private updateObjectives(): void {
    if (!this.state) return;

    for (const objective of this.state.objectives) {
      switch (objective.type) {
        case 'survive':
          objective.current = this.state.currentTurn;
          objective.completed = this.state.currentTurn >= objective.target;
          break;
        case 'maintain_security':
          objective.current = this.state.playerState.securityLevel;
          objective.completed = this.state.playerState.securityLevel >= objective.target;
          break;
        case 'protect_areas':
          const controlledAreas = Object.values(this.state.areaControl)
            .filter(area => area.controller === 'player').length;
          objective.current = controlledAreas;
          objective.completed = controlledAreas >= objective.target;
          break;
        case 'use_defense_cards':
          objective.current = this.state.playerState.defenseCardsUsed;
          objective.completed = this.state.playerState.defenseCardsUsed >= objective.target;
          break;
        case 'collect_info':
          objective.current = this.state.playerState.resources.information;
          objective.completed = this.state.playerState.resources.information >= objective.target;
          break;
        case 'clear_virus':
          // 清除病毒：检查所有区域敌方标记总数是否为0
          const totalAttackMarkers = Object.values(this.state.areaControl)
            .reduce((sum, area) => sum + area.attackMarkers, 0);
          objective.current = totalAttackMarkers;
          objective.completed = totalAttackMarkers === 0;
          break;
        case 'full_vaccination':
          // 全面接种：检查所有区域是否都有"已接种"状态
          const vaccinatedAreas = Object.values(this.state.areaControl)
            .filter(area => area.specialEffects.includes('已接种') || 
                    this.isAreaVaccinated(area as any)).length;
          objective.current = vaccinatedAreas;
          objective.completed = vaccinatedAreas >= 4; // 4个区域
          break;
        case 'system_rewrite':
          // 系统重写：检查是否使用系统重写卡牌移除了所有敌方标记
          // 这个条件需要在卡牌效果中标记，这里检查是否满足条件
          const allMarkersCleared = Object.values(this.state.areaControl)
            .reduce((sum, area) => sum + area.attackMarkers, 0) === 0;
          // 同时检查是否有系统重写卡牌使用记录（通过特殊效果标记）
          const systemRewriteUsed = this.state.activeEffects?.some(
            effect => effect.source === '系统重写'
          ) || false;
          objective.current = systemRewriteUsed && allMarkersCleared ? 1 : 0;
          objective.completed = systemRewriteUsed && allMarkersCleared;
          break;
      }
    }
  }

  private checkGameEnd(): { logs: string[]; result: 'victory' | 'defeat' } | null {
    if (!this.state) return null;

    // 失败条件1：安全等级归零
    if (this.state.playerState.securityLevel <= 0) {
      this.handleGameOver();
      return { 
        logs: ['💀 安全等级归零，防御失败！'], 
        result: 'defeat' 
      };
    }

    // 失败条件2：全面感染 - 敌方标记总数达到10个
    const totalAttackMarkers = Object.values(this.state.areaControl)
      .reduce((sum, area) => sum + area.attackMarkers, 0);
    if (totalAttackMarkers >= 10) {
      this.handleGameOver();
      return { 
        logs: [`🦠 全面感染！敌方标记总数达到 ${totalAttackMarkers} 个，系统完全沦陷！`], 
        result: 'defeat' 
      };
    }

    // 失败条件3：系统崩溃 - 两个或以上区域的友方标记同时为0
    const areasWithZeroDefense = Object.values(this.state.areaControl)
      .filter(area => area.defenseMarkers === 0).length;
    if (areasWithZeroDefense >= 2) {
      this.handleGameOver();
      return { 
        logs: [`💥 系统崩溃！${areasWithZeroDefense} 个区域的防御标记归零，防线全面瓦解！`], 
        result: 'defeat' 
      };
    }

    // 失败条件4：回合超限
    const maxTurns = this.state.currentLevel.maxTurns;
    if (maxTurns && this.state.currentTurn > maxTurns) {
      this.handleGameOver();
      return { 
        logs: [`⏰ 回合超限！已超过最大回合数 ${maxTurns}，任务失败！`], 
        result: 'defeat' 
      };
    }

    // 胜利条件：所有目标完成
    const allObjectivesComplete = this.state.objectives.every(obj => obj.completed);
    if (allObjectivesComplete) {
      this.handleLevelComplete();
      return { 
        logs: ['🎉 所有目标完成，关卡胜利！'], 
        result: 'victory' 
      };
    }

    return null;
  }

  private handleLevelComplete(): void {
    if (!this.state) return;

    const level = this.state.currentLevel;
    const score = this.calculateScore();

    this.progressStorage[level.id].status = 'completed';
    this.progressStorage[level.id].completedObjectives = this.state.objectives.map(obj => obj.id);
    this.progressStorage[level.id].bestScore = Math.max(
      this.progressStorage[level.id].bestScore || 0,
      score
    );
    this.progressStorage[level.id].completedAt = new Date();

    const nextLevelId = this.getNextLevelId(level.id);
    if (nextLevelId && this.progressStorage[nextLevelId]) {
      this.progressStorage[nextLevelId].status = 'available';
    }

    this.saveProgress();

    const result: LevelCompletionResult = {
      levelId: level.id,
      success: true,
      score,
      completedObjectives: this.state.objectives.filter(obj => obj.completed).map(obj => obj.id),
      turnsTaken: this.state.currentTurn,
      rewards: level.rewards,
      articleContent: level.articleContent,
      nextLevel: nextLevelId
    };

    if (this.onLevelComplete) {
      this.onLevelComplete(result);
    }
  }

  private handleGameOver(): void {
    if (!this.state) return;

    if (this.onGameOver) {
      this.onGameOver();
    }
  }

  private calculateScore(): number {
    if (!this.state) return 0;

    let score = 100;

    score += this.state.playerState.securityLevel;

    score += Math.max(0, 20 - this.state.currentTurn) * 5;

    score += this.state.objectives.filter(obj => obj.completed).length * 10;

    return Math.max(0, score);
  }

  private getNextLevelId(currentId: LevelId): LevelId | undefined {
    const currentIndex = LEVEL_ORDER.indexOf(currentId);
    if (currentIndex === -1 || currentIndex >= LEVEL_ORDER.length - 1) return undefined;
    return LEVEL_ORDER[currentIndex + 1];
  }

  // ==================== 持续效果管理方法 ====================

  /**
   * 添加持续效果
   */
  addActiveEffect(effect: ActiveEffect): void {
    if (!this.state) return;
    this.state.activeEffects = this.state.activeEffects || [];
    this.state.activeEffects.push(effect);
    this.notifyStateChange();
  }

  /**
   * 移除持续效果
   */
  removeActiveEffect(effectId: string): boolean {
    if (!this.state || !this.state.activeEffects) return false;
    const index = this.state.activeEffects.findIndex(e => e.id === effectId);
    if (index === -1) return false;
    this.state.activeEffects.splice(index, 1);
    this.notifyStateChange();
    return true;
  }

  /**
   * 检查区域是否有免疫效果
   */
  isAreaVaccinated(area: AreaType): boolean {
    return (this.state?.activeEffects || []).some(
      e => e.targetArea === area && e.type === 'vaccinated' && e.remainingTurns > 0
    );
  }

  /**
   * 检查区域是否有技能免疫效果
   */
  isAreaSkillImmune(area: AreaType): boolean {
    return (this.state?.activeEffects || []).some(
      e => e.targetArea === area && e.type === 'skill_immunity' && e.remainingTurns > 0
    );
  }

  /**
   * 检查区域是否有陷阱效果
   */
  isAreaTrapped(area: AreaType): boolean {
    return (this.state?.activeEffects || []).some(
      e => e.targetArea === area && e.type === 'trap' && e.remainingTurns > 0
    );
  }

  /**
   * 获取区域的所有持续效果
   */
  getAreaEffects(area: AreaType): ActiveEffect[] {
    return (this.state?.activeEffects || []).filter(
      e => e.targetArea === area && e.remainingTurns > 0
    );
  }

  /**
   * 在结束阶段减少效果持续回合
   */
  decrementEffectTurns(): void {
    if (!this.state || !this.state.activeEffects) return;
    
    const expiredEffects: ActiveEffect[] = [];
    
    this.state.activeEffects = this.state.activeEffects
      .map(e => {
        const newEffect = { ...e, remainingTurns: e.remainingTurns - 1 };
        if (newEffect.remainingTurns <= 0) {
          expiredEffects.push(e);
        }
        return newEffect;
      })
      .filter(e => e.remainingTurns > 0);
    
    // 记录过期效果的日志
    if (expiredEffects.length > 0) {
      expiredEffects.forEach(effect => {
        this.state!.phaseLogs.push(`⏰ 持续效果【${effect.description}】已过期（来源：${effect.source}）`);
        
        // 移除区域特殊效果标记
        if (effect.targetArea && effect.type === 'vaccinated') {
          const idx = this.state!.areaControl[effect.targetArea].specialEffects.indexOf('已接种');
          if (idx !== -1) {
            this.state!.areaControl[effect.targetArea].specialEffects.splice(idx, 1);
          }
        } else if (effect.targetArea && effect.type === 'skill_immunity') {
          const idx = this.state!.areaControl[effect.targetArea].specialEffects.indexOf('技能免疫');
          if (idx !== -1) {
            this.state!.areaControl[effect.targetArea].specialEffects.splice(idx, 1);
          }
        } else if (effect.targetArea && effect.type === 'trap') {
          const idx = this.state!.areaControl[effect.targetArea].specialEffects.indexOf('陷阱');
          if (idx !== -1) {
            this.state!.areaControl[effect.targetArea].specialEffects.splice(idx, 1);
          }
        }
      });
    }
    
    this.notifyStateChange();
  }

  /**
   * 获取所有活跃的持续效果
   */
  getActiveEffects(): ActiveEffect[] {
    return (this.state?.activeEffects || []).filter(e => e.remainingTurns > 0);
  }

  private notifyStateChange(): void {
    console.log('[LevelGameStateManager] notifyStateChange called', {
      hasCallback: !!this.onStateChange,
      hasState: !!this.state,
      currentPhase: this.state?.currentPhase,
      playerResources: this.state?.playerState?.resources
    });
    
    if (this.onStateChange && this.state) {
      const stateCopy = this.createStateCopy(this.state);
      console.log('[LevelGameStateManager] calling onStateChange with phase:', stateCopy.currentPhase, 'resources:', stateCopy.playerState.resources);
      this.onStateChange(stateCopy);
    }
    if (this.onPhaseChange && this.state) {
      this.onPhaseChange(this.state.currentPhase);
    }
  }

  private createStateCopy(state: LevelGameState): LevelGameState {
    return {
      ...state,
      playerState: {
        ...state.playerState,
        resources: { ...state.playerState.resources },
        hand: [...state.playerState.hand],
        deck: [...state.playerState.deck],
        discardPile: [...state.playerState.discardPile]
      },
      dadongAIState: {
        ...state.dadongAIState,
        hand: [...state.dadongAIState.hand],
        resources: { ...state.dadongAIState.resources }
      },
      enemyState: {
        ...state.enemyState,
        resources: { ...state.enemyState.resources },
        // 复制技能冷却追踪
        skillCooldowns: { ...state.enemyState.skillCooldowns },
        // 复制每个区域的标记累计数
        markerCountByArea: { ...state.enemyState.markerCountByArea },
        // 复制感染区域列表
        infectedAreas: [...(state.enemyState.infectedAreas || [])],
        // 复制活跃敌人ID列表
        activeEnemyIds: [...(state.enemyState.activeEnemyIds || [])]
      },
      areaControl: {
        internal: { ...state.areaControl.internal },
        industrial: { ...state.areaControl.industrial },
        dmz: { ...state.areaControl.dmz },
        external: { ...state.areaControl.external }
      },
      objectives: state.objectives.map(obj => ({ ...obj })),
      unlockedCards: [...state.unlockedCards],
      phaseLogs: [...state.phaseLogs],
      pendingJudgments: state.pendingJudgments?.map(j => ({ ...j })) || [],
      responseEvents: state.responseEvents?.map(e => ({ ...e })) || [],
      teamSharedLevels: {
        player: { ...state.teamSharedLevels?.player || { infiltrationLevel: 0, safetyLevel: 0 } },
        enemy: { ...state.teamSharedLevels?.enemy || { infiltrationLevel: 0, safetyLevel: 0 } }
      },
      activeEffects: state.activeEffects?.map(e => ({ ...e })) || []
    };
  }

  resetProgress(): void {
    this.progressStorage = this.initializeProgress();
    this.state = null;
  }

  skipToPhase(phase: LevelTurnPhase): boolean {
    if (!this.state) return false;

    const phaseIndex = LEVEL_TURN_PHASES.indexOf(phase);
    if (phaseIndex === -1) return false;

    this.state.currentPhase = phase;
    this.notifyStateChange();
    return true;
  }

  isPhaseInteractive(phase: LevelTurnPhase): boolean {
    return phase === 'action' || phase === 'discard';
  }

  canPlayCard(): boolean {
    if (!this.state) return false;
    return this.state.currentPhase === 'action' && this.state.playerState.actionPoints > 0;
  }

  canAdvancePhase(): boolean {
    if (!this.state) return false;
    
    if (this.state.currentPhase === 'discard') {
      const handLimit = getLevelHandLimit(this.state.round);
      return this.state.playerState.hand.length <= handLimit;
    }
    
    return true;
  }
}

export default LevelGameStateManager;
