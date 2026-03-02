/**
 * 技能详情面板组件
 * 
 * 功能：
 * 1. 右键点击角色时显示技能详情
 * 2. 展示角色所有技能信息
 * 3. 点击空白区域或再次右键关闭
 */

import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { X, Zap, Shield, Clock, AlertCircle } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  description: string;
  type: 'active' | 'passive' | 'trigger';
  cooldown?: number;
  currentCooldown?: number;
  effect: string;
}

interface SkillDetailPanelProps {
  isOpen: boolean;
  characterName: string;
  characterTitle?: string;
  characterType: 'player' | 'dadong' | 'enemy';
  skills: Skill[];
  position: { x: number; y: number };
  onClose: () => void;
}

export function SkillDetailPanel({
  isOpen,
  characterName,
  characterTitle,
  characterType,
  skills,
  position,
  onClose
}: SkillDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // 右键点击关闭
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('contextmenu', handleContextMenu);
    }

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'active':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'passive':
        return <Shield className="w-4 h-4 text-blue-400" />;
      case 'trigger':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Zap className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'active':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'passive':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'trigger':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  const getCharacterColor = () => {
    switch (characterType) {
      case 'player':
        return 'border-blue-500 bg-blue-900/20';
      case 'dadong':
        return 'border-green-500 bg-green-900/20';
      case 'enemy':
        return 'border-red-500 bg-red-900/20';
      default:
        return 'border-gray-500 bg-gray-900/20';
    }
  };

  // 计算面板位置，确保不超出屏幕
  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(position.x, window.innerWidth - 320),
    top: Math.min(position.y, window.innerHeight - 400),
    zIndex: 1000,
  };

  return (
    <div style={panelStyle} ref={panelRef}>
      <Card className={cn(
        'w-80 border-2 shadow-2xl',
        getCharacterColor()
      )}>
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <h3 className="text-lg font-bold text-white">{characterName}</h3>
            {characterTitle && (
              <p className="text-xs text-slate-400">{characterTitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* 技能列表 */}
        <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
          {skills.length === 0 ? (
            <div className="text-center text-slate-500 py-4">
              <p>暂无技能信息</p>
            </div>
          ) : (
            skills.map((skill, index) => (
              <div
                key={skill.id}
                className={cn(
                  'p-3 rounded-lg border',
                  getTypeColor(skill.type)
                )}
              >
                {/* 技能头部 */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(skill.type)}
                    <span className="font-semibold">{skill.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {skill.type === 'active' ? '主动' : 
                     skill.type === 'passive' ? '被动' : '触发'}
                  </Badge>
                </div>

                {/* 技能描述 */}
                <p className="text-sm mb-2 opacity-90">{skill.description}</p>

                {/* 冷却时间 */}
                {(skill.cooldown !== undefined && skill.cooldown > 0) && (
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>
                      冷却: {skill.currentCooldown || 0}/{skill.cooldown} 回合
                    </span>
                  </div>
                )}

                {/* 效果说明 */}
                <div className="mt-2 text-xs opacity-75">
                  <span className="font-medium">效果: </span>
                  {skill.effect}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 底部提示 */}
        <div className="px-4 py-2 border-t border-slate-700 text-xs text-slate-500 text-center">
          点击空白区域或右键关闭
        </div>
      </Card>
    </div>
  );
}

export default SkillDetailPanel;
