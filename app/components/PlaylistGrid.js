import Inferno from 'inferno'
import PlaylistItem from './PlaylistItem'

const PlaylistGrid = ({ items, isVisible, onItemClick, onPlaylistsClick, viewType }) => {
  const gridVisibility = 'show'
  return (
    <div class={`content-main ${gridVisibility} flat-scroll`}>
        {items.map(item => {
          return (
            <PlaylistItem
              id={item.id}
              channelId={item.channelId}
              title={item.title}
              thumbnails={item.thumbnails}
              onClick={onItemClick}
              viewType={viewType}
              onPlaylistsClick={onPlaylistsClick}
            />
          )
        })}
    </div>
  )
}

export default PlaylistGrid
