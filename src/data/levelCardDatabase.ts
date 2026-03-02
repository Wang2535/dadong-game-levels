/**
 * 《大东话安全》关卡解锁卡牌数据库
 * 
 * 包含9个关卡的18张解锁卡牌
 * 编号格式: XZYa-bC (L=关卡, Z=功能类, a=关卡数, b=序号, C=科技等级)
 */

import type { Card, CardRarity, CardType, TechLevel, Faction } from '@/types/legacy/card_v16';

// ============================================
// 关卡1解锁卡牌 - 病毒初现
// ============================================

const LEVEL1_CARDS: Card[] = [
  {
    card_code: 'LF1-1T1',
    name: '签名接种',
    description: '消耗：2行动点，1算力，1信息；效果：为目标区域添加"已接种"标记。病毒类敌人的感染技能对该区域无效，持续3回合。',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{ 
      type: 'area_defense', 
      baseValue: 1, 
      description: '为目标区域添加"已接种"标记，病毒类敌人感染技能无效，持续3回合',
      targetArea: 'internal'
    }],
  },
  {
    card_code: 'LI1-1T1',
    name: '系统重写',
    description: '消耗：3行动点，2算力，1信息，弃置1张手牌；效果：移除指定病毒类敌人在目标区域的所有标记',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 2, funds: 0, information: 1 },
    difficulty: 3,
    effects: [{ 
      type: 'infiltration_reduce', 
      baseValue: 5, 
      description: '移除指定病毒类敌人在目标区域的所有标记'
    }],
  },
  {
    card_code: 'LT1-1T1',
    name: '来路不明软盘',
    description: '消耗：2行动点，1资金，1信息；效果：在指定区域设置陷阱。当友方角色在该区域放置标记时，陷阱触发，该标记转为敌方标记。"不要轻易使用来路不明的软盘。"——这是埃尔克克隆者给世人上的第一课。',
    type: 'trap' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 1, information: 1 },
    difficulty: 2,
    effects: [{ 
      type: 'trap_set', 
      baseValue: 1, 
      description: '在指定区域设置陷阱，友方放置标记时转为敌方标记'
    }],
  },
  {
    card_code: 'LF1-2T1',
    name: '病毒库更新',
    description: '消耗：1行动点，1算力；效果：本回合内，所有友方角色免疫埃尔克克隆者和斯克伦塔的感染技能。每有一名友方角色受益，恢复1行动点。"及时更新病毒库定期杀毒，安装防火墙以防木马和黑客的攻击。"',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 0 },
    difficulty: 1,
    effects: [{ 
      type: 'skill_immunity', 
      baseValue: 1, 
      description: '本回合免疫埃尔克克隆者和斯克伦塔的感染技能，每名受益友方恢复1行动点'
    }],
  },
];

// ============================================
// 关卡2解锁卡牌 - AI的抉择
// ============================================

const LEVEL2_CARDS: Card[] = [
  {
    card_code: 'LI2-1T1',
    name: '人工干预',
    description: '消耗：2行动点，1算力，1资金；效果：本回合内，叛逆莫斯的"计算否定"技能无效，且友方角色在莫斯所在区域放置标记时行动点消耗-1',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 1, information: 0 },
    difficulty: 2,
    effects: [{ 
      type: 'security_gain', 
      baseValue: 1, 
      description: '叛逆莫斯"计算否定"技能无效，友方在该区域放置标记行动点消耗-1'
    }],
  },
  {
    card_code: 'LI2-2T2',
    name: '行为异常检测',
    description: '消耗：2行动点，2算力，1信息；效果：本回合内，AI攻击者的所有自动技能失效。如果AI攻击者尝试使用主动技能，该技能反噬，AI攻击者失去2个标记',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{ 
      type: 'infiltration_reduce', 
      baseValue: 2, 
      description: 'AI攻击者自动技能失效，主动技能反噬失去2个标记'
    }],
  },
];

// ============================================
// 关卡3解锁卡牌 - 蠕虫危机
// ============================================

