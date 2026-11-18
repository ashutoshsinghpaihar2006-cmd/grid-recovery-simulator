/**
 * Power Grid Failure Recovery Simulator
 * Modern Minimalist Light Map UI (Globetrans Style)
 * Faculty of Technology, University of Delhi | 2026-2027
 * Authors: Aashutosh Singh Parihar & C. Sai Vishwak Raju
 * Guide: Dr. Juhi Jain
 */

// ==========================================
// 1. Min-Heap Priority Queue Implementation
// ==========================================
class MinHeap {
  constructor(compareFn = (a, b) => a.key - b.key) {
    this.heap = [];
    this.compare = compareFn;
  }
  size() { return this.heap.length; }
  isEmpty() { return this.heap.length === 0; }
  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }
  pop() {
    if (this.isEmpty()) return null;
    const top = this.heap[0];
    const bottom = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this._sinkDown(0);
    }
    return top;
  }
  _bubbleUp(index) {
    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index], this.heap[parentIdx]) < 0) {
        [this.heap[index], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[index]];
        index = parentIdx;
      } else break;
    }
  }
  _sinkDown(index) {
    const length = this.heap.length;
    while (true) {
      let left = 2 * index + 1;
      let right = 2 * index + 2;
      let smallest = index;
      if (left < length && this.compare(this.heap[left], this.heap[smallest]) < 0) smallest = left;
      if (right < length && this.compare(this.heap[right], this.heap[smallest]) < 0) smallest = right;
      if (smallest !== index) {
        [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
        index = smallest;
      } else break;
    }
  }
}

// ==========================================
// 2. Disjoint Set Union (DSU) for Kruskal's
// ==========================================
class DisjointSet {
  constructor(elements) {
    this.parent = new Map();
    this.rank = new Map();
    for (const elem of elements) {
      this.parent.set(elem, elem);
      this.rank.set(elem, 0);
    }
  }
  find(i) {
    if (this.parent.get(i) !== i) {
      this.parent.set(i, this.find(this.parent.get(i))); // Path compression
    }
    return this.parent.get(i);
  }
  union(i, j) {
    const rootI = this.find(i);
    const rootJ = this.find(j);
    if (rootI === rootJ) return false;
    const rankI = this.rank.get(rootI);
    const rankJ = this.rank.get(rootJ);
    if (rankI < rankJ) this.parent.set(rootI, rootJ);
    else if (rankI > rankJ) this.parent.set(rootJ, rootI);
    else {
      this.parent.set(rootJ, rootI);
      this.rank.set(rootI, rankI + 1);
    }
    return true;
  }
}

// ==========================================
// 3. Grid Data Models
// ==========================================
class GridNode {
  constructor({ id, name, type, priority, lat, lng, capacityMW = 200, demandMW = 50, voltage = '220 kV' }) {
    this.id = id;
    this.name = name;
    this.type = type; // 'generator', 'hospital', 'emergency', 'transit_water', 'residential', 'industrial'
    this.priority = priority; // 0: Generator, 1: Hospital/Emergency, 2: Water/Transit, 3: Residential, 4: Industrial
    this.lat = lat;
    this.lng = lng;
    this.capacityMW = capacityMW;
    this.demandMW = demandMW;
    this.voltage = voltage;

    this.isFailed = false;
    this.isEnergized = type === 'generator';
    this.markerRef = null;
  }
}

class GridEdge {
  constructor({ id, u, v, weight, capacityMW = 300, risk = 'normal' }) {
    this.id = id;
    this.u = u;
    this.v = v;
    this.weight = weight; // Transmission cost / impedance
    this.capacityMW = capacityMW;
    this.currentLoadMW = Math.round(weight * 12);
    this.risk = risk;

    this.isFailed = false;
    this.isInRecoveryPath = false;
    this.isInMST = false;
    this.polylineRef = null;
  }
}

class PowerGrid {
  constructor() {
    this.nodes = new Map();
    this.edges = [];
    this.edgeMap = new Map();
  }
  clear() {
    this.nodes.clear();
    this.edges = [];
    this.edgeMap.clear();
  }
  addNode(node) { this.nodes.set(node.id, node); }
  addEdge(edge) {
    this.edges.push(edge);
    this.edgeMap.set(edge.id, edge);
  }
  getNode(id) { return this.nodes.get(id); }
  getEdge(id) { return this.edgeMap.get(id); }

  getAdjacentEdges(nodeId) {
    return this.edges.filter(e => (e.u === nodeId || e.v === nodeId) && !e.isFailed);
  }

  getNeighbors(nodeId) {
    const neighbors = [];
    for (const e of this.getAdjacentEdges(nodeId)) {
      const neighborId = e.u === nodeId ? e.v : e.u;
      const neighborNode = this.getNode(neighborId);
      if (neighborNode && !neighborNode.isFailed) {
        neighbors.push({ node: neighborNode, edge: e });
      }
    }
    return neighbors;
  }

  resetHighlights() {
    for (const edge of this.edges) {
      edge.isInRecoveryPath = false;
      edge.isInMST = false;
    }
  }

  resetAllFailures() {
    for (const edge of this.edges) {
      edge.isFailed = false;
      edge.isInRecoveryPath = false;
      edge.isInMST = false;
    }
    for (const node of this.nodes.values()) {
      node.isFailed = false;
      node.isEnergized = true;
    }
    this.updateGridState();
  }

  updateGridState() {
    for (const node of this.nodes.values()) {
      node.isEnergized = node.type === 'generator' && !node.isFailed;
    }

    const queue = [];
    const visited = new Set();
    for (const node of this.nodes.values()) {
      if (node.type === 'generator' && !node.isFailed) {
        queue.push(node.id);
        visited.add(node.id);
      }
    }

    while (queue.length > 0) {
      const curr = queue.shift();
      for (const { node } of this.getNeighbors(curr)) {
        if (!visited.has(node.id) && !node.isFailed) {
          visited.add(node.id);
          node.isEnergized = true;
          queue.push(node.id);
        }
      }
    }
  }
}

// ==========================================
// 4. Algorithm Engine (ADA Project Core)
// ==========================================
class AlgorithmEngine {
  constructor(grid) {
    this.grid = grid;
  }

