import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { DIMENSIONS, calculateBioAge, getInsights } from './engine';
import './App.css';

function App() {
  const [step, setStep] = useState(-1);
  const [age, setAge] = useState('');
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [direction, setDirection] = useState('next');

  const startAssessment = () => {
    setDirection('next');
    setStep(0);
  };

  const selectOption = (dimId, optionIdx) => {
    setAnswers(prev => ({ ...prev, [dimId]: optionIdx }));
  };

  const nextStep = () => {
    if (step === -1) {
      if (age && age > 0) {
        setDirection('next');
        setStep(0);
      }
      return;
    }
    if (step < DIMENSIONS.length - 1) {
      setDirection('next');
      setStep(step + 1);
    } else {
      const res = calculateBioAge(parseInt(age), answers);
      const insights = getInsights(res);
      setResult({ ...res, ...insights });
      setDirection('next');
      setStep(DIMENSIONS.length);
    }
  };

  const prevStep = () => {
    setDirection('back');
    if (step > 0) setStep(step - 1);
    else if (step === 0) setStep(-1);
  };

  const reset = () => {
    setStep(-1);
    setAge('');
    setAnswers({});
    setResult(null);
    setDirection('next');
  };

  const canProceed = () => {
    if (step === -1) return age && age > 0 && age < 120;
    return answers[DIMENSIONS[step].id] !== undefined;
  };

  if (step === -1) {
    return (
      <div className="app">
        <div className="container landing fade-in">
          <h1 className="brand">CHRONOS</h1>
          <p className="tagline">生活方式生物年龄评估</p>
          <p className="subtitle">
            基于循证医学文献的多维衰老评分算法<br/>
            7个生活方式维度 · 2分钟 · 零门槛
          </p>
          
          <div className="input-group">
            <input
              type="number"
              placeholder="输入你的实际年龄"
              value={age}
              onChange={e => setAge(e.target.value)}
              className="age-input"
              min="1"
              max="120"
            />
          </div>

          <button 
            className="btn-primary"
            onClick={startAssessment}
            disabled={!canProceed()}
          >
            开始评估 →
          </button>

          <div className="landing-footer">
            <p>算法参考 Levine PhenoAge (2018) 及多项队列研究</p>
            <p className="disclaimer">仅供健康教育使用，不构成医疗建议</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === DIMENSIONS.length && result) {
    const isYounger = result.delta < 0;
    
    return (
      <div className="app">
        <div className="container result fade-in">
          <h1 className="brand small">CHRONOS</h1>
          
          <div className="age-display">
            <div className="age-label">生物年龄</div>
            <div className="age-number">{result.bioAge}</div>
            <div className="age-unit">岁</div>
            
            <div className={`age-delta ${isYounger ? 'good' : 'warning'}`}>
              {isYounger ? '↓' : '↑'} 比实际年龄{isYounger ? '年轻' : '年长'} {Math.abs(result.delta)} 岁
            </div>
          </div>

          <div className="stats-row">
            <div className="stat">
              <div className="stat-value">{result.chronologicalAge}</div>
              <div className="stat-label">实际年龄</div>
            </div>
            <div className="stat">
              <div className="stat-value">{result.healthScore}</div>
              <div className="stat-label">健康评分</div>
            </div>
            <div className="stat">
              <div className="stat-value">{result.pace}</div>
              <div className="stat-label">衰老速度</div>
            </div>
          </div>

          <div className="radar-chart">
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={result.radarData}>
                <PolarGrid stroke="rgba(212,175,55,0.15)" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: 'rgba(232,230,227,0.5)', fontSize: 11 }}
                />
                <Radar
                  name="得分"
                  dataKey="A"
                  stroke="#D4AF37"
                  fill="rgba(212,175,55,0.2)"
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="insights">
            <div className="insight-card priority">
              <div className="insight-header">
                <span className="insight-icon">⚡</span>
                <span>优先改善：{result.weakest.name} ({result.weakest.score}/100)</span>
              </div>
              <p>{result.weakest.advice}</p>
            </div>
            
            <div className="insight-card strength">
              <div className="insight-header">
                <span className="insight-icon">✨</span>
                <span>优势保持：{result.strongest.name} ({result.strongest.score}/100)</span>
              </div>
              <p>{result.strongest.advice}</p>
            </div>

            <div className="insight-card summary">
              <p>{result.summary}</p>
            </div>
          </div>

          <button className="btn-secondary" onClick={reset}>
            重新评估
          </button>
          
          <p className="disclaimer">
            本工具基于已发表的生活方式衰老研究构建，结果仅供健康教育参考。
          </p>
        </div>
      </div>
    );
  }

  const currentDim = DIMENSIONS[step];
  const progress = ((step + 1) / DIMENSIONS.length) * 100;

  return (
    <div className="app">
      <div className={`container question slide-${direction}`}>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="step-info">
          <span className="step-count">问题 {step + 1} / {DIMENSIONS.length}</span>
          <span className="dim-icon">{currentDim.icon}</span>
        </div>

        <div className="question-content">
          <h2 className="question-title">{currentDim.name}</h2>
          <p className="question-subtitle">请选择最符合你现状的选项</p>

          <div className="options-list">
            {currentDim.options.map((opt, idx) => {
              const selected = answers[currentDim.id] === idx;
              return (
                <div
                  key={idx}
                  className={`option-card ${selected ? 'selected' : ''}`}
                  onClick={() => selectOption(currentDim.id, idx)}
                >
                  <div className="option-radio">
                    <div className={`radio-inner ${selected ? 'active' : ''}`} />
                  </div>
                  <div className="option-content">
                    <div className="option-label">{opt.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="nav-buttons">
          <button className="btn-text" onClick={prevStep}>
            ← 返回
          </button>
          <button 
            className="btn-primary small"
            onClick={nextStep}
            disabled={!canProceed()}
          >
            {step === DIMENSIONS.length - 1 ? '查看结果' : '下一步'} →
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
