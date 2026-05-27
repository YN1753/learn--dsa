interface Edge {
  to: number;
  weight: number;
}

interface Graph {
  adjacencyList: Edge[][];
  nodeCount: number;
}

interface DijkstraStep {
  currentNode: number;
  dist: number[];
  visited: boolean[];
  description: string;
  relaxingEdge?: { from: number; to: number; weight: number };
  updatedNode?: number;
}

export default function shortestPathDemo(): string {
  const result: string[] = [];

  // 创建一个示例加权图
  // 节点: 0=A, 1=B, 2=C, 3=D, 4=E
  const graph: Graph = {
    nodeCount: 5,
    adjacencyList: [
      [{ to: 1, weight: 4 }, { to: 2, weight: 1 }],  // A -> B(4), A -> C(1)
      [{ to: 3, weight: 1 }],                          // B -> D(1)
      [{ to: 1, weight: 2 }, { to: 3, weight: 5 }],   // C -> B(2), C -> D(5)
      [{ to: 4, weight: 3 }],                          // D -> E(3)
      []                                                // E (终点)
    ]
  };

  const nodeNames = ['A', 'B', 'C', 'D', 'E'];

  result.push("=== Dijkstra 最短路径算法演示 ===\n");

  // 显示图结构
  result.push("图结构 (邻接表):");
  for (let i = 0; i < graph.nodeCount; i++) {
    const edges = graph.adjacencyList[i]
      .map(e => `${nodeNames[e.to]}(${e.weight})`)
      .join(', ');
    result.push(`  ${nodeNames[i]} -> ${edges || '无出边'}`);
  }
  result.push("");

  // 执行 Dijkstra 算法
  const steps = dijkstraWithSteps(graph, 0);

  // 显示执行步骤
  result.push("算法执行过程:\n");
  steps.forEach((step, index) => {
    result.push(`步骤 ${index + 1}:`);
    result.push(`  ${step.description}`);

    // 显示距离数组
    const distStr = step.dist
      .map((d, i) => `${nodeNames[i]}=${d === Infinity ? '∞' : d}`)
      .join(', ');
    result.push(`  距离数组: [${distStr}]`);

    // 显示访问状态
    const visitedStr = step.visited
      .map((v, i) => `${nodeNames[i]}:${v ? '已访问' : '未访问'}`)
      .join(', ');
    result.push(`  访问状态: [${visitedStr}]`);

    if (step.relaxingEdge) {
      const { from, to, weight } = step.relaxingEdge;
      result.push(`  松弛边: ${nodeNames[from]} -> ${nodeNames[to]} (权重: ${weight})`);
    }
    result.push("");
  });

  // 显示最终结果
  result.push("=== 最终结果 ===\n");

  const finalStep = steps[steps.length - 1];
  result.push("从节点 A 出发的最短距离:");
  for (let i = 0; i < graph.nodeCount; i++) {
    const dist = finalStep.dist[i];
    result.push(`  到 ${nodeNames[i]}: ${dist === Infinity ? '不可达' : dist}`);
  }
  result.push("");

  // 重建最短路径
  result.push("最短路径重建:");
  for (let i = 1; i < graph.nodeCount; i++) {
    const path = reconstructPath(graph, 0, i, finalStep.dist);
    if (path.length > 0) {
      const pathStr = path.map(n => nodeNames[n]).join(' -> ');
      const distance = finalStep.dist[i];
      result.push(`  A -> ${nodeNames[i]}: ${pathStr} (距离: ${distance})`);
    } else {
      result.push(`  A -> ${nodeNames[i]}: 不可达`);
    }
  }

  return result.join('\n');
}