  // --- BFS: Reachability Scan ---
  runBFS(startId) {
    const t0 = performance.now();
    const visited = new Set([startId]);
    const queue = [startId];
    let nodesExplored = 0;

    while (queue.length > 0) {
      const curr = queue.shift();
      nodesExplored++;
      for (const { node } of this.grid.getNeighbors(curr)) {
        if (!visited.has(node.id)) {
          visited.add(node.id);
          queue.push(node.id);
        }
      }
    }

    const elapsed = Math.round((performance.now() - t0) * 1000);
    const unreached = Array.from(this.grid.nodes.values()).filter(n => !visited.has(n.id) && !n.isFailed);

    return {
      name: 'Breadth-First Search (BFS)',
      objective: 'Reachability & Blackout Detection',
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V)',
      timeMicroseconds: elapsed,
      pathCost: '-',
      nodesExplored,
      status: unreached.length === 0 ? 'All Feeders Connected' : `${unreached.length} Islanded Blackout Zones`
    };
  }

  // --- DFS: Tarjan's Bridge Detection ---
  runDFSBridgeDetection() {
    const t0 = performance.now();
    const tin = new Map();
    const low = new Map();
    const visited = new Set();
    const bridges = [];
    let timer = 0;
    let nodesExplored = 0;

    const dfs = (u, p = null) => {
      visited.add(u);
      nodesExplored++;
      tin.set(u, ++timer);
      low.set(u, timer);

      for (const { node: vNode, edge } of this.grid.getNeighbors(u)) {
        const v = vNode.id;
        if (v === p) continue;
        if (visited.has(v)) {
          low.set(u, Math.min(low.get(u), tin.get(v)));
        } else {
          dfs(v, u);
          low.set(u, Math.min(low.get(u), low.get(v)));
          if (low.get(v) > tin.get(u)) {
            bridges.push(edge);
            edge.risk = 'high_risk';
          }
        }
      }
    };

    for (const node of this.grid.nodes.values()) {
      if (!visited.has(node.id) && !node.isFailed) {
        dfs(node.id);
      }
    }

    const elapsed = Math.round((performance.now() - t0) * 1000);
    return {
      name: "Tarjan's DFS Bridge Detection",
      objective: 'Single Point of Failure Detection',
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V)',
      timeMicroseconds: elapsed,
      pathCost: '-',
      nodesExplored,
      status: `${bridges.length} Critical Bridge Lines Found`
    };
  }

  // --- Dijkstra's Shortest Bypass Route ---
  runDijkstra(sourceId, targetId) {
    const t0 = performance.now();
    const distances = new Map();
    const previous = new Map();
    const pq = new MinHeap((a, b) => a.dist - b.dist);
    let nodesExplored = 0;

    for (const node of this.grid.nodes.values()) {
      distances.set(node.id, Infinity);
    }
    distances.set(sourceId, 0);
    pq.push({ id: sourceId, dist: 0 });

    while (!pq.isEmpty()) {
      const { id: u, dist: d } = pq.pop();
      if (d > distances.get(u)) continue;
      nodesExplored++;
      if (u === targetId) break;

      for (const { node: vNode, edge } of this.grid.getNeighbors(u)) {
        const weight = edge.weight * (edge.risk === 'high_risk' ? 1.5 : 1.0);
        if (distances.get(u) + weight < distances.get(vNode.id)) {
          distances.set(vNode.id, distances.get(u) + weight);
          previous.set(vNode.id, { prevNodeId: u, edge });
          pq.push({ id: vNode.id, dist: distances.get(vNode.id) });
        }
      }
    }

    const elapsed = Math.round((performance.now() - t0) * 1000);
    const targetDist = distances.get(targetId);

    if (targetDist === Infinity) {
      return {
        name: "Dijkstra's Algorithm",
        objective: 'Minimum Impedance Bypass Path',
        timeComplexity: 'O((V + E) log V)',
        spaceComplexity: 'O(V)',
        timeMicroseconds: elapsed,
        pathCost: '∞',
        nodesExplored,
        pathEdges: [],
        status: 'Unreachable Blackout'
      };
    }

    const pathEdges = [];
    let curr = targetId;
    while (previous.has(curr)) {
      const { prevNodeId, edge } = previous.get(curr);
      edge.isInRecoveryPath = true;
      pathEdges.push(edge);
      curr = prevNodeId;
    }

    return {
      name: "Dijkstra's Algorithm",
      objective: 'Minimum Impedance Bypass Path',
      timeComplexity: 'O((V + E) log V)',
      spaceComplexity: 'O(V)',
      timeMicroseconds: elapsed,
      pathCost: targetDist.toFixed(1),
      nodesExplored,
      pathEdges,
      status: `Optimal Bypass (${pathEdges.length} hops)`
    };
  }

  // --- Priority Queue Disaster Recovery Engine ---
  runPriorityQueueRecovery() {
    const t0 = performance.now();
    const blackoutNodes = Array.from(this.grid.nodes.values()).filter(
      n => !n.isEnergized && !n.isFailed && n.type !== 'generator'
    );

    if (blackoutNodes.length === 0) {
      return {
        name: 'Priority Queue Emergency Recovery',
        objective: 'Critical Facility Dispatch (Hospitals First)',
        timeComplexity: 'O(K · (V + E) log V)',
        spaceComplexity: 'O(V)',
        timeMicroseconds: 0,
        pathCost: '0',
        nodesExplored: 0,
        status: 'Grid Already 100% Energized'
      };
    }

    // Min-Heap ordered by priority (Tier 1 Hospitals > Tier 2 Water > Tier 3 Residential > Tier 4 Industrial)
    const pq = new MinHeap((a, b) => a.priority - b.priority);
    for (const node of blackoutNodes) pq.push(node);

    const activeGenerators = Array.from(this.grid.nodes.values()).filter(
      n => n.type === 'generator' && !n.isFailed
    );

    let restored = 0;
    let totalCost = 0;
    let totalNodesExplored = 0;

    while (!pq.isEmpty()) {
      const targetNode = pq.pop();
      let bestRes = null;
      let minCost = Infinity;

      for (const gen of activeGenerators) {
        const res = this.runDijkstra(gen.id, targetNode.id);
        totalNodesExplored += res.nodesExplored;
        if (res.status.startsWith('Optimal')) {
          const cost = parseFloat(res.pathCost);
          if (cost < minCost) {
            minCost = cost;
            bestRes = res;
          }
        }
      }

      if (bestRes) {
        restored++;
        totalCost += minCost;
        targetNode.isEnergized = true;
      }
    }

    const elapsed = Math.round((performance.now() - t0) * 1000);
    return {
      name: 'Priority Queue Emergency Recovery',
      objective: 'Critical Facility Dispatch (Hospitals First)',
      timeComplexity: 'O(K · (V + E) log V)',
      spaceComplexity: 'O(V)',
      timeMicroseconds: elapsed,
      pathCost: totalCost.toFixed(1),
      nodesExplored: totalNodesExplored,
      status: `Restored ${restored}/${blackoutNodes.length} Affected Substations`
    };
  }

  // --- Kruskal's MST ---
  runKruskalMST() {
    const t0 = performance.now();
    this.grid.resetHighlights();

    const activeNodes = Array.from(this.grid.nodes.values()).filter(n => !n.isFailed);
    const dsu = new DisjointSet(activeNodes.map(n => n.id));

    const candidateEdges = this.grid.edges.filter(
      e => !e.isFailed && !this.grid.getNode(e.u).isFailed && !this.grid.getNode(e.v).isFailed
    );
    candidateEdges.sort((a, b) => a.weight - b.weight);

    const mstEdges = [];
    let totalCost = 0;

    for (const edge of candidateEdges) {
      if (dsu.union(edge.u, edge.v)) {
        edge.isInMST = true;
        mstEdges.push(edge);
        totalCost += edge.weight;
      }
    }

    const elapsed = Math.round((performance.now() - t0) * 1000);
    return {
      name: "Kruskal's Algorithm (MST)",
      objective: 'Global Minimal Grid Backbone',
      timeComplexity: 'O(E log E)',
      spaceComplexity: 'O(V + E)',
      timeMicroseconds: elapsed,
      pathCost: totalCost.toFixed(1),
      nodesExplored: activeNodes.length,
      status: `MST Reconfigured (${mstEdges.length} lines)`
    };
  }

  // --- Prim's MST ---
  runPrimMST() {
    const t0 = performance.now();
    this.grid.resetHighlights();

    const startNode = Array.from(this.grid.nodes.values()).find(n => n.type === 'generator' && !n.isFailed) || Array.from(this.grid.nodes.values())[0];
    const inMST = new Set([startNode.id]);
    const pq = new MinHeap((a, b) => a.edge.weight - b.edge.weight);
    let totalCost = 0;
    let treeCount = 0;

    for (const { node, edge } of this.grid.getNeighbors(startNode.id)) {
      pq.push({ u: startNode.id, v: node.id, edge });
    }

    while (!pq.isEmpty()) {
      const { v, edge } = pq.pop();
      if (inMST.has(v)) continue;

      inMST.add(v);
      edge.isInMST = true;
      treeCount++;
      totalCost += edge.weight;

      for (const next of this.grid.getNeighbors(v)) {
        if (!inMST.has(next.node.id)) {
          pq.push({ u: v, v: next.node.id, edge: next.edge });
        }
      }
    }

    const elapsed = Math.round((performance.now() - t0) * 1000);
    return {
      name: "Prim's Algorithm (MST)",
      objective: 'Source-Rooted Spanning Tree',
      timeComplexity: 'O(E log V)',
      spaceComplexity: 'O(V)',
      timeMicroseconds: elapsed,
      pathCost: totalCost.toFixed(1),
      nodesExplored: inMST.size,
      status: `Prim Tree Spanned (${treeCount} lines)`
    };
  }
}

