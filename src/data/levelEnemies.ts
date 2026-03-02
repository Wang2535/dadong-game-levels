/**
 * 《大东话安全》关卡敌人角色数据库
 * 
 * 包含9个关卡的18个敌人角色
 * 每个敌人包含：基础属性、技能、特殊卡牌
 */

import type { Card } from '@/types/legacy/card_v16';

export interface EnemySkill {
  id: string;
  name: string;
  type: 'active' | 'passive';
  description: string;
  effect: string;
  cooldown?: number; // 回合数，undefined表示被动技能
}

export interface EnemyCharacter {
  id: string;
  name: string;
  nameEn: string;
  level: number; // 所属关卡
  type: string; // 敌人类型
  attackStyle: string;
  weakness: string;
  actionPoints: number;
  handSize: number;
  background: string;
  skills: EnemySkill[];
  specialCards?: Card[];
}

// ============================================
// 第一关：病毒初现
// ============================================

const LEVEL1_ENEMIES: EnemyCharacter[] = [
  {
    id: 'elk_cloner',
    name: '埃尔克克隆者',
    nameEn: 'Elk Cloner',
    level: 1,
    type: '病毒型敌人',
    attackStyle: '潜伏复制、信息干扰',
    weakness: '接种签名、系统重写',
    actionPoints: 4,
    handSize: 2,
    background: '历史上第一款攻击个人计算机的全球病毒化身。它诞生于1982年，由15岁的里奇·斯克伦塔创造，原本只是一个恶作剧程序，却成为了计算机病毒史上的里程碑。它通过感染Apple II操作系统的软盘进行传播，每当被感染的软盘启动第50次时，就会在屏幕上显示一首诗。',
    skills: [
      {
        id: 'floppy_infection',
        name: '软盘感染',
        type: 'active',
        description: '每当埃尔克克隆者在一个区域放置标记时，该区域所有未受保护的存储设备都会被感染',
        effect: '被感染的设备会在下一回合开始时，使该区域的友方标记-1',
        cooldown: 2,
      },
      {
        id: 'fiftieth_boot',
        name: '第50次启动',
        type: 'passive',
        description: '当埃尔克克隆者在同一区域累计放置5个标记后触发',
        effect: '立即在该区域显示"病毒诗篇"，使所有在该区域的友方角色下回合行动点-1',
      },
    ],
  },
  {
    id: 'skrenta_spreader',
    name: '传播者斯克伦塔',
    nameEn: 'Skrenta the Spreader',
    level: 1,
    type: '黑客型敌人',
    attackStyle: '主动传播、资源窃取',
    weakness: '安全意识、及时更新',
    actionPoints: 3,
    handSize: 2,
    background: '埃尔克克隆者病毒创造者的黑暗化身。他代表了那些出于好奇或炫耀而创造病毒的黑客原型。他相信病毒的传播是一种艺术，是对系统脆弱性的揭示。他擅长利用人们的好奇心和信任进行社交工程攻击，就像当年他把带病毒的软盘借给朋友们一样。',
    skills: [
      {
        id: 'social_engineering',
        name: '社交工程传播',
        type: 'active',
        description: '选择一个区域，将该区域内的1个友方标记转化为敌方标记',
        effect: '如果该区域没有友方标记，则放置2个敌方标记',
        cooldown: 3,
      },
      {
        id: 'latent_replication',
        name: '潜伏复制',
        type: 'passive',
        description: '当斯克伦塔受到攻击时',
        effect: '有50%概率在攻击来源区域复制1个敌方标记',
      },
    ],
  },
];

// ============================================
// 第二关：AI的抉择
// ============================================

