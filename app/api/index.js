const key = require('../../credentials').key
import ContentType from '../constants/ContentType'
import AppConstants from '../constants/AppConstants'

const baseUrl = `https://www.googleapis.com/youtube/v3`

function getContent(query, type, pageToken = '') {
  const resource = 'search'
  let params = `part=snippet&key=${key}&type=${type}`
  params += `&maxResults=${AppConstants.CONTENT_MAX_RESULTS}`
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
  params += `&maxResults=${AppConstants.CONTENT_MAX_RESULTS}`
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

function playlistItemsAPI() {
  const resource = 'playlistItems'
  const paramKey = `key=${key}`
  const part = `part=snippet`
  let params = `${part}&maxResults=${AppConstants.PLAYLIST_ITEMS_MAX_RESULTS}`
  params += `&order=date&${paramKey}`

  return `${baseUrl}/${resource}?${params}`
}

function getPlaylist(id, type, pageToken) {
  if (type === ContentType.CHANNEL) {
    return getChannelPlaylist(id)
      .then(uploadsId => getPlaylistItems(uploadsId, pageToken))
  } else {
    return getPlaylistItems(id, pageToken)
  }
}

function getPlaylistItems(id, pageToken) {
  return fetchPlaylistItems(id, pageToken)
}

function fetchPlaylistItems(id, pageToken) {
  const url = `${playlistItemsAPI()}&playlistId=${id}`
  let newUrl = (pageToken)
    ? `${url}&pageToken=${pageToken}`
    : url

  return fetch(newUrl)
    .then(res => res.json())
    .then(data => {
      let items = data.items.map(item => {
        return {
          title: item.snippet.title,
          videoId: item.snippet.resourceId.videoId,
          thumbnails: item.snippet.thumbnails
        }
      })

      const newData = Object.assign({}, data, {items, playlistId: id})
      return newData
    })
}

/*
  Recursive function that fetches all the PlaylistItems.
*/
function fetchPlaylistItemsAtOnce(id, results = [], nextPageToken) {
  const url = `${playlistItemsAPI()}&playlistId=${id}`
  let newUrl = (nextPageToken)
    ? `${url}&pageToken=${nextPageToken}`
    : url

  return fetch(newUrl)
    .then(res => res.json())
    .then(data => {

      let items = data.items.map(item => {
        return {
          title: item.snippet.title,
          videoId: item.snippet.resourceId.videoId,
          thumbnails: item.snippet.thumbnails
        }
      })

      results = results.concat(items)

      if (data.nextPageToken) {
        return fetchPlaylistItemsAtOnce(url, results, data.nextPageToken)
      } else {
        const newData = Object.assign({}, data, {items: results})
        return newData
      }
    })
}

/* The list of videos/uploads from a channel is treated as
   a Playlist, so we have to get this id to hand it
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
