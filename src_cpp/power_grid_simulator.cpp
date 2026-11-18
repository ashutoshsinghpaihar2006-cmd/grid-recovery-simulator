/**
 * =========================================================================================
 * ALGORITHM DESIGN AND ANALYSIS (ADA) PROJECT
 * Faculty of Technology, University of Delhi (2026-2027)
 * 
 * Project: The Power Grid Failure Recovery Simulator
 * Submitted by:
 *   - Aashutosh Singh Parihar (Roll No: 25293916003)
 *   - C. Sai Vishwak Raju     (Roll No: 25293916027)
 * Batch: CSE B2 (3rd Semester)
 * Submitted to: Dr. Juhi Jain
 * =========================================================================================
 */

#include <iostream>
#include <vector>
#include <string>
#include <queue>
#include <algorithm>
#include <unordered_map>
#include <set>
#include <chrono>
#include <iomanip>

using namespace std;
using namespace std::chrono;

// Priority Tiers for Electrical Substations & Facilities
enum PriorityTier {
    GENERATOR_SOURCE = 0,
    TIER_1_CRITICAL_HOSPITAL = 1,   // AIIMS, Safdarjung Trauma
    TIER_2_WATER_TRANSIT = 2,       // Delhi Jal Board, Metro Traction
    TIER_3_RESIDENTIAL = 3,         // NDMC, Rohini Urban Grid
    TIER_4_INDUSTRIAL = 4           // Okhla, Mayapuri Industrial Area
};

string getPriorityName(PriorityTier tier) {
    switch (tier) {
        case GENERATOR_SOURCE: return "Power Station Source (Tier 0)";
        case TIER_1_CRITICAL_HOSPITAL: return "Critical: Hospital / Trauma (Tier 1)";
        case TIER_2_WATER_TRANSIT: return "Essential: Water / Transit (Tier 2)";
        case TIER_3_RESIDENTIAL: return "Standard: Residential / Commercial (Tier 3)";
        case TIER_4_INDUSTRIAL: return "Deferred: Heavy Industrial (Tier 4)";
    }
    return "Unknown";
}

struct Node {
    int id;
    string name;
    PriorityTier priority;
    double demandMW;
    double capacityMW;
    bool isFailed;
    bool isEnergized;

    Node(int _id = 0, string _name = "", PriorityTier _priority = TIER_3_RESIDENTIAL,
         double _demand = 50.0, double _capacity = 200.0)
        : id(_id), name(_name), priority(_priority), demandMW(_demand),
          capacityMW(_capacity), isFailed(false), isEnergized(false) {}
};

struct Edge {
    int u, v;
    double weight; // Transmission cost / impedance (distance)
    double capacityMW;
    bool isFailed;

    Edge(int _u = 0, int _v = 0, double _w = 0.0, double _cap = 300.0)
        : u(_u), v(_v), weight(_w), capacityMW(_cap), isFailed(false) {}
};

// Disjoint Set Union (DSU) with Path Compression and Union by Rank
class DisjointSetUnion {
private:
    vector<int> parent;
    vector<int> rank;

public:
    DisjointSetUnion(int n) {
        parent.resize(n);
        rank.resize(n, 0);
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    int find(int i) {
        if (parent[i] != i) {
            parent[i] = find(parent[i]); // Path compression
        }
        return parent[i];
    }

    bool unite(int i, int j) {
        int rootI = find(i);
        int rootJ = find(j);
        if (rootI == rootJ) return false;

        // Union by rank
        if (rank[rootI] < rank[rootJ]) {
            parent[rootI] = rootJ;
        } else if (rank[rootI] > rank[rootJ]) {
            parent[rootJ] = rootI;
        } else {
            parent[rootJ] = rootI;
            rank[rootI]++;
        }
        return true;
    }
};

// Power Grid Graph Model
class PowerGrid {
public:
    int numNodes;
    vector<Node> nodes;
    vector<Edge> edges;
    vector<vector<pair<int, int>>> adj; // adj[u] = list of {v, edge_index}

