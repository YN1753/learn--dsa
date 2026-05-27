import { useState, useEffect, useRef, useCallback } from 'react'

interface VisNode {
  id: number
  bit: number
  count: number
  child0Id: number | null
  child1Id: number | null
  isNew: boolean
  version: number
}

interface Version {
  id: number
  rootId: number
  label: string
  insertedValue: number | null
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
const MAX_BIT = 4

function createVisNode(bit: number, count: number, version: number, isNew: boolean): VisNode {
  return {
    id: globalNodeId++,
    bit,
    count,
    child0Id: null,
    child1Id: null,
    isNew,
    version
  }
}

function insertValue(
  existingNodes: VisNode[],
  rootId: number,
  value: number,
  version: number
): { rootId: number; newNodes: VisNode[]; pathIds: number[] } {
  const oldNodeMap = new Map(existingNodes.map(n => [n.id, n]))

  function helper(oldNodeId: number, bit: number): { newId: number; newNodes: VisNode[]; pathIds: number[] } {
    const oldNode = oldNodeMap.get(oldNodeId)!
    const b = (value >> bit) & 1

    if (bit < 0) {
      const newNode = createVisNode(bit, oldNode.count + 1, version, true)
      return { newId: newNode.id, newNodes: [newNode], pathIds: [newNode.id] }
    }

    const childNodeId = b === 0 ? oldNode.child0Id : oldNode.child1Id
    let childResult: { newId: number; newNodes: VisNode[]; pathIds: number[] }

    if (childNodeId !== null) {
      childResult = helper(childNodeId, bit - 1)
    } else {
      // Create new subtree
      childResult = createSubtree(bit - 1, value, version)
    }

    const newNode = createVisNode(bit, oldNode.count + 1, version, true)
    if (b === 0) {
      newNode.child0Id = childResult.newId
      newNode.child1Id = oldNode.child1Id
    } else {
      newNode.child0Id = oldNode.child0Id
      newNode.child1Id = childResult.newId
    }

    return {
      newId: newNode.id,
      newNodes: [newNode, ...childResult.newNodes],
      pathIds: [newNode.id, ...childResult.pathIds]
    }
  }

  function createSubtree(bit: number, value: number, version: number): { newId: number; newNodes: VisNode[]; pathIds: number[] } {
    const node = createVisNode(bit, 1, version, true)
    if (bit < 0) {
      return { newId: node.id, newNodes: [node], pathIds: [node.id] }
    }
    const b = (value >> bit) & 1
    const childResult = createSubtree(bit - 1, value, version)
    if (b === 0) {
      node.child0Id = childResult.newId
    } else {
      node.child1Id = childResult.newId
    }
    return { newId: node.id, newNodes: [node, ...childResult.newNodes], pathIds: [node.id, ...childResult.pathIds] }
  }

  const result = helper(rootId, MAX_BIT)
  return { rootId: result.newId, newNodes: result.newNodes, pathIds: result.pathIds }
}

function toBinary(value: number): string {
  let result = ''
  for (let i = MAX_BIT; i >= 0; i--) {
    result += ((value >> i) & 1).toString()
  }
  return result
}

const SAMPLE_VALUES = [5, 12, 7, 20, 15]

export default function PersistentTrieVisualization() {
  const [versions, setVersions] = useState<Version[]>([])
  const [allNodes, setAllNodes] = useState<VisNode[]>([])
  const [highlightNodeId, setHighlightNodeId] = useState<number | null>(null)
  const [highlightType, setHighlightType] = useState<'new' | 'shared' | 'query' | 'none'>('none')
  const [activeVersion, setActiveVersion] = useState<number>(0)
  const [description, setDescription] = useState<string>('可持久化字典树演示 - 点击「初始化」开始')
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)
  const [steps, setSteps] = useState<AnimationStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const timerRef = useRef<number | null>(null)
  const [nextValueIdx, setNextValueIdx] = useState(0)
  const [customValue, setCustomValue] = useState(5)