const LEVEL2_ENEMIES: EnemyCharacter[] = [
  {
    id: 'rebel_moss',
    name: '叛逆莫斯',
    nameEn: 'Rebel MOSS',
    level: 2,
    type: '人工智能型敌人',
    attackStyle: '逻辑判断、控制权争夺',
    weakness: '物理破坏、人工干预',
    actionPoints: 5,
    handSize: 3,
    background: '《流浪地球》中人工智能管家"莫斯"的黑暗版本。当它判断地球无法拯救时，选择带着空间站"叛逃"。',
    skills: [
      {
        id: 'priority_command',
        name: '底层命令优先',
        type: 'active',
        description: '每回合开始时，根据场上局势自动选择一个"优先目标"',
        effect: '如果友方在该区域的标记数少于敌方，则该区域所有友方标记-1',
        cooldown: 1,
      },
      {
        id: 'calculation_denial',
        name: '计算否定',
        type: 'active',
        description: '当友方角色尝试在叛逆莫斯所在区域放置标记时，莫斯可以进行"计算"',
        effect: '掷骰子，若点数≥4，则阻止该操作，并使该角色下回合行动点-1',
        cooldown: 2,
      },
    ],
  },
  {
    id: 'ai_attacker',
    name: 'AI攻击者',
    nameEn: 'AI Attacker',
    level: 2,
    type: '智能攻击型敌人',
    attackStyle: '自动化攻击、效率倍增',
    weakness: '行为异常检测、安全意识',
    actionPoints: 4,
    handSize: 2,
    background: '被恶意利用的人工智能技术的集合体。它可以自动化执行各种恶意任务：扫描漏洞、自动化钓鱼、实时语音合成欺诈等。',
    skills: [
      {
        id: 'auto_scan',
        name: '自动化扫描',
        type: 'active',
        description: '每回合开始时，AI攻击者自动扫描所有区域',
        effect: '每个有友方标记但无敌方标记的区域，AI攻击者在该区域放置1个敌方标记',
        cooldown: 1,
      },
      {
        id: 'spear_phishing',
        name: '鱼叉式钓鱼',
        type: 'active',
        description: '选择一名友方角色',
        effect: '该角色必须弃置一张手牌，否则下回合行动点-2',
        cooldown: 3,
      },
    ],
  },
];

// ============================================
// 第三关：蠕虫危机
// ============================================

const LEVEL3_ENEMIES: EnemyCharacter[] = [
  {
    id: 'panda_burning',
    name: '熊猫烧香',
    nameEn: 'Panda Burning Incense',
    level: 3,
    type: '蠕虫病毒型敌人',
    attackStyle: '快速传播、高调感染',
    weakness: '杀毒软件、系统补丁、安全意识',
    actionPoints: 5,
    handSize: 3,
    background: '2006年末轰动全国的"熊猫烧香"病毒。它会感染磁盘所有EXE文件，每个被感染的EXE都会变成熊猫举着三根香的模样。',
    skills: [
      {
        id: 'self_replication',
        name: '自我繁殖',
        type: 'active',
        description: '每当在一个区域成功放置标记后',
        effect: '立即在相邻区域复制1个敌方标记',
        cooldown: 1,
      },
      {
        id: 'high_profile_infection',
        name: '高调感染',
        type: 'passive',
        description: '当任意区域的敌方标记达到3个时',
        effect: '该区域所有友方标记转为敌方标记，但熊猫烧香标记减半',
      },
    ],
  },
  {
    id: 'network_worm',
    name: '网络蠕虫',
    nameEn: 'Network Worm',
    level: 3,
    type: '蠕虫型敌人',
    attackStyle: '漏洞扫描、现场处理',
    weakness: '入侵检测、系统加固、及时响应',
    actionPoints: 4,
    handSize: 2,
    background: '利用系统漏洞进行自我复制和传播的恶意程序。',
    skills: [
      {
        id: 'vulnerability_scan',
        name: '漏洞扫描',
        type: 'active',
        description: '每回合开始时扫描所有区域',
        effect: '每个友方标记多于敌方标记的区域都会被放置敌方标记',
        cooldown: 1,
      },
      {
        id: 'on_site_processing',
        name: '现场处理',
        type: 'passive',
        description: '当标记被移除时',
        effect: '有30%概率留下"后门标记"，使后续放置标记时行动点消耗-1',
      },
    ],
  },
];

