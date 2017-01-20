let channels = require('../fixtures/channels')
let videos = require('../fixtures/videos')

function getContent(q) {
  return Promise.resolve(channels)
}

function getPlaylist() {
  return Promise.resolve(videos)
}

export {
  getContent,
  getPlaylist
}
