#!/usr/bin/env python3
"""
=========================================================================================
ALGORITHM DESIGN AND ANALYSIS (ADA) PROJECT
Faculty of Technology, University of Delhi (2026-2027)

Project: The Power Grid Failure Recovery Simulator
Submitted by:
  - Aashutosh Singh Parihar (Roll No: 25293916003)
  - C. Sai Vishwak Raju     (Roll No: 25293916027)
Batch: CSE B2 (3rd Semester)
Submitted to: Dr. Juhi Jain
=========================================================================================
"""

import heapq
import time
from typing import List, Dict, Tuple, Set, Optional

class PriorityTier:
    GENERATOR = 0
    TIER_1_HOSPITAL = 1       # Hospitals & Emergency Centers
    TIER_2_WATER_TRANSIT = 2  # Water Treatment & Metro Traction
    TIER_3_RESIDENTIAL = 3    # Domestic Residential & Commercial
    TIER_4_INDUSTRIAL = 4     # Heavy Industrial Manufacturing

    @staticmethod
    def get_name(tier: int) -> str:
        names = {
            0: "Generator Source (Tier 0)",
            1: "Critical: Hospital/Trauma (Tier 1)",
            2: "Essential: Water/Transit (Tier 2)",
            3: "Standard: Residential (Tier 3)",
            4: "Deferred: Industrial (Tier 4)"
        }
        return names.get(tier, f"Tier {tier}")


class Node:
    def __init__(self, node_id: int, name: str, priority: int, demand_mw: float = 50.0, capacity_mw: float = 200.0):
        self.id = node_id
        self.name = name
        self.priority = priority
        self.demand_mw = demand_mw
        self.capacity_mw = capacity_mw
        self.is_failed = False
        self.is_energized = (priority == PriorityTier.GENERATOR)

    def __lt__(self, other):
        # Comparison used by min-heap: higher priority tier (lower number) comes first
        if self.priority != other.priority:
            return self.priority < other.priority
        return self.demand_mw > other.demand_mw


class Edge:
    def __init__(self, edge_id: int, u: int, v: int, weight: float, capacity_mw: float = 300.0):
        self.id = edge_id
        self.u = u
        self.v = v
        self.weight = weight
        self.capacity_mw = capacity_mw
        self.is_failed = False


class DisjointSetUnion:
    """Disjoint Set Union (DSU / Union-Find) with Path Compression and Union by Rank."""
    def __init__(self, n: int):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, i: int) -> int:
        if self.parent[i] != i:
            self.parent[i] = self.find(self.parent[i])  # Path compression
        return self.parent[i]

    def union(self, i: int, j: int) -> bool:
        root_i = self.find(i)
        root_j = self.find(j)
        if root_i == root_j:
            return False

        # Union by rank
        if self.rank[root_i] < self.rank[root_j]:
            self.parent[root_i] = root_j
        elif self.rank[root_i] > self.rank[root_j]:
            self.parent[root_j] = root_i
        else:
            self.parent[root_j] = root_i
            self.rank[root_i] += 1
        return True


