// 只適合「全欄位都要填」的情況
// 不太適合用在 updateProfile

const validateProfileInput = (data) => {
  const errors = [];

  if (!data.name || typeof data.name !== "string") {
    errors.push("名稱為必填");
  }

  if (!data.gender || typeof data.gender !== "string") {
    errors.push("性別為必填");
  }

  if (
    data.orientation === undefined ||
    ![0, 1, 2].includes(Number(data.orientation))
  ) {
    errors.push("性向為必填");
  }

  if (
    data.age === undefined ||
    typeof data.age !== "number" ||
    data.age < 18 ||
    data.age > 70
  ) {
    errors.push("年齡需介於 18～70 之間");
  }

  if (!data.city || typeof data.city !== "string") {
    errors.push("城市為必填");
  }

  return errors;
};

module.exports = { validateProfileInput };
