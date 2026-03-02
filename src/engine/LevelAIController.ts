/**
 * 关卡AI控制系统
 * 
 * 功能：
 * 1. 大东AI的完整七个阶段操作逻辑
 * 2. 敌人AI的完整七个阶段操作逻辑
 * 3. AI操作可视化展示
 * 4. 与对战模式AI架构保持一致
 * 5. 集成可视化组件和增强延迟管理器
 * 
 * 重构版本：完全匹配PvP对战模式的AI架构标准
 */

import type {
  LevelGameState,
  LevelTurnPhase,
  LevelPhaseResult,
  AreaType
} from '@/types/levelTypes';
import type { Card } from '@/types/legacy/card_v16';
import { LEVEL_PHASE_NAMES, AREA_NAMES } from '@/types/levelTypes';
import { getEnemiesByLevel } from '@/data/levelEnemies';
import { getDrawCountByRound, getHandLimitByRound } from '@/types/gameConstants';
import { AIDecisionDelayManager } from './AIDecisionDelayManager';
import type { 
  CardInfo, 
  HandState, 
  JudgmentInfo,
  EnemyAttackPhaseInfo,
  EnemySkillPhaseInfo,
  EnemyJudgmentPhaseInfo 
} from '@/components/level/AIActionVisualizer';
import type { EnemySkillName, SkillEffect } from '@/components/level/SkillVisualizer';

// AI操作日志类型
export interface AIOperationLog {
  timestamp: number;
  actor: 'dadong' | 'enemy';
  phase: LevelTurnPhase;
  action: string;
  description: string;
  result?: string;
}

// AI决策结果
export interface AIDecision {
  action: 'play_card' | 'use_skill' | 'place_marker' | 'skip' | 'end_turn';
  card?: Card;
  targetArea?: AreaType;
  targetEnemy?: string;
  reason: string;
  priority: number; // 优先级，用于决策排序
}

// 摸牌阶段信息
export interface DrawPhaseInfo {
  drawnCards: CardInfo[];
  totalHandCount: number;
}

// 行动阶段信息
export interface ActionPhaseInfo {
  selectedCard?: CardInfo;
  availableCards?: CardInfo[];
  actionPoints: number;
  maxActionPoints: number;
}

// 弃牌阶段信息
export interface DiscardPhaseInfo {
  discardedCards: CardInfo[];
  remainingCards: number;
  handLimit: number;
}

// 可视化更新回调数据
export interface VisualizationUpdateData {
  actor: 'dadong' | 'enemy';
  phase: LevelTurnPhase;
  actionType?: string;
  progress: number;
  isVisible: boolean;
  message?: string;
  timestamp: number;
  playedCard?: CardInfo;
  handState?: HandState;
  judgmentInfo?: JudgmentInfo;
  drawPhaseInfo?: DrawPhaseInfo;
  actionPhaseInfo?: ActionPhaseInfo;
  discardPhaseInfo?: DiscardPhaseInfo;
  resources?: {
    computing: number;
    funds: number;
    information: number;
  };
  // 敌人AI特殊阶段信息
  enemyAttackPhaseInfo?: EnemyAttackPhaseInfo;
  enemySkillPhaseInfo?: EnemySkillPhaseInfo;
  enemyJudgmentPhaseInfo?: EnemyJudgmentPhaseInfo;
  // 技能视觉特效信息
  skillVisualization?: {
    skillName: EnemySkillName;
    skillDescription: string;
    targetArea?: string;
    intensity: 'low' | 'medium' | 'high';
    effects: SkillEffect[];
  };
}

// AI控制器配置
interface AIControllerConfig {
  dadongDifficulty: 'easy' | 'medium' | 'hard';
  enemyDifficulty: 'easy' | 'medium' | 'hard';
  enableVisualization: boolean;
  delayBetweenActions: number;
}

// 默认配置
const DEFAULT_CONFIG: AIControllerConfig = {
  dadongDifficulty: 'medium',
  enemyDifficulty: 'medium',
  enableVisualization: true,
  delayBetweenActions: 800
};

// 阶段进度映射
const PHASE_PROGRESS_MAP: Record<LevelTurnPhase, number> = {
  judgment: 0,
  recovery: 15,
  draw: 30,
  action: 50,
  response: 70,
  discard: 85,
  end: 100
};

// 敌人技能名称映射（将配置中的技能名称映射到视觉特效名称）
const ENEMY_SKILL_NAME_MAP: Record<string, EnemySkillName> = {
  // 第1关
  '软盘感染': '软盘感染',
  '第50次启动': '第50次启动',
  '社交工程传播': '社交工程传播',
  '潜伏复制': '潜伏复制',
  // 第2关
  '底层命令优先': '底层命令优先',
  '计算否定': '计算否定',
  '自动化扫描': '自动化扫描',
  '鱼叉式钓鱼': '鱼叉式钓鱼',
  // 第3关
  '自我繁殖': '自我繁殖',
  '高调感染': '高调感染',
  '漏洞扫描': '漏洞扫描',
  '现场处理': '现场处理',
  // 第4关
  '组件化加载': '组件化加载',
  '自我删除': '自我删除',
  '零日漏洞攻击': '零日漏洞攻击',
  '工业控制渗透': '工业控制渗透',
  // 第5关
  '传感器误导': '传感器误导',
  '控制权争夺': '控制权争夺',
  '故障模式触发': '故障模式触发',
  '指令冲突': '指令冲突',
  // 第6关
  '电磁脉冲攻击': '电磁脉冲攻击',
  '远程控制干扰': '远程控制干扰',
  '基础设施渗透': '基础设施渗透',
  '连锁故障': '连锁故障',
  // 第7关
  'MAC地址探测': 'MAC地址探测',
  '数据关联': '数据关联',
  '权限滥用': '权限滥用',
  '后台监听': '后台监听',
  // 第8关
  '密码分析': '密码分析',
  '七宗罪之力': '七宗罪之力',
  '暴力破解': '暴力破解',
  '历史攻击': '历史攻击',
  // 第9关
  '钓鱼陷阱': '钓鱼陷阱',
  '撞库攻击': '撞库攻击',
  '批量产号': '批量产号',
  '养号运营': '养号运营'
};

// 技能效果描述映射
const SKILL_EFFECT_DESCRIPTIONS: Record<string, string> = {
  '友方标记-1': '减少友方防御标记',
  '友方标记-2': '大幅减少友方防御标记',
  '行动点-1': '减少行动点',
  '行动点-2': '大幅减少行动点',
  '标记转化': '将友方标记转化为敌方标记',
  '感染扩散': '病毒扩散到相邻区域',
  '扫描探测': '扫描所有区域',
  '系统瘫痪': '系统进入瘫痪状态',
  '权限窃取': '窃取系统权限',
  '数据窃取': '窃取敏感数据',
  '密码破解': '尝试破解密码',
  '账号盗取': '尝试盗取账号'
};

export class LevelAIController {
  private state: LevelGameState | null = null;
  private config: AIControllerConfig;
  private operationLogs: AIOperationLog[] = [];
  private onOperationLog?: (log: AIOperationLog) => void;
  private onStateChange?: (state: LevelGameState) => void;
  
  // 可视化相关
  private onVisualizationUpdate?: (data: VisualizationUpdateData) => void;
  
  // 延迟管理器
  private dadongDelayManager: AIDecisionDelayManager;
  private enemyDelayManager: AIDecisionDelayManager;

  constructor(config: Partial<AIControllerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // 初始化延迟管理器
    this.dadongDelayManager = new AIDecisionDelayManager(this.config.dadongDifficulty, {
      minDelay: 2000,
      maxDelay: 5000,
      onProgress: (data) => this.handleDelayProgress('dadong', data)
    });
    
    this.enemyDelayManager = new AIDecisionDelayManager(this.config.enemyDifficulty, {
      minDelay: 2000,
      maxDelay: 5000,
      onProgress: (data) => this.handleDelayProgress('enemy', data)
    });
  }

  setState(state: LevelGameState): void {
    this.state = state;
  }

  setOnOperationLog(callback: (log: AIOperationLog) => void): void {
    this.onOperationLog = callback;
  }

  setOnStateChange(callback: (state: LevelGameState) => void): void {
    this.onStateChange = callback;
  }

  /**
   * 设置可视化更新回调
   */
  setOnVisualizationUpdate(callback: (data: VisualizationUpdateData) => void): void {
    this.onVisualizationUpdate = callback;
  }

  /**
   * 处理延迟进度更新
   */
  private handleDelayProgress(
    actor: 'dadong' | 'enemy',
    progressData: { progress: number; remainingTime: number; totalTime: number; phase?: string; elapsedTime: number }
  ): void {
    if (!this.onVisualizationUpdate) return;

    const phase = (progressData.phase as LevelTurnPhase) || 'judgment';
    const baseProgress = PHASE_PROGRESS_MAP[phase] || 0;
    const actionProgress = Math.min(100, Math.round(baseProgress + (progressData.progress * 0.15)));

    this.onVisualizationUpdate({
      actor,
      phase,
      progress: actionProgress,
      isVisible: true,
      message: `${actor === 'dadong' ? '大东' : '敌人'}正在思考... (${progressData.progress}%)`,
      timestamp: Date.now()
    });
  }

  /**
   * 发送可视化更新
   */
  private sendVisualizationUpdate(
    actor: 'dadong' | 'enemy',
    phase: LevelTurnPhase,
    actionType?: string,
    message?: string,
    playedCard?: CardInfo,
    handState?: HandState,
    judgmentInfo?: JudgmentInfo,
    drawPhaseInfo?: DrawPhaseInfo,
    actionPhaseInfo?: ActionPhaseInfo,
    discardPhaseInfo?: DiscardPhaseInfo,
    resources?: { computing: number; funds: number; information: number },
    enemyAttackPhaseInfo?: EnemyAttackPhaseInfo,
    enemySkillPhaseInfo?: EnemySkillPhaseInfo,
    enemyJudgmentPhaseInfo?: EnemyJudgmentPhaseInfo,
    skillVisualization?: {
      skillName: EnemySkillName;
      skillDescription: string;
      targetArea?: string;
      intensity: 'low' | 'medium' | 'high';
      effects: SkillEffect[];
    }
  ): void {
    if (!this.onVisualizationUpdate) return;

    const baseProgress = PHASE_PROGRESS_MAP[phase] || 0;

    this.onVisualizationUpdate({
      actor,
      phase,
      actionType,
      progress: baseProgress,
      isVisible: true,
      message: message || `${actor === 'dadong' ? '大东' : '敌人'}${LEVEL_PHASE_NAMES[phase]}`,
      timestamp: Date.now(),
      playedCard,
      handState,
      judgmentInfo,
      drawPhaseInfo,
      actionPhaseInfo,
      discardPhaseInfo,
      resources,
      enemyAttackPhaseInfo,
      enemySkillPhaseInfo,
      enemyJudgmentPhaseInfo,
      skillVisualization
    });
  }

