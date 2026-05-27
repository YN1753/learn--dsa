// 最小生成树 (MST) 演示 - Kruskal 与 Prim 算法

interface Edge {
  u: number;
  v: number;
  weight: number;
}

// ========== 并查集 (用于 Kruskal) ==========

function makeSet(n: number): { parent: number[]; rank: number[] } {
  const parent = new Array(n);
  const rank = new Array(n).fill(0);
  for (let i = 0; i < n; i++) parent[i] = i;
  return { parent, rank };
}

function find(parent: number[], x: number): number {
  if (parent[x] !== x) {
    parent[x] = find(parent, parent[x]);
  }
  return parent[x];
}

function union(parent: number[], rank: number[], x: number, y: number): boolean {
  const rootX = find(parent, x);
  const rootY = find(parent, y);
  if (rootX === rootY) return false;
  if (rank[rootX] < rank[rootY]) {
    parent[rootX] = rootY;
  } else if (rank[rootX] > rank[rootY]) {
    parent[rootY] = rootX;
  } else {
    parent[rootY] = rootX;
    rank[rootX]++;
  }
  return true;
}

// ========== Kruskal 算法 ==========

function kruskal(n: number, edges: Edge[]): { steps: string[]; mstEdges: Edge[]; totalWeight: number } {
  const steps: string[] = [];
  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);

  steps.push('【Kruskal 算法】');
  steps.push('');
  steps.push('第一步：将所有边按权重排序');
  for (const e of sortedEdges) {
    steps.push(`  (${e.u}, ${e.v}) 权重=${e.weight}`);
  }
  steps.push('');

  const { parent, rank } = makeSet(n);
  const mstEdges: Edge[] = [];
  let totalWeight = 0;

  steps.push('第二步：依次考虑每条边');
  steps.push('');

  for (const edge of sortedEdges) {
    const rootU = find(parent, edge.u);
    const rootV = find(parent, edge.v);

    if (rootU !== rootV) {
      union(parent, rank, edge.u, edge.v);
      mstEdges.push(edge);
      totalWeight += edge.weight;
      steps.push(`  [加入] 边 (${edge.u}, ${edge.v}), 权重=${edge.weight} → 不构成环，加入 MST`);
    } else {
      steps.push(`  [跳过] 边 (${edge.u}, ${edge.v}), 权重=${edge.weight} → 会构成环`);
    }

    if (mstEdges.length === n - 1) break;
  }

  steps.push('');
  steps.push(`Kruskal 结果：MST 包含 ${mstEdges.length} 条边，总权重 = ${totalWeight}`);

  return { steps, mstEdges, totalWeight };
}

// ========== Prim 算法 ==========

function prim(n: number, edges: Edge[], start: number = 0): { steps: string[]; mstEdges: Edge[]; totalWeight: number } {
  const steps: string[] = [];
  const nodeNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  // 构建邻接表
  const adj: { to: number; weight: number; edgeIdx: number }[][] = Array.from({ length: n }, () => []);
  edges.forEach((e, idx) => {
    adj[e.u].push({ to: e.v, weight: e.weight, edgeIdx: idx });
    adj[e.v].push({ to: e.u, weight: e.weight, edgeIdx: idx });
  });

  steps.push('【Prim 算法】');
  steps.push('');
  steps.push(`第一步：选择起始节点 ${nodeNames[start]}`);
  steps.push('');

  const visited = new Array(n).fill(false);
  const inQueue: { from: number; to: number; weight: number }[] = [];
  visited[start] = true;
  const mstEdges: Edge[] = [];
  let totalWeight = 0;

  // 将起始节点的邻边加入候选队列
  for (const neighbor of adj[start]) {
    inQueue.push({ from: start, to: neighbor.to, weight: neighbor.weight });
  }
  inQueue.sort((a, b) => a.weight - b.weight);

  steps.push(`将 ${nodeNames[start]} 的邻边加入候选队列`);
  steps.push(`  当前已选节点集: {${nodeNames[start]}}`);
  steps.push('');

  let stepNum = 2;
  while (inQueue.length > 0 && mstEdges.length < n - 1) {
    // 取出权重最小的候选边
    const minEdge = inQueue.shift()!;

    // 如果目标节点已访问，跳过
    if (visited[minEdge.to]) {
      steps.push(`第${stepNum}步：考虑边 (${nodeNames[minEdge.from]}, ${nodeNames[minEdge.to]}), 权重=${minEdge.weight} → ${nodeNames[minEdge.to]} 已在集合中，跳过`);
      steps.push('');
      stepNum++;
      continue;
    }

    // 加入 MST
    visited[minEdge.to] = true;
    mstEdges.push({ u: minEdge.from, v: minEdge.to, weight: minEdge.weight });
    totalWeight += minEdge.weight;

    const visitedNodes = nodeNames.filter((_, i) => visited[i]);
    steps.push(`第${stepNum}步：加入边 (${nodeNames[minEdge.from]}, ${nodeNames[minEdge.to]}), 权重=${minEdge.weight}`);
    steps.push(`  将 ${nodeNames[minEdge.to]} 加入已选集合`);
    steps.push(`  当前已选节点集: {${visitedNodes.join(', ')}}`);

    // 将新节点的邻边加入候选队列
    for (const neighbor of adj[minEdge.to]) {
      if (!visited[neighbor.to]) {
        inQueue.push({ from: minEdge.to, to: neighbor.to, weight: neighbor.weight });
      }
    }
    inQueue.sort((a, b) => a.weight - b.weight);

    if (inQueue.length > 0) {
      const queueStr = inQueue.map(e => `(${nodeNames[e.from]},${nodeNames[e.to]})=${e.weight}`).join(', ');
      steps.push(`  候选队列: [${queueStr}]`);
    } else {
      steps.push(`  候选队列: [空]`);
    }
    steps.push('');
    stepNum++;
  }

  steps.push(`Prim 结果：MST 包含 ${mstEdges.length} 条边，总权重 = ${totalWeight}`);

  return { steps, mstEdges, totalWeight };
}

