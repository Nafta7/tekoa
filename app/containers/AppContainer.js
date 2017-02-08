import Inferno from 'inferno'
import Component from 'inferno-component'
import YoutubePlayer from 'youtube-player'

import SearchBar from '../components/SearchBar'
import Player from '../components/Player'
import ChannelGrid from '../components/ChannelGrid'
import PlaylistGrid from '../components/PlaylistGrid'
import Playlist from '../components/Playlist'
import PlayerControls from '../components/PlayerControls'
import Nav from '../components/Nav'
import ContentTypeSelection from '../components/ContentTypeSelection'

import PlayerState from '../constants/PlayerState'
import ContentType from '../constants/ContentType'
import SearchType from '../constants/SearchType'

import {
  getContent, getPlaylist, getPlaylistsByChannel
} from '../helpers/apiBridge'

class AppContainer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      player: null,
      query: "",
      vids: [],
      results: [],
      resultsPageToken: '',
      currentItem: null,
      selectedChannelId: null,
      selectedType: ContentType.PLAYLIST,
      viewType: ContentType.PLAYLIST,
      searchType: SearchType.BY_CONTENT,
      isPlaying: false,
      isPlaylistVisible: false,
      isPlayerMinimized: true,
    }

    this.handleQueryChange = this.handleQueryChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleItemClick = this.handleItemClick.bind(this)
    this.handleVideoClick = this.handleVideoClick.bind(this)
    this.handleNextVideo = this.handleNextVideo.bind(this)
    this.handlePreviousVideo = this.handlePreviousVideo.bind(this)
    // TODO
    // rename handleTogle
    this.handleToggle = this.handleToggle.bind(this)

    this.handleTogglePlayer = this.handleTogglePlayer.bind(this)
    this.handleContentTypeChange = this.handleContentTypeChange.bind(this)
    this.handlePlaylistsClick = this.handlePlaylistsClick.bind(this)
    this.handleLoadMore = this.handleLoadMore.bind(this)
    this.hasMoreResults = this.hasMoreResults.bind(this)
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

  hasMoreResults() {
    return Boolean(this.state.resultsPageToken)
  }

  handleQueryChange(e) {
    this.setState({
      query: e.target.value
    })
  }

  handleContentTypeChange(type) {
    this.setState({
      results: [],
      resultsPageToken: '',
      selectedType: type,
      selectedChannelId: null
    })
  }

  handleSubmit(e) {
    e.preventDefault()

    if (this.state.query === '') return

    this.setState({
      results: [],
      resultsPageToken: '',
      searchType: SearchType.BY_CONTENT,
      isPlaylistVisible: false,
      isPlayerMinimized: true,
      selectedChannelId: null
    }, () => {
      this.fetchQuery(
        this.state.query,
        this.state.selectedType,
        this.state.resultsPageToken
      )
    })
  }

  handlePlaylistsClick(id, viewType) {
    this.setState({
      searchType: SearchType.BY_CHANNEL,
      results: [],
      resultsPageToken: '',
    }, () => this.fetchPlaylists(id, viewType))
  }

  fetchPlaylists(id, viewType) {
    getPlaylistsByChannel(id, this.state.resultsPageToken)
      .then(data => {
        let newState = {
          results: this.state.results.concat(data.items),
          resultsPageToken: data.nextPageToken,
          selectedType: ContentType.PLAYLIST,
          selectedChannelId: id
        }
        if (viewType) newState = Object.assign({}, newState, {viewType})
        this.setState(newState)
      })
      .catch(err => console.log('Error: ', err))
  }

  handleLoadMore(e) {
    switch (this.state.searchType) {
      case SearchType.BY_CONTENT:
        this.fetchQuery(
          this.state.query,
          this.state.selectedType,
          this.state.resultsPageToken
        )
        break
      case SearchType.BY_CHANNEL:
        this.fetchPlaylists(this.state.selectedChannelId, ContentType.CHANNEL)
      default:
        break
    }
  }

  fetchQuery(query, type, nextPageToken) {
    getContent(query, type, nextPageToken)
      .then(data => {
        this.setState({
          results: this.state.results.concat(data.items),
          viewType: type,
          resultsPageToken: data.nextPageToken
        })
      })
      .catch(err => console.log('Error: ', err))
  }

  handleItemClick(e, id) {
    e.preventDefault()

    this.fetchPlaylist(id, this.state.selectedType)
      .then(() => {
        if (!this.state.vids.length > 0) return

        this.setState({
          currentItem: 0,
          isPlaying: true,
          isPlaylistVisible: true
        }, this.loadVideo(this.state.vids[0].videoId))
      })
      .catch(err => console.log('Error: ', err))
  }

  fetchPlaylist(id, type) {
    return getPlaylist(id, type)
      .then(data => {
        this.setState({
          vids: data.items
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

  handleTogglePlayer() {
    this.setState({
      isPlayerMinimized: !this.state.isPlayerMinimized
    })
  }

  loadVideo(id){
    this.state.player.loadVideoById(id)
  }

  render() {
    return (
      <div>
        <header class='header'>
          <Nav>
            <SearchBar
              selectedType={this.state.selectedType}
              onInput={this.handleQueryChange}
              onSubmit={this.handleSubmit}
            />
          </Nav>
          <ContentTypeSelection
            onContentTypeClick={this.handleContentTypeChange}
            selectedType={this.state.selectedType}
          />
        </header>

        <div class="central">
          {
            (this.state.selectedType === ContentType.CHANNEL)
            ? <ChannelGrid
                items={this.state.results}
                hasMoreResults={this.hasMoreResults}
                onItemClick={this.handleItemClick}
                onPlaylistsClick={this.handlePlaylistsClick}
                onLoadMore={this.handleLoadMore}


              />
            : <PlaylistGrid
                items={this.state.results}
                viewType={this.state.viewType}
                hasMoreResults={this.hasMoreResults}
                onItemClick={this.handleItemClick}
                onPlaylistsClick={this.handlePlaylistsClick}
                onLoadMore={this.handleLoadMore}
              />
          }

          <Playlist
            vids={this.state.vids}
            onVideoClick={this.handleVideoClick}
            currentItem={this.state.currentItem}
            isVisible={this.state.isPlaylistVisible}
          />
        </div>

        <Player
          isMinimized={this.state.isPlayerMinimized}
        />

        <PlayerControls
          onNext={this.handleNextVideo}
          onPrevious={this.handlePreviousVideo}
          onToggle={this.handleToggle}
          isPlayerMinimized={this.state.isPlayerMinimized}
          isPlaying={this.state.isPlaying}
          onTogglePlayer={this.handleTogglePlayer}
        />

      </div>
    )
  }
}

export default AppContainer
