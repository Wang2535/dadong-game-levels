/**
 * 《道高一丈：数字博弈》完整卡牌数据库
 * 
 * 卡牌编号规则: XZYa-bC
 * - X = 来源类代码 (S角色特殊/N正常/L关卡)
 * - Z = 功能类代码 (E资源交换/F基础数值/I即时判定/A延时判定/D数值降低/O其他)
 * - a = 关卡数 (现有卡牌为0，关卡解锁卡牌为对应关卡数)
 * - b = 该卡牌序号
 * - C = 科技树等级 (T1-T5)
 * 
 * 示例: NF0-1T1 = 正常卡牌、基础数值类、现有卡牌第1张、T1等级
 */

import type { Card, CardRarity, CardType, TechLevel, Faction } from '@/types/legacy/card_v16';

// ============================================
// 防御方卡牌库 - T1 基础防御 (8张)
// ============================================

const DEFENDER_T1_CARDS: Card[] = [
  {
    card_code: 'NF0-1T1',
    name: '防火墙部署',
    description: '消耗：算力1；效果：安全+1；触发：出牌时；连击：连续使用额外+0.5',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 0 },
    difficulty: 1,
    effects: [{ type: 'security_gain', baseValue: 1, description: '安全+1' }],
  },
  {
    card_code: 'NI0-1T1',
    name: '入侵检测',
    description: '消耗：信息1；效果：判定难度2，成功则安全+1，信息+1；触发：出牌时',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 1, description: '安全+1' }],
  },
  {
    card_code: 'NF0-2T1',
    name: '安全审计',
    description: '消耗：资金1；效果：判定难度2，成功则安全+1，资金+1；触发：出牌时',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 1, information: 0 },
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 1, description: '安全+1' }],
  },
  {
    card_code: 'NF0-3T1',
    name: '访问控制',
    description: '消耗：算力1，信息1；效果：判定难度2，成功则安全+2；触发：出牌时',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 2, description: '安全+2' }],
  },
  {
    card_code: 'NI0-2T1',
    name: '日志监控',
    description: '消耗：算力1，资金1；效果：判定难度1，成功则信息+2，安全+1；触发：出牌时',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 1, information: 0 },
    difficulty: 1,
    effects: [{ type: 'security_gain', baseValue: 1, description: '安全+1' }],
  },
  {
    card_code: 'NF0-4T1',
    name: '补丁管理',
    description: '消耗：算力2；效果：判定难度2，成功则安全+2，且清除1个持续伤害效果；触发：出牌时',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 2, funds: 0, information: 0 },
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 2, description: '安全+2' }],
  },
  {
    card_code: 'NF0-5T1',
    name: '网络分段',
    description: '消耗：算力2，资金1；效果：判定难度3，成功则安全+2，且对方下回合渗透-1；触发：出牌时',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 2, funds: 1, information: 0 },
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 2, description: '安全+2' }],
  },
  {
    card_code: 'NF0-6T1',
    name: '备份恢复',
    description: '消耗：算力1，资金2；效果：判定难度2，成功则安全+1，且恢复1点已损失资源；触发：出牌时',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 2, information: 0 },
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 1, description: '安全+1' }],
  },
];

// ============================================
// 防御方卡牌库 - T2 进阶防御 (12张)
// ============================================

