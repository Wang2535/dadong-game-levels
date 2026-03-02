import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lock, CheckCircle, Play, Star, ArrowLeft, RotateCcw } from 'lucide-react';
import type { LevelDefinition, LevelId, LevelProgress } from '@/types/levelTypes';
import { LEVEL_DATABASE, LEVEL_ORDER, getAllLevels } from '@/data/levelDatabase';
import { TUTORIAL_FOCUS_NAMES } from '@/types/levelTypes';

interface LevelSelectionProps {
  onStartLevel: (levelId: LevelId) => void;
  onBack: () => void;
}

export function LevelSelection({ onStartLevel, onBack }: LevelSelectionProps) {
  const [progress, setProgress] = useState<Record<LevelId, LevelProgress>>({} as Record<LevelId, LevelProgress>);
  const [selectedLevel, setSelectedLevel] = useState<LevelDefinition | null>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = () => {
    const stored = localStorage.getItem('level_progress');
    if (stored) {
      try {
        setProgress(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load progress:', e);
      }
    } else {
      const initialProgress: Record<LevelId, LevelProgress> = {} as Record<LevelId, LevelProgress>;
      LEVEL_ORDER.forEach((levelId, index) => {
        initialProgress[levelId] = {
          levelId,
          status: index === 0 ? 'available' : 'locked',
          completedObjectives: [],
          attempts: 0
        };
      });
      setProgress(initialProgress);
    }
  };

  const handleResetProgress = () => {
    if (confirm('确定要重置所有关卡进度吗？此操作不可撤销。')) {
      localStorage.removeItem('level_progress');
      loadProgress();
      setSelectedLevel(null);
    }
  };

  const getDifficultyStars = (difficulty: number) => {
    return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

  const getDifficultyColor = (difficulty: number) => {
    const colors = ['text-green-400', 'text-green-500', 'text-yellow-400', 'text-orange-400', 'text-red-400'];
    return colors[difficulty - 1] || colors[0];
  };

  const getStatusBadge = (status: LevelProgress['status']) => {
    switch (status) {
      case 'locked':
        return <Badge variant="secondary" className="bg-gray-600"><Lock className="w-3 h-3 mr-1" />未解锁</Badge>;
      case 'available':
        return <Badge variant="secondary" className="bg-blue-500"><Play className="w-3 h-3 mr-1" />可挑战</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-yellow-500">进行中</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />已通关</Badge>;
      case 'mastered':
        return <Badge variant="secondary" className="bg-purple-500"><Star className="w-3 h-3 mr-1" />已精通</Badge>;
      default:
        return null;
    }
  };

  const levels = getAllLevels();

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="text-gray-300 hover:text-white">
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回主菜单
            </Button>
            <h1 className="text-3xl font-bold text-white">关卡模式</h1>
          </div>
          <Button variant="outline" onClick={handleResetProgress} className="text-gray-400 border-gray-600 hover:text-white">
            <RotateCcw className="w-4 h-4 mr-2" />
            重置进度
          </Button>
        </div>

        <div className="mb-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-2">新手教程关卡</h2>
          <p className="text-gray-400 text-sm">
            完成这9个关卡，学习网络安全基础知识。每关通关后可阅读相关文章，深入了解网络安全世界。
          </p>
          <div className="mt-3 flex items-center gap-4">
            <span className="text-sm text-gray-400">
              已通关: {Object.values(progress).filter(p => p.status === 'completed' || p.status === 'mastered').length} / {LEVEL_ORDER.length}
            </span>
            <Progress 
              value={(Object.values(progress).filter(p => p.status === 'completed' || p.status === 'mastered').length / LEVEL_ORDER.length) * 100}
              className="w-48 h-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {levels.map((level, index) => {
            const levelProgress = progress[level.id];
            const isLocked = !levelProgress || levelProgress.status === 'locked';
            const isCompleted = levelProgress?.status === 'completed' || levelProgress?.status === 'mastered';

            return (
              <Card
                key={level.id}
                className={`
                  relative overflow-hidden transition-all duration-300 cursor-pointer
                  ${isLocked 
                    ? 'bg-slate-900/50 border-slate-700 opacity-60' 
                    : 'bg-slate-800/80 border-slate-600 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20'
                  }
                  ${selectedLevel?.id === level.id ? 'ring-2 ring-blue-500' : ''}
                `}
                onClick={() => !isLocked && setSelectedLevel(level)}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
                
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">第 {index + 1} 关</span>
                    {getStatusBadge(levelProgress?.status || 'locked')}
                  </div>
                  <CardTitle className="text-lg text-white mt-1">{level.name}</CardTitle>
                  <CardDescription className="text-gray-400">{level.subtitle}</CardDescription>
                </CardHeader>

                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">难度</span>
                      <span className={getDifficultyColor(level.difficulty)}>
                        {getDifficultyStars(level.difficulty)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">教程重点</span>
                      <span className="text-blue-400">{TUTORIAL_FOCUS_NAMES[level.tutorialFocus]}</span>
                    </div>
                    {isCompleted && levelProgress?.bestScore && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">最高分</span>
                        <span className="text-yellow-400 font-semibold">{levelProgress.bestScore}</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pt-2">
                  <Button
                    className="w-full"
                    variant={isLocked ? 'secondary' : 'default'}
                    disabled={isLocked}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isLocked) {
                        onStartLevel(level.id);
                      }
                    }}
                  >
                    {isLocked ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        未解锁
                      </>
                    ) : isCompleted ? (
                      <>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        再次挑战
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        开始挑战
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {selectedLevel && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">{selectedLevel.name}</CardTitle>
                <CardDescription className="text-gray-400">{selectedLevel.articleTitle}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">关卡目标</h4>
                  <ul className="space-y-1">
                    {selectedLevel.objectives.map((obj) => (
                      <li key={obj.id} className="text-sm text-gray-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        {obj.description}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">敌人信息</h4>
                  <div className="text-sm text-gray-400">
                    <p>敌人: {selectedLevel.enemyConfig.name}</p>
                    <p>类型: {selectedLevel.enemyConfig.type}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">提示</h4>
                  <ul className="space-y-1">
                    {selectedLevel.hints.map((hint, i) => (
                      <li key={i} className="text-sm text-gray-400">• {hint}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedLevel(null)} className="flex-1">
                  取消
                </Button>
                <Button onClick={() => onStartLevel(selectedLevel.id)} className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  开始挑战
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default LevelSelection;
