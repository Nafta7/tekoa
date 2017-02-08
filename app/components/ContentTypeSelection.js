import Inferno from 'inferno'
import ContentType from '../constants/ContentType'

const ContentTypeSelection = ({ onContentTypeClick, selectedType }) => {
  let btnPlaylistClasses, btnChannelClasses
  btnPlaylistClasses = ['button', 'selection']
  btnChannelClasses = ['button', 'selection']
  if (selectedType === ContentType.PLAYLIST) btnPlaylistClasses.push('active')
  else if (selectedType === ContentType.CHANNEL) btnChannelClasses.push('active')

  return (
    <div class='content-type-selection'>
      <button type='button' class={btnPlaylistClasses.join(' ')}
        onClick={onContentTypeClick.bind(null, ContentType.PLAYLIST)}>
        Playlist
      </button>

      <button type='button' class={btnChannelClasses.join(' ')}
        onClick={onContentTypeClick.bind(null, ContentType.CHANNEL)}>
        Channel
      </button>
    </div>
  )
}

export default ContentTypeSelection