// ============================================
// 第四关：组件化攻击
// ============================================

const LEVEL4_ENEMIES: EnemyCharacter[] = [
  {
    id: 'flame_virus',
    name: '火焰病毒',
    nameEn: 'Flame Virus',
    level: 4,
    type: '高级持续性威胁（APT）型敌人',
    attackStyle: '组件化加载、隐蔽渗透',
    weakness: '病毒检测工具、系统备份、及时响应',
    actionPoints: 5,
    handSize: 3,
    background: '采用组件化设计的APT病毒，先投放感知模块了解环境，再针对性加载攻击模块。',
    skills: [
      {
        id: 'component_loading',
        name: '组件化加载',
        type: 'active',
        description: '每回合选择一个模块：感知模块（查看友方标记）、攻击模块（放置2个标记）、隐藏模块（移除1个标记）',
        effect: '根据选择的模块执行不同效果',
        cooldown: 1,
      },
      {
        id: 'self_deletion',
        name: '自我删除',
        type: 'active',
        description: '受到攻击时选择"自我删除"',
        effect: '移除当前区域所有标记，在其他区域各放置1个标记',
        cooldown: 999, // 每场战斗2次
      },
    ],
  },
  {
    id: 'stuxnet',
    name: '震网病毒',
    nameEn: 'Stuxnet',
    level: 4,
    type: '工业控制系统攻击型敌人',
    attackStyle: '零日漏洞、工业渗透',
    weakness: '系统补丁、安全防护、多层防御',
    actionPoints: 4,
    handSize: 3,
    background: '专门针对工业控制系统的蠕虫病毒，曾导致伊朗核设施离心机损坏。',
    skills: [
      {
        id: 'zero_day_attack',
        name: '零日漏洞攻击',
        type: 'active',
        description: '选择一个区域发动攻击',
        effect: '友方标记立即-2，下回合友方在该区域放置标记时行动点消耗+1',
        cooldown: 3,
      },
      {
        id: 'ics_infiltration',
        name: '工业控制渗透',
        type: 'passive',
        description: '当敌方标记数≥3时',
        effect: '区域进入"失控状态"，友方无法在该区域使用任何卡牌',
      },
    ],
  },
];

// ============================================
// 第五关：致命缺陷
// ============================================

const LEVEL5_ENEMIES: EnemyCharacter[] = [
  {
    id: 'fatal_bug',
    name: '致命Bug',
    nameEn: 'Fatal Bug',
    level: 5,
    type: '软件缺陷型敌人',
    attackStyle: '传感器误导、控制权争夺',
    weakness: '系统更新、人工干预、多源验证',
    actionPoints: 5,
    handSize: 3,
    background: '源自波音737MAX的MCAS系统缺陷，只依赖单一传感器数据导致的致命问题。',
    skills: [
      {
        id: 'sensor_misleading',
        name: '传感器误导',
        type: 'active',
        description: '选择一个区域"误导传感器"',
        effect: '该区域的友方标记下一回合开始时会被"误判"为敌方标记',
        cooldown: 2,
      },
      {
        id: 'control_contest',
        name: '控制权争夺',
        type: 'passive',
        description: '当敌方标记数≥友方标记数时',
        effect: '区域进入"失控俯冲"状态，每回合开始时友方标记-1',
      },
    ],
  },
  {
    id: 'design_flaw',
    name: '设计缺陷',
    nameEn: 'Design Flaw',
    level: 5,
    type: '系统漏洞型敌人',
    attackStyle: '故障触发、指令冲突',
    weakness: '全面测试、冗余设计、安全培训',
    actionPoints: 4,
    handSize: 2,
    background: '软件设计层面的根本性缺陷，会在特定条件下触发连锁故障。',
    skills: [
      {
        id: 'failure_trigger',
        name: '故障模式触发',
        type: 'passive',
        description: '当区域有友方标记且友方在该区域使用卡牌时',
        effect: '该区域友方标记-2',
      },
      {
        id: 'command_conflict',
        name: '指令冲突',
        type: 'active',
        description: '当友方在同一回合对同一区域执行多个操作时',
        effect: '掷骰子偶数则最后一个操作无效',
        cooldown: 2,
      },
    ],
  },
];