  /**
   * 隐藏可视化
   */
  private hideVisualization(actor: 'dadong' | 'enemy'): void {
    if (!this.onVisualizationUpdate) return;

    this.onVisualizationUpdate({
      actor,
      phase: 'end',
      progress: 100,
      isVisible: false,
      message: `${actor === 'dadong' ? '大东' : '敌人'}回合结束`,
      timestamp: Date.now()
    });
  }

  // ============================================
  // 大东AI完整回合流程（七个阶段）
  // ============================================

  async executeDadongTurn(): Promise<LevelPhaseResult> {
    if (!this.state) {
      return { success: false, logs: ['错误：无游戏状态'], canProceed: false };
    }

    const logs: string[] = ['🤖 【大东AI回合开始】'];
    this.operationLogs = [];

    // 发送回合开始可视化
    this.sendVisualizationUpdate('dadong', 'judgment', 'turn_start', '大东回合开始');

    // 阶段1: 判定阶段
    this.sendVisualizationUpdate('dadong', 'judgment', 'phase_start', '进入判定阶段');
    const judgmentResult = await this.executeDadongJudgmentPhase();
    logs.push(...judgmentResult.logs);
    if (!judgmentResult.canProceed) return { success: false, logs, canProceed: false };

    // 阶段2: 恢复阶段
    this.sendVisualizationUpdate('dadong', 'recovery', 'phase_start', '进入恢复阶段');
    const recoveryResult = await this.executeDadongRecoveryPhase();
    logs.push(...recoveryResult.logs);
    if (!recoveryResult.canProceed) return { success: false, logs, canProceed: false };

    // 阶段3: 摸牌阶段
    this.sendVisualizationUpdate('dadong', 'draw', 'phase_start', '进入摸牌阶段');
    const drawResult = await this.executeDadongDrawPhase();
    logs.push(...drawResult.logs);
    if (!drawResult.canProceed) return { success: false, logs, canProceed: false };

    // 阶段4: 行动阶段
    this.sendVisualizationUpdate('dadong', 'action', 'phase_start', '进入行动阶段');
    const actionResult = await this.executeDadongActionPhase();
    logs.push(...actionResult.logs);
    if (!actionResult.canProceed) return { success: false, logs, canProceed: false };

    // 阶段5: 响应阶段
    this.sendVisualizationUpdate('dadong', 'response', 'phase_start', '进入响应阶段');
    const responseResult = await this.executeDadongResponsePhase();
    logs.push(...responseResult.logs);
    if (!responseResult.canProceed) return { success: false, logs, canProceed: false };

    // 阶段6: 弃牌阶段
    this.sendVisualizationUpdate('dadong', 'discard', 'phase_start', '进入弃牌阶段');
    const discardResult = await this.executeDadongDiscardPhase();
    logs.push(...discardResult.logs);
    if (!discardResult.canProceed) return { success: false, logs, canProceed: false };

    // 阶段7: 结束阶段
    this.sendVisualizationUpdate('dadong', 'end', 'phase_start', '进入结束阶段');
    const endResult = await this.executeDadongEndPhase();
    logs.push(...endResult.logs);

    logs.push('🤖 【大东AI回合结束】');
    
    // 隐藏可视化
    this.hideVisualization('dadong');

    return { success: true, logs, canProceed: true };
  }

  // 大东AI判定阶段（完全匹配PvP标准）
  private async executeDadongJudgmentPhase(): Promise<LevelPhaseResult> {
    const logs: string[] = [`📋 ${LEVEL_PHASE_NAMES['judgment']}`];
    
    this.logOperation('dadong', 'judgment', '检查判定', '大东检查待处理判定');
    
    // 使用标准2秒延迟
    await this.dadongDelayManager.executeStandardDelay('judgment');
    
    // 1. 结算待处理的判定（完全匹配PvP标准）
    const pendingJudgments = this.state?.pendingJudgments.filter(j => !j.resolved) || [];
    if (pendingJudgments.length > 0) {
      logs.push(`⚖️ 发现 ${pendingJudgments.length} 个待处理判定`);
      
      // 使用与PvP模式相同的判定系统
      for (const judgment of pendingJudgments) {
        // 执行骰子判定（完全匹配PvP标准）
        const difficulty = judgment.difficulty || 3;
        const roll = Math.floor(Math.random() * 6) + 1;
        const success = roll > difficulty;
        
        // 大成功/大失败判定（完全匹配PvP标准）
        const isCriticalSuccess = roll === 6 && difficulty <= 3;
        const isCriticalFailure = roll === 1 && difficulty >= 4;
        
        let resultText = '';
        if (isCriticalSuccess) {
          resultText = `大成功！掷出 ${roll} > ${difficulty}`;
          logs.push(`🌟 ${resultText} - ${judgment.description}`);
          this.logOperation('dadong', 'judgment', '大成功', judgment.description);
        } else if (isCriticalFailure) {
          resultText = `大失败！掷出 ${roll} ≤ ${difficulty}`;
          logs.push(`💥 ${resultText} - ${judgment.description}`);
          this.logOperation('dadong', 'judgment', '大失败', judgment.description);
        } else if (success) {
          resultText = `成功！掷出 ${roll} > ${difficulty}`;
          logs.push(`✅ ${resultText} - ${judgment.description}`);
          this.logOperation('dadong', 'judgment', '判定成功', judgment.description);
        } else {
          resultText = `失败！掷出 ${roll} ≤ ${difficulty}`;
          logs.push(`❌ ${resultText} - ${judgment.description}`);
          this.logOperation('dadong', 'judgment', '判定失败', judgment.description);
        }
        
        // 构建判定信息并发送
        const judgmentInfo: JudgmentInfo = {
          success: success || isCriticalSuccess,
          result: resultText,
          details: judgment.description
        };
        this.sendVisualizationUpdate(
          'dadong',
          'judgment',
          'judge',
          resultText,
          undefined,
          undefined,
          judgmentInfo
        );
        
        // 标记判定已处理
        judgment.resolved = true;
        
        // 应用判定效果
        if (judgment.effects) {
          const effect = success || isCriticalSuccess ? judgment.effects.success : judgment.effects.failure;
          if (effect) {
            this.applyJudgmentEffect(effect, isCriticalSuccess);
          }
        }
      }
      
      logs.push(`✅ 所有待处理判定已结算`);
    } else {
      logs.push('✓ 无待处理判定');
    }

    // 2. 结算持续效果
    logs.push('📋 结算持续效果...');
    this.applyDadongSpecialAbility();
    logs.push('✓ 持续效果已更新');

    return { success: true, logs, canProceed: true };
  }
  
  // 应用判定效果
  private applyJudgmentEffect(effect: any, isCritical: boolean): void {
    if (!this.state) return;
    
    const multiplier = isCritical ? 2 : 1;
    
    if (effect.securityChange) {
      this.state.playerState.securityLevel = Math.max(0, Math.min(
        this.state.playerState.maxSecurityLevel,
        this.state.playerState.securityLevel + effect.securityChange * multiplier
      ));
    }
    
    if (effect.infiltrationChange) {
      this.state.enemyState.infiltrationLevel = Math.max(0, Math.min(
        100,
        this.state.enemyState.infiltrationLevel + effect.infiltrationChange * multiplier
      ));
    }
    
    if (effect.resourceGain) {
      const dadong = this.state.dadongAIState;
      if (effect.resourceGain.compute) {
        dadong.resources.computing = Math.min(15, dadong.resources.computing + effect.resourceGain.compute * multiplier);
      }
      if (effect.resourceGain.funds) {
        dadong.resources.funds = Math.min(15, dadong.resources.funds + effect.resourceGain.funds * multiplier);
      }
      if (effect.resourceGain.information) {
        dadong.resources.information = Math.min(12, dadong.resources.information + effect.resourceGain.information * multiplier);
      }
    }
  }

  // 大东AI特殊能力：安全知识讲解
  private applyDadongSpecialAbility(): void {
    if (!this.state) return;

    const level = this.state.currentLevel;
    if (level.dadongConfig?.specialAbility) {
      // 每回合为一名友方角色恢复1行动点
      if (this.state.playerState.actionPoints < this.state.playerState.maxActionPoints) {
        this.state.playerState.actionPoints = Math.min(
          this.state.playerState.maxActionPoints,
          this.state.playerState.actionPoints + 1
        );
        this.logOperation(
          'dadong', 
          'judgment', 
          '使用特殊能力', 
          '安全知识讲解：为玩家恢复1行动点'
        );
      }
    }
  }

