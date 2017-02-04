const PlayerControls = ({
  onNext, onPrevious, onToggle, isPlaying, isPlayerMinimized, onTogglePlayer
}) => {
  const play = isPlaying ? '⏸' : '⏵'
  const togglePlayer = '⏶'
  const toggleVisibility = isPlayerMinimized ? '' : 'flip'
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

        <div class='player-toggle'>
          <button class={`control`}
            onClick={onTogglePlayer}>
            <label class={`control-toggle ${toggleVisibility}`}>
              {togglePlayer}
            </label>
          </button>
        </div>

      </ul>
    </div>
  )
}

export default PlayerControls
