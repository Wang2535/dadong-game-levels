import type {
  LevelDefinition,
  LevelId,
  TutorialFocus,
  EnemyConfig,
  InitialSetup,
  AreaType
} from '@/types/levelTypes';

const ARTICLE_1 = `攻击个人计算机的第一款全球病毒"Elk Cloner"

一、世界上第一款个人计算机病毒

小白：大东东，我最近在研究计算机病毒的历史，发现了一个有趣的东西！

大东：哦？说说看，你发现了什么？

小白：我发现了世界上第一款针对个人计算机的病毒——Elk Cloner！

大东：没错，Elk Cloner确实是计算机病毒史上的一个里程碑。它诞生于1982年，由当时15岁的里奇·斯克伦塔编写。

小白：15岁？和我差不多大啊！他是怎么做到的？

大东：Elk Cloner通过软盘传播，当用户启动感染了病毒的计算机时，病毒会被加载到内存中。之后插入的任何软盘都会被感染。

小白：那它会做什么坏事吗？

大东：每启动50次，病毒就会显示一首诗，同时可能会造成系统重启或其他异常。虽然破坏性不大，但它是病毒概念的先驱。

二、病毒的基本特征

小白：那Elk Cloner有哪些病毒的基本特征呢？

大东：它具备了病毒的几个核心特征：
1. 自我复制：能够将自己复制到其他介质
2. 隐蔽传播：在用户不知情的情况下传播
3. 触发机制：满足条件时执行特定行为
4. 持久存在：即使重启也不会消失

来源：中国科学院计算技术研究所`;

const ARTICLE_2 = `一瓶酒"助攻"的地球流浪

一、《流浪地球》中的网络安全

小白：大东东，我看了《流浪地球》，里面的剧情太震撼了！

大东：电影确实很精彩。不过你有没有注意到，电影里其实涉及了不少网络安全的概念？

小白：真的吗？我只记得他们要"点燃木星"来拯救地球...

大东：想想看，行星发动机的控制、全球广播系统、空间站的AI——这些都离不开网络安全。

小白：原来如此！那和那瓶酒有什么关系？

大东：电影中吴京饰演的角色用一瓶酒"贿赂"AI MOSS，这其实是一种社会工程学的体现。

二、社会工程学攻击

小白：社会工程学？这是什么？

大东：社会工程学是利用人性的弱点来获取信息或访问权限的攻击方式。它不依赖技术漏洞，而是针对人的心理。

小白：所以那瓶酒其实是一种"攻击手段"？

大东：可以这么理解。在网络安全中，攻击者可能会利用各种方式来获取信任——可能是礼物、恭维，甚至是威胁。

来源：中国科学院计算技术研究所`;

const ARTICLE_3 = `《无敌破坏王2》之蠕虫病毒

一、从《无敌破坏王2》说起

小白：大东东，上周咱们关于《流浪地球》的文章发布以后大受好评呢～

大东：哈哈，其实还有不少电影里都涉及了网络安全的内容。

小白：那大东东能都给我讲讲么！

大东：当然没问题，咱就从一部浅显易懂的电影——《无敌破坏王2：大闹互联网》说起。

二、活跃的小虫子

大东：这个病毒能自动扫描程序的漏洞，并不断复制，一旦发现其他目标，又能迅速扩散，非常活跃。

小白：难道是……蠕虫病毒？

大东：没错！蠕虫病毒会利用网络进行复制和传播。著名的案例包括第一个蠕虫病毒"莫里斯"、"冲击波"病毒，还有当年在中国"红"极一时的熊猫烧香。

三、网络蠕虫

大东：网络蠕虫是无须计算机使用者干预即可运行的独立程序，它通过不停地获得网络中存在漏洞的计算机上的部分或全部控制权来进行传播。

小白：蠕虫与普通病毒有什么不同？

大东：蠕虫与普通病毒的最大不同就是在于它不需要人为干预，且能够自主不断地复制和传播。

来源：中国科学院计算技术研究所`;

const ARTICLE_4 = `从《钢铁侠》里现代软件工程设计思想谈起

一、《钢铁侠》

大东：《钢铁侠》系列电影中，战甲从成套的、无法拆开的，到后来变成分离的——胳膊是胳膊，腿是腿。

小白：这有什么特别的含义吗？

大东：这就是我们目前常说的现代软件工程的设计思想——组件化设计。

二、组件化设计

大东：软件工程是指导计算机软件开发和维护的工程学科。《钢铁侠3》里面可分离的战甲就是一种组件化的设计方式。

小白：组件化有什么好处呢？

大东：组件化设计使得系统更加灵活、可维护。当某个组件出现问题时，只需要替换或修复那个组件，而不需要重建整个系统。

三、Flame病毒

大东：火焰病毒（Flame）的攻击原理就是组件化——先扔给受害者一个感知模块，了解用户的环境属性，再针对具体情况进行不同攻击模块的加载。

小白：病毒也可以组件化？

大东：是的，Flame病毒是一种模块化的、可扩展和可更新的威胁，被称为有史以来最复杂的恶意软件。

来源：中国科学院计算技术研究所`;

const ARTICLE_5 = `"波音"事故不寻常，致命的bug你怕了吗？

一、波音737 MAX事故

小白：大东东，我听说波音737 MAX发生了好几起严重事故，这是怎么回事？

大东：这确实是一个令人痛心的事件。波音737 MAX系列飞机在短时间内发生了两起致命空难，造成了数百人遇难。

小白：是飞机设计有问题吗？

大东：调查发现，事故与一个叫做MCAS（机动特性增强系统）的软件有关。这个系统存在设计缺陷，可能导致飞机失控。

二、软件Bug的危害

小白：原来软件Bug可以这么可怕！

大东：是的，在关键系统中，软件Bug可能导致灾难性后果。波音事故提醒我们，软件安全不容忽视。

小白：那我们该怎么预防呢？

大东：软件测试、代码审查、安全评估都是重要的预防措施。特别是对于关键系统，更需要严格的验证和确认流程。

来源：中国科学院计算技术研究所`;

