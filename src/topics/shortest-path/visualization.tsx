import { useState, useEffect, useRef } from 'react';

interface Edge {
  from: number;
  to: number;
  weight: number;
}

interface Node {
  id: number;
  x: number;
  y: number;
  label: string;
}

interface DijkstraStep {
  currentNode: number;
  dist: number[];
  visited: number[];
  priorityQueue: { node: number; dist: number }[];
  description: string;
  relaxingEdge?: { from: number; to: number };
  updatedNode?: number;
  pathFound?: number[];
}

const NODE_RADIUS = 25;
const COLORS = {
  nodeDefault: '#6B7280',
  nodeCurrent: '#3B82F6',
  nodeVisited: '#10B981',
  nodeUpdated: '#F59E0B',
  nodeUnvisited: '#9CA3AF',
  edgeDefault: '#D1D5DB',
  edgeRelaxing: '#EF4444',
  edgePath: '#10B981',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textDistance: '#059669',
  background: '#F9FAFB',
};

export default function ShortestPathVisualization() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [steps, setSteps] = useState<DijkstraStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [dist, setDist] = useState<number[]>([]);
  const [visited, setVisited] = useState<number[]>([]);
  const [priorityQueue, setPriorityQueue] = useState<{ node: number; dist: number }[]>([]);
  const [description, setDescription] = useState('');
  const [relaxingEdge, setRelaxingEdge] = useState<{ from: number; to: number } | null>(null);
  const [updatedNode, setUpdatedNode] = useState<number | null>(null);
  const [pathFound, setPathFound] = useState<number[]>([]);
  const timerRef = useRef<number | null>(null);

  // 初始化图数据
  useEffect(() => {
    const initialNodes: Node[] = [
      { id: 0, x: 100, y: 100, label: 'A' },
      { id: 1, x: 250, y: 50, label: 'B' },
      { id: 2, x: 250, y: 150, label: 'C' },
      { id: 3, x: 400, y: 100, label: 'D' },
      { id: 4, x: 550, y: 100, label: 'E' },
    ];

    const initialEdges: Edge[] = [
      { from: 0, to: 1, weight: 4 },
      { from: 0, to: 2, weight: 2 },
      { from: 1, to: 2, weight: 1 },
      { from: 1, to: 3, weight: 5 },
      { from: 2, to: 3, weight: 8 },
      { from: 2, to: 4, weight: 10 },
      { from: 3, to: 4, weight: 2 },
    ];

    setNodes(initialNodes);
    setEdges(initialEdges);

    // 生成 Dijkstra 算法的步骤
    const generatedSteps = generateDijkstraSteps(initialNodes, initialEdges, 0);
    setSteps(generatedSteps);
  }, []);

  // 处理播放/暂停
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      timerRef.current = window.setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, speed);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, currentStep, steps.length, speed]);

  // 更新当前步骤的状态
  useEffect(() => {
    if (steps.length > 0 && currentStep < steps.length) {
      const step = steps[currentStep];
      setDist(step.dist);
      setVisited(step.visited);
      setPriorityQueue(step.priorityQueue);
      setDescription(step.description);
      setRelaxingEdge(step.relaxingEdge || null);
      setUpdatedNode(step.updatedNode ?? null);
      setPathFound(step.pathFound || []);
    }
  }, [currentStep, steps]);

  const generateDijkstraSteps = (nodes: Node[], edges: Edge[], startNode: number): DijkstraStep[] => {
    const steps: DijkstraStep[] = [];
    const dist: number[] = new Array(nodes.length).fill(Infinity);
    const visited: number[] = [];
    const prev: number[] = new Array(nodes.length).fill(-1);
    const priorityQueue: { node: number; dist: number }[] = [];

    // 初始化
    dist[startNode] = 0;
    priorityQueue.push({ node: startNode, dist: 0 });

    steps.push({
      currentNode: startNode,
      dist: [...dist],
      visited: [...visited],
      priorityQueue: [...priorityQueue],
      description: `初始化: 设置起点 ${nodes[startNode].label} 距离为 0，加入优先队列`
    });

    while (priorityQueue.length > 0) {
      // 按距离排序优先队列
      priorityQueue.sort((a, b) => a.dist - b.dist);
      const { node: u } = priorityQueue.shift()!;

      // 如果节点已访问，跳过
      if (visited.includes(u)) {
        continue;
      }

      // 标记为已访问
      visited.push(u);

      steps.push({
        currentNode: u,
        dist: [...dist],
        visited: [...visited],
        priorityQueue: [...priorityQueue],
        description: `从优先队列取出距离最小的节点 ${nodes[u].label} (距离: ${dist[u]}), 标记为已访问`
      });

      // 检查所有邻居
      const neighbors = edges.filter(e => e.from === u);
      for (const edge of neighbors) {
        const v = edge.to;
        const newDist = dist[u] + edge.weight;

        if (!visited.includes(v)) {
          if (newDist < dist[v]) {
            // 找到更短路径
            const oldDist = dist[v];
            dist[v] = newDist;
            prev[v] = u;

            // 更新优先队列
            const existingIndex = priorityQueue.findIndex(item => item.node === v);
            if (existingIndex >= 0) {
              priorityQueue[existingIndex].dist = newDist;
            } else {
              priorityQueue.push({ node: v, dist: newDist });
            }

            steps.push({
              currentNode: u,
              dist: [...dist],
              visited: [...visited],
              priorityQueue: [...priorityQueue],
              description: `松弛边 ${nodes[u].label} -> ${nodes[v].label}: ${dist[u]} + ${edge.weight} = ${newDist} < ${oldDist === Infinity ? '∞' : oldDist}, 更新距离为 ${newDist}`,
              relaxingEdge: { from: u, to: v },
              updatedNode: v
            });
          } else {
            steps.push({
              currentNode: u,
              dist: [...dist],
              visited: [...visited],
              priorityQueue: [...priorityQueue],
              description: `检查边 ${nodes[u].label} -> ${nodes[v].label}: ${dist[u]} + ${edge.weight} = ${newDist} >= ${dist[v] === Infinity ? '∞' : dist[v]}, 不更新`,
              relaxingEdge: { from: u, to: v }
            });
          }
        }
      }
    }

    // 最后一步：找到最短路径
    const targetNode = nodes.length - 1;
    const path: number[] = [];
    let current = targetNode;
    while (current !== -1) {
      path.unshift(current);
      current = prev[current];
    }

    if (path[0] === startNode) {
      steps.push({
        currentNode: targetNode,
        dist: [...dist],
        visited: [...visited],
        priorityQueue: [],
        description: `算法完成! 从 ${nodes[startNode].label} 到 ${nodes[targetNode].label} 的最短路径为: ${path.map(n => nodes[n].label).join(' -> ')} (距离: ${dist[targetNode]})`,
        pathFound: path
      });
    } else {
      steps.push({
        currentNode: -1,
        dist: [...dist],
        visited: [...visited],
        priorityQueue: [],
        description: '算法完成!'
      });
    }

    return steps;
  };

  const handlePlay = () => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handleStepForward = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleStepBackward = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const getNodeColor = (nodeId: number) => {
    if (pathFound.includes(nodeId)) return COLORS.edgePath;
    if (updatedNode === nodeId) return COLORS.nodeUpdated;
    if (nodeId === steps[currentStep]?.currentNode) return COLORS.nodeCurrent;
    if (visited.includes(nodeId)) return COLORS.nodeVisited;
    return COLORS.nodeDefault;
  };

  const getEdgeColor = (edge: Edge) => {
    if (relaxingEdge && relaxingEdge.from === edge.from && relaxingEdge.to === edge.to) {
      return COLORS.edgeRelaxing;
    }
    if (pathFound.length > 0) {
      for (let i = 0; i < pathFound.length - 1; i++) {
        if (pathFound[i] === edge.from && pathFound[i + 1] === edge.to) {
          return COLORS.edgePath;
        }
      }
    }
    return COLORS.edgeDefault;
  };

  const getEdgeWidth = (edge: Edge) => {
    if (relaxingEdge && relaxingEdge.from === edge.from && relaxingEdge.to === edge.to) {
      return 3;
    }
    if (pathFound.length > 0) {
      for (let i = 0; i < pathFound.length - 1; i++) {
        if (pathFound[i] === edge.from && pathFound[i + 1] === edge.to) {
          return 3;
        }
      }
    }
    return 2;
  };

  const renderEdge = (edge: Edge, index: number) => {
    const fromNode = nodes[edge.from];
    const toNode = nodes[edge.to];

    if (!fromNode || !toNode) return null;

    const midX = (fromNode.x + toNode.x) / 2;
    const midY = (fromNode.y + toNode.y) / 2;

    return (
      <g key={`edge-${index}`}>
        <line
          x1={fromNode.x}
          y1={fromNode.y}
          x2={toNode.x}
          y2={toNode.y}
          stroke={getEdgeColor(edge)}
          strokeWidth={getEdgeWidth(edge)}
          markerEnd="url(#arrowhead)"
        />
        <text
          x={midX}
          y={midY - 10}
          textAnchor="middle"
          fill={COLORS.textSecondary}
          fontSize={12}
          fontWeight="bold"
        >
          {edge.weight}
        </text>
      </g>
    );
  };

  const renderNode = (node: Node) => {
    const isCurrent = node.id === steps[currentStep]?.currentNode;
    const isVisited = visited.includes(node.id);
    const isUpdated = updatedNode === node.id;
    const distance = dist[node.id];

    return (
      <g key={`node-${node.id}`}>
        <circle
          cx={node.x}
          cy={node.y}
          r={NODE_RADIUS}
          fill={getNodeColor(node.id)}
          stroke={isCurrent ? '#1D4ED8' : isUpdated ? '#D97706' : '#374151'}
          strokeWidth={isCurrent || isUpdated ? 3 : 2}
        />
        <text
          x={node.x}
          y={node.y + 5}
          textAnchor="middle"
          fill="white"
          fontSize={16}
          fontWeight="bold"
        >
          {node.label}
        </text>
        <text
          x={node.x}
          y={node.y + NODE_RADIUS + 15}
          textAnchor="middle"
          fill={COLORS.textDistance}
          fontSize={12}
          fontWeight="bold"
        >
          {distance === Infinity ? '∞' : distance}
        </text>
        {isCurrent && (
          <text
            x={node.x}
            y={node.y - NODE_RADIUS - 10}
            textAnchor="middle"
            fill={COLORS.nodeCurrent}
            fontSize={10}
            fontWeight="bold"
          >
            当前
          </text>
        )}
        {isVisited && !isCurrent && (
          <text
            x={node.x}
            y={node.y - NODE_RADIUS - 10}
            textAnchor="middle"
            fill={COLORS.nodeVisited}
            fontSize={10}
            fontWeight="bold"
          >
            已访问
          </text>
        )}
      </g>
    );
  };

  const renderPriorityQueue = () => {
    return (
      <div className="priority-queue">
        <h4 style={{ margin: '0 0 10px 0', color: COLORS.textPrimary }}>优先队列</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {priorityQueue.length === 0 ? (
            <div style={{ color: COLORS.textSecondary, fontStyle: 'italic' }}>空</div>
          ) : (
            priorityQueue.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '5px 10px',
                  backgroundColor: index === 0 ? '#DBEAFE' : '#F3F4F6',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <span style={{ fontWeight: 'bold' }}>{nodes[item.node]?.label}</span>
                <span style={{ color: COLORS.textDistance }}>{item.dist}</span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderDistArray = () => {
    return (
      <div className="dist-array">
        <h4 style={{ margin: '0 0 10px 0', color: COLORS.textPrimary }}>距离数组 dist[]</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {nodes.map((node, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '8px',
                backgroundColor: visited.includes(index) ? '#D1FAE5' : '#F3F4F6',
                borderRadius: '6px',
                minWidth: '60px'
              }}
            >
              <span style={{ fontWeight: 'bold', color: COLORS.textPrimary }}>{node.label}</span>
              <span style={{ color: COLORS.textDistance, fontWeight: 'bold' }}>
                {dist[index] === Infinity ? '∞' : dist[index]}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: COLORS.background }}>
      {/* 标题 */}
      <div style={{ padding: '15px', borderBottom: '1px solid #E5E7EB' }}>
        <h2 style={{ margin: 0, color: COLORS.textPrimary }}>Dijkstra 最短路径算法</h2>
        <p style={{ margin: '5px 0 0 0', color: COLORS.textSecondary, fontSize: '14px' }}>
          逐步演示如何找到从起点 A 到其他所有节点的最短路径
        </p>
      </div>

      {/* 主内容区 */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 图形可视化区域 */}
        <div className="viz-canvas" style={{ flex: 1, position: 'relative', overflow: 'auto' }}>
          <svg width="100%" height="100%" viewBox="0 0 650 200" style={{ minWidth: '600px' }}>
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill={COLORS.edgeDefault} />
              </marker>
            </defs>

            {/* 渲染边 */}
            {edges.map((edge, index) => renderEdge(edge, index))}

            {/* 渲染节点 */}
            {nodes.map(node => renderNode(node))}
          </svg>
        </div>

        {/* 信息面板 */}
        <div className="viz-info" style={{ width: '300px', borderLeft: '1px solid #E5E7EB', padding: '15px', overflowY: 'auto' }}>
          {/* 步骤描述 */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: COLORS.textPrimary }}>当前步骤</h4>
            <div style={{
              padding: '10px',
              backgroundColor: '#FEF3C7',
              borderRadius: '6px',
              fontSize: '14px',
              lineHeight: '1.5',
              color: COLORS.textPrimary
            }}>
              {description || '点击播放开始演示'}
            </div>
          </div>

          {/* 距离数组 */}
          {renderDistArray()}

          {/* 优先队列 */}
          {renderPriorityQueue()}

          {/* 图例 */}
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: COLORS.textPrimary }}>图例</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: COLORS.nodeCurrent }} />
                <span>当前处理节点</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: COLORS.nodeVisited }} />
                <span>已访问节点</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: COLORS.nodeUpdated }} />
                <span>距离更新节点</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: COLORS.nodeDefault }} />
                <span>未访问节点</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '24px', height: '3px', backgroundColor: COLORS.edgeRelaxing }} />
                <span>正在松弛的边</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '24px', height: '3px', backgroundColor: COLORS.edgePath }} />
                <span>最短路径</span>
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
        padding: '15px',
        borderTop: '1px solid #E5E7EB',
        backgroundColor: 'white'
      }}>
        <button
          className="btn btn-secondary"
          onClick={handleReset}
          disabled={currentStep === 0}
          style={{
            padding: '8px 16px',
            backgroundColor: currentStep === 0 ? '#E5E7EB' : '#6B7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          重置
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleStepBackward}
          disabled={currentStep === 0}
          style={{
            padding: '8px 16px',
            backgroundColor: currentStep === 0 ? '#E5E7EB' : '#6B7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          上一步
        </button>
        <button
          className="btn btn-primary"
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={steps.length === 0}
          style={{
            padding: '8px 24px',
            backgroundColor: isPlaying ? '#EF4444' : '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: steps.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {isPlaying ? '暂停' : currentStep >= steps.length - 1 ? '重新播放' : '播放'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleStepForward}
          disabled={currentStep >= steps.length - 1}
          style={{
            padding: '8px 16px',
            backgroundColor: currentStep >= steps.length - 1 ? '#E5E7EB' : '#6B7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: currentStep >= steps.length - 1 ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          下一步
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '20px' }}>
          <span style={{ fontSize: '14px', color: COLORS.textSecondary }}>速度:</span>
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: '1px solid #D1D5DB',
              fontSize: '14px'
            }}
          >
            <option value={2000}>慢速</option>
            <option value={1000}>正常</option>
            <option value={500}>快速</option>
            <option value={200}>极快</option>
          </select>
        </div>
        <div style={{ marginLeft: '20px', fontSize: '14px', color: COLORS.textSecondary }}>
          步骤: {currentStep + 1} / {steps.length}
        </div>
      </div>
    </div>
  );
}