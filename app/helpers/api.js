const key = require('../../credentials').key
import ContentType from '../constants/ContentType'

const baseUrl = `https://www.googleapis.com/youtube/v3`

function getContent(query, type) {
  const resource = 'search'
  const params = `part=snippet&key=${key}&type=${type}&maxResults=10`
  let url = `${baseUrl}/${resource}?${params}&q=${query}`

  return fetch(url)
    .then(res => res.json())
    .then(data => data)
}


function getPlaylist(id, type) {
  const resource = 'playlistItems'
  const paramKey = `key=${key}`
  const part = `part=snippet`
  // const fields = `items(id, snippet), nextPageToken, pageInfo`
  // const params = `fields=${fields}&maxResults=10&order=date`
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
  getContent
}
