import Inferno from 'inferno'
import ContentType from '../constants/ContentType'

const ChannelItem = ({ id, title, thumbnails, onClick, onPlaylistsClick }) => {
  let maxLength = 20
  title = title.length > maxLength
    ? title.substring(0, 20).concat('...')
    : title
  return (

      <div class='content-item'>
        <a href="#" onClick={e => onClick(e, id)}>
          <img src={thumbnails.high.url} />
        </a>
        <div class='content-item-details'>
          <h2 class='content-item-title'> {title} </h2>
          <button class='button button-small'
            onClick={onPlaylistsClick.bind(null, id, ContentType.CHANNEL)}
          >
            Playlists
          </button>
        </div>
      </div>

  )
}

export default ChannelItem
