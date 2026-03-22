import './ReviewScreen.css';

interface ReviewScreenProps {
  revealedCharacters: string[];
  onQuickRestart: () => void;
  onNewGame: () => void;
}

export function ReviewScreen({
  revealedCharacters,
  onQuickRestart,
  onNewGame,
}: ReviewScreenProps) {
  return (
    <div className="review-screen">
      <h1 className="review-heading">Great Job!</h1>
      <p className="review-subheading">
        Here are all the characters you practiced today
      </p>

      {revealedCharacters.length > 0 ? (
        <div className="review-characters-grid">
          {revealedCharacters.map((char, index) => (
            <div key={`${char}-${index}`} className="review-character-card">
              <span className="review-character-text">{char}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="review-empty">No characters were revealed this game.</p>
      )}

      <div className="review-buttons">
        <button
          className="review-btn review-btn-restart"
          onClick={onQuickRestart}
        >
          Quick Restart
        </button>
        <button className="review-btn review-btn-new" onClick={onNewGame}>
          New Game
        </button>
      </div>
    </div>
  );
}
