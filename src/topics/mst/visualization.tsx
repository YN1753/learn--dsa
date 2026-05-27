import { useState, useEffect, useRef, useCallback } from 'react';

interface GraphEdge {
  u: number;
  v: number;
  weight: number;
}

interface GraphNode {
  id: number;
  x: number;
  y: number;
  label: string;
}

type Algorithm = 'kruskal' | 'prim';

interface MSTStep {
  description: string;
  mstEdges: number[];
  currentEdge: number | null;
  skippedEdge: number | null;
  sortedEdges: number[];
  highlightNodes: number[];
  unionState?: number[];
  pqEdges?: number[];
}

const COLORS = {
  nodeDefault: '#6B7280',
  nodeInMST: '#10B981',
  nodeCurrent: '#3B82F6',
  edgeDefault: '#D1D5DB',
  edgeInMST: '#10B981',
  edgeCurrent: '#EF4444',
  edgeSkipped: '#9CA3AF',
  edgeCandidate: '#F59E0B',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textWeight: '#DC2626',
  background: '#F9FAFB',
};

export default function MSTVisualization() {
  const [algorithm, setAlgorithm] = useState<Algorithm>('kruskal');
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [steps, setSteps] = useState<MSTStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const timerRef = useRef<number | null>(null);

  // 初始化图数据
  const initGraph = useCallback(() => {
    const initialNodes: GraphNode[] = [
      { id: 0, x: 100, y: 80, label: 'A' },
      { id: 1, x: 280, y: 40, label: 'B' },
      { id: 2, x: 280, y: 140, label: 'C' },
      { id: 3, x: 460, y: 80, label: 'D' },
      { id: 4, x: 620, y: 80, label: 'E' },
    ];

    const initialEdges: GraphEdge[] = [
      { u: 0, v: 1, weight: 4 },
      { u: 0, v: 2, weight: 3 },
      { u: 1, v: 2, weight: 1 },
      { u: 1, v: 3, weight: 2 },
      { u: 2, v: 3, weight: 5 },
      { u: 3, v: 4, weight: 7 },
      { u: 2, v: 4, weight: 6 },
    ];

    setNodes(initialNodes);
    setEdges(initialEdges);
    return { nodes: initialNodes, edges: initialEdges };
  }, []);

  // 生成 Kruskal 步骤
  const generateKruskalSteps = useCallback((nodes: GraphNode[], edges: GraphEdge[]): MSTStep[] => {
    const steps: MSTStep[] = [];
    const n = nodes.length;

    // 按权重排序边的索引
    const sortedIndices = edges.map((_, i) => i).sort((a, b) => edges[a].weight - edges[b].weight);

    steps.push({
      description: '将所有边按权重从小到大排序',
      mstEdges: [],
      currentEdge: null,
      skippedEdge: null,
      sortedEdges: sortedIndices,
      highlightNodes: [],
    });

    // 并查集
    const parent = new Array(n).fill(0).map((_, i) => i);
    const rank = new Array(n).fill(0);
    const mstEdgeList: number[] = [];

    const find = (x: number): number => {
      if (parent[x] !== x) parent[x] = find(parent[x]);
      return parent[x];
    };

    for (const edgeIdx of sortedIndices) {
      const edge = edges[edgeIdx];
      const rootU = find(edge.u);
      const rootV = find(edge.v);

      if (rootU !== rootV) {
        // 合并
        if (rank[rootU] < rank[rootV]) {
          parent[rootU] = rootV;
        } else if (rank[rootU] > rank[rootV]) {
          parent[rootV] = rootU;
        } else {
          parent[rootV] = rootU;
          rank[rootU]++;
        }
        mstEdgeList.push(edgeIdx);

        steps.push({
          description: `考虑边 (${nodes[edge.u].label}, ${nodes[edge.v].label}), 权重=${edge.weight}: 不构成环，加入 MST`,
          mstEdges: [...mstEdgeList],
          currentEdge: edgeIdx,
          skippedEdge: null,
          sortedEdges: sortedIndices,
          highlightNodes: [edge.u, edge.v],
          unionState: [...parent],
          pqEdges: sortedIndices.filter(i => !mstEdgeList.includes(i)),
        });

        if (mstEdgeList.length === n - 1) break;
      } else {
        steps.push({
          description: `考虑边 (${nodes[edge.u].label}, ${nodes[edge.v].label}), 权重=${edge.weight}: 会构成环，跳过`,
          mstEdges: [...mstEdgeList],
          currentEdge: null,
          skippedEdge: edgeIdx,
          sortedEdges: sortedIndices,
          highlightNodes: [edge.u, edge.v],
          unionState: [...parent],
          pqEdges: sortedIndices.filter(i => !mstEdgeList.includes(i)),
        });
      }
    }

    const totalWeight = mstEdgeList.reduce((sum, i) => sum + edges[i].weight, 0);
    steps.push({
      description: `Kruskal 算法完成! MST 包含 ${mstEdgeList.length} 条边，总权重 = ${totalWeight}`,
      mstEdges: [...mstEdgeList],
      currentEdge: null,
      skippedEdge: null,
      sortedEdges: sortedIndices,
      highlightNodes: nodes.map(n => n.id),
    });

    return steps;
  }, []);

  // 生成 Prim 步骤
  const generatePrimSteps = useCallback((nodes: GraphNode[], edges: GraphEdge[]): MSTStep[] => {
    const steps: MSTStep[] = [];
    const n = nodes.length;

    // 构建邻接表
    const adj: { to: number; edgeIdx: number }[][] = Array.from({ length: n }, () => []);
    edges.forEach((e, idx) => {
      adj[e.u].push({ to: e.v, edgeIdx: idx });
      adj[e.v].push({ to: e.u, edgeIdx: idx });
    });

    const visited = new Array(n).fill(false);
    const mstEdgeList: number[] = [];
    visited[0] = true;

    // 候选边队列: { from, to, edgeIdx }
    const pq: { from: number; to: number; edgeIdx: number }[] = [];
    for (const neighbor of adj[0]) {
      pq.push({ from: 0, to: neighbor.to, edgeIdx: neighbor.edgeIdx });
    }
    pq.sort((a, b) => edges[a.edgeIdx].weight - edges[b.edgeIdx].weight);

    steps.push({
      description: `选择起始节点 ${nodes[0].label}，将其加入已选集合，邻边加入候选队列`,
      mstEdges: [],
      currentEdge: null,
      skippedEdge: null,
      sortedEdges: [],
      highlightNodes: [0],
      pqEdges: pq.map(p => p.edgeIdx),
    });

    while (pq.length > 0 && mstEdgeList.length < n - 1) {
      const minItem = pq.shift()!;

      if (visited[minItem.to]) {
        steps.push({
          description: `考虑边 (${nodes[minItem.from].label}, ${nodes[minItem.to].label}), 权重=${edges[minItem.edgeIdx].weight}: ${nodes[minItem.to].label} 已在集合中，跳过`,
          mstEdges: [...mstEdgeList],
          currentEdge: null,
          skippedEdge: minItem.edgeIdx,
          sortedEdges: [],
          highlightNodes: nodes.filter((_, i) => visited[i]).map(n => n.id),
          pqEdges: pq.map(p => p.edgeIdx),
        });
        continue;
      }

      visited[minItem.to] = true;
      mstEdgeList.push(minItem.edgeIdx);

      // 将新节点的邻边加入队列
      for (const neighbor of adj[minItem.to]) {
        if (!visited[neighbor.to]) {
          pq.push({ from: minItem.to, to: neighbor.to, edgeIdx: neighbor.edgeIdx });
        }
      }
      pq.sort((a, b) => edges[a.edgeIdx].weight - edges[b.edgeIdx].weight);

      const visitedNodes = nodes.filter((_, i) => visited[i]).map(n => n.label);
      steps.push({
        description: `加入边 (${nodes[minItem.from].label}, ${nodes[minItem.to].label}), 权重=${edges[minItem.edgeIdx].weight}: 将 ${nodes[minItem.to].label} 加入集合 {${visitedNodes.join(', ')}}`,
        mstEdges: [...mstEdgeList],
        currentEdge: minItem.edgeIdx,
        skippedEdge: null,
        sortedEdges: [],
        highlightNodes: nodes.filter((_, i) => visited[i]).map(n => n.id),
        pqEdges: pq.map(p => p.edgeIdx),
      });
    }

    const totalWeight = mstEdgeList.reduce((sum, i) => sum + edges[i].weight, 0);
    steps.push({
      description: `Prim 算法完成! MST 包含 ${mstEdgeList.length} 条边，总权重 = ${totalWeight}`,
      mstEdges: [...mstEdgeList],
      currentEdge: null,
      skippedEdge: null,
      sortedEdges: [],
      highlightNodes: nodes.map(n => n.id),
    });

    return steps;
  }, []);

  // 初始化和切换算法
  useEffect(() => {
    const { nodes: n, edges: e } = initGraph();
    const generatedSteps = algorithm === 'kruskal'
      ? generateKruskalSteps(n, e)
      : generatePrimSteps(n, e);
    setSteps(generatedSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [algorithm, initGraph, generateKruskalSteps, generatePrimSteps]);

  // 播放控制
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      timerRef.current = window.setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, speed);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, steps.length, speed]);

  const handlePlay = () => {
    if (currentStep >= steps.length - 1) setCurrentStep(0);
    setIsPlaying(true);
  };

  const handlePause = () => setIsPlaying(false);
  const handleReset = () => { setIsPlaying(false); setCurrentStep(0); };
  const handleStepForward = () => { if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1); };
  const handleStepBackward = () => { if (currentStep > 0) setCurrentStep(prev => prev - 1); };

  const getEdgeColor = (index: number) => {
    const step = steps[currentStep];
    if (!step) return COLORS.edgeDefault;
    if (step.currentEdge === index) return COLORS.edgeCurrent;
    if (step.skippedEdge === index) return COLORS.edgeSkipped;
    if (step.mstEdges.includes(index)) return COLORS.edgeInMST;
    if (step.pqEdges?.includes(index)) return COLORS.edgeCandidate;
    return COLORS.edgeDefault;
  };

  const getEdgeWidth = (index: number) => {
    const step = steps[currentStep];
    if (!step) return 2;
    if (step.currentEdge === index || step.mstEdges.includes(index)) return 3;
    return 2;
  };

  const getEdgeDash = (index: number) => {
    const step = steps[currentStep];
    if (!step) return 'none';
    if (step.skippedEdge === index) return '6,4';
    if (step.pqEdges?.includes(index) && !step.mstEdges.includes(index)) return '4,4';
    return 'none';
  };

  const getNodeColor = (nodeId: number) => {
    const step = steps[currentStep];
    if (!step) return COLORS.nodeDefault;
    if (step.highlightNodes.includes(nodeId) && step.currentEdge !== null) {
      const edge = edges[step.currentEdge];
      if (edge && (edge.u === nodeId || edge.v === nodeId)) return COLORS.nodeCurrent;
    }
    if (step.highlightNodes.includes(nodeId)) return COLORS.nodeInMST;
    return COLORS.nodeDefault;
  };

  const renderEdge = (edge: GraphEdge, index: number) => {
    const fromNode = nodes[edge.u];
    const toNode = nodes[edge.v];
    if (!fromNode || !toNode) return null;

    const midX = (fromNode.x + toNode.x) / 2;
    const midY = (fromNode.y + toNode.y) / 2;
    const color = getEdgeColor(index);
    const width = getEdgeWidth(index);
    const dash = getEdgeDash(index);

    return (
      <g key={`edge-${index}`}>
        <line
          x1={fromNode.x} y1={fromNode.y}
          x2={toNode.x} y2={toNode.y}
          stroke={color}
          strokeWidth={width}
          strokeDasharray={dash}
        />
        <rect
          x={midX - 12} y={midY - 10}
          width={24} height={18}
          rx={4}
          fill="white"
          stroke={color}
          strokeWidth={1}
        />
        <text
          x={midX} y={midY + 4}
          textAnchor="middle"
          fill={COLORS.textWeight}
          fontSize={12}
          fontWeight="bold"
        >
          {edge.weight}
        </text>
      </g>
    );
  };

  const renderNode = (node: GraphNode) => {
    const color = getNodeColor(node.id);
    return (
      <g key={`node-${node.id}`}>
        <circle
          cx={node.x} cy={node.y} r={22}
          fill={color}
          stroke="#374151"
          strokeWidth={2}
        />
        <text
          x={node.x} y={node.y + 5}
          textAnchor="middle"
          fill="white"
          fontSize={14}
          fontWeight="bold"
        >
          {node.label}
        </text>
      </g>
    );
  };

  const step = steps[currentStep];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: COLORS.background }}>
      {/* 标题 + 算法切换 */}
      <div style={{ padding: '12px 15px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, color: COLORS.textPrimary }}>最小生成树 (MST)</h2>
          <p style={{ margin: '4px 0 0 0', color: COLORS.textSecondary, fontSize: '13px' }}>
            {algorithm === 'kruskal' ? 'Kruskal 算法: 按边权重排序，并查集判环' : 'Prim 算法: 从起点出发，优先队列扩展'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn ${algorithm === 'kruskal' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setAlgorithm('kruskal')}
            style={{
              padding: '6px 16px',
              backgroundColor: algorithm === 'kruskal' ? '#3B82F6' : '#E5E7EB',
              color: algorithm === 'kruskal' ? 'white' : COLORS.textPrimary,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: algorithm === 'kruskal' ? 'bold' : 'normal',
            }}
          >
            Kruskal
          </button>
          <button
            className={`btn ${algorithm === 'prim' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setAlgorithm('prim')}
            style={{
              padding: '6px 16px',
              backgroundColor: algorithm === 'prim' ? '#3B82F6' : '#E5E7EB',
              color: algorithm === 'prim' ? 'white' : COLORS.textPrimary,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: algorithm === 'prim' ? 'bold' : 'normal',
            }}
          >
            Prim
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* SVG 图形区域 */}
        <div className="viz-canvas" style={{ flex: 1, position: 'relative', overflow: 'auto' }}>
          <svg width="100%" height="100%" viewBox="0 0 720 200" style={{ minWidth: '600px' }}>
            {edges.map((edge, index) => renderEdge(edge, index))}
            {nodes.map(node => renderNode(node))}
          </svg>
        </div>

        {/* 信息面板 */}
        <div className="viz-info" style={{ width: '280px', borderLeft: '1px solid #E5E7EB', padding: '12px', overflowY: 'auto' }}>
          {/* 当前步骤 */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: COLORS.textPrimary, fontSize: '14px' }}>当前步骤</h4>
            <div style={{
              padding: '10px',
              backgroundColor: '#FEF3C7',
              borderRadius: '6px',
              fontSize: '13px',
              lineHeight: '1.5',
              color: COLORS.textPrimary,
              minHeight: '40px',
            }}>
              {step?.description || '点击播放开始演示'}
            </div>
          </div>

          {/* MST 边列表 */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: COLORS.textPrimary, fontSize: '14px' }}>
              MST 边 ({step?.mstEdges.length ?? 0} / {nodes.length - 1})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {(step?.mstEdges ?? []).map((edgeIdx, i) => {
                const e = edges[edgeIdx];
                return (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '4px 8px',
                    backgroundColor: '#D1FAE5',
                    borderRadius: '4px',
                    fontSize: '13px',
                  }}>
                    <span>({nodes[e.u].label}, {nodes[e.v].label})</span>
                    <span style={{ color: COLORS.textWeight, fontWeight: 'bold' }}>w={e.weight}</span>
                  </div>
                );
              })}
              {(!step?.mstEdges || step.mstEdges.length === 0) && (
                <div style={{ color: COLORS.textSecondary, fontStyle: 'italic', fontSize: '13px' }}>暂无</div>
              )}
            </div>
            {step?.mstEdges && step.mstEdges.length > 0 && (
              <div style={{ marginTop: '6px', fontSize: '13px', fontWeight: 'bold', color: COLORS.textPrimary }}>
                总权重: {step.mstEdges.reduce((sum, i) => sum + edges[i].weight, 0)}
              </div>
            )}
          </div>

          {/* 候选边队列（Prim）或排序结果（Kruskal） */}
          {algorithm === 'prim' && step?.pqEdges && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: COLORS.textPrimary, fontSize: '14px' }}>候选队列</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {step.pqEdges.slice(0, 6).map((edgeIdx, i) => {
                  const e = edges[edgeIdx];
                  return (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '3px 8px',
                      backgroundColor: i === 0 ? '#FEF3C7' : '#F3F4F6',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}>
                      <span>({nodes[e.u].label}, {nodes[e.v].label})</span>
                      <span style={{ color: COLORS.textWeight }}>{e.weight}</span>
                    </div>
                  );
                })}
                {step.pqEdges.length > 6 && (
                  <div style={{ fontSize: '11px', color: COLORS.textSecondary }}>...还有 {step.pqEdges.length - 6} 条</div>
                )}
                {step.pqEdges.length === 0 && (
                  <div style={{ color: COLORS.textSecondary, fontStyle: 'italic', fontSize: '12px' }}>空</div>
                )}
              </div>
            </div>
          )}

          {/* 图例 */}
          <div>
            <h4 style={{ margin: '0 0 8px 0', color: COLORS.textPrimary, fontSize: '14px' }}>图例</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '3px', backgroundColor: COLORS.edgeInMST }} />
                <span>已加入 MST 的边</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '3px', backgroundColor: COLORS.edgeCurrent }} />
                <span>当前考虑的边（加入）</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '3px', backgroundColor: COLORS.edgeSkipped, borderBottom: '2px dashed ' + COLORS.edgeSkipped }} />
                <span>跳过的边（形成环）</span>
              </div>
              {algorithm === 'prim' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '20px', height: '3px', backgroundColor: COLORS.edgeCandidate, borderBottom: '2px dashed ' + COLORS.edgeCandidate }} />
                  <span>候选队列中的边</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: COLORS.nodeInMST }} />
                <span>已选节点</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: COLORS.nodeCurrent }} />
                <span>当前处理节点</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 控制栏 */}
      <div className="viz-controls" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '12px',
        borderTop: '1px solid #E5E7EB',
        backgroundColor: 'white',
      }}>
        <button
          className="btn btn-secondary"
          onClick={handleReset}
          disabled={currentStep === 0}
          style={{
            padding: '6px 14px',
            backgroundColor: currentStep === 0 ? '#E5E7EB' : '#6B7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
            fontSize: '13px',
          }}
        >
          重置
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleStepBackward}
          disabled={currentStep === 0}
          style={{
            padding: '6px 14px',
            backgroundColor: currentStep === 0 ? '#E5E7EB' : '#6B7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
            fontSize: '13px',
          }}
        >
          上一步
        </button>
        <button
          className="btn btn-primary"
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={steps.length === 0}
          style={{
            padding: '6px 22px',
            backgroundColor: isPlaying ? '#EF4444' : '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: steps.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
          }}
        >
          {isPlaying ? '暂停' : currentStep >= steps.length - 1 ? '重新播放' : '播放'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleStepForward}
          disabled={currentStep >= steps.length - 1}
          style={{
            padding: '6px 14px',
            backgroundColor: currentStep >= steps.length - 1 ? '#E5E7EB' : '#6B7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: currentStep >= steps.length - 1 ? 'not-allowed' : 'pointer',
            fontSize: '13px',
          }}
        >
          下一步
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '16px' }}>
          <span style={{ fontSize: '13px', color: COLORS.textSecondary }}>速度:</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #D1D5DB', fontSize: '13px' }}
          >
            <option value={2000}>慢速</option>
            <option value={1000}>正常</option>
            <option value={500}>快速</option>
            <option value={200}>极快</option>
          </select>
        </div>
        <div style={{ marginLeft: '16px', fontSize: '13px', color: COLORS.textSecondary }}>
          步骤: {currentStep + 1} / {steps.length}
        </div>
      </div>
    </div>
  );
}