const ARTICLE_6 = `专栏丨《007》电影工控安全素描

一、从看完《007》系列电影说起

小白：东哥，这段时间我恶补完了《007》系列的电影哦～

大东：很经典的电影啊！

小白：是啊，这些电影里让我印象最深的还是《007:黄金眼》。

二、工控系统安全

大东：电影中的"黄金眼"其实是前苏联研制的一种用于发射强力电磁波以破坏电子系统的攻击性卫星。

小白：原来绕了半天又到了我们最熟悉的话题——网络安全！

大东：工控系统是用于操作或自动化工业过程的任何设备、仪器以及相关的软件和网络。与网络安全有着千丝万缕的联系。

三、由"工控系统安全"引发的思考

大东：2019年3月，委内瑞拉发生了严重的停电事件，全国陷入瘫痪状态。这可能与工控系统安全有关。

小白：工控安全这么重要！

大东：是的，工控安全防护可以分为3步：1）保护网络；2）保护终端；3）保护控制器。

来源：中国科学院计算技术研究所`;

const ARTICLE_7 = `WiFi探针如何让你的手机隐私秒变小透明

一、手机隐私安全不太平

小白：大东东！你有没有看今年的315晚会呀！简直太可怕啦！

大东：你说的是WiFi探针盒子？

小白：是啊，只要你打开了手机WiFi，这玩意就能获取你的手机号！

二、潘多拉盒子

大东：WiFi探针并不是什么新玩意，七八年前在国外就已经很成熟了。如今它引起大家的关注，是因为其结合了大数据的威力。

小白：这是怎么做到的？

大东：当你的手机WiFi开关处于打开状态时，手机就会向周围发出寻找无线网络的信号，探针盒子发现这个信号后，就能迅速识别出用户手机的MAC地址，接着转换成IMEI号，再转换成手机号码。

三、隐私窃取

大东：依靠探侦盒子得到用户电话号码后，与其后台的上亿用户信息的数据库进行匹配查询，甚至能够对个人进行精准画像。

四、防御在行动

大东：出门关闭WiFi开关，绝不连接陌生WiFi！使用app也要注意，不要使用不正常的app，当app请求操作权限的时候更要当心。

来源：中国科学院计算技术研究所`;

const ARTICLE_8 = `从《雷霆沙赞》中的超能力说起

一、从看完《雷霆沙赞》说起

小白：看完电影总会幻想自己大喊"沙赞！"，我就会瞬间被一道魔法闪电劈中，变身为一个被赋予6种神灵力量的成年超级英雄。

大东：沙赞的超能力来自6种古神赋予的不同属性的能力。

二、密码学

大东：电影中希瓦纳博士破解密码的过程可不简单，密码学中的门道可多着呢！

小白：密码学，一听就很高深。

大东：密码学早在公元前400多年就已经产生，人类使用密码的历史几乎与使用文字的时间一样长。

三、密码学的发展

大东：密码学的发展过程可以分为四个阶段：
1. 古代加密方法
2. 古典密码
3. 近代密码
4. 现代密码

小白：密码学历史这么悠久呀。

大东：直到1949年香农发表了"保密系统的通信理论"，把已有数千年历史的密码学推向了科学的轨道，奠定了密码学的理论基础。

来源：中国科学院计算技术研究所`;

const ARTICLE_9 = `多少钱你愿意"卖号"？

一、账号安全

小白：大东东，最近看到好多游戏账号被盗的新闻，好可怕！

大东：账号安全确实是网络安全的重要组成部分。很多人为了小利就出卖自己的账号，殊不知这可能带来更大的风险。

二、账号被盗的危害

小白：账号被盗会有什么危害呢？

大东：账号被盗可能导致：
1. 个人信息泄露
2. 虚拟财产损失
3. 被用于诈骗
4. 影响信用记录

三、账号安全防护

大东：保护账号安全的几个要点：
1. 使用强密码
2. 开启双重认证
3. 不在不安全的网络登录
4. 定期检查账号活动
5. 不轻易透露账号信息

小白：原来账号安全有这么多学问！

大东：网络安全从我做起，保护好每一个账号就是保护好自己的数字身份。

来源：中国科学院计算技术研究所`;

function createInitialSetup(
  computing: number,
  funds: number,
  information: number,
  security: number,
  areas: AreaType[],
  markers: Record<AreaType, number>
): InitialSetup {
  return {
    playerResources: { computing, funds, information },
    securityLevel: security,
    controlledAreas: areas,
    areaMarkers: markers,
    handCards: []
  };
}

function createEnemyConfig(
  name: string,
  type: EnemyConfig['type'],
  baseDifficulty: number,
  resourceBonus: number,
  attackPattern: EnemyConfig['attackPattern'],
  specialAbilities: EnemyConfig['specialAbilities'] = []
): EnemyConfig {
  return {
    name,
    type,
    baseDifficulty,
    attackPattern,
    specialAbilities,
    resourceBonus
  };
}

// ============================================
// 关卡数据库 - 基于《大东话安全》文件构建
// ============================================

