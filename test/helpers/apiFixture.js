let channels = require('../fixtures/channels')
let videos = require('../fixtures/videos')

function getContent(q) {
  return Promise.resolve(channels)
}

function getPlaylist() {
  return Promise.resolve(videos)
}

function getPlaylistsByChannel() {
  return Promise.resolve(channels)
}

export {
  getContent,
  getPlaylist,
  getPlaylistsByChannel
}