    PowerGrid(int n = 0) : numNodes(n) {
        nodes.resize(n);
        adj.resize(n);
    }

    void addNode(int id, string name, PriorityTier priority, double demand = 50.0, double cap = 200.0) {
        nodes[id] = Node(id, name, priority, demand, cap);
    }

    void addTransmissionLine(int u, int v, double weight, double capacity = 300.0) {
        int edgeIdx = edges.size();
        edges.push_back(Edge(u, v, weight, capacity));
        adj[u].push_back({v, edgeIdx});
        adj[v].push_back({u, edgeIdx});
    }

    void failTransmissionLine(int edgeIdx) {
        if (edgeIdx >= 0 && edgeIdx < (int)edges.size()) {
            edges[edgeIdx].isFailed = true;
            cout << " [!] Line " << edgeIdx << " (" << nodes[edges[edgeIdx].u].name
                 << " <-> " << nodes[edges[edgeIdx].v].name << ") TRIPPED/FAILED.\n";
            updateEnergizedStatus();
        }
    }

    void failSubstation(int nodeId) {
        if (nodeId >= 0 && nodeId < numNodes) {
            nodes[nodeId].isFailed = true;
            cout << " [!] Substation " << nodes[nodeId].name << " (Node " << nodeId << ") BLACKOUT/EXPLOSION.\n";
            updateEnergizedStatus();
        }
    }

    void resetGrid() {
        for (auto& e : edges) e.isFailed = false;
        for (auto& n : nodes) {
            n.isFailed = false;
            n.isEnergized = (n.priority == GENERATOR_SOURCE);
        }
        updateEnergizedStatus();
        cout << " [*] Grid fully reset to normal nominal operation.\n";
    }

    void updateEnergizedStatus() {
        for (int i = 0; i < numNodes; i++) {
            nodes[i].isEnergized = (nodes[i].priority == GENERATOR_SOURCE && !nodes[i].isFailed);
        }

        queue<int> q;
        vector<bool> visited(numNodes, false);

        for (int i = 0; i < numNodes; i++) {
            if (nodes[i].priority == GENERATOR_SOURCE && !nodes[i].isFailed) {
                q.push(i);
                visited[i] = true;
            }
        }

        while (!q.empty()) {
            int u = q.front();
            q.pop();

            for (auto& neighbor : adj[u]) {
                int v = neighbor.first;
                int edgeIdx = neighbor.second;

                if (!edges[edgeIdx].isFailed && !nodes[v].isFailed && !visited[v]) {
                    visited[v] = true;
                    nodes[v].isEnergized = true;
                    q.push(v);
                }
            }
        }
    }

    // ==========================================
    // ALGORITHM 1: Breadth-First Search (BFS)
    // Time Complexity: O(V + E)
    // ==========================================
    void runBFS(int startNode) {
        cout << "\n------------------------------------------------------------\n";
        cout << " [ALGORITHM 1] BREADTH-FIRST SEARCH (BFS) CONNECTIVITY SCAN\n";
        cout << " Objective: Reachability analysis & hop-distance from Source\n";
        cout << " Time Complexity: O(V + E) | Space Complexity: O(V)\n";
        cout << "------------------------------------------------------------\n";

        auto t0 = high_resolution_clock::now();
        vector<bool> visited(numNodes, false);
        vector<int> distanceHops(numNodes, -1);
        queue<int> q;

        visited[startNode] = true;
        distanceHops[startNode] = 0;
        q.push(startNode);

        int nodesExplored = 0;

        while (!q.empty()) {
            int u = q.front();
            q.pop();
            nodesExplored++;

            for (auto& neighbor : adj[u]) {
                int v = neighbor.first;
                int edgeIdx = neighbor.second;

                if (!edges[edgeIdx].isFailed && !nodes[v].isFailed && !visited[v]) {
                    visited[v] = true;
                    distanceHops[v] = distanceHops[u] + 1;
                    q.push(v);
                }
            }
        }

        auto t1 = high_resolution_clock::now();
        auto duration = duration_cast<microseconds>(t1 - t0).count();

        cout << left << setw(8) << "Node ID" << setw(35) << "Substation Name"
             << setw(16) << "Hop Distance" << setw(15) << "Status" << "\n";
        cout << string(74, '-') << "\n";

        int unreached = 0;
        for (int i = 0; i < numNodes; i++) {
            cout << left << setw(8) << i << setw(35) << nodes[i].name;
            if (visited[i]) {
                cout << setw(16) << distanceHops[i] << setw(15) << "ENERGIZED\n";
            } else {
                cout << setw(16) << "UNREACHABLE" << setw(15) << "BLACKOUT (ISLANDED)\n";
                unreached++;
            }
        }
        cout << "\n [Summary] Nodes Explored: " << nodesExplored
             << " | Blackout Nodes: " << unreached
             << " | Execution Time: " << duration << " microseconds.\n";
    }

