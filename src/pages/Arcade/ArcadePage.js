import React, { useState } from 'react';
import './ArcadePage.css';

const PASSCODE = '123456';

const GAMES = [
  { id: 'chess', name: 'Chess Online', icon: '♟', description: 'Cờ vua online P2P', src: '/games/chess.html' },
];

function ArcadePage() {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [activeGame, setActiveGame] = useState(null);

  const handleUnlock = () => {
    if (code === PASSCODE) {
      setUnlocked(true);
      setError('');
    } else {
      setError('Sai mã truy cập!');
      setCode('');
    }
  };

  if (!unlocked) {
    return (
      <div className="arcade-lock">
        <div className="arcade-lock-card">
          <div className="arcade-lock-icon">🔒</div>
          <h2>Khu vực hạn chế</h2>
          <p>Nhập mã truy cập để tiếp tục</p>
          <input
            type="password"
            className="arcade-lock-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleUnlock(); }}
            placeholder="Nhập mã..."
            autoFocus
          />
          {error && <div className="arcade-lock-error">{error}</div>}
          <button className="arcade-lock-btn" onClick={handleUnlock}>
            Mở khóa
          </button>
        </div>
      </div>
    );
  }

  if (activeGame) {
    return (
      <div className="arcade-game-view">
        <div className="arcade-game-header">
          <button className="arcade-back-btn" onClick={() => setActiveGame(null)}>
            ← Quay lại
          </button>
          <span className="arcade-game-title">{activeGame.icon} {activeGame.name}</span>
        </div>
        <iframe
          className="arcade-iframe"
          src={activeGame.src}
          title={activeGame.name}
        />
      </div>
    );
  }

  return (
    <>
      <header className="page-header">
        <h1>Arcade</h1>
        <p className="page-subtitle">Khu vui chơi giải trí</p>
      </header>

      <div className="arcade-grid">
        {GAMES.map((game) => (
          <button
            key={game.id}
            className="arcade-card"
            onClick={() => setActiveGame(game)}
          >
            <div className="arcade-card-icon">{game.icon}</div>
            <div className="arcade-card-info">
              <div className="arcade-card-name">{game.name}</div>
              <div className="arcade-card-desc">{game.description}</div>
            </div>
          </button>
        ))}

        <div className="arcade-card arcade-card-coming">
          <div className="arcade-card-icon">🎮</div>
          <div className="arcade-card-info">
            <div className="arcade-card-name">Coming soon...</div>
            <div className="arcade-card-desc">Thêm game sắp ra mắt</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ArcadePage;