const DEFENDER_T2_CARDS: Card[] = [
  {
    card_code: 'NI0-3T2',
    name: '威胁情报',
    description: '消耗：信息2，资金1；效果：判定难度3，成功则信息+3，安全+1；触发：出牌时',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 0, funds: 1, information: 2 },
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 1, description: '安全+1' }],
  },
  {
    card_code: 'NF0-7T2',
    name: '端点防护',
    description: '消耗：算力2，资金2；效果：判定难度3，成功则安全+3，且获得1点防护标记；触发：出牌时',
    type: 'active_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 2, information: 0 },
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 3, description: '安全+3' }],
  },
  {
    card_code: 'NI0-4T2',
    name: '蜜罐诱捕',
    description: '消耗：算力2，信息1；效果：判定难度3，成功则对方渗透-2，信息+2；触发：出牌时',
    type: 'active_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 1 },
    difficulty: 3,
    effects: [{ type: 'infiltration_reduce', baseValue: 2, description: '对方渗透-2' }],
  },
  {
    card_code: 'NI0-5T2',
    name: '行为分析',
    description: '消耗：信息2，算力1；效果：判定难度3，成功则可以查看对方手牌，安全+1；触发：出牌时',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 1, funds: 0, information: 2 },
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 1, description: '安全+1' }],
  },
  {
    card_code: 'NF0-8T2',
    name: '漏洞扫描',
    description: '消耗：算力2，信息1；效果：判定难度2，成功则安全+2，且下回合判定难度-1；触发：出牌时',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 1 },
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 2, description: '安全+2' }],
  },
  {
    card_code: 'NI0-6T2',
    name: '应急响应',
    description: '消耗：算力3，资金2；效果：判定难度4，成功则安全+3，且清除所有负面效果；触发：出牌时',
    type: 'active_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 3, funds: 2, information: 0 },
    difficulty: 4,
    effects: [{ type: 'security_gain', baseValue: 3, description: '安全+3' }],
  },
  {
    card_code: 'NF0-9T2',
    name: '加密通信',
    description: '消耗：算力2，信息1；效果：判定难度3，成功则安全+2，且对方下回合窃取效果-1；触发：出牌时',
    type: 'defense_in_depth' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 1 },
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 2, description: '安全+2' }],
  },
  {
    card_code: 'NF0-10T2',
    name: '多因素认证',
    description: '消耗：算力1，资金1；效果：判定难度2，成功则安全+2，且获得1层防护；触发：出牌时',
    type: 'defense_in_depth' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 1, funds: 1, information: 0 },
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 2, description: '安全+2' }],
  },
  {
    card_code: 'NI0-7T2',
    name: '安全编排',
    description: '消耗：算力3，信息2；效果：判定难度4，成功则安全+2，且可以额外打出1张防御牌；触发：出牌时',
    type: 'active_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 3, funds: 0, information: 2 },
    difficulty: 4,
    effects: [{ type: 'security_gain', baseValue: 2, description: '安全+2' }],
  },
  {
    card_code: 'NI0-8T2',
    name: '欺骗技术',
    description: '消耗：算力2，信息2；效果：判定难度3，成功则对方下回合攻击判定难度+1；触发：出牌时',
    type: 'active_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 2 },
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 1, description: '安全+1' }],
  },
  {
    card_code: 'NF0-11T2',
    name: '云安全防护',
    description: '消耗：算力2，资金2；效果：判定难度3，成功则安全+3，算力+1；触发：出牌时',
    type: 'defense_in_depth' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 2, information: 0 },
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 3, description: '安全+3' }],
  },
  {
    card_code: 'NF0-12T2',
    name: '零信任架构',
    description: '消耗：算力3，资金2；效果：判定难度4，成功则安全+4，且对方渗透-1；触发：出牌时',
    type: 'absolute_security' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 3, funds: 2, information: 0 },
    difficulty: 4,
    effects: [{ type: 'security_gain', baseValue: 4, description: '安全+4' }],
  },
];

// ============================================
// 进攻方卡牌库 - T1 基础侦查 (8张)
// ============================================

