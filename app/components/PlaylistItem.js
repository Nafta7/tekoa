import Inferno from 'inferno'
import ContentType from '../constants/ContentType'

const PlaylistItem = ({ id, channelId, title, thumbnails,
  onClick, onPlaylistsClick, viewType
}) => {
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
          {
            (viewType === ContentType.PLAYLIST)
              ? <button class='button button-small'
                onClick={onPlaylistsClick.bind(null, channelId, ContentType.CHANNEL)}
              >
                Channel playlists
              </button>
              : <span></span>

          }

        </div>
      </div>

  )
}

export default PlaylistItem
