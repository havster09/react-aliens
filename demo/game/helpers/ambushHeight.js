export const getAmbushHeight = (levelCount) => {
  switch(levelCount) {
    case 1:
      return 270;
    case 2:
      return 170;
    case 3:
      return 350;
    default:
      return 270;
  }
};
