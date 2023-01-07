export default {
  getAsync: async (path: string): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
      const image = new Image();
      image.src = path;
      image.onload = () => {
        resolve(image);
      };

      return;
    });
  },
  /*
    Same as "getAsync", but no guarantee that the image is loaded before it's returned. 
    Should probably only be used for images that you're sure are already loaded.
  */
  getSync: (path: string): HTMLImageElement | null => {
    const image = new Image();
    image.src = path;
    return image;
  },
};
