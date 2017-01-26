const PlayerControls = ({
  onNext, onPrevious, onToggle, onTogglePlayer,
  isPlaying, isPlayerMinimized
}) => {
  const play = isPlaying ? '⏸' : '⏵'
  const togglePlayer = isPlayerMinimized ? '⏶' : '⏷'
  return (
    <div class='player-controls-container'>
      <ul class='player-controls-list'>
        <ul class='player-controls'>
          <li>
            <button class='control' onClick={onPrevious}>&#x23ea;</button>
          </li>

          <li>
            <button class='control' onClick={onToggle}>{play}</button>
          </li>

          <li>
            <button class='control' onClick={onNext}>&#x23e9;</button>
          </li>
        </ul>

        <div>
          <button class='control' onClick={onTogglePlayer}>
            {togglePlayer}
          </button>
        </div>
      </ul>
    </div>
  )
}

export default PlayerControls
