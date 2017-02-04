const Player = ({ isMinimized }) => {
  const playerClasses = isMinimized ? 'minimize' : ''

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