// ========== 对比分析 ==========

function comparison(kruskalWeight: number, primWeight: number, kruskalTime: string, primTime: string): string[] {
  const lines: string[] = [];
  lines.push('');
  lines.push('═══════════════════════════════════════════');
  lines.push('            算法对比分析');
  lines.push('═══════════════════════════════════════════');
  lines.push('');
  lines.push(`  Kruskal MST 总权重: ${kruskalWeight}`);
  lines.push(`  Prim    MST 总权重: ${primWeight}`);
  lines.push(`  结果一致性: ${kruskalWeight === primWeight ? '相同 ✓' : '不同 ✗'}`);
  lines.push('');
  lines.push('  时间复杂度:');
  lines.push(`    Kruskal: O(E log E) = ${kruskalTime}`);
  lines.push(`    Prim:    O((V+E) log V) = ${primTime}`);
  lines.push('');
  lines.push('  适用场景:');
  lines.push('    Kruskal: 稀疏图（边数远小于顶点数的平方）');
  lines.push('    Prim:    稠密图（边数接近顶点数的平方）');
  lines.push('');
  lines.push('  核心数据结构:');
  lines.push('    Kruskal: 并查集（判断是否形成环）');
  lines.push('    Prim:    优先队列（维护候选边）');
  lines.push('');
  lines.push('  策略:');
  lines.push('    Kruskal: 全局贪心（按边权重排序）');
  lines.push('    Prim:    局部贪心（逐步扩展顶点集）');
  lines.push('═══════════════════════════════════════════');

  return lines;
}

// ========== 主演示函数 ==========

export default function demo(): string {
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════');
  lines.push('    最小生成树 (MST) 算法演示');
  lines.push('═══════════════════════════════════════');
  lines.push('');

  // 定义示例图（5个顶点，7条边）
  const n = 5;
  const nodeNames = ['A', 'B', 'C', 'D', 'E'];
  const edges: Edge[] = [
    { u: 0, v: 1, weight: 4 },  // A-B
    { u: 0, v: 2, weight: 3 },  // A-C
    { u: 1, v: 2, weight: 1 },  // B-C
    { u: 1, v: 3, weight: 2 },  // B-D
    { u: 2, v: 3, weight: 5 },  // C-D
    { u: 3, v: 4, weight: 7 },  // D-E
    { u: 2, v: 4, weight: 6 },  // C-E
  ];

  // 显示图结构
  lines.push('示例图结构:');
  lines.push('');
  lines.push('        4');
  lines.push('  A --------- B');
  lines.push('  |\\         /|');
  lines.push('  | \\ 1   2 / |');
  lines.push('  |  \\     /  |');
  lines.push('  3   \\   /   |');
  lines.push('  |    \\ /    |');
  lines.push('  C ----+---- D');
  lines.push('  |     5     |');
  lines.push('  |           |');
  lines.push('  6           7');
  lines.push('  |           |');
  lines.push('  +----- E ---+');
  lines.push('');
  lines.push('顶点: ' + nodeNames.join(', '));
  lines.push('边:');
  for (const e of edges) {
    lines.push(`  (${nodeNames[e.u]}, ${nodeNames[e.v]}) = ${e.weight}`);
  }
  lines.push('');

  // 运行 Kruskal
  lines.push('═══════════════════════════════════════');
  const kruskalResult = kruskal(n, edges);
  lines.push(...kruskalResult.steps);

  lines.push('');
  lines.push('═══════════════════════════════════════');

  // 运行 Prim
  const primResult = prim(n, edges, 0);
  lines.push(...primResult.steps);

  // 对比分析
  lines.push(...comparison(
    kruskalResult.totalWeight,
    primResult.totalWeight,
    `O(${edges.length} log ${edges.length}) = O(${edges.length} × ${Math.ceil(Math.log2(edges.length))}) = O(${edges.length * Math.ceil(Math.log2(edges.length))})`,
    `O((${n}+${edges.length}) log ${n}) = O(${n + edges.length} × ${Math.ceil(Math.log2(n))}) = O(${(n + edges.length) * Math.ceil(Math.log2(n))})`
  ));

  lines.push('');
  lines.push('═══════════════════════════════════════');
  lines.push('  演示完成！');
  lines.push('═══════════════════════════════════════');

  return lines.join('\n');
}
