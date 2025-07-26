import axios from 'axios';

const API_KEY = 'AIzaSyC6Cw5BlviLfb6YPuf4pwPsokICiWorQbM'; //Idhi YT key

export const getYouTubeSongs = async (mood, language) => {
  const query = `${mood} songs in ${language}`;

  const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
    params: {
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: 5,
      key: API_KEY,
    },
  });

  return res.data.items.map((item) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.default.url,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
  }));
};