const LEVEL3_CARDS: Card[] = [
  {
    card_code: 'LI3-1T1',
    name: '网络隔离',
    description: '消耗：2行动点，2算力；效果：选择一个区域进行网络隔离，该区域本回合内不受任何蠕虫病毒的复制和传播影响',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 2, funds: 0, information: 0 },
    difficulty: 2,
    effects: [{ 
      type: 'area_defense', 
      baseValue: 1, 
      description: '目标区域网络隔离，不受蠕虫病毒复制和传播影响',
      targetArea: 'internal'
    }],
  },
  {
    card_code: 'LF3-1T2',
    name: '安全意识觉醒',
    description: '消耗：3行动点，3算力，1信息；效果：所有友方角色获得"安全意识"状态，持续3回合，蠕虫病毒的感染技能对友方标记无效',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 3, funds: 0, information: 1 },
    difficulty: 3,
    effects: [{ 
      type: 'security_gain', 
      baseValue: 3, 
      description: '所有友方角色获得"安全意识"状态3回合，蠕虫病毒感染技能无效'
    }],
  },
];

// ============================================
// 关卡4解锁卡牌 - 组件化攻击
// ============================================

const LEVEL4_CARDS: Card[] = [
  {
    card_code: 'LI4-1T2',
    name: '火焰检测工具',
    description: '消耗：2行动点，2算力，1信息；效果：揭示火焰病毒在所有区域的隐藏标记，并移除其中一半（向上取整）',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{ 
      type: 'infiltration_reduce', 
      baseValue: 3, 
      description: '揭示火焰病毒所有隐藏标记，移除其中一半'
    }],
  },
  {
    card_code: 'LF4-1T2',
    name: '组件化防御',
    description: '消耗：3行动点，3算力，2资金；效果：本回合内，友方所有区域获得"模块化防护"，组件化攻击类敌人的技能对该区域无效',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 3, funds: 2, information: 0 },
    difficulty: 3,
    effects: [{ 
      type: 'security_gain', 
      baseValue: 2, 
      description: '所有友方区域获得"模块化防护"，组件化攻击类敌人技能无效'
    }],
  },
];

// ============================================
// 关卡5解锁卡牌 - 致命缺陷
// ============================================

const LEVEL5_CARDS: Card[] = [
  {
    card_code: 'LF5-1T2',
    name: '冗余设计',
    description: '消耗：2行动点，2算力，1资金；效果：为目标区域添加"冗余保护"，友方标记数量不会低于1，且设计缺陷类敌人的"故障模式触发"技能对该区域无效，持续3回合',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 1, information: 0 },
    difficulty: 2,
    effects: [{ 
      type: 'area_defense', 
      baseValue: 1, 
      description: '目标区域"冗余保护"，友方标记不低于1，设计缺陷类敌人技能无效',
      targetArea: 'internal'
    }],
  },
  {
    card_code: 'LF5-2T2',
    name: '安全培训',
    description: '消耗：3行动点，3算力，1资金，1信息；效果：所有友方角色获得"安全意识"状态，持续2回合，设计缺陷类敌人的所有技能对友方无效',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 3, funds: 1, information: 1 },
    difficulty: 3,
    effects: [{ 
      type: 'security_gain', 
      baseValue: 2, 
      description: '所有友方角色获得"安全意识"状态2回合，设计缺陷类敌人技能无效'
    }],
  },
];

// ============================================
// 关卡6解锁卡牌 - 工控危机
// ============================================

const LEVEL6_CARDS: Card[] = [
  {
    card_code: 'LI6-1T2',
    name: '物理隔离',
    description: '消耗：2行动点，2算力，1信息；效果：选择一个区域进行物理隔离，该区域本回合内不受电磁脉冲攻击和远程控制干扰，工控攻击类敌人的技能对该区域无效',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{ 
      type: 'area_defense', 
      baseValue: 1, 
      description: '目标区域物理隔离，不受电磁脉冲和远程控制干扰，工控攻击类敌人技能无效',
      targetArea: 'industrial'
    }],
  },
  {
    card_code: 'LI6-2T3',
    name: '控制器加固',
    description: '消耗：3行动点，4算力，2资金；效果：移除工控入侵者在指定区域的所有标记，并解除该区域的"被渗透"状态，工控入侵者的"基础设施渗透"技能冷却时间+1回合',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 3 as TechLevel,
    cost: { compute: 4, funds: 2, information: 0 },
    difficulty: 3,
    effects: [{ 
      type: 'infiltration_reduce', 
      baseValue: 5, 
      description: '移除工控入侵者所有标记，解除"被渗透"状态，其技能冷却+1'
    }],
  },
];