// ==========================================
// 5. Preset Topologies (Real Delhi Coordinates)
// ==========================================
function generateCurvedPath(p1, p2, curvature = 0.08) {
  const points = [];
  const steps = 22;

  const lat1 = p1[0], lng1 = p1[1];
  const lat2 = p2[0], lng2 = p2[1];

  const midLat = (lat1 + lat2) / 2;
  const midLng = (lng1 + lng2) / 2;

  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;

  // Normal vector perpendicular to chord
  const nLat = -dLng * curvature;
  const nLng = dLat * curvature;

  const ctrlLat = midLat + nLat;
  const ctrlLng = midLng + nLng;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const invT = 1 - t;
    const lat = invT * invT * lat1 + 2 * invT * t * ctrlLat + t * t * lat2;
    const lng = invT * invT * lng1 + 2 * invT * t * ctrlLng + t * t * lng2;
    points.push([lat, lng]);
  }
  return points;
}

function loadDelhiNCRGrid(grid) {
  grid.clear();

  // Balanced Geographic Coordinates across Delhi NCR (Anti-Crowding)
  const nodes = [
    // Outer Power Generation Sources
    new GridNode({ id: 'PS_BADARPUR', name: 'Badarpur Thermal Station', type: 'generator', priority: 0, lat: 28.4980, lng: 77.3080, capacityMW: 800, demandMW: 0, voltage: '400 kV' }),
    new GridNode({ id: 'PS_INDRAPRASTHA', name: 'Indraprastha Gas Turbine', type: 'generator', priority: 0, lat: 28.6280, lng: 77.2780, capacityMW: 600, demandMW: 0, voltage: '220 kV' }),
    new GridNode({ id: 'PS_PRAGATI', name: 'Pragati Power Station', type: 'generator', priority: 0, lat: 28.5720, lng: 77.2650, capacityMW: 500, demandMW: 0, voltage: '220 kV' }),

    // Critical Tier 1 Emergency Facilities (Well-spaced)
    new GridNode({ id: 'FAC_AIIMS', name: 'AIIMS Hospital Substation', type: 'hospital', priority: 1, lat: 28.5670, lng: 77.2100, capacityMW: 90, demandMW: 75, voltage: '33 kV' }),
    new GridNode({ id: 'FAC_TRAUMA', name: 'Safdarjung Trauma Center', type: 'emergency', priority: 1, lat: 28.5950, lng: 77.1650, capacityMW: 80, demandMW: 65, voltage: '33 kV' }),

    // Critical Tier 2 Essential Utilities
    new GridNode({ id: 'FAC_WATER', name: 'Delhi Jal Board Wazirabad', type: 'transit_water', priority: 2, lat: 28.7050, lng: 77.2580, capacityMW: 120, demandMW: 110, voltage: '66 kV' }),
    new GridNode({ id: 'FAC_METRO', name: 'DMRC Metro Traction Hub', type: 'transit_water', priority: 2, lat: 28.6720, lng: 77.2280, capacityMW: 150, demandMW: 130, voltage: '66 kV' }),

    // Major Regional Substations
    new GridNode({ id: 'SUB_WAZIRABAD', name: 'Wazirabad 400kV Grid Hub', type: 'substation', priority: 3, lat: 28.7280, lng: 77.2080, capacityMW: 400, demandMW: 20, voltage: '400 kV' }),
    new GridNode({ id: 'SUB_SARITA_VIHAR', name: 'Sarita Vihar Substation', type: 'substation', priority: 3, lat: 28.5350, lng: 77.2920, capacityMW: 250, demandMW: 40, voltage: '220 kV' }),

    // Urban & Residential Distribution Centers
    new GridNode({ id: 'RES_CONNAUGHT', name: 'Connaught Place NDMC Grid', type: 'residential', priority: 3, lat: 28.6320, lng: 77.2190, capacityMW: 160, demandMW: 140, voltage: '33 kV' }),
    new GridNode({ id: 'RES_ROHINI', name: 'Rohini Urban Sub-city Hub', type: 'residential', priority: 3, lat: 28.7180, lng: 77.1120, capacityMW: 180, demandMW: 160, voltage: '33 kV' }),

    // Heavy Industrial Zone
    new GridNode({ id: 'IND_OKHLA', name: 'Okhla Industrial Area Phase-III', type: 'industrial', priority: 4, lat: 28.5250, lng: 77.2500, capacityMW: 220, demandMW: 195, voltage: '66 kV' })
  ];

  for (const n of nodes) grid.addNode(n);

  // Clean, Non-Intersecting Transmission Ring & Inflow Feeders
  const edges = [
    // Outer High-Voltage Transmission Ring
    new GridEdge({ id: 'E1', u: 'PS_BADARPUR', v: 'SUB_SARITA_VIHAR', weight: 4.2 }),
    new GridEdge({ id: 'E2', u: 'SUB_SARITA_VIHAR', v: 'IND_OKHLA', weight: 3.8 }),
    new GridEdge({ id: 'E3', u: 'IND_OKHLA', v: 'PS_PRAGATI', weight: 5.1 }),
    new GridEdge({ id: 'E4', u: 'PS_PRAGATI', v: 'PS_INDRAPRASTHA', weight: 6.2 }),
    new GridEdge({ id: 'E5', u: 'PS_INDRAPRASTHA', v: 'FAC_WATER', weight: 7.5 }),
    new GridEdge({ id: 'E6', u: 'FAC_WATER', v: 'SUB_WAZIRABAD', weight: 4.6 }),
    new GridEdge({ id: 'E7', u: 'SUB_WAZIRABAD', v: 'RES_ROHINI', weight: 8.4 }),
    new GridEdge({ id: 'E8', u: 'RES_ROHINI', v: 'FAC_TRAUMA', weight: 11.2 }),
    new GridEdge({ id: 'E9', u: 'FAC_TRAUMA', v: 'FAC_AIIMS', weight: 4.6 }),
    new GridEdge({ id: 'E10', u: 'FAC_AIIMS', v: 'SUB_SARITA_VIHAR', weight: 7.8 }),

    // Central Radial Inflow Lines (Connecting to Demand Hubs)
    new GridEdge({ id: 'E11', u: 'RES_CONNAUGHT', v: 'FAC_AIIMS', weight: 6.8 }),
    new GridEdge({ id: 'E12', u: 'RES_CONNAUGHT', v: 'FAC_METRO', weight: 4.2 }),
    new GridEdge({ id: 'E13', u: 'RES_CONNAUGHT', v: 'PS_INDRAPRASTHA', weight: 5.4 }),
    new GridEdge({ id: 'E14', u: 'RES_CONNAUGHT', v: 'PS_PRAGATI', weight: 6.5 }),
    new GridEdge({ id: 'E15', u: 'SUB_WAZIRABAD', v: 'FAC_METRO', weight: 5.9 }),
    new GridEdge({ id: 'E16', u: 'FAC_METRO', v: 'PS_INDRAPRASTHA', weight: 4.8 }),
    new GridEdge({ id: 'E17', u: 'PS_BADARPUR', v: 'IND_OKHLA', weight: 6.1 }),
    new GridEdge({ id: 'E18', u: 'FAC_AIIMS', v: 'PS_PRAGATI', weight: 5.3 })
  ];

  for (const e of edges) grid.addEdge(e);
  grid.updateGridState();
}