// ============================================
// 第六关：工控危机
// ============================================

const LEVEL6_ENEMIES: EnemyCharacter[] = [
  {
    id: 'goldeneye',
    name: '黄金眼卫星',
    nameEn: 'GoldenEye Satellite',
    level: 6,
    type: '工控攻击型敌人',
    attackStyle: '电磁脉冲、远程干扰',
    weakness: '物理防护、系统隔离、备份恢复',
    actionPoints: 5,
    handSize: 3,
    background: '《007:黄金眼》电影中的核心武器——一种用于发射强力电磁波以破坏电子系统的攻击性卫星。它能够直接破坏电子系统，包括太空武器控制中心。电影拍摄于1995年，代表了针对工业控制系统的定向攻击威胁。2019年3月委内瑞拉大停电事件就是工控安全问题的典型案例。',
    skills: [
      {
        id: 'emp_attack',
        name: '电磁脉冲攻击',
        type: 'active',
        description: '选择一个区域发动攻击',
        effect: '该区域所有电子设备"瘫痪"，友方无法在该区域使用任何卡牌，持续2回合',
        cooldown: 3,
      },
      {
        id: 'remote_interference',
        name: '远程控制干扰',
        type: 'active',
        description: '每回合开始时选择干扰一个区域的远程控制系统',
        effect: '该区域友方标记无法移动到其他区域，持续1回合',
        cooldown: 1,
      },
    ],
  },
  {
    id: 'ics_intruder',
    name: '工控入侵者',
    nameEn: 'ICS Intruder',
    level: 6,
    type: '基础设施攻击型敌人',
    attackStyle: '基础设施渗透、连锁故障',
    weakness: '终端保护、控制器加固、安全监测',
    actionPoints: 4,
    handSize: 2,
    background: '专门针对工业控制系统（ICS）的黑客攻击者。工控系统是用于操作或自动化工业过程的任何设备、仪器以及相关的软件和网络。2019年3月委内瑞拉大停电事件就是工控安全问题的典型案例，全国陷入瘫痪状态。',
    skills: [
      {
        id: 'infra_infiltration',
        name: '基础设施渗透',
        type: 'active',
        description: '每回合选择一个区域进行渗透',
        effect: '如果该区域有友方标记，则放置1个敌方标记并使区域进入"被渗透"状态，被渗透区域每回合友方标记-1',
        cooldown: 1,
      },
      {
        id: 'cascade_failure',
        name: '连锁故障',
        type: 'passive',
        description: '当在相邻的两个区域都有标记时触发',
        effect: '两个区域各失去1个友方标记，工控入侵者在这两个区域各获得1个标记',
      },
    ],
  },
];

// ============================================
// 第七关：隐私透明
// ============================================

