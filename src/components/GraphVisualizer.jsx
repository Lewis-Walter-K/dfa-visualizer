import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';

const GraphVisualizer = ({ states, transitions, startState, acceptStates, currentState, activeTransitionId, layoutTrigger }) => {
    const containerRef = useRef(null);
    const networkRef = useRef(null);
    const nodesRef = useRef(new DataSet([]));
    const edgesRef = useRef(new DataSet([]));

    // 1. Initialize Network (Runs strictly ONCE)
    useEffect(() => {
        if (!containerRef.current) return;

        const options = {
            physics: {
                enabled: true,
                solver: 'repulsion',
                repulsion: {
                    nodeDistance: 250,      
                    centralGravity: 0.05,
                    springLength: 200,
                    springConstant: 0.05
                },
                stabilization: { iterations: 150 }
            },
            interaction: { hover: true, dragNodes: true, zoomView: true, selectConnectedEdges: false }
        };

        networkRef.current = new Network(containerRef.current, { nodes: nodesRef.current, edges: edgesRef.current }, options);

        networkRef.current.on("stabilizationIterationsDone", () => {
            networkRef.current.setOptions({ physics: { enabled: false } });
        });

        return () => {
            if (networkRef.current) networkRef.current.destroy();
        };
    }, []);

    // 2. Trigger Auto-Arrange Manually
    useEffect(() => {
        if (networkRef.current && layoutTrigger > 0) {
            networkRef.current.setOptions({ physics: { enabled: true } });
            networkRef.current.stabilize();
        }
    }, [layoutTrigger]);

    // 3. Update Visuals without Moving Nodes
    useEffect(() => {
        const C_NORMAL_BG = '#e5e7eb';
        const C_NORMAL_BORDER = '#9ca3af';
        const C_START_BG = '#60a5fa';  
        const C_ACCEPT_BG = '#a7f3d0'; 
        const C_GLOW = '#22d3ee';      

        // Map NEW properties for nodes
        const newNodesData = states.map(state => {
            const isAccept = acceptStates.includes(state);
            const isStart = state === startState;
            const isActive = state === currentState;

            let bgColor = C_NORMAL_BG;
            if (isStart) bgColor = C_START_BG;
            if (isAccept) bgColor = C_ACCEPT_BG;

            return {
                id: state,
                label: state,
                shape: 'box',
                margin: { top: 15, bottom: 15, left: 20, right: 20 },
                borderWidth: isActive ? 3 : 1,
                color: { background: bgColor, border: isActive ? C_GLOW : C_NORMAL_BORDER },
                font: { size: 20, face: 'sans-serif', color: '#1f2937', bold: true },
                shadow: isActive ? { enabled: true, color: C_GLOW, size: 25, x: 0, y: 0 } : false
            };
        });

        newNodesData.push({ id: 'start_hidden', label: 'START', shape: 'text', font: {size: 16, color: '#6b7280', bold: true} });

        // --- NEW ALGORITHM: Group transitions by From/To pairs ---
        const groupedEdges = {};

        transitions.forEach(t => {
            const groupKey = `${t.from}-${t.to}`;
            
            // If this line doesn't exist yet, create it
            if (!groupedEdges[groupKey]) {
                groupedEdges[groupKey] = {
                    from: t.from,
                    to: t.to,
                    symbols: [],
                    isActive: false
                };
            }
            
            // Push the symbol (e.g., 'a' or 'b') into the array
            groupedEdges[groupKey].symbols.push(t.symbol);

            // If the currently running transition is part of this group, light up the whole group
            if (t.id === activeTransitionId) {
                groupedEdges[groupKey].isActive = true;
            }
        });

        // Map grouped data to Vis.js edges
        const newEdgesData = Object.keys(groupedEdges).map(key => {
            const group = groupedEdges[key];
            const isSelfLoop = group.from === group.to;
            const isActiveEdge = group.isActive;
            
            // Join the symbols with a comma (e.g., "a, b")
            const label = group.symbols.join(', ');

            return {
                id: `grouped-edge-${key}`, // We use a group ID instead of a single transition ID
                from: group.from,
                to: group.to,
                label: label,
                arrows: { to: { enabled: true, scaleFactor: 0.7 } },
                font: { 
                    align: 'top', size: 16, strokeWidth: 3, strokeColor: '#ffffff',
                    color: isActiveEdge ? '#0891b2' : '#6b7280'
                },
                color: { color: isActiveEdge ? C_GLOW : '#cbd5e1' },
                width: isActiveEdge ? 4 : 2,
                shadow: isActiveEdge ? { enabled: true, color: C_GLOW, size: 15, x: 0, y: 0 } : false,
                smooth: { type: isSelfLoop ? 'discrete' : 'continuous', roundness: isSelfLoop ? 0.7 : 0.5 } 
            };
        });

        if (startState) {
            newEdgesData.push({ 
                id: 'edge-start', from: 'start_hidden', to: startState, arrows: 'to', 
                color: {color: '#cbd5e1'}, width: 2 
            });
        }

        // ---------- SYNCHRONIZATION LOGIC ----------
        const currentNodes = nodesRef.current.getIds();
        const currentEdges = edgesRef.current.getIds();
        
        const newNodesIds = newNodesData.map(n => n.id);
        const newEdgesIds = newEdgesData.map(e => e.id);

        nodesRef.current.remove(currentNodes.filter(id => !newNodesIds.includes(id)));
        edgesRef.current.remove(currentEdges.filter(id => !newEdgesIds.includes(id)));

        nodesRef.current.update(newNodesData);
        edgesRef.current.update(newEdgesData);

    }, [states, transitions, startState, acceptStates, currentState, activeTransitionId]);

    return (
        <div ref={containerRef} className="w-full h-full bg-white rounded-lg outline-none cursor-grab active:cursor-grabbing" style={{ minHeight: '500px' }} />
    );
};

export default GraphVisualizer;