  // 大东AI恢复阶段（完全匹配PvP标准）
  private async executeDadongRecoveryPhase(): Promise<LevelPhaseResult> {
    const logs: string[] = [`💫 ${LEVEL_PHASE_NAMES['recovery']}`];
    
    if (!this.state) {
      return { success: false, logs, canProceed: false };
    }

    const dadong = this.state.dadongAIState;
    const oldResources = { ...dadong.resources };

    // 使用标准2秒延迟
    await this.dadongDelayManager.executeStandardDelay('recovery');

    // 1. 基础资源恢复（匹配PvP标准）
    // 根据轮次决定恢复量（简化版：固定恢复）
    const baseRecovery = {
      computing: 3,
      funds: 3,
      information: 3
    };
    
    dadong.resources.computing = Math.min(15, dadong.resources.computing + baseRecovery.computing);
    dadong.resources.funds = Math.min(15, dadong.resources.funds + baseRecovery.funds);
    dadong.resources.information = Math.min(12, dadong.resources.information + baseRecovery.information);

    const restoredResources: string[] = [];
    if (dadong.resources.computing > oldResources.computing) {
      restoredResources.push(`算力+${dadong.resources.computing - oldResources.computing}`);
    }
    if (dadong.resources.funds > oldResources.funds) {
      restoredResources.push(`资金+${dadong.resources.funds - oldResources.funds}`);
    }
    if (dadong.resources.information > oldResources.information) {
      restoredResources.push(`信息+${dadong.resources.information - oldResources.information}`);
    }

    if (restoredResources.length > 0) {
      logs.push(`💫 基础恢复: ${restoredResources.join(', ')}`);
      this.logOperation('dadong', 'recovery', '资源恢复', restoredResources.join(', '));
    }

    // 2. 区域控制加成（匹配PvP标准）
    // 统计玩家控制的区域数量
    let controlledAreas = 0;
    for (const area of ['internal', 'industrial', 'dmz', 'external'] as AreaType[]) {
      if (this.state.areaControl[area].controller === 'player') {
        controlledAreas++;
      }
    }
    
    if (controlledAreas > 0) {
      // 每个控制区域额外恢复1点资源
      dadong.resources.computing = Math.min(15, dadong.resources.computing + controlledAreas);
      dadong.resources.funds = Math.min(15, dadong.resources.funds + controlledAreas);
      logs.push(`🏰 区域控制加成: 所有资源+${controlledAreas}（控制${controlledAreas}个区域）`);
      this.logOperation('dadong', 'recovery', '区域加成', `控制${controlledAreas}个区域`);
    }

    // 3. 恢复行动点
    dadong.actionPoints = dadong.maxActionPoints;
    logs.push(`⚡ 行动点恢复至 ${dadong.actionPoints}`);

    return { success: true, logs, canProceed: true };
  }

  // 大东AI摸牌阶段（完全匹配PvP标准）
  private async executeDadongDrawPhase(): Promise<LevelPhaseResult> {
    const logs: string[] = [`🎴 ${LEVEL_PHASE_NAMES['draw']}`];
    
    if (!this.state) {
      return { success: false, logs, canProceed: false };
    }

    const dadong = this.state.dadongAIState;
    
    // 使用标准2秒延迟
    await this.dadongDelayManager.executeStandardDelay('draw');
    
    // 1. 计算抽卡数量（完全匹配PvP标准）
    // 根据轮次获取基础抽牌数（R4.3: 1-4轮次3张，5-8轮次4张，9-12轮次5张）
    let drawCount = getDrawCountByRound(this.state.round);
    
    // 2. 区域控制加成（匹配PvP标准）
    // 统计玩家控制的区域数量，每个控制区域额外抽1张
    let controlledAreas = 0;
    for (const area of ['internal', 'industrial', 'dmz', 'external'] as AreaType[]) {
      if (this.state.areaControl[area].controller === 'player') {
        controlledAreas++;
      }
    }
    drawCount += controlledAreas;
    
    const handSize = this.state.currentLevel.dadongConfig?.handSize || 2;
    const cardsToDraw = Math.max(0, Math.min(drawCount, handSize - dadong.hand.length + drawCount));

    const drawnCardInfos: CardInfo[] = [];
    
    if (cardsToDraw > 0) {
      for (let i = 0; i < cardsToDraw; i++) {
        if (this.state.playerState.deck.length > 0) {
          const card = this.state.playerState.deck.pop()!;
          dadong.hand.push(card);
          drawnCardInfos.push(this.convertToCardInfo(card));
        }
      }
      
      if (drawnCardInfos.length > 0) {
        logs.push(`🎴 基础抽牌: ${drawCount}张（轮次${this.state.round}）`);
        if (controlledAreas > 0) {
          logs.push(`🏰 区域控制加成: +${controlledAreas}张（控制${controlledAreas}个区域）`);
        }
        logs.push(`✅ 摸了 ${drawnCardInfos.length} 张牌: ${drawnCardInfos.map(c => c.name).join(', ')}`);
        this.logOperation('dadong', 'draw', '摸牌', `摸了${drawnCardInfos.length}张牌`);
        
        // 构建手牌状态并发送
        const handState = this.buildHandState(dadong.hand);
        
        // 构建摸牌阶段信息
        const drawPhaseInfo: DrawPhaseInfo = {
          drawnCards: drawnCardInfos,
          totalHandCount: dadong.hand.length
        };
        
        // 发送可视化更新，包含摸牌阶段详细信息
        this.sendVisualizationUpdate(
          'dadong',
          'draw',
          'draw_card',
          `摸了 ${drawnCardInfos.length} 张牌`,
          undefined,
          handState,
          undefined,
          drawPhaseInfo
        );
      }
    } else {
      logs.push('✓ 手牌已满，无需摸牌');
      
      // 即使没有摸牌，也发送当前手牌状态
      const handState = this.buildHandState(dadong.hand);
      const drawPhaseInfo: DrawPhaseInfo = {
        drawnCards: [],
        totalHandCount: dadong.hand.length
      };
      
      this.sendVisualizationUpdate(
        'dadong',
        'draw',
        'draw_card',
        '手牌已满，无需摸牌',
        undefined,
        handState,
        undefined,
        drawPhaseInfo
      );
    }

    return { success: true, logs, canProceed: true };
  }

  // 大东AI行动阶段
  private async executeDadongActionPhase(): Promise<LevelPhaseResult> {
    const logs: string[] = [`⚡ ${LEVEL_PHASE_NAMES['action']}`];
    
    if (!this.state) {
      return { success: false, logs, canProceed: false };
    }

    const dadong = this.state.dadongAIState;
    let actionsTaken = 0;
    const maxActions = 10; // 防止无限循环

    logs.push(`🎯 大东开始行动（行动点: ${dadong.actionPoints}）`);

    // 发送行动阶段开始可视化，包含手牌和可用卡牌信息
    const availableCards = dadong.hand.map(card => this.convertToCardInfo(card));
    const initialActionPhaseInfo: ActionPhaseInfo = {
      selectedCard: undefined,
      availableCards: availableCards,
      actionPoints: dadong.actionPoints,
      maxActionPoints: dadong.maxActionPoints
    };
    
    this.sendVisualizationUpdate(
      'dadong',
      'action',
      'phase_start',
      `行动阶段开始，手牌 ${dadong.hand.length} 张，行动点 ${dadong.actionPoints}`,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      initialActionPhaseInfo,
      undefined,
      dadong.resources
    );

    while (dadong.actionPoints > 0 && dadong.hand.length > 0 && actionsTaken < maxActions) {
      const decision = this.makeDadongDecision();
      
      if (decision.action === 'skip' || decision.action === 'end_turn') {
        logs.push('⏹️ 大东决定结束行动');
        break;
      }

      if (decision.action === 'play_card' && decision.card) {
        const cardIndex = dadong.hand.findIndex(c => c.card_code === decision.card?.card_code);
        if (cardIndex >= 0) {
          const card = dadong.hand.splice(cardIndex, 1)[0];
          dadong.actionPoints -= 1;
          actionsTaken++;

          // 扣除资源
          const cost = card.cost || {};
          if (cost.compute) {
            dadong.resources.computing -= cost.compute;
            logs.push(`💻 消耗算力: ${cost.compute}`);
          }
          if (cost.funds) {
            dadong.resources.funds -= cost.funds;
            logs.push(`💰 消耗资金: ${cost.funds}`);
          }
          if (cost.information) {
            dadong.resources.information -= cost.information;
            logs.push(`📊 消耗信息: ${cost.information}`);
          }

          // 应用卡牌效果
          this.applyDadongCardEffect(card, decision.targetArea);
          
          logs.push(`🃏 使用卡牌: ${card.name}`);
          this.logOperation('dadong', 'action', '使用卡牌', `${card.name} (${decision.reason})`);
          
          dadong.lastPlayedCard = card;
          
          // 构建卡牌信息
          const playedCardInfo = this.convertToCardInfo(card);
          
          // 构建行动阶段信息
          const actionPhaseInfo: ActionPhaseInfo = {
            selectedCard: playedCardInfo,
            availableCards: dadong.hand.map(c => this.convertToCardInfo(c)),
            actionPoints: dadong.actionPoints,
            maxActionPoints: dadong.maxActionPoints
          };
          
          // 发送行动进度更新，包含卡牌信息和行动阶段详情
          this.sendVisualizationUpdate(
            'dadong',
            'action',
            'playing_card',
            `使用卡牌: ${card.name} (${actionsTaken}/${maxActions})`,
            playedCardInfo,
            undefined,
            undefined,
            undefined,
            actionPhaseInfo,
            undefined,
            dadong.resources
          );
        }
      }

      // 使用标准2秒延迟
      await this.dadongDelayManager.executeStandardDelay('action');
    }

    logs.push(`✅ 大东行动结束，共执行 ${actionsTaken} 个行动`);

    return { success: true, logs, canProceed: true };
  }

  // 大东AI决策逻辑 - 增强版协同策略
  private makeDadongDecision(): AIDecision {
    if (!this.state) {
      return { action: 'skip', reason: '无游戏状态', priority: 0 };
    }

    const dadong = this.state.dadongAIState;
    
    // 如果没有手牌或行动点，跳过
    if (dadong.hand.length === 0 || dadong.actionPoints <= 0) {
      return { action: 'skip', reason: '无手牌或行动点', priority: 0 };
    }

    // 识别玩家意图和战场情况
    const playerIntent = this.identifyPlayerIntent();
    
    // 评估所有可能的行动，选择最优解
    const possibleDecisions: AIDecision[] = [];
    
    // 评估每张卡牌的价值
    for (const card of dadong.hand) {
      const decision = this.evaluateCardForDadong(card, playerIntent);
      if (decision) {
        possibleDecisions.push(decision);
      }
    }
    
    // 按优先级排序，选择最高优先级的行动
    if (possibleDecisions.length > 0) {
      possibleDecisions.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      return possibleDecisions[0];
    }

    // 如果没有合适的卡牌，结束回合
    return { action: 'skip', reason: '无合适行动', priority: 0 };
  }
  
