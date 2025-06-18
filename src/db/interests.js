const generateFakeInterests = () => {
  const fixedInterests = [
    "音樂",
    "電影與影集",
    "旅遊",
    "美食",
    "運動與健身",
    "閱讀",
    "遊戲",
    "攝影",
    "藝術與手作",
    "寵物與動物",
  ];

  return fixedInterests.map(name => ({ name }));
};

module.exports = generateFakeInterests;