    // =========================================================
    // ALGORITHM 2: Depth-First Search & Bridge Detection (Tarjan)
    // Time Complexity: O(V + E)
    // =========================================================
    void runDFSBridgeDetection() {
        cout << "\n------------------------------------------------------------\n";
        cout << " [ALGORITHM 2] TARJAN'S DFS CRITICAL BRIDGE DETECTION\n";
        cout << " Objective: Discover single transmission lines whose failure isolates grid\n";
        cout << " Time Complexity: O(V + E) | Space Complexity: O(V)\n";
        cout << "------------------------------------------------------------\n";

        auto t0 = high_resolution_clock::now();
        vector<int> tin(numNodes, -1);
        vector<int> low(numNodes, -1);
        vector<bool> visited(numNodes, false);
        vector<pair<int, int>> criticalBridges;
        int timer = 0;

        auto dfs = [&](auto self, int u, int p = -1) -> void {
            visited[u] = true;
            tin[u] = low[u] = ++timer;

            for (auto& neighbor : adj[u]) {
                int v = neighbor.first;
                int edgeIdx = neighbor.second;
                if (edges[edgeIdx].isFailed || nodes[v].isFailed) continue;

                if (v == p) continue;

                if (visited[v]) {
                    low[u] = min(low[u], tin[v]);
                } else {
                    self(self, v, u);
                    low[u] = min(low[u], low[v]);
                    if (low[v] > tin[u]) {
                        criticalBridges.push_back({u, v});
                    }
                }
            }
        };

        for (int i = 0; i < numNodes; i++) {
            if (!visited[i] && !nodes[i].isFailed) {
                dfs(dfs, i);
            }
        }

        auto t1 = high_resolution_clock::now();
        auto duration = duration_cast<microseconds>(t1 - t0).count();

        cout << " Discovered " << criticalBridges.size() << " Critical Bridge Transmission Line(s):\n";
        for (auto& b : criticalBridges) {
            cout << "  * Line between [" << nodes[b.first].name << "] <---> ["
                 << nodes[b.second].name << "] is a SINGLE POINT OF FAILURE.\n";
        }
        cout << " [Summary] Execution Time: " << duration << " microseconds.\n";
    }