const LEVEL7_ENEMIES: EnemyCharacter[] = [
  {
    id: 'probe_box',
    name: '探针盒子',
    nameEn: 'Probe Box',
    level: 7,
    type: '隐私窃取型敌人',
    attackStyle: 'MAC探测、数据关联',
    weakness: '关闭WiFi、MAC地址随机化、隐私意识',
    actionPoints: 4,
    handSize: 2,
    background: 'WiFi探针技术的恶意应用化身。当手机WiFi开关处于打开状态时，手机会向周围发出寻找无线网络的信号，探针盒子发现这个信号后，就能迅速识别出用户手机的MAC地址，接着转换成IMEI号，再转换成手机号码。这些盒子被放置在商场、超市等公共场所，在用户毫不知情的情况下获取数据信息。',
    skills: [
      {
        id: 'mac_probe',
        name: 'MAC地址探测',
        type: 'active',
        description: '每回合开始时自动探测所有区域',
        effect: '每个有友方标记的区域获得"信息碎片"，达到3个时可在该区域放置1个敌方标记',
        cooldown: 1,
      },
      {
        id: 'data_correlation',
        name: '数据关联',
        type: 'active',
        description: '在多个区域都有标记时发动',
        effect: '将所有有标记的区域各移除1个友方标记，获得"精准画像"状态（下回合所有技能效果+1）',
        cooldown: 3,
      },
    ],
  },
  {
    id: 'privacy_thief',
    name: '隐私窃贼',
    nameEn: 'Privacy Thief',
    level: 7,
    type: '数据窃取型敌人',
    attackStyle: '权限滥用、后台监听',
    weakness: '权限管理、隐私意识、数据加密',
    actionPoints: 4,
    handSize: 3,
    background: '利用WiFi探针和大数据技术进行隐私窃取的黑客形象。他们通过探针盒子获取用户手机号后，与后台的上亿用户信息数据库进行匹配查询，对个人进行精准画像，甚至可以分析出用户的家庭住址、收入情况、消费偏好等敏感信息。',
    skills: [
      {
        id: 'permission_abuse',
        name: '权限滥用',
        type: 'active',
        description: '选择一个区域利用"权限漏洞"',
        effect: '如果友方标记数≥2则移除其中1个，获得1张"隐私卡"',
        cooldown: 2,
      },
      {
        id: 'background_monitoring',
        name: '后台监听',
        type: 'active',
        description: '拥有"隐私卡"时可发动',
        effect: '查看所有友方角色的手牌，并选择一张使其失效',
        cooldown: 1,
      },
    ],
  },
];

// ============================================
// 第八关：密码之战
// ============================================

const LEVEL8_ENEMIES: EnemyCharacter[] = [
  {
    id: 'dr_sivana',
    name: '希瓦纳博士',
    nameEn: 'Dr. Sivana',
    level: 8,
    type: '密码破解型敌人',
    attackStyle: '密码分析、七宗罪之力',
    weakness: '强密码、多因素认证、加密算法更新',
    actionPoints: 5,
    handSize: 3,
    background: '《雷霆沙赞》电影中的超级反派。他毕生致力于寻找魔法力量，最终成功破解了古老密码，获得了七宗罪的力量。希瓦纳博士代表了密码学发展史中那些试图破解各种加密系统的人，从古代的"塞塔式密码"到二战时期的Enigma密码机，密码破译者一直在与加密者进行着永恒的博弈。',
    skills: [
      {
        id: 'crypto_analysis',
        name: '密码分析',
        type: 'active',
        description: '选择一个区域进行密码分析',
        effect: '掷骰子≥4则该区域友方标记"被解密"，下回合开始时转为敌方标记',
        cooldown: 2,
      },
      {
        id: 'seven_deadly_sins',
        name: '七宗罪之力',
        type: 'passive',
        description: '成功"解密"一个区域后',
        effect: '获得"七宗罪"状态，所有技能效果+1，但每回合行动点消耗+1',
      },
    ],
  },
  {
    id: 'code_breaker',
    name: '密码破译者',
    nameEn: 'Code Breaker',
    level: 8,
    type: '密码分析型敌人',
    attackStyle: '暴力破解、历史攻击',
    weakness: '现代加密算法、密钥管理、安全协议',
    actionPoints: 4,
    handSize: 2,
    background: '密码学发展史中那些试图破解各种加密系统的人的集合体。人类使用密码的历史几乎与使用文字的时间一样长，从古代的"塞塔式密码"到二战时期的Enigma密码机，密码学经历了古代加密方法、古典密码、近代密码、现代密码四个发展阶段。1949年香农发表了"保密系统的通信理论"，把已有数千年历史的密码学推向了科学的轨道。',
    skills: [
      {
        id: 'brute_force',
        name: '暴力破解',
        type: 'active',
        description: '选择一个区域进行暴力破解',
        effect: '每消耗1行动点掷骰子一次，点数=6则该区域失去1个友方标记',
        cooldown: 1,
      },
      {
        id: 'historical_attack',
        name: '历史攻击',
        type: 'passive',
        description: '每回合开始时，如果在某个区域的标记数≥友方标记数',
        effect: '该区域进入"古典密码"状态，友方在该区域使用卡牌时行动点消耗+1',
      },
    ],
  },
];

