import Inferno from 'inferno'
import PlaylistItem from './PlaylistItem'

const PlaylistGrid = ({ items, isVisible, viewType, hasMoreResults,
  onItemClick, onPlaylistsClick, onLoadMore
}) => {
  const gridVisibility = 'show'
  return (
      <div class={`main flat-scroll`}>
        <div class={`content`}>
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
        <div class='align-center'>
          <button class='button minor' disabled={!hasMoreResults()}
            onClick={onLoadMore}>Load more</button>
        </div>
      </div>

  )
}

export default PlaylistGrid