const ATTACKER_T1_CARDS: Card[] = [
  {
    card_code: 'NF0-13T1',
    name: '端口扫描',
    description: '消耗：算力1；效果：渗透+1；触发：出牌时；连击：连续使用额外+0.5',
    type: 'basic_recon' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 0 },
    difficulty: 1,
    effects: [{ type: 'infiltration_gain', baseValue: 1, description: '渗透+1' }],
  },
  {
    card_code: 'NI0-9T1',
    name: '弱口令尝试',
    description: '消耗：信息1；效果：判定难度3，成功则渗透+2，失败则渗透-1；触发：出牌时',
    type: 'basic_recon' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 0, information: 1 },
    difficulty: 3,
    effects: [{ 
      type: 'dice_check', 
      difficulty: 3, 
      onSuccess: { type: 'infiltration_gain', baseValue: 2, description: '渗透+2' },
      onFailure: { type: 'infiltration_reduce', baseValue: 1, description: '渗透-1' },
    }],
  },
  {
    card_code: 'NI0-10T1',
    name: '钓鱼邮件',
    description: '消耗：资金1；效果：判定难度3，成功则安全-1，信息+1；大成功：安全-2；触发：出牌时',
    type: 'basic_recon' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 1, information: 0 },
    difficulty: 3,
    effects: [{ type: 'security_reduce', baseValue: 1, description: '安全-1' }],
  },
  {
    card_code: 'NI0-11T1',
    name: '服务拒绝攻击',
    description: '消耗：算力2，信息1；效果：判定难度3，成功则安全-1，算力+1；持续：1回合内对方判定难度+1；触发：出牌时',
    type: 'vuln_exploit' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 2, funds: 0, information: 1 },
    difficulty: 3,
    effects: [{ type: 'security_reduce', baseValue: 1, description: '安全-1' }],
  },
  {
    card_code: 'NA0-1T1',
    name: '恶意脚本注入',
    description: '消耗：算力1,信息1；效果：判定难度3，成功则安全-1，且触发持续：每回合安全-1，持续2回合；触发：出牌时',
    type: 'vuln_exploit' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 1, funds: 0, information: 1 },
    difficulty: 3,
    effects: [{ type: 'security_reduce', baseValue: 1, description: '安全-1' }],
  },
  {
    card_code: 'NI0-12T1',
    name: '网络嗅探',
    description: '消耗：资金1，信息1；效果：判定难度1，成功则安全-1，算力+2；大成功：算力+1；触发：出牌时',
    type: 'basic_recon' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 1, information: 1 },
    difficulty: 1,
    effects: [{ type: 'security_reduce', baseValue: 1, description: '安全-1' }],
  },
  {
    card_code: 'NI0-13T1',
    name: '社会工程学',
    description: '消耗：资金1,信息1；效果：判定难度2，成功则安全-1，资金+1；触发：出牌时',
    type: 'basic_recon' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 1, information: 1 },
    difficulty: 2,
    effects: [{ type: 'security_reduce', baseValue: 1, description: '安全-1' }],
  },
  {
    card_code: 'NA0-2T1',
    name: '后门植入',
    description: '消耗：算力2；效果：判定难度3，成功则渗透+2，且触发持续：每回合渗透+1，持续2回合；触发：出牌时',
    type: 'vuln_exploit' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 2, funds: 0, information: 0 },
    difficulty: 3,
    effects: [{ type: 'infiltration_gain', baseValue: 2, description: '渗透+2' }],
  },
];

// ============================================
// 进攻方卡牌库 - T2 进阶渗透 (12张)
// ============================================

