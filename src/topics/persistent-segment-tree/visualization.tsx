import { useState, useEffect, useRef, useCallback } from 'react'

interface VisNode {
  id: number
  lo: number
  hi: number
  count: number
  leftId: number | null
  rightId: number | null
  isNew: boolean
  version: number
}

interface Version {
  id: number
  rootId: number
  label: string
}

interface AnimationStep {
  description: string
  versions: Version[]
  nodes: VisNode[]
  highlightNodeId: number | null
  highlightType: 'new' | 'shared' | 'query' | 'none'
  activeVersion: number
}

let globalNodeId = 0

function buildInitialTree(lo: number, hi: number, version: number): { rootId: number; nodes: VisNode[] } {
  const id = globalNodeId++
  if (lo === hi) {
    return {
      rootId: id,
      nodes: [{ id, lo, hi, count: 0, leftId: null, rightId: null, isNew: true, version }]
    }
  }
  const mid = Math.floor((lo + hi) / 2)
  const left = buildInitialTree(lo, mid, version)
  const right = buildInitialTree(mid + 1, hi, version)
  return {
    rootId: id,
    nodes: [
      { id, lo, hi, count: 0, leftId: left.rootId, rightId: right.rootId, isNew: true, version },
      ...left.nodes,
      ...right.nodes
    ]
  }
}

function treeUpdate(prevNodes: VisNode[], prevRootId: number, lo: number, hi: number, pos: number, version: number): { rootId: number; newNodes: VisNode[]; pathIds: number[] } {
  if (lo === hi) {
    const oldNode = prevNodes.find(n => n.id === prevRootId)!
    const newId = globalNodeId++
    return {
      rootId: newId,
      newNodes: [{ id: newId, lo, hi, count: oldNode.count + 1, leftId: null, rightId: null, isNew: true, version }],
      pathIds: [newId]
    }
  }
  const mid = Math.floor((lo + hi) / 2)
  const oldNode = prevNodes.find(n => n.id === prevRootId)!

  let childResult: { rootId: number; newNodes: VisNode[]; pathIds: number[] }
  if (pos <= mid) {
    childResult = treeUpdate(prevNodes, oldNode.leftId!, lo, mid, pos, version)
  } else {
    childResult = treeUpdate(prevNodes, oldNode.rightId!, mid + 1, hi, pos, version)
  }

  const newId = globalNodeId++
  const newNode: VisNode = {
    id: newId,
    lo,
    hi,
    count: 0,
    leftId: pos <= mid ? childResult.rootId : oldNode.leftId,
    rightId: pos <= mid ? oldNode.rightId : childResult.rootId,
    isNew: true,
    version
  }

  return {
    rootId: newId,
    newNodes: [newNode, ...childResult.newNodes],
    pathIds: [newId, ...childResult.pathIds]
  }
}

function collectAllNodes(versions: Version[], allNodes: VisNode[]): VisNode[] {
  return allNodes
}