function loadIEEE14Grid(grid) {
  grid.clear();
  const baseLat = 28.6139;
  const baseLng = 77.2090;

  const offsets = [
    [-0.08, -0.06], [-0.05, 0.02], [-0.02, 0.08], [0.01, 0.02], [0.03, -0.04],
    [0.06, 0.06], [0.04, 0.01], [0.08, 0.03], [0.02, -0.01], [0.05, -0.06],
    [0.08, -0.02], [-0.04, -0.08], [-0.01, -0.05], [0.07, 0.09]
  ];

  for (let i = 1; i <= 14; i++) {
    const id = `BUS_${i}`;
    const type = i <= 2 ? 'generator' : i === 4 ? 'hospital' : i === 5 ? 'emergency' : 'substation';
    const priority = type === 'generator' ? 0 : type === 'hospital' || type === 'emergency' ? 1 : 3;
    grid.addNode(new GridNode({
      id,
      name: `Bus #${i} ${type === 'hospital' ? '(AIIMS Hub)' : ''}`,
      type,
      priority,
      lat: baseLat + offsets[i - 1][0],
      lng: baseLng + offsets[i - 1][1],
      capacityMW: 250,
      demandMW: 60
    }));
  }

  const lines = [
    [1, 2, 3.5], [1, 5, 5.2], [2, 3, 4.8], [2, 4, 4.1], [2, 5, 4.6],
    [3, 4, 3.9], [4, 5, 3.2], [4, 7, 4.5], [4, 9, 5.7], [5, 6, 7.2],
    [6, 11, 5.9], [6, 12, 8.1], [6, 13, 6.4], [7, 8, 3.1], [7, 9, 4.0],
    [9, 10, 3.6], [9, 14, 6.8], [10, 11, 3.4], [12, 13, 4.3], [13, 14, 4.7]
  ];

  for (let idx = 0; idx < lines.length; idx++) {
    const [u, v, w] = lines[idx];
    grid.addEdge(new GridEdge({ id: `L_${u}_${v}`, u: `BUS_${u}`, v: `BUS_${v}`, weight: w }));
  }
  grid.updateGridState();
}