const ATTACKER_T2_CARDS: Card[] = [
  {
    card_code: 'NI0-14T2',
    name: '零日漏洞利用',
    description: '消耗：算力3，信息2；效果：判定难度4，成功则渗透+3，安全-2；大成功：额外渗透+1；触发：出牌时',
    type: 'vuln_exploit' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 3, funds: 0, information: 2 },
    difficulty: 4,
    effects: [{ type: 'infiltration_gain', baseValue: 3, description: '渗透+3' }],
  },
  {
    card_code: 'NI0-15T2',
    name: '中间人攻击',
    description: '消耗：算力2，资金2；效果：判定难度3，成功则窃取对方1点算力/资金/信息；触发：出牌时',
    type: 'vuln_exploit' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 2, information: 0 },
    difficulty: 3,
    effects: [{ type: 'resource_steal', resourceType: 'compute', value: 1, description: '窃取1点算力' }],
  },
  {
    card_code: 'NI0-16T2',
    name: '权限提升',
    description: '消耗：算力2，渗透等级>=15；效果：判定难度4，成功则渗透+4，且本回合后续攻击判定难度-1；触发：出牌时',
    type: 'privilege_escalation' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 0 },
    difficulty: 4,
    effects: [{ type: 'infiltration_gain', baseValue: 4, description: '渗透+4' }],
  },
  {
    card_code: 'NI0-17T2',
    name: '横向移动',
    description: '消耗：算力2，信息1；效果：判定难度3，成功则渗透+2，且可以额外打出1张攻击牌；触发：出牌时',
    type: 'privilege_escalation' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 1 },
    difficulty: 3,
    effects: [{ type: 'infiltration_gain', baseValue: 2, description: '渗透+2' }],
  },
  {
    card_code: 'NI0-18T2',
    name: '数据窃取',
    description: '消耗：算力2，渗透等级>=10；效果：判定难度3，成功则信息+3，渗透+1；触发：出牌时',
    type: 'advanced_attack' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 0 },
    difficulty: 3,
    effects: [{ type: 'infiltration_gain', baseValue: 1, description: '渗透+1' }],
  },
  {
    card_code: 'ND0-1T2',
    name: '勒索软件',
    description: '消耗：算力3，资金2；效果：判定难度4，成功则对方资金-3，安全-2；触发：出牌时',
    type: 'advanced_attack' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 3, funds: 2, information: 0 },
    difficulty: 4,
    effects: [{ type: 'security_reduce', baseValue: 2, description: '安全-2' }],
  },
  {
    card_code: 'NI0-19T2',
    name: '供应链攻击',
    description: '消耗：算力2，信息2，资金1；效果：判定难度4，成功则安全-3，且对方下回合资源恢复-1；触发：出牌时',
    type: 'advanced_attack' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 1, information: 2 },
    difficulty: 4,
    effects: [{ type: 'security_reduce', baseValue: 3, description: '安全-3' }],
  },
  {
    card_code: 'NI0-20T2',
    name: '水坑攻击',
    description: '消耗：信息2，资金1；效果：判定难度3，成功则渗透+2，信息+2；触发：出牌时',
    type: 'advanced_attack' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 0, funds: 1, information: 2 },
    difficulty: 3,
    effects: [{ type: 'infiltration_gain', baseValue: 2, description: '渗透+2' }],
  },
  {
    card_code: 'NI0-21T2',
    name: '凭证填充',
    description: '消耗：算力2，信息1；效果：判定难度3，成功则渗透+2，且可以查看对方1张手牌；触发：出牌时',
    type: 'advanced_attack' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 1 },
    difficulty: 3,
    effects: [{ type: 'infiltration_gain', baseValue: 2, description: '渗透+2' }],
  },
  {
    card_code: 'NI0-22T2',
    name: 'DNS劫持',
    description: '消耗：算力2，资金1；效果：判定难度3，成功则安全-2，且对方下回合摸牌数-1；触发：出牌时',
    type: 'advanced_attack' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 1, information: 0 },
    difficulty: 3,
    effects: [{ type: 'security_reduce', baseValue: 2, description: '安全-2' }],
  },
  {
    card_code: 'NI0-23T2',
    name: '加密劫持',
    description: '消耗：算力3；效果：判定难度3，成功则算力+3，渗透+1；触发：出牌时',
    type: 'advanced_attack' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 3, funds: 0, information: 0 },
    difficulty: 3,
    effects: [{ type: 'infiltration_gain', baseValue: 1, description: '渗透+1' }],
  },
  {
    card_code: 'NI0-24T2',
    name: 'APT初始访问',
    description: '消耗：算力2，信息2；效果：判定难度4，成功则渗透+3，且获得1个持续标记；触发：出牌时',
    type: 'total_control' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 2 },
    difficulty: 4,
    effects: [{ type: 'infiltration_gain', baseValue: 3, description: '渗透+3' }],
  },
];

// ============================================
// 通用/中立卡牌 (9张)
// ============================================