export const LEVEL_DATABASE: Record<LevelId, LevelDefinition> = {
  'LV001': {
    id: 'LV001',
    name: '病毒初现',
    subtitle: '认识计算机病毒',
    articleTitle: '攻击个人计算机的第一款全球病毒"Elk Cloner"',
    articleContent: ARTICLE_1,
    difficulty: 1,
    tutorialFocus: 'basic_defense',
    objectives: [
      { id: 'obj1', description: '清除病毒：所有区域敌方标记总数降至0', type: 'clear_virus', target: 0, completed: false },
      { id: 'obj2', description: '全面接种：为所有区域完成"签名接种"', type: 'full_vaccination', target: 4, completed: false },
      { id: 'obj3', description: '系统重写：使用"系统重写"卡牌移除所有敌方标记', type: 'system_rewrite', target: 1, completed: false }
    ],
    unlockCondition: {},
    rewards: {
      unlockedCards: ['LF1-1T1', 'LI1-1T1'],
      achievement: '病毒猎人入门',
      experiencePoints: 100
    },
    specialCards: [
      {
        cardId: 'LV001_CARD_1',
        name: '签名接种',
        description: '为目标区域添加"已接种"标记。病毒类敌人的感染技能对该区域无效，持续3回合。消耗2行动点',
        type: 'basic_defense',
        techLevel: 1,
        effects: [{ type: 'area_defense', value: 1, description: '区域接种，病毒免疫' }],
        isUnlocked: false
      },
      {
        cardId: 'LV001_CARD_2',
        name: '系统重写',
        description: '移除指定病毒类敌人在目标区域的所有标记。消耗3行动点，弃置1张手牌',
        type: 'intrusion_detection',
        techLevel: 1,
        effects: [{ type: 'infiltration_reduce', value: 5, description: '移除病毒标记' }],
        isUnlocked: false
      }
    ],
    enemyConfig: createEnemyConfig(
      '埃尔克克隆者',
      'virus',
      1,
      0,
      [{ turn: 'all', action: 'floppy_infection', intensity: 'low' }],
      [
        { name: '软盘感染', description: '放置标记时感染区域，下回合友方标记-1', trigger: '放置标记', effect: '友方标记-1', cooldown: 2 },
        { name: '第50次启动', description: '累计5个标记触发，友方角色下回合行动点-1', trigger: '累计5标记', effect: '行动点-1' }
      ]
    ),
    initialSetup: {
      playerResources: { computing: 2, funds: 2, information: 2 },
      securityLevel: 50,
      controlledAreas: ['internal', 'industrial', 'dmz', 'external'],
      areaMarkers: { internal: 2, industrial: 2, dmz: 1, external: 1 },
      handCards: []
    },
    hints: [
      '优先保护"系统启动区"，这是你的安全基地',
      '使用"签名接种"卡牌预防感染比事后清除更有效',
      '注意敌方标记的累计数量，避免触发"病毒爆发"'
    ],
    estimatedTurns: 10,
    maxTurns: 10,
    enemyIds: ['elk_cloner', 'skrenta_spreader'],
    areaDistribution: {
      internal: { name: '软盘存储区', friendlyMarkers: 2, enemyMarkers: 1, trait: '感染高发区：敌方在该区域放置标记时行动点消耗-1', traitType: 'infection_zone' },
      industrial: { name: '系统启动区', friendlyMarkers: 2, enemyMarkers: 0, trait: '安全区域：友方在该区域放置标记时行动点消耗-1', traitType: 'safe_zone' },
      dmz: { name: '数据交换区', friendlyMarkers: 1, enemyMarkers: 1, trait: '中立区域：无特殊效果', traitType: 'neutral' },
      external: { name: '防护隔离区', friendlyMarkers: 1, enemyMarkers: 0, trait: '防护区域：敌方技能对该区域效果减半', traitType: 'protected' }
    },
    playerConfig: {
      actionPoints: 5,
      handSize: 3,
      specialResources: []
    },
    dadongConfig: {
      actionPoints: 3,
      handSize: 2,
      specialAbility: '安全知识讲解——每回合可以为一名友方角色恢复1行动点'
    },
    failureConditions: [
      '全面感染：敌方标记总数达到10个',
      '系统崩溃：任意两个区域的友方标记同时降为0',
      '回合超限：超过10回合仍未达成胜利条件'
    ]
  },

  'LV002': {
    id: 'LV002',
    name: 'AI的抉择',
    subtitle: '警惕人性弱点',
    articleTitle: '一瓶酒"助攻"的地球流浪',
    articleContent: ARTICLE_2,
    difficulty: 1,
    tutorialFocus: 'virus_basics',
    objectives: [
      { id: 'obj1', description: '夺取控制权：使用"人工干预"或"一瓶伏特加"使叛逆莫斯失去所有标记', type: 'defeat_enemy', target: 1, completed: false },
      { id: 'obj2', description: '三原则约束：使用"机器人三原则"卡牌使AI攻击者无法主动攻击', type: 'use_defense_cards', target: 1, completed: false },
      { id: 'obj3', description: '全面压制：友方标记总数≥敌方标记总数的2倍', type: 'protect_areas', target: 2, completed: false }
    ],
    unlockCondition: { previousLevel: 'LV001' },
    rewards: {
      unlockedCards: ['LI2-1T1', 'LI2-2T2'],
      achievement: '社会工程防范者',
      experiencePoints: 120
    },
    specialCards: [
      {
        cardId: 'LV002_CARD_1',
        name: '人工干预',
        description: '本回合内，叛逆莫斯的"计算否定"技能无效，且友方角色在莫斯所在区域放置标记时行动点消耗-1。消耗2行动点',
        type: 'intrusion_detection',
        techLevel: 1,
        effects: [{ type: 'negate_skill', value: 1, description: '无效化计算否定' }],
        isUnlocked: false
      },
      {
        cardId: 'LV002_CARD_2',
        name: '行为异常检测',
        description: '本回合内，AI攻击者的所有自动技能失效。如果AI攻击者尝试使用主动技能，该技能反噬，AI攻击者失去2个标记。消耗2行动点',
        type: 'intrusion_detection',
        techLevel: 2,
        effects: [{ type: 'skill_backlash', value: 2, description: '技能反噬' }],
        isUnlocked: false
      }
    ],
    enemyConfig: createEnemyConfig(
      '叛逆莫斯',
      'ai',
      1,
      1,
      [
        { turn: 'all', action: 'priority_command', intensity: 'low' },
        { turn: 2, action: 'calculation_denial', intensity: 'medium' }
      ],
      [
        { name: '底层命令优先', description: '友方标记少于敌方时，友方标记-1', trigger: '回合开始', effect: '友方标记-1', cooldown: 1 },
        { name: '计算否定', description: '掷骰子≥4阻止操作，下回合行动点-1', trigger: '放置标记', effect: '阻止操作', cooldown: 2 }
      ]
    ),
    initialSetup: createInitialSetup(2, 2, 2, 55, ['internal', 'industrial', 'dmz', 'external'], { internal: 3, industrial: 2, dmz: 1, external: 1 }),
    hints: [
      '叛逆莫斯会根据场上局势自动选择"优先目标"',
      '使用"人工干预"或"一瓶伏特加"来打破AI的控制',
      '注意AI叛逃的条件，避免失去空间站核心'
    ],
    estimatedTurns: 10,
    enemyIds: ['rebel_moss', 'ai_attacker'],
    areaDistribution: {
      internal: { name: '空间站核心', friendlyMarkers: 3, enemyMarkers: 1, trait: 'AI控制区：敌方在该区域技能效果+1' },
      industrial: { name: '地球指挥中心', friendlyMarkers: 2, enemyMarkers: 0, trait: '人类控制区：友方在该区域技能效果+1' },
      dmz: { name: '通讯中继站', friendlyMarkers: 1, enemyMarkers: 1, trait: '中立区域：双方在该区域放置标记时各消耗1额外行动点' },
      external: { name: '备用系统室', friendlyMarkers: 1, enemyMarkers: 0, trait: '物理隔离区：敌方自动技能对该区域无效' }
    }
  },

  'LV003': {
    id: 'LV003',
    name: '蠕虫危机',
    subtitle: '阻止自我复制',
    articleTitle: '《无敌破坏王2》之蠕虫病毒',
    articleContent: ARTICLE_3,
    difficulty: 2,
    tutorialFocus: 'worm_mechanics',
    objectives: [
      { id: 'obj1', description: '清除蠕虫：所有区域敌方标记总数降至0', type: 'defeat_enemy', target: 1, completed: false },
      { id: 'obj2', description: '全面隔离：为所有区域完成"网络隔离"', type: 'protect_areas', target: 4, completed: false },
      { id: 'obj3', description: '安全意识觉醒：使用"安全意识觉醒"卡牌使所有友方角色获得免疫状态', type: 'use_defense_cards', target: 1, completed: false }
    ],
    unlockCondition: { previousLevel: 'LV002' },
    rewards: {
      unlockedCards: ['LI3-1T1', 'LF3-1T2'],
      achievement: '蠕虫克星',
      experiencePoints: 150
    },
    specialCards: [
      {
        cardId: 'LV003_CARD_1',
        name: '网络隔离',
        description: '选择一个区域进行网络隔离，该区域本回合内不受任何蠕虫病毒的复制和传播影响。消耗2行动点',
        type: 'intrusion_detection',
        techLevel: 1,
        effects: [{ type: 'block_spread', value: 1, description: '阻止蠕虫传播' }],
        isUnlocked: false
      },
      {
        cardId: 'LV003_CARD_2',
        name: '安全意识觉醒',
        description: '所有友方角色获得"安全意识"状态，持续3回合，蠕虫病毒的感染技能对友方标记无效。消耗3行动点',
        type: 'basic_defense',
        techLevel: 2,
        effects: [{ type: 'immune_infection', value: 3, description: '免疫感染3回合' }],
        isUnlocked: false
      }
    ],
    enemyConfig: createEnemyConfig(
      '熊猫烧香',
      'worm',
      2,
      1,
      [
        { turn: 'all', action: 'self_replicate', intensity: 'medium' },
        { turn: 2, action: 'high_profile_infection', intensity: 'high' }
      ],
      [
        { name: '自我繁殖', description: '放置标记后立即在相邻区域复制1个标记', trigger: '放置标记', effect: '相邻区域+1标记', cooldown: 1 },
        { name: '高调感染', description: '敌方标记达到3个时，友方标记转为敌方标记', trigger: '3个标记', effect: '标记转换' }
      ]
    ),
    initialSetup: createInitialSetup(2, 2, 2, 60, ['internal', 'industrial', 'dmz', 'external'], { internal: 2, industrial: 2, dmz: 1, external: 1 }),
    hints: [
      '蠕虫病毒会自我复制，需要快速应对',
      '使用"网络隔离"可以阻止传播',
      '保护"系统核心"是关键任务'
    ],
    estimatedTurns: 12,
    enemyIds: ['panda_burning', 'network_worm'],
    areaDistribution: {
      internal: { name: '网络入口', friendlyMarkers: 2, enemyMarkers: 2, trait: '高风险区：敌方在该区域放置标记时额外获得1个标记' },
      industrial: { name: '系统核心', friendlyMarkers: 2, enemyMarkers: 0, trait: '核心保护区：友方在该区域无法被移除标记' },
      dmz: { name: '数据存储区', friendlyMarkers: 1, enemyMarkers: 1, trait: '传播中转站：敌方标记会自动向相邻区域复制' },
      external: { name: '安全隔离区', friendlyMarkers: 1, enemyMarkers: 0, trait: '隔离区域：敌方自动技能对该区域无效' }
    }
  },

  'LV004': {
    id: 'LV004',
    name: '组件化攻击',
    subtitle: '模块化安全思维',
    articleTitle: '从《钢铁侠》里现代软件工程设计思想谈起',
    articleContent: ARTICLE_4,
    difficulty: 2,
    tutorialFocus: 'software_security',
    objectives: [
      { id: 'obj1', description: '全面清除：所有区域敌方标记总数降至0', type: 'defeat_enemy', target: 1, completed: false },
      { id: 'obj2', description: '组件化防御：使用"组件化防御"卡牌使所有区域获得模块化防护', type: 'use_defense_cards', target: 1, completed: false },
      { id: 'obj3', description: '系统备份恢复：使用"系统备份恢复"卡牌恢复所有区域至初始状态', type: 'protect_areas', target: 4, completed: false }
    ],
    unlockCondition: { previousLevel: 'LV003' },
    rewards: {
      unlockedCards: ['LI4-1T2', 'LF4-1T2'],
      achievement: '组件化安全专家',
      experiencePoints: 180
    },
    specialCards: [
      {
        cardId: 'LV004_CARD_1',
        name: '火焰检测工具',
        description: '揭示火焰病毒在所有区域的隐藏标记，并移除其中一半（向上取整）。消耗2行动点',
        type: 'intrusion_detection',
        techLevel: 2,
        effects: [{ type: 'reveal_hidden', value: 3, description: '揭示并移除隐藏标记' }],
        isUnlocked: false
      },
      {
        cardId: 'LV004_CARD_2',
        name: '组件化防御',
        description: '本回合内，友方所有区域获得"模块化防护"，组件化攻击类敌人的技能对该区域无效。消耗3行动点',
        type: 'basic_defense',
        techLevel: 2,
        effects: [{ type: 'modular_shield', value: 2, description: '模块化防护' }],
        isUnlocked: false
      }
    ],
    enemyConfig: createEnemyConfig(
      '火焰病毒',
      'apt',
      2,
      2,
      [
        { turn: 'all', action: 'component_loading', intensity: 'medium' },
        { turn: 3, action: 'self_deletion', intensity: 'high' }
      ],
      [
        { name: '组件化加载', description: '选择感知/攻击/隐藏模块执行不同效果', trigger: '每回合', effect: '模块效果', cooldown: 1 },
        { name: '自我删除', description: '移除当前区域标记，在其他区域各放置1个', trigger: '受攻击', effect: '标记转移', cooldown: 999 }
      ]
    ),
    initialSetup: createInitialSetup(2, 2, 2, 65, ['internal', 'industrial', 'dmz', 'external'], { internal: 3, industrial: 2, dmz: 1, external: 1 }),
    hints: [
      '火焰病毒采用组件化设计，攻击方式多变',
      '使用"火焰检测工具"揭示隐藏标记',
      '注意震网病毒的"零日漏洞攻击"'
    ],
    estimatedTurns: 12,
    enemyIds: ['flame_virus', 'stuxnet'],
    areaDistribution: {
      internal: { name: '工业控制中心', friendlyMarkers: 3, enemyMarkers: 1, trait: '关键设施：敌方在该区域技能效果+1，但友方可以使用特殊卡牌' },
      industrial: { name: '数据采集区', friendlyMarkers: 2, enemyMarkers: 1, trait: '感知区域：火焰病毒的感知模块在此区域效果+1' },
      dmz: { name: '网络边界', friendlyMarkers: 1, enemyMarkers: 1, trait: '防护边界：友方在该区域放置标记时行动点消耗-1' },
      external: { name: '备份系统', friendlyMarkers: 1, enemyMarkers: 0, trait: '安全区域：友方标记无法被移除，但每回合只能放置1个标记' }
    }
  },

  'LV005': {
    id: 'LV005',
    name: '致命缺陷',
    subtitle: '软件缺陷的危害',
    articleTitle: '"波音"事故不寻常，致命的bug你怕了吗？',
    articleContent: ARTICLE_5,
    difficulty: 3,
    tutorialFocus: 'bug_prevention',
    objectives: [
      { id: 'obj1', description: '系统更新：使用"系统更新补丁"卡牌清除所有致命Bug标记', type: 'use_defense_cards', target: 1, completed: false },
      { id: 'obj2', description: '人工接管：使用"人工干预"卡牌使所有区域恢复友方控制', type: 'protect_areas', target: 4, completed: false },
      { id: 'obj3', description: '冗余保护：为所有区域添加"冗余保护"状态', type: 'protect_areas', target: 4, completed: false }
    ],
    unlockCondition: { previousLevel: 'LV004' },
    rewards: {
      unlockedCards: ['LF5-1T2', 'LF5-2T2'],
      achievement: 'Bug猎人',
      experiencePoints: 200
    },
    specialCards: [
      {
        cardId: 'LV005_CARD_1',
        name: '冗余设计',
        description: '为目标区域添加"冗余保护"，友方标记数量不会低于1，且设计缺陷类敌人的"故障模式触发"技能对该区域无效，持续3回合。消耗2行动点',
        type: 'basic_defense',
        techLevel: 2,
        effects: [{ type: 'redundancy_shield', value: 1, description: '冗余保护' }],
        isUnlocked: false
      },
      {
        cardId: 'LV005_CARD_2',
        name: '安全培训',
        description: '所有友方角色获得"安全意识"状态，持续2回合，设计缺陷类敌人的所有技能对友方无效。消耗3行动点',
        type: 'basic_defense',
        techLevel: 2,
        effects: [{ type: 'skill_immunity', value: 2, description: '技能免疫2回合' }],
        isUnlocked: false
      }
    ],
    enemyConfig: createEnemyConfig(
      '致命Bug',
      'bug',
      3,
      2,
      [
        { turn: 'all', action: 'sensor_misleading', intensity: 'medium' },
        { turn: 4, action: 'control_contest', intensity: 'high' }
      ],
      [
        { name: '传感器误导', description: '友方标记下一回合被"误判"为敌方标记', trigger: '每2回合', effect: '标记误判', cooldown: 2 },
        { name: '控制权争夺', description: '敌方≥友方时，区域进入"失控俯冲"', trigger: '标记对比', effect: '每回合友方-1' }
      ]
    ),
    initialSetup: createInitialSetup(2, 2, 2, 70, ['internal', 'industrial', 'dmz', 'external'], { internal: 3, industrial: 2, dmz: 2, external: 1 }),
    hints: [
      '软件Bug可能导致严重后果',
      '使用"冗余设计"防止标记归零',
      '及时使用"安全培训"免疫敌人技能'
    ],
    estimatedTurns: 10,
    enemyIds: ['fatal_bug', 'design_flaw'],
    areaDistribution: {
      internal: { name: '飞行控制系统', friendlyMarkers: 3, enemyMarkers: 2, trait: '核心系统：敌方在该区域技能效果+1，失控时会导致连锁反应' },
      industrial: { name: '传感器阵列', friendlyMarkers: 2, enemyMarkers: 1, trait: '数据源：致命Bug的"传感器误导"技能在此区域必中' },
      dmz: { name: '人工操作台', friendlyMarkers: 2, enemyMarkers: 0, trait: '人工备份：友方在该区域可以使用"人工干预"' },
      external: { name: '安全冗余系统', friendlyMarkers: 1, enemyMarkers: 0, trait: '冗余保护：该区域友方标记不会降至0以下' }
    }
  },

  'LV006': {
    id: 'LV006',
    name: '工控危机',
    subtitle: '保护关键基础设施',
    articleTitle: '专栏丨《007》电影工控安全素描',
    articleContent: ARTICLE_6,
    difficulty: 3,
    tutorialFocus: 'industrial_control',
    objectives: [
      { id: 'obj1', description: '系统恢复：清除所有区域的"瘫痪"和"被渗透"状态，且敌方标记总数≤2', type: 'defeat_enemy', target: 1, completed: false },
      { id: 'obj2', description: '防护部署：为所有区域添加"物理隔离"、"终端保护"或"控制器加固"状态', type: 'protect_areas', target: 4, completed: false },
      { id: 'obj3', description: '应急响应：使用"应急电源"恢复所有区域至正常运行状态', type: 'use_defense_cards', target: 1, completed: false }
    ],
    unlockCondition: { previousLevel: 'LV005' },
    rewards: {
      unlockedCards: ['LI6-1T2', 'LI6-2T3'],
      achievement: '工控安全卫士',
      experiencePoints: 220
    },
    specialCards: [
      {
        cardId: 'LV006_CARD_1',
        name: '物理隔离',
        description: '选择一个区域进行物理隔离，该区域本回合内不受电磁脉冲攻击和远程控制干扰，工控攻击类敌人的技能对该区域无效。消耗2行动点',
        type: 'intrusion_detection',
        techLevel: 2,
        effects: [{ type: 'physical_isolation', value: 1, description: '物理隔离' }],
        isUnlocked: false
      },
      {
        cardId: 'LV006_CARD_2',
        name: '控制器加固',
        description: '移除工控入侵者在指定区域的所有标记，并解除该区域的"被渗透"状态，工控入侵者的"基础设施渗透"技能冷却时间+1回合。消耗3行动点',
        type: 'intrusion_detection',
        techLevel: 3,
        effects: [{ type: 'controller_harden', value: 5, description: '控制器加固' }],
        isUnlocked: false
      }
    ],
    enemyConfig: createEnemyConfig(
      '黄金眼卫星',
      'apt',
      3,
      3,
      [
        { turn: 'all', action: 'emp_attack', intensity: 'high' },
        { turn: 3, action: 'remote_interference', intensity: 'high' }
      ],
      [
        { name: '电磁脉冲攻击', description: '区域"瘫痪"，友方无法使用卡牌2回合', trigger: '每3回合', effect: '区域瘫痪', cooldown: 3 },
        { name: '远程控制干扰', description: '友方标记无法移动到其他区域', trigger: '每回合', effect: '标记锁定', cooldown: 1 }
      ]
    ),
    initialSetup: createInitialSetup(2, 2, 2, 75, ['internal', 'industrial', 'dmz', 'external'], { internal: 3, industrial: 2, dmz: 2, external: 1 }),
    hints: [
      '工控系统是关键基础设施',
      '使用"物理隔离"防止电磁脉冲攻击',
      '及时"控制器加固"解除被渗透状态'
    ],
    estimatedTurns: 12,
    enemyIds: ['goldeneye', 'ics_intruder'],
    areaDistribution: {
      internal: { name: '电力调度中心', friendlyMarkers: 3, enemyMarkers: 1, trait: '核心设施：该区域失控会导致其他区域友方标记-1/回合' },
      industrial: { name: '供水系统', friendlyMarkers: 2, enemyMarkers: 1, trait: '民生设施：被渗透时会影响玩家行动点恢复' },
      dmz: { name: '通讯基站', friendlyMarkers: 2, enemyMarkers: 0, trait: '通讯枢纽：友方在该区域可以使用远程卡牌' },
      external: { name: '应急指挥中心', friendlyMarkers: 1, enemyMarkers: 0, trait: '指挥中心：该区域友方标记无法被移除' }
    }
  },

  'LV007': {
    id: 'LV007',
    name: '隐私透明',
    subtitle: '保护个人信息安全',
    articleTitle: 'WiFi探针如何让你的手机隐私秒变小透明',
    articleContent: ARTICLE_7,
    difficulty: 3,
    tutorialFocus: 'privacy_protection',
    objectives: [
      { id: 'obj1', description: '隐私保护：为所有区域添加"隐私保护"状态，且敌方标记总数≤2', type: 'protect_areas', target: 4, completed: false },
      { id: 'obj2', description: '探针清除：清除所有探针盒子的标记和信息碎片', type: 'defeat_enemy', target: 1, completed: false },
      { id: 'obj3', description: '隐私觉醒：使用"隐私安全意识"卡牌使所有友方角色获得隐私保护状态', type: 'use_defense_cards', target: 1, completed: false }
    ],
    unlockCondition: { previousLevel: 'LV006' },
    rewards: {
      unlockedCards: ['LF7-1T2', 'LF7-2T3'],
      achievement: '隐私守护者',
      experiencePoints: 250
    },
    specialCards: [
      {
        cardId: 'LV007_CARD_1',
        name: 'MAC地址随机化',
        description: '为目标区域添加"隐私保护"，探针盒子在该区域无法获得"信息碎片"，且探针盒子的标记在该区域效果减半，持续3回合。消耗2行动点',
        type: 'basic_defense',
        techLevel: 2,
        effects: [{ type: 'mac_randomization', value: 1, description: 'MAC地址随机化' }],
        isUnlocked: false
      },
      {
        cardId: 'LV007_CARD_2',
        name: '隐私安全意识',
        description: '所有友方角色获得"隐私保护"状态，持续2回合，隐私窃取类敌人的所有技能对友方无效，隐私窃贼失去所有"隐私卡"。消耗3行动点',
        type: 'basic_defense',
        techLevel: 3,
        effects: [{ type: 'privacy_awareness', value: 2, description: '隐私安全意识' }],
        isUnlocked: false
      }
    ],
    enemyConfig: createEnemyConfig(
      '探针盒子',
      'hacker',
      3,
      2,
      [
        { turn: 'all', action: 'mac_probe', intensity: 'medium' },
        { turn: 2, action: 'data_correlation', intensity: 'high' }
      ],
      [
        { name: 'MAC地址探测', description: '获得"信息碎片"，3个时放置1个标记', trigger: '每回合', effect: '信息碎片', cooldown: 1 },
        { name: '数据关联', description: '移除友方标记，获得"精准画像"状态', trigger: '多区域标记', effect: '精准画像', cooldown: 3 }
      ]
    ),
    initialSetup: createInitialSetup(2, 2, 2, 80, ['internal', 'industrial', 'dmz', 'external'], { internal: 2, industrial: 2, dmz: 2, external: 1 }),
    hints: [
      'WiFi探针可以获取你的设备信息',
      '使用"MAC地址随机化"防止被探测',
      '保护个人信息至关重要'
    ],
    estimatedTurns: 10,
    enemyIds: ['probe_box', 'privacy_thief'],
    areaDistribution: {
      internal: { name: '商业中心', friendlyMarkers: 2, enemyMarkers: 2, trait: '高风险区：探针盒子在此区域自动获得信息碎片' },
      industrial: { name: '公共交通站', friendlyMarkers: 2, enemyMarkers: 1, trait: '人流密集：敌方在该区域放置标记时额外获得1个标记' },
      dmz: { name: '办公楼', friendlyMarkers: 2, enemyMarkers: 0, trait: '半开放区：友方在该区域可以使用"关闭WiFi开关"卡牌' },
      external: { name: '私人住宅', friendlyMarkers: 1, enemyMarkers: 0, trait: '安全区域：敌方自动技能对该区域无效' }
    }
  },

  'LV008': {
    id: 'LV008',
    name: '密码之战',
    subtitle: '加密与解密的艺术',
    articleTitle: '从《雷霆沙赞》中的超能力说起',
    articleContent: ARTICLE_8,
    difficulty: 4,
    tutorialFocus: 'cryptography',
    objectives: [
      { id: 'obj1', description: '加密防护：为所有区域添加"强密码保护"或"现代加密保护"状态', type: 'protect_areas', target: 4, completed: false },
      { id: 'obj2', description: '密码破译失败：敌方标记总数降至2个以下', type: 'defeat_enemy', target: 1, completed: false },
      { id: 'obj3', description: '密钥更新：使用"密钥更新"卡牌解除所有解密效果', type: 'use_defense_cards', target: 1, completed: false }
    ],
    unlockCondition: { previousLevel: 'LV007' },
    rewards: {
      unlockedCards: ['LI8-1T2', 'LF8-1T3'],
      achievement: '密码学学徒',
      experiencePoints: 300
    },
    specialCards: [
      {
        cardId: 'LV008_CARD_1',
        name: '多因素认证',
        description: '本回合内，所有友方标记免疫"被解密"效果，如果密码破解类敌人尝试使用"密码分析"技能，该技能反噬，敌人失去1个标记。消耗2行动点',
        type: 'intrusion_detection',
        techLevel: 2,
        effects: [{ type: 'mfa_protection', value: 1, description: '多因素认证' }],
        isUnlocked: false
      },
      {
        cardId: 'LV008_CARD_2',
        name: '密钥更新',
        description: '解除所有区域的"古典密码"状态和"被解密"效果，所有友方角色获得"加密强化"状态，持续2回合，在此期间友方标记不会被转为敌方标记。消耗3行动点',
        type: 'basic_defense',
        techLevel: 3,
        effects: [{ type: 'key_update', value: 2, description: '密钥更新' }],
        isUnlocked: false
      }
    ],
    enemyConfig: createEnemyConfig(
      '希瓦纳博士',
      'hacker',
      4,
      3,
      [
        { turn: 'all', action: 'crypto_analysis', intensity: 'medium' },
        { turn: 4, action: 'brute_force', intensity: 'high' }
      ],
      [
        { name: '密码分析', description: '掷骰子≥4则友方标记"被解密"', trigger: '每2回合', effect: '标记解密', cooldown: 2 },
        { name: '七宗罪之力', description: '成功解密后技能效果+1，行动点消耗+1', trigger: '解密成功', effect: '七宗罪状态' }
      ]
    ),
    initialSetup: createInitialSetup(2, 2, 2, 85, ['internal', 'industrial', 'dmz', 'external'], { internal: 2, industrial: 3, dmz: 2, external: 1 }),
    hints: [
      '密码学是信息安全的基础',
      '使用"多因素认证"免疫解密效果',
      '及时"密钥更新"解除负面状态'
    ],
    estimatedTurns: 10,
    enemyIds: ['dr_sivana', 'code_breaker'],
    areaDistribution: {
      internal: { name: '古老密室', friendlyMarkers: 2, enemyMarkers: 2, trait: '古典密码区：密码破译者的"历史攻击"技能在此区域效果+1' },
      industrial: { name: '数据中心', friendlyMarkers: 3, enemyMarkers: 1, trait: '现代加密区：友方在该区域可以使用"现代加密算法"卡牌' },
      dmz: { name: '通讯枢纽', friendlyMarkers: 2, enemyMarkers: 0, trait: '加密通道：友方在该区域放置标记时获得额外1行动点' },
      external: { name: '安全堡垒', friendlyMarkers: 1, enemyMarkers: 0, trait: '核心保护区：该区域友方标记无法被"解密"' }
    }
  },

  'LV009': {
    id: 'LV009',
    name: '账号保卫战',
    subtitle: '保护数字身份',
    articleTitle: '多少钱你愿意"卖号"？',
    articleContent: ARTICLE_9,
    difficulty: 4,
    tutorialFocus: 'account_security',
    objectives: [
      { id: 'obj1', description: '账号保护：清除所有钓鱼陷阱，且敌方标记总数≤2', type: 'defeat_enemy', target: 1, completed: false },
      { id: 'obj2', description: '黑产打击：使用"设备指纹识别"或"实名制验证"卡牌清除所有敌方标记', type: 'use_defense_cards', target: 1, completed: false },
      { id: 'obj3', description: '安全加固：为所有区域添加"强密码保护"状态', type: 'protect_areas', target: 4, completed: false }
    ],
    unlockCondition: { previousLevel: 'LV008' },
    rewards: {
      unlockedCards: ['LI9-1T2', 'LI9-2T3'],
      achievement: '账号安全专家',
      experiencePoints: 350
    },
    specialCards: [
      {
        cardId: 'LV009_CARD_1',
        name: '异常行为检测',
        description: '揭示盗号黑手设置的所有"钓鱼陷阱"，并使其失效，每揭示一个陷阱，友方获得1行动点。消耗2行动点',
        type: 'intrusion_detection',
        techLevel: 2,
        effects: [{ type: 'anomaly_detection', value: 1, description: '异常行为检测' }],
        isUnlocked: false
      },
      {
        cardId: 'LV009_CARD_2',
        name: '设备指纹识别',
        description: '移除做号集团在指定区域的所有标记，并解除该区域的"黑产运营"状态，做号集团的"批量产号"技能下回合无效。消耗3行动点',
        type: 'intrusion_detection',
        techLevel: 3,
        effects: [{ type: 'device_fingerprint', value: 5, description: '设备指纹识别' }],
        isUnlocked: false
      }
    ],
    enemyConfig: createEnemyConfig(
      '盗号黑手',
      'hacker',
      4,
      4,
      [
        { turn: 'all', action: 'phishing_trap', intensity: 'high' },
        { turn: 3, action: 'credential_stuffing', intensity: 'high' }
      ],
      [
        { name: '钓鱼陷阱', description: '设置陷阱，触发时标记转为敌方标记', trigger: '每2回合', effect: '陷阱设置', cooldown: 2 },
        { name: '撞库攻击', description: '拥有"账号信息"时移除友方标记', trigger: '拥有信息', effect: '标记移除', cooldown: 1 }
      ]
    ),
    initialSetup: createInitialSetup(2, 2, 2, 90, ['internal', 'industrial', 'dmz', 'external'], { internal: 3, industrial: 2, dmz: 2, external: 1 }),
    hints: [
      '账号是数字身份的核心',
      '使用"异常行为检测"揭示钓鱼陷阱',
      '"设备指纹识别"可以有效打击做号集团'
    ],
    estimatedTurns: 12,
    enemyIds: ['account_thief', 'account_farm'],
    areaDistribution: {
      internal: { name: '账号中心', friendlyMarkers: 3, enemyMarkers: 1, trait: '核心区域：该区域失控会导致玩家失去1行动点/回合' },
      industrial: { name: '内容平台', friendlyMarkers: 2, enemyMarkers: 2, trait: '高风险区：盗号黑手的"钓鱼陷阱"技能在此区域必中' },
      dmz: { name: '支付系统', friendlyMarkers: 2, enemyMarkers: 0, trait: '敏感区域：友方在该区域可以使用"强密码策略"卡牌' },
      external: { name: '安全中心', friendlyMarkers: 1, enemyMarkers: 0, trait: '保护区域：该区域友方标记无法被移除' }
    }
  }
};