class PowerGridSimulator:
    def __init__(self, num_nodes: int):
        self.num_nodes = num_nodes
        self.nodes: List[Node] = [None] * num_nodes
        self.edges: List[Edge] = []
        self.adj: List[List[Tuple[int, int]]] = [[] for _ in range(num_nodes)]  # adj[u] = [(v, edge_id)]

    def add_node(self, node_id: int, name: str, priority: int, demand_mw: float = 50.0, capacity_mw: float = 200.0):
        self.nodes[node_id] = Node(node_id, name, priority, demand_mw, capacity_mw)

    def add_transmission_line(self, u: int, v: int, weight: float, capacity_mw: float = 300.0):
        edge_id = len(self.edges)
        edge = Edge(edge_id, u, v, weight, capacity_mw)
        self.edges.append(edge)
        self.adj[u].append((v, edge_id))
        self.adj[v].append((u, edge_id))

    def fail_line(self, edge_id: int):
        if 0 <= edge_id < len(self.edges):
            self.edges[edge_id].is_failed = True
            e = self.edges[edge_id]
            print(f" [!] Line {edge_id} ({self.nodes[e.u].name} <-> {self.nodes[e.v].name}) TRIPPED.")
            self.update_grid_energization()

    def fail_substation(self, node_id: int):
        if 0 <= node_id < self.num_nodes:
            self.nodes[node_id].is_failed = True
            print(f" [!] Substation {self.nodes[node_id].name} (Node {node_id}) BLACKOUT / EXPLODED.")
            self.update_grid_energization()

    def reset_grid(self):
        for e in self.edges:
            e.is_failed = False
        for n in self.nodes:
            n.is_failed = False
        self.update_grid_energization()
        print(" [*] Grid restored to 100% operational nominal status.")

    def update_grid_energization(self):
        for n in self.nodes:
            n.is_energized = (n.priority == PriorityTier.GENERATOR and not n.is_failed)

        queue = [n.id for n in self.nodes if n.priority == PriorityTier.GENERATOR and not n.is_failed]
        visited = set(queue)

        while queue:
            curr = queue.pop(0)
            for neighbor_id, edge_id in self.adj[curr]:
                if not self.edges[edge_id].is_failed and not self.nodes[neighbor_id].is_failed:
                    if neighbor_id not in visited:
                        visited.add(neighbor_id)
                        self.nodes[neighbor_id].is_energized = True
                        queue.append(neighbor_id)

    # ==========================================
    # ALGORITHM 1: Breadth-First Search (BFS)
    # Time: O(V + E) | Space: O(V)
    # ==========================================
    def run_bfs(self, start_id: int) -> Dict:
        t0 = time.perf_counter()
        visited = {start_id}
        distance_hops = {start_id: 0}
        queue = [start_id]
        nodes_explored = 0
        edges_traversed = 0

        while queue:
            u = queue.pop(0)
            nodes_explored += 1
            curr_hop = distance_hops[u]

            for v, edge_id in self.adj[u]:
                if not self.edges[edge_id].is_failed and not self.nodes[v].is_failed:
                    edges_traversed += 1
                    if v not in visited:
                        visited.add(v)
                        distance_hops[v] = curr_hop + 1
                        queue.append(v)

        elapsed_us = round((time.perf_counter() - t0) * 1_000_000)
        unreachable = [n.id for n in self.nodes if n.id not in visited and not n.is_failed]

        return {
            "name": "BFS Reachability Scan",
            "time_us": elapsed_us,
            "complexity": "O(V + E)",
            "space": "O(V)",
            "nodes_explored": nodes_explored,
            "edges_traversed": edges_traversed // 2,
            "reachable_count": len(visited),
            "unreachable_count": len(unreachable),
            "hops": distance_hops
        }

    # ==========================================
    # ALGORITHM 2: DFS Tarjan's Bridge Detection
    # Time: O(V + E) | Space: O(V)
    # ==========================================
    def run_dfs_bridges(self) -> Dict:
        t0 = time.perf_counter()
        tin = [-1] * self.num_nodes
        low = [-1] * self.num_nodes
        visited = [False] * self.num_nodes
        bridges = []
        timer = 0
        nodes_explored = 0
        edges_traversed = 0

        def dfs(u: int, p: int = -1):
            nonlocal timer, nodes_explored, edges_traversed
            visited[u] = True
            nodes_explored += 1
            timer += 1
            tin[u] = low[u] = timer

            for v, edge_id in self.adj[u]:
                if self.edges[edge_id].is_failed or self.nodes[v].is_failed:
                    continue
                if v == p:
                    continue
                edges_traversed += 1

                if visited[v]:
                    low[u] = min(low[u], tin[v])
                else:
                    dfs(v, u)
                    low[u] = min(low[u], low[v])
                    if low[v] > tin[u]:
                        bridges.append((u, v, edge_id))

        for i in range(self.num_nodes):
            if not visited[i] and not self.nodes[i].is_failed:
                dfs(i)

        elapsed_us = round((time.perf_counter() - t0) * 1_000_000)
        return {
            "name": "DFS Tarjan Bridge Detection",
            "time_us": elapsed_us,
            "complexity": "O(V + E)",
            "space": "O(V)",
            "nodes_explored": nodes_explored,
            "edges_traversed": edges_traversed // 2,
            "bridges": bridges
        }

    # ==========================================
    # ALGORITHM 3: Dijkstra's Algorithm
    # Time: O((V + E) log V) | Space: O(V)
    # ==========================================
    def run_dijkstra(self, source_id: int, target_id: int) -> Tuple[float, List[int], Dict]:
        t0 = time.perf_counter()
        dist = [float('inf')] * self.num_nodes
        parent = [-1] * self.num_nodes
        dist[source_id] = 0.0

        pq = [(0.0, source_id)]
        nodes_visited = 0
        edges_checked = 0

        while pq:
            d, u = heapq.heappop(pq)
            if d > dist[u]:
                continue
            nodes_visited += 1
            if u == target_id:
                break

            for v, edge_id in self.adj[u]:
                if self.edges[edge_id].is_failed or self.nodes[v].is_failed:
                    continue
                edges_checked += 1
                w = self.edges[edge_id].weight

                if dist[u] + w < dist[v]:
                    dist[v] = dist[u] + w
                    parent[v] = u
                    heapq.heappush(pq, (dist[v], v))

        elapsed_us = round((time.perf_counter() - t0) * 1_000_000)

        path = []
        if dist[target_id] < float('inf'):
            curr = target_id
            while curr != -1:
                path.append(curr)
                curr = parent[curr]
            path.reverse()

        stats = {
            "name": "Dijkstra's Shortest Bypass",
            "time_us": elapsed_us,
            "complexity": "O((V + E) log V)",
            "space": "O(V)",
            "nodes_explored": nodes_visited,
            "edges_traversed": edges_checked,
            "cost": dist[target_id]
        }
        return dist[target_id], path, stats

    # ==========================================
    # ALGORITHM 4: Priority Queue Recovery
    # Time: O(K * (V + E) log V)
    # ==========================================
    def run_priority_queue_recovery(self) -> Dict:
        t0 = time.perf_counter()
        blackout_nodes = [
            n for n in self.nodes 
            if not n.is_energized and not n.is_failed and n.priority != PriorityTier.GENERATOR
        ]

        if not blackout_nodes:
            return {"name": "Priority Queue Recovery", "status": "Grid Already Fully Energized", "time_us": 0}

        # Min-heap ordered by (priority_tier, -demand_mw)
        pq = []
        for n in blackout_nodes:
            heapq.heappush(pq, (n.priority, -n.demand_mw, n.id))

        active_gens = [n.id for n in self.nodes if n.priority == PriorityTier.GENERATOR and not n.is_failed]
        restored = 0
        total_cost = 0.0
        total_nodes_exp = 0

        while pq:
            tier, neg_demand, target_id = heapq.heappop(pq)
            best_cost = float('inf')
            best_path = []

            for gen_id in active_gens:
                cost, path, stats = self.run_dijkstra(gen_id, target_id)
                total_nodes_exp += stats["nodes_explored"]
                if cost < best_cost:
                    best_cost = cost
                    best_path = path

            if best_cost < float('inf'):
                restored += 1
                total_cost += best_cost
                self.nodes[target_id].is_energized = True

        elapsed_us = round((time.perf_counter() - t0) * 1_000_000)
        return {
            "name": "Priority Queue Emergency Dispatch",
            "time_us": elapsed_us,
            "complexity": "O(K · (V + E) log V)",
            "space": "O(V)",
            "nodes_explored": total_nodes_exp,
            "restored_count": restored,
            "total_blackout": len(blackout_nodes),
            "total_bypass_cost": round(total_cost, 2)
        }

    # ==========================================
    # ALGORITHM 5: Kruskal's MST
    # Time: O(E log E) | Space: O(V + E)
    # ==========================================
    def run_kruskal(self) -> Dict:
        t0 = time.perf_counter()
        active_edges = [
            e for e in self.edges 
            if not e.is_failed and not self.nodes[e.u].is_failed and not self.nodes[e.v].is_failed
        ]
        active_edges.sort(key=lambda e: e.weight)

        dsu = DisjointSetUnion(self.num_nodes)
        mst_edges = []
        total_cost = 0.0

        for e in active_edges:
            if dsu.union(e.u, e.v):
                mst_edges.append(e)
                total_cost += e.weight

        elapsed_us = round((time.perf_counter() - t0) * 1_000_000)
        return {
            "name": "Kruskal's MST",
            "time_us": elapsed_us,
            "complexity": "O(E log E)",
            "space": "O(V + E)",
            "edges_in_mst": len(mst_edges),
            "total_cost": round(total_cost, 2)
        }

    # ==========================================
    # ALGORITHM 6: Prim's MST
    # Time: O(E log V) | Space: O(V)
    # ==========================================
    def run_prim(self) -> Dict:
        t0 = time.perf_counter()
        root = 0
        for n in self.nodes:
            if n.priority == PriorityTier.GENERATOR and not n.is_failed:
                root = n.id
                break

        in_mst = {root}
        pq = []
        for v, edge_id in self.adj[root]:
            if not self.edges[edge_id].is_failed and not self.nodes[v].is_failed:
                heapq.heappush(pq, (self.edges[edge_id].weight, root, v, edge_id))

        total_cost = 0.0
        tree_edges = []

        while pq:
            w, u, v, edge_id = heapq.heappop(pq)
            if v in in_mst:
                continue

            in_mst.add(v)
            tree_edges.append((u, v))
            total_cost += w

            for next_v, next_edge_id in self.adj[v]:
                if not self.edges[next_edge_id].is_failed and not self.nodes[next_v].is_failed:
                    if next_v not in in_mst:
                        heapq.heappush(pq, (self.edges[next_edge_id].weight, v, next_v, next_edge_id))

        elapsed_us = round((time.perf_counter() - t0) * 1_000_000)
        return {
            "name": "Prim's MST",
            "time_us": elapsed_us,
            "complexity": "O(E log V)",
            "space": "O(V)",
            "nodes_in_mst": len(in_mst),
            "total_cost": round(total_cost, 2)
        }


