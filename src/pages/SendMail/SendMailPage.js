import React, { useState } from 'react';
import './SendMailPage.css';

function SendMailPage() {
  const [fromEmail, setFromEmail] = useState(() => localStorage.getItem('mail_from') || '');
  const [appPassword, setAppPassword] = useState(() => localStorage.getItem('mail_pass') || '');
  const [toEmail, setToEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleFromChange = (val) => {
    setFromEmail(val);
    localStorage.setItem('mail_from', val);
  };

  const handlePassChange = (val) => {
    setAppPassword(val);
    localStorage.setItem('mail_pass', val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('https://blog-api-v1.runasp.net/api/mail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromEmail, appPassword, toEmail, subject, body }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ type: 'success', message: data.message });
      } else {
        setResult({ type: 'error', message: data.message });
      }
    } catch (err) {
      setResult({ type: 'error', message: 'Cannot connect to Blog API at blog-api-v1.runasp.net' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="page-header">
        <h1>Send Email</h1>
        <p className="page-subtitle">Send email via Gmail SMTP</p>
      </header>

      <div className="mail-container">
        <div className="mail-card">
          {result && (
            <div className={`mail-alert ${result.type === 'success' ? 'mail-alert-success' : 'mail-alert-error'}`}>
              {result.message}
              <button className="mail-alert-close" onClick={() => setResult(null)}>&times;</button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mail-sender-section">
              <h4 className="mail-section-title">Sender</h4>
              <div className="mail-row-2col">
                <div className="mail-field">
                  <label>Gmail</label>
                  <input
                    type="email"
                    value={fromEmail}
                    onChange={(e) => handleFromChange(e.target.value)}
                    placeholder="your-email@gmail.com"
                    required
                  />
                </div>
                <div className="mail-field">
                  <label>App Password</label>
                  <div className="mail-password-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={appPassword}
                      onChange={(e) => handlePassChange(e.target.value)}
                      placeholder="xxxx xxxx xxxx xxxx"
                      required
                    />
                    <button
                      type="button"
                      className="mail-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mail-compose-section">
              <h4 className="mail-section-title">Compose</h4>
              <div className="mail-field">
                <label>To</label>
                <input
                  type="email"
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  required
                />
              </div>

              <div className="mail-field">
                <label>Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject"
                  required
                />
              </div>

              <div className="mail-field">
                <label>Body <span className="mail-hint">(HTML supported)</span></label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your email content here..."
                  rows={10}
                  required
                />
              </div>
            </div>

            <div className="mail-actions">
              <button type="submit" className="mail-btn-send" disabled={loading}>
                {loading ? 'Sending...' : 'Send Email'}
              </button>
              <button
                type="button"
                className="mail-btn-reset"
                onClick={() => { setToEmail(''); setSubject(''); setBody(''); setResult(null); }}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        <div className="mail-preview-card">
          <div className="mail-preview-header">
            <h3>Preview</h3>
            <div className="mail-preview-meta">
              <span><strong>From:</strong> {fromEmail || '...'}</span>
              <span><strong>To:</strong> {toEmail || '...'}</span>
              <span><strong>Subject:</strong> {subject || '...'}</span>
            </div>
          </div>
          <div className="mail-preview-body" dangerouslySetInnerHTML={{ __html: body || '<span class="mail-placeholder">Email content will appear here...</span>' }} />
        </div>
      </div>
    </>
  );
}

export default SendMailPage;
