import { useState, useCallback, useEffect, useRef } from 'react';
import { GameLobby, type GameConfig } from '@/components/GameLobby';
import { GameRoom } from '@/components/GameRoom';
import { GameInterface } from '@/components/GameInterface';
import { VictoryModal } from '@/components/game/VictoryModal';
import { 
  LevelSelection, 
  LevelGameInterface, 
  LevelCompleteModal 
} from '@/components/level';
import { Toaster, toast } from '@/components/ui/sonner';
import type { Faction, Player, GameState, TurnPhase, GameLogEntry } from '@/types/gameRules';
import type { CharacterId } from '@/types/characterRules';
import type { LevelId, LevelGameState, LevelCompletionResult, AreaType } from '@/types/levelTypes';
import { GameStateManager } from '@/engine/GameStateManager_v2';
import { GameLoop } from '@/engine/GameLoop';
import { TurnPhaseSystem } from '@/engine/TurnPhaseSystem';
import { LevelGameStateManager } from '@/engine/LevelGameStateManager';
import { getHandLimitByRound } from '@/types/gameConstants';
import type { VictoryResult } from '@/engine/VictoryConditionSystem';
import './styles/theme.css';

type AppScreen = 'lobby' | 'room' | 'game' | 'levelSelection' | 'levelGame';

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('lobby');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameStateManager] = useState(() => new GameStateManager());
  const gameLoopRef = useRef<GameLoop | null>(null);
  const [currentPhase, setCurrentPhase] = useState<TurnPhase>('judgment');
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const [phaseTotalTime, setPhaseTotalTime] = useState(0);
  const [gameLogs, setGameLogs] = useState<string[]>([]);
  const [hostPlayer, setHostPlayer] = useState<{ 
    name: string; 
    faction: Faction;
    characterId: CharacterId;
  } | null>(null);
  const [victoryResult, setVictoryResult] = useState<VictoryResult | null>(null);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  const [levelGameStateManager] = useState(() => new LevelGameStateManager());
  const [levelGameState, setLevelGameState] = useState<LevelGameState | null>(null);
  const [levelCompletionResult, setLevelCompletionResult] = useState<LevelCompletionResult | null>(null);
  const [showLevelCompleteModal, setShowLevelCompleteModal] = useState(false);
  const [currentLevelId, setCurrentLevelId] = useState<LevelId | null>(null);

  // 更新游戏状态
  const updateGameState = useCallback((newState: GameState) => {
    setGameState(newState);
    setCurrentPhase(newState.currentPhase);
  }, []);

  // 添加游戏日志
  const addGameLog = useCallback((log: string) => {
    setGameLogs(prev => [...prev, log]);
  }, []);

  // 快速开始游戏（1v1模式）
  const handleStartGame = useCallback((config: GameConfig) => {
    // 初始化游戏
    const initialState = gameStateManager.initGame({
      gameId: `game_${Date.now()}`,
      players: [
        {
          id: 'p1',
          name: config.playerName,
          faction: config.faction,
          characterId: config.characterId || 'AR01',
          isAI: false,
        },
        {
          id: 'p2',
          name: 'AI对手',
          faction: config.faction === 'attacker' ? 'defender' : 'attacker',
          characterId: config.faction === 'attacker' ? 'DR01' : 'AR01',
          isAI: true,
          aiDifficulty: config.aiDifficulty || 'medium',
        }
      ]
    });

    // 设置状态变更回调
    gameStateManager.setOnStateChange((state) => {
      updateGameState(state);
    });

    // 初始化游戏循环
    const gameLoop = new GameLoop({
      gameStateManager,
      onStateChange: (state) => {
        updateGameState(state);
      },
      onPhaseChange: (phase: TurnPhase) => {
        setCurrentPhase(phase);
        const currentState = gameStateManager.getGameState();
        if (currentState) {
          addGameLog(`=== 第${currentState.round}轮次 - ${TurnPhaseSystem.getPhaseName(phase)} ===`);
        }
      },
      onTimerUpdate: (remaining: number, total: number) => {
        setPhaseTimeLeft(remaining);
        setPhaseTotalTime(total);
      },
      onVictory: (result) => {
        addGameLog(`🎉 游戏结束！${result.winner} 获胜 - ${result.victoryType}`);
        setVictoryResult(result);
        setShowVictoryModal(true);
      },
      onError: (error: string) => {
        addGameLog(`❌ 错误: ${error}`);
      },
    });

    gameLoopRef.current = gameLoop;
    
    // 启动游戏循环
    gameLoop.start();
    
    updateGameState(initialState);
    setCurrentScreen('game');
  }, [gameStateManager, updateGameState, addGameLog]);

  // 进入房间
  const handleEnterRoom = useCallback((player: { name: string; faction: Faction; characterId: CharacterId }) => {
    setHostPlayer(player);
    setCurrentScreen('room');
  }, []);

  // 房间开始游戏
  const handleRoomStartGame = useCallback((players: Player[]) => {
    // 转换玩家配置
    const playerConfigs = players.map(p => ({
      id: p.id,
      name: p.name,
      faction: p.faction,
      characterId: p.characterId as CharacterId,
      isAI: p.isAI,
      aiDifficulty: p.aiDifficulty,
    }));

    // 初始化游戏
    const initialState = gameStateManager.initGame({
      gameId: `game_${Date.now()}`,
      players: playerConfigs,
    });

    // 设置状态变更回调
    gameStateManager.setOnStateChange((state) => {
      updateGameState(state);
    });

    // 初始化游戏循环
    const gameLoop = new GameLoop({
      gameStateManager,
      onStateChange: (state) => {
        updateGameState(state);
      },
      onPhaseChange: (phase: TurnPhase) => {
        setCurrentPhase(phase);
        const currentState = gameStateManager.getGameState();
        if (currentState) {
          addGameLog(`=== 第${currentState.round}轮次 - ${TurnPhaseSystem.getPhaseName(phase)} ===`);
        }
      },
      onTimerUpdate: (remaining: number, total: number) => {
        setPhaseTimeLeft(remaining);
        setPhaseTotalTime(total);
      },
      onVictory: (result) => {
        addGameLog(`🎉 游戏结束！${result.winner} 获胜 - ${result.victoryType}`);
        setVictoryResult(result);
        setShowVictoryModal(true);
      },
      onError: (error: string) => {
        addGameLog(`❌ 错误: ${error}`);
      },
    });

    gameLoopRef.current = gameLoop;
    
    // 启动游戏循环
    gameLoop.start();
    
    updateGameState(initialState);
    setCurrentScreen('game');
  }, [gameStateManager, updateGameState, addGameLog]);

  // 取消房间
  const handleRoomCancel = useCallback(() => {
    setHostPlayer(null);
    setCurrentScreen('lobby');
  }, []);

  // 出牌处理
  const handlePlayCard = useCallback((cardIndex: number) => {
    if (!gameState) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer) return;
    
    // 检查是否在行动阶段
    if (gameState.currentPhase !== 'action') {
      addGameLog('❌ 只能在行动阶段出牌');
      return;
    }
    
    // 检查是否有剩余行动点
    if (currentPlayer.remainingActions <= 0) {
      addGameLog('❌ 没有剩余行动点');
      return;
    }
    
    // 执行出牌
    const success = gameStateManager.playCard(currentPlayer.id, cardIndex);
    
    if (success) {
      addGameLog(`✅ ${currentPlayer.name} 打出了一张卡牌`);
      // 通知游戏循环出牌成功（用于延长计时器）
      gameLoopRef.current?.notifyCardPlayed();
    } else {
      addGameLog('❌ 出牌失败');
    }
  }, [gameState, gameStateManager, addGameLog]);

  // 结束回合
  const handleEndTurn = useCallback(() => {
    if (!gameState) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer) return;
    
    // 检查是否在行动阶段
    if (gameState.currentPhase !== 'action') {
      addGameLog('❌ 只能在行动阶段结束回合');
      return;
    }
    
    addGameLog(`${currentPlayer.name} 结束回合`);
    
    // 手动推进到下一阶段
    gameLoopRef.current?.advancePhase();
  }, [gameState, addGameLog]);

  // 弃牌处理
  const handleDiscardCard = useCallback((cardIndex: number) => {
    if (!gameState) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer) return;
    
    // 检查是否在弃牌阶段
    if (gameState.currentPhase !== 'discard') {
      addGameLog('❌ 只能在弃牌阶段弃牌');
      return;
    }
    
    // 执行弃牌
    const success = gameStateManager.discardCard(currentPlayer.id, cardIndex);
    
    if (success) {
      addGameLog(`${currentPlayer.name} 弃置了一张卡牌`);
      
      // 检查是否还需要继续弃牌
      // 根据轮次获取手牌上限（R4.3: 1-4轮次3张，5-8轮次4张，9-12轮次5张）
      const handLimit = getHandLimitByRound(gameState.round);
      const currentHandSize = currentPlayer.hand.length - 1; // 已经弃掉一张
      
      if (currentHandSize <= handLimit) {
        addGameLog('✅ 弃牌完成，进入下一阶段');
        // 延迟后自动推进到下一阶段
        setTimeout(() => {
          gameLoopRef.current?.advancePhase();
        }, 500);
      }
    } else {
      addGameLog('❌ 弃牌失败');
    }
  }, [gameState, gameStateManager, addGameLog]);

  // 结束弃牌阶段
  const handleEndDiscard = useCallback(() => {
    if (!gameState) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer) return;
    
    // 检查是否在弃牌阶段
    if (gameState.currentPhase !== 'discard') {
      addGameLog('❌ 只能在弃牌阶段结束弃牌');
      return;
    }
    
    // 检查手牌是否<=上限
    const handLimit = getHandLimitByRound(
      gameState.round,
      currentPlayer.individualModifiers.handLimitOffset,
      currentPlayer.individualModifiers.handLimitTempOffset
    );
    
    if (currentPlayer.hand.length > handLimit) {
      addGameLog(`❌ 手牌数(${currentPlayer.hand.length})超过上限(${handLimit})，无法结束弃牌`);
      return;
    }
    
    addGameLog('✅ 弃牌完成，进入下一阶段');
    gameLoopRef.current?.advancePhase();
  }, [gameState, addGameLog]);

  const handleStartLevelGame = useCallback((levelId: LevelId) => {
    console.log('[App] handleStartLevelGame called for level:', levelId);
    setCurrentLevelId(levelId);
    
    console.log('[App] setting up callbacks');
    levelGameStateManager.setOnStateChange((state) => {
      console.log('[App] onStateChange callback called, phase:', state.currentPhase, 'turn:', state.currentTurn);
      setLevelGameState(state);
    });
    levelGameStateManager.setOnLevelComplete((result) => {
      setLevelCompletionResult(result);
      setShowLevelCompleteModal(true);
    });
    levelGameStateManager.setOnGameOver(() => {
      toast.error('游戏结束！安全等级降为0，请重新挑战。', {
        duration: 3000,
        position: 'top-center'
      });
      setCurrentScreen('levelSelection');
    });
    
    console.log('[App] calling startLevel');
    const initialState = levelGameStateManager.startLevel(levelId);
    console.log('[App] startLevel completed, setting initial state');
    setLevelGameState(initialState);
    setCurrentScreen('levelGame');
  }, [levelGameStateManager]);

  const handleLevelPlayCard = useCallback((cardIndex: number): boolean | 'needs_area_selection' | 'needs_advance_to_response' => {
    return levelGameStateManager.playCard(cardIndex);
  }, [levelGameStateManager]);

  const handleLevelPlayCardWithArea = useCallback((cardIndex: number, area: AreaType): boolean | 'needs_advance_to_response' => {
    return levelGameStateManager.playCardWithAreaSelection(area);
  }, [levelGameStateManager]);

  const handleLevelEndTurn = useCallback(() => {
    // 玩家点击"结束行动"，应该推进到响应阶段
    // 而不是直接调用endTurn（那样会跳过响应、弃牌、结束阶段）
    levelGameStateManager.advancePhase();
  }, [levelGameStateManager]);

  const handleLevelDiscardCard = useCallback((cardIndex: number) => {
    levelGameStateManager.discardCard(cardIndex);
  }, [levelGameStateManager]);

  const handleLevelEndDiscard = useCallback(async () => {
    const result = levelGameStateManager.endDiscardPhase();
    if (result.canProceed) {
      await levelGameStateManager.advancePhase();
    }
  }, [levelGameStateManager]);

  const handleLevelAdvancePhase = useCallback(async () => {
    console.log('[App] handleLevelAdvancePhase called');
    await levelGameStateManager.advancePhase();
  }, [levelGameStateManager]);

  const handleLevelJudgmentComplete = useCallback((judgmentId: string, resultData: any) => {
    console.log('[App] handleLevelJudgmentComplete called:', judgmentId, resultData);
    levelGameStateManager.resolveJudgmentWithResult(judgmentId, resultData);
  }, [levelGameStateManager]);

  const handleExitLevel = useCallback(() => {
    setLevelGameState(null);
    setCurrentLevelId(null);
    setCurrentScreen('levelSelection');
  }, []);

  const handleNextLevel = useCallback(() => {
    if (levelCompletionResult?.nextLevel) {
      setShowLevelCompleteModal(false);
      setLevelCompletionResult(null);
      handleStartLevelGame(levelCompletionResult.nextLevel);
    }
  }, [levelCompletionResult, handleStartLevelGame]);

  const handleBackToLevelSelection = useCallback(() => {
    setShowLevelCompleteModal(false);
    setLevelCompletionResult(null);
    setLevelGameState(null);
    setCurrentLevelId(null);
    setCurrentScreen('levelSelection');
  }, []);

  const handleRetryLevel = useCallback(() => {
    if (currentLevelId) {
      setShowLevelCompleteModal(false);
      setLevelCompletionResult(null);
      handleStartLevelGame(currentLevelId);
    }
  }, [currentLevelId, handleStartLevelGame]);

  // 清理游戏循环和事件监听器
  useEffect(() => {
    // 监听资源不足事件
    const handleResourceInsufficient = (event: CustomEvent) => {
      const { required, available } = event.detail;
      
      // 构建资源不足的消息
      const missingResources = [];
      if (required.compute > available.compute) {
        missingResources.push(`算力: ${available.compute}/${required.compute}`);
      }
      if (required.funds > available.funds) {
        missingResources.push(`资金: ${available.funds}/${required.funds}`);
      }
      if (required.information > available.information) {
        missingResources.push(`信息: ${available.information}/${required.information}`);
      }
      if (required.permission > available.permission) {
        missingResources.push(`权限: ${available.permission}/${required.permission}`);
      }
      
      // 显示资源不足提示
      toast.error(
        `资源不足，无法出牌\n缺少: ${missingResources.join(', ')}`,
        {
          duration: 3000,
          position: 'top-center'
        }
      );
    };
    
    // 添加事件监听器
    if (typeof window !== 'undefined') {
      window.addEventListener('resourceInsufficient', handleResourceInsufficient as EventListener);
    }
    
    return () => {
      // 清理事件监听器
      if (typeof window !== 'undefined') {
        window.removeEventListener('resourceInsufficient', handleResourceInsufficient as EventListener);
      }
      
      // 清理游戏循环
      if (gameLoopRef.current) {
        gameLoopRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-deep-space)' }}>
      {currentScreen === 'lobby' && (
        <GameLobby 
          onStartGame={handleStartGame}
          onEnterRoom={handleEnterRoom}
          onEnterLevelMode={() => setCurrentScreen('levelSelection')}
        />
      )}
      
      {currentScreen === 'room' && hostPlayer && (
        <GameRoom
          hostPlayer={hostPlayer}
          onStartGame={handleRoomStartGame}
          onCancel={handleRoomCancel}
        />
      )}
      
      {currentScreen === 'game' && gameState && gameState.players.length > 0 && (
        <GameInterface 
          gameState={gameState}
          currentPlayer={gameState.players[gameState.currentPlayerIndex]}
          currentPhase={currentPhase}
          phaseTimeLeft={phaseTimeLeft}
          phaseTotalTime={phaseTotalTime}
          gameLogs={gameLogs}
          onPlayCard={handlePlayCard}
          onEndTurn={handleEndTurn}
          onDiscardCard={handleDiscardCard}
          onEndDiscard={handleEndDiscard}
          isPlayerTurn={!gameState.players[gameState.currentPlayerIndex]?.isAI}
        />
      )}

      {currentScreen === 'levelSelection' && (
        <LevelSelection
          onStartLevel={handleStartLevelGame}
          onBack={() => setCurrentScreen('lobby')}
        />
      )}

      {currentScreen === 'levelGame' && levelGameState && (
        <LevelGameInterface
          gameState={levelGameState}
          onPlayCard={handleLevelPlayCard}
          onPlayCardWithArea={handleLevelPlayCardWithArea}
          onEndTurn={handleLevelEndTurn}
          onDiscardCard={handleLevelDiscardCard}
          onEndDiscard={handleLevelEndDiscard}
          onAdvancePhase={handleLevelAdvancePhase}
          onExit={handleExitLevel}
          getCardAreaSelectionInfo={levelGameStateManager.getCardAreaSelectionInfo.bind(levelGameStateManager)}
          onJudgmentComplete={handleLevelJudgmentComplete}
        />
      )}
      
      <VictoryModal
        victoryResult={victoryResult}
        isOpen={showVictoryModal}
        onClose={() => setShowVictoryModal(false)}
        onBackToLobby={() => {
          setShowVictoryModal(false);
          setVictoryResult(null);
          setGameState(null);
          setGameLogs([]);
          setCurrentScreen('lobby');
          if (gameLoopRef.current) {
            gameLoopRef.current.stop();
            gameLoopRef.current = null;
          }
        }}
        gameLogs={gameState?.log || []}
        totalRounds={gameState?.round || 0}
      />

      {levelCompletionResult && (
        <LevelCompleteModal
          result={levelCompletionResult}
          isOpen={showLevelCompleteModal}
          onClose={() => setShowLevelCompleteModal(false)}
          onNextLevel={handleNextLevel}
          onBackToMenu={handleBackToLevelSelection}
          onRetry={handleRetryLevel}
        />
      )}
      
      <Toaster />
    </div>
  );
}

export default App;
