import Inferno from 'inferno'
import ChannelItem from './ChannelItem'

const ChannelGrid = ({ items, hasMoreResults,
  onItemClick, onPlaylistsClick, onLoadMore
}) => {
  const gridVisibility = 'show'
  return (
    <div class={`main flat-scroll`}>
      <div class={`content`}>
        {items.map(item => {
          return (
            <ChannelItem
              id={item.id}
              title={item.title}
              thumbnails={item.thumbnails}
              onClick={onItemClick}
              onPlaylistsClick={onPlaylistsClick}
            />
          )
        })}
      </div>
      <div class='align-center'>
        <button class='button' disabled={!hasMoreResults()}
          onClick={onLoadMore}>Load more</button>
      </div>
    </div>
  )
}

export default ChannelGrid