const NEUTRAL_CARDS: Card[] = [
  {
    card_code: 'NE0-1T1',
    name: '资源调配',
    description: '消耗：无；效果：将1点任意资源转换为另1点资源；触发：出牌时',
    type: 'basic_defense' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 0, information: 0 },
    difficulty: 1,
    effects: [{ type: 'resource_gain', resourceType: 'compute', value: 1, description: '获得1点算力' }],
  },
  {
    card_code: 'NE0-2T1',
    name: '紧急补给',
    description: '消耗：无；效果：恢复2点已消耗资源；触发：出牌时',
    type: 'basic_defense' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 0, information: 0 },
    difficulty: 1,
    effects: [{ type: 'resource_gain', resourceType: 'compute', value: 2, description: '获得2点算力' }],
  },
  {
    card_code: 'NE0-3T1',
    name: '情报交易',
    description: '消耗：资金1；效果：信息+2，资金-1；触发：出牌时',
    type: 'basic_recon' as CardType,
    faction: 'attack' as Faction,
    rarity: 'common' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: { compute: 0, funds: 1, information: 0 },
    difficulty: 1,
    effects: [{ type: 'resource_gain', resourceType: 'information', value: 2, description: '获得2点信息' }],
  },
  {
    card_code: 'NE0-4T2',
    name: '技术升级',
    description: '消耗：算力2；效果：算力上限+1，当前算力+1；触发：出牌时',
    type: 'basic_defense' as CardType,
    faction: 'attack' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 2, funds: 0, information: 0 },
    difficulty: 2,
    effects: [{ type: 'resource_gain', resourceType: 'compute', value: 1, description: '获得1点算力' }],
  },
  {
    card_code: 'NE0-5T3',
    name: '时间压缩',
    description: '消耗：算力3；效果：本回合行动点+1；触发：出牌时',
    type: 'total_control' as CardType,
    faction: 'attack' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 3 as TechLevel,
    cost: { compute: 3, funds: 0, information: 0 },
    difficulty: 3,
    effects: [{ type: 'resource_gain', resourceType: 'compute', value: 1, description: '获得1点算力' }],
  },
  {
    card_code: 'NI0-25T2',
    name: '命运骰子',
    description: '消耗：无；效果：掷骰子，1-2:无效果，3-4:资源+1，5-6:资源+2；触发：出牌时',
    type: 'total_control' as CardType,
    faction: 'attack' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 0, funds: 0, information: 0 },
    difficulty: 2,
    effects: [{ type: 'dice_check', difficulty: 3, onSuccess: { type: 'resource_gain', resourceType: 'compute', value: 1, description: '获得1点资源' } }],
  },
  {
    card_code: 'NF0-13T2',
    name: '绝境反击',
    description: '消耗：无；效果：当自己安全/渗透<10时，安全/渗透+3；触发：出牌时',
    type: 'absolute_security' as CardType,
    faction: 'defense' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: { compute: 0, funds: 0, information: 0 },
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 3, description: '安全+3' }],
  },
  {
    card_code: 'NI0-26T3',
    name: '信息封锁',
    description: '消耗：算力2，信息1；效果：对方下回合无法获得信息；触发：出牌时',
    type: 'absolute_security' as CardType,
    faction: 'defense' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 3 as TechLevel,
    cost: { compute: 2, funds: 0, information: 1 },
    difficulty: 3,
    effects: [{ type: 'infiltration_suppress', duration: 1, description: '压制渗透1回合' }],
  },
  {
    card_code: 'NI0-27T4',
    name: '终极协议',
    description: '消耗：所有资源；效果：根据阵营安全/渗透+5，且对方下回合所有判定难度+1；触发：出牌时',
    type: 'absolute_security' as CardType,
    faction: 'neutral' as Faction,
    rarity: 'legendary' as CardRarity,
    techLevel: 4 as TechLevel,
    cost: { compute: 0, funds: 0, information: 0 },
    difficulty: 4,
    effects: [{ 
      type: 'ultimate_protocol', 
      baseValue: 5, 
      description: '消耗所有资源，根据阵营安全/渗透+5，对方下回合判定难度+1',
      costAllResources: true,
      opponentDifficultyIncrease: 1,
      duration: 1
    }],
  },
];

// ============================================
// 关卡解锁卡牌 (18张)
// ============================================

