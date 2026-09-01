import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { influencerService } from '../../services/influencerService';
import { showToast } from '../../components/common/Toast';
import { Network, ArrowLeft, Info, HelpCircle, Award, Share2, Radio } from 'lucide-react';
import { Tooltip } from '@mui/material';

const GraphAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [influencer, setInfluencer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState(null);

  useEffect(() => {
    const loadCreator = async () => {
      setLoading(true);
      const data = await influencerService.getInfluencerById(id);
      if (data) {
        setInfluencer(data);
      } else {
        showToast('Creator details not found.', 'error');
        navigate('/company/recommendations');
      }
      setLoading(false);
    };
    loadCreator();
  }, [id, navigate]);

  if (loading || !influencer) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary-purple)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px auto' }} />
        <span>Initializing Network Analytics...</span>
      </div>
    );
  }

  // Set up nodes coordinates inside 600x400 SVG
  const centerNode = { x: 300, y: 200, label: influencer.name, type: 'creator', avatar: influencer.avatar, r: 28 };
  
  const connectedNodes = [
    { id: 'n1', x: 120, y: 120, label: influencer.category, type: 'category', details: 'Content Niche Cluster', col: '#A855F7', r: 20 },
    { id: 'n2', x: 480, y: 120, label: influencer.collaborators[0] || 'Collaborator 1', type: 'collaborator', details: 'Connected Creator Node', col: '#3B82F6', r: 22 },
    { id: 'n3', x: 480, y: 280, label: influencer.collaborators[1] || 'Collaborator 2', type: 'collaborator', details: 'Connected Creator Node', col: '#3B82F6', r: 22 },
    { id: 'n4', x: 120, y: 280, label: 'Gen-Z Audience', type: 'audience', details: 'High overlap (18-24 yrs)', col: '#F59E0B', r: 20 },
    { id: 'n5', x: 300, y: 60, label: influencer.state, type: 'location', details: 'Regional Hub Cluster', col: '#06B6D4', r: 18 },
    { id: 'n6', x: 300, y: 340, label: influencer.platform, type: 'platform', details: 'Primary Distribution platform', col: '#EF4444', r: 18 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '50px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => navigate(`/company/influencers/${influencer.id}`)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: 'none',
            background: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Profile Overview</span>
        </button>
      </div>

      <PageHeader
        title={`Graph Intelligence: ${influencer.name}`}
        subtitle={`Topological network centrality mapping showing collaborator nodes & niche clusters.`}
        icon={<Network size={22} />}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }} className="graph-split">
        
        {/* Graph Canvas Panel */}
        <div
          style={{
            backgroundColor: '#0F172A', // Premium dark node canvas
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '30px',
            boxShadow: 'var(--shadow-premium)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '440px',
            overflow: 'hidden'
          }}
        >
          {/* Canvas Title Overlay */}
          <div style={{ position: 'absolute', top: '16px', left: '20px', color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Radio size={12} color="#10B981" />
            <span>INTERACTIVE CENTRALITY GRAPH CANVAS</span>
          </div>

          <svg width="100%" height="380" viewBox="0 0 600 400" style={{ maxWidth: '600px' }}>
            {/* Draw Links/Edges */}
            {connectedNodes.map((n) => (
              <g key={`link-${n.id}`}>
                <line
                  x1={centerNode.x}
                  y1={centerNode.y}
                  x2={n.x}
                  y2={n.y}
                  stroke="rgba(124, 58, 237, 0.4)"
                  strokeWidth="2"
                  className="graph-link"
                />
              </g>
            ))}

            {/* Draw Surrounding Nodes */}
            {connectedNodes.map((n) => (
              <g
                key={n.id}
                className="graph-node"
                onMouseEnter={() => setHoveredNode(n)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <circle cx={n.x} cy={n.y} r={n.r} fill={n.col} opacity="0.85" />
                <circle cx={n.x} cy={n.y} r={n.r + 4} stroke={n.col} strokeWidth="1.5" fill="none" opacity="0.3" />
                <text
                  x={n.x}
                  y={n.y + n.r + 14}
                  textAnchor="middle"
                  fill="#E2E8F0"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="var(--font-heading)"
                >
                  {n.label}
                </text>
              </g>
            ))}

            {/* Draw Center Node (Creator) */}
            <g
              className="graph-node"
              onMouseEnter={() =>
                setHoveredNode({
                  label: centerNode.label,
                  details: 'Center Node (Target Creator)',
                  type: 'creator'
                })
              }
              onMouseLeave={() => setHoveredNode(null)}
            >
              <defs>
                <clipPath id="avatar-clip">
                  <circle cx={centerNode.x} cy={centerNode.y} r={centerNode.r} />
                </clipPath>
              </defs>
              {/* Outer glowing ring */}
              <circle
                cx={centerNode.x}
                cy={centerNode.y}
                r={centerNode.r + 6}
                stroke="var(--primary-purple)"
                strokeWidth="2"
                fill="none"
              />
              <circle
                cx={centerNode.x}
                cy={centerNode.y}
                r={centerNode.r}
                fill="#1E293B"
              />
              <image
                href={centerNode.avatar}
                x={centerNode.x - centerNode.r}
                y={centerNode.y - centerNode.r}
                width={centerNode.r * 2}
                height={centerNode.r * 2}
                clipPath="url(#avatar-clip)"
              />
            </g>
          </svg>

          {/* Node Info Overlay details */}
            {hoveredNode && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '0.75rem',
                  maxWidth: '220px',
                  pointerEvents: 'none',
                  animation: 'fadeIn 0.15s ease-out forwards',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--primary-purple)' }}>{hoveredNode.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>{hoveredNode.details}</div>
              </div>
            )}
          </div>

        {/* Centrality Metrics Panel */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 'var(--border-radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', marginBottom: '4px' }}>
              Centrality Metrics Breakdown
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.3 }}>
              Calculated using the NetworkX graph library on collaborator adjacency matrices.
            </p>
          </div>

          {/* Centrality Metrics List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* PageRank */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>PageRank Centrality</span>
                  <Tooltip title="Measures node prestige based on link connections from other high-prestige creators in the adjacency matrix." arrow>
                    <span style={{ color: 'var(--text-light)', cursor: 'pointer', display: 'flex' }}><HelpCircle size={14} /></span>
                  </Tooltip>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Prestigious connectivity score</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-purple)', display: 'block' }}>
                  {influencer.pageRank || 0.085}
                </span>
                <span style={{ fontSize: '0.68rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary-purple)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  Top 3%
                </span>
              </div>
            </div>

            {/* Betweenness Centrality */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Betweenness Centrality</span>
                  <Tooltip title="Measures how often a creator acts as a bridge between separate communities (e.g. bridging tech and fashion)." arrow>
                    <span style={{ color: 'var(--text-light)', cursor: 'pointer', display: 'flex' }}><HelpCircle size={14} /></span>
                  </Tooltip>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Broker / connection capacity</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-blue)', display: 'block' }}>
                  {influencer.betweennessCentrality || 0.76}
                </span>
                <span style={{ fontSize: '0.68rem', backgroundColor: 'rgba(59, 130, 246, 0.08)', color: 'var(--accent-blue)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  High Bridge
                </span>
              </div>
            </div>

            {/* Closeness Centrality */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Closeness Centrality</span>
                  <Tooltip title="Measures distance of creator to all other nodes in the network, representing speed of spread." arrow>
                    <span style={{ color: 'var(--text-light)', cursor: 'pointer', display: 'flex' }}><HelpCircle size={14} /></span>
                  </Tooltip>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Reach speed index</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-green)', display: 'block' }}>
                  {influencer.closenessCentrality || 0.81}
                </span>
                <span style={{ fontSize: '0.68rem', backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'var(--accent-green)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  Fast Spread
                </span>
              </div>
            </div>

            {/* Network Connections count */}
            <div style={{ display: 'flex', alignItems: 'center', justifyCenter: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Degree Connections</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Direct adjacency collaborator links</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block' }}>
                  {influencer.collaborators.length + 3} nodes
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 960px) {
          .graph-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default GraphAnalytics;
