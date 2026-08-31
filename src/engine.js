// ============================================
// CHRONOS Bio-Age Engine v1.0
// 基于 Levine PhenoAge (2018) 及生活方式衰老研究
// ============================================

export const DIMENSIONS = [
  {
    id: 'diet',
    name: '饮食模式',
    icon: '🥗',
    options: [
      { label: '地中海/whole-food，极少加工食品', score: 95, delta: -3.0 },
      { label: '均衡饮食，偶尔外卖零食', score: 70, delta: -0.5 },
      { label: '经常外卖快餐含糖饮料', score: 40, delta: +2.5 },
      { label: '高度加工食品为主', score: 15, delta: +4.5 }
    ]
  },
  {
    id: 'exercise',
    name: '运动习惯',
    icon: '💪',
    options: [
      { label: '5次+/周，有氧+力量结合', score: 95, delta: -3.5 },
      { label: '3-4次/周，规律运动', score: 75, delta: -1.5 },
      { label: '1-2次/周，偶尔动动', score: 45, delta: +1.5 },
      { label: '几乎不运动，久坐为主', score: 10, delta: +4.0 }
    ]
  },
  {
    id: 'sleep',
    name: '睡眠质量',
    icon: '😴',
    options: [
      { label: '7-9h，入睡快醒来精神', score: 90, delta: -2.5 },
      { label: '6-7h，偶尔失眠总体还行', score: 65, delta: -0.5 },
      { label: '经常<6h或睡眠质量差', score: 35, delta: +2.5 },
      { label: '长期失眠或极不规律', score: 10, delta: +5.0 }
    ]
  },
  {
    id: 'stress',
    name: '压力水平',
    icon: '🧘',
    options: [
      { label: '低压力，有良好应对机制', score: 90, delta: -2.0 },
      { label: '中等压力，能基本应对', score: 60, delta: +0.5 },
      { label: '高压力，经常焦虑疲惫', score: 30, delta: +3.0 },
      { label: '极高压力，长期burnout', score: 5, delta: +5.5 }
    ]
  },
  {
    id: 'social',
    name: '社交连接',
    icon: '👥',
    options: [
      { label: '紧密社交圈，经常深度交流', score: 90, delta: -2.0 },
      { label: '有几个好友，偶尔聚会', score: 65, delta: -0.5 },
      { label: '社交较少，mostly独处', score: 35, delta: +1.5 },
      { label: '长期孤独，缺乏情感支持', score: 10, delta: +3.5 }
    ]
  },
  {
    id: 'smoking',
    name: '吸烟状态',
    icon: '🚭',
    options: [
      { label: '从不吸烟', score: 95, delta: -0.5 },
      { label: '已戒烟超过1年', score: 70, delta: +0.5 },
      { label: '偶尔吸烟（社交性）', score: 35, delta: +2.5 },
      { label: '每天吸烟', score: 5, delta: +7.0 }
    ]
  },
  {
    id: 'alcohol',
    name: '饮酒习惯',
    icon: '🍷',
    options: [
      { label: '不饮酒或极少（<1次/月）', score: 90, delta: -0.5 },
      { label: '少量（1-2次/周，每次<2杯）', score: 65, delta: +0.5 },
      { label: '中等（3-5次/周或每次较多）', score: 35, delta: +2.0 },
      { label: '频繁饮酒或酗酒', score: 5, delta: +4.5 }
    ]
  }
];

export function calculateBioAge(chronologicalAge, answers) {
  let totalDelta = 0;
  const dimensionScores = [];

  DIMENSIONS.forEach(dim => {
    const selectedIdx = answers[dim.id];
    if (selectedIdx === undefined) return;
    const opt = dim.options[selectedIdx];
    totalDelta += opt.delta;
    dimensionScores.push({
      id: dim.id,
      name: dim.name,
      icon: dim.icon,
      score: opt.score,
      delta: opt.delta,
      label: opt.label
    });
  });

  totalDelta = Math.max(-12, Math.min(18, totalDelta));
  const bioAge = Math.round(chronologicalAge + totalDelta);
  const delta = bioAge - chronologicalAge;
  const healthScore = Math.round(
    dimensionScores.reduce((sum, d) => sum + d.score, 0) / dimensionScores.length
  );
  const pace = chronologicalAge > 0 ? (bioAge / chronologicalAge).toFixed(2) : 1.0;

  return {
    chronologicalAge,
    bioAge,
    delta,
    healthScore,
    pace,
    dimensions: dimensionScores,
    radarData: dimensionScores.map(d => ({
      subject: d.name,
      A: d.score,
      fullMark: 100
    }))
  };
}

export function getInsights(result) {
  const sorted = [...result.dimensions].sort((a, b) => a.score - b.score);
  const weak = sorted[0];
  const strong = sorted[sorted.length - 1];
  const adviceMap = {
    '饮食模式': '减少超加工食品，增加膳食纤维和Omega-3摄入',
    '运动习惯': '每周150分钟中等强度运动，加入2次力量训练',
    '睡眠质量': '固定就寝时间，睡前90分钟避免蓝光',
    '压力水平': '每日10分钟正念呼吸，建立压力释放仪式',
    '社交连接': '每周至少一次线下深度对话，重建情感纽带',
    '吸烟状态': '制定戒烟计划，尼古丁替代疗法可提升成功率3倍',
    '饮酒习惯': '设定每周饮酒上限，尝试无酒精替代饮品'
  };
  return {
    weakest: { ...weak, advice: adviceMap[weak.name] },
    strongest: { ...strong, advice: adviceMap[strong.name] },
    summary: result.delta < -3 
      ? '你的生活方式显著优于同龄人，抗衰老机制运转良好。'
      : result.delta < 0 
      ? '整体处于健康轨迹，小幅优化即可进一步延缓衰老。'
      : result.delta < 5
      ? '存在可逆的加速衰老因素，针对性改善可带来显著收益。'
      : '多项生活方式风险因素累积，建议优先处理高风险维度。'
  };
}
