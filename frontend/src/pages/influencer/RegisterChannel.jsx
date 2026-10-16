import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { showToast } from '../../components/common/Toast';
import {
  Video as Youtube,
  Mail,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  CircularProgress,
  MenuItem,
  Card,
  CardContent,
  Chip
} from '@mui/material';

const CATEGORIES = [
  'Technology',
  'Fashion',
  'Fitness',
  'Gaming',
  'Food',
  'Finance',
  'Beauty',
  'Lifestyle',
  'Travel',
  'Automobile',
  'Health',
  'Parenting',
  'General'
];

const RegisterChannel = () => {
  const { user, role } = useAuth();
  const [channelInput, setChannelInput] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [category, setCategory] = useState('Technology');
  const [showEmailPublicly, setShowEmailPublicly] = useState(true);

  const [previewChannel, setPreviewChannel] = useState(null);
  const [fetchingPreview, setFetchingPreview] = useState(false);
  const [previewError, setPreviewError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [currentRegistration, setCurrentRegistration] = useState(null);
  const [retrying, setRetrying] = useState(false);

  const pollingRef = useRef(null);

  useEffect(() => {
    const raw = (channelInput || '').trim();
    if (!raw || raw.length < 3) {
      setPreviewChannel(null);
      setPreviewError('');
      return;
    }

    const timer = setTimeout(async () => {
      setFetchingPreview(true);
      setPreviewError('');
      try {
        const res = await api.get(`/channels/preview?input=${encodeURIComponent(raw)}`);
        if (res.data?.success && res.data.channel) {
          const ch = res.data.channel;
          setPreviewChannel(ch);
          setPreviewError('');
          if (ch.category) {
            const matched = CATEGORIES.find(c => c.toLowerCase() === ch.category.toLowerCase());
            if (matched) setCategory(matched);
          }
        } else {
          setPreviewError('Channel not found on YouTube.');
        }
      } catch (err) {
        setPreviewError(err.response?.data?.detail || 'Could not fetch YouTube preview.');
      } finally {
        setFetchingPreview(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [channelInput]);

  const fetchCurrentRegistration = async () => {
    try {
      const res = await api.get('/channels/my-registration');
      if (res.data?.success && res.data.latest) {
        setCurrentRegistration(res.data.latest);
        return res.data.latest;
      }
    } catch (err) {
      console.warn('Could not fetch registration status:', err.message);
    } finally {
      setLoadingInitial(false);
    }
    return null;
  };

  useEffect(() => {
    if (user?.email && !contactEmail) {
      setContactEmail(user.email);
    }
    fetchCurrentRegistration();
  }, [user]);

  // Polling hook when status is pending or processing
  useEffect(() => {
    const isOngoing =
      currentRegistration?.ingestion_status === 'pending' ||
      currentRegistration?.ingestion_status === 'processing';

    if (isOngoing) {
      pollingRef.current = setInterval(async () => {
        const latest = await fetchCurrentRegistration();
        if (latest && (latest.ingestion_status === 'done' || latest.ingestion_status === 'failed')) {
          clearInterval(pollingRef.current);
          if (latest.ingestion_status === 'done') {
            showToast('Channel successfully ingested and indexed!', 'success');
          } else {
            showToast('Channel ingestion encountered an issue.', 'error');
          }
        }
      }, 3500);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [currentRegistration?.ingestion_status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!channelInput.trim()) {
      showToast('Please enter your YouTube Channel ID or handle URL.', 'error');
      return;
    }
    if (!contactEmail.trim()) {
      showToast('Please enter your contact email address.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/channels/register', {
        youtube_channel_id: channelInput.trim(),
        contact_email: contactEmail.trim().toLowerCase(),
        category: category.toLowerCase(),
        show_email_publicly: showEmailPublicly
      });

      if (res.data?.success) {
        showToast(res.data.message || 'Channel registered successfully!', 'success');
        await fetchCurrentRegistration();
      }
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || 'Registration failed.';
      showToast(detail, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = async () => {
    if (!currentRegistration?.youtube_channel_id) return;
    setRetrying(true);
    try {
      const res = await api.post(
        `/channels/retry-ingestion?channel_id=${encodeURIComponent(currentRegistration.youtube_channel_id)}`
      );
      if (res.data?.success) {
        showToast('Ingestion retry started.', 'info');
        await fetchCurrentRegistration();
      }
    } catch (err) {
      showToast(err.response?.data?.detail || 'Retry failed.', 'error');
    } finally {
      setRetrying(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'done':
        return (
          <Chip
            icon={<CheckCircle2 size={16} />}
            label="Verified & Ingested"
            color="success"
            sx={{ fontWeight: 700 }}
          />
        );
      case 'processing':
        return (
          <Chip
            icon={<CircularProgress size={14} color="inherit" />}
            label="Processing AI Ingestion..."
            color="info"
            sx={{ fontWeight: 700 }}
          />
        );
      case 'pending':
        return (
          <Chip
            icon={<Clock size={16} />}
            label="Pending Ingestion"
            color="warning"
            sx={{ fontWeight: 700 }}
          />
        );
      case 'failed':
        return (
          <Chip
            icon={<AlertCircle size={16} />}
            label="Ingestion Failed"
            color="error"
            sx={{ fontWeight: 700 }}
          />
        );
      default:
        return null;
    }
  };

  if (loadingInitial) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '800px', mx: 'auto', p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 1
          }}
        >
          <Youtube style={{ color: '#EF4444' }} size={34} />
          Register Your Channel
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--text-secondary)' }}>
          Connect your YouTube channel to participate in InfluenceAI's matching engine. Our pipeline
          ingests your latest videos, generates AI embeddings, and surfaces you to relevant brand campaigns.
        </Typography>
      </Box>

      {/* Active Registration Status Card (if channel exists) */}
      {currentRegistration && (
        <Card
          sx={{
            mb: 4,
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Registered Channel
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 1 }}>
                  {currentRegistration.channel_title || currentRegistration.youtube_channel_id}
                  <a
                    href={`https://www.youtube.com/channel/${currentRegistration.youtube_channel_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open on YouTube"
                    style={{ color: 'var(--text-secondary)', display: 'inline-flex' }}
                  >
                    <ExternalLink size={16} />
                  </a>
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                  Channel ID: <code>{currentRegistration.youtube_channel_id}</code> • Category: {currentRegistration.category}
                </Typography>
              </Box>
              {getStatusBadge(currentRegistration.ingestion_status)}
            </Box>

            {/* Ingestion Info */}
            <Box sx={{ backgroundColor: '#F8FAFC', p: 2, borderRadius: '8px', mt: 2 }}>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 0.5 }}>
                <strong>Contact Email:</strong> {currentRegistration.contact_email}{' '}
                {currentRegistration.show_email_publicly ? '(Visible to brands)' : '(Hidden)'}
              </Typography>
              {currentRegistration.last_synced_at && (
                <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block' }}>
                  Last AI sync: {new Date(currentRegistration.last_synced_at).toLocaleString()}
                </Typography>
              )}

              {/* Status details */}
              {currentRegistration.ingestion_status === 'processing' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5, color: '#0284C7' }}>
                  <CircularProgress size={16} color="inherit" />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Our pipeline is currently pulling your YouTube videos and computing semantic embeddings. This usually takes 10–20 seconds.
                  </Typography>
                </Box>
              )}

              {currentRegistration.ingestion_status === 'done' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, color: '#16A34A' }}>
                  <Sparkles size={18} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Your channel is actively indexed. Brands searching for {currentRegistration.category} creators will now see your profile and contact email!
                  </Typography>
                </Box>
              )}

              {currentRegistration.ingestion_status === 'failed' && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="body2" sx={{ color: '#DC2626', fontWeight: 600, mb: 1 }}>
                    Error: {currentRegistration.ingestion_error || 'Ingestion encountered an unexpected failure.'}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={retrying ? <CircularProgress size={14} color="inherit" /> : <RefreshCw size={14} />}
                    onClick={handleRetry}
                    disabled={retrying}
                  >
                    Retry Ingestion
                  </Button>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Registration Form */}
      <Card
        sx={{
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-premium)'
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Typography variant="h6" sx={{ fontFamily: 'var(--font-heading)', fontWeight: 700, mb: 2 }}>
            {currentRegistration ? 'Register Another or Update Channel' : 'Channel Details'}
          </Typography>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Channel Input */}
            <TextField
              label="YouTube Channel Identifier"
              placeholder="e.g. UC_gtN4lepSR1ebO2fKGd85g or https://youtube.com/@mkbhd"
              value={channelInput}
              onChange={(e) => setChannelInput(e.target.value)}
              helperText="Accepts full YouTube link (e.g. https://www.youtube.com/@AmitEdutec), custom @handle, or 24-character Channel ID."
              fullWidth
              required
            />

            {/* LIVE PREVIEW BOX */}
            {fetchingPreview && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, backgroundColor: '#F8FAFC', borderRadius: '8px', color: 'var(--primary-purple)' }}>
                <CircularProgress size={16} color="inherit" />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Connecting to YouTube and fetching channel details & profile photo...
                </Typography>
              </Box>
            )}

            {previewChannel && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  borderRadius: '10px',
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  flexWrap: 'wrap',
                  gap: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <img
                    src={previewChannel.thumbnail_url}
                    alt={previewChannel.channel_title}
                    referrerPolicy="no-referrer"
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #22C55E'
                    }}
                  />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {previewChannel.channel_title}
                      <CheckCircle2 size={16} color="#16A34A" />
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block' }}>
                      {previewChannel.custom_url || previewChannel.channel_id}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 600 }}>
                      {Number(previewChannel.subscriber_count || 0).toLocaleString('en-IN')} subscribers • {Number(previewChannel.video_count || 0)} videos
                    </Typography>
                  </Box>
                </Box>
                <Chip label="YouTube Profile Photo Verified" color="success" size="small" sx={{ fontWeight: 700 }} />
              </Box>
            )}

            {previewError && (
              <Box sx={{ p: 1.5, backgroundColor: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px' }}>
                <Typography variant="body2" sx={{ color: '#92400E', fontSize: '0.8rem' }}>
                  {previewError}
                </Typography>
              </Box>
            )}

            {/* Contact Email */}
            <TextField
              label="Contact Email for Brand Collabs"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              helperText="Prefilled from your account. Brands will use this email to reach out for sponsorships."
              fullWidth
              required
            />

            {/* Category */}
            <TextField
              select
              label="Primary Content Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              helperText="Select the niche that best represents your audience and content."
              fullWidth
            >
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>

            {/* Public Consent Checkbox */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={showEmailPublicly}
                  onChange={(e) => setShowEmailPublicly(e.target.checked)}
                  sx={{
                    color: 'var(--primary-purple)',
                    '&.Mui-checked': { color: 'var(--primary-purple)' }
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  Show my contact email publicly to brands when recommended in search results
                </Typography>
              }
            />

            {/* Ownership verification note */}
            <Box
              sx={{
                p: 2,
                borderRadius: '8px',
                backgroundColor: 'rgba(99, 102, 241, 0.06)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                display: 'flex',
                gap: 1.5,
                alignItems: 'center'
              }}
            >
              <ShieldCheck size={20} style={{ color: 'var(--primary-purple)', flexShrink: 0 }} />
              <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                <strong>Creator Ownership:</strong> Registering your channel links your YouTube metrics to your InfluenceAI creator identity. Ingestion verifies public channel metadata in real-time.
              </Typography>
            </Box>

            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{
                backgroundColor: 'var(--primary-purple)',
                color: 'white',
                fontWeight: 700,
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': {
                  backgroundColor: '#6D28D9'
                }
              }}
            >
              {submitting ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  <span>Validating & Registering Channel...</span>
                </Box>
              ) : (
                'Register Channel & Start Ingestion'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterChannel;