export default function PersistentSegmentTreeVisualization() {
  const [versions, setVersions] = useState<Version[]>([])
  const [allNodes, setAllNodes] = useState<VisNode[]>([])
  const [highlightNodeId, setHighlightNodeId] = useState<number | null>(null)
  const [highlightType, setHighlightType] = useState<'new' | 'shared' | 'query' | 'none'>('none')
  const [activeVersion, setActiveVersion] = useState<number>(0)
  const [description, setDescription] = useState<string>('可持久化线段树演示 - 点击「新建版本」开始')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const timerRef = useRef<number | null>(null)
  const [insertPos, setInsertPos] = useState(3)

  const LO = 1
  const HI = 8

  const handleInit = useCallback(() => {
    globalNodeId = 0
    const result = buildInitialTree(LO, HI, 0)
    const ver: Version = { id: 0, rootId: result.rootId, label: '版本 0 (空树)' }
    setVersions([ver])
    setAllNodes(result.nodes)
    setActiveVersion(0)
    setHighlightNodeId(null)
    setHighlightType('none')
    setDescription('已初始化版本 0（空树）')
    setSteps([])
    setCurrentStep(0)
    setIsPlaying(false)
  }, [])

  const handleNewVersion = useCallback(() => {
    if (versions.length === 0) {
      handleInit()
      return
    }

    const pos = insertPos
    const lastVersion = versions[versions.length - 1]
    const newVersionId = versions.length
    const animationSteps: AnimationStep[] = []

    animationSteps.push({
      description: `在版本 ${lastVersion.id} 的基础上，在位置 ${pos} 插入元素`,
      versions: [...versions],
      nodes: [...allNodes],
      highlightNodeId: null,
      highlightType: 'none',
      activeVersion: lastVersion.id
    })

    animationSteps.push({
      description: `从根节点开始，沿路径向下找到位置 ${pos}...`,
      versions: [...versions],
      nodes: [...allNodes],
      highlightNodeId: lastVersion.rootId,
      highlightType: 'new',
      activeVersion: lastVersion.id
    })

    const result = treeUpdate(allNodes, lastVersion.rootId, LO, HI, pos, newVersionId)
    const newNodes = [...allNodes, ...result.newNodes]

    for (const pathId of result.pathIds) {
      animationSteps.push({
        description: `路径复制：新建节点 (id: ${pathId})`,
        versions: [...versions],
        nodes: [...newNodes],
        highlightNodeId: pathId,
        highlightType: 'new',
        activeVersion: lastVersion.id
      })
    }

    const newVer: Version = {
      id: newVersionId,
      rootId: result.rootId,
      label: `版本 ${newVersionId} (插入 ${pos})`
    }

    animationSteps.push({
      description: `版本 ${newVersionId} 创建完成！共新建 ${result.pathIds.length} 个节点`,
      versions: [...versions, newVer],
      nodes: [...newNodes],
      highlightNodeId: null,
      highlightType: 'none',
      activeVersion: newVersionId
    })

    const finalStep = animationSteps[animationSteps.length - 1]
    setVersions(finalStep.versions)
    setAllNodes(finalStep.nodes)
    setActiveVersion(newVersionId)
    setSteps(animationSteps)
    setCurrentStep(0)
    setIsPlaying(true)
  }, [versions, allNodes, insertPos, handleInit])

  useEffect(() => {
    if (!isPlaying || steps.length === 0) return
    if (currentStep >= steps.length) {
      setIsPlaying(false)
      return
    }

    const step = steps[currentStep]
    timerRef.current = window.setTimeout(() => {
      setVersions(step.versions)
      setAllNodes(step.nodes)
      setHighlightNodeId(step.highlightNodeId)
      setHighlightType(step.highlightType)
      setActiveVersion(step.activeVersion)
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
    if (steps.length === 0 || currentStep >= steps.length) return
    if (isPlaying) setIsPlaying(false)

    const step = steps[currentStep]
    setVersions(step.versions)
    setAllNodes(step.nodes)
    setHighlightNodeId(step.highlightNodeId)
    setHighlightType(step.highlightType)
    setActiveVersion(step.activeVersion)
    setDescription(step.description)
    setCurrentStep(prev => prev + 1)
  }

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsPlaying(false)
    setVersions([])
    setAllNodes([])
    setHighlightNodeId(null)
    setHighlightType('none')
    setActiveVersion(0)
    setDescription('可持久化线段树演示 - 点击「新建版本」开始')
    setSteps([])
    setCurrentStep(0)
  }

  const getNodeColor = (node: VisNode): string => {
    if (node.id === highlightNodeId) {
      switch (highlightType) {
        case 'new': return '#22c55e'
        case 'shared': return '#3b82f6'
        case 'query': return '#f59e0b'
        default: return 'var(--bg-card)'
      }
    }
    if (node.isNew && node.version === activeVersion) return 'rgba(34, 197, 94, 0.15)'
    return 'var(--bg-card)'
  }

  const getNodeBorder = (node: VisNode): string => {
    if (node.id === highlightNodeId) {
      switch (highlightType) {
        case 'new': return '#4ade80'
        case 'shared': return '#60a5fa'
        case 'query': return '#fbbf24'
        default: return 'var(--border)'
      }
    }
    if (node.isNew && node.version === activeVersion) return '#22c55e'
    return 'var(--border)'
  }

  const renderTree = (rootId: number, nodes: VisNode[], offsetX: number, offsetY: number, scale: number) => {
    const elements: JSX.Element[] = []
    const nodePositions = new Map<number, { x: number; y: number }>()

    function layoutTree(nodeId: number, x: number, y: number, spread: number): void {
      const node = nodes.find(n => n.id === nodeId)
      if (!node) return
      nodePositions.set(nodeId, { x, y })

      if (node.leftId !== null) {
        layoutTree(node.leftId, x - spread, y + 70, spread * 0.5)
        const childPos = nodePositions.get(node.leftId)!
        elements.push(
          <line key={`edge-${nodeId}-${node.leftId}`}
            x1={x} y1={y + 18} x2={childPos.x} y2={childPos.y - 18}
            stroke="var(--text-secondary)" strokeWidth="1.5" strokeOpacity="0.5" />
        )
      }
      if (node.rightId !== null) {
        layoutTree(node.rightId, x + spread, y + 70, spread * 0.5)
        const childPos = nodePositions.get(node.rightId)!
        elements.push(
          <line key={`edge-${nodeId}-${node.rightId}`}
            x1={x} y1={y + 18} x2={childPos.x} y2={childPos.y - 18}
            stroke="var(--text-secondary)" strokeWidth="1.5" strokeOpacity="0.5" />
        )
      }
    }

    layoutTree(rootId, offsetX, offsetY, 80 * scale)

    for (const [nodeId, pos] of nodePositions) {
      const node = nodes.find(n => n.id === nodeId)!
      elements.push(
        <g key={`node-${nodeId}`}>
          <rect
            x={pos.x - 30} y={pos.y - 18}
            width={60} height={36}
            rx={6}
            fill={getNodeColor(node)}
            stroke={getNodeBorder(node)}
            strokeWidth={node.id === highlightNodeId ? 3 : 1.5}
          />
          <text x={pos.x} y={pos.y + 1}
            fill="var(--text-primary)" fontSize="11" fontWeight="bold"
            textAnchor="middle" dominantBaseline="middle"
            fontFamily="Consolas, Monaco, monospace">
            [{node.lo},{node.hi}]:{node.count}
          </text>
        </g>
      )
    }

    return elements
  }

  const activeVersionData = versions.find(v => v.id === activeVersion)
  const activeNodes = allNodes.filter(n => n.version <= activeVersion)

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleInit}>
          初始化
        </button>
        <button className="btn btn-primary" onClick={handleNewVersion} disabled={isPlaying}>
          新建版本
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          插入位置:
          <select
            value={insertPos}
            onChange={(e) => setInsertPos(Number(e.target.value))}
            style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
          >
            {Array.from({ length: HI - LO + 1 }, (_, i) => LO + i).map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>
        <button className="btn btn-secondary" onClick={handleStep} disabled={steps.length === 0 || currentStep >= steps.length}>
          单步
        </button>
        <button className="btn btn-secondary" onClick={handlePauseResume} disabled={steps.length === 0 || currentStep >= steps.length}>
          {isPlaying ? '暂停' : '继续'}
        </button>
        <button className="btn btn-secondary" onClick={handleReset}>
          重置
        </button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          速度:
          <input
            type="range" min="200" max="2000" value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className="viz-canvas" style={{ overflowX: 'auto', minHeight: 300 }}>
        {versions.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250, color: 'var(--text-secondary)', fontSize: '1rem' }}>
            点击「初始化」创建版本 0，然后点击「新建版本」插入元素
          </div>
        ) : (
          <svg
            width={Math.max(versions.length * 300 + 100, 600)}
            height={320}
          >
            {versions.map((ver, idx) => {
              const verNodes = allNodes.filter(n => n.version <= ver.id)
              return (
                <g key={ver.id} opacity={ver.id === activeVersion ? 1 : 0.4}>
                  <text
                    x={60 + idx * 280}
                    y={20}
                    fill={ver.id === activeVersion ? 'var(--accent)' : 'var(--text-secondary)'}
                    fontSize="13"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {ver.label}
                  </text>
                  {renderTree(ver.rootId, verNodes, 60 + idx * 280, 50, 0.6)}
                </g>
              )
            })}
          </svg>
        )}
      </div>

      <div className="viz-info">
        <strong>操作说明：</strong> {description}
      </div>

      <div className="viz-info" style={{ fontSize: '0.85rem' }}>
        <strong>图例：</strong>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          新建节点
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          共享节点
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          查询路径
        </span>
        {versions.length > 0 && (
          <span style={{ marginLeft: '1rem', color: 'var(--text-secondary)' }}>
            版本数: {versions.length} | 总节点数: {allNodes.length}
          </span>
        )}
      </div>
    </div>
  )
}
