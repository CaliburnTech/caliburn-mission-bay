import React, { useState, useEffect } from 'react';
import { Layers } from 'lucide-react';
import { nodeTypes } from './constants';

const FlowCanvas = ({ template, onNodeClick, stateHierarchies = {} }) => {
  const [dimensions, setDimensions] = useState({ width: 800, height: 350 });

  useEffect(() => {
    if (template?.nodes) {
      const maxX = Math.max(...template.nodes.map(n => n.position.x)) + 180;
      const maxY = Math.max(...template.nodes.map(n => n.position.y)) + 80;
      setDimensions({ width: Math.max(800, maxX), height: Math.max(320, maxY) });
    }
  }, [template]);

  if (!template || !template.nodes) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-[0.85rem]">
        Select a mission above to view flow
      </div>
    );
  }

  const { nodes, connections, loopBack } = template;

  const getConnectionPoints = (fromId, toId) => {
    const fromNode = nodes.find(n => n.id === fromId);
    const toNode = nodes.find(n => n.id === toId);
    if (!fromNode || !toNode) return null;

    const fromConfig = nodeTypes[fromNode.type] || nodeTypes.action;
    const toConfig = nodeTypes[toNode.type] || nodeTypes.action;
    const fromCenter = { x: fromNode.position.x + fromConfig.width / 2, y: fromNode.position.y + fromConfig.height / 2 };
    const toCenter = { x: toNode.position.x + toConfig.width / 2, y: toNode.position.y + toConfig.height / 2 };

    let fromAnchor, toAnchor;
    if (toCenter.x > fromCenter.x + 30) {
      fromAnchor = { x: fromNode.position.x + fromConfig.width, y: fromCenter.y };
      toAnchor = { x: toNode.position.x, y: toCenter.y };
    } else if (toCenter.y > fromCenter.y + 30) {
      fromAnchor = { x: fromCenter.x, y: fromNode.position.y + fromConfig.height };
      toAnchor = { x: toCenter.x, y: toNode.position.y };
    } else if (toCenter.x < fromCenter.x - 30) {
      fromAnchor = { x: fromNode.position.x, y: fromCenter.y };
      toAnchor = { x: toNode.position.x + toConfig.width, y: toCenter.y };
    } else {
      fromAnchor = { x: fromNode.position.x + fromConfig.width, y: fromCenter.y };
      toAnchor = { x: toNode.position.x, y: toCenter.y };
    }
    return { from: fromAnchor, to: toAnchor };
  };

  const generatePath = (conn) => {
    const points = getConnectionPoints(conn.from, conn.to);
    if (!points) return '';
    const { from, to } = points;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      const midX = from.x + dx / 2;
      return `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
    } else {
      const midY = from.y + dy / 2;
      return `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;
    }
  };

  const generateLoopBackPath = (loopConn) => {
    const points = getConnectionPoints(loopConn.from, loopConn.to);
    if (!points) return '';
    const { from, to } = points;
    const loopY = Math.max(from.y, to.y) + 60;
    return `M ${from.x} ${from.y} Q ${from.x} ${loopY}, ${(from.x + to.x) / 2} ${loopY} Q ${to.x} ${loopY}, ${to.x} ${to.y}`;
  };

  return (
    <div className="relative w-full h-full overflow-auto bg-darkest">
      <svg width={dimensions.width} height={dimensions.height} className="absolute top-0 left-0 pointer-events-none">
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#4b5563" />
          </marker>
          <marker id="arrowhead-loop" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#f97316" />
          </marker>
        </defs>
        {connections.map((conn, idx) => (
          <g key={idx}>
            <path d={generatePath(conn)} fill="none" stroke="#4b5563" strokeWidth="2" markerEnd="url(#arrowhead)" />
            {conn.label && (
              <text
                x={(getConnectionPoints(conn.from, conn.to)?.from.x + getConnectionPoints(conn.from, conn.to)?.to.x) / 2}
                y={(getConnectionPoints(conn.from, conn.to)?.from.y + getConnectionPoints(conn.from, conn.to)?.to.y) / 2 - 5}
                fill="#9ca3af" fontSize="9" textAnchor="middle"
              >
                {conn.label}
              </text>
            )}
          </g>
        ))}
        {loopBack && (
          <g>
            <path d={generateLoopBackPath(loopBack)} fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="5,3" markerEnd="url(#arrowhead-loop)" />
            {loopBack.label && (
              <text
                x={(getConnectionPoints(loopBack.from, loopBack.to)?.from.x + getConnectionPoints(loopBack.from, loopBack.to)?.to.x) / 2}
                y={Math.max(getConnectionPoints(loopBack.from, loopBack.to)?.from.y || 0, getConnectionPoints(loopBack.from, loopBack.to)?.to.y || 0) + 75}
                fill="#f97316" fontSize="9" textAnchor="middle"
              >
                {loopBack.label}
              </text>
            )}
          </g>
        )}
      </svg>

      {nodes.map((node) => {
        const config = nodeTypes[node.type] || nodeTypes.action;
        const Icon = config.icon;
        const isSmall = config.size === 'small';
        const isMedium = config.size === 'medium';
        const isDecisionNode = node.type === 'decide' || node.type === 'decision' || node.type === 'human_checkpoint';
        const hasAutonomyConfig = stateHierarchies[node.id];

        return (
          <div
            key={node.id}
            onClick={() => onNodeClick?.(node)}
            className={`absolute flex items-center justify-center gap-0.5 px-2 py-1 bg-darker transition-all ${
              isSmall ? 'rounded-full flex-row gap-1' : 'rounded-lg flex-col'
            } ${isDecisionNode ? 'cursor-pointer' : 'cursor-default'} ${
              hasAutonomyConfig ? 'outline outline-2 outline-lime-brand outline-offset-2' : ''
            }`}
            style={{
              left: node.position.x,
              top: node.position.y,
              width: config.width,
              height: config.height,
              border: `2px solid ${config.color}`,
              boxShadow: isDecisionNode
                ? `0 0 15px ${config.color}50, 0 0 30px ${hasAutonomyConfig ? '#cbfd0040' : 'transparent'}`
                : `0 0 10px ${config.color}30`,
            }}
          >
            <Icon size={isSmall ? 12 : isMedium ? 14 : 16} color={config.color} />
            <span
              className={`text-gray-50 font-semibold text-center leading-tight overflow-hidden text-ellipsis ${
                isSmall ? 'text-[0.55rem]' : isMedium ? 'text-[0.65rem]' : 'text-[0.7rem]'
              }`}
              style={{ maxWidth: config.width - 16 }}
            >
              {node.label}
            </span>
            {/* Autonomy indicator badge */}
            {isDecisionNode && (
              <div
                className={`absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full border-2 border-darker flex items-center justify-center ${
                  hasAutonomyConfig ? 'bg-lime-brand' : 'bg-gray-700'
                }`}
              >
                <Layers size={8} color={hasAutonomyConfig ? '#000' : '#6b7280'} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FlowCanvas;