  // 识别玩家意图
  private identifyPlayerIntent(): { 
    needsProtection: boolean; 
    targetArea?: AreaType; 
    hasPlayedAttackCard: boolean;
    securityRatio: number;
  } {
    if (!this.state) {
      return { needsProtection: false, hasPlayedAttackCard: false, securityRatio: 1.0 };
    }

    const playerSecurity = this.state.playerState.securityLevel;
    const maxSecurity = this.state.playerState.maxSecurityLevel;
    const securityRatio = playerSecurity / maxSecurity;
    
    // 检查玩家是否需要保护
    const needsProtection = securityRatio < 0.4;
    
    // 查找玩家可能的目标区域（有最多敌方标记的区域）
    let targetArea: AreaType | undefined;
    let maxEnemyMarkers = -1;
    for (const area of ['internal', 'industrial', 'dmz', 'external'] as AreaType[]) {
      const markers = this.state.areaControl[area].attackMarkers;
      if (markers > maxEnemyMarkers) {
        maxEnemyMarkers = markers;
        targetArea = area;
      }
    }
    
    // 检查玩家最近是否使用了攻击类卡牌（简化版）
    const hasPlayedAttackCard = false; // 这需要跟踪玩家出牌历史
    
    return {
      needsProtection,
      targetArea,
      hasPlayedAttackCard,
      securityRatio
    };
  }
  
  // 评估卡牌对大东AI的价值 - 增强版协同策略
  private evaluateCardForDadong(card: Card, playerIntent?: { 
    needsProtection: boolean; 
    targetArea?: AreaType; 
    hasPlayedAttackCard: boolean;
    securityRatio: number;
  }): AIDecision | null {
    if (!this.state) return null;
    
    const targetArea = this.findBestTargetAreaForDadong(playerIntent?.targetArea);
    const dadong = this.state.dadongAIState;
    
    // 检查资源是否足够
    const cost = card.cost || {};
    if (cost.compute && dadong.resources.computing < cost.compute) {
      return null;
    }
    if (cost.funds && dadong.resources.funds < cost.funds) {
      return null;
    }
    if (cost.information && dadong.resources.information < cost.information) {
      return null;
    }
    
    // 获取卡牌效果
    const effect = card.effects?.[0];
    if (!effect) return null;
    
    let priority = 5;
    let reason = '常规行动';
    
    // 协同策略1：玩家需要保护时，优先使用保护类卡牌
    if (playerIntent?.needsProtection) {
      if (effect.type === 'security_gain') {
        priority = 15;
        reason = '紧急：玩家安全等级低，优先提升安全';
      } else if (effect.type === 'infiltration_reduce') {
        priority = 14;
        reason = '紧急：玩家需要保护，优先清除威胁';
      }
    } else {
      if (effect.type === 'security_gain') {
        if (playerIntent && playerIntent.securityRatio < 0.6) {
          priority = 7;
          reason = '提升安全等级';
        } else {
          priority = 4;
          reason = '常规安全提升';
        }
      } else if (effect.type === 'infiltration_reduce') {
        const enemyMarkers = this.state.areaControl[targetArea].attackMarkers;
        if (playerIntent?.targetArea === targetArea) {
          priority = 12;
          reason = '配合玩家：清除同一区域敌方标记';
        } else if (enemyMarkers >= 5) {
          priority = 10;
          reason = '清除大量敌方标记';
        } else if (enemyMarkers >= 3) {
          priority = 8;
          reason = '清除敌方标记';
        } else if (enemyMarkers > 0) {
          priority = 6;
          reason = '清除标记';
        }
      } else if (effect.type === 'resource_gain') {
        priority = 3;
        reason = '获取资源';
      } else {
        priority = 3 + Math.random() * 3;
        reason = '使用卡牌';
      }
    }
    
    // 难度调整
    switch (this.config.dadongDifficulty) {
      case 'easy':
        priority *= 0.8; // 简单难度略微降低策略性
        break;
      case 'hard':
        priority *= 1.2; // 困难难度增强策略性
        break;
    }
    
    return {
      action: 'play_card',
      card,
      targetArea,
      reason,
      priority
    };
  }
  
  // 为大东AI查找最佳目标区域 - 支持配合玩家
  private findBestTargetAreaForDadong(playerTargetArea?: AreaType): AreaType {
    if (!this.state) return 'internal';

    // 协同策略：如果玩家有目标区域，优先选择同一区域
    if (playerTargetArea) {
      const areaState = this.state.areaControl[playerTargetArea];
      if (areaState.attackMarkers > 0) {
        return playerTargetArea;
      }
    }

    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    let bestArea: AreaType = 'internal';
    let highestThreat = -1;

    for (const area of areas) {
      const areaState = this.state.areaControl[area];
      const threat = areaState.attackMarkers - areaState.defenseMarkers;
      if (threat > highestThreat) {
        highestThreat = threat;
        bestArea = area;
      }
    }

    return bestArea;
  }

  // 应用大东AI卡牌效果
  private applyDadongCardEffect(card: Card, _targetArea?: AreaType): void {
    if (!this.state) return;

    const effect = card.effects?.[0];
    if (!effect) return;

    switch (effect.type) {
      case 'security_gain':
        this.state.playerState.securityLevel = Math.min(
          this.state.playerState.maxSecurityLevel,
          this.state.playerState.securityLevel + ((effect as any).baseValue || 1) + this.state.dadongAIState.cooperationBonus
        );
        break;
      case 'infiltration_reduce':
        this.state.enemyState.infiltrationLevel = Math.max(
          0,
          this.state.enemyState.infiltrationLevel - ((effect as any).baseValue || 1)
        );
        break;
    }
  }

  // 转换Card为CardInfo
  private convertToCardInfo(card: Card): CardInfo {
    const effectText = card.effects?.[0] ? 
      `${(card.effects[0] as any).type} 效果` : 
      '无效果描述';
    
    // 根据卡牌类型选择图标
    let icon = '🃏';
    const cardType = card.type?.toLowerCase() || '';
    if (cardType.includes('defense') || cardType.includes('防御')) {
      icon = '🛡️';
    } else if (cardType.includes('attack') || cardType.includes('攻击')) {
      icon = '⚔️';
    } else if (cardType.includes('skill') || cardType.includes('技能')) {
      icon = '✨';
    } else if (cardType.includes('trap') || cardType.includes('陷阱')) {
      icon = '🕸️';
    } else if (cardType.includes('resource') || cardType.includes('资源')) {
      icon = '💎';
    }
    
    return {
      name: card.name,
      type: card.type || '普通',
      cost: card.cost,
      effect: effectText,
      rarity: card.rarity as any || 'common',
      icon: icon,
      description: card.description
    };
  }

  // 构建手牌状态信息
  private buildHandState(hand: Card[]): HandState {
    const typeDistribution: Record<string, number> = {};
    
    hand.forEach(card => {
      const type = card.type || '普通';
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;
    });
    
    return {
      count: hand.length,
      typeDistribution
    };
  }

  // 大东AI响应阶段
  private async executeDadongResponsePhase(): Promise<LevelPhaseResult> {
    const logs: string[] = [`⏱️ ${LEVEL_PHASE_NAMES['response']}`];
    
    this.logOperation('dadong', 'response', '检查响应', '检查是否需要响应敌方行动');
    
    // 使用标准2秒延迟
    await this.dadongDelayManager.executeStandardDelay('response');
    
    // 检查响应事件
    const unresolvedEvents = this.state?.responseEvents.filter(e => !e.responded) || [];
    if (unresolvedEvents.length > 0) {
      logs.push(`⏱️ 需要响应 ${unresolvedEvents.length} 个事件`);
      // 大东AI自动响应（简化版）
      unresolvedEvents.forEach(event => {
        event.responded = true;
        logs.push(`✅ 自动响应：${event.description}`);
        this.logOperation('dadong', 'response', '响应事件', event.description);
      });
      
      // 构建响应阶段信息并发送
      const responsePhaseInfo: any = {
        events: unresolvedEvents.map(e => ({
          id: e.id,
          description: e.description,
          responded: true
        })),
        message: `已响应 ${unresolvedEvents.length} 个事件`
      };
      
      this.sendVisualizationUpdate(
        'dadong',
        'response',
        'responding',
        `已响应 ${unresolvedEvents.length} 个事件`,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        responsePhaseInfo
      );
    } else {
      logs.push('✓ 无需要响应的事件');
      
      // 即使没有事件也发送响应阶段信息
      const responsePhaseInfo: any = {
        events: [],
        message: '无需要响应的事件'
      };
      
      this.sendVisualizationUpdate(
        'dadong',
        'response',
        'response_complete',
        '无需要响应的事件',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        responsePhaseInfo
      );
    }

    return { success: true, logs, canProceed: true };
  }

