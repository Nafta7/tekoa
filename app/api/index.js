const key = require('../../credentials').key
import ContentType from '../constants/ContentType'
import AppConstants from '../constants/AppConstants'

const baseUrl = `https://www.googleapis.com/youtube/v3`

function getContent(query, type, pageToken = '') {
  const resource = 'search'
  let params = `part=snippet&key=${key}&type=${type}`
  params += `&maxResults=${AppConstants.MAX_RESULTS}`
  let url = `${baseUrl}/${resource}?${params}&q=${query}`

  if (pageToken !== '') {
    url += `&pageToken=${pageToken}`
  }

  return fetch(url)
    .then(res => res.json())
    .then(data => {
      const items = data.items.map(item => {
        return {
          id: item.id[`${type}Id`],
          title: item.snippet.title,
          thumbnails: item.snippet.thumbnails,
          channelId: item.snippet.channelId,
          channelTitle: item.snippet.channelTitle
        }
      })

      const newData = Object.assign({}, data, {items})
      return newData
    })
}

function getPlaylistsByChannel(channelId, pageToken = '') {
  const resource = 'playlists'
  let params = `part=snippet&key=${key}`
  params += `&maxResults=${AppConstants.MAX_RESULTS}`
  let url = `${baseUrl}/${resource}?${params}&channelId=${channelId}`

  if (pageToken !== '') {
    url += `&pageToken=${pageToken}`
  }

  return fetch(url)
    .then(res => res.json())
    .then(data => {
      const items = data.items.map(item => {
        return {
          id: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnails: item.snippet.thumbnails,
          channelTitle: item.snippet.channelTitle,
          channelId: item.snippet.channelId
        }
      })
      const newData = Object.assign({}, data, {items})
      return newData
    })
}

function getPlaylist(id, type) {
  const resource = 'playlistItems'
  const paramKey = `key=${key}`
  const part = `part=snippet`
  const params = `${part}&maxResults=20&order=date&${paramKey}`

  let url = `${baseUrl}/${resource}?${params}&playlistId=`

  if (type === ContentType.CHANNEL) {
    return getChannelPlaylist(id)
      .then(uploadsId => {
        return fetchPlaylistVideos(url + uploadsId)
      })
  } else {
    return fetchPlaylistVideos(url + id)
  }
}

function fetchPlaylistVideos(url) {
  return fetch(url)
    .then(res => res.json())
    .then(data => {
      var items = data.items.map(item => {
        return {
          title: item.snippet.title,
          videoId: item.snippet.resourceId.videoId,
          thumbnails: item.snippet.thumbnails
        }
      })

      const newData = Object.assign({}, data, {items})
      return newData
    })
}

/* The list of videos/uploads from a channel is treated as
   a plalist, so we have to get this id to hand it
   to the playlistItems resource.
*/
function getChannelPlaylist(id) {
  const params = `part=contentDetails&id=${id}&key=${key}`
  const url = `${baseUrl}/channels?${params}`
  return fetch(url)
    .then(res => res.json())
    .then(data => {
      return data.items[0].contentDetails.relatedPlaylists.uploads
    })
}

export {
  getPlaylist,
  getContent,
  getPlaylistsByChannel
}