// ==========================================
// 6. Main Modern Map Application Controller
// ==========================================
class ModernMapApp {
  constructor() {
    this.grid = new PowerGrid();
    this.algoEngine = new AlgorithmEngine(this.grid);
    this.map = null;
    this.markersLayer = null;
    this.linesLayer = null;
    this.selectedEdge = null;
    this.activeFilter = 'active'; // 'active' or 'faults'
    this.benchmarkResults = [];

    this.initMap();
    this.initDOM();
    this.loadPreset('delhi_ncr');
  }

  initMap() {
    // Center Delhi NCR: [28.6139, 77.2090]
    this.map = L.map('leafletMap', {
      zoomControl: true,
      attributionControl: false
    }).setView([28.6139, 77.2090], 12);

    // CartoDB Voyager Raster Tiles (supports optional custom key, with fallback to public Voyager tiles)
    const apiKey = window.CARTO_API_KEY || 'cb1_5b15_1_b1e39d5cbbe10db8f644e8c9';
    const tileUrl = apiKey
      ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${apiKey}`
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>'
    }).addTo(this.map);

    this.linesLayer = L.layerGroup().addTo(this.map);
    this.markersLayer = L.layerGroup().addTo(this.map);
  }

  loadPreset(key) {
    if (key === 'delhi_ncr') loadDelhiNCRGrid(this.grid);
    else if (key === 'ieee_14') loadIEEE14Grid(this.grid);

    // Select prominent default route for bottom and left cards
    this.selectedEdge = this.grid.getEdge('E4') || this.grid.edges[0];

    this.renderMapEntities();
    this.renderSubstationCards();
    this.updateBottomCard();
  }

  renderMapEntities() {
    this.markersLayer.clearLayers();
    this.linesLayer.clearLayers();

    const bounds = [];
    const polylines = [];

    // 1. Draw Transmission Lines with Curved Paths
    for (let i = 0; i < this.grid.edges.length; i++) {
      const edge = this.grid.edges[i];
      const uNode = this.grid.getNode(edge.u);
      const vNode = this.grid.getNode(edge.v);
      if (!uNode || !vNode) continue;

      // Assign subtle alternating curvature so parallel/crossing routes gently curve apart
      const curvature = (i % 2 === 0 ? 0.08 : -0.08);
      const curvedPoints = generateCurvedPath([uNode.lat, uNode.lng], [vNode.lat, vNode.lng], curvature);

      let color = '#334155'; // Subtle architectural slate for normal lines
      let dashArray = null;
      let weight = 2.0;
      let opacity = 0.45;

      if (edge.isFailed) {
        color = '#ef4444';
        dashArray = '6, 6';
        weight = 3.5;
        opacity = 1.0;
      } else if (edge.isInRecoveryPath) {
        color = '#18181b';
        dashArray = '5, 8'; // Dotted route like reference screenshot
        weight = 4.5;
        opacity = 1.0;
      } else if (edge.isInMST) {
        color = '#10b981'; // Emerald
        weight = 3.5;
        opacity = 0.95;
      } else if (edge.risk === 'high_risk') {
        color = '#f59e0b';
        weight = 3.0;
        opacity = 0.8;
      }

      const polyline = L.polyline(curvedPoints, {
        color,
        dashArray,
        weight,
        opacity,
        lineCap: 'round',
        lineJoin: 'round'
      });

      polyline.on('click', () => {
        this.selectedEdge = edge;
        this.renderSubstationCards();
        this.updateBottomCard();
      });

      polyline.bindTooltip(`Feeder #${edge.id}: ${uNode.name.split(' ')[0]} ➔ ${vNode.name.split(' ')[0]} (${edge.weight} Ω-km)`, {
        direction: 'top',
        className: 'custom-tooltip'
      });

      this.linesLayer.addLayer(polyline);
      edge.polylineRef = polyline;
      polylines.push({ edge, polyline, defaultStyle: { color, weight, opacity } });
    }

    // 2. Draw Substation Markers
    for (const node of this.grid.nodes.values()) {
      bounds.push([node.lat, node.lng]);

      const isGenerator = node.type === 'generator';
      const isCritical = node.priority === 1;
      const isFailed = node.isFailed;

      const bulletClass = isFailed ? 'failed' : isCritical ? 'tier-1' : isGenerator ? 'tier-0' : '';
      const iconSymbol = isFailed ? '✕' : isCritical ? '🏥' : isGenerator ? '⚡' : '•';

      const customHtml = `
        <div class="custom-station-pin">
          <div class="pin-bullet ${bulletClass}">
            <span>${iconSymbol}</span>
          </div>
          <span class="pin-label-text">${node.name.split(' ')[0]}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: customHtml,
        iconSize: [120, 24],
        iconAnchor: [8, 12]
      });

      const marker = L.marker([node.lat, node.lng], { icon: customIcon });

      // Interactive Hover: Highlights incident transmission lines & dims others
      marker.on('mouseover', () => {
        for (const item of polylines) {
          if (item.edge.u === node.id || item.edge.v === node.id) {
            item.polyline.setStyle({ weight: 4.5, opacity: 1.0, color: '#18181b' });
          } else {
            item.polyline.setStyle({ opacity: 0.12 });
          }
        }
      });

      marker.on('mouseout', () => {
        for (const item of polylines) {
          item.polyline.setStyle(item.defaultStyle);
        }
      });

      marker.on('click', () => {
        const adj = this.grid.getAdjacentEdges(node.id);
        if (adj.length > 0) {
          this.selectedEdge = adj[0];
          this.renderSubstationCards();
          this.updateBottomCard();
        }
      });

      marker.bindPopup(`
        <div style="font-family: var(--font-sans); padding: 4px;">
          <h4 style="font-size: 13px; font-weight: 700; margin-bottom: 4px;">${node.name}</h4>
          <p style="font-size: 11px; color: #64748b; margin-bottom: 2px;">Type: <strong>${node.type.toUpperCase()}</strong> | Priority: Tier ${node.priority}</p>
          <p style="font-size: 11px; color: #64748b; margin-bottom: 6px;">Voltage: ${node.voltage} | Demand: ${node.demandMW} MW</p>
          <p style="font-size: 11px; font-weight: 700; color: ${node.isFailed ? '#ef4444' : node.isEnergized ? '#10b981' : '#f59e0b'};">
            ${node.isFailed ? '💥 OUTAGE / TRIPPED' : node.isEnergized ? '🟢 ONLINE & ENERGIZED' : '⚠️ BLACKOUT (ISLANDED)'}
          </p>
        </div>
      `);

      this.markersLayer.addLayer(marker);
      node.markerRef = marker;
    }

    if (bounds.length > 0) {
      this.map.fitBounds(bounds, { padding: [70, 70] });
    }
  }

  // Render Left Cards (Matches reference UI)
  renderSubstationCards() {
    const container = document.getElementById('substationCardsList');
    container.innerHTML = '';

    // Filter edges
    let displayEdges = this.grid.edges;
    if (this.activeFilter === 'faults') {
      displayEdges = this.grid.edges.filter(e => e.isFailed);
    }

    if (displayEdges.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #9ca3af; font-size: 0.8rem;">
          No tripped transmission lines or blackout zones currently recorded. All lines nominal!
        </div>
      `;
      return;
    }

    for (const edge of displayEdges) {
      const uNode = this.grid.getNode(edge.u);
      const vNode = this.grid.getNode(edge.v);
      const isSelected = this.selectedEdge && this.selectedEdge.id === edge.id;

      if (isSelected) {
        // PROMINENT EXPANDED CARD (Exact match to Norra Nynäshamn -> Stockholm in reference screenshot)
        const card = document.createElement('div');
        card.className = 'route-item-card expanded';

        const statusBadge = edge.isFailed 
          ? `<span class="status-badge badge-tripped">TRIPPED / CUT</span>`
          : edge.isInRecoveryPath 
          ? `<span class="status-badge badge-in-transit">IN TRANSIT</span>`
          : `<span class="status-badge badge-in-transit">ONLINE</span>`;

        card.innerHTML = `
          <div class="route-card-header">
            <div>
              <div class="route-title">${uNode.name.split(' ')[0]} ➔ ${vNode.name.split(' ')[0]}</div>
              <div class="route-subtitle">Feeder Line #${edge.id} | ${uNode.voltage}</div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-start; margin-top: 10px;">
            ${statusBadge}
          </div>

          <!-- Neon Lime Progress Bar -->
          <div class="transit-progress-wrapper">
            <div class="transit-progress-bar">
              <div class="transit-progress-fill" style="width: ${edge.isFailed ? '15%' : '75%'}; background: ${edge.isFailed ? '#ef4444' : '#65a30d'};"></div>
            </div>
          </div>

          <!-- 4-Metric Grid -->
          <div class="card-stats-grid">
            <div class="stat-metric-cell">
              <span class="cell-label">Sender</span>
              <span class="cell-val">${uNode.name.split(' ')[0]}</span>
            </div>
            <div class="stat-metric-cell">
              <span class="cell-label">Departure</span>
              <span class="cell-val">03:27 PM</span>
            </div>
            <div class="stat-metric-cell">
              <span class="cell-label">Distance</span>
              <span class="cell-val">${edge.weight} km</span>
            </div>
            <div class="stat-metric-cell">
              <span class="cell-label">Weight</span>
              <span class="cell-val">${edge.currentLoadMW} MW</span>
            </div>
          </div>

          <!-- Dispatcher Row -->
          <div class="operator-row">
            <div class="operator-info">
              <div class="operator-avatar">👷</div>
              <div class="operator-name-box">
                <div class="op-label">Grid Dispatcher</div>
                <div class="op-name">SCADA Central Unit</div>
              </div>
            </div>
            <div class="operator-actions">
              <button class="op-btn" id="btnToggleSelectedCut" title="Toggle Line Break">💥</button>
              <button class="op-btn" id="btnInspectSelectedDijkstra" title="Run Dijkstra Route">⚡</button>
            </div>
          </div>

          <div class="card-collapse-trigger">
            <span>Transmission telemetry and path details</span>
            <span>▾</span>
          </div>
        `;

        card.querySelector('#btnToggleSelectedCut').addEventListener('click', (e) => {
          e.stopPropagation();
          edge.isFailed = !edge.isFailed;
          this.grid.updateGridState();
          this.renderMapEntities();
          this.renderSubstationCards();
          this.updateBottomCard();
        });

        card.querySelector('#btnInspectSelectedDijkstra').addEventListener('click', (e) => {
          e.stopPropagation();
          this.runDijkstraForSelected();
        });

        container.appendChild(card);
      } else {
        // COMPACT CARDS (Matching Florence -> Stockholm, Dresden -> Stockholm in screenshot)
        const card = document.createElement('div');
        card.className = 'route-item-card';

        let badgeHtml = `<span class="status-badge badge-in-transit">IN TRANSIT</span>`;
        if (edge.isFailed) badgeHtml = `<span class="status-badge badge-tripped">TRIPPED</span>`;
        else if (edge.weight > 6.0) badgeHtml = `<span class="status-badge badge-packed">HIGH LOAD</span>`;

        card.innerHTML = `
          <div class="route-card-header">
            <div>
              <div class="route-title">${uNode.name.split(' ')[0]} ➔ ${vNode.name.split(' ')[0]}</div>
              <div class="route-subtitle">Line #${edge.id} · Imp: ${edge.weight} Ω-km</div>
            </div>
            ${badgeHtml}
          </div>
        `;

        card.addEventListener('click', () => {
          this.selectedEdge = edge;
          this.renderSubstationCards();
          this.updateBottomCard();
        });

        container.appendChild(card);
      }
    }
  }

  // Update Floating Bottom Card (Exact match to Order ID #29698-98971)
  updateBottomCard() {
    if (!this.selectedEdge) return;

    const uNode = this.grid.getNode(this.selectedEdge.u);
    const vNode = this.grid.getNode(this.selectedEdge.v);

    document.getElementById('bottomRouteId').textContent = `Route ID #TR-${this.selectedEdge.id}-98971`;

    const badge = document.getElementById('bottomRouteBadge');
    if (this.selectedEdge.isFailed) {
      badge.textContent = 'TRIPPED / FAULT';
      badge.style.color = '#ef4444';
    } else if (this.selectedEdge.isInRecoveryPath) {
      badge.textContent = 'BYPASS ENERGIZED';
      badge.style.color = '#a3e635';
    } else {
      badge.textContent = 'IN TRANSIT';
      badge.style.color = '#a3e635';
    }

    document.getElementById('metaFromStation').textContent = uNode ? uNode.name.split(' ')[0] : 'Origin';
    document.getElementById('metaToStation').textContent = vNode ? vNode.name.split(' ')[0] : 'Target';
    document.getElementById('metaBypassRoute').textContent = `${uNode.name.split(' ')[0]} ➔ ${vNode.name.split(' ')[0]}`;
    document.getElementById('metaImpedance').textContent = `${this.selectedEdge.weight} Ω-km`;

    const failedCount = this.grid.edges.filter(e => e.isFailed).length;
    const healthVal = document.getElementById('metaGridHealth');
    if (failedCount === 0) {
      healthVal.textContent = '100% Online';
      healthVal.style.color = '#10b981';
    } else {
      healthVal.textContent = `${Math.round(((this.grid.edges.length - failedCount)/this.grid.edges.length)*100)}% Degraded`;
      healthVal.style.color = '#ef4444';
    }
  }

  runDijkstraForSelected() {
    if (!this.selectedEdge) return;
    this.grid.resetHighlights();

    const gens = Array.from(this.grid.nodes.values()).filter(n => n.type === 'generator' && !n.isFailed);
    const src = gens.length > 0 ? gens[0].id : this.selectedEdge.u;
    const target = this.selectedEdge.v;

    const res = this.algoEngine.runDijkstra(src, target);
    this.benchmarkResults.push(res);
    this.renderMapEntities();
    this.renderSubstationCards();
    this.updateBottomCard();
  }

  initDOM() {
    // Preset dropdown
    document.getElementById('selectTopologyPreset').addEventListener('change', (e) => {
      this.loadPreset(e.target.value);
    });

    // Segmented tab switchers
    const tabActive = document.getElementById('tabFeedersActive');
    const tabFaults = document.getElementById('tabFeedersFaults');

    tabActive.addEventListener('click', () => {
      tabActive.classList.add('active');
      tabFaults.classList.remove('active');
      this.activeFilter = 'active';
      this.renderSubstationCards();
    });

    tabFaults.addEventListener('click', () => {
      tabFaults.classList.add('active');
      tabActive.classList.remove('active');
      this.activeFilter = 'faults';
      this.renderSubstationCards();
    });

    // Top action buttons
    document.getElementById('btnRecenterMap').addEventListener('click', () => {
      const bounds = Array.from(this.grid.nodes.values()).map(n => [n.lat, n.lng]);
      if (bounds.length > 0) this.map.fitBounds(bounds, { padding: [80, 80] });
    });

    document.getElementById('btnTripLine').addEventListener('click', () => {
      const activeEdges = this.grid.edges.filter(e => !e.isFailed);
      if (activeEdges.length > 0) {
        const pick = activeEdges[Math.floor(Math.random() * activeEdges.length)];
        pick.isFailed = true;
        this.selectedEdge = pick;
        this.grid.updateGridState();
        this.renderMapEntities();
        this.renderSubstationCards();
        this.updateBottomCard();
      }
    });

    document.getElementById('btnFailSubstation').addEventListener('click', () => {
      const activeNodes = Array.from(this.grid.nodes.values()).filter(n => !n.isFailed && n.type !== 'generator');
      if (activeNodes.length > 0) {
        const pick = activeNodes[Math.floor(Math.random() * activeNodes.length)];
        pick.isFailed = true;
        this.grid.updateGridState();
        this.renderMapEntities();
        this.renderSubstationCards();
        this.updateBottomCard();
      }
    });

    document.getElementById('btnPriorityRecovery').addEventListener('click', () => {
      this.grid.resetHighlights();
      const res = this.algoEngine.runPriorityQueueRecovery();
      this.benchmarkResults.push(res);
      this.renderMapEntities();
      this.renderSubstationCards();
      this.updateBottomCard();
    });

    document.getElementById('btnBottomAction').addEventListener('click', () => {
      this.grid.resetHighlights();
      const res = this.algoEngine.runPriorityQueueRecovery();
      this.benchmarkResults.push(res);
      this.renderMapEntities();
      this.renderSubstationCards();
      this.updateBottomCard();
    });

    // Sidebar navigation
    document.getElementById('btnNavMap').addEventListener('click', () => {
      this.map.setZoom(12);
    });

    document.getElementById('btnNavRoutes').addEventListener('click', () => {
      this.runDijkstraForSelected();
    });

    document.getElementById('btnNavFaults').addEventListener('click', () => {
      document.getElementById('btnTripLine').click();
    });

    document.getElementById('btnNavMST').addEventListener('click', () => {
      this.grid.resetHighlights();
      const res = this.algoEngine.runKruskalMST();
      this.benchmarkResults.push(res);
      this.renderMapEntities();
      this.renderSubstationCards();
      this.updateBottomCard();
    });

    document.getElementById('btnNavBenchmark').addEventListener('click', () => {
      const drawer = document.getElementById('benchmarkDrawer');
      drawer.classList.toggle('expanded');
    });

    document.getElementById('btnNavReset').addEventListener('click', () => {
      this.grid.resetAllFailures();
      this.renderMapEntities();
      this.renderSubstationCards();
      this.updateBottomCard();
    });

    document.getElementById('btnToggleDrawer').addEventListener('click', () => {
      const drawer = document.getElementById('benchmarkDrawer');
      drawer.classList.toggle('expanded');
      document.getElementById('btnToggleDrawer').textContent = drawer.classList.contains('expanded') ? '▼ Collapse' : '▲ Expand';
    });

    document.getElementById('btnRunBenchmarkAll').addEventListener('click', () => {
      this.runAllBenchmarks();
    });

    // Academic Report Modal
    document.getElementById('btnNavReport').addEventListener('click', () => {
      this.showReportModal();
    });

    document.getElementById('btnCloseModal').addEventListener('click', () => {
      document.getElementById('reportModalOverlay').classList.remove('active');
    });

    document.getElementById('btnDismissModal').addEventListener('click', () => {
      document.getElementById('reportModalOverlay').classList.remove('active');
    });

    document.getElementById('btnPrintReport').addEventListener('click', () => {
      window.print();
    });
  }

  runAllBenchmarks() {
    const drawer = document.getElementById('benchmarkDrawer');
    drawer.classList.add('expanded');
    document.getElementById('btnToggleDrawer').textContent = '▼ Collapse';

    const gens = Array.from(this.grid.nodes.values()).filter(n => n.type === 'generator');
    const startId = gens.length > 0 ? gens[0].id : Array.from(this.grid.nodes.keys())[0];
    const targetNode = Array.from(this.grid.nodes.values()).find(n => n.priority === 1) || Array.from(this.grid.nodes.values())[3];

    const results = [
      this.algoEngine.runBFS(startId),
      this.algoEngine.runDFSBridgeDetection(),
      this.algoEngine.runDijkstra(startId, targetNode.id),
      this.algoEngine.runPrimMST(),
      this.algoEngine.runKruskalMST(),
      this.algoEngine.runPriorityQueueRecovery()
    ];

    const tbody = document.getElementById('benchmarkTableBody');
    tbody.innerHTML = '';
    this.benchmarkResults = [];

    for (const res of results) {
      this.benchmarkResults.push(res);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 700; color: #18181b;">${res.name}</td>
        <td style="color: #64748b;">${res.objective}</td>
        <td><code style="background:#f1f5f9; padding:2px 6px; border-radius:4px;">${res.timeComplexity}</code></td>
        <td><code style="background:#f1f5f9; padding:2px 6px; border-radius:4px;">${res.spaceComplexity}</code></td>
        <td style="font-weight: 700; color: #16a34a;">${res.timeMicroseconds} μs</td>
        <td style="font-weight: 700;">${res.pathCost}</td>
        <td>${res.nodesExplored}</td>
        <td style="color: #2563eb; font-weight: 600;">${res.status}</td>
      `;
      tbody.appendChild(tr);
    }
  }

  showReportModal() {
    const modal = document.getElementById('reportModalOverlay');
    const content = document.getElementById('modalReportContent');

    const totalNodes = this.grid.nodes.size;
    const failedNodes = Array.from(this.grid.nodes.values()).filter(n => n.isFailed);
    const failedEdges = this.grid.edges.filter(e => e.isFailed);
    const criticalNodes = Array.from(this.grid.nodes.values()).filter(n => n.priority === 1 || n.priority === 2);
    const restoredCrit = criticalNodes.filter(n => n.isEnergized).length;

    let rowsHtml = '';
    for (const b of this.benchmarkResults) {
      rowsHtml += `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><strong>${b.name}</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${b.timeComplexity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #16a34a; font-weight:bold;">${b.timeMicroseconds} μs</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${b.pathCost}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${b.nodesExplored}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${b.status}</td>
        </tr>
      `;
    }

    content.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 16px;">
        <h3 style="font-size: 1.15rem; color: #111827; text-transform: uppercase; font-weight: 800;">The Power Grid Failure Recovery Simulator</h3>
        <p style="color: #2563eb; font-size: 0.88rem; font-weight: 600;">Faculty of Technology (University of Delhi) | 2026-2027</p>
        <p style="font-size: 0.8rem; color: #6b7280;">Algorithm Design & Analysis (ADA) | Supervisor: Dr. Juhi Jain</p>
        <p style="font-size: 0.78rem; color: #374151; margin-top: 6px;">
          Submitted by: <strong>Aashutosh Singh Parihar</strong> (25293916003) & <strong>C. Sai Vishwak Raju</strong> (25293916027) | Batch CSE B2
        </p>
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="color: #111827; font-weight: 700; margin-bottom: 8px;">1. System Health & Incident Log</h4>
        <ul style="padding-left: 20px; font-size: 0.82rem; line-height: 1.7; color: #4b5563;">
          <li>Total Grid Stations: <strong>${totalNodes}</strong> | Active Transmission Lines: <strong>${this.grid.edges.length - failedEdges.length} / ${this.grid.edges.length}</strong></li>
          <li>Tripped Substations: <strong>${failedNodes.length}</strong> (${failedNodes.map(n => n.name).join(', ') || 'None'})</li>
          <li>Severed Transmission Edges: <strong>${failedEdges.length}</strong> (${failedEdges.map(e => e.id).join(', ') || 'None'})</li>
          <li>Critical Facilities Online: <strong>${restoredCrit}/${criticalNodes.length} (${criticalNodes.length > 0 ? Math.round((restoredCrit/criticalNodes.length)*100) : 100}%)</strong></li>
        </ul>
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="color: #111827; font-weight: 700; margin-bottom: 8px;">2. Algorithmic Complexity & Benchmark Outcomes</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.76rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <thead style="background: #edf2f7; color: #4a5568;">
            <tr>
              <th style="padding: 8px;">Algorithm</th>
              <th style="padding: 8px;">Complexity</th>
              <th style="padding: 8px;">Exec Time</th>
              <th style="padding: 8px;">Path/Tree Cost</th>
              <th style="padding: 8px;">Explored</th>
              <th style="padding: 8px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="6" style="padding: 12px; text-align: center; color: #94a3b8;">Click "Run All Benchmarks" to populate live execution metrics.</td></tr>'}
          </tbody>
        </table>
      </div>

      <div>
        <h4 style="color: #111827; font-weight: 700; margin-bottom: 8px;">3. Academic Conclusion</h4>
        <p style="font-size: 0.8rem; line-height: 1.6; color: #4b5563;">
          By utilizing a <strong>Min-Heap Priority Queue</strong> paired with <strong>Dijkstra's Shortest Path Algorithm</strong>, critical infrastructure (Tier 1 AIIMS Hospital and Trauma Centers) is restored within sub-millisecond execution times. <strong>Tarjan's DFS</strong> isolates single-point-of-failure bridge lines, preventing cascading collapse, while <strong>Kruskal's Algorithm</strong> reconfigures the minimal transmission backbone.
        </p>
      </div>
    `;

    modal.classList.add('active');
  }
}

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.app = new ModernMapApp();
});