  // 大东AI弃牌阶段（完全匹配PvP标准）
  private async executeDadongDiscardPhase(): Promise<LevelPhaseResult> {
    const logs: string[] = [`🗑️ ${LEVEL_PHASE_NAMES['discard']}`];
    
    if (!this.state) {
      return { success: false, logs, canProceed: false };
    }

    const dadong = this.state.dadongAIState;
    
    // 使用标准2秒延迟
    await this.dadongDelayManager.executeStandardDelay('discard');
    
    // 1. 计算手牌上限（完全匹配PvP标准）
    // R4.3: 手牌上限基于轮次（round）而非回合（turn）
    // 24轮次制：1-4轮次1张，5-8轮次3张，9-16轮次4张，17-24轮次5张
    const currentRound = this.state.round;
    const handLimit = getHandLimitByRound(currentRound);
    
    let handLimitRange: string;
    if (currentRound <= 4) {
      handLimitRange = '1-4轮次';
    } else if (currentRound <= 8) {
      handLimitRange = '5-8轮次';
    } else if (currentRound <= 16) {
      handLimitRange = '9-16轮次';
    } else {
      handLimitRange = '17-24轮次';
    }
    
    const currentHandSize = dadong.hand.length;

    logs.push(`📋 手牌上限: ${handLimit}张 (${handLimitRange})`);
    logs.push(`🎴 当前手牌: ${currentHandSize}张`);

    if (currentHandSize > handLimit) {
      const discardCount = currentHandSize - handLimit;
      const discardedCardInfos: CardInfo[] = [];
      
      for (let i = 0; i < discardCount; i++) {
        if (dadong.hand.length > 0) {
          // 优先弃置非防御卡牌
          const nonDefenseIndex = dadong.hand.findIndex(c => 
            c.faction !== 'defense' && !c.type?.includes('defense')
          );
          const indexToDiscard = nonDefenseIndex >= 0 ? nonDefenseIndex : 0;
          const card = dadong.hand.splice(indexToDiscard, 1)[0];
          discardedCardInfos.push(this.convertToCardInfo(card));
        }
      }
      
      logs.push(`🗑️ 弃置 ${discardedCardInfos.length} 张牌: ${discardedCardInfos.map(c => c.name).join(', ')}`);
      logs.push(`✅ 保留 ${handLimit} 张手牌`);
      this.logOperation('dadong', 'discard', '弃牌', `弃置${discardedCardInfos.map(c => c.name).join(', ')}`);
      
      // 构建手牌状态
      const handState = this.buildHandState(dadong.hand);
      
      // 构建弃牌阶段信息
      const discardPhaseInfo: DiscardPhaseInfo = {
        discardedCards: discardedCardInfos,
        remainingCards: dadong.hand.length,
        handLimit: handLimit
      };
      
      // 发送可视化更新，包含弃牌阶段详细信息
      this.sendVisualizationUpdate(
        'dadong',
        'discard',
        'discard_card',
        `弃置 ${discardedCardInfos.length} 张牌`,
        undefined,
        handState,
        undefined,
        undefined,
        undefined,
        discardPhaseInfo
      );
    } else {
      logs.push(`✅ 手牌数量符合要求（${currentHandSize}/${handLimit}）`);
      
      // 构建手牌状态
      const handState = this.buildHandState(dadong.hand);
      
      // 构建弃牌阶段信息（无需弃牌）
      const discardPhaseInfo: DiscardPhaseInfo = {
        discardedCards: [],
        remainingCards: dadong.hand.length,
        handLimit: handLimit
      };
      
      // 发送可视化更新
      this.sendVisualizationUpdate(
        'dadong',
        'discard',
        'discard_complete',
        '手牌数量符合要求',
        undefined,
        handState,
        undefined,
        undefined,
        undefined,
        discardPhaseInfo
      );
    }

    return { success: true, logs, canProceed: true };
  }

  // 大东AI结束阶段
  private async executeDadongEndPhase(): Promise<LevelPhaseResult> {
    const logs: string[] = [`🏁 ${LEVEL_PHASE_NAMES['end']}`];
    
    this.logOperation('dadong', 'end', '结束回合', '清除临时效果，准备结束');
    
    // 使用标准2秒延迟
    await this.dadongDelayManager.executeStandardDelay('end');
    
    logs.push('🏁 清除临时效果');
    logs.push('✓ 大东回合结束');

    return { success: true, logs, canProceed: true };
  }

  // ============================================
  // 敌人AI完整回合流程（七个阶段）
  // ============================================

  async executeEnemyTurn(): Promise<LevelPhaseResult> {
    if (!this.state) {
      return { success: false, logs: ['错误：无游戏状态'], canProceed: false };
    }

    const logs: string[] = ['👾 【敌人回合开始】'];
    
    // 获取当前关卡的敌人
    const levelEnemies = getEnemiesByLevel(parseInt(this.state.currentLevel.id.replace('LV', '')));
    
    // 发送回合开始可视化
    this.sendVisualizationUpdate('enemy', 'judgment', 'turn_start', '敌人回合开始');

    // 阶段1: 判定阶段
    this.sendVisualizationUpdate('enemy', 'judgment', 'phase_start', '进入判定阶段');
    const judgmentResult = await this.executeEnemyJudgmentPhase(levelEnemies);
    logs.push(...judgmentResult.logs);
    if (!judgmentResult.canProceed) return { success: false, logs, canProceed: false };

    // 阶段2: 恢复阶段
    this.sendVisualizationUpdate('enemy', 'recovery', 'phase_start', '进入恢复阶段');
    const recoveryResult = await this.executeEnemyRecoveryPhase();
    logs.push(...recoveryResult.logs);
    if (!recoveryResult.canProceed) return { success: false, logs, canProceed: false };

    // 阶段3: 摸牌阶段
    this.sendVisualizationUpdate('enemy', 'draw', 'phase_start', '进入摸牌阶段');
    const drawResult = await this.executeEnemyDrawPhase();
    logs.push(...drawResult.logs);
    if (!drawResult.canProceed) return { success: false, logs, canProceed: false };

    // 阶段4: 行动阶段
    this.sendVisualizationUpdate('enemy', 'action', 'phase_start', '进入行动阶段');
    const actionResult = await this.executeEnemyActionPhase(levelEnemies);
    logs.push(...actionResult.logs);
    if (!actionResult.canProceed) return { success: false, logs, canProceed: false };

    // 阶段5: 响应阶段
    this.sendVisualizationUpdate('enemy', 'response', 'phase_start', '进入响应阶段');
    const responseResult = await this.executeEnemyResponsePhase();
    logs.push(...responseResult.logs);
    if (!responseResult.canProceed) return { success: false, logs, canProceed: false };

    // 阶段6: 弃牌阶段
    this.sendVisualizationUpdate('enemy', 'discard', 'phase_start', '进入弃牌阶段');
    const discardResult = await this.executeEnemyDiscardPhase();
    logs.push(...discardResult.logs);
    if (!discardResult.canProceed) return { success: false, logs, canProceed: false };

    // 阶段7: 结束阶段
    this.sendVisualizationUpdate('enemy', 'end', 'phase_start', '进入结束阶段');
    const endResult = await this.executeEnemyEndPhase();
    logs.push(...endResult.logs);

    logs.push('👾 【敌人回合结束】');
    
    // 隐藏可视化
    this.hideVisualization('enemy');

    return { success: true, logs, canProceed: true };
  }

  // 敌人AI判定阶段（完全匹配PvP标准）
  private async executeEnemyJudgmentPhase(enemies: any[]): Promise<LevelPhaseResult> {
    const logs: string[] = [`📋 ${LEVEL_PHASE_NAMES['judgment']}`];
    
    this.logOperation('enemy', 'judgment', '检查判定', '敌人检查技能冷却和状态');
    
    // 使用标准2秒延迟
    await this.enemyDelayManager.executeStandardDelay('judgment');
    
    // 1. 结算待处理的判定（完全匹配PvP标准）
    const pendingJudgments = this.state?.pendingJudgments.filter(j => !j.resolved) || [];
    if (pendingJudgments.length > 0) {
      logs.push(`⚖️ 发现 ${pendingJudgments.length} 个待处理判定`);
      
      // 使用与PvP模式相同的判定系统
      for (const judgment of pendingJudgments) {
        // 执行骰子判定（完全匹配PvP标准）
        const difficulty = judgment.difficulty || 3;
        const roll = Math.floor(Math.random() * 6) + 1;
        const success = roll > difficulty;
        
        // 大成功/大失败判定（完全匹配PvP标准）
        const isCriticalSuccess = roll === 6 && difficulty <= 3;
        const isCriticalFailure = roll === 1 && difficulty >= 4;
        
        let resultText = '';
        if (isCriticalSuccess) {
          resultText = `大成功！掷出 ${roll} > ${difficulty}`;
          logs.push(`🌟 ${resultText} - ${judgment.description}`);
          this.logOperation('enemy', 'judgment', '大成功', judgment.description);
        } else if (isCriticalFailure) {
          resultText = `大失败！掷出 ${roll} ≤ ${difficulty}`;
          logs.push(`💥 ${resultText} - ${judgment.description}`);
          this.logOperation('enemy', 'judgment', '大失败', judgment.description);
        } else if (success) {
          resultText = `成功！掷出 ${roll} > ${difficulty}`;
          logs.push(`✅ ${resultText} - ${judgment.description}`);
          this.logOperation('enemy', 'judgment', '判定成功', judgment.description);
        } else {
          resultText = `失败！掷出 ${roll} ≤ ${difficulty}`;
          logs.push(`❌ ${resultText} - ${judgment.description}`);
          this.logOperation('enemy', 'judgment', '判定失败', judgment.description);
        }
        
        // 构建判定信息并发送
        const judgmentInfo: JudgmentInfo = {
          success: success || isCriticalSuccess,
          result: resultText,
          details: judgment.description
        };
        
        // 构建敌人判定阶段详细信息
        const enemyJudgmentPhaseInfo: EnemyJudgmentPhaseInfo = {
          judgmentCard: {
            name: judgment.cardName || '判定',
            type: '骰子判定',
            difficulty: difficulty
          },
          rollResult: roll,
          isSuccess: success || isCriticalSuccess,
          isCritical: isCriticalSuccess || isCriticalFailure,
          effectDescription: judgment.description || (success || isCriticalSuccess ? '判定成功效果' : '判定失败效果')
        };
        
        this.sendVisualizationUpdate(
          'enemy',
          'judgment',
          'judge',
          resultText,
          undefined,
          undefined,
          judgmentInfo,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          enemyJudgmentPhaseInfo
        );
        
        // 标记判定已处理
        judgment.resolved = true;
        
        // 应用判定效果（敌方视角）
        if (judgment.effects) {
          const effect = success || isCriticalSuccess ? judgment.effects.success : judgment.effects.failure;
          if (effect) {
            this.applyEnemyJudgmentEffect(effect, isCriticalSuccess);
          }
        }
      }
      
      logs.push(`✅ 所有待处理判定已结算`);
    } else {
      logs.push('✓ 无待处理判定');
    }

    // 2. 减少技能冷却
    enemies.forEach(enemy => {
      if (enemy.skills) {
        enemy.skills.forEach((skill: any) => {
          if (skill.cooldown > 0 && skill.cooldown !== 999) {
            skill.cooldown--;
          }
        });
      }
    });

    logs.push('📋 技能冷却已更新');
    logs.push('✓ 持续效果已结算');

    return { success: true, logs, canProceed: true };
  }
  
