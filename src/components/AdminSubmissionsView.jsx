/**
 * Admin Submissions View
 *
 * Read-only view of all SavedConfiguration rows from Supabase.
 * Shows who saved what during demos — useful for team review.
 */

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ClipboardList } from 'lucide-react';
import { supabase } from '../auth/supabaseClient';

const AdminSubmissionsView = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('SavedConfiguration')
        .select('id, name, submittedBy, configData, createdAt')
        .order('createdAt', { ascending: false });

      if (fetchError) throw fetchError;
      setSubmissions(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getCapabilityCount = (configData) => {
    if (!configData || !configData.slots) return 0;
    return Object.values(configData.slots).flat().filter(Boolean).length;
  };

  return (
    <div className="card-accent">
      {/* Header */}
      <div className="flex justify-between items-center mb-lg">
        <div>
          <h2 className="section-title">Submissions</h2>
          <p className="section-subtitle">
            All saved configurations — {loading ? '…' : `${submissions.length} submission${submissions.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!loading && (
            <div className="stat-card" style={{ padding: '8px 16px' }}>
              <div className="stat-value" style={{ fontSize: '20px' }}>{submissions.length}</div>
              <div className="stat-label">Total</div>
            </div>
          )}
          <button
            onClick={fetchSubmissions}
            disabled={loading}
            className="flex items-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 bg-transparent text-lime-brand border border-lime-brand/50 hover:bg-lime-brand/10 hover:border-lime-brand disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="card-inner p-10 text-center">
          <RefreshCw size={24} className="mx-auto mb-3 animate-spin text-lime-brand opacity-60" />
          <p className="text-gray-500 text-sm">Loading submissions…</p>
        </div>
      ) : error ? (
        <div className="card-inner p-8 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={fetchSubmissions}
            className="mt-3 text-xs text-lime-brand underline cursor-pointer"
          >
            Try again
          </button>
        </div>
      ) : submissions.length === 0 ? (
        <div className="card-inner p-10 text-center">
          <ClipboardList size={28} className="mx-auto mb-2 opacity-30 text-gray-500" />
          <p className="text-gray-500 text-sm">No submissions yet</p>
        </div>
      ) : (
        <div className="card-inner" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.4)' }}>
                {['Saved By', 'Config Name', 'Hull', 'Capabilities', 'Saved At'].map(col => (
                  <th
                    key={col}
                    style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontSize: '10px',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#6b7280',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {submissions.map((row, idx) => {
                const capCount = getCapabilityCount(row.configData);
                return (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: idx < submissions.length - 1
                        ? '1px solid rgba(75, 85, 99, 0.25)'
                        : 'none',
                      backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <span className="text-lime-brand text-sm font-semibold">
                        {row.submittedBy || 'Anonymous'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="text-gray-200 text-sm">
                        {row.name || 'Untitled'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="text-gray-300 text-sm">
                        {row.configData?.hullName || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        className="text-xs font-semibold px-2 py-1 rounded-md"
                        style={{
                          backgroundColor: capCount > 0 ? 'rgba(132, 204, 22, 0.1)' : 'rgba(75, 85, 99, 0.2)',
                          color: capCount > 0 ? '#84cc16' : '#6b7280',
                          border: capCount > 0 ? '1px solid rgba(132, 204, 22, 0.25)' : '1px solid rgba(75, 85, 99, 0.3)',
                        }}
                      >
                        {capCount} {capCount === 1 ? 'capability' : 'capabilities'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="text-gray-400 text-xs">
                        {formatDate(row.createdAt)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminSubmissionsView;