    // =========================================================
    // ALGORITHM 3: Dijkstra's Shortest Bypass Route
    // Time Complexity: O((V + E) log V)
    // =========================================================
    pair<double, vector<int>> runDijkstra(int sourceId, int targetId, bool verbose = true) {
        auto t0 = high_resolution_clock::now();
        vector<double> dist(numNodes, 1e9);
        vector<int> parent(numNodes, -1);
        // Min-heap storing {distance, node_id}
        priority_queue<pair<double, int>, vector<pair<double, int>>, greater<pair<double, int>>> pq;

        dist[sourceId] = 0;
        pq.push({0.0, sourceId});

        int nodesVisited = 0;

        while (!pq.empty()) {
            auto top = pq.top();
            pq.pop();
            double d = top.first;
            int u = top.second;

            if (d > dist[u]) continue;
            nodesVisited++;
            if (u == targetId) break;

            for (auto& neighbor : adj[u]) {
                int v = neighbor.first;
                int edgeIdx = neighbor.second;

                if (edges[edgeIdx].isFailed || nodes[v].isFailed) continue;

                double weight = edges[edgeIdx].weight;
                if (dist[u] + weight < dist[v]) {
                    dist[v] = dist[u] + weight;
                    parent[v] = u;
                    pq.push({dist[v], v});
                }
            }
        }

        auto t1 = high_resolution_clock::now();
        auto duration = duration_cast<microseconds>(t1 - t0).count();

        vector<int> path;
        if (dist[targetId] < 1e9) {
            int curr = targetId;
            while (curr != -1) {
                path.push_back(curr);
                curr = parent[curr];
            }
            reverse(path.begin(), path.end());
        }

        if (verbose) {
            cout << "\n------------------------------------------------------------\n";
            cout << " [ALGORITHM 3] DIJKSTRA'S SHORTEST BYPASS ROUTE\n";
            cout << " Source: " << nodes[sourceId].name << " -> Target: " << nodes[targetId].name << "\n";
            cout << " Time Complexity: O((V + E) log V) | Space Complexity: O(V)\n";
            cout << "------------------------------------------------------------\n";

            if (path.empty()) {
                cout << " [!] NO BYPASS ROUTE EXISTS. Target is isolated in blackout zone.\n";
            } else {
                cout << " [+] Optimal Route Established (Cost: " << dist[targetId] << " Ω-km):\n     ";
                for (size_t i = 0; i < path.size(); i++) {
                    cout << nodes[path[i]].name << (i + 1 < path.size() ? "  ===>  " : "\n");
                }
            }
            cout << " [Summary] Nodes Explored: " << nodesVisited
                 << " | Execution Time: " << duration << " microseconds.\n";
        }

        return {dist[targetId], path};
    }

    // =========================================================
    // ALGORITHM 4: Priority Queue Emergency Facility Dispatch
    // Time Complexity: O(K * (V + E) log V)
    // =========================================================
    void runPriorityQueueRecovery() {
        cout << "\n============================================================\n";
        cout << " [ALGORITHM 4] EMERGENCY PRIORITY QUEUE RESTORATION DISPATCH\n";
        cout << " Objective: Restore Hospitals & Emergency Centers FIRST via Min-Heap\n";
        cout << "============================================================\n";

        // Find all blackout / de-energized nodes
        vector<int> blackoutNodes;
        for (int i = 0; i < numNodes; i++) {
            if (!nodes[i].isEnergized && !nodes[i].isFailed && nodes[i].priority != GENERATOR_SOURCE) {
                blackoutNodes.push_back(i);
            }
        }

        if (blackoutNodes.empty()) {
            cout << " [*] No blackouts detected. Grid is already 100% energized.\n";
            return;
        }

        // Custom Comparator for Priority Queue:
        // Priority 1 (Hospitals) > Priority 2 (Water/Metro) > Priority 3 (Residential) > Priority 4 (Industrial)
        struct PQComparator {
            const vector<Node>& nodeList;
            PQComparator(const vector<Node>& nl) : nodeList(nl) {}
            bool operator()(int a, int b) {
                if (nodeList[a].priority != nodeList[b].priority) {
                    return nodeList[a].priority > nodeList[b].priority; // Min-Heap: smaller tier number = higher priority
                }
                return nodeList[a].demandMW < nodeList[b].demandMW;
            }
        };

        priority_queue<int, vector<int>, PQComparator> pq((PQComparator(nodes)));
        for (int id : blackoutNodes) {
            pq.push(id);
        }

        cout << " Queued " << blackoutNodes.size() << " blackout substation(s) in Priority Queue.\n\n";

        // Collect active power generation sources
        vector<int> activeGenerators;
        for (int i = 0; i < numNodes; i++) {
            if (nodes[i].priority == GENERATOR_SOURCE && !nodes[i].isFailed) {
                activeGenerators.push_back(i);
            }
        }

        if (activeGenerators.empty()) {
            cout << " [FATAL] All power generation stations are offline. Recovery impossible!\n";
            return;
        }

        int step = 1;
        double totalCost = 0;
        int restoredCount = 0;

        while (!pq.empty()) {
            int target = pq.top();
            pq.pop();

            cout << " [Step " << step++ << "] Dispatching Power to " << getPriorityName(nodes[target].priority) << ":\n"
                 << "         Facility: " << nodes[target].name << " (Demand: " << nodes[target].demandMW << " MW)\n";

            // Find shortest route from any available operational generator
            double bestCost = 1e9;
            vector<int> bestPath;
            int bestGen = -1;

            for (int gen : activeGenerators) {
                auto res = runDijkstra(gen, target, false);
                if (res.first < bestCost) {
                    bestCost = res.first;
                    bestPath = res.second;
                    bestGen = gen;
                }
            }

            if (bestCost < 1e9) {
                cout << "         -> Restored via " << nodes[bestGen].name << " (Impedance: " << bestCost << ")\n"
                     << "         -> Path: ";
                for (size_t i = 0; i < bestPath.size(); i++) {
                    cout << nodes[bestPath[i]].name << (i + 1 < bestPath.size() ? " -> " : "\n");
                }
                nodes[target].isEnergized = true;
                totalCost += bestCost;
                restoredCount++;
            } else {
                cout << "         [FAILED] All transmission lines to " << nodes[target].name << " are blocked!\n";
            }
            cout << "\n";
        }

        cout << " [Summary] Priority Dispatch Completed. Restored " << restoredCount
             << "/" << blackoutNodes.size() << " facilities. Total bypass impedance: "
             << totalCost << " units.\n";
    }