  // 应用敌方判定效果
  private applyEnemyJudgmentEffect(effect: any, isCritical: boolean): void {
    if (!this.state) return;
    
    const multiplier = isCritical ? 2 : 1;
    
    // 敌方视角：成功效果对敌方有利，失败效果对敌方不利
    if (effect.securityChange) {
      // 敌方成功：降低玩家安全等级
      this.state.playerState.securityLevel = Math.max(0, Math.min(
        this.state.playerState.maxSecurityLevel,
        this.state.playerState.securityLevel + effect.securityChange * multiplier
      ));
    }
    
    if (effect.infiltrationChange) {
      // 敌方成功：增加渗透等级
      this.state.enemyState.infiltrationLevel = Math.max(0, Math.min(
        100,
        this.state.enemyState.infiltrationLevel + effect.infiltrationChange * multiplier
      ));
    }
  }

  // 敌人AI恢复阶段（完全匹配PvP标准）
  private async executeEnemyRecoveryPhase(): Promise<LevelPhaseResult> {
    const logs: string[] = [`💫 ${LEVEL_PHASE_NAMES['recovery']}`];
    
    if (!this.state) {
      return { success: false, logs, canProceed: false };
    }

    const enemy = this.state.enemyState;
    const oldResources = { ...enemy.resources };
    
    // 使用标准2秒延迟
    await this.enemyDelayManager.executeStandardDelay('recovery');
    
    // 1. 基础资源恢复（匹配PvP标准）
    // 根据轮次决定恢复量（简化版：固定恢复）
    const baseRecovery = {
      computing: 2,
      funds: 2,
      information: 1
    };
    
    enemy.resources.computing = Math.min(10, enemy.resources.computing + baseRecovery.computing);
    enemy.resources.funds = Math.min(10, enemy.resources.funds + baseRecovery.funds);
    enemy.resources.information = Math.min(8, enemy.resources.information + baseRecovery.information);

    const restoredResources: string[] = [];
    if (enemy.resources.computing > oldResources.computing) {
      restoredResources.push(`算力+${enemy.resources.computing - oldResources.computing}`);
    }
    if (enemy.resources.funds > oldResources.funds) {
      restoredResources.push(`资金+${enemy.resources.funds - oldResources.funds}`);
    }
    if (enemy.resources.information > oldResources.information) {
      restoredResources.push(`信息+${enemy.resources.information - oldResources.information}`);
    }

    if (restoredResources.length > 0) {
      logs.push(`💫 基础恢复: ${restoredResources.join(', ')}`);
      this.logOperation('enemy', 'recovery', '资源恢复', restoredResources.join(', '));
    }

    // 2. 区域控制加成（匹配PvP标准）
    // 统计敌方控制的区域数量
    let controlledAreas = 0;
    for (const area of ['internal', 'industrial', 'dmz', 'external'] as AreaType[]) {
      if (this.state.areaControl[area].controller === 'enemy') {
        controlledAreas++;
      }
    }
    
    if (controlledAreas > 0) {
      // 每个控制区域额外恢复1点资源
      enemy.resources.computing = Math.min(10, enemy.resources.computing + controlledAreas);
      enemy.resources.funds = Math.min(10, enemy.resources.funds + controlledAreas);
      logs.push(`🏰 区域控制加成: 所有资源+${controlledAreas}（控制${controlledAreas}个区域）`);
      this.logOperation('enemy', 'recovery', '区域加成', `控制${controlledAreas}个区域`);
    }

    // 3. 减少攻击冷却
    if (enemy.attackCooldown > 0) {
      enemy.attackCooldown--;
      logs.push(`⚡ 攻击冷却: ${enemy.attackCooldown}`);
    }

    return { success: true, logs, canProceed: true };
  }

  // 敌人AI摸牌阶段（完全匹配PvP标准）
  private async executeEnemyDrawPhase(): Promise<LevelPhaseResult> {
    const logs: string[] = [`🎴 ${LEVEL_PHASE_NAMES['draw']}`];
    
    if (!this.state) {
      return { success: false, logs, canProceed: false };
    }
    
    // 使用标准2秒延迟
    await this.enemyDelayManager.executeStandardDelay('draw');
    
    // 1. 计算抽卡数量（完全匹配PvP标准）
    // 根据轮次获取基础抽牌数（R4.3: 1-4轮次3张，5-8轮次4张，9-12轮次5张）
    let drawCount = getDrawCountByRound(this.state.round);
    
    // 2. 区域控制加成（匹配PvP标准）
    // 统计敌方控制的区域数量，每个控制区域额外抽1张
    let controlledAreas = 0;
    for (const area of ['internal', 'industrial', 'dmz', 'external'] as AreaType[]) {
      if (this.state.areaControl[area].controller === 'enemy') {
        controlledAreas++;
      }
    }
    drawCount += controlledAreas;
    
    this.logOperation('enemy', 'draw', '准备行动', '敌人准备攻击策略');
    
    logs.push(`🎴 基础抽牌: ${drawCount}张（轮次${this.state.round}）`);
    if (controlledAreas > 0) {
      logs.push(`🏰 区域控制加成: +${controlledAreas}张（控制${controlledAreas}个区域）`);
    }
    logs.push('🎴 敌人分析战场局势');
    logs.push('✓ 攻击策略已制定');
    
    // 构建一个模拟的手牌状态（敌人没有实际手牌，只是模拟）
    const handState: HandState = {
      count: 5,
      typeDistribution: {
        '攻击': 2,
        '策略': 2,
        '特殊': 1
      }
    };
    this.sendVisualizationUpdate(
      'enemy',
      'draw',
      'draw_card',
      `抽了 ${drawCount} 张牌`,
      undefined,
      handState
    );

    return { success: true, logs, canProceed: true };
  }

  // 敌人AI行动阶段 - 智能决策系统
  private async executeEnemyActionPhase(enemies: any[]): Promise<LevelPhaseResult> {
    const logs: string[] = [`⚡ ${LEVEL_PHASE_NAMES['action']}`];
    
    if (!this.state) {
      return { success: false, logs, canProceed: false };
    }

    const enemyState = this.state.enemyState;
    const enemyConfig = this.state.currentLevel.enemyConfig;

    logs.push(`👾 ${enemyConfig.name}开始行动`);
    this.logOperation('enemy', 'action', '开始行动', `${enemyConfig.name}分析战场局势`);

    // 使用标准2秒延迟
    await this.enemyDelayManager.executeStandardDelay('action');

    // 智能决策：分析战场并选择最优策略
    const strategy = this.analyzeBattlefieldAndChooseStrategy();
    logs.push(`🎯 敌人策略: ${strategy.name} - ${strategy.description}`);
    this.logOperation('enemy', 'action', '制定策略', strategy.name);
    
    // 发送策略更新
    this.sendVisualizationUpdate('enemy', 'action', 'strategy', `策略: ${strategy.name}`);

    // 简化版：敌人只做一件事 - 放置1个标记
    const targetArea = this.selectTargetAreaForMarker();
    if (targetArea) {
      this.state.areaControl[targetArea].attackMarkers += 1;
      logs.push(`⚔️ 在 ${AREA_NAMES[targetArea]} 放置1个攻击标记`);
      this.logOperation('enemy', 'action', '放置标记', `在${AREA_NAMES[targetArea]}放置1个标记`);
      
      // 发送可视化更新
      this.sendVisualizationUpdate('enemy', 'action', 'placing_marker', `在 ${AREA_NAMES[targetArea]} 放置标记`);
      
      // 使用标准2秒延迟
      await this.enemyDelayManager.executeStandardDelay('action');
    }

    // 更新区域控制状态
    this.updateAreaControl();

    // 增加渗透等级
    enemyState.infiltrationLevel += 1;
    logs.push(`📈 渗透等级提升至 ${enemyState.infiltrationLevel}`);

    return { success: true, logs, canProceed: true };
  }

  // 分析战场并选择策略 - 增强版威胁评估
  private analyzeBattlefieldAndChooseStrategy(): { type: string; name: string; description: string } {
    if (!this.state) {
      return { type: 'balanced', name: '平衡策略', description: '均衡发展与攻击' };
    }

    const playerSecurity = this.state.playerState.securityLevel;
    const maxSecurity = this.state.playerState.maxSecurityLevel;
    const securityRatio = playerSecurity / maxSecurity;

    // 统计区域控制情况
    let playerControlledAreas = 0;
    let enemyControlledAreas = 0;
    let neutralAreas = 0;

    for (const area of ['internal', 'industrial', 'dmz', 'external'] as AreaType[]) {
      const controller = this.state.areaControl[area].controller;
      if (controller === 'player') playerControlledAreas++;
      else if (controller === 'enemy') enemyControlledAreas++;
      else neutralAreas++;
    }

    // 根据难度和战场情况选择策略
    let strategyType: string;
    let strategyName: string;
    let strategyDescription: string;

    switch (this.config.enemyDifficulty) {
      case 'easy':
        strategyType = 'balanced';
        strategyName = '平衡策略';
        strategyDescription = '基础均衡攻击';
        break;
        
      case 'medium':
        if (securityRatio < 0.5) {
          strategyType = 'aggressive';
          strategyName = '乘胜追击';
          strategyDescription = '玩家防御弱，加强攻击';
        } else if (neutralAreas > 1) {
          strategyType = 'control';
          strategyName = '区域扩张';
          strategyDescription = '优先占领中立区域';
        } else {
          strategyType = 'balanced';
          strategyName = '平衡策略';
          strategyDescription = '均衡发展攻击与控制';
        }
        break;
        
      case 'hard':
        if (securityRatio > 0.7 && playerControlledAreas > 2) {
          strategyType = 'aggressive';
          strategyName = '激进打击';
          strategyDescription = '集中火力攻击玩家弱点';
        } else if (enemyControlledAreas < 2 && neutralAreas > 1) {
          strategyType = 'control';
          strategyName = '区域控制';
          strategyDescription = '优先占领中立和弱势区域';
        } else if (this.state.enemyState.infiltrationLevel > 5 && securityRatio < 0.6) {
          strategyType = 'disrupt';
          strategyName = '深度干扰';
          strategyDescription = '使用技能干扰玩家关键行动';
        } else {
          strategyType = 'balanced';
          strategyName = '平衡策略';
          strategyDescription = '均衡发展攻击与控制';
        }
        break;
        
      default:
        strategyType = 'balanced';
        strategyName = '平衡策略';
        strategyDescription = '均衡发展与攻击';
    }

    return { type: strategyType, name: strategyName, description: strategyDescription };
  }

