import Inferno from 'inferno'

const SearchBar = ({ onInput, onSubmit, selectedType }) => {
  return (
    <form className='search-bar' onSubmit={onSubmit}>
      <input className='input search-bar-query' type='text'
        placeholder={`Type a ${selectedType} name`}
        onInput={onInput}
      />
      <button class='button minor search-bar-action' type='submit'>
        Search
      </button>
    </form>
  )
}

export default SearchBar
