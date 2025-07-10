const formatTimeAgo = (date) => {
  const now = new Date();
  const pastDate = new Date(date);

  const seconds = Math.floor((now - pastDate) / 1000);

  //   time paramters
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = week * 30.44;
  const year = month * 365.25;

  switch (seconds) {
    case seconds:
      return `${seconds}s`;

    case seconds < minute:
      return `${minute}min`;

    default:
      return `The parameter is not a data`;
      break;
  }
};

export default formatTimeAgo;