def build_delhi_grid() -> PowerGridSimulator:
    grid = PowerGridSimulator(12)
    # Generators
    grid.add_node(0, "Badarpur Thermal Station", PriorityTier.GENERATOR, demand_mw=0, capacity_mw=800)
    grid.add_node(1, "Indraprastha Gas Turbine", PriorityTier.GENERATOR, demand_mw=0, capacity_mw=600)
    grid.add_node(2, "Pragati Power Station", PriorityTier.GENERATOR, demand_mw=0, capacity_mw=500)

    # Critical Tier 1 Facilities
    grid.add_node(3, "AIIMS Hospital Substation", PriorityTier.TIER_1_HOSPITAL, demand_mw=75, capacity_mw=90)
    grid.add_node(4, "Safdarjung Trauma Center", PriorityTier.TIER_1_HOSPITAL, demand_mw=65, capacity_mw=80)

    # Critical Tier 2 Facilities
    grid.add_node(5, "Delhi Jal Board Water Plant", PriorityTier.TIER_2_WATER_TRANSIT, demand_mw=110, capacity_mw=120)
    grid.add_node(6, "DMRC Metro Traction Hub", PriorityTier.TIER_2_WATER_TRANSIT, demand_mw=130, capacity_mw=150)

    # Substations & Residential
    grid.add_node(7, "Wazirabad 400kV Substation", PriorityTier.TIER_3_RESIDENTIAL, demand_mw=20, capacity_mw=400)
    grid.add_node(8, "Sarita Vihar 220kV Substation", PriorityTier.TIER_3_RESIDENTIAL, demand_mw=40, capacity_mw=250)
    grid.add_node(9, "Connaught Place NDMC Grid", PriorityTier.TIER_3_RESIDENTIAL, demand_mw=140, capacity_mw=160)
    grid.add_node(10, "Rohini Urban Hub", PriorityTier.TIER_3_RESIDENTIAL, demand_mw=160, capacity_mw=180)

    # Heavy Industrial
    grid.add_node(11, "Okhla Industrial Area Phase-III", PriorityTier.TIER_4_INDUSTRIAL, demand_mw=195, capacity_mw=220)

    # Transmission Lines
    lines = [
        (0, 8, 4.2), (0, 7, 8.5), (7, 1, 6.8), (8, 3, 5.1), (8, 4, 4.8),
        (3, 4, 2.2), (7, 3, 6.0), (7, 5, 5.4), (1, 5, 4.7), (1, 6, 6.2),
        (5, 9, 3.5), (3, 9, 4.0), (2, 9, 3.2), (2, 6, 5.8), (2, 11, 7.1),
        (4, 10, 6.5), (9, 10, 5.9), (10, 11, 7.8), (6, 11, 6.4)
    ]
    for u, v, w in lines:
        grid.add_transmission_line(u, v, w)

    grid.update_grid_energization()
    return grid


