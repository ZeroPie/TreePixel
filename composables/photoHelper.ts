export const usePhotoHelper = () => {
  const supabase = useSupabaseClient()
  async function downloadPhoto(photoPath: string) {
    try {
      const { data, error } = await supabase.storage.from('photos').download(photoPath)
      if (error) {
        console.log("Download Error ", error)
      }
      if (data) {
        return URL.createObjectURL(data);
      } else {
        return "";
      }
    } catch (error: any) {
      console.error('Error downloading image: ', error.message)
      return ""
    }
  }
  return {
    downloadPhoto
  }
}
