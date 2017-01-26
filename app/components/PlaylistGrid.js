import Inferno from 'inferno'
import PlaylistItem from './PlaylistItem'

const PlaylistGrid = ({ items, isVisible, onItemClick }) => {
  const gridVisibility = 'show'
  return (
    <div class={`content-main ${gridVisibility} flat-scroll`}>
        {items.map(item => {
          return (
            <PlaylistItem
              id={item.id}
              title={item.title}
              thumbnails={item.thumbnails}
              onClick={onItemClick}
            />
          )
        })}
    </div>
  )
}

export default PlaylistGrid
