import Inferno from 'inferno'
import ContentType from '../constants/ContentType'

const SearchBar = ({ onInput, onSubmit, onContentTypeClick, selectedType }) => {

  let btnPlaylistClasses, btnChannelClasses
  btnPlaylistClasses = ['button', 'button-selection']
  btnChannelClasses = ['button', 'button-selection']
  if (selectedType === ContentType.PLAYLIST) btnPlaylistClasses.push('active')
  else if (selectedType === ContentType.CHANNEL) btnChannelClasses.push('active')

  return (
    <div class='header'>
      <form className='menu-bar' onSubmit={onSubmit}>
        <input className='input' type='text'
          placeholder={`Type a ${selectedType} name`}
          onInput={onInput}
        />
        <button class='button' type='submit'>Search</button>
      </form>
      <div class='content-type-container '>
        <button type='button' class={btnPlaylistClasses.join(' ')}
          onClick={onContentTypeClick.bind(null, ContentType.PLAYLIST)}
        >
          Playlist
        </button>


        <button type='button' class={btnChannelClasses.join(' ')}
          onClick={onContentTypeClick.bind(null, ContentType.CHANNEL)}
        >
          Channel
        </button>
      </div>
    </div>
  )
}

export default SearchBar
