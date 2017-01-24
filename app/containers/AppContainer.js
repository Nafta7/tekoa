import Inferno from 'inferno'
import Component from 'inferno-component'
import SearchBar from '../components/SearchBar'
import Player from '../components/Player'
import Results from '../components/Results'
import Playlist from '../components/Playlist'
import PlayerControls from '../components/PlayerControls'
import YoutubePlayer from 'youtube-player'
import PlayerState from '../constants/PlayerState'
import ContentType from '../constants/ContentType'
const getContent = require('../helpers/apiBridge').getContent
const getPlaylist =  require('../helpers/apiBridge').getPlaylist

class AppContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      player: null,
      query: "",
      vids: [],
      results: [],
      currentItem: null,
      selectedType: ContentType.PLAYLIST,
      isPlaying: false,
      isPlayerVisible: false
    }

    this.handleQueryChange = this.handleQueryChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleItemClick = this.handleItemClick.bind(this)
    this.handleVideoClick = this.handleVideoClick.bind(this)
    this.handleNextVideo = this.handleNextVideo.bind(this)
    this.handlePreviousVideo = this.handlePreviousVideo.bind(this)
    this.handleToggle = this.handleToggle.bind(this)
    this.handleContentTypeChange = this.handleContentTypeChange.bind(this)
  }

  componentDidMount() {
    this.setState({
      player: YoutubePlayer('video-player')
    }, () => {
      this.state.player.on('stateChange', e => {
        const state = e.target.getPlayerState()

        switch(state){
        case PlayerState.ENDED:
          this.handleNextVideo()
          break
        case PlayerState.PLAYING:
          this.setState({ isPlaying: true })
          break
        case PlayerState.PAUSED:
          this.setState({ isPlaying: false })
        }
      })
    })
  }

  handleQueryChange(e) {
    this.setState({
      query: e.target.value
    }, () => {

    })
  }

  handleContentTypeChange(type) {
    this.setState({
      selectedType: type
    })
  }

  handleSubmit(e) {
    e.preventDefault()
    this.setState({
      isPlayerVisible: false,
      results: [],
      vids: []
    }, this.fetchQuery(this.state.query, this.state.selectedType))
  }

  fetchQuery(query, type) {
    getContent(query, type)
      .then(data => {
        this.setState({
          results: this.state.results.concat(data)
        })
      })
  }

  handleItemClick(e, id) {
    e.preventDefault()

    this.setState({
      isPlayerVisible: true
    }, this.fetchPlaylist(id, this.state.selectedType))
  }

  fetchPlaylist(id, type) {
    getPlaylist(id, type)
      .then(data => {
        this.setState({
          vids: this.state.vids.concat(data.items)
        })
      })
  }

  handleVideoClick(id, index) {
    this.setState({
      currentItem: index,
      isPlaying: true
    }, () => this.loadVideo(id))

  }

  handleToggle() {
    if (this.state.isPlaying)
      this.state.player.pauseVideo()
    else
      this.state.player.playVideo()

    this.setState({
      isPlaying: !this.state.isPlaying
    })
  }

  handlePreviousVideo() {
    const previousItem = this.state.currentItem - 1
    if (!(previousItem >= 0)) return

    this.setState({
      currentItem: previousItem
    }, () => this.loadVideo(this.state.vids[previousItem].videoId))
  }

  handleNextVideo() {
    const nextItem = this.state.currentItem + 1
    if (!(nextItem < this.state.vids.length)) return

    this.setState({
      currentItem: nextItem
    }, () => this.loadVideo(this.state.vids[nextItem].videoId))
  }


  loadVideo(id){
    this.state.player.loadVideoById(id)
  }

  render() {
    return (
      <div>
        <SearchBar
          onInput={this.handleQueryChange}
          onSubmit={this.handleSubmit}
          onContentTypeClick={this.handleContentTypeChange}
          selectedType={this.state.selectedType}
        />

        <div class="main">
          <Results
            items={this.state.results}
            onItemClick={this.handleItemClick}
            isVisible={!this.state.isPlayerVisible}
          />
          <Player isVisible={this.state.isPlayerVisible} />
          <Playlist
            vids={this.state.vids}
            onVideoClick={this.handleVideoClick}
            currentItem={this.state.currentItem}
          />
        </div>

        <PlayerControls
          onNext={this.handleNextVideo}
          onPrevious={this.handlePreviousVideo}
          onToggle={this.handleToggle}
          isPlaying={this.state.isPlaying}
        />
      </div>
    )
  }
}

export default AppContainer
