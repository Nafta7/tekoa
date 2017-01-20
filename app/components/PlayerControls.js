const PlayerControls = ({ onNext, onPrevious, onToggle, isPlaying }) => {
  const play = isPlaying ? '⏸' : '⏵'
  return (
    <div class='player-controls-container'>
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
    </div>
  )
}

export default PlayerControls
