import Inferno from 'inferno'

const Results = ({ items, onItemClick, isVisible }) => {
  const resultsClasses = isVisible ? 'show' : ''
  return (
    <div className={`results ${resultsClasses} flat-scroll`}>
      {items.map(item => {
        return (
          <Item
            id={item.id}
            snippet={item.snippet}
            onClick={onItemClick}
          />
        )
      })}
    </div>
  )
}

const Item = ({ id, snippet, onClick }) => {
  return (
    <a href="#" onClick={e => onClick(e, id)}>
      <div>
        <img src={snippet.thumbnails.default.url} />
        <h2> {snippet.channelTitle} </h2>
      </div>
    </a>
  )
}


export default Results