def run_benchmark_table(grid: PowerGridSimulator):
    print("\n" + "=" * 90)
    print("        ALGORITHM DESIGN AND ANALYSIS: BENCHMARK & COMPARISON TABLE")
    print("=" * 90)
    print(f"{'Algorithm':<32} {'Time Complexity':<18} {'Space':<10} {'Exec Time (μs)':<16} {'Cost/Result'}")
    print("-" * 90)

    bfs = grid.run_bfs(0)
    print(f"{bfs['name']:<32} {bfs['complexity']:<18} {bfs['space']:<10} {bfs['time_us']:<16} {bfs['reachable_count']} Reachable")

    dfs = grid.run_dfs_bridges()
    print(f"{dfs['name']:<32} {dfs['complexity']:<18} {dfs['space']:<10} {dfs['time_us']:<16} {len(dfs['bridges'])} Bridges Found")

    cost, path, dijk = grid.run_dijkstra(0, 3)
    print(f"{dijk['name']:<32} {dijk['complexity']:<18} {dijk['space']:<10} {dijk['time_us']:<16} Path Cost: {cost}")

    prim = grid.run_prim()
    print(f"{prim['name']:<32} {prim['complexity']:<18} {prim['space']:<10} {prim['time_us']:<16} MST Cost: {prim['total_cost']}")

    kruskal = grid.run_kruskal()
    print(f"{kruskal['name']:<32} {kruskal['complexity']:<18} {kruskal['space']:<10} {kruskal['time_us']:<16} MST Cost: {kruskal['total_cost']}")

    pq_rec = grid.run_priority_queue_recovery()
    print(f"{pq_rec['name']:<32} {pq_rec['complexity']:<18} {pq_rec['space']:<10} {pq_rec['time_us']:<16} Restored: {pq_rec.get('restored_count', 0)}")
    print("=" * 90 + "\n")