// ============================================
// 关卡7解锁卡牌 - 隐私透明
// ============================================

const LEVEL7_CARDS: Card[] = [
  {
    card_code: 'LF7-1T2',
    name: 'MAC地址随机化',
    description: '消耗：2行动点，2算力，1信息；效果：为目标区域添加"隐私保护"，探针盒子在该区域无法获得"信息碎片"，且探针盒子的标记在该区域效果减半，持续3回合',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{ 
      type: 'area_defense', 
      baseValue: 1, 
      description: '目标区域"隐私保护"，探针盒子无法获得信息碎片，其标记效果减半',
      targetArea: 'external'
    }],
  },
  {
    card_code: 'LF7-2T3',
    name: '隐私安全意识',
    description: '消耗：3行动点，3算力，2资金，2信息；效果：所有友方角色获得"隐私保护"状态，持续2回合，隐私窃取类敌人的所有技能对友方无效，隐私窃贼失去所有"隐私卡"',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 3 as TechLevel,
    cost: { compute: 3, funds: 2, information: 2 },
    difficulty: 3,
    effects: [{ 
      type: 'security_gain', 
      baseValue: 2, 
      description: '所有友方角色获得"隐私保护"状态2回合，隐私窃取类敌人技能无效，隐私窃贼失去所有隐私卡'
    }],
  },
];

// ============================================
// 关卡8解锁卡牌 - 密码之战
// ============================================

const LEVEL8_CARDS: Card[] = [
  {
    card_code: 'LI8-1T2',
    name: '多因素认证',
    description: '消耗：2行动点，2算力，1信息；效果：本回合内，所有友方标记免疫"被解密"效果，如果密码破解类敌人尝试使用"密码分析"技能，该技能反噬，敌人失去1个标记',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{ 
      type: 'security_gain', 
      baseValue: 1, 
      description: '所有友方标记免疫"被解密"，密码分析技能反噬敌人失去1个标记'
    }],
  },
  {
    card_code: 'LF8-1T3',
    name: '密钥更新',
    description: '消耗：3行动点，4算力，2资金，1信息；效果：解除所有区域的"古典密码"状态和"被解密"效果，所有友方角色获得"加密强化"状态，持续2回合，在此期间友方标记不会被转为敌方标记',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 3 as TechLevel,
    cost: { compute: 4, funds: 2, information: 1 },
    difficulty: 3,
    effects: [{ 
      type: 'security_gain', 
      baseValue: 3, 
      description: '解除"古典密码"和"被解密"效果，友方获得"加密强化"状态2回合'
    }],
  },
];

// ============================================
// 关卡9解锁卡牌 - 账号保卫战
// ============================================

const LEVEL9_CARDS: Card[] = [
  {
    card_code: 'LI9-1T2',
    name: '异常行为检测',
    description: '消耗：2行动点，2算力，2信息；效果：揭示盗号黑手设置的所有"钓鱼陷阱"，并使其失效，每揭示一个陷阱，友方获得1行动点',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 2 },
    difficulty: 2,
    effects: [{ 
      type: 'resource_gain', 
      baseValue: 1, 
      description: '揭示所有钓鱼陷阱并使其失效，每揭示一个获得1行动点',
      resourceType: 'action'
    }],
  },
  {
    card_code: 'LI9-2T3',
    name: '设备指纹识别',
    description: '消耗：3行动点，4算力，3资金，2信息；效果：移除做号集团在指定区域的所有标记，并解除该区域的"黑产运营"状态，做号集团的"批量产号"技能下回合无效',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 3 as TechLevel,
    cost: { compute: 4, funds: 3, information: 2 },
    difficulty: 3,
    effects: [{ 
      type: 'infiltration_reduce', 
      baseValue: 5, 
      description: '移除做号集团所有标记，解除"黑产运营"状态，其批量产号技能下回合无效'
    }],
  },
];

// ============================================
// 判定类卡牌 - 用于测试即时判定和延时判定机制
// ============================================