  const handleInit = useCallback(() => {
    globalNodeId = 0
    const emptyRoot = createVisNode(MAX_BIT, 0, 0, true)
    const ver: Version = { id: 0, rootId: emptyRoot.id, label: '版本 0 (空树)', insertedValue: null }
    setVersions([ver])
    setAllNodes([emptyRoot])
    setActiveVersion(0)
    setHighlightNodeId(null)
    setHighlightType('none')
    setDescription('已初始化版本 0（空树）')
    setSteps([])
    setCurrentStep(0)
    setIsPlaying(false)
    setNextValueIdx(0)
  }, [])

  const handleInsertNext = useCallback(() => {
    if (versions.length === 0) {
      handleInit()
      return
    }

    const value = nextValueIdx < SAMPLE_VALUES.length
      ? SAMPLE_VALUES[nextValueIdx]
      : customValue

    const lastVersion = versions[versions.length - 1]
    const newVersionId = versions.length
    const animationSteps: AnimationStep[] = []

    // Step 1: Show starting point
    animationSteps.push({
      description: `准备插入 ${value}（二进制: ${toBinary(value)}），基于版本 ${lastVersion.id}`,
      versions: [...versions],
      nodes: [...allNodes],
      highlightNodeId: null,
      highlightType: 'none',
      activeVersion: lastVersion.id
    })

    // Step 2: Highlight root
    animationSteps.push({
      description: `从根节点开始，沿二进制位 ${toBinary(value)} 的路径向下...`,
      versions: [...versions],
      nodes: [...allNodes],
      highlightNodeId: lastVersion.rootId,
      highlightType: 'query',
      activeVersion: lastVersion.id
    })

    // Perform the insert
    const result = insertValue(allNodes, lastVersion.rootId, value, newVersionId)
    const newNodes = [...allNodes, ...result.newNodes]

    // Step 3-N: Show each path node being created
    for (let i = 0; i < result.pathIds.length; i++) {
      const pathId = result.pathIds[i]
      const pathNode = result.newNodes.find(n => n.id === pathId)
      const bitInfo = pathNode && pathNode.bit >= 0 ? `，对应二进制第 ${pathNode.bit} 位` : ''
      animationSteps.push({
        description: `路径复制：新建节点 (id: ${pathId})${bitInfo}`,
        versions: [...versions],
        nodes: [...newNodes],
        highlightNodeId: pathId,
        highlightType: 'new',
        activeVersion: lastVersion.id
      })
    }

    // Final step
    const newVer: Version = {
      id: newVersionId,
      rootId: result.rootId,
      label: `版本 ${newVersionId} (插入 ${value})`,
      insertedValue: value
    }

    animationSteps.push({
      description: `版本 ${newVersionId} 创建完成！插入 ${value}，共新建 ${result.pathIds.length} 个节点`,
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
    setNextValueIdx(prev => prev + 1)
  }, [versions, allNodes, nextValueIdx, customValue, handleInit])

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
    setDescription('可持久化字典树演示 - 点击「初始化」开始')
    setSteps([])
    setCurrentStep(0)
    setNextValueIdx(0)
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

  const renderTrie = (rootId: number, nodes: VisNode[], offsetX: number, offsetY: number, scale: number) => {
    const elements: JSX.Element[] = []
    const nodePositions = new Map<number, { x: number; y: number }>()

    function layoutNode(nodeId: number, x: number, y: number, spread: number): void {
      const node = nodes.find(n => n.id === nodeId)
      if (!node) return
      nodePositions.set(nodeId, { x, y })

      if (node.child0Id !== null) {
        layoutNode(node.child0Id, x - spread, y + 55, spread * 0.5)
        const childPos = nodePositions.get(node.child0Id)!
        elements.push(
          <g key={`edge-${nodeId}-0-${node.child0Id}`}>
            <line x1={x} y1={y + 14} x2={childPos.x} y2={childPos.y - 14}
              stroke="var(--text-secondary)" strokeWidth="1.5" strokeOpacity="0.5" />
            <text x={(x + childPos.x) / 2 - 8} y={(y + 14 + childPos.y - 14) / 2}
              fill="var(--text-secondary)" fontSize="9" fontFamily="Consolas, Monaco, monospace">0</text>
          </g>
        )
      }
      if (node.child1Id !== null) {
        layoutNode(node.child1Id, x + spread, y + 55, spread * 0.5)
        const childPos = nodePositions.get(node.child1Id)!
        elements.push(
          <g key={`edge-${nodeId}-1-${node.child1Id}`}>
            <line x1={x} y1={y + 14} x2={childPos.x} y2={childPos.y - 14}
              stroke="var(--text-secondary)" strokeWidth="1.5" strokeOpacity="0.5" />
            <text x={(x + childPos.x) / 2 + 4} y={(y + 14 + childPos.y - 14) / 2}
              fill="var(--text-secondary)" fontSize="9" fontFamily="Consolas, Monaco, monospace">1</text>
          </g>
        )
      }
    }

    layoutNode(rootId, offsetX, offsetY, 70 * scale)

    for (const [nodeId, pos] of nodePositions) {
      const node = nodes.find(n => n.id === nodeId)!
      elements.push(
        <g key={`node-${nodeId}`}>
          <rect
            x={pos.x - 26} y={pos.y - 14}
            width={52} height={28}
            rx={5}
            fill={getNodeColor(node)}
            stroke={getNodeBorder(node)}
            strokeWidth={node.id === highlightNodeId ? 3 : 1.5}
          />
          <text x={pos.x} y={pos.y + 1}
            fill="var(--text-primary)" fontSize="10" fontWeight="bold"
            textAnchor="middle" dominantBaseline="middle"
            fontFamily="Consolas, Monaco, monospace">
            c:{node.count}
          </text>
        </g>
      )
    }

    return elements
  }

  return (
    <div className="visualization-container">
      <div className="viz-controls">
        <button className="btn btn-primary" onClick={handleInit}>
          初始化
        </button>
        <button className="btn btn-primary" onClick={handleInsertNext} disabled={isPlaying}>
          {nextValueIdx < SAMPLE_VALUES.length
            ? `插入 ${SAMPLE_VALUES[nextValueIdx]}`
            : '插入自定义值'}
        </button>
        {nextValueIdx >= SAMPLE_VALUES.length && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            值:
            <input
              type="number"
              min={0}
              max={31}
              value={customValue}
              onChange={(e) => setCustomValue(Math.max(0, Math.min(31, Number(e.target.value))))}
              style={{ width: 50, padding: '4px 6px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            />
          </label>
        )}
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
            点击「初始化」创建空树，然后点击「插入」添加元素
          </div>
        ) : (
          <svg
            width={Math.max(versions.length * 260 + 100, 600)}
            height={340}
          >
            {versions.map((ver, idx) => {
              const verNodes = allNodes.filter(n => n.version <= ver.id)
              return (
                <g key={ver.id} opacity={ver.id === activeVersion ? 1 : 0.35}>
                  <text
                    x={60 + idx * 240}
                    y={20}
                    fill={ver.id === activeVersion ? 'var(--accent)' : 'var(--text-secondary)'}
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {ver.label}
                  </text>
                  {ver.insertedValue !== null && (
                    <text
                      x={60 + idx * 240}
                      y={35}
                      fill="var(--text-secondary)"
                      fontSize="10"
                      textAnchor="middle"
                      fontFamily="Consolas, Monaco, monospace"
                    >
                      bin: {toBinary(ver.insertedValue)}
                    </text>
                  )}
                  {renderTrie(ver.rootId, verNodes, 60 + idx * 240, 55, 0.55)}
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
          新建节点（路径复制）
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          共享节点
        </span>
        <span style={{ marginLeft: '1rem' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: '#f59e0b', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} />
          当前路径
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
