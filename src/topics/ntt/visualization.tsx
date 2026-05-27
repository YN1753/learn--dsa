import { useState, useEffect, useRef, useCallback } from 'react'

const P = 998244353
const G = 3

function modPow(base: number, exp: number, mod: number): number {
  let result = 1
  let b = base % mod
  let e = exp
  while (e > 0) {
    if (e & 1) result = Number(BigInt(result) * BigInt(b) % BigInt(mod))
    b = Number(BigInt(b) * BigInt(b) % BigInt(mod))
    e >>= 1
  }
  return result
}

interface ButterflyStep {
  layer: number
  pairIndex: number
  i: number
  j: number
  wi: number
  wVal: number
  u: number
  v: number
  newI: number
  newJ: number
  description: string
}

export default function NTTVisualization() {
  const [inputA] = useState<number[]>([1, 2, 3, 0])
  const [inputB] = useState<number[]>([4, 5, 0, 0])
  const [result, setResult] = useState<number[]>([])
  const [steps, setSteps] = useState<ButterflyStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [, setCurrentArray] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(500)
  const [description, setDescription] = useState<string>('点击「开始NTT」查看蝶形运算过程')
  const [phase, setPhase] = useState<'idle' | 'forward-a' | 'forward-b' | 'multiply' | 'inverse' | 'done'>('idle')
  const timerRef = useRef<number | null>(null)

  const computeNTTSteps = useCallback((input: number[], n: number): { steps: ButterflyStep[], result: number[] } => {
    const a = [...input]
    const steps: ButterflyStep[] = []

    // Bit-reversal permutation
    const rev: number[] = new Array(n).fill(0)
    for (let i = 0; i < n; i++) {
      rev[i] = (rev[i >> 1] >> 1) | ((i & 1) ? (n >> 1) : 0)
    }
    for (let i = 0; i < n; i++) {
      if (i < rev[i]) {
        const tmp = a[i]
        a[i] = a[rev[i]]
        a[rev[i]] = tmp
      }
    }

    // Butterfly operations
    for (let len = 2; len <= n; len <<= 1) {
      const wn = modPow(G, (P - 1) / len, P)
      for (let i = 0; i < n; i += len) {
        let w = 1
        for (let j = 0; j < len / 2; j++) {
          const u = a[i + j]
          const v = Number(BigInt(a[i + j + len / 2]) * BigInt(w) % BigInt(P))
          const newI = (u + v) % P
          const newJ = ((u - v) % P + P) % P
          steps.push({
            layer: Math.log2(len),
            pairIndex: j,
            i: i + j,
            j: i + j + len / 2,
            wi: i + j,
            wVal: w,
            u, v,
            newI, newJ,
            description: `第 ${Math.log2(len)} 层: a[${i + j}] = (${u} + ${v}) mod ${P} = ${newI}, a[${i + j + len / 2}] = (${u} - ${v}) mod ${P} = ${newJ}`
          })
          a[i + j] = newI
          a[i + j + len / 2] = newJ
          w = Number(BigInt(w) * BigInt(wn) % BigInt(P))
        }
      }
    }

    return { steps, result: a }
  }, [])

  const computeInverseNTT = useCallback((input: number[], n: number): { steps: ButterflyStep[], result: number[] } => {
    const a = [...input]
    const steps: ButterflyStep[] = []

    // Bit-reversal permutation
    const rev: number[] = new Array(n).fill(0)
    for (let i = 0; i < n; i++) {
      rev[i] = (rev[i >> 1] >> 1) | ((i & 1) ? (n >> 1) : 0)
    }
    for (let i = 0; i < n; i++) {
      if (i < rev[i]) {
        const tmp = a[i]
        a[i] = a[rev[i]]
        a[rev[i]] = tmp
      }
    }

    // Inverse butterfly operations (use G^(-1) as root)
    const gInv = modPow(G, P - 2, P)
    for (let len = 2; len <= n; len <<= 1) {
      const wn = modPow(gInv, (P - 1) / len, P)
      for (let i = 0; i < n; i += len) {
        let w = 1
        for (let j = 0; j < len / 2; j++) {
          const u = a[i + j]
          const v = Number(BigInt(a[i + j + len / 2]) * BigInt(w) % BigInt(P))
          const newI = (u + v) % P
          const newJ = ((u - v) % P + P) % P
          steps.push({
            layer: Math.log2(len),
            pairIndex: j,
            i: i + j,
            j: i + j + len / 2,
            wi: i + j,
            wVal: w,
            u, v,
            newI, newJ,
            description: `逆NTT 第 ${Math.log2(len)} 层: a[${i + j}] = ${newI}, a[${i + j + len / 2}] = ${newJ}`
          })
          a[i + j] = newI
          a[i + j + len / 2] = newJ
          w = Number(BigInt(w) * BigInt(wn) % BigInt(P))
        }
      }
    }

    // Divide by n
    const invN = modPow(n, P - 2, P)
    for (let i = 0; i < n; i++) {
      a[i] = Number(BigInt(a[i]) * BigInt(invN) % BigInt(P))
    }

    return { steps, result: a }
  }, [])

  const handleStart = useCallback(() => {
    const n = Math.max(inputA.length, inputB.length)
    const N = 1 << Math.ceil(Math.log2(2 * n))

    const aPadded = [...inputA, ...new Array(N - inputA.length).fill(0)]
    const bPadded = [...inputB, ...new Array(N - inputB.length).fill(0)]

    const allSteps: ButterflyStep[] = []

    // Forward NTT on A
    const fwdA = computeNTTSteps(aPadded, N)
    allSteps.push(...fwdA.steps)

    // Forward NTT on B
    const fwdB = computeNTTSteps(bPadded, N)
    allSteps.push(...fwdB.steps)

    // Pointwise multiply
    const product = fwdA.result.map((v, i) =>
      Number(BigInt(v) * BigInt(fwdB.result[i]) % BigInt(P))
    )
    allSteps.push({
      layer: -1,
      pairIndex: 0,
      i: 0, j: 0, wi: 0, wVal: 0,
      u: 0, v: 0, newI: 0, newJ: 0,
      description: '逐点相乘: C[i] = A[i] * B[i] mod p'
    })

    // Inverse NTT
    const invResult = computeInverseNTT(product, N)
    allSteps.push(...invResult.steps)

    setSteps(allSteps)
    setCurrentStep(0)
    setCurrentArray([...aPadded])
    setIsPlaying(true)
    setPhase('forward-a')
    setDescription('开始NTT蝶形运算...')
    setResult(invResult.result.slice(0, inputA.length + inputB.length - 1))
  }, [inputA, inputB, computeNTTSteps, computeInverseNTT])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      setPhase('done')
      setDescription('NTT计算完成！结果多项式系数已显示。')
      return
    }

    timerRef.current = window.setTimeout(() => {
      const step = steps[currentStep]
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }, speed)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, currentStep, steps, speed])

  const handlePauseResume = () => {
    if (isPlaying) {
      setIsPlaying(false)
      setDescription(description + ' [已暂停]')
    } else if (steps.length > 0 && currentStep < steps.length) {
      setIsPlaying(true)
    }
  }

  const handleStep = () => {
    if (currentStep < steps.length) {
      const step = steps[currentStep]
      setDescription(step.description)
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setSteps([])
    setCurrentStep(0)
    setCurrentArray([])
    setResult([])
    setPhase('idle')
    setDescription('点击「开始NTT」查看蝶形运算过程')
  }

  const boxSize = 40
  const gap = 6

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleStart} disabled={isPlaying}>
          开始NTT
        </button>
        <button className="btn btn-secondary" onClick={handlePauseResume} disabled={steps.length === 0 || currentStep >= steps.length}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleStep} disabled={isPlaying || currentStep >= steps.length}>
          单步执行
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          速度:
          <input
            type="range"
            min="100"
            max="1500"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          多项式 A: [{inputA.join(', ')}]
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          多项式 B: [{inputB.join(', ')}]
        </div>
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto', padding: '1rem' }}>
        <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          蝶形运算可视化
        </div>

        {steps.length > 0 && currentStep > 0 && (
          <div style={{ marginTop: '0.5rem' }}>
            {(() => {
              const displaySteps = steps.slice(0, currentStep)
              const lastStep = displaySteps[displaySteps.length - 1]
              if (lastStep.layer === -1) {
                return (
                  <div style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>
                    逐点相乘完成
                  </div>
                )
              }

              // Show the butterfly pair for the current step
              const { i, j, u, v, newI, newJ, wVal, layer } = lastStep
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    第 {layer} 层蝶形运算
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                      background: '#3b82f6', color: '#fff', padding: '0.25rem 0.5rem',
                      borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.85rem'
                    }}>
                      a[{i}] = {u}
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>+</div>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                      background: '#f59e0b', color: '#fff', padding: '0.25rem 0.5rem',
                      borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.85rem'
                    }}>
                      a[{j}] = {v}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      (w = {wVal})
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center',
                      background: '#22c55e', color: '#fff', padding: '0.25rem 0.5rem',
                      borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.85rem'
                    }}>
                      a[{i}] = {newI}
                    </div>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center',
                      background: '#ef4444', color: '#fff', padding: '0.25rem 0.5rem',
                      borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.85rem'
                    }}>
                      a[{j}] = {newJ}
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {result.length > 0 && phase === 'done' && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              结果多项式 C = A * B (mod {P}):
            </div>
            <div style={{ display: 'flex', gap: `${gap}px`, flexWrap: 'wrap' }}>
              {result.map((val, idx) => (
                <div key={idx} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: '2px'
                }}>
                  <div style={{
                    width: `${boxSize}px`, height: `${boxSize}px`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#22c55e', color: '#fff', borderRadius: '4px',
                    fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 'bold'
                  }}>
                    {val}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    x^{idx}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="viz-info">
        <strong>状态：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>进度：</strong> {currentStep} / {steps.length} 步
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          输入值
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          加法结果
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          减法结果
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          乘法输入
        </span>
      </div>
    </div>
  )
}