    // =========================================================
    // ALGORITHM 5: Kruskal's Minimum Spanning Tree
    // Time Complexity: O(E log E)
    // =========================================================
    void runKruskalMST() {
        cout << "\n------------------------------------------------------------\n";
        cout << " [ALGORITHM 5] KRUSKAL'S MINIMUM SPANNING TREE (MST)\n";
        cout << " Objective: Globally reconfigure minimal transmission backbone\n";
        cout << " Time Complexity: O(E log E) | Space Complexity: O(V + E)\n";
        cout << "------------------------------------------------------------\n";

        auto t0 = high_resolution_clock::now();

        // Sort active edges by weight
        vector<Edge> activeEdges;
        for (auto& e : edges) {
            if (!e.isFailed && !nodes[e.u].isFailed && !nodes[e.v].isFailed) {
                activeEdges.push_back(e);
            }
        }

        sort(activeEdges.begin(), activeEdges.end(), [](const Edge& a, const Edge& b) {
            return a.weight < b.weight;
        });

        DisjointSetUnion dsu(numNodes);
        vector<Edge> mstEdges;
        double totalMSTCost = 0;

        for (auto& e : activeEdges) {
            if (dsu.unite(e.u, e.v)) {
                mstEdges.push_back(e);
                totalMSTCost += e.weight;
            }
        }

        auto t1 = high_resolution_clock::now();
        auto duration = duration_cast<microseconds>(t1 - t0).count();

        cout << " Constructed MST with " << mstEdges.size() << " transmission lines:\n";
        for (auto& e : mstEdges) {
            cout << "  * " << nodes[e.u].name << " <===> " << nodes[e.v].name
                 << " (Cost: " << e.weight << ")\n";
        }
        cout << "\n [Summary] Total MST Transmission Cost: " << totalMSTCost
             << " | Execution Time: " << duration << " microseconds.\n";
    }

