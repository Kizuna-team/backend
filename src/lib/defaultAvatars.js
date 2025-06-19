const baseUrl =
  "https://yqhbvdkbakmudxifztqt.supabase.co/storage/v1/object/public";
const bucket = "kizuna-avatar";

const defaultAvatarList = (count = 10) => {
  // 沒有指定每個元素值
  return Array.from({ length: count }).map((_, i) => {
    const num = i + 1;
    return {
      url: `${baseUrl}/${bucket}/default-${num}.png`,
      key: `${bucket}/default-${num}.png`,
    };
  });
};

const getRandomAvatar = () => {
  const defaultAvatars = defaultAvatarList(10);
  const randomIndex = Math.floor(Math.random() * defaultAvatars.length);
  return defaultAvatars[randomIndex];
};

module.exports = {
  getRandomAvatar,
};
