import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Tooltip } from '@mui/material';

const ScoreBreakdown = ({ semantic = 90, audience = 90, budget = 90, engagement = 90, graph = 90, final = 92 }) => {
  const parameters = [
    {
      label: 'Semantic Relevance',
      value: semantic,
      color: '#A855F7', // Purple
      tooltip: 'Measures structural content overlap between campaign requirements and creator bios using Sentence-BERT embeddings.'
    },
    {
      label: 'Audience Overlap',
      value: audience,
      color: '#3B82F6', // Blue
      tooltip: 'Calculates the age, gender, and language demographic overlap between the target audience and creator channels.'
    },
    {
      label: 'Budget Compatibility',
      value: budget,
      color: '#10B981', // Green
      tooltip: 'Measures alignment between the campaign sponsorship budget and creator estimated rate cards.'
    },
    {
      label: 'Engagement Fit',
      value: engagement,
      color: '#F59E0B', // Orange
      tooltip: 'Based on historical viewership retention, video interaction rate, and user comments feedback patterns.'
    },
    {
      label: 'Graph Centrality',
      value: graph,
      color: '#06B6D4', // Cyan
      tooltip: 'Measures the creator\'s influence inside the social network graph using PageRank and betweenness centrality.'
    }
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        backgroundColor: '#F8FAFC',
        borderRadius: 'var(--border-radius-lg)',
        padding: '20px',
        border: '1px dashed #E2E8F0',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '12px',
        }}
      >
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          ✨ Explainable AI Suitability Breakdown
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Overall Score:</span>
          <span
            style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: 'var(--primary-purple)',
            }}
          >
            {final}%
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {parameters.map((param) => (
          <div key={param.label}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  {param.label}
                </span>
                <Tooltip title={param.tooltip} arrow placement="top">
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'var(--text-light)',
                      cursor: 'pointer',
                    }}
                  >
                    <HelpCircle size={13} />
                  </span>
                </Tooltip>
              </div>
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
              >
                {param.value}%
              </span>
            </div>

            {/* Custom Premium Progress Bar */}
            <div
              style={{
                height: '8px',
                width: '100%',
                backgroundColor: '#E2E8F0',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${param.value}%`,
                  backgroundColor: param.color,
                  borderRadius: '4px',
                  transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScoreBreakdown;