    // =========================================================
    // ALGORITHM 6: Prim's Minimum Spanning Tree
    // Time Complexity: O(E log V)
    // =========================================================
    void runPrimMST() {
        cout << "\n------------------------------------------------------------\n";
        cout << " [ALGORITHM 6] PRIM'S MINIMUM SPANNING TREE (MST)\n";
        cout << " Objective: Grow minimal tree from root power generator\n";
        cout << " Time Complexity: O(E log V) | Space Complexity: O(V)\n";
        cout << "------------------------------------------------------------\n";

        auto t0 = high_resolution_clock::now();

        int rootNode = 0;
        for (int i = 0; i < numNodes; i++) {
            if (nodes[i].priority == GENERATOR_SOURCE && !nodes[i].isFailed) {
                rootNode = i;
                break;
            }
        }

        vector<bool> inMST(numNodes, false);
        // Min-heap storing {weight, {u, v}}
        priority_queue<pair<double, pair<int, int>>, vector<pair<double, pair<int, int>>>, greater<pair<double, pair<int, int>>>> pq;

        inMST[rootNode] = true;
        for (auto& neighbor : adj[rootNode]) {
            int v = neighbor.first;
            int edgeIdx = neighbor.second;
            if (!edges[edgeIdx].isFailed && !nodes[v].isFailed) {
                pq.push({edges[edgeIdx].weight, {rootNode, v}});
            }
        }

        double totalCost = 0;
        vector<pair<int, int>> treeEdges;

        while (!pq.empty()) {
            auto top = pq.top();
            pq.pop();
            double w = top.first;
            int u = top.second.first;
            int v = top.second.second;

            if (inMST[v]) continue;

            inMST[v] = true;
            treeEdges.push_back({u, v});
            totalCost += w;

            for (auto& neighbor : adj[v]) {
                int nextNode = neighbor.first;
                int edgeIdx = neighbor.second;
                if (!edges[edgeIdx].isFailed && !nodes[nextNode].isFailed && !inMST[nextNode]) {
                    pq.push({edges[edgeIdx].weight, {v, nextNode}});
                }
            }
        }

        auto t1 = high_resolution_clock::now();
        auto duration = duration_cast<microseconds>(t1 - t0).count();

        cout << " Prim's MST rooted at [" << nodes[rootNode].name << "]:\n";
        for (auto& edge : treeEdges) {
            cout << "  * " << nodes[edge.first].name << " <===> " << nodes[edge.second].name << "\n";
        }
        cout << "\n [Summary] Total Prim MST Cost: " << totalCost
             << " | Execution Time: " << duration << " microseconds.\n";
    }
};

// Preset: Faculty of Technology - Delhi NCR Power Distribution Grid
PowerGrid buildDelhiNCRGrid() {
    PowerGrid grid(12);

    // Generators
    grid.addNode(0, "Badarpur Thermal Power Station", GENERATOR_SOURCE, 0, 800);
    grid.addNode(1, "Indraprastha Gas Turbine Station", GENERATOR_SOURCE, 0, 600);
    grid.addNode(2, "Pragati Combined Cycle Station", GENERATOR_SOURCE, 0, 500);

    // Critical Tier 1 Facilities
    grid.addNode(3, "AIIMS Hospital Substation", TIER_1_CRITICAL_HOSPITAL, 75, 90);
    grid.addNode(4, "Safdarjung Trauma Center", TIER_1_CRITICAL_HOSPITAL, 65, 80);

    // Essential Tier 2 Facilities
    grid.addNode(5, "Delhi Jal Board Water Plant", TIER_2_WATER_TRANSIT, 110, 120);
    grid.addNode(6, "DMRC Metro Traction Station", TIER_2_WATER_TRANSIT, 130, 150);

    // Major Substations
    grid.addNode(7, "Wazirabad 400kV Grid Substation", TIER_3_RESIDENTIAL, 20, 400);
    grid.addNode(8, "Sarita Vihar 220kV Substation", TIER_3_RESIDENTIAL, 40, 250);

    // Residential Grids (Tier 3)
    grid.addNode(9, "Connaught Place NDMC Grid", TIER_3_RESIDENTIAL, 140, 160);
    grid.addNode(10, "Rohini Urban Distribution Hub", TIER_3_RESIDENTIAL, 160, 180);

    // Heavy Industrial (Tier 4)
    grid.addNode(11, "Okhla Industrial Area Phase-III", TIER_4_INDUSTRIAL, 195, 220);

    // High Voltage Transmission Lines
    grid.addTransmissionLine(0, 8, 4.2);
    grid.addTransmissionLine(0, 7, 8.5);
    grid.addTransmissionLine(7, 1, 6.8);
    grid.addTransmissionLine(8, 3, 5.1);
    grid.addTransmissionLine(8, 4, 4.8);
    grid.addTransmissionLine(3, 4, 2.2);
    grid.addTransmissionLine(7, 3, 6.0);
    grid.addTransmissionLine(7, 5, 5.4);
    grid.addTransmissionLine(1, 5, 4.7);
    grid.addTransmissionLine(1, 6, 6.2);
    grid.addTransmissionLine(5, 9, 3.5);
    grid.addTransmissionLine(3, 9, 4.0);
    grid.addTransmissionLine(2, 9, 3.2);
    grid.addTransmissionLine(2, 6, 5.8);
    grid.addTransmissionLine(2, 11, 7.1);
    grid.addTransmissionLine(4, 10, 6.5);
    grid.addTransmissionLine(9, 10, 5.9);
    grid.addTransmissionLine(10, 11, 7.8);
    grid.addTransmissionLine(6, 11, 6.4);

    grid.updateEnergizedStatus();
    return grid;
}

int main() {
    cout << "=========================================================================\n";
    cout << "        THE POWER GRID FAILURE RECOVERY SIMULATOR                        \n";
    cout << "   Algorithm Design and Analysis Project | Faculty of Technology (DU)    \n";
    cout << "   Submitted by: Aashutosh Singh Parihar & C. Sai Vishwak Raju           \n";
    cout << "   Supervised by: Dr. Juhi Jain (3rd Semester CSE B2, 2026-2027)         \n";
    cout << "=========================================================================\n";

    PowerGrid grid = buildDelhiNCRGrid();

    int choice;
    do {
        cout << "\n-------------------------------------------------------------\n";
        cout << " [MAIN MENU] Power Dispatch & Recovery Operations:\n";
        cout << "  1. Run BFS Connectivity Scan\n";
        cout << "  2. Run Tarjan's DFS Critical Bridge Detection\n";
        cout << "  3. Find Shortest Route via Dijkstra's Algorithm\n";
        cout << "  4. Simulate Transmission Line Failure\n";
        cout << "  5. Simulate Substation Blackout / Transformer Explosion\n";
        cout << "  6. Execute Priority Queue Disaster Recovery (Hospitals First)\n";
        cout << "  7. Reconfigure Grid via Kruskal's MST\n";
        cout << "  8. Reconfigure Grid via Prim's MST\n";
        cout << "  9. Reset Grid to 100% Operational\n";
        cout << "  0. Exit\n";
        cout << " Enter choice: ";
        if (!(cin >> choice)) break;

        switch (choice) {
            case 1:
                grid.runBFS(0);
                break;
            case 2:
                grid.runDFSBridgeDetection();
                break;
            case 3: {
                int src, dst;
                cout << " Enter Source Power Station ID (0: Badarpur, 1: IP, 2: Pragati): ";
                cin >> src;
                cout << " Enter Destination Substation ID (3: AIIMS, 4: Safdarjung, etc.): ";
                cin >> dst;
                grid.runDijkstra(src, dst);
                break;
            }
            case 4: {
                int lineIdx;
                cout << " Enter Transmission Line Index to Cut (0 to " << grid.edges.size() - 1 << "): ";
                cin >> lineIdx;
                grid.failTransmissionLine(lineIdx);
                break;
            }
            case 5: {
                int nodeId;
                cout << " Enter Substation ID to Fail (0 to " << grid.numNodes - 1 << "): ";
                cin >> nodeId;
                grid.failSubstation(nodeId);
                break;
            }
            case 6:
                grid.runPriorityQueueRecovery();
                break;
            case 7:
                grid.runKruskalMST();
                break;
            case 8:
                grid.runPrimMST();
                break;
            case 9:
                grid.resetGrid();
                break;
            case 0:
                cout << " Exiting simulator. Goodbye!\n";
                break;
            default:
                cout << " Invalid option. Try again.\n";
        }
    } while (choice != 0);

    return 0;
}