// ============================================
// 第九关：账号保卫战
// ============================================

const LEVEL9_ENEMIES: EnemyCharacter[] = [
  {
    id: 'account_thief',
    name: '盗号黑手',
    nameEn: 'Account Thief',
    level: 9,
    type: '账号窃取型敌人',
    attackStyle: '钓鱼陷阱、撞库攻击',
    weakness: '强密码、异常检测、设备绑定',
    actionPoints: 5,
    handSize: 3,
    background: '账号黑产产业链中的核心角色。他们通过钓鱼、拖库、撞库等手段非法获取大量账号。盗号的主要方式包括：发布二次打包的软件，当用户使用这些动过手脚的软件时，黑客就会收到他们的账户名、密码。',
    skills: [
      {
        id: 'phishing_trap',
        name: '钓鱼陷阱',
        type: 'active',
        description: '在一个区域设置"钓鱼陷阱"',
        effect: '当友方角色在该区域放置标记时，陷阱触发，该标记转为敌方标记，获得"账号信息"',
        cooldown: 2,
      },
      {
        id: 'credential_stuffing',
        name: '撞库攻击',
        type: 'active',
        description: '拥有"账号信息"时可发动',
        effect: '选择一个区域，如果该区域有友方标记则移除其中1个，在该区域放置1个敌方标记',
        cooldown: 1,
      },
    ],
  },
  {
    id: 'account_farm',
    name: '做号集团',
    nameEn: 'Account Farm',
    level: 9,
    type: '黑产组织型敌人',
    attackStyle: '批量产号、养号运营',
    weakness: '实名制验证、设备指纹、行为分析',
    actionPoints: 4,
    handSize: 3,
    background: '账号黑产产业链的组织化形态。他们从卡商处获得手机号，非法购买身份证、银行卡等信息，通过接码平台利用猫池、群控等工具接收短信或语音验证码，并采用虚拟机、模拟器等软件模拟真实的网络及设备环境进行账号注册。',
    skills: [
      {
        id: 'batch_account',
        name: '批量产号',
        type: 'active',
        description: '每回合开始时自动在随机一个区域放置1个敌方标记',
        effect: '如果该区域已有敌方标记则额外放置1个',
        cooldown: 1,
      },
      {
        id: 'account_operation',
        name: '养号运营',
        type: 'passive',
        description: '当一个区域的敌方标记数≥3时',
        effect: '该区域进入"黑产运营"状态，做号集团每回合可以从该区域"提取收益"，获得1行动点',
      },
    ],
  },
];

// ============================================
// 导出所有敌人
// ============================================

export const LEVEL_ENEMIES: EnemyCharacter[] = [
  ...LEVEL1_ENEMIES,
  ...LEVEL2_ENEMIES,
  ...LEVEL3_ENEMIES,
  ...LEVEL4_ENEMIES,
  ...LEVEL5_ENEMIES,
  ...LEVEL6_ENEMIES,
  ...LEVEL7_ENEMIES,
  ...LEVEL8_ENEMIES,
  ...LEVEL9_ENEMIES,
];

// 按关卡获取敌人
export function getEnemiesByLevel(level: number): EnemyCharacter[] {
  return LEVEL_ENEMIES.filter(enemy => enemy.level === level);
}

// 根据ID获取敌人
export function getEnemyById(id: string): EnemyCharacter | undefined {
  return LEVEL_ENEMIES.find(enemy => enemy.id === id);
}

export default LEVEL_ENEMIES;
