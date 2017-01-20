const Player = ({ isVisible }) => {
  const playerClasses = isVisible ? 'show' : ''
  return (
    <div class={`player ${playerClasses}`}>
      <div className={`player-container`}>
        <div id="video-player">
        </div>
      </div>
    </div>
  )
}

export default Player