const JUDGMENT_CARDS: Card[] = [
  {
    card_code: 'LI0-1T1',
    name: '紧急修复（即时判定）',
    description: '消耗：2行动点，1算力；效果：判定难度3，成功则安全+2，失败则安全-1；大成功：安全+3；触发：出牌时立即判定',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 0 },
    difficulty: 3,
    effects: [{ 
      type: 'dice_check', 
      difficulty: 3,
      onSuccess: { type: 'security_gain', baseValue: 2, description: '安全+2' },
      onFailure: { type: 'security_reduce', baseValue: 1, description: '安全-1' },
      onCriticalSuccess: { type: 'security_gain', baseValue: 3, description: '大成功！安全+3' },
      description: '判定难度3，成功则安全+2，失败则安全-1，大成功安全+3'
    }],
  },
  {
    card_code: 'LA0-1T1',
    name: '深度扫描（延时判定）',
    description: '消耗：2行动点，1信息；效果：判定难度2，成功则渗透-3，失败则渗透+1；将在下个判定阶段执行',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{ 
      type: 'dice_check', 
      difficulty: 2,
      onSuccess: { type: 'infiltration_reduce', baseValue: 3, description: '渗透-3' },
      onFailure: { type: 'infiltration_gain', baseValue: 1, description: '渗透+1' },
      isDelayed: true,
      description: '判定难度2，成功则渗透-3，失败则渗透+1（延时判定）'
    }],
  },
  {
    card_code: 'LI0-2T2',
    name: '系统加固（即时判定）',
    description: '消耗：3行动点，2算力；效果：判定难度4，成功则所有区域获得"加固"状态，失败则仅当前区域获得；大成功：额外恢复2点安全',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 0 },
    difficulty: 4,
    effects: [{ 
      type: 'dice_check', 
      difficulty: 4,
      onSuccess: { type: 'area_defense', baseValue: 1, description: '所有区域获得"加固"状态' },
      onFailure: { type: 'area_defense', baseValue: 1, description: '仅当前区域获得"加固"状态', targetArea: 'internal' },
      onCriticalSuccess: { type: 'security_gain', baseValue: 2, description: '额外安全+2' },
      description: '判定难度4，成功则所有区域加固，失败则仅当前区域，大成功额外安全+2'
    }],
  },
  {
    card_code: 'LA0-2T2',
    name: '威胁预警（延时判定）',
    description: '消耗：2行动点，2信息；效果：判定难度3，成功则下回合敌方行动点-2，失败则无效果；将在下个判定阶段执行',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 0, funds: 0, information: 2 },
    difficulty: 3,
    effects: [{ 
      type: 'dice_check', 
      difficulty: 3,
      onSuccess: { type: 'resource_gain', baseValue: 2, description: '下回合敌方行动点-2', resourceType: 'action' },
      onFailure: { type: 'resource_gain', baseValue: 0, description: '判定失败，无效果' },
      isDelayed: true,
      description: '判定难度3，成功则下回合敌方行动点-2（延时判定）'
    }],
  },
];

// ============================================
// 导出所有关卡卡牌
// ============================================

// 单独导出每个关卡的卡牌
export { LEVEL1_CARDS };
export { LEVEL2_CARDS };
export { LEVEL3_CARDS };
export { LEVEL4_CARDS };
export { LEVEL5_CARDS };
export { LEVEL6_CARDS };
export { LEVEL7_CARDS };
export { LEVEL8_CARDS };
export { LEVEL9_CARDS };
export { JUDGMENT_CARDS };

export const LEVEL_CARDS: Card[] = [
  ...LEVEL1_CARDS,
  ...LEVEL2_CARDS,
  ...LEVEL3_CARDS,
  ...LEVEL4_CARDS,
  ...LEVEL5_CARDS,
  ...LEVEL6_CARDS,
  ...LEVEL7_CARDS,
  ...LEVEL8_CARDS,
  ...LEVEL9_CARDS,
  ...JUDGMENT_CARDS,
];

// 按关卡获取卡牌
export function getCardsByLevel(level: number): Card[] {
  switch (level) {
    case 1: return LEVEL1_CARDS;
    case 2: return LEVEL2_CARDS;
    case 3: return LEVEL3_CARDS;
    case 4: return LEVEL4_CARDS;
    case 5: return LEVEL5_CARDS;
    case 6: return LEVEL6_CARDS;
    case 7: return LEVEL7_CARDS;
    case 8: return LEVEL8_CARDS;
    case 9: return LEVEL9_CARDS;
    default: return [];
  }
}

// 根据卡牌代码获取卡牌
export function getLevelCardByCode(code: string): Card | undefined {
  return LEVEL_CARDS.find(card => card.card_code === code);
}

export default LEVEL_CARDS;