const LEVEL_UNLOCK_CARDS: Card[] = [
  // 关卡1解锁
  {
    card_code: 'LF1-1T1',
    name: '签名接种',
    description: '消耗：行动点2；效果：为目标区域添加"已接种"标记。病毒类敌人的感染技能对该区域无效，持续3回合。',
    type: 'basic_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: {},
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 1, description: '病毒免疫' }],
  },
  {
    card_code: 'LI1-1T1',
    name: '系统重写',
    description: '消耗：行动点3，弃置1张手牌；效果：移除指定病毒类敌人在目标区域的所有标记。',
    type: 'active_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 2, description: '清除病毒' }],
  },
  // 关卡2解锁
  {
    card_code: 'LI2-1T1',
    name: '人工干预',
    description: '消耗：行动点2；效果：本回合内，AI类敌人的"计算否定"技能无效。友方角色在AI类敌人所在区域放置标记时行动点消耗-1。',
    type: 'active_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: {},
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 1, description: 'AI免疫' }],
  },
  {
    card_code: 'LI2-2T2',
    name: '行为异常检测',
    description: '消耗：行动点2；效果：本回合内，AI攻击者的所有自动技能失效。如果AI攻击者尝试使用主动技能，该技能反噬，AI攻击者失去2个标记。',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 2, description: 'AI反制' }],
  },
  // 关卡3解锁
  {
    card_code: 'LI3-1T1',
    name: '网络隔离',
    description: '消耗：行动点2；效果：选择一个区域进行网络隔离。该区域本回合内不受任何蠕虫病毒的复制和传播影响。',
    type: 'active_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 1 as TechLevel,
    cost: {},
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 1, description: '蠕虫隔离' }],
  },
  {
    card_code: 'LF3-1T2',
    name: '安全意识觉醒',
    description: '消耗：行动点3；效果：所有友方角色获得"安全意识"状态，持续3回合。在此期间，蠕虫病毒的感染技能对友方标记无效。',
    type: 'defense_in_depth' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 3, description: '安全意识' }],
  },
  // 关卡4解锁
  {
    card_code: 'LI4-1T2',
    name: '火焰检测工具',
    description: '消耗：行动点2；效果：揭示火焰病毒在所有区域的隐藏标记，并移除其中一半（向上取整）。',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 2, description: '病毒检测' }],
  },
  {
    card_code: 'LF4-1T2',
    name: '组件化防御',
    description: '消耗：行动点3；效果：本回合内，友方所有区域获得"模块化防护"。组件化攻击类敌人的技能对该区域无效。',
    type: 'defense_in_depth' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 2, description: '组件化防护' }],
  },
  // 关卡5解锁
  {
    card_code: 'LF5-1T2',
    name: '冗余设计',
    description: '消耗：行动点2；效果：为目标区域添加"冗余保护"。该区域友方标记数量不会低于1，且设计缺陷类敌人的"故障模式触发"技能对该区域无效。持续3回合。',
    type: 'defense_in_depth' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 1, description: '冗余保护' }],
  },
  {
    card_code: 'LF5-2T2',
    name: '安全培训',
    description: '消耗：行动点3；效果：所有友方角色获得"安全意识"状态，持续2回合。在此期间，设计缺陷类敌人的所有技能对友方无效。',
    type: 'defense_in_depth' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 2, description: '安全培训' }],
  },
  // 关卡6解锁
  {
    card_code: 'LI6-1T2',
    name: '物理隔离',
    description: '消耗：行动点2；效果：选择一个区域进行物理隔离。该区域本回合内不受电磁脉冲攻击和远程控制干扰。工控攻击类敌人的技能对该区域无效。',
    type: 'active_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 1, description: '物理隔离' }],
  },
  {
    card_code: 'LI6-2T3',
    name: '控制器加固',
    description: '消耗：行动点3；效果：移除工控入侵者在指定区域的所有标记，并解除该区域的"被渗透"状态。工控入侵者的"基础设施渗透"技能冷却时间+1回合。',
    type: 'active_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 3 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 2, description: '控制器加固' }],
  },
  // 关卡7解锁
  {
    card_code: 'LF7-1T2',
    name: 'MAC地址随机化',
    description: '消耗：行动点2；效果：为目标区域添加"隐私保护"。探针盒子在该区域无法获得"信息碎片"，且探针盒子的标记在该区域效果减半。持续3回合。',
    type: 'defense_in_depth' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 1, description: '隐私保护' }],
  },
  {
    card_code: 'LF7-2T3',
    name: '隐私安全意识',
    description: '消耗：行动点3；效果：所有友方角色获得"隐私保护"状态，持续2回合。在此期间，隐私窃取类敌人的所有技能对友方无效。隐私窃贼失去所有"隐私卡"。',
    type: 'defense_in_depth' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 3 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 2, description: '隐私意识' }],
  },
  // 关卡8解锁
  {
    card_code: 'LI8-1T2',
    name: '多因素认证',
    description: '消耗：行动点2；效果：本回合内，所有友方标记免疫"被解密"效果。如果密码破解类敌人尝试使用"密码分析"技能，该技能反噬，敌人失去1个标记。',
    type: 'active_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 1, description: '多因素认证' }],
  },
  {
    card_code: 'LF8-1T3',
    name: '密钥更新',
    description: '消耗：行动点3；效果：解除所有区域的"古典密码"状态和"被解密"效果。所有友方角色获得"加密强化"状态，持续2回合，在此期间友方标记不会被转为敌方标记。',
    type: 'defense_in_depth' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 3 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 2, description: '密钥更新' }],
  },
  // 关卡9解锁
  {
    card_code: 'LI9-1T2',
    name: '异常行为检测',
    description: '消耗：行动点2；效果：揭示盗号黑手设置的所有"钓鱼陷阱"，并使其失效。每揭示一个陷阱，友方获得1行动点。',
    type: 'intrusion_detection' as CardType,
    faction: 'defense' as Faction,
    rarity: 'rare' as CardRarity,
    techLevel: 2 as TechLevel,
    cost: {},
    difficulty: 2,
    effects: [{ type: 'security_gain', baseValue: 1, description: '异常检测' }],
  },
  {
    card_code: 'LI9-2T3',
    name: '设备指纹识别',
    description: '消耗：行动点3；效果：移除做号集团在指定区域的所有标记，并解除该区域的"黑产运营"状态。做号集团的"批量产号"技能下回合无效。',
    type: 'active_defense' as CardType,
    faction: 'defense' as Faction,
    rarity: 'epic' as CardRarity,
    techLevel: 3 as TechLevel,
    cost: {},
    difficulty: 3,
    effects: [{ type: 'security_gain', baseValue: 2, description: '设备指纹' }],
  },
];