export const LEVEL_ORDER: LevelId[] = ['LV001', 'LV002', 'LV003', 'LV004', 'LV005', 'LV006', 'LV007', 'LV008', 'LV009'];

export function getLevelById(id: LevelId): LevelDefinition | undefined {
  return LEVEL_DATABASE[id];
}

export function getAllLevels(): LevelDefinition[] {
  return LEVEL_ORDER.map(id => LEVEL_DATABASE[id]);
}

export function getNextLevel(currentId: LevelId): LevelDefinition | undefined {
  const currentIndex = LEVEL_ORDER.indexOf(currentId);
  if (currentIndex === -1 || currentIndex >= LEVEL_ORDER.length - 1) return undefined;
  return LEVEL_DATABASE[LEVEL_ORDER[currentIndex + 1]];
}

export function getFirstLevel(): LevelDefinition {
  return LEVEL_DATABASE['LV001'];
}

// 初始解锁卡牌（根据己方设置.md）
export const INITIAL_UNLOCKED_CARDS = [
  'NF0-1T1', // 防火墙部署
  'NI0-1T1', // 入侵检测
  'NF0-4T1', // 补丁管理
  'NF0-6T1', // 备份恢复
  'NI0-5T2', // 行为分析
  'NI0-2T1', // 日志监控
  'NE0-2T1', // 紧急补给
  'NE0-1T1', // 资源调配
];

export default LEVEL_DATABASE;
