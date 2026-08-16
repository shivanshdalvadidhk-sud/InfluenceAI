import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { campaignService } from '../../services/campaignService';
import { showToast } from '../../components/common/Toast';
import { Sparkles, ArrowRight, Layout, Sliders, CheckCircle2 } from 'lucide-react';
import { Slider } from '@mui/material';
import { INDIAN_STATES } from '../../data/mockData';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('Festive Tech & Lifestyle YouTube Launch 2026');
  const [budget, setBudget] = useState(250000);
  const [ageRange, setAgeRange] = useState([18, 35]);
  const [description, setDescription] = useState(
    'Sponsoring dedicated review videos and 60-second integrated segments with top Indian tech and lifestyle YouTubers to showcase our products.'
  );
  const [deliverables, setDeliverables] = useState(['Dedicated Video', 'Integrated Sponsor Segment']);
  const [category, setCategory] = useState('Technology');
  const [state, setState] = useState('Karnataka');
  const [gender, setGender] = useState('All');
  const [goal, setGoal] = useState('Brand Awareness');
  const [platform, setPlatform] = useState('YouTube');

  // Loading animation states
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingSteps = [
    'Initializing recommendation pipeline...',
    'Scraping candidate pools in India database...',
    'Filtering candidates by location & budget limits...',
    'Sentence-BERT analyzing campaign semantic relevance...',
    'Calculating PageRank and Betweenness Network scores...',
    'Running XGBoost suitability model & ranking candidates...'
  ];

  const handleDeliverableToggle = (d) => {
    if (deliverables.includes(d)) {
      setDeliverables(deliverables.filter((item) => item !== d));
    } else {
      setDeliverables([...deliverables, d]);
    }
  };

  const handleAgeChange = (event, newValue) => {
    setAgeRange(newValue);
  };

  const triggerAiPipeline = () => {
    setLoading(true);
    setLoadingStep(0);
    
    // Cycle through steps every 600ms
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= loadingSteps.length - 1) {
          clearInterval(interval);
          saveAndRedirect();
          return prev;
        }
        return prev + 1;
      });
    }, 700);
  };

  const saveAndRedirect = async () => {
    try {
      const newCamp = await campaignService.createCampaign({
        name,
        category,
        budget,
        description,
        deliverables,
        state,
        audienceGender: gender,
        audienceAgeRange: ageRange,
        goal,
        platform
      });
      
      showToast('AI Recommendations generated successfully!', 'success');
      setLoading(false);
      
      // Redirect to recommendations page, passing the campaign ID
      navigate(`/company/recommendations?campaign=${newCamp.id}`);
    } catch (err) {
      showToast('Error saving campaign.', 'error');
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!name || !budget || !description) {
      showToast('Please fill out all campaign core parameters.', 'error');
      return;
    }
    triggerAiPipeline();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '50px' }}>
      <PageHeader
        title="Create YouTube Campaign"
        subtitle="Configure target audience, parameters & budget to match with top YouTubers & channel creators."
        icon={<Layout size={22} />}
      />

      <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px' }} className="form-split">
          
          {/* Left card: Campaign Core details */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: 'var(--border-radius-lg)',
              border: '1px solid var(--border-color)',
              padding: '28px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-purple)' }} />
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
                Campaign Core Details
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Campaign Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Sponsorship Budget (₹) *</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>Enter positive numeric budget value in INR</span>
            </div>

            {/* Age range slider */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <label style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Target Viewer Age Range *</label>
                <span style={{ color: 'var(--primary-purple)', fontWeight: 700 }}>
                  {ageRange[0]} Years - {ageRange[1]} Years
                </span>
              </div>
              <div style={{ padding: '0 10px' }}>
                <Slider
                  value={ageRange}
                  onChange={handleAgeChange}
                  valueLabelDisplay="auto"
                  min={13}
                  max={65}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-light)' }}>
                <span>13 Years</span>
                <span>65 Years</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Campaign & Deliverables Description *</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem', fontFamily: 'var(--font-body)', resize: 'vertical' }}
              />
            </div>

            {/* Deliverables checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Sponsorship Deliverables</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {['Dedicated Video', 'Integrated Sponsor Segment', 'Short/Reel', 'Story', 'Product Review'].map((d) => {
                  const isChecked = deliverables.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleDeliverableToggle(d)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '20px',
                        border: isChecked ? 'none' : '1px solid var(--border-color)',
                        backgroundColor: isChecked ? 'var(--primary-light)' : 'white',
                        color: isChecked ? 'var(--primary-purple)' : 'var(--text-secondary)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right card: Channel Niche & target audience */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: 'var(--border-radius-lg)',
              border: '1px solid var(--border-color)',
              padding: '28px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)' }} />
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
                Channel Niche & Location
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Channel Niche / Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem', backgroundColor: 'white' }}
              >
                <option value="Technology">Technology</option>
                <option value="Fashion">Fashion & Lifestyle</option>
                <option value="Gaming">Gaming</option>
                <option value="Finance">Finance</option>
                <option value="Fitness">Fitness</option>
                <option value="Education">Education</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Food">Food</option>
                <option value="Travel">Travel</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Target Creator State / UT *</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem', backgroundColor: 'white' }}
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Audience Gender *</label>
              <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
                {['All', 'Male', 'Female'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    style={{
                      flex: 1,
                      border: 'none',
                      padding: '10px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      backgroundColor: gender === g ? 'white' : 'transparent',
                      color: gender === g ? 'var(--primary-purple)' : 'var(--text-secondary)',
                      boxShadow: gender === g ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Campaign Goal *</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.875rem', backgroundColor: 'white' }}
              >
                <option value="Brand Awareness">Brand Awareness</option>
                <option value="Product Launch">Product Launch</option>
                <option value="Lead Generation">Lead Generation</option>
                <option value="Sales">Sales Promotion</option>
                <option value="App Promotion">App Installs Promotion</option>
                <option value="Product Review">Product Deep Review</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Primary Platform</label>
              <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
                {['YouTube'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    style={{
                      flex: 1,
                      border: 'none',
                      padding: '10px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      backgroundColor: platform === p ? 'white' : 'transparent',
                      color: platform === p ? 'var(--primary-purple)' : 'var(--text-secondary)',
                      boxShadow: platform === p ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="button-gradient"
            style={{
              padding: '14px 32px',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>Generate AI Recommendations</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </form>

      {/* AI recommendation Processing Loading Modal Overlay */}
      {loading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)',
            fontFamily: 'var(--font-body)',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: 'var(--border-radius-lg)',
              padding: '40px 32px',
              maxWidth: '460px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            {/* Spinning visual wrapper */}
            <div style={{ position: 'relative', width: '80px', height: '80px' }}>
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: '6px solid var(--primary-light)',
                  borderTopColor: 'var(--primary-purple)',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '24px',
                }}
              >
                ✨
              </span>
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                AI Match Engine Active
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4 }}>
                Running recommendation pipeline. Reranking Indian creator nodes based on locations, budgets, and centrality scores.
              </p>
            </div>

            {/* Stepper items list */}
            <div
              style={{
                width: '100%',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                alignItems: 'flex-start',
              }}
            >
              {loadingSteps.map((step, idx) => {
                const isCompleted = loadingStep > idx;
                const isCurrent = loadingStep === idx;
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.78rem',
                      fontWeight: isCurrent || isCompleted ? 600 : 500,
                      color: isCompleted
                        ? 'var(--accent-green)'
                        : isCurrent
                        ? 'var(--primary-purple)'
                        : 'var(--text-light)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={14} />
                    ) : isCurrent ? (
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          border: '2px solid var(--primary-purple)',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 0.6s linear infinite',
                        }}
                      />
                    ) : (
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid var(--text-light)' }} />
                    )}
                    <span>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 960px) {
          .form-split {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CreateCampaign;
