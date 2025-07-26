export const fetchQuote = async () => {
  try {
    const res = await fetch('https://zenquotes.io/api/random');
    const data = await res.json();
    return data[0].q + ' — ' + data[0].a;
  } catch (e) {
    console.error(e);
    return 'Stay strong. Brighter days are ahead.';
  }
};