  // 执行激进策略
  private async executeAggressiveStrategy(logs: string[], _enemies: any[]): Promise<void> {
    if (!this.state) return;

    logs.push('🔥 执行激进打击策略');
    this.logOperation('enemy', 'action', '激进策略', '集中攻击玩家安全等级');

    // 优先攻击玩家安全等级
    const damage = 5 + Math.floor(Math.random() * 3);
    this.state.playerState.securityLevel = Math.max(0, this.state.playerState.securityLevel - damage);
    logs.push(`💥 对玩家造成 ${damage} 点安全等级伤害`);

    // 在玩家控制区域放置标记
    for (const area of ['internal', 'industrial', 'dmz', 'external'] as AreaType[]) {
      if (this.state.areaControl[area].controller === 'player') {
        this.state.areaControl[area].attackMarkers += 2;
        logs.push(`⚔️ 在 ${AREA_NAMES[area]} 放置2个攻击标记`);
        break; // 只攻击一个区域
      }
    }

    // 使用标准2秒延迟
    await this.enemyDelayManager.executeStandardDelay('action');
  }

  // 执行控制策略
  private async executeControlStrategy(logs: string[], _enemies: any[]): Promise<void> {
    if (!this.state) return;

    logs.push('🎯 执行区域控制策略');
    this.logOperation('enemy', 'action', '控制策略', '优先占领中立和弱势区域');

    // 找到中立或玩家控制但标记少的区域
    let targetArea: AreaType | null = null;
    let minMarkers = Infinity;

    for (const area of ['internal', 'industrial', 'dmz', 'external'] as AreaType[]) {
      const areaState = this.state.areaControl[area];
      if (areaState.controller !== 'enemy' && areaState.defenseMarkers < minMarkers) {
        minMarkers = areaState.defenseMarkers;
        targetArea = area;
      }
    }

    if (targetArea) {
      this.state.areaControl[targetArea].attackMarkers += 3;
      logs.push(`🏁 重点进攻 ${AREA_NAMES[targetArea]}，放置3个标记`);
      this.logOperation('enemy', 'action', '区域占领', `占领${AREA_NAMES[targetArea]}`);
    }

    // 使用标准2秒延迟
    await this.enemyDelayManager.executeStandardDelay('action');
  }

  // 执行干扰策略
  private async executeDisruptStrategy(logs: string[], enemies: any[]): Promise<void> {
    logs.push('⚡ 执行深度干扰策略');
    this.logOperation('enemy', 'action', '干扰策略', '使用技能干扰玩家');

    // 使用所有可用的技能
    for (const enemy of enemies) {
      if (enemy.skills) {
        for (const skill of enemy.skills) {
          if (skill.type === 'active' && (!skill.cooldown || skill.cooldown <= 0)) {
            logs.push(`✨ ${enemy.name} 使用 ${skill.name}`);
            this.logOperation('enemy', 'action', '技能干扰', skill.name);
            
            // 执行技能效果
            if (skill.effect.includes('标记')) {
              // 减少友方标记
              for (const area of ['internal', 'industrial', 'dmz', 'external'] as AreaType[]) {
                if (this.state && this.state.areaControl[area].defenseMarkers > 0) {
                  this.state.areaControl[area].defenseMarkers -= 1;
                  logs.push(`📉 ${AREA_NAMES[area]} 友方标记-1`);
                  break;
                }
              }
            }
            
            // 设置冷却
            skill.cooldown = skill.cooldown || 2;
            
            // 使用标准2秒延迟
            await this.enemyDelayManager.executeStandardDelay('action');
          }
        }
      }
    }
  }

  // 执行平衡策略
  private async executeBalancedStrategy(logs: string[], _enemies: any[]): Promise<void> {
    logs.push('⚖️ 执行平衡发展策略');
    this.logOperation('enemy', 'action', '平衡策略', '均衡攻击与发展');

    // 随机攻击一个区域
    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    const targetArea = areas[Math.floor(Math.random() * areas.length)];
    
    this.state!.areaControl[targetArea].attackMarkers += 1;
    logs.push(`⚔️ 在 ${AREA_NAMES[targetArea]} 放置1个标记`);

    // 轻微降低玩家安全等级
    this.state!.playerState.securityLevel -= 2;
    logs.push(`💥 玩家安全等级-2`);

    // 使用标准2秒延迟
    await this.enemyDelayManager.executeStandardDelay('action');
  }

  // 智能放置标记
  private async executeSmartMarkerPlacement(logs: string[]): Promise<void> {
    if (!this.state) return;

    // 分析哪个区域最值得放置标记
    const areaScores: { area: AreaType; score: number }[] = [];

    for (const area of ['internal', 'industrial', 'dmz', 'external'] as AreaType[]) {
      const areaState = this.state.areaControl[area];
      let score = 0;

      // 玩家控制区域优先级高
      if (areaState.controller === 'player') score += 3;
      // 中立区域次之
      else if (areaState.controller === 'neutral') score += 2;
      // 友方标记少的区域
      if (areaState.defenseMarkers < 2) score += 2;
      // 已有敌方标记的区域（集中攻击）
      if (areaState.attackMarkers > 0) score += 1;

      areaScores.push({ area, score });
    }

    // 按分数排序
    areaScores.sort((a, b) => b.score - a.score);

    // 在最高分的区域放置标记
    if (areaScores.length > 0 && areaScores[0].score > 0) {
      const bestArea = areaScores[0].area;
      this.state.areaControl[bestArea].attackMarkers += 1;
      logs.push(`🎯 智能放置：在 ${AREA_NAMES[bestArea]} 放置1个标记`);
      this.logOperation('enemy', 'action', '智能放置', `在${AREA_NAMES[bestArea]}放置标记`);
    }

    this.updateAreaControl();
  }

  // 判断是否使用技能
  private shouldUseAbility(ability: any, enemies: any[]): boolean {
    if (!this.state) return false;

    // 检查冷却
    const enemy = enemies.find(e => 
      e.skills?.some((s: any) => s.name === ability.name)
    );
    if (enemy) {
      const skill = enemy.skills.find((s: any) => s.name === ability.name);
      if (skill && skill.cooldown > 0) {
        return false;
      }
    }

    // 根据触发条件判断
    switch (ability.trigger) {
      case '每回合':
        return true;
      case '放置标记':
        return Math.random() > 0.5;
      case '累计5标记':
        return this.state.enemyState.infiltrationLevel >= 5;
      case '受攻击':
        return false; // 被动技能
      default:
        return Math.random() > 0.7;
    }
  }

  // 执行敌人攻击
  private executeEnemyAttack(intensity: 'low' | 'medium' | 'high', actionType: string): void {
    if (!this.state) return;

    const damageMap = { low: 2, medium: 4, high: 6 };
    const damage = damageMap[intensity];

    // 在随机区域放置敌方标记
    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    
    // 根据行动类型选择目标区域
    let targetArea: AreaType;
    let attackAnimation: 'slash' | 'blast' | 'infiltrate' = 'slash';
    let attackDescription = '';
    
    switch (actionType) {
      case 'floppy_infection':
        targetArea = 'internal'; // 软盘感染优先攻击内网
        attackAnimation = 'infiltrate';
        attackDescription = '通过受感染的软盘渗透内网系统';
        break;
      case 'social_engineering':
        targetArea = 'external'; // 社交工程优先攻击外网
        attackAnimation = 'blast';
        attackDescription = '利用社交工程手段获取访问权限';
        break;
      default:
        targetArea = areas[Math.floor(Math.random() * areas.length)];
        attackAnimation = intensity === 'high' ? 'blast' : 'slash';
        attackDescription = `发动${intensity === 'high' ? '强力' : intensity === 'medium' ? '中等' : '普通'}攻击`;
    }

    const markerCount = intensity === 'high' ? 2 : 1;
    
    // 构建攻击阶段信息
    const attackPhaseInfo: EnemyAttackPhaseInfo = {
      attackType: intensity === 'high' ? 'heavy' : intensity === 'medium' ? 'normal' : 'normal',
      damage: damage,
      targetArea: targetArea,
      attackAnimation: attackAnimation,
      description: attackDescription
    };
    
    // 发送攻击可视化更新
    this.sendVisualizationUpdate(
      'enemy',
      'action',
      'attacking',
      `发动攻击: ${attackDescription}`,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      attackPhaseInfo
    );

    // 降低玩家安全等级
    this.state.playerState.securityLevel = Math.max(
      0,
      this.state.playerState.securityLevel - damage
    );
    
    this.state.areaControl[targetArea].attackMarkers += markerCount;
    
    this.updateAreaControl();
  }

