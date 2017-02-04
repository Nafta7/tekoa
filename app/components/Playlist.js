import Inferno from 'inferno'

const Playlist = ({ vids, currentItem, isVisible, onVideoClick }) => {
  const playlistVisibility = isVisible ? 'show' : ''
  return (
    <ul class={`playlist flat-scroll ${playlistVisibility}`}>
      {vids.map((vid, index) => {
        let isActive = currentItem === index
        return (
          <Item
            videoId={vid.videoId}
            title={vid.title}
            index={index}
            isActive={isActive}
            onClick={onVideoClick}
          />
      )
      })}
    </ul>
  )
}

const Item = ({ title, videoId, index, isActive, onClick }) => {
  const itemClasses = isActive ? 'active' : ''
  return (
    <li className={itemClasses} onClick={() => onClick(videoId, index)}>
      {title}
    </li>
  )
}

export default Playlist
