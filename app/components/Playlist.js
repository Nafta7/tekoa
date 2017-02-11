import Inferno from 'inferno'
import throttle from 'lodash.throttle'
import AppConstants from '../constants/AppConstants'

const Playlist = ({ vids, currentItem, isVisible, onVideoClick, onScroll }) => {
  const playlistVisibility = isVisible ? 'show' : ''
  return (
    <ul class={`playlist flat-scroll ${playlistVisibility}`}
      onScroll={throttle(onScroll, AppConstants.THROTTLE_TIME_MS)}>
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