  // 执行敌人技能
  private executeEnemyAbility(ability: any): void {
    if (!this.state) return;

    // 确定技能效果类型
    let effectType: 'damage' | 'debuff' | 'control' | 'special' = 'special';
    let skillDescription = ability.description || ability.effect;
    let targetArea: AreaType | undefined;
    const effects: SkillEffect[] = [];
    
    // 根据技能效果确定类型和描述
    if (ability.effect.includes('标记') || ability.effect.includes('防御')) {
      effectType = 'control';
    } else if (ability.effect.includes('行动点') || ability.effect.includes('资源')) {
      effectType = 'debuff';
    } else if (ability.effect.includes('伤害') || ability.effect.includes('攻击')) {
      effectType = 'damage';
    }

    // 根据技能效果执行相应操作
    switch (ability.effect) {
      case '友方标记-1':
        // 减少友方标记
        const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
        targetArea = areas[Math.floor(Math.random() * areas.length)];
        this.state.areaControl[targetArea].defenseMarkers = Math.max(
          0,
          this.state.areaControl[targetArea].defenseMarkers - 1
        );
        skillDescription = `减少${AREA_NAMES[targetArea]}的防御标记`;
        effects.push({
          id: `effect_${Date.now()}`,
          type: 'area',
          target: 'ally',
          value: -1,
          description: `${AREA_NAMES[targetArea]}防御标记-1`
        });
        break;
      case '友方标记-2':
        // 减少2个友方标记
        const areas2: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
        targetArea = areas2[Math.floor(Math.random() * areas.length)];
        this.state.areaControl[targetArea].defenseMarkers = Math.max(
          0,
          this.state.areaControl[targetArea].defenseMarkers - 2
        );
        skillDescription = `大幅减少${AREA_NAMES[targetArea]}的防御标记`;
        effects.push({
          id: `effect_${Date.now()}_1`,
          type: 'area',
          target: 'ally',
          value: -2,
          description: `${AREA_NAMES[targetArea]}防御标记-2`
        });
        break;
      case '行动点-1':
        // 减少玩家行动点（下一回合）
        this.state.playerState.maxActionPoints = Math.max(
          1,
          this.state.playerState.maxActionPoints - 1
        );
        skillDescription = '干扰玩家行动，下回合行动点-1';
        effects.push({
          id: `effect_${Date.now()}`,
          type: 'resource',
          target: 'enemy',
          value: -1,
          description: '下回合行动点-1'
        });
        break;
      case '行动点-2':
        // 减少2点行动点
        this.state.playerState.maxActionPoints = Math.max(
          1,
          this.state.playerState.maxActionPoints - 2
        );
        skillDescription = '严重干扰玩家行动';
        effects.push({
          id: `effect_${Date.now()}`,
          type: 'resource',
          target: 'enemy',
          value: -2,
          description: '下回合行动点-2'
        });
        break;
      default:
        // 默认效果处理
        if (ability.effect.includes('标记')) {
          effects.push({
            id: `effect_${Date.now()}`,
            type: 'area',
            target: 'ally',
            description: ability.effect
          });
        } else if (ability.effect.includes('行动点')) {
          effects.push({
            id: `effect_${Date.now()}`,
            type: 'resource',
            target: 'enemy',
            description: ability.effect
          });
        } else {
          effects.push({
            id: `effect_${Date.now()}`,
            type: 'status',
            target: 'enemy',
            description: ability.effect
          });
        }
    }

    // 获取技能视觉特效名称
    const skillVisualizationName = ENEMY_SKILL_NAME_MAP[ability.name] || '普通攻击';
    
    // 确定威胁等级
    let intensity: 'low' | 'medium' | 'high' = 'medium';
    if (ability.effect.includes('-2') || ability.effect.includes('瘫痪') || ability.effect.includes('失控')) {
      intensity = 'high';
    } else if (ability.effect.includes('-1') || ability.effect.includes('减少')) {
      intensity = 'medium';
    } else {
      intensity = 'low';
    }

    // 构建技能阶段信息
    const skillPhaseInfo: EnemySkillPhaseInfo = {
      skillName: ability.name,
      skillDescription: skillDescription,
      targetArea: targetArea,
      effectType: effectType,
      cooldown: ability.cooldown || 0
    };
    
    // 构建技能可视化信息
    const skillVisualization = {
      skillName: skillVisualizationName,
      skillDescription: skillDescription,
      targetArea: targetArea ? AREA_NAMES[targetArea] : undefined,
      intensity,
      effects
    };
    
    // 发送技能可视化更新
    this.sendVisualizationUpdate(
      'enemy',
      'action',
      'using_skill',
      `使用技能: ${ability.name}`,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      skillPhaseInfo,
      skillVisualization
    );

    this.updateAreaControl();
  }

  // 敌人AI响应阶段
  private async executeEnemyResponsePhase(): Promise<LevelPhaseResult> {
    const logs: string[] = [`⏱️ ${LEVEL_PHASE_NAMES['response']}`];
    
    this.logOperation('enemy', 'response', '检查响应', '敌人检查玩家行动');
    
    // 使用标准2秒延迟
    await this.enemyDelayManager.executeStandardDelay('response');
    
    // 检查响应事件
    const unresolvedEvents = this.state?.responseEvents.filter(e => !e.responded) || [];
    if (unresolvedEvents.length > 0) {
      logs.push(`⏱️ 敌人需要响应 ${unresolvedEvents.length} 个事件`);
      // 敌人AI自动响应（简化版）
      unresolvedEvents.forEach(event => {
        event.responded = true;
        logs.push(`👾 敌人自动响应：${event.description}`);
        this.logOperation('enemy', 'response', '响应事件', event.description);
      });
      
      // 构建响应阶段信息并发送
      const responsePhaseInfo: any = {
        events: unresolvedEvents.map(e => ({
          id: e.id,
          description: e.description,
          responded: true
        })),
        message: `敌人已响应 ${unresolvedEvents.length} 个事件`
      };
      
      this.sendVisualizationUpdate(
        'enemy',
        'response',
        'responding',
        `敌人已响应 ${unresolvedEvents.length} 个事件`,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        responsePhaseInfo
      );
    } else {
      logs.push('⏱️ 敌人观察玩家行动');
      logs.push('✓ 响应检查完成');
      
      // 即使没有事件也发送响应阶段信息
      const responsePhaseInfo: any = {
        events: [],
        message: '无需要响应的事件'
      };
      
      this.sendVisualizationUpdate(
        'enemy',
        'response',
        'response_complete',
        '无需要响应的事件',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        responsePhaseInfo
      );
    }

    return { success: true, logs, canProceed: true };
  }

  // 敌人AI弃牌阶段（完全匹配PvP标准）
  private async executeEnemyDiscardPhase(): Promise<LevelPhaseResult> {
    const logs: string[] = [`🗑️ ${LEVEL_PHASE_NAMES['discard']}`];
    
    if (!this.state) {
      return { success: false, logs, canProceed: false };
    }
    
    // 使用标准2秒延迟
    await this.enemyDelayManager.executeStandardDelay('discard');
    
    // 1. 计算手牌上限（完全匹配PvP标准）
    // R4.3: 手牌上限基于轮次（round）而非回合（turn）
    // 24轮次制：1-4轮次1张，5-8轮次3张，9-16轮次4张，17-24轮次5张
    const currentRound = this.state.round;
    const handLimit = getHandLimitByRound(currentRound);
    
    let handLimitRange: string;
    if (currentRound <= 4) {
      handLimitRange = '1-4轮次';
    } else if (currentRound <= 8) {
      handLimitRange = '5-8轮次';
    } else if (currentRound <= 16) {
      handLimitRange = '9-16轮次';
    } else {
      handLimitRange = '17-24轮次';
    }
    
    logs.push(`📋 手牌上限: ${handLimit}张 (${handLimitRange})`);
    
    this.logOperation('enemy', 'discard', '整理资源', '敌人整理攻击资源');
    
    logs.push('🗑️ 敌人整理攻击资源');
    logs.push('✓ 整理完成');
    
    // 构建一个模拟的手牌状态（敌人没有实际手牌，只是模拟）
    const handState: HandState = {
      count: 3,
      typeDistribution: {
        '攻击': 1,
        '策略': 1,
        '特殊': 1
      }
    };
    this.sendVisualizationUpdate(
      'enemy',
      'discard',
      'discard_complete',
      '整理完成',
      undefined,
      handState
    );

    return { success: true, logs, canProceed: true };
  }

  // 敌人AI结束阶段
  private async executeEnemyEndPhase(): Promise<LevelPhaseResult> {
    const logs: string[] = [`🏁 ${LEVEL_PHASE_NAMES['end']}`];
    
    this.logOperation('enemy', 'end', '结束回合', '敌人结束回合，准备下一回合');
    
    // 使用标准2秒延迟
    await this.enemyDelayManager.executeStandardDelay('end');
    
    logs.push('🏁 清除敌人临时效果');
    logs.push('✓ 敌人回合结束');

    return { success: true, logs, canProceed: true };
  }

  // ============================================
  // 辅助方法
  // ============================================

  // 选择敌人放置标记的目标区域
  private selectTargetAreaForMarker(): AreaType | null {
    if (!this.state) return null;

    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    
    // 优先选择友方标记最少的区域
    let bestArea: AreaType | null = null;
    let minDefenseMarkers = Infinity;
    
    for (const area of areas) {
      const areaState = this.state.areaControl[area];
      if (areaState.defenseMarkers < minDefenseMarkers) {
        minDefenseMarkers = areaState.defenseMarkers;
        bestArea = area;
      }
    }
    
    return bestArea;
  }

  // 更新区域控制状态
  private updateAreaControl(): void {
    if (!this.state) return;

    const areas: AreaType[] = ['internal', 'industrial', 'dmz', 'external'];
    
    for (const area of areas) {
      const areaState = this.state.areaControl[area];
      
      if (areaState.attackMarkers > areaState.defenseMarkers) {
        areaState.controller = 'enemy';
      } else if (areaState.defenseMarkers > areaState.attackMarkers) {
        areaState.controller = 'player';
      } else {
        areaState.controller = 'neutral';
      }
    }

    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
  }

  // 记录操作日志
  private logOperation(actor: 'dadong' | 'enemy', phase: LevelTurnPhase, action: string, description: string): void {
    const log: AIOperationLog = {
      timestamp: Date.now(),
      actor,
      phase,
      action,
      description
    };

    this.operationLogs.push(log);
    
    // 同时记录到游戏状态中，以便界面显示
    if (this.state) {
      if (!this.state.aiOperationLogs) {
        this.state.aiOperationLogs = [];
      }
      this.state.aiOperationLogs.push(log);
      // 限制日志数量，只保留最近50条
      if (this.state.aiOperationLogs.length > 50) {
        this.state.aiOperationLogs = this.state.aiOperationLogs.slice(-50);
      }
    }

    if (this.onOperationLog) {
      this.onOperationLog(log);
    }
  }

  // 获取操作日志
  getOperationLogs(): AIOperationLog[] {
    return [...this.operationLogs];
  }

  // 清除日志
  clearLogs(): void {
    this.operationLogs = [];
  }

  // 获取延迟管理器（用于外部访问）
  getDadongDelayManager(): AIDecisionDelayManager {
    return this.dadongDelayManager;
  }

  getEnemyDelayManager(): AIDecisionDelayManager {
    return this.enemyDelayManager;
  }

  // 更新难度配置
  updateDifficulty(dadongDifficulty?: 'easy' | 'medium' | 'hard', enemyDifficulty?: 'easy' | 'medium' | 'hard'): void {
    if (dadongDifficulty) {
      this.config.dadongDifficulty = dadongDifficulty;
      this.dadongDelayManager.setDifficulty(dadongDifficulty);
    }
    if (enemyDifficulty) {
      this.config.enemyDifficulty = enemyDifficulty;
      this.enemyDelayManager.setDifficulty(enemyDifficulty);
    }
  }
}

export default LevelAIController;