function dijkstraWithSteps(graph: Graph, source: number): DijkstraStep[] {
  const steps: DijkstraStep[] = [];
  const dist: number[] = new Array(graph.nodeCount).fill(Infinity);
  const visited: boolean[] = new Array(graph.nodeCount).fill(false);
  const prev: number[] = new Array(graph.nodeCount).fill(-1);

  // 初始化
  dist[source] = 0;
  steps.push({
    currentNode: source,
    dist: [...dist],
    visited: [...visited],
    description: `初始化: 设置源点 ${['A', 'B', 'C', 'D', 'E'][source]} 距离为 0`
  });

  // 主循环
  for (let i = 0; i < graph.nodeCount; i++) {
    // 找到未访问节点中距离最小的节点
    let u = -1;
    let minDist = Infinity;
    for (let j = 0; j < graph.nodeCount; j++) {
      if (!visited[j] && dist[j] < minDist) {
        minDist = dist[j];
        u = j;
      }
    }

    // 如果找不到可达的未访问节点，算法结束
    if (u === -1 || dist[u] === Infinity) {
      steps.push({
        currentNode: -1,
        dist: [...dist],
        visited: [...visited],
        description: "没有更多可达的未访问节点，算法结束"
      });
      break;
    }

    // 标记节点为已访问
    visited[u] = true;
    const nodeNames = ['A', 'B', 'C', 'D', 'E'];
    steps.push({
      currentNode: u,
      dist: [...dist],
      visited: [...visited],
      description: `选择距离最小的未访问节点 ${nodeNames[u]} (距离: ${dist[u]}), 标记为已访问`
    });

    // 松弛所有邻居
    for (const edge of graph.adjacencyList[u]) {
      const v = edge.to;
      const newDist = dist[u] + edge.weight;

      if (!visited[v]) {
        if (newDist < dist[v]) {
          // 找到更短的路径，更新距离
          const oldDist = dist[v];
          dist[v] = newDist;
          prev[v] = u;
          steps.push({
            currentNode: u,
            dist: [...dist],
            visited: [...visited],
            description: `松弛边 ${nodeNames[u]} -> ${nodeNames[v]}: ${dist[u]} + ${edge.weight} = ${newDist} < ${oldDist === Infinity ? '∞' : oldDist}, 更新距离`,
            relaxingEdge: { from: u, to: v, weight: edge.weight },
            updatedNode: v
          });
        } else {
          steps.push({
            currentNode: u,
            dist: [...dist],
            visited: [...visited],
            description: `检查边 ${nodeNames[u]} -> ${nodeNames[v]}: ${dist[u]} + ${edge.weight} = ${newDist} >= ${dist[v] === Infinity ? '∞' : dist[v]}, 不更新`,
            relaxingEdge: { from: u, to: v, weight: edge.weight }
          });
        }
      }
    }
  }

  return steps;
}

function reconstructPath(graph: Graph, source: number, target: number, dist: number[]): number[] {
  if (dist[target] === Infinity) {
    return [];
  }

  const path: number[] = [];
  let current = target;

  // 需要重新计算 prev 数组
  const prev: number[] = new Array(graph.nodeCount).fill(-1);
  const visited: boolean[] = new Array(graph.nodeCount).fill(false);
  const tempDist: number[] = new Array(graph.nodeCount).fill(Infinity);

  tempDist[source] = 0;

  for (let i = 0; i < graph.nodeCount; i++) {
    let u = -1;
    let minDist = Infinity;
    for (let j = 0; j < graph.nodeCount; j++) {
      if (!visited[j] && tempDist[j] < minDist) {
        minDist = tempDist[j];
        u = j;
      }
    }

    if (u === -1 || tempDist[u] === Infinity) break;

    visited[u] = true;

    for (const edge of graph.adjacencyList[u]) {
      const v = edge.to;
      const newDist = tempDist[u] + edge.weight;
      if (newDist < tempDist[v]) {
        tempDist[v] = newDist;
        prev[v] = u;
      }
    }
  }

  // 重建路径
  while (current !== -1) {
    path.unshift(current);
    current = prev[current];
  }

  // 验证路径是否有效
  if (path[0] !== source) {
    return [];
  }

  return path;
}