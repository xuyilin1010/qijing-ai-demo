/* ===================================================================
   奇境.ai · 共享账号档案 · 各页统一以这份为准（号 → 定位 / 受众 / 内容板块 / 每板块对标）
   规则：账号工作台「写」它，选题「读」它。两页同一份数据，配置真驱动产出。
   - 存储：localStorage['qijing_accounts'] = { v, accts:[...] }
   - 没存过 / 版本不符 → 回落到代码里的 SEED（不写盘，等首次编辑才落盘，
     这样改 SEED 能让没动过的人立刻拿到新种子）。
   - file:// 可用，不依赖 fetch；在页面内联脚本之前 <script src> 引入。

   bench（对标）schema：{ a 账号, f 粉丝, v 爆款标题, l 点赞, link 主页,
     pdg? 它火的套路, pick? {col 栏目, t 选题标题, g 一句话怎么做} }
     —— pick 是「按这个号·这个板块」预埋的真实选题种子（非占位假数据），
        选题页点这条对标时拿来演示；没有 pick 的对标走诚实「AI 正在想」态。
   =================================================================== */
(function (g) {
  var KEY = 'qijing_accounts';
  var VERSION = 1;

  // 抖音对标主页（真实链接）
  var HL    = 'https://www.douyin.com/user/MS4wLjABAAAAnCcn8se9wv-i5wPBg_H7JjAY0iQ8KeFzIt_V4S8hhoU'; // 韩路聊车
  var CHEGE = 'https://www.douyin.com/user/MS4wLjABAAAAabbLlLGzcbPWGVCzbnAFP3T4HboPkQxucAuVLfPsUF8'; // 车哥测评
  var CGCC  = 'https://www.douyin.com/user/MS4wLjABAAAAQq6ib93Wtn2djbLzgrLnAJJm2TQ4ns4DY-fkUIdvgXffbGp6rMBgeovF__LCKiyT'; // 超哥超车
  var YGZ   = 'https://www.douyin.com/user/MS4wLjABAAAAZ4tsdtwes8aLJLES5I-Vg5tH3V8Z_G-PabQBFNOROrA'; // 意公子
  var SX    = 'https://www.douyin.com/user/MS4wLjABAAAABdb5gATbBiq2BAaFTNp-mq46Jp3HfDKpbdiruHnwrtk'; // 水星逛博物馆
  var CSY   = 'https://www.douyin.com/user/MS4wLjABAAAAvFejI4K_tPsXQ88vpK0AJSAsPkzsK9ri4_z5Kxf-tiU'; // 创手艺

  // —— 账号档案种子（从「账号工作台」迁出，给每个板块补 key，给对标补 pdg / 选题种子）——
  var SEED = [
    { key:'mc', nm:'明川', role:'首席工程师', cls:'mc',
      pos:'红旗天工首席工程师 ·「讲得清的技术，才是真的技术」',
      aud:'给「想懂车、怕被忽悠」的人 → 输出<b>能信的技术判断</b>',
      pillars:[
        { key:'mc-js', nm:'明川说车', sub:'硬核技术讲解', src:'xlsx',
          bench:[
            { a:'韩路聊车', f:'403万粉', v:'毁灭性测试碳陶刹车', l:'52.9万', link:HL,
              pdg:'极限破坏性实测 + 数据说话' },
            { a:'车哥测评', f:'1362万粉', v:'辅助驾驶串胡同', l:'58.8万', link:CHEGE,
              pdg:'极限实测 + 智驾边界',
              pick:{ col:'明川说车', t:'辅助驾驶能串北京胡同了？工程师讲清它的能力边界',
                     g:'把智驾"能/不能"的边界讲清，不神化不妖魔化。' } }
          ]},
        { key:'mc-dy', nm:'答疑', sub:'连麦解惑 · 避坑', src:'xlsx',
          bench:[
            { a:'超哥超车', f:'1665万粉', v:'25年买第一辆车怎么避坑', l:'65.5万', link:CGCC,
              pdg:'真实连麦答疑 + 避坑清单',
              pick:{ col:'答疑', t:'买车别被销售带偏：工程师进店只问这3句话',
                     g:'把"第一辆车怎么避坑"做成3个工程视角问题，一眼识破话术。' } }
          ]},
        { key:'mc-qz', nm:'求证', sub:'传言辟谣', src:'xlsx', note:'专辟谣对标(类关老师不懂车)待补',
          bench:[
            { a:'车哥测评', f:'1362万粉', v:'极限实测套路', l:'58.8万', link:CHEGE,
              pdg:'极限实测 + 套路拆解' }
          ]}
      ]},

    { key:'xy', nm:'星遥', role:'文化顾问', cls:'xy',
      pos:'考古品鉴师·文化顾问 ·「好东西，得看得懂的人才看得见」',
      aud:'给「想看懂东方美」的人 → 把<b>古代审美翻译进现代设计</b>',
      pillars:[
        { key:'xy-wy', nm:'纹样的故事', sub:'实地探访 · 非遗现代化', src:'xlsx+ai',
          bench:[
            { a:'水星逛博物馆', f:'554万粉', v:'抗美援朝兵王', l:'295.7万', link:SX,
              pdg:'实地探访 + 文化身份',
              pick:{ col:'纹样的故事', t:'端午的纹样，藏在一台车的灯里',
                     g:'从端午礼序/纹样，翻译成今天车灯/车身的设计语言。' } },
            { a:'创手艺', f:'503万粉', v:'纯手工圆竹篮', l:'12.3万', link:CSY,
              pdg:'匠人手作 + 慢节奏沉浸' }
          ]},
        { key:'xy-mk', nm:'审美课', sub:'经典文本现代映射', src:'xlsx',
          bench:[
            { a:'意公子', f:'977万粉', v:'苏东坡·问汝平生功业', l:'70.2万', link:YGZ,
              pdg:'经典文本 + 现代映射',
              pick:{ col:'审美课', t:'夏至，白昼最长的一天，古人怎么用"光"做美学？',
                     g:'讲"日长之至"的光影哲学，落到东方色彩。' } }
          ]}
      ]},

    { key:'t05', nm:'天工 05', role:'年轻派精致座驾', cls:'car', price:'15.98–22.28万',
      pos:'年轻派精致座驾 · 好开好停操控稳',
      aud:'给年轻精致通勤的人 → 一台<b>配得上日常</b>的车',
      pillars:[
        { key:'t05-hk', nm:'好开好停操控稳', sub:'官网真栏目', src:'guan',
          bench:[
            { a:'车哥测评', f:'1362万粉', v:'女司机侧方停车', l:'25.9万', link:CHEGE,
              pdg:'剧情吐槽 + 停车痛点',
              pick:{ col:'好开好停', t:'新手最怕的侧方位，这台车一把进——好停到底什么体验',
                     g:'用侧方位实测演示 05 的好开好停。' } }
          ]},
        { key:'t05-sg', nm:'高定小众 · 首购友好', sub:'官网栏目 + 首购场景', src:'guan+ai',
          bench:[
            { a:'超哥超车', f:'1665万粉', v:'25年买第一辆车', l:'65.5万', link:CGCC,
              pdg:'真实连麦答疑 + 避坑清单',
              pick:{ col:'首购友好', t:'工作两年攒钱买的第一台车，我没挑最贵的，挑了最不后悔的',
                     g:'用"人生第一台车"的成就感叙事，落到 05 好开好停、15万级精致。' } }
          ]}
      ]},

    { key:'t06', nm:'天工 06', role:'家享派安心座驾', cls:'car', price:'17.98–26.28万',
      pos:'家享派安心座驾',
      aud:'给有娃家庭 → 一台<b>让全家放心</b>的车',
      pillars:[
        { key:'t06-jx', nm:'家享安心 · 选车决策', sub:'官网栏目 + 决策场景', src:'guan+ai',
          bench:[
            { a:'超哥超车', f:'1665万粉', v:'15万买车连麦', l:'49.6万', link:CGCC,
              pdg:'真实连麦 + 预算理性',
              pick:{ col:'家享安心', t:'"能试的都试了，越看越不想买"——15万家用SUV，一条帮你锁死',
                     g:'把选车评论区"选择瘫痪"做钩子，用减法表替家庭拍板。' } }
          ]},
        { key:'t06-hs', nm:'好上手 · 智能不添乱', sub:'AI 从历史聚类', src:'ai',
          bench:[
            { a:'车哥测评', f:'1362万粉', v:'YU7语音控制', l:'28.8万', link:CHEGE,
              pdg:'实测体验 + 智能不添乱' }
          ]}
      ]},

    { key:'t08', nm:'天工 08', role:'中大型豪华纯电SUV', cls:'car', price:'21.59–33.98万',
      pos:'中大型豪华纯电SUV · 红旗色彩美学 / 灵犀座舱',
      aud:'给想往上升级的品质家庭 → <b>高级而不张扬</b>',
      pillars:[
        { key:'t08-cm', nm:'红旗色彩美学', sub:'官网真栏目', src:'guan',
          bench:[
            { a:'意公子', f:'977万粉', v:'苏东坡·东方美学', l:'70.2万', link:YGZ,
              pdg:'经典文本 + 现代映射',
              pick:{ col:'色彩美学', t:'油换电想升级豪华？先看懂"东方色彩美学"这件事',
                     g:'承接东方美学，落到 08 的色彩/灵犀座舱。' } }
          ]},
        { key:'t08-jk', nm:'红旗卓越驾控', sub:'官网真栏目', src:'guan',
          bench:[
            { a:'韩路聊车', f:'403万粉', v:'毁灭性测试制动', l:'52.9万', link:HL,
              pdg:'极限破坏性实测 + 数据说话' }
          ]}
      ]},

    { key:'eh7', nm:'EH7', role:'安心驾享纯电轿车', cls:'car', price:'20.88–28.88万',
      pos:'安心驾享纯电轿车 · 舒适座舱 / 随心驾控',
      aud:'给每天通勤的人 → <b>开着不累、坐着舒服</b>',
      pillars:[
        { key:'eh7-zc', nm:'舒适智能座舱', sub:'官网真栏目', src:'guan', note:'同级横评对标',
          bench:[
            { a:'超哥超车', f:'1665万粉', v:'20万纯电三选一', l:'13.2万', link:CGCC,
              pdg:'真实连麦 + 三选一决策',
              pick:{ col:'舒适智能座舱', t:'20万纯电轿车别只盯加速——这3个安静细节才决定每天舒不舒服',
                     g:'避开加速内卷，用隔音/座舱/顺滑讲安心驾享。' } }
          ]},
        { key:'eh7-jk', nm:'随心驾控 · 安全', sub:'官网真栏目', src:'guan',
          bench:[
            { a:'韩路聊车', f:'403万粉', v:'毁灭性测试制动', l:'52.9万', link:HL,
              pdg:'极限破坏性实测 + 数据说话' }
          ]}
      ]}
  ];

  // —— 内容节点（M/D → 标签）：排期日历叠加 + 选题「按节点起」共用 ——
  var NODES = {
    '6/15':'重庆车展','6/16':'车展','6/17':'618 车展',
    '6/18':'618','6/19':'端午','6/20':'端午','6/21':'端午·夏至·父亲节',
    '6/23':'出分','6/24':'出分','6/25':'出分'
  };
  // —— 节点选题种子（标签含某关键词即命中：端午 / 夏至 / 父亲节 / 618 / 出分）——
  //    t/g 是真实可拍选题，按号配；守「不编参数 / 不报具体优惠数字」。没命中的节点走诚实空态。
  var NODE_TOPICS = {
    '端午':[
      {acctKey:'xy', col:'纹样的故事', t:'端午的纹样，藏在一台车的灯里', g:'从端午礼序/纹样，翻译成今天车灯/车身的设计语言。'}
    ],
    '夏至':[
      {acctKey:'xy', col:'审美课', t:'夏至，白昼最长的一天，古人怎么用"光"做美学？', g:'讲"日长之至"的光影哲学，落到东方色彩。'}
    ],
    '父亲节':[
      {acctKey:'t06', col:'家享安心', t:'第一次带爸去试驾，他只问了一句话', g:'用父亲视角的安心需求，落到 06 的家享安全感，不堆参数。'},
      {acctKey:'mc', col:'答疑', t:'给爸选车和给自己选车，到底差在哪？', g:'用代际差异做钩子，工程师视角讲清家用取舍。'}
    ],
    '618':[
      {acctKey:'t05', col:'首购友好', t:'618 想入手第一台车？先别看价，先看这 3 件事', g:'把促销焦虑转成理性首购清单，落到 05，不报具体优惠数字。'}
    ],
    '出分':[
      {acctKey:'t05', col:'首购友好', t:'考完了，"考好奖励一台车"——人生第一台怎么选不踩坑', g:'用出分后购车场景，落到 05 年轻精致 + 好开好停。'}
    ]
  };

  function deepCopy(o){ return JSON.parse(JSON.stringify(o)); }

  function load(){
    try{
      var raw = JSON.parse(localStorage.getItem(KEY));
      if (raw && raw.v === VERSION && Array.isArray(raw.accts) && raw.accts.length) return raw.accts;
    }catch(e){}
    return deepCopy(SEED);
  }
  function save(accts){
    localStorage.setItem(KEY, JSON.stringify({ v:VERSION, accts:accts }));
  }

  g.qjLoadAccounts = load;
  g.qjSaveAccounts = save;
  g.QJ_ACCOUNTS_KEY = KEY;
  g.QJ_ACCOUNTS_SEED = SEED;       // 只读参考
  g.QJ_NODES = NODES;              // M/D → 节点标签（排期 + 选题共用）
  g.QJ_NODE_TOPICS = NODE_TOPICS;  // 节点关键词 → 选题种子
})(window);