// ============================================
// 卡牌数据库导出
// ============================================

/** 完整卡牌数据库 */
export const CARD_DATABASE: Record<string, Card> = {};

// 注册防御方卡牌
[...DEFENDER_T1_CARDS, ...DEFENDER_T2_CARDS].forEach(card => {
  CARD_DATABASE[card.card_code] = card;
});

// 注册进攻方卡牌
[...ATTACKER_T1_CARDS, ...ATTACKER_T2_CARDS].forEach(card => {
  CARD_DATABASE[card.card_code] = card;
});

// 注册通用卡牌
NEUTRAL_CARDS.forEach(card => {
  CARD_DATABASE[card.card_code] = card;
});

// 注册关卡解锁卡牌
LEVEL_UNLOCK_CARDS.forEach(card => {
  CARD_DATABASE[card.card_code] = card;
});

/** 获取卡牌总数 */
export const TOTAL_CARD_COUNT = Object.keys(CARD_DATABASE).length;

/** 按阵营获取卡牌 */
export function getCardsByFaction(faction: Faction): Card[] {
  return Object.values(CARD_DATABASE).filter(card => card.faction === faction);
}

/** 按科技等级获取卡牌 */
export function getCardsByTechLevel(techLevel: TechLevel): Card[] {
  return Object.values(CARD_DATABASE).filter(card => card.techLevel === techLevel);
}

/** 按稀有度获取卡牌 */
export function getCardsByRarity(rarity: CardRarity): Card[] {
  return Object.values(CARD_DATABASE).filter(card => card.rarity === rarity);
}

/** 按类型获取卡牌 */
export function getCardsByType(type: CardType): Card[] {
  return Object.values(CARD_DATABASE).filter(card => card.type === type);
}

/** 搜索卡牌 */
export function searchCards(query: string): Card[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(CARD_DATABASE).filter(card => 
    card.name.toLowerCase().includes(lowerQuery) ||
    card.card_code.toLowerCase().includes(lowerQuery) ||
    card.description.toLowerCase().includes(lowerQuery)
  );
}

/** 获取卡牌详情 */
export function getCardByCode(cardCode: string): Card | undefined {
  return CARD_DATABASE[cardCode];
}

/** 获取关卡解锁卡牌 */
export function getLevelUnlockCards(level: number): Card[] {
  const prefix = `L`;
  return Object.values(CARD_DATABASE).filter(card => 
    card.card_code.startsWith(prefix) && 
    card.card_code.includes(`${level}-`)
  );
}

// 导出卡牌列表
export { 
  DEFENDER_T1_CARDS, 
  DEFENDER_T2_CARDS, 
  ATTACKER_T1_CARDS, 
  ATTACKER_T2_CARDS, 
  NEUTRAL_CARDS,
  LEVEL_UNLOCK_CARDS 
};