if __name__ == "__main__":
    print("=========================================================================")
    print("        THE POWER GRID FAILURE RECOVERY SIMULATOR (PYTHON ENGINE)")
    print("   Faculty of Technology (University of Delhi) | 2026-2027")
    print("   Submitted by: Aashutosh Singh Parihar & C. Sai Vishwak Raju")
    print("   Course: Algorithm Design & Analysis (ADA) | Guide: Dr. Juhi Jain")
    print("=========================================================================")

    sim = build_delhi_grid()
    print(" [*] Loaded Delhi NCR Regional Power Distribution Grid with 12 Substations.")

    # Simulate typical fault scenario
    print("\n [SIMULATING TRANSMISSION DISASTER]")
    sim.fail_line(3)  # Cut line Sarita Vihar -> AIIMS Hospital
    sim.fail_line(6)  # Cut line Wazirabad -> AIIMS Hospital
    sim.fail_substation(8)  # Sarita Vihar Substation Blackout

    print("\n [RUNNING COMPARATIVE BENCHMARKS ON DEGRADED GRID]")
    run_benchmark_table(sim)

    print(" [EXECUTING PRIORITY QUEUE RECOVERY FOR HOSPITALS]")
    rec_res = sim.run_priority_queue_recovery()
    print(f" -> Result: {rec_res}